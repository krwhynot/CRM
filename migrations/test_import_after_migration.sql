-- ============================================
-- Test Script: Verify Import Works After Migration
-- Date: 2025-01-09  
-- Purpose: Test upsert operations with the new exact-match constraint
-- ============================================

-- Test 1: Single record insert (should succeed)
-- ✅ FIXED: Uses exact name match that works with new constraint
INSERT INTO organizations (
    name, type, priority, segment, 
    import_session_id, created_by, updated_by,
    is_active
) VALUES (
    'Test Company ABC', 'customer', 'A', 'Technology',
    'test-session-001', 
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    true
) ON CONFLICT (name, type) 
  DO UPDATE SET 
    updated_at = NOW(),
    import_session_id = EXCLUDED.import_session_id;

-- Test 2: Exact duplicate insert (should update, not error)
INSERT INTO organizations (
    name, type, priority, segment,
    import_session_id, created_by, updated_by,
    is_active
) VALUES (
    'Test Company ABC', 'customer', 'B', 'Manufacturing', 
    'test-session-002',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    true
) ON CONFLICT (name, type)
  DO UPDATE SET 
    priority = EXCLUDED.priority,
    segment = EXCLUDED.segment,
    updated_at = NOW(),
    import_session_id = EXCLUDED.import_session_id;

-- Test 3: Case-insensitive duplicate (this will fail due to case-insensitive constraint)
-- This test verifies both constraints work together
DO $$
BEGIN
    -- This should fail because the case-insensitive constraint still exists
    INSERT INTO organizations (
        name, type, priority, segment,
        import_session_id, created_by, updated_by,
        is_active
    ) VALUES (
        'test company abc', 'customer', 'C', 'Services',
        'test-session-003',
        (SELECT id FROM auth.users LIMIT 1),
        (SELECT id FROM auth.users LIMIT 1),
        true
    );
    
    RAISE NOTICE '❌ ERROR: Case-insensitive constraint not working - lowercase duplicate was created';
    
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE '✅ SUCCESS: Case-insensitive constraint blocked lowercase duplicate as expected';
END $$;

-- Test 4: Verify only one active record exists
SELECT 
    COUNT(*) as active_count,
    name,
    type,
    priority,
    segment,
    import_session_id
FROM organizations 
WHERE LOWER(TRIM(name)) = 'test company abc' 
  AND type = 'customer'
  AND deleted_at IS NULL
GROUP BY name, type, priority, segment, import_session_id;

-- Test 5: Clean up test data
DELETE FROM organizations 
WHERE name ILIKE 'test company abc%' 
  AND import_session_id LIKE 'test-session-%';

-- Test 6: Verify both constraints exist and are working
DO $$
DECLARE
    exact_constraint_exists boolean;
    fuzzy_constraint_exists boolean;
BEGIN
    -- Check exact-match constraint (new one for upserts)
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'organizations_exact_name_type_active'
    ) INTO exact_constraint_exists;
    
    -- Check case-insensitive constraint (existing one for data integrity)
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname IN ('unique_organization_name_type_active', 'idx_organizations_unique_name_type_active')
    ) INTO fuzzy_constraint_exists;
    
    IF exact_constraint_exists AND fuzzy_constraint_exists THEN
        RAISE NOTICE '✅ SUCCESS: Both exact-match and case-insensitive constraints are active';
        RAISE NOTICE 'Import operations will now work correctly with ON CONFLICT (name, type)';
    ELSIF exact_constraint_exists THEN
        RAISE NOTICE '⚠️ PARTIAL: Exact constraint exists, case-insensitive constraint missing';
    ELSIF fuzzy_constraint_exists THEN
        RAISE NOTICE '❌ FAILED: Exact constraint missing - imports will still fail';
    ELSE
        RAISE NOTICE '❌ CRITICAL: Both constraints missing - system is unprotected';
    END IF;
END $$;