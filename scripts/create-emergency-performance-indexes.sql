-- ============================================================================
-- Emergency Performance Indexes for CRM Production Database
-- Migration: emergency_performance_optimization
-- Description: Creates optimized indexes for sub-second emergency response
-- Performance Target: All emergency diagnostic queries < 500ms
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- EMERGENCY RESPONSE INDEXES (Priority 1 - Critical for incident response)
-- ============================================================================

-- Organizations - Emergency type and status validation
-- Target: Principal/Distributor/Customer type queries < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_orgs_type_active 
ON organizations (type, deleted_at) 
WHERE deleted_at IS NULL;

-- Organizations - Principal-specific emergency queries
-- Target: Principal organization queries < 50ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_orgs_principal 
ON organizations (is_principal, deleted_at, type) 
WHERE is_principal = true AND deleted_at IS NULL;

-- Organizations - Distributor-specific emergency queries
-- Target: Distributor organization queries < 50ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_orgs_distributor 
ON organizations (is_distributor, deleted_at, type) 
WHERE is_distributor = true AND deleted_at IS NULL;

-- Contacts - Primary contact constraint validation
-- Target: Primary contact validation < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_contacts_primary 
ON contacts (is_primary, deleted_at, organization_id) 
WHERE is_primary = true AND deleted_at IS NULL;

-- Organizations - Priority validation for business rules
-- Target: Priority validation queries < 50ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_priority_validation 
ON organizations (priority, deleted_at) 
WHERE deleted_at IS NULL;

-- Principal-Distributor relationships - Emergency relationship validation
-- Target: Relationship integrity checks < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_principal_distributor_rel 
ON principal_distributor_relationships (principal_id, distributor_id, relationship_status, deleted_at);

-- Opportunities - Pipeline integrity and recent activity
-- Target: Opportunity pipeline queries < 200ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_opportunities_active 
ON opportunities (stage, deleted_at, close_date, created_at) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- EMERGENCY SEARCH OPTIMIZATION (Priority 2 - Fast search during incidents)
-- ============================================================================

-- Organizations - Fast name search for emergency lookups
-- Target: Organization name search < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_orgs_name_search 
ON organizations (name, type, deleted_at) 
WHERE deleted_at IS NULL;

-- Contacts - Fast contact lookup during validation
-- Target: Contact search and validation < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_contacts_search 
ON contacts (name, organization_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Opportunities - Customer and principal relationship validation
-- Target: Opportunity relationship queries < 150ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_opportunities_relationships 
ON opportunities (customer_id, deleted_at, stage, created_at) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- COMPOSITE INDEXES FOR COMPLEX EMERGENCY QUERIES
-- ============================================================================

-- Organizations - Complete emergency diagnostic coverage
-- Target: Multi-criteria emergency queries < 200ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_orgs_complete 
ON organizations (type, priority, deleted_at, is_principal, is_distributor) 
WHERE deleted_at IS NULL;

-- Contacts - Role alignment validation with organization type
-- Target: Contact role validation queries < 150ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_contacts_role_validation 
ON contacts (role, organization_id, deleted_at, is_primary) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- PERFORMANCE MONITORING INDEXES
-- ============================================================================

-- Organizations - Created/updated tracking for incident analysis
-- Target: Recent changes analysis < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_orgs_timestamps 
ON organizations (created_at, updated_at, deleted_at) 
WHERE deleted_at IS NULL;

-- Opportunities - Recent activity for impact assessment
-- Target: Recent opportunity impact queries < 100ms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emergency_opportunities_recent 
ON opportunities (created_at, updated_at, stage, deleted_at) 
WHERE deleted_at IS NULL AND created_at > NOW() - INTERVAL '48 hours';

COMMIT;

-- ============================================================================
-- VERIFY INDEX CREATION AND USAGE
-- ============================================================================

-- Check that all emergency indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE indexname LIKE 'idx_emergency_%'
ORDER BY tablename, indexname;

-- Initial baseline - these should show 0 usage initially
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE indexname LIKE 'idx_emergency_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- PERFORMANCE VALIDATION QUERIES
-- ============================================================================

-- Test emergency diagnostic queries with EXPLAIN ANALYZE
-- These should all execute in < 500ms with the new indexes

-- Test 1: Principal-Distributor relationship validation
EXPLAIN (ANALYZE, BUFFERS, TIMING) 
SELECT COUNT(*) as unauthorized_relationships 
FROM organizations p
JOIN principal_distributor_relationships pr ON p.id = pr.principal_id  
JOIN organizations d ON pr.distributor_id = d.id
WHERE p.is_principal = true 
  AND d.is_distributor = true
  AND (pr.relationship_status != 'active' OR pr.deleted_at IS NOT NULL)
  AND p.deleted_at IS NULL 
  AND d.deleted_at IS NULL
LIMIT 100;

-- Test 2: Primary contact validation
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT organization_id, COUNT(*) as primary_contact_count
FROM contacts 
WHERE is_primary = true AND deleted_at IS NULL
GROUP BY organization_id
HAVING COUNT(*) > 1
LIMIT 20;

-- Test 3: Priority validation
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT COUNT(*) as invalid_priorities 
FROM organizations 
WHERE (priority NOT IN ('A+', 'A', 'B', 'C', 'D') OR priority IS NULL)
  AND deleted_at IS NULL
LIMIT 100;

-- Test 4: Opportunity pipeline validation
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT COUNT(*) as invalid_opportunities 
FROM opportunities 
WHERE deleted_at IS NULL
  AND (stage NOT IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')
    OR (stage = 'closed_won' AND close_date IS NULL)
    OR (stage IN ('closed_won', 'closed_lost') AND close_date > CURRENT_DATE))
LIMIT 100;

-- ============================================================================
-- CLEANUP UNUSED INDEXES (Optional - based on health check results)
-- ============================================================================

-- These indexes showed 0 usage in the health check
-- Consider dropping after confirming they're truly unused:

-- Candidates for removal (uncomment after verification):
-- DROP INDEX IF EXISTS idx_organizations_name_trgm;  -- 0 scans
-- DROP INDEX IF EXISTS idx_contacts_name_trgm;       -- 0 scans  
-- DROP INDEX IF EXISTS idx_organizations_name_text;  -- 0 scans
-- DROP INDEX IF EXISTS idx_contacts_active_name;     -- 0 scans
-- DROP INDEX IF EXISTS idx_contacts_org_active;      -- 0 scans

-- ============================================================================
-- POST-MIGRATION MONITORING
-- ============================================================================

-- Create a view for ongoing emergency performance monitoring
CREATE OR REPLACE VIEW emergency_performance_monitor AS
SELECT 
    'Emergency Index Usage' as metric_type,
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW_USAGE'
        WHEN idx_scan < 1000 THEN 'MODERATE_USAGE'
        ELSE 'HIGH_USAGE'
    END as usage_level
FROM pg_stat_user_indexes 
WHERE indexname LIKE 'idx_emergency_%'
ORDER BY idx_scan DESC;

-- Grant access to monitoring view
GRANT SELECT ON emergency_performance_monitor TO PUBLIC;

-- ============================================================================
-- EMERGENCY PERFORMANCE TEST FUNCTION
-- ============================================================================

-- Create a function to test all emergency queries with timing
CREATE OR REPLACE FUNCTION test_emergency_performance()
RETURNS TABLE(
    test_name TEXT,
    execution_time_ms NUMERIC,
    result_count BIGINT,
    performance_status TEXT
) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    query_result BIGINT;
BEGIN
    -- Test 1: Principal-Distributor relationships
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO query_result
    FROM organizations p
    JOIN principal_distributor_relationships pr ON p.id = pr.principal_id  
    JOIN organizations d ON pr.distributor_id = d.id
    WHERE p.is_principal = true AND d.is_distributor = true
      AND (pr.relationship_status != 'active' OR pr.deleted_at IS NOT NULL)
      AND p.deleted_at IS NULL AND d.deleted_at IS NULL
    LIMIT 100;
    
    end_time := clock_timestamp();
    test_name := 'Principal-Distributor Validation';
    result_count := query_result;
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    performance_status := CASE WHEN execution_time_ms < 500 THEN 'EXCELLENT' 
                              WHEN execution_time_ms < 1000 THEN 'GOOD'
                              ELSE 'NEEDS_OPTIMIZATION' END;
    RETURN NEXT;

    -- Test 2: Primary contact validation
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO query_result
    FROM (
        SELECT organization_id
        FROM contacts 
        WHERE is_primary = true AND deleted_at IS NULL
        GROUP BY organization_id
        HAVING COUNT(*) > 1
        LIMIT 20
    ) violations;
    
    end_time := clock_timestamp();
    test_name := 'Primary Contact Validation';
    result_count := query_result;
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    performance_status := CASE WHEN execution_time_ms < 500 THEN 'EXCELLENT' 
                              WHEN execution_time_ms < 1000 THEN 'GOOD'
                              ELSE 'NEEDS_OPTIMIZATION' END;
    RETURN NEXT;

    -- Test 3: Priority validation
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO query_result
    FROM organizations 
    WHERE (priority NOT IN ('A+', 'A', 'B', 'C', 'D') OR priority IS NULL)
      AND deleted_at IS NULL
    LIMIT 100;
    
    end_time := clock_timestamp();
    test_name := 'Priority Validation';
    result_count := query_result;
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    performance_status := CASE WHEN execution_time_ms < 500 THEN 'EXCELLENT' 
                              WHEN execution_time_ms < 1000 THEN 'GOOD'
                              ELSE 'NEEDS_OPTIMIZATION' END;
    RETURN NEXT;

    -- Test 4: Opportunity pipeline validation
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO query_result
    FROM opportunities 
    WHERE deleted_at IS NULL
      AND (stage NOT IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')
        OR (stage = 'closed_won' AND close_date IS NULL)
        OR (stage IN ('closed_won', 'closed_lost') AND close_date > CURRENT_DATE))
    LIMIT 100;
    
    end_time := clock_timestamp();
    test_name := 'Opportunity Pipeline Validation';
    result_count := query_result;
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    performance_status := CASE WHEN execution_time_ms < 500 THEN 'EXCELLENT' 
                              WHEN execution_time_ms < 1000 THEN 'GOOD'
                              ELSE 'NEEDS_OPTIMIZATION' END;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Test the emergency performance
SELECT * FROM test_emergency_performance();

-- ============================================================================
-- DOCUMENTATION AND NOTES
-- ============================================================================

COMMENT ON INDEX idx_emergency_orgs_type_active IS 'Emergency index for organization type validation queries - target <100ms';
COMMENT ON INDEX idx_emergency_orgs_principal IS 'Emergency index for principal organization queries - target <50ms';  
COMMENT ON INDEX idx_emergency_orgs_distributor IS 'Emergency index for distributor organization queries - target <50ms';
COMMENT ON INDEX idx_emergency_contacts_primary IS 'Emergency index for primary contact validation - target <100ms';
COMMENT ON INDEX idx_emergency_priority_validation IS 'Emergency index for priority business rule validation - target <50ms';
COMMENT ON INDEX idx_emergency_principal_distributor_rel IS 'Emergency index for relationship integrity checks - target <100ms';
COMMENT ON INDEX idx_emergency_opportunities_active IS 'Emergency index for opportunity pipeline validation - target <200ms';

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================

-- After running this migration, verify:
-- 1. All emergency indexes created successfully (no errors)
-- 2. Emergency diagnostic queries execute in < 500ms
-- 3. Index usage shows up in pg_stat_user_indexes after running emergency tests
-- 4. Database performance remains stable (no regression in existing queries)
-- 5. Emergency performance test function returns 'EXCELLENT' or 'GOOD' status

-- Monitor ongoing performance with:
-- SELECT * FROM emergency_performance_monitor;
-- SELECT * FROM test_emergency_performance();

-- ============================================================================
-- END OF EMERGENCY PERFORMANCE INDEX MIGRATION
-- ============================================================================