-- ============================================================================
-- KitchenPantry CRM - Row Level Security (RLS) Policies
-- Migration: 002_rls_policies
-- Description: Comprehensive RLS implementation for multi-tenant data security
-- 
-- Security Model:
-- - User-based data ownership (created_by = auth.uid())
-- - Organization-based access for shared data
-- - Role-based permissions for different user types
-- - Hierarchical access for parent-child organizations
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE principal_distributor_relationships ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Function to check if user has access to an organization
-- This includes direct ownership and organization membership
CREATE OR REPLACE FUNCTION user_has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Allow access if user created the organization
    -- OR if user has any contacts/opportunities/products related to the org
    -- OR if user is associated with the organization through their data
    RETURN EXISTS (
        SELECT 1 FROM organizations o
        WHERE o.id = org_id
        AND (
            o.created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM contacts c 
                WHERE c.organization_id = org_id 
                AND c.created_by = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM opportunities op 
                WHERE op.organization_id = org_id 
                AND op.created_by = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM products p 
                WHERE p.principal_organization_id = org_id 
                AND p.created_by = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM interactions i 
                WHERE i.organization_id = org_id 
                AND i.created_by = auth.uid()
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin (based on user metadata)
-- This can be extended with proper role management
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, check if user has admin role in metadata
    -- This should be expanded with proper role table implementation
    RETURN COALESCE(
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's accessible organization IDs
-- Including hierarchical relationships
CREATE OR REPLACE FUNCTION user_accessible_org_ids()
RETURNS TABLE(org_id UUID) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_hierarchy AS (
        -- Base case: organizations user has direct access to
        SELECT DISTINCT o.id, o.parent_organization_id
        FROM organizations o
        WHERE o.created_by = auth.uid()
           OR user_has_org_access(o.id)
        
        UNION
        
        -- Recursive case: include child organizations
        SELECT o.id, o.parent_organization_id
        FROM organizations o
        JOIN org_hierarchy oh ON o.parent_organization_id = oh.id
    )
    SELECT DISTINCT oh.id FROM org_hierarchy oh;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATIONS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view organizations they have access to
CREATE POLICY "organizations_select_policy" ON organizations
    FOR SELECT
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(id)
    );

-- Policy: Users can insert organizations they create
CREATE POLICY "organizations_insert_policy" ON organizations
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (updated_by IS NULL OR updated_by = auth.uid())
    );

-- Policy: Users can update organizations they created or have access to
CREATE POLICY "organizations_update_policy" ON organizations
    FOR UPDATE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(id)
    )
    WITH CHECK (
        updated_by = auth.uid()
        AND (created_by = OLD.created_by) -- Prevent changing creator
    );

-- Policy: Only admins or creators can delete organizations
CREATE POLICY "organizations_delete_policy" ON organizations
    FOR DELETE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
    );

-- ============================================================================
-- CONTACTS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view contacts from organizations they have access to
CREATE POLICY "contacts_select_policy" ON contacts
    FOR SELECT
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(organization_id)
    );

-- Policy: Users can insert contacts for organizations they have access to
CREATE POLICY "contacts_insert_policy" ON contacts
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (updated_by IS NULL OR updated_by = auth.uid())
        AND user_has_org_access(organization_id)
    );

-- Policy: Users can update contacts they created or from accessible organizations
CREATE POLICY "contacts_update_policy" ON contacts
    FOR UPDATE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(organization_id)
    )
    WITH CHECK (
        updated_by = auth.uid()
        AND (created_by = OLD.created_by) -- Prevent changing creator
        AND user_has_org_access(organization_id)
    );

-- Policy: Users can delete contacts they created or from accessible organizations
CREATE POLICY "contacts_delete_policy" ON contacts
    FOR DELETE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(organization_id)
    );

-- ============================================================================
-- PRODUCTS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view products from principals they have access to
CREATE POLICY "products_select_policy" ON products
    FOR SELECT
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(principal_organization_id)
    );

-- Policy: Users can insert products for principals they have access to
CREATE POLICY "products_insert_policy" ON products
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (updated_by IS NULL OR updated_by = auth.uid())
        AND user_has_org_access(principal_organization_id)
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.id = principal_organization_id 
            AND o.type = 'principal'
        )
    );

-- Policy: Users can update products they created or from accessible principals
CREATE POLICY "products_update_policy" ON products
    FOR UPDATE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(principal_organization_id)
    )
    WITH CHECK (
        updated_by = auth.uid()
        AND (created_by = OLD.created_by) -- Prevent changing creator
        AND user_has_org_access(principal_organization_id)
    );

-- Policy: Users can delete products they created or from accessible principals
CREATE POLICY "products_delete_policy" ON products
    FOR DELETE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(principal_organization_id)
    );

-- ============================================================================
-- OPPORTUNITIES TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view opportunities from organizations they have access to
CREATE POLICY "opportunities_select_policy" ON opportunities
    FOR SELECT
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(organization_id)
        OR (principal_organization_id IS NOT NULL AND user_has_org_access(principal_organization_id))
        OR (distributor_organization_id IS NOT NULL AND user_has_org_access(distributor_organization_id))
    );

-- Policy: Users can insert opportunities for organizations they have access to
CREATE POLICY "opportunities_insert_policy" ON opportunities
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (updated_by IS NULL OR updated_by = auth.uid())
        AND user_has_org_access(organization_id)
        AND (principal_organization_id IS NULL OR user_has_org_access(principal_organization_id))
        AND (distributor_organization_id IS NULL OR user_has_org_access(distributor_organization_id))
    );

-- Policy: Users can update opportunities they created or from accessible organizations
CREATE POLICY "opportunities_update_policy" ON opportunities
    FOR UPDATE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(organization_id)
        OR (principal_organization_id IS NOT NULL AND user_has_org_access(principal_organization_id))
        OR (distributor_organization_id IS NOT NULL AND user_has_org_access(distributor_organization_id))
    )
    WITH CHECK (
        updated_by = auth.uid()
        AND (created_by = OLD.created_by) -- Prevent changing creator
        AND user_has_org_access(organization_id)
    );

-- Policy: Users can delete opportunities they created or from accessible organizations
CREATE POLICY "opportunities_delete_policy" ON opportunities
    FOR DELETE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR user_has_org_access(organization_id)
    );

-- ============================================================================
-- OPPORTUNITY_PRODUCTS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view opportunity products for accessible opportunities
CREATE POLICY "opportunity_products_select_policy" ON opportunity_products
    FOR SELECT
    USING (
        user_is_admin()
        OR EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND (
                o.created_by = auth.uid()
                OR user_has_org_access(o.organization_id)
                OR (o.principal_organization_id IS NOT NULL AND user_has_org_access(o.principal_organization_id))
                OR (o.distributor_organization_id IS NOT NULL AND user_has_org_access(o.distributor_organization_id))
            )
        )
        OR EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_id 
            AND (
                p.created_by = auth.uid()
                OR user_has_org_access(p.principal_organization_id)
            )
        )
    );

-- Policy: Users can insert opportunity products for accessible opportunities and products
CREATE POLICY "opportunity_products_insert_policy" ON opportunity_products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND (
                o.created_by = auth.uid()
                OR user_has_org_access(o.organization_id)
            )
        )
        AND EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_id 
            AND (
                p.created_by = auth.uid()
                OR user_has_org_access(p.principal_organization_id)
            )
        )
    );

-- Policy: Users can update opportunity products for accessible opportunities
CREATE POLICY "opportunity_products_update_policy" ON opportunity_products
    FOR UPDATE
    USING (
        user_is_admin()
        OR EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND (
                o.created_by = auth.uid()
                OR user_has_org_access(o.organization_id)
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND (
                o.created_by = auth.uid()
                OR user_has_org_access(o.organization_id)
            )
        )
    );

-- Policy: Users can delete opportunity products for accessible opportunities
CREATE POLICY "opportunity_products_delete_policy" ON opportunity_products
    FOR DELETE
    USING (
        user_is_admin()
        OR EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND (
                o.created_by = auth.uid()
                OR user_has_org_access(o.organization_id)
            )
        )
    );

-- ============================================================================
-- INTERACTIONS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view interactions they created or from accessible organizations/opportunities
CREATE POLICY "interactions_select_policy" ON interactions
    FOR SELECT
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR (organization_id IS NOT NULL AND user_has_org_access(organization_id))
        OR EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND (
                o.created_by = auth.uid()
                OR user_has_org_access(o.organization_id)
            )
        )
    );

-- Policy: Users can insert interactions for accessible organizations/opportunities
CREATE POLICY "interactions_insert_policy" ON interactions
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (updated_by IS NULL OR updated_by = auth.uid())
        AND (organization_id IS NULL OR user_has_org_access(organization_id))
        AND (
            opportunity_id IS NULL 
            OR EXISTS (
                SELECT 1 FROM opportunities o 
                WHERE o.id = opportunity_id 
                AND (
                    o.created_by = auth.uid()
                    OR user_has_org_access(o.organization_id)
                )
            )
        )
    );

-- Policy: Users can update interactions they created or from accessible organizations
CREATE POLICY "interactions_update_policy" ON interactions
    FOR UPDATE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR (organization_id IS NOT NULL AND user_has_org_access(organization_id))
        OR EXISTS (
            SELECT 1 FROM opportunities o 
            WHERE o.id = opportunity_id 
            AND user_has_org_access(o.organization_id)
        )
    )
    WITH CHECK (
        updated_by = auth.uid()
        AND (created_by = OLD.created_by) -- Prevent changing creator
    );

-- Policy: Users can delete interactions they created or from accessible organizations
CREATE POLICY "interactions_delete_policy" ON interactions
    FOR DELETE
    USING (
        user_is_admin()
        OR created_by = auth.uid()
        OR (organization_id IS NOT NULL AND user_has_org_access(organization_id))
    );

-- ============================================================================
-- PRINCIPAL_DISTRIBUTOR_RELATIONSHIPS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view relationships involving organizations they have access to
CREATE POLICY "principal_distributor_select_policy" ON principal_distributor_relationships
    FOR SELECT
    USING (
        user_is_admin()
        OR user_has_org_access(principal_id)
        OR user_has_org_access(distributor_id)
    );

-- Policy: Users can insert relationships for organizations they have access to
CREATE POLICY "principal_distributor_insert_policy" ON principal_distributor_relationships
    FOR INSERT
    WITH CHECK (
        (user_has_org_access(principal_id) AND user_has_org_access(distributor_id))
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.id = principal_id 
            AND o.type = 'principal'
        )
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.id = distributor_id 
            AND o.type = 'distributor'
        )
    );

-- Policy: Users can update relationships for organizations they have access to
CREATE POLICY "principal_distributor_update_policy" ON principal_distributor_relationships
    FOR UPDATE
    USING (
        user_is_admin()
        OR (user_has_org_access(principal_id) AND user_has_org_access(distributor_id))
    )
    WITH CHECK (
        user_has_org_access(principal_id) AND user_has_org_access(distributor_id)
    );

-- Policy: Users can delete relationships for organizations they have access to
CREATE POLICY "principal_distributor_delete_policy" ON principal_distributor_relationships
    FOR DELETE
    USING (
        user_is_admin()
        OR (user_has_org_access(principal_id) AND user_has_org_access(distributor_id))
    );

-- ============================================================================
-- SECURITY VALIDATION VIEWS
-- ============================================================================

-- View to help debug RLS policies
CREATE OR REPLACE VIEW user_accessible_organizations AS
SELECT 
    o.id,
    o.name,
    o.type,
    CASE 
        WHEN o.created_by = auth.uid() THEN 'owner'
        WHEN user_has_org_access(o.id) THEN 'access'
        ELSE 'no_access'
    END as access_level
FROM organizations o
WHERE user_is_admin() 
   OR o.created_by = auth.uid() 
   OR user_has_org_access(o.id);

-- View to show user's data summary (for debugging)
CREATE OR REPLACE VIEW user_data_summary AS
SELECT 
    'organizations' as table_name,
    COUNT(*) as accessible_records
FROM organizations
WHERE user_is_admin() 
   OR created_by = auth.uid() 
   OR user_has_org_access(id)

UNION ALL

SELECT 
    'contacts',
    COUNT(*)
FROM contacts
WHERE user_is_admin() 
   OR created_by = auth.uid() 
   OR user_has_org_access(organization_id)

UNION ALL

SELECT 
    'products',
    COUNT(*)
FROM products
WHERE user_is_admin() 
   OR created_by = auth.uid() 
   OR user_has_org_access(principal_organization_id)

UNION ALL

SELECT 
    'opportunities',
    COUNT(*)
FROM opportunities
WHERE user_is_admin() 
   OR created_by = auth.uid() 
   OR user_has_org_access(organization_id)

UNION ALL

SELECT 
    'interactions',
    COUNT(*)
FROM interactions
WHERE user_is_admin() 
   OR created_by = auth.uid() 
   OR (organization_id IS NOT NULL AND user_has_org_access(organization_id))

UNION ALL

SELECT 
    'principal_distributor_relationships',
    COUNT(*)
FROM principal_distributor_relationships
WHERE user_is_admin() 
   OR user_has_org_access(principal_id) 
   OR user_has_org_access(distributor_id);

-- ============================================================================
-- GRANT PERMISSIONS FOR RLS FUNCTIONS
-- ============================================================================

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION user_has_org_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_accessible_org_ids() TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION user_has_org_access(UUID) IS 'Check if current user has access to specified organization through ownership or data relationships';
COMMENT ON FUNCTION user_is_admin() IS 'Check if current user has admin role based on JWT metadata';
COMMENT ON FUNCTION user_accessible_org_ids() IS 'Get all organization IDs accessible to current user including hierarchical relationships';
COMMENT ON VIEW user_accessible_organizations IS 'Debug view showing organizations accessible to current user with access level';
COMMENT ON VIEW user_data_summary IS 'Debug view showing count of accessible records across all tables for current user';

-- ============================================================================
-- END OF RLS POLICIES MIGRATION
-- ============================================================================