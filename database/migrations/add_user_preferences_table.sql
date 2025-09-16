-- Migration: add_user_preferences_table.sql
-- Description: Create user_preferences table with JSONB support for layout configurations
-- Version: 1.0.0
-- Date: 2025-01-15
-- Dependencies: auth.users table (Supabase Auth)

-- Create user_preferences table for storing layout configurations
CREATE TABLE IF NOT EXISTS user_preferences (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User relationship (required)
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preference identification
  preference_key text NOT NULL,
  preference_value jsonb NOT NULL,

  -- Scoping fields for hierarchical preferences
  scope text DEFAULT 'global' CHECK (scope IN ('global', 'page', 'entity', 'table')),
  entity_type text NULL, -- 'organizations', 'contacts', 'opportunities', 'products', 'interactions'

  -- Audit trail fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Ensure unique preferences per user/key/scope/entity combination
  UNIQUE(user_id, preference_key, scope, entity_type)
);

-- Create indexes for performance optimization

-- Primary lookup pattern: user + scope + entity
CREATE INDEX IF NOT EXISTS idx_user_preferences_lookup
  ON user_preferences (user_id, scope, entity_type);

-- JSONB content indexing for complex layout queries
CREATE INDEX IF NOT EXISTS idx_preference_value_gin
  ON user_preferences USING GIN (preference_value);

-- Shared layouts query optimization
CREATE INDEX IF NOT EXISTS idx_shared_layouts
  ON user_preferences (entity_type, scope)
  WHERE (preference_value->>'isShared')::boolean = true;

-- Recent updates index for cache invalidation
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated
  ON user_preferences (updated_at DESC);

-- Add trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER user_preferences_updated_at_trigger
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_preferences IS 'Stores user layout preferences and configuration data as JSONB for the Layout-as-Data system';
COMMENT ON COLUMN user_preferences.user_id IS 'Reference to auth.users - owner of the preferences';
COMMENT ON COLUMN user_preferences.preference_key IS 'Identifies the type of preference (e.g., page_layout, filter_config, table_config)';
COMMENT ON COLUMN user_preferences.preference_value IS 'JSONB configuration data for layouts, filters, and UI preferences';
COMMENT ON COLUMN user_preferences.scope IS 'Hierarchical scope: global, page, entity, or table level preferences';
COMMENT ON COLUMN user_preferences.entity_type IS 'Business entity type when scope is entity or table (organizations, contacts, etc.)';