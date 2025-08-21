-- Day 2: Production-Safe Atomic RPCs
-- Retry-Safe Transaction Functions for Multi-Principal Opportunities
-- Based on 2024-2025 PostgreSQL Best Practices

-- =============================================================================
-- 1. CREATE OPPORTUNITY WITH PARTICIPANTS (Idempotent)
-- =============================================================================
-- Atomic transaction combining opportunity + participants creation
-- Client-generated UUIDs enable retry safety
-- SECURITY INVOKER respects RLS policies
CREATE OR REPLACE FUNCTION create_opportunity_with_participants(
  p_opportunity jsonb,
  p_participants jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth
AS $$
DECLARE 
  v_opp_id uuid;
  v_uid uuid := auth.uid();
  v_participant jsonb;
  v_inserted_count int := 0;
BEGIN
  -- Validation: Ensure user is authenticated
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- Validation: Ensure participants array is not empty
  IF jsonb_array_length(p_participants) = 0 THEN
    RAISE EXCEPTION 'At least one participant is required' USING ERRCODE = '23514';
  END IF;

  -- Extract or generate opportunity ID (idempotent pattern)
  v_opp_id := COALESCE(
    (p_opportunity->>'id')::uuid, 
    gen_random_uuid()
  );

  -- Insert opportunity (ON CONFLICT for retry safety)
  INSERT INTO opportunities (
    id,
    name,
    organization_id,
    stage,
    estimated_value,
    description,
    notes,
    estimated_close_date,
    probability,
    opportunity_context,
    auto_generated_name,
    created_at,
    updated_at,
    created_by,
    updated_by
  ) VALUES (
    v_opp_id,
    p_opportunity->>'name',
    (p_opportunity->>'organization_id')::uuid,
    COALESCE(p_opportunity->>'stage', 'New Lead'),
    COALESCE((p_opportunity->>'estimated_value')::numeric, 0),
    p_opportunity->>'description',
    p_opportunity->>'notes',
    NULLIF(p_opportunity->>'estimated_close_date', '')::date,
    NULLIF(p_opportunity->>'probability', '')::numeric,
    p_opportunity->>'opportunity_context',
    COALESCE((p_opportunity->>'auto_generated_name')::boolean, false),
    now(),
    now(),
    v_uid,
    v_uid
  ) ON CONFLICT (id) DO NOTHING;

  -- Upsert participants (retry-safe with conflict resolution)
  FOR v_participant IN SELECT * FROM jsonb_array_elements(p_participants)
  LOOP
    INSERT INTO opportunity_participants (
      opportunity_id,
      organization_id,
      role,
      is_primary,
      commission_rate,
      territory,
      notes,
      created_at,
      updated_at,
      created_by,
      updated_by
    ) VALUES (
      v_opp_id,
      (v_participant->>'organization_id')::uuid,
      LOWER(v_participant->>'role'),
      COALESCE((v_participant->>'is_primary')::boolean, false),
      NULLIF(v_participant->>'commission_rate', '')::numeric,
      v_participant->>'territory',
      v_participant->>'notes',
      now(),
      now(),
      v_uid,
      v_uid
    ) ON CONFLICT (opportunity_id, organization_id, role) 
    DO UPDATE SET
      is_primary = EXCLUDED.is_primary,
      commission_rate = EXCLUDED.commission_rate,
      territory = EXCLUDED.territory,
      notes = EXCLUDED.notes,
      updated_at = now(),
      updated_by = v_uid;

    v_inserted_count := v_inserted_count + 1;
  END LOOP;

  -- Log successful operation for observability
  RAISE NOTICE 'OPPORTUNITY_CREATED: {"opportunity_id": "%", "participant_count": %, "user_id": "%"}', 
    v_opp_id, v_inserted_count, v_uid;

  RETURN v_opp_id;

EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Invalid organization or contact reference' USING ERRCODE = '23503';
  WHEN check_violation THEN
    RAISE EXCEPTION 'Validation failed: %', SQLERRM USING ERRCODE = '23514';
  WHEN unique_violation THEN
    -- Handle primary-per-role constraint violation
    IF SQLERRM LIKE '%uq_opp_primary_per_role%' THEN
      RAISE EXCEPTION 'Only one primary participant allowed per role' USING ERRCODE = '23505';
    ELSE
      RAISE EXCEPTION 'Duplicate participant: %', SQLERRM USING ERRCODE = '23505';
    END IF;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Operation failed: %', SQLERRM;
END $$;

COMMENT ON FUNCTION create_opportunity_with_participants(jsonb, jsonb) IS 
  'Atomically creates opportunity with participants. Retry-safe with client UUIDs.';

-- =============================================================================
-- 2. SYNC OPPORTUNITY PARTICIPANTS (Full Diff with Atomic Updates)
-- =============================================================================
-- Complete replacement pattern for participant management
-- Handles adds, updates, and removes in single transaction
CREATE OR REPLACE FUNCTION sync_opportunity_participants(
  p_opportunity_id uuid,
  p_participants jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth
AS $$
DECLARE 
  v_uid uuid := auth.uid();
  v_participant jsonb;
  v_upserted_count int := 0;
  v_deleted_count int := 0;
  v_result jsonb;
BEGIN
  -- Validation: Ensure user is authenticated
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- RLS Permission Check: Mirror table policy logic
  IF NOT EXISTS (
    SELECT 1 FROM opportunities o 
    WHERE o.id = p_opportunity_id 
      AND (
        o.created_by = v_uid 
        OR EXISTS (
          SELECT 1 FROM organizations org 
          WHERE org.id = o.organization_id 
            AND org.created_by = v_uid
        )
      )
  ) THEN
    RAISE EXCEPTION 'Not authorized to modify participants for this opportunity' 
      USING ERRCODE = '42501';
  END IF;

  -- Validation: Ensure at least one customer participant
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_participants) p
    WHERE LOWER(p->>'role') = 'customer'
  ) THEN
    RAISE EXCEPTION 'At least one customer participant is required' 
      USING ERRCODE = '23514';
  END IF;

  -- Upsert all provided participants
  FOR v_participant IN SELECT * FROM jsonb_array_elements(p_participants)
  LOOP
    INSERT INTO opportunity_participants (
      opportunity_id,
      organization_id,
      role,
      is_primary,
      commission_rate,
      territory,
      notes,
      created_at,
      updated_at,
      created_by,
      updated_by
    ) VALUES (
      p_opportunity_id,
      (v_participant->>'organization_id')::uuid,
      LOWER(v_participant->>'role'),
      COALESCE((v_participant->>'is_primary')::boolean, false),
      NULLIF(v_participant->>'commission_rate', '')::numeric,
      v_participant->>'territory',
      v_participant->>'notes',
      now(),
      now(),
      v_uid,
      v_uid
    ) ON CONFLICT (opportunity_id, organization_id, role) 
    DO UPDATE SET
      is_primary = EXCLUDED.is_primary,
      commission_rate = EXCLUDED.commission_rate,
      territory = EXCLUDED.territory,
      notes = EXCLUDED.notes,
      updated_at = now(),
      updated_by = v_uid
    WHERE (
      opportunity_participants.is_primary IS DISTINCT FROM EXCLUDED.is_primary
      OR opportunity_participants.commission_rate IS DISTINCT FROM EXCLUDED.commission_rate
      OR opportunity_participants.territory IS DISTINCT FROM EXCLUDED.territory
      OR opportunity_participants.notes IS DISTINCT FROM EXCLUDED.notes
    );

    v_upserted_count := v_upserted_count + 1;
  END LOOP;

  -- Delete participants not in the submitted set (true sync behavior)
  WITH deleted_participants AS (
    DELETE FROM opportunity_participants p
    WHERE p.opportunity_id = p_opportunity_id
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(p_participants) x
        WHERE p.organization_id = (x->>'organization_id')::uuid
          AND p.role = LOWER(x->>'role')
      )
    RETURNING *
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_participants;

  -- Build result summary
  v_result := jsonb_build_object(
    'opportunity_id', p_opportunity_id,
    'upserted_count', v_upserted_count,
    'deleted_count', v_deleted_count,
    'total_participants', (
      SELECT COUNT(*) FROM opportunity_participants 
      WHERE opportunity_id = p_opportunity_id
    ),
    'operation_timestamp', now(),
    'user_id', v_uid
  );

  -- Log operation for observability
  RAISE NOTICE 'PARTICIPANTS_SYNCED: %', v_result;

  RETURN v_result;

EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Invalid organization reference in participants' USING ERRCODE = '23503';
  WHEN check_violation THEN
    RAISE EXCEPTION 'Validation failed: %', SQLERRM USING ERRCODE = '23514';
  WHEN unique_violation THEN
    -- Handle primary-per-role constraint violation
    IF SQLERRM LIKE '%uq_opp_primary_per_role%' THEN
      RAISE EXCEPTION 'Only one primary participant allowed per role' USING ERRCODE = '23505';
    ELSE
      RAISE EXCEPTION 'Duplicate participant: %', SQLERRM USING ERRCODE = '23505';
    END IF;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Sync operation failed: %', SQLERRM;
END $$;

COMMENT ON FUNCTION sync_opportunity_participants(uuid, jsonb) IS 
  'Synchronizes opportunity participants. Performs complete diff: upsert provided, delete missing.';

-- =============================================================================
-- 3. GET OPPORTUNITY WITH PARTICIPANTS (Optimized Read)
-- =============================================================================
-- Single query to fetch opportunity with all participant details
-- Optimized for dashboard and detail views
CREATE OR REPLACE FUNCTION get_opportunity_with_participants(
  p_opportunity_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_result jsonb;
  v_uid uuid := auth.uid();
BEGIN
  -- Validation: Ensure user is authenticated
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- Single query with embedded participants
  SELECT jsonb_build_object(
    'opportunity', to_jsonb(o.*),
    'organization', to_jsonb(org.*),
    'contact', to_jsonb(c.*),
    'participants', COALESCE(participants_agg.participants, '[]'::jsonb)
  ) INTO v_result
  FROM opportunities o
  LEFT JOIN organizations org ON org.id = o.organization_id
  LEFT JOIN contacts c ON c.id = o.contact_id
  LEFT JOIN (
    SELECT 
      p.opportunity_id,
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'role', p.role,
          'is_primary', p.is_primary,
          'commission_rate', p.commission_rate,
          'territory', p.territory,
          'notes', p.notes,
          'organization', jsonb_build_object(
            'id', porg.id,
            'name', porg.name,
            'type', porg.type
          )
        ) ORDER BY 
          CASE p.role 
            WHEN 'customer' THEN 1 
            WHEN 'principal' THEN 2 
            WHEN 'distributor' THEN 3 
            ELSE 4 
          END,
          p.is_primary DESC,
          porg.name
      ) AS participants
    FROM opportunity_participants p
    JOIN organizations porg ON porg.id = p.organization_id
    WHERE p.opportunity_id = p_opportunity_id
    GROUP BY p.opportunity_id
  ) participants_agg ON participants_agg.opportunity_id = o.id
  WHERE o.id = p_opportunity_id
    AND o.deleted_at IS NULL;

  -- Check if opportunity exists and user has access
  IF v_result IS NULL THEN
    -- Check if opportunity exists but user lacks access
    IF EXISTS (SELECT 1 FROM opportunities WHERE id = p_opportunity_id AND deleted_at IS NULL) THEN
      RAISE EXCEPTION 'Access denied to opportunity' USING ERRCODE = '42501';
    ELSE
      RAISE EXCEPTION 'Opportunity not found' USING ERRCODE = '02000';
    END IF;
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to retrieve opportunity: %', SQLERRM;
END $$;

COMMENT ON FUNCTION get_opportunity_with_participants(uuid) IS 
  'Retrieves opportunity with embedded participant details in single query.';

-- =============================================================================
-- 4. VALIDATE OPPORTUNITY PARTICIPANTS (Pre-Save Validation)
-- =============================================================================
-- Comprehensive validation function for client-side use
-- Returns validation errors without attempting saves
CREATE OR REPLACE FUNCTION validate_opportunity_participants(
  p_participants jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_participant jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_role_counts jsonb := '{}'::jsonb;
  v_primary_counts jsonb := '{}'::jsonb;
  v_role text;
  v_org_id uuid;
BEGIN
  -- Validate each participant
  FOR v_participant IN SELECT * FROM jsonb_array_elements(p_participants)
  LOOP
    -- Validate required fields
    IF v_participant->>'organization_id' IS NULL THEN
      v_errors := v_errors || jsonb_build_array('Organization ID is required for all participants');
      CONTINUE;
    END IF;

    IF v_participant->>'role' IS NULL THEN
      v_errors := v_errors || jsonb_build_array('Role is required for all participants');
      CONTINUE;
    END IF;

    -- Extract and validate role
    v_role := LOWER(v_participant->>'role');
    v_org_id := (v_participant->>'organization_id')::uuid;

    -- Validate role is allowed
    IF v_role NOT IN ('customer', 'principal', 'distributor', 'partner') THEN
      v_errors := v_errors || jsonb_build_array(
        format('Invalid role "%s". Must be one of: customer, principal, distributor, partner', v_role)
      );
      CONTINUE;
    END IF;

    -- Validate organization exists
    IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = v_org_id AND deleted_at IS NULL) THEN
      v_errors := v_errors || jsonb_build_array(
        format('Organization %s not found or inactive', v_org_id)
      );
      CONTINUE;
    END IF;

    -- Count participants per role
    v_role_counts := v_role_counts || jsonb_build_object(
      v_role, 
      COALESCE((v_role_counts->>v_role)::int, 0) + 1
    );

    -- Count primaries per role
    IF COALESCE((v_participant->>'is_primary')::boolean, false) THEN
      v_primary_counts := v_primary_counts || jsonb_build_object(
        v_role,
        COALESCE((v_primary_counts->>v_role)::int, 0) + 1
      );
    END IF;

    -- Validate commission rate if provided
    IF v_participant->>'commission_rate' IS NOT NULL THEN
      DECLARE
        v_commission numeric := (v_participant->>'commission_rate')::numeric;
      BEGIN
        IF v_commission < 0 OR v_commission > 1 THEN
          v_errors := v_errors || jsonb_build_array(
            format('Commission rate must be between 0 and 1, got %s', v_commission)
          );
        END IF;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_errors := v_errors || jsonb_build_array(
            format('Invalid commission rate format: %s', v_participant->>'commission_rate')
          );
      END;
    END IF;
  END LOOP;

  -- Business rule validations
  IF COALESCE((v_role_counts->>'customer')::int, 0) = 0 THEN
    v_errors := v_errors || jsonb_build_array('At least one customer participant is required');
  END IF;

  -- Check primary-per-role constraint
  FOR v_role IN SELECT jsonb_object_keys(v_primary_counts)
  LOOP
    IF (v_primary_counts->>v_role)::int > 1 THEN
      v_errors := v_errors || jsonb_build_array(
        format('Only one primary %s participant allowed, found %s', 
          v_role, v_primary_counts->>v_role)
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'valid', jsonb_array_length(v_errors) = 0,
    'errors', v_errors,
    'summary', jsonb_build_object(
      'total_participants', jsonb_array_length(p_participants),
      'role_counts', v_role_counts,
      'primary_counts', v_primary_counts
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'valid', false,
      'errors', jsonb_build_array(format('Validation error: %s', SQLERRM)),
      'summary', '{}'::jsonb
    );
END $$;

COMMENT ON FUNCTION validate_opportunity_participants(jsonb) IS 
  'Validates participant data without saving. Returns validation result with errors.';

-- =============================================================================
-- 5. BULK OPPORTUNITY PARTICIPANTS UPDATE (Batch Operations)
-- =============================================================================
-- Efficiently update multiple opportunities' participants
-- Useful for bulk operations and data migrations
CREATE OR REPLACE FUNCTION bulk_sync_opportunity_participants(
  p_updates jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth
AS $$
DECLARE
  v_update jsonb;
  v_opportunity_id uuid;
  v_participants jsonb;
  v_results jsonb := '[]'::jsonb;
  v_success_count int := 0;
  v_error_count int := 0;
  v_uid uuid := auth.uid();
BEGIN
  -- Validation: Ensure user is authenticated
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- Process each update in the batch
  FOR v_update IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    BEGIN
      v_opportunity_id := (v_update->>'opportunity_id')::uuid;
      v_participants := v_update->'participants';

      -- Delegate to single sync function
      PERFORM sync_opportunity_participants(v_opportunity_id, v_participants);
      
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'opportunity_id', v_opportunity_id,
        'status', 'success',
        'participant_count', jsonb_array_length(v_participants)
      ));
      
      v_success_count := v_success_count + 1;

    EXCEPTION
      WHEN OTHERS THEN
        v_results := v_results || jsonb_build_array(jsonb_build_object(
          'opportunity_id', v_opportunity_id,
          'status', 'error',
          'error_code', SQLSTATE,
          'error_message', SQLERRM
        ));
        
        v_error_count := v_error_count + 1;
    END;
  END LOOP;

  -- Log batch operation summary
  RAISE NOTICE 'BULK_PARTICIPANTS_SYNC: {"total": %, "success": %, "errors": %, "user_id": "%"}',
    jsonb_array_length(p_updates), v_success_count, v_error_count, v_uid;

  RETURN jsonb_build_object(
    'total_updates', jsonb_array_length(p_updates),
    'successful_updates', v_success_count,
    'failed_updates', v_error_count,
    'results', v_results,
    'operation_timestamp', now(),
    'user_id', v_uid
  );
END $$;

COMMENT ON FUNCTION bulk_sync_opportunity_participants(jsonb) IS 
  'Bulk update participants for multiple opportunities. Returns success/error summary.';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
-- Grant execute permissions to authenticated users
-- These functions respect RLS policies internally
GRANT EXECUTE ON FUNCTION create_opportunity_with_participants(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_opportunity_participants(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_opportunity_with_participants(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_opportunity_participants(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_sync_opportunity_participants(jsonb) TO authenticated;