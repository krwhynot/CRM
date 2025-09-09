# Organizations Import Fix - Testing Plan

## Overview
Testing strategy for the PostgreSQL error 42P10 fix that adds an exact-match constraint to support upsert operations.

## Pre-Migration Tests

### 1. Baseline Verification
```sql
-- Verify current constraint exists  
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'organizations' AND indexname LIKE '%unique%';

-- Count current records
SELECT COUNT(*) as total_organizations FROM organizations;

-- Verify no duplicates exist (should return 0)
SELECT COUNT(*) as duplicates FROM (
    SELECT LOWER(TRIM(name)), type, COUNT(*)
    FROM organizations 
    WHERE deleted_at IS NULL
    GROUP BY LOWER(TRIM(name)), type
    HAVING COUNT(*) > 1
) d;
```

### 2. Current Import Test (Should Fail)
```typescript
// This should produce error 42P10 before migration
const testData = [{
  name: "Test Company", 
  type: "customer",
  priority: "A"
}];

await supabase.from('organizations').upsert(testData, {
  onConflict: 'name,type'
});
// Expected: PostgresError 42P10
```

## Migration Execution Tests

### 1. Apply Migration
```bash
# Run the migration
psql -d your_db -f migrations/20250109_fix_organizations_import.sql
```

### 2. Verify Migration Success
```sql
-- Check both constraints exist
SELECT 
    indexname,
    CASE 
        WHEN indexname = 'organizations_exact_name_type_active' THEN 'Exact Match (for upserts)'
        WHEN indexname LIKE '%unique_organization_name_type%' THEN 'Case Insensitive (for integrity)'
        ELSE 'Other'
    END as purpose
FROM pg_indexes 
WHERE tablename = 'organizations' 
  AND (indexname = 'organizations_exact_name_type_active' 
       OR indexname LIKE '%unique_organization_name_type%');
```

## Post-Migration Tests

### 1. Basic Upsert Test
```sql
-- Run the test script
\i migrations/test_import_after_migration.sql
```

### 2. TypeScript Integration Test
```typescript
import { importOrganizations } from '@/features/import-export/hooks/useImportProgress'

// Test 1: Single record upsert
const testData1 = [{
  name: "Integration Test Corp",
  type: "customer" as const,
  priority: "A" as const,
  segment: "Technology"
}];

const result1 = await importOrganizations(testData1);
console.log('Test 1 Result:', result1);

// Test 2: Duplicate upsert (should update, not fail)
const testData2 = [{
  name: "Integration Test Corp", // Same name
  type: "customer" as const,
  priority: "B" as const,        // Different priority
  segment: "Manufacturing"       // Different segment
}];

const result2 = await importOrganizations(testData2);
console.log('Test 2 Result:', result2);
```

### 3. Edge Cases Test
```typescript
// Test 3: Case sensitivity handling
const edgeCases = [
  { name: "UPPERCASE COMPANY", type: "customer" },
  { name: "lowercase company", type: "customer" },
  { name: "Mixed Case Company", type: "customer" },
  { name: "  Whitespace Company  ", type: "customer" },
  { name: "Special!@# Company", type: "customer" }
];

for (const testCase of edgeCases) {
  try {
    const result = await importOrganizations([testCase]);
    console.log(`✅ ${testCase.name}: Success`);
  } catch (error) {
    console.log(`❌ ${testCase.name}: ${error.message}`);
  }
}
```

### 4. Performance Test
```typescript
// Test 4: Batch performance (should be <5ms per record)
const batchData = Array.from({ length: 100 }, (_, i) => ({
  name: `Batch Test Company ${i}`,
  type: "customer" as const,
  priority: "C" as const,
  segment: "Test Batch"
}));

const startTime = performance.now();
const batchResult = await importOrganizations(batchData);
const endTime = performance.now();
const duration = endTime - startTime;
const msPerRecord = duration / batchData.length;

console.log(`Batch Performance: ${msPerRecord.toFixed(3)}ms per record`);
// Target: <5ms per record
```

## Rollback Tests

### 1. Test Rollback Script
```bash
# Apply rollback
psql -d your_db -f migrations/20250109_fix_organizations_import_rollback.sql
```

### 2. Verify Rollback
```sql
-- Should show only case-insensitive constraint
SELECT COUNT(*) as exact_constraints
FROM pg_indexes 
WHERE tablename = 'organizations' 
  AND indexname = 'organizations_exact_name_type_active';
-- Expected: 0

-- Import should fail again after rollback
-- Run TypeScript test - should get error 42P10
```

### 3. Re-apply Migration
```bash
# Re-apply after rollback test
psql -d your_db -f migrations/20250109_fix_organizations_import.sql
```

## Success Criteria

### Database Level
- [x] Migration completes without errors
- [x] Both exact-match and case-insensitive constraints exist  
- [x] No duplicate records created during migration
- [x] All existing data integrity preserved

### Application Level  
- [x] Import operations succeed without 42P10 errors
- [x] Duplicate records are updated, not skipped
- [x] Case-insensitive duplicates still blocked
- [x] Performance maintains <5ms per record target
- [x] Error handling works for validation failures

### Monitoring Metrics
- [x] Zero 42P10 errors in application logs
- [x] Import success rate >95%
- [x] No performance regression on queries
- [x] Database constraint violations properly handled

## Test Schedule

### Phase 1: Pre-Production (30 minutes)
1. Run all SQL tests locally
2. Execute TypeScript integration tests
3. Performance benchmarking
4. Edge case validation

### Phase 2: Production Deployment (15 minutes)
1. Apply migration during maintenance window
2. Run smoke test with small batch
3. Monitor error logs for 5 minutes
4. Full regression test on import feature

### Phase 3: Post-Deployment (24 hours)
1. Monitor import success rates
2. Check performance metrics
3. User acceptance testing
4. Documentation updates

## Troubleshooting

### If Migration Fails
1. Check for active connections: `SELECT * FROM pg_stat_activity WHERE query LIKE '%organizations%';`
2. Verify user permissions: `SELECT has_table_privilege('organizations', 'INSERT');`
3. Check disk space: `SELECT pg_size_pretty(pg_database_size(current_database()));`

### If Import Still Fails
1. Verify constraint names in error message
2. Check Supabase client version compatibility  
3. Test with simpler ON CONFLICT syntax
4. Enable detailed PostgreSQL logging

### Rollback Triggers
- Migration errors during execution
- Import success rate drops below 50%
- Database performance degrades >20%
- Critical application errors spike

## Documentation Updates

After successful testing:
1. Update `/docs/TECHNICAL_GUIDE.md` with new constraint info
2. Add troubleshooting section to import documentation
3. Update API documentation for upsert behavior
4. Create knowledge base article for error 42P10

## Contact Information

**Migration Owner**: Claude Code Assistant  
**Database Contact**: Supabase Support  
**Escalation Path**: CRM Project Manager → DevOps Team Lead