# Organizations Import Fix - Monitoring & Rollback Plan

## Overview
Comprehensive monitoring and rollback procedures for the PostgreSQL 42P10 fix migration.

## Pre-Deployment Monitoring Setup

### 1. Database Health Baselines
```sql
-- Capture baseline metrics before migration
SELECT 
    'organizations_baseline' as metric_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_records,
    pg_size_pretty(pg_total_relation_size('organizations')) as table_size,
    NOW() as captured_at
FROM organizations;

-- Index health baseline
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE tablename = 'organizations';
```

### 2. Application Performance Baselines
```sql
-- Query performance baseline (run several times)
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) FROM organizations 
WHERE name ILIKE 'test%' AND type = 'customer' AND deleted_at IS NULL;
```

## Real-Time Monitoring During Migration

### 1. Database Connection Monitoring
```sql
-- Monitor active connections during migration
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    now() - query_start as duration,
    wait_event_type,
    wait_event
FROM pg_stat_activity 
WHERE query LIKE '%organizations%' OR query LIKE '%CREATE INDEX%'
ORDER BY query_start;
```

### 2. Lock Monitoring
```sql
-- Check for blocking locks during CONCURRENT index creation
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## Post-Migration Monitoring

### 1. Constraint Health Checks
```sql
-- Monitor constraint violations (run every 5 minutes post-deployment)
CREATE OR REPLACE FUNCTION check_organizations_constraints() 
RETURNS TABLE(
    constraint_type text,
    constraint_exists boolean,
    violation_count integer,
    check_timestamp timestamp
) AS $$
BEGIN
    -- Check exact-match constraint exists
    RETURN QUERY 
    SELECT 
        'exact_match'::text,
        EXISTS(SELECT 1 FROM pg_indexes WHERE indexname = 'organizations_exact_name_type_active')::boolean,
        0::integer, -- No direct way to count violations for unique constraints
        NOW()::timestamp;
    
    -- Check case-insensitive constraint exists  
    RETURN QUERY
    SELECT 
        'case_insensitive'::text,
        EXISTS(SELECT 1 FROM pg_indexes WHERE indexname LIKE '%unique_organization_name_type%')::boolean,
        0::integer,
        NOW()::timestamp;
        
    -- Check for duplicate records (should always be 0)
    RETURN QUERY
    SELECT 
        'data_integrity'::text,
        true::boolean,
        (SELECT COUNT(*) FROM (
            SELECT LOWER(TRIM(name)), type, COUNT(*)
            FROM organizations 
            WHERE deleted_at IS NULL
            GROUP BY LOWER(TRIM(name)), type
            HAVING COUNT(*) > 1
        ) duplicates)::integer,
        NOW()::timestamp;
END;
$$ LANGUAGE plpgsql;

-- Run the check
SELECT * FROM check_organizations_constraints();
```

### 2. Import Success Rate Monitoring
```sql
-- Create monitoring table for import operations
CREATE TABLE IF NOT EXISTS import_monitoring (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    operation_start TIMESTAMP DEFAULT NOW(),
    operation_end TIMESTAMP,
    records_attempted INTEGER,
    records_successful INTEGER,
    records_failed INTEGER,
    error_code TEXT,
    error_message TEXT,
    performance_ms NUMERIC
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_import_monitoring_session 
ON import_monitoring(session_id, operation_start);
```

### 3. Performance Monitoring Queries
```sql
-- Query performance after migration (compare to baseline)
-- Run this hourly for first 24 hours
SELECT 
    'post_migration_performance' as check_type,
    (SELECT COUNT(*) FROM organizations WHERE name ILIKE 'test%') as test_count,
    NOW() as check_time;
    
-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'organizations'
ORDER BY idx_scan DESC;
```

## Application-Level Monitoring

### 1. Error Rate Monitoring
Monitor these error patterns in application logs:

```text
# Critical Errors (immediate rollback triggers)
"PostgresError: 42P10" - Original error should be gone
"PostgresError: 23505" - Unexpected unique violations  
"PostgresError: 42P01" - Table/constraint not found

# Warning Errors (investigate but don't rollback)
"Import timeout" - Performance degradation
"Connection pool exhausted" - Resource issues
"Validation failed" - Data quality issues
```

### 2. Success Rate Metrics
```typescript
// Add to import monitoring in useImportProgress.ts
const monitoringData = {
    sessionId: importSessionId,
    recordsAttempted: validRows.length,
    recordsSuccessful: imported,
    recordsFailed: failed,
    performanceMs: endTime - startTime,
    errorCode: error?.code || null,
    errorMessage: error?.message || null
};

// Log to monitoring table
await supabase.from('import_monitoring').insert(monitoringData);
```

### 3. Performance Dashboards
Key metrics to track:
- Import success rate: >95% (target)
- Average import time: <5ms per record (target)  
- Error rate: <5% (acceptable)
- Database response time: <100ms (target)

## Rollback Decision Tree

### Immediate Rollback Triggers (0-5 minutes)
```
IF migration_fails_during_execution THEN
    → Execute rollback immediately
    → No application impact assessment needed

IF critical_constraint_missing THEN  
    → Execute rollback immediately
    → Block import operations until fixed
```

### Conditional Rollback Triggers (5-30 minutes)
```
IF import_success_rate < 50% THEN
    → Investigate for 10 minutes
    → IF no quick fix THEN rollback

IF database_response_time > 500ms THEN
    → Check for lock contention
    → IF locks persist > 15 minutes THEN rollback
    
IF error_rate > 25% THEN
    → Analyze error patterns
    → IF unknown errors THEN rollback
```

### Performance Rollback Triggers (30+ minutes)
```
IF import_success_rate < 90% for 30+ minutes THEN
    → Schedule maintenance window rollback

IF user_complaints > 5 in 1 hour THEN
    → Evaluate user impact vs. technical metrics
    → Consider rollback during low usage period
```

## Rollback Execution Plan

### Phase 1: Stop New Operations (2 minutes)
```sql
-- Temporarily disable import endpoints (application level)
-- Or block import operations with a maintenance flag
UPDATE system_settings 
SET import_enabled = false, 
    maintenance_message = 'Import system temporarily unavailable'
WHERE setting_key = 'import_config';
```

### Phase 2: Execute Database Rollback (5 minutes)
```bash
# Execute the rollback script
psql -d $DATABASE_URL -f migrations/20250109_fix_organizations_import_rollback.sql

# Verify rollback success
psql -d $DATABASE_URL -c "
SELECT 'Rollback Status: ' || 
CASE WHEN EXISTS(SELECT 1 FROM pg_indexes WHERE indexname = 'organizations_exact_name_type_active') 
     THEN 'FAILED - Constraint still exists'
     ELSE 'SUCCESS - Constraint removed' 
END as status;"
```

### Phase 3: Restore Service (3 minutes)
```sql
-- Re-enable import operations  
UPDATE system_settings 
SET import_enabled = true,
    maintenance_message = NULL
WHERE setting_key = 'import_config';
```

### Phase 4: Post-Rollback Monitoring (24 hours)
- Verify error logs show return of 42P10 errors
- Confirm no data corruption occurred
- Plan re-deployment with fixes

## Emergency Contacts

### Escalation Chain
1. **Level 1**: Development Team Lead (immediate response)
2. **Level 2**: Database Administrator (5-minute response)
3. **Level 3**: CTO/Technical Director (15-minute response)

### Communication Templates

#### Migration Success
```
✅ MIGRATION SUCCESS: Organizations Import Fix
- Migration completed in X minutes
- All constraints active and healthy
- Import operations restored
- No data integrity issues detected
- Monitoring continues for 24h
```

#### Rollback Notification  
```
🔄 ROLLBACK EXECUTED: Organizations Import Fix
- Issue: [specific problem]
- Rollback completed in X minutes  
- System restored to previous state
- Import operations may show 42P10 errors until re-deployment
- Root cause analysis in progress
```

#### Critical Issue Alert
```
🚨 CRITICAL: Migration Issue Requires Immediate Attention
- Problem: [specific issue]
- Impact: [user/system impact]  
- Action Needed: [specific steps]
- ETA for Resolution: [timeframe]
- Contact: [phone/slack channel]
```

## Success Validation Checklist

### ✅ Technical Validation
- [ ] Migration script executes without errors
- [ ] Both unique constraints exist and functional
- [ ] Import operations succeed with ON CONFLICT syntax
- [ ] No performance degradation >10% 
- [ ] Error logs show zero 42P10 errors
- [ ] Rollback script tested and verified

### ✅ Business Validation  
- [ ] Import feature fully functional for end users
- [ ] Data integrity maintained (no duplicates)
- [ ] Performance meets SLA requirements
- [ ] User acceptance testing passed
- [ ] Documentation updated

### ✅ Operational Validation
- [ ] Monitoring dashboards show green status
- [ ] Support team notified of changes
- [ ] Runbook updated with new procedures
- [ ] Knowledge base articles created
- [ ] Next maintenance window scheduled for cleanup

## Long-term Monitoring (30 days)

### Weekly Health Checks
- Import success rate trending
- Database constraint health
- Performance baseline comparison
- User feedback analysis

### Monthly Optimization Review
- Index usage statistics
- Query performance analysis  
- Constraint effectiveness review
- Consider additional optimizations

This comprehensive monitoring plan ensures the migration's success and provides clear procedures for handling any issues that arise.