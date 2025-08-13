-- ============================================================================
-- KitchenPantry CRM - RLS Policy Test Queries
-- Description: Comprehensive test suite for validating RLS implementation
-- Usage: Run these queries as different users to verify access controls
-- ============================================================================

-- ============================================================================
-- SETUP VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN '✓ ENABLED'
        ELSE '✗ DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 
    'contacts', 
    'products', 
    'opportunities', 
    'opportunity_products', 
    'interactions', 
    'principal_distributor_relationships'
)
ORDER BY tablename;

-- Count RLS policies by table
SELECT 
    tablename,
    COUNT(*) as policy_count,
    array_agg(policyname ORDER BY policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Verify helper functions exist
SELECT 
    proname as function_name,
    prosecdef as "Security Definer",
    proacl as permissions
FROM pg_proc 
WHERE proname IN (
    'user_has_org_access',
    'user_is_admin', 
    'user_accessible_org_ids'
)
ORDER BY proname;

-- ============================================================================
-- CURRENT USER CONTEXT VERIFICATION
-- ============================================================================

-- Check current authentication context
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as user_email,
    auth.jwt() ->> 'role' as user_role,
    user_is_admin() as is_admin;

-- Show accessible data summary for current user
SELECT * FROM user_data_summary ORDER BY table_name;

-- Show accessible organizations with access levels
SELECT * FROM user_accessible_organizations ORDER BY name;

-- List all organization IDs accessible to current user
SELECT org_id, 'accessible' as status 
FROM user_accessible_org_ids() 
ORDER BY org_id;

-- ============================================================================
-- DATA SETUP FOR TESTING (Run as admin or superuser)
-- ============================================================================

/*
-- Create test organizations (uncomment to set up test data)
INSERT INTO organizations (name, type, created_by) VALUES
    ('ACME Foods (Principal)', 'principal', auth.uid()),
    ('XYZ Distribution', 'distributor', auth.uid()),
    ('Restaurant Chain ABC', 'customer', auth.uid()),
    ('Competitor Foods', 'principal', '00000000-0000-0000-0000-000000000000'), -- Different user
    ('Other Restaurant', 'customer', '00000000-0000-0000-0000-000000000000'); -- Different user

-- Create test contacts
INSERT INTO contacts (first_name, last_name, organization_id, created_by)
SELECT 'John', 'Smith', o.id, auth.uid()
FROM organizations o 
WHERE o.name IN ('ACME Foods (Principal)', 'Restaurant Chain ABC')
AND o.created_by = auth.uid();

-- Create test products
INSERT INTO products (name, category, principal_organization_id, created_by)
SELECT 'ACME Frozen Pizza', 'frozen', o.id, auth.uid()
FROM organizations o 
WHERE o.name = 'ACME Foods (Principal)' 
AND o.created_by = auth.uid();

-- Create test opportunities
INSERT INTO opportunities (name, stage, organization_id, created_by)
SELECT 'Q1 Pizza Deal', 'qualified', o.id, auth.uid()
FROM organizations o 
WHERE o.name = 'Restaurant Chain ABC' 
AND o.created_by = auth.uid();
*/

-- ============================================================================
-- ACCESS CONTROL VALIDATION TESTS
-- ============================================================================

-- TEST 1: Basic table access verification
-- Each user should only see data they have access to

-- Organizations - should see own and accessible organizations
SELECT 
    'Organizations Test' as test_name,
    COUNT(*) as accessible_count,
    array_agg(DISTINCT type) as org_types_visible,
    array_agg(name ORDER BY name) as org_names
FROM organizations;

-- Contacts - should only see contacts from accessible organizations  
SELECT 
    'Contacts Test' as test_name,
    COUNT(*) as accessible_count,
    COUNT(DISTINCT organization_id) as unique_orgs
FROM contacts;

-- Products - should only see products from accessible principals
SELECT 
    'Products Test' as test_name,
    COUNT(*) as accessible_count,
    COUNT(DISTINCT principal_organization_id) as unique_principals
FROM products;

-- Opportunities - should see opportunities from accessible organizations
SELECT 
    'Opportunities Test' as test_name,
    COUNT(*) as accessible_count,
    COUNT(DISTINCT organization_id) as unique_customers,
    COUNT(DISTINCT principal_organization_id) as unique_principals,
    COUNT(DISTINCT distributor_organization_id) as unique_distributors
FROM opportunities;

-- ============================================================================
-- CROSS-TABLE RELATIONSHIP TESTS
-- ============================================================================

-- TEST 2: Verify cross-table access through relationships

-- Contacts should belong to accessible organizations
SELECT 
    'Contact-Organization Access Test' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS - No orphaned contacts'
        ELSE 'FAIL - ' || COUNT(*) || ' contacts without org access'
    END as result
FROM contacts c
LEFT JOIN organizations o ON c.organization_id = o.id
WHERE o.id IS NULL;

-- Products should belong to accessible principals
SELECT 
    'Product-Principal Access Test' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS - No orphaned products'
        ELSE 'FAIL - ' || COUNT(*) || ' products without principal access'
    END as result
FROM products p
LEFT JOIN organizations o ON p.principal_organization_id = o.id
WHERE o.id IS NULL;

-- Opportunity products should link to accessible opportunities and products
SELECT 
    'OpportunityProduct Access Test' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS - No orphaned opportunity products'
        ELSE 'FAIL - ' || COUNT(*) || ' opportunity products without access'
    END as result
FROM opportunity_products op
LEFT JOIN opportunities opp ON op.opportunity_id = opp.id
LEFT JOIN products p ON op.product_id = p.id
WHERE opp.id IS NULL OR p.id IS NULL;

-- ============================================================================
-- PERMISSION-SPECIFIC TESTS
-- ============================================================================

-- TEST 3: Insert permission validation

-- Test organization insert (should work for authenticated users)
SELECT 
    'Organization Insert Test' as test_name,
    CASE 
        WHEN user_is_admin() OR auth.uid() IS NOT NULL THEN 'READY - Can test insert'
        ELSE 'SKIP - Not authenticated'
    END as status;

-- Test contact insert (requires organization access)
WITH test_org AS (
    SELECT id FROM organizations LIMIT 1
)
SELECT 
    'Contact Insert Test' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM test_org) THEN 'READY - Have accessible org for test'
        ELSE 'SKIP - No accessible organizations'
    END as status;

-- ============================================================================
-- BUSINESS SCENARIO TESTS
-- ============================================================================

-- TEST 4: Sales Manager Scenario
-- Should see opportunities in their territory

SELECT 
    'Sales Manager Territory Test' as test_name,
    o.name as opportunity,
    org.name as customer,
    prin.name as principal,
    dist.name as distributor,
    CASE 
        WHEN o.created_by = auth.uid() THEN 'Owner'
        WHEN user_has_org_access(o.organization_id) THEN 'Customer Access'  
        WHEN user_has_org_access(o.principal_organization_id) THEN 'Principal Access'
        WHEN user_has_org_access(o.distributor_organization_id) THEN 'Distributor Access'
        ELSE 'Unknown Access'
    END as access_reason
FROM opportunities o
JOIN organizations org ON o.organization_id = org.id
LEFT JOIN organizations prin ON o.principal_organization_id = prin.id
LEFT JOIN organizations dist ON o.distributor_organization_id = dist.id
ORDER BY o.name;

-- TEST 5: Principal Account Manager Scenario  
-- Should see their products and related opportunities

SELECT 
    'Principal Manager Test' as test_name,
    p.name as product,
    prin.name as principal,
    COUNT(op.opportunity_id) as opportunity_count,
    CASE 
        WHEN p.created_by = auth.uid() THEN 'Product Owner'
        WHEN user_has_org_access(p.principal_organization_id) THEN 'Principal Access'
        ELSE 'Unknown Access'
    END as access_reason
FROM products p
JOIN organizations prin ON p.principal_organization_id = prin.id
LEFT JOIN opportunity_products op ON p.id = op.product_id
GROUP BY p.id, p.name, prin.name, p.created_by, p.principal_organization_id
ORDER BY p.name;

-- ============================================================================
-- SECURITY BOUNDARY TESTS
-- ============================================================================

-- TEST 6: Negative access tests (should return no results for unauthorized data)

-- Try to access organizations created by other users (should be filtered by RLS)
SELECT 
    'Unauthorized Org Access Test' as test_name,
    COUNT(*) as visible_count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS - No unauthorized orgs visible'
        ELSE 'INVESTIGATE - ' || COUNT(*) || ' orgs visible from other users'
    END as result
FROM organizations 
WHERE created_by != auth.uid() 
AND NOT user_has_org_access(id)
AND NOT user_is_admin();

-- Test admin bypass (admins should see everything)
SELECT 
    'Admin Bypass Test' as test_name,
    user_is_admin() as is_admin,
    COUNT(*) as total_visible_orgs,
    CASE 
        WHEN user_is_admin() THEN 'Admin - Should see all data'
        ELSE 'Regular User - Should see limited data'
    END as expected_behavior
FROM organizations;

-- ============================================================================
-- PERFORMANCE VALIDATION QUERIES
-- ============================================================================

-- TEST 7: Helper function performance check

EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) 
FROM organizations 
WHERE user_has_org_access(id);

-- Function call statistics
SELECT 
    funcname,
    calls,
    total_time,
    mean_time,
    self_time
FROM pg_stat_user_functions 
WHERE funcname IN ('user_has_org_access', 'user_is_admin', 'user_accessible_org_ids')
ORDER BY total_time DESC;

-- ============================================================================
-- DATA CONSISTENCY VALIDATION
-- ============================================================================

-- TEST 8: Referential integrity with RLS

-- Verify all visible contacts belong to visible organizations
SELECT 
    'Contact-Org Consistency Test' as test_name,
    c.contact_count,
    o.org_count,
    CASE 
        WHEN c.org_ids <@ o.org_ids THEN 'PASS - All contact orgs are visible'
        ELSE 'FAIL - Some contact orgs not visible'
    END as result
FROM (
    SELECT 
        COUNT(*) as contact_count,
        array_agg(DISTINCT organization_id) as org_ids
    FROM contacts
) c
CROSS JOIN (
    SELECT 
        COUNT(*) as org_count,
        array_agg(id) as org_ids
    FROM organizations
) o;

-- Verify all visible opportunity products link to visible opportunities and products
SELECT 
    'OpportunityProduct Consistency Test' as test_name,
    op.count as opportunity_product_count,
    opp.count as opportunity_count, 
    p.count as product_count,
    CASE 
        WHEN op.opp_ids <@ opp.ids AND op.prod_ids <@ p.ids 
        THEN 'PASS - All links are visible'
        ELSE 'FAIL - Some linked records not visible'
    END as result
FROM (
    SELECT 
        COUNT(*) as count,
        array_agg(DISTINCT opportunity_id) as opp_ids,
        array_agg(DISTINCT product_id) as prod_ids
    FROM opportunity_products
) op
CROSS JOIN (
    SELECT COUNT(*) as count, array_agg(id) as ids FROM opportunities
) opp
CROSS JOIN (
    SELECT COUNT(*) as count, array_agg(id) as ids FROM products  
) p;

-- ============================================================================
-- COMPREHENSIVE ACCESS REPORT
-- ============================================================================

-- Final comprehensive access report for current user
SELECT 
    'FINAL ACCESS REPORT' as report_type,
    auth.uid() as user_id,
    user_is_admin() as is_admin,
    (SELECT COUNT(*) FROM organizations) as accessible_organizations,
    (SELECT COUNT(*) FROM contacts) as accessible_contacts,
    (SELECT COUNT(*) FROM products) as accessible_products,
    (SELECT COUNT(*) FROM opportunities) as accessible_opportunities,
    (SELECT COUNT(*) FROM interactions) as accessible_interactions,
    (SELECT COUNT(*) FROM principal_distributor_relationships) as accessible_relationships,
    NOW() as report_timestamp;

-- Summary of test results
SELECT 
    'TEST SUMMARY' as section,
    'RLS Implementation Validation Complete' as message,
    'Review all test results above for security verification' as instructions,
    'Any FAIL results require investigation' as warning;

-- ============================================================================
-- CLEANUP QUERIES (Run after testing if needed)
-- ============================================================================

/*
-- Uncomment to clean up test data
DELETE FROM interactions WHERE created_by = auth.uid() AND subject LIKE '%TEST%';
DELETE FROM opportunity_products WHERE opportunity_id IN (SELECT id FROM opportunities WHERE name LIKE '%TEST%');
DELETE FROM opportunities WHERE created_by = auth.uid() AND name LIKE '%TEST%';
DELETE FROM products WHERE created_by = auth.uid() AND name LIKE '%TEST%';
DELETE FROM contacts WHERE created_by = auth.uid() AND first_name = 'TEST';
DELETE FROM organizations WHERE created_by = auth.uid() AND name LIKE '%TEST%';
*/