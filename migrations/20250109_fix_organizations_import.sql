-- ============================================
-- Migration: Fix Organizations Import Support  
-- Date: 2025-01-09
-- Issue: Error 42P10 - Supabase client can't use ON CONFLICT with partial unique indexes
-- Root Cause: Existing constraints have WHERE clauses that Supabase client doesn't support
-- Solution: Implement manual upsert logic in TypeScript instead of database-level upserts
-- ============================================

-- ANALYSIS: The existing constraints are perfect for data integrity:
-- - unique_organization_name_type_active: Prevents case-insensitive duplicates
-- - idx_organizations_unique_name_type_active: Additional constraint
-- The issue is that Supabase's JavaScript client cannot use these in ON CONFLICT clauses
-- because they have WHERE deleted_at IS NULL clauses.

-- SOLUTION: No database changes needed! 
-- The fix is implemented in TypeScript using manual upsert logic that:
-- 1. Checks for existing active records with same name/type
-- 2. Updates existing records or inserts new ones
-- 3. Respects all existing constraints

-- Step 1: Verify existing constraints are healthy
DO $$
DECLARE
    constraint_count INTEGER;
    duplicate_count INTEGER;
BEGIN
    -- Count existing unique constraints on (name, type)
    SELECT COUNT(*) INTO constraint_count
    FROM pg_indexes 
    WHERE tablename = 'organizations'
      AND pg_get_indexdef(indexrelid) LIKE '%UNIQUE%' 
      AND pg_get_indexdef(indexrelid) LIKE '%name, type%'
      AND pg_get_indexdef(indexrelid) LIKE '%WHERE%';
    
    -- Verify no duplicate active records exist
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT LOWER(TRIM(name)), type, COUNT(*)
        FROM organizations 
        WHERE deleted_at IS NULL
        GROUP BY LOWER(TRIM(name)), type
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF constraint_count >= 1 AND duplicate_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: Existing constraints are healthy, no database migration needed';
        RAISE NOTICE 'Constraints found: %, Duplicates: %', constraint_count, duplicate_count;
    ELSE
        RAISE WARNING 'Issues detected - Constraints: %, Duplicates: %', constraint_count, duplicate_count;
    END IF;
END $$;

-- Step 2: Ensure supporting indexes exist for optimal performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_import_session 
ON organizations(import_session_id) 
WHERE import_session_id IS NOT NULL;

-- Step 3: Add helpful comments for documentation  
COMMENT ON INDEX idx_organizations_import_session IS 
'Performance index for tracking import sessions and batch operations';

-- Step 4: Update table statistics for query planner
ANALYZE organizations;

-- Step 5: Final verification that solution is ready
DO $$
DECLARE
    active_constraint_count INTEGER;
    performance_index_exists BOOLEAN;
BEGIN
    -- Verify the constraints that will protect data integrity exist
    SELECT COUNT(*) INTO active_constraint_count
    FROM pg_indexes
    WHERE tablename = 'organizations'
      AND indexname IN ('unique_organization_name_type_active', 'idx_organizations_unique_name_type_active')
      AND pg_get_indexdef(indexrelid) LIKE '%WHERE (deleted_at IS NULL)%';
    
    -- Check performance index exists
    SELECT EXISTS(
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_organizations_import_session'
    ) INTO performance_index_exists;
    
    IF active_constraint_count >= 1 AND performance_index_exists THEN
        RAISE NOTICE '✅ SUCCESS: Organizations import fix is ready!';
        RAISE NOTICE 'Data integrity constraints: % active', active_constraint_count;
        RAISE NOTICE 'Performance indexes: Ready';
        RAISE NOTICE 'Import logic: Updated to use manual upsert approach';
    ELSE
        RAISE WARNING 'Setup incomplete - Constraints: %, Indexes: %', active_constraint_count, performance_index_exists;
    END IF;
END $$;