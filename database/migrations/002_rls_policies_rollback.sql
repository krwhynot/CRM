-- ============================================================================
-- KitchenPantry CRM - RLS Policies Rollback Migration
-- Migration: 002_rls_policies_rollback
-- Description: Rollback script to remove all RLS policies and helper functions
-- ============================================================================

-- ============================================================================
-- DROP ALL RLS POLICIES
-- ============================================================================

-- Organizations policies
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;

-- Contacts policies
DROP POLICY IF EXISTS "contacts_select_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON contacts;

-- Products policies
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

-- Opportunities policies
DROP POLICY IF EXISTS "opportunities_select_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_insert_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_update_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_delete_policy" ON opportunities;

-- Opportunity products policies
DROP POLICY IF EXISTS "opportunity_products_select_policy" ON opportunity_products;
DROP POLICY IF EXISTS "opportunity_products_insert_policy" ON opportunity_products;
DROP POLICY IF EXISTS "opportunity_products_update_policy" ON opportunity_products;
DROP POLICY IF EXISTS "opportunity_products_delete_policy" ON opportunity_products;

-- Interactions policies
DROP POLICY IF EXISTS "interactions_select_policy" ON interactions;
DROP POLICY IF EXISTS "interactions_insert_policy" ON interactions;
DROP POLICY IF EXISTS "interactions_update_policy" ON interactions;
DROP POLICY IF EXISTS "interactions_delete_policy" ON interactions;

-- Principal-distributor relationships policies
DROP POLICY IF EXISTS "principal_distributor_select_policy" ON principal_distributor_relationships;
DROP POLICY IF EXISTS "principal_distributor_insert_policy" ON principal_distributor_relationships;
DROP POLICY IF EXISTS "principal_distributor_update_policy" ON principal_distributor_relationships;
DROP POLICY IF EXISTS "principal_distributor_delete_policy" ON principal_distributor_relationships;

-- ============================================================================
-- DISABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE principal_distributor_relationships DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP HELPER FUNCTIONS AND VIEWS
-- ============================================================================

-- Drop security validation views
DROP VIEW IF EXISTS user_accessible_organizations;
DROP VIEW IF EXISTS user_data_summary;

-- Drop helper functions
DROP FUNCTION IF EXISTS user_has_org_access(UUID);
DROP FUNCTION IF EXISTS user_is_admin();
DROP FUNCTION IF EXISTS user_accessible_org_ids();

-- ============================================================================
-- END OF RLS POLICIES ROLLBACK
-- ============================================================================