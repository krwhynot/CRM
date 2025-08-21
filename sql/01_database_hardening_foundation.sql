-- Day 1: Database Hardening & Safety Foundation
-- Production-Safe Multi-Principal Opportunity System
-- Based on 2024-2025 PostgreSQL RLS Best Practices

BEGIN;

-- =============================================================================
-- 1. PRIMARY-PER-ROLE RACE PROTECTION (Industry Standard)
-- =============================================================================
-- Prevents concurrent transactions from creating multiple primaries for same role
-- Follows Salesforce Opportunity Teams pattern
CREATE UNIQUE INDEX IF NOT EXISTS uq_opp_primary_per_role 
  ON opportunity_participants (opportunity_id, role) 
  WHERE is_primary;

COMMENT ON INDEX uq_opp_primary_per_role IS 
  'Ensures exactly one primary participant per role per opportunity (race-safe)';

-- =============================================================================
-- 2. RLS WITH CHECK POLICIES (2024-2025 Security Best Practice)
-- =============================================================================
-- Comprehensive CRUD policies with WITH CHECK for write operations
-- Prevents privilege escalation and ensures session-based access control

-- INSERT Policy with WITH CHECK validation
DROP POLICY IF EXISTS "ins_participants_with_check" ON opportunity_participants;
CREATE POLICY "ins_participants_with_check"
  ON opportunity_participants 
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Permission check: user can access the opportunity
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
        AND (
          user_is_admin() 
          OR o.created_by = auth.uid() 
          OR user_has_org_access(o.organization_id)
        )
    )
    -- Business validation: role must be valid
    AND role IN ('customer', 'principal', 'distributor', 'partner')
  );

-- UPDATE Policy with both USING and WITH CHECK
DROP POLICY IF EXISTS "upd_participants_with_check" ON opportunity_participants;
CREATE POLICY "upd_participants_with_check"
  ON opportunity_participants 
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
        AND (
          user_is_admin() 
          OR o.created_by = auth.uid() 
          OR user_has_org_access(o.organization_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
        AND (
          user_is_admin() 
          OR o.created_by = auth.uid() 
          OR user_has_org_access(o.organization_id)
        )
    )
    AND role IN ('customer', 'principal', 'distributor', 'partner')
  );

-- =============================================================================
-- 3. DELETE POLICY (Missing from Original Schema)
-- =============================================================================
-- Completes CRUD security coverage for opportunity_participants
DROP POLICY IF EXISTS "del_participants_via_accessible_opps" ON opportunity_participants;
CREATE POLICY "del_participants_via_accessible_opps"
  ON opportunity_participants 
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
        AND (
          user_is_admin() 
          OR o.created_by = auth.uid() 
          OR user_has_org_access(o.organization_id)
        )
    )
  );

-- =============================================================================
-- 4. BUSINESS INVARIANT: PREVENT ORPHANED CUSTOMERS
-- =============================================================================
-- Ensures every opportunity maintains at least one customer participant
-- Critical business rule for CRM data integrity
CREATE OR REPLACE FUNCTION prevent_orphan_customer()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Check if removing/changing the last customer participant
  IF OLD.role = 'customer' AND (
    -- DELETE operation path
    (TG_OP = 'DELETE' AND NOT EXISTS (
      SELECT 1 FROM opportunity_participants 
      WHERE opportunity_id = OLD.opportunity_id 
        AND role = 'customer' 
        AND id <> OLD.id
    ))
    -- UPDATE operation changing role or demoting primary
    OR (TG_OP = 'UPDATE' AND (
      NEW.role <> 'customer' 
      OR (OLD.is_primary AND NOT NEW.is_primary)
    ) AND NOT EXISTS (
      SELECT 1 FROM opportunity_participants 
      WHERE opportunity_id = OLD.opportunity_id 
        AND role = 'customer' 
        AND id <> OLD.id
        AND (TG_OP = 'UPDATE' OR is_primary)
    ))
  ) THEN
    RAISE EXCEPTION 'Business rule violation: Each opportunity must retain at least one customer participant'
      USING ERRCODE = '23514'; -- check_violation
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END $$;

-- Apply trigger to enforce business invariant
DROP TRIGGER IF EXISTS trg_prevent_orphan_customer ON opportunity_participants;
CREATE TRIGGER trg_prevent_orphan_customer
  BEFORE UPDATE OR DELETE ON opportunity_participants
  FOR EACH ROW 
  EXECUTE FUNCTION prevent_orphan_customer();

COMMENT ON FUNCTION prevent_orphan_customer() IS 
  'Enforces business rule: opportunities must have at least one customer participant';

-- =============================================================================
-- 5. COMMISSION RATE VALIDATION (Production Data Quality)
-- =============================================================================
-- Ensures commission rates are valid fractions (0-1)
-- Prevents data entry errors in financial calculations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'commission_rate_fraction'
  ) THEN
    ALTER TABLE opportunity_participants 
      ADD CONSTRAINT commission_rate_fraction 
      CHECK (
        commission_rate IS NULL 
        OR (commission_rate >= 0 AND commission_rate <= 1)
      );
  END IF;
END $$;

COMMENT ON CONSTRAINT commission_rate_fraction ON opportunity_participants IS 
  'Ensures commission rates are valid fractions between 0 and 1';

-- =============================================================================
-- 6. PERFORMANCE INDEXES FOR PARTICIPANT QUERIES
-- =============================================================================
-- Optimized indexes for common query patterns in multi-principal system
CREATE INDEX IF NOT EXISTS ix_participants_opportunity_role 
  ON opportunity_participants (opportunity_id, role);

CREATE INDEX IF NOT EXISTS ix_participants_org 
  ON opportunity_participants (organization_id);

CREATE INDEX IF NOT EXISTS ix_participants_primary_lookup 
  ON opportunity_participants (opportunity_id, role, is_primary) 
  WHERE is_primary = true;

-- =============================================================================
-- 7. AUDIT AND OBSERVABILITY ENHANCEMENTS
-- =============================================================================
-- Enhanced audit triggers for multi-principal operations
CREATE OR REPLACE FUNCTION audit_participant_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  audit_data jsonb;
BEGIN
  -- Build audit record
  audit_data := jsonb_build_object(
    'table_name', 'opportunity_participants',
    'operation', TG_OP,
    'user_id', auth.uid(),
    'timestamp', now(),
    'opportunity_id', COALESCE(NEW.opportunity_id, OLD.opportunity_id),
    'organization_id', COALESCE(NEW.organization_id, OLD.organization_id),
    'role', COALESCE(NEW.role, OLD.role)
  );

  -- Add operation-specific data
  IF TG_OP = 'INSERT' THEN
    audit_data := audit_data || jsonb_build_object('new_record', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    audit_data := audit_data || jsonb_build_object(
      'old_record', to_jsonb(OLD),
      'new_record', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value) 
        FROM jsonb_each(to_jsonb(NEW)) 
        WHERE value <> (to_jsonb(OLD) ->> key)::jsonb
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    audit_data := audit_data || jsonb_build_object('old_record', to_jsonb(OLD));
  END IF;

  -- Log to PostgreSQL log (visible in Supabase logs)
  RAISE NOTICE 'PARTICIPANT_AUDIT: %', audit_data;

  RETURN COALESCE(NEW, OLD);
END $$;

-- Apply audit trigger
DROP TRIGGER IF EXISTS trg_audit_participants ON opportunity_participants;
CREATE TRIGGER trg_audit_participants
  AFTER INSERT OR UPDATE OR DELETE ON opportunity_participants
  FOR EACH ROW 
  EXECUTE FUNCTION audit_participant_changes();

-- =============================================================================
-- 8. ROLE VALIDATION CONSISTENCY CHECK
-- =============================================================================
-- Ensures participant roles match organization capabilities
-- Links to organization_roles junction table from schema migration
CREATE OR REPLACE FUNCTION validate_participant_role()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Skip validation for customer role (any org can be a customer)
  IF NEW.role = 'customer' THEN
    RETURN NEW;
  END IF;

  -- Validate that organization has the required role capability
  IF NOT EXISTS (
    SELECT 1 FROM organization_roles 
    WHERE organization_id = NEW.organization_id 
      AND role = NEW.role
  ) THEN
    RAISE EXCEPTION 'Organization % does not have % role capability', 
      NEW.organization_id, NEW.role
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  RETURN NEW;
END $$;

-- Apply role validation trigger
DROP TRIGGER IF EXISTS trg_validate_participant_role ON opportunity_participants;
CREATE TRIGGER trg_validate_participant_role
  BEFORE INSERT OR UPDATE ON opportunity_participants
  FOR EACH ROW 
  EXECUTE FUNCTION validate_participant_role();

COMMENT ON FUNCTION validate_participant_role() IS 
  'Ensures participant roles match organization capabilities from organization_roles table';

-- =============================================================================
-- 9. SECURITY VALIDATION FUNCTIONS
-- =============================================================================
-- Helper functions for RLS policies (implement if not exists)
DO $$
BEGIN
  -- Check if user_is_admin function exists
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_is_admin') THEN
    CREATE OR REPLACE FUNCTION user_is_admin()
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY INVOKER
    STABLE
    AS 'SELECT auth.uid() IN (SELECT id FROM auth.users WHERE raw_app_meta_data ->> ''role'' = ''admin'')';
  END IF;

  -- Check if user_has_org_access function exists  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_has_org_access') THEN
    CREATE OR REPLACE FUNCTION user_has_org_access(org_id uuid)
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY INVOKER
    STABLE
    AS 'SELECT EXISTS (
      SELECT 1 FROM organizations o 
      WHERE o.id = org_id 
        AND (o.created_by = auth.uid() OR auth.uid() IN (
          SELECT user_id FROM organization_users WHERE organization_id = org_id
        ))
    )';
  END IF;
END $$;

-- =============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- =============================================================================
-- Update statistics after schema changes for optimal query performance
ANALYZE opportunity_participants;
ANALYZE organizations;
ANALYZE opportunities;

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify hardening is correctly applied:

/*
-- 1. Check unique constraint exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunity_participants' 
  AND indexname = 'uq_opp_primary_per_role';

-- 2. Verify RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'opportunity_participants';

-- 3. Test business constraints
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'opportunity_participants'::regclass 
  AND contype = 'c';

-- 4. Verify triggers are installed
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'opportunity_participants';
*/