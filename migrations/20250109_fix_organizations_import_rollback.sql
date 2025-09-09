-- ============================================
-- Rollback: Fix Organizations Import Support
-- Date: 2025-01-09
-- Purpose: Rollback to original state (before manual upsert implementation)
-- ============================================

-- IMPORTANT: This rollback only removes indexes added by the migration.
-- The core fix is in TypeScript code, which would need to be reverted separately.

-- Step 1: Drop performance indexes created by migration
DROP INDEX IF EXISTS idx_organizations_import_session;

-- Step 2: No constraint cleanup needed - we didn't modify the existing constraints
-- The existing unique constraints remain intact:
-- - unique_organization_name_type_active
-- - idx_organizations_unique_name_type_active

-- Step 3: No data restore needed - migration did not modify any records

-- Step 4: Log rollback completion
DO $$
BEGIN
    RAISE NOTICE 'ROLLBACK COMPLETE: Organizations import constraint migration has been reversed';
    RAISE NOTICE 'The exact-match constraint has been removed - imports will fail until migration is re-applied';
    RAISE NOTICE 'Case-insensitive constraint remains active for data integrity';
END $$;

-- Step 5: Update table statistics
ANALYZE organizations;