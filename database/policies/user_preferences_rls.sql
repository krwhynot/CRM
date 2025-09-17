-- Row Level Security Policies for user_preferences table
-- Description: Implements security model for layout preference access
-- Version: 1.0.0
-- Date: 2025-01-15
-- Dependencies: user_is_admin() and auth.uid() functions

-- Enable Row Level Security on user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can manage their own preferences (CRUD)
-- This policy allows users full access to their own preference records
CREATE POLICY "user_own_preferences_crud"
  ON user_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 2: Read access to shared layouts
-- Users can view shared layouts from other users (read-only)
CREATE POLICY "shared_layouts_read_access"
  ON user_preferences
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()  -- Own preferences
    OR (preference_value->>'isShared')::boolean = true  -- Shared preferences
  );

-- Policy 3: Admin users have full access to all preferences
-- Admins can manage any user's preferences for support/migration purposes
CREATE POLICY "admin_full_access_preferences"
  ON user_preferences
  FOR ALL TO authenticated
  USING (user_is_admin())
  WITH CHECK (user_is_admin());

-- Additional helper functions for layout-specific access patterns

-- Function: Check if user can read a specific layout preference
CREATE OR REPLACE FUNCTION user_can_read_layout_preference(
  target_user_id uuid,
  preference_data jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- User can read their own preferences
  IF target_user_id = auth.uid() THEN
    RETURN true;
  END IF;

  -- User can read shared preferences
  IF (preference_data->>'isShared')::boolean = true THEN
    RETURN true;
  END IF;

  -- Admins can read any preferences
  IF user_is_admin() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Function: Check if user can modify a specific layout preference
CREATE OR REPLACE FUNCTION user_can_modify_layout_preference(
  target_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- User can modify their own preferences
  IF target_user_id = auth.uid() THEN
    RETURN true;
  END IF;

  -- Admins can modify any preferences
  IF user_is_admin() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Add comments for documentation
COMMENT ON POLICY "user_own_preferences_crud" ON user_preferences IS 'Users have full CRUD access to their own layout preferences';
COMMENT ON POLICY "shared_layouts_read_access" ON user_preferences IS 'Users can read shared layout configurations from other users';
COMMENT ON POLICY "admin_full_access_preferences" ON user_preferences IS 'Admin users have full access to all user preferences for support purposes';

COMMENT ON FUNCTION user_can_read_layout_preference IS 'Helper function to check layout preference read permissions';
COMMENT ON FUNCTION user_can_modify_layout_preference IS 'Helper function to check layout preference modify permissions';