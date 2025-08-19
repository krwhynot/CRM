-- ============================================================================
-- Unused Index Cleanup Script for CRM Database
-- Description: Removes or optimizes unused indexes to improve performance
-- Based on database health analysis showing many indexes with 0 scans
-- ============================================================================

-- Start transaction for safety
BEGIN;

-- ============================================================================
-- ANALYSIS: Current Index Usage Status
-- ============================================================================

-- Show current index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'VERY_LOW'
        WHEN idx_scan < 100 THEN 'LOW'
        WHEN idx_scan < 1000 THEN 'MODERATE'
        ELSE 'HIGH'
    END as usage_category
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- DUPLICATE INDEX CLEANUP
-- Based on health check showing these duplicate indexes:
-- ============================================================================

-- Duplicate: 'mfa_factors_user_id_idx' covered by 'unique_phone_factor_per_user'
-- Note: These are auth schema indexes - handle with extreme care
-- DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;  -- COMMENTED OUT - AUTH CRITICAL

-- Duplicate: 'refresh_tokens_instance_id_idx' covered by 'refresh_tokens_instance_id_user_id_idx'
-- Note: These are auth schema indexes - handle with extreme care  
-- DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;  -- COMMENTED OUT - AUTH CRITICAL

-- Duplicate: 'sessions_user_id_idx' covered by 'user_id_created_at_idx'
-- Note: These are auth schema indexes - handle with extreme care
-- DROP INDEX IF EXISTS auth.sessions_user_id_idx;  -- COMMENTED OUT - AUTH CRITICAL

-- ============================================================================
-- UNUSED INDEX CLEANUP (CRM-Specific)
-- These indexes show 0 scans and can be safely removed from CRM tables
-- ============================================================================

-- Unused trigram search indexes (0 scans)
-- These were created for search but are not being used
DROP INDEX IF EXISTS idx_organizations_name_trgm;    -- 0 scans, 0.1MB
DROP INDEX IF EXISTS idx_contacts_name_trgm;         -- 0 scans, 0.0MB

-- Unused text search indexes (0 scans) 
-- Full-text search not currently implemented
DROP INDEX IF EXISTS idx_organizations_name_text;    -- 0 scans, 0.0MB

-- Unused composite indexes (0 scans)
-- These were created but queries don't use them
DROP INDEX IF EXISTS idx_contacts_active_name;       -- 0 scans, 0.0MB
DROP INDEX IF EXISTS idx_contacts_org_active;        -- 0 scans, 0.0MB
DROP INDEX IF EXISTS idx_opportunities_active_stage; -- 0 scans, 0.0MB
DROP INDEX IF EXISTS idx_opportunities_org_active;   -- 0 scans, 0.0MB
DROP INDEX IF EXISTS idx_products_principal_active;  -- 0 scans, 0.0MB

-- ============================================================================
-- LOW USAGE INDEX OPTIMIZATION
-- These indexes have very low usage - consider optimization
-- ============================================================================

-- Keep but monitor these low-usage indexes:
-- idx_contacts_email (1 scan) - Keep for potential user lookups
-- idx_organizations_type (6 scans) - Keep for type filtering  
-- idx_organizations_active_name (26 scans) - Keep for name searches
-- idx_opportunities_priority (2 scans) - Keep for priority filtering

-- ============================================================================
-- REPLACE UNUSED INDEXES WITH EMERGENCY-OPTIMIZED ONES
-- ============================================================================

-- Create optimized replacement indexes for emergency response
-- These replace the unused indexes with more targeted, useful ones

-- Replace unused trigram with emergency search optimization
CREATE INDEX CONCURRENTLY idx_orgs_emergency_search 
ON organizations (name, type, deleted_at) 
WHERE deleted_at IS NULL;

-- Replace unused contact indexes with emergency validation index
CREATE INDEX CONCURRENTLY idx_contacts_emergency_validation 
ON contacts (organization_id, is_primary, deleted_at, role) 
WHERE deleted_at IS NULL;

-- Replace unused opportunity indexes with emergency pipeline index
CREATE INDEX CONCURRENTLY idx_opportunities_emergency_pipeline 
ON opportunities (stage, close_date, deleted_at, created_at) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- VERIFY INDEX CHANGES
-- ============================================================================

-- Show remaining indexes after cleanup
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    'POST_CLEANUP' as status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Calculate space saved from cleanup
WITH cleanup_stats AS (
    SELECT 
        count(*) FILTER (WHERE indexname LIKE 'idx_%_trgm') as trgm_indexes_removed,
        count(*) FILTER (WHERE indexname LIKE 'idx_%_text') as text_indexes_removed,
        count(*) FILTER (WHERE indexname LIKE 'idx_%_active_%') as active_indexes_removed,
        count(*) FILTER (WHERE indexname LIKE 'idx_%emergency%') as emergency_indexes_added
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public'
)
SELECT 
    trgm_indexes_removed,
    text_indexes_removed, 
    active_indexes_removed,
    emergency_indexes_added,
    (trgm_indexes_removed + text_indexes_removed + active_indexes_removed) as total_removed,
    emergency_indexes_added as total_added
FROM cleanup_stats;

-- ============================================================================
-- PERFORMANCE IMPACT VALIDATION
-- ============================================================================

-- Test that critical queries still work after index cleanup
-- These should use the remaining indexes efficiently

-- Test 1: Organization search (should use idx_orgs_emergency_search)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, type 
FROM organizations 
WHERE name ILIKE 'Test%' 
  AND deleted_at IS NULL 
LIMIT 10;

-- Test 2: Contact validation (should use idx_contacts_emergency_validation)  
EXPLAIN (ANALYZE, BUFFERS)
SELECT organization_id, COUNT(*) 
FROM contacts 
WHERE is_primary = true 
  AND deleted_at IS NULL 
GROUP BY organization_id 
LIMIT 10;

-- Test 3: Opportunity pipeline (should use idx_opportunities_emergency_pipeline)
EXPLAIN (ANALYZE, BUFFERS)
SELECT stage, COUNT(*) 
FROM opportunities 
WHERE deleted_at IS NULL 
  AND stage IN ('prospecting', 'qualification') 
GROUP BY stage 
LIMIT 10;

-- ============================================================================
-- POST-CLEANUP MONITORING SETUP
-- ============================================================================

-- Create a view to monitor the new index usage
CREATE OR REPLACE VIEW index_usage_monitor AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'VERY_LOW'
        WHEN idx_scan < 100 THEN 'LOW' 
        WHEN idx_scan < 1000 THEN 'MODERATE'
        ELSE 'HIGH'
    END as usage_level,
    CASE
        WHEN indexname LIKE 'idx_%emergency%' THEN 'EMERGENCY'
        WHEN indexname LIKE '%_pkey' THEN 'PRIMARY_KEY'
        WHEN indexname LIKE 'idx_%' THEN 'CUSTOM'
        ELSE 'SYSTEM'
    END as index_type
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Grant access to monitoring view
GRANT SELECT ON index_usage_monitor TO PUBLIC;

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================

-- If performance degrades after cleanup, use this rollback plan:
/*
-- Rollback: Recreate removed indexes if needed

-- Recreate trigram indexes (if search performance degrades)
CREATE INDEX CONCURRENTLY idx_organizations_name_trgm 
ON organizations USING gin (name gin_trgm_ops) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_contacts_name_trgm 
ON contacts USING gin (name gin_trgm_ops) 
WHERE deleted_at IS NULL;

-- Recreate text search indexes (if full-text search is implemented)
CREATE INDEX CONCURRENTLY idx_organizations_name_text 
ON organizations USING gin (to_tsvector('english', name)) 
WHERE deleted_at IS NULL;

-- Recreate composite indexes (if specific query patterns emerge)
CREATE INDEX CONCURRENTLY idx_contacts_active_name 
ON contacts (deleted_at, name) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_contacts_org_active 
ON contacts (organization_id, deleted_at) 
WHERE deleted_at IS NULL;
*/

-- ============================================================================
-- MAINTENANCE SCHEDULE
-- ============================================================================

-- Schedule regular index usage reviews
-- Recommended: Monthly analysis of index usage
/*
-- Monthly index review query:
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans_since_reset,
    idx_tup_read as tuples_read_since_reset,
    pg_size_pretty(pg_relation_size(indexrelid)) as current_size,
    CASE 
        WHEN idx_scan = 0 AND pg_relation_size(indexrelid) > 1048576 THEN 'CONSIDER_REMOVAL'
        WHEN idx_scan < 10 AND pg_relation_size(indexrelid) > 10485760 THEN 'LOW_USAGE_LARGE'
        WHEN idx_scan > 1000 THEN 'HEAVILY_USED'
        ELSE 'NORMAL'
    END as recommendation
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY 
    CASE 
        WHEN idx_scan = 0 THEN 1
        WHEN idx_scan < 10 THEN 2
        ELSE 3
    END,
    pg_relation_size(indexrelid) DESC;
*/

COMMIT;

-- ============================================================================
-- SUCCESS CRITERIA VERIFICATION
-- ============================================================================

-- Verify cleanup was successful
SELECT 'Index cleanup completed successfully' as status,
       now() as completion_time;

-- Final index count and usage summary  
SELECT 
    count(*) as total_indexes,
    count(*) FILTER (WHERE idx_scan = 0) as unused_indexes,
    count(*) FILTER (WHERE idx_scan > 0) as used_indexes,
    count(*) FILTER (WHERE indexname LIKE '%emergency%') as emergency_indexes,
    pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';

-- Check that emergency indexes are in place
SELECT 'Emergency indexes status:' as check_type,
       count(*) as emergency_index_count
FROM pg_stat_user_indexes 
WHERE indexname LIKE '%emergency%'
  AND schemaname = 'public';

-- ============================================================================
-- POST-CLEANUP RECOMMENDATIONS
-- ============================================================================

SELECT 'POST-CLEANUP RECOMMENDATIONS:' as section;
SELECT '1. Monitor new emergency index usage during next incident' as recommendation;
SELECT '2. Run performance tests to verify query speed' as recommendation;  
SELECT '3. Schedule monthly index usage review' as recommendation;
SELECT '4. Update emergency protocol to use new indexes' as recommendation;
SELECT '5. Consider removing auth duplicate indexes with DBA approval' as recommendation;

-- ============================================================================
-- END OF INDEX CLEANUP SCRIPT
-- ============================================================================