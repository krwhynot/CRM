-- Rollback Migration: Fix 406 PostgREST errors in organizations table
-- Date: 2025-01-09
-- Purpose: Rollback changes made by 20250109_fix_organizations_406_errors.sql

BEGIN;

-- Step 1: Drop the new search trigger and function
DROP TRIGGER IF EXISTS update_organizations_search_tsv ON organizations;
DROP FUNCTION IF EXISTS update_organizations_search_tsv();

-- Step 2: Recreate the original search function (without name_normalized)
CREATE OR REPLACE FUNCTION update_organizations_search_tsv() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.type::text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.segment, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.state_province, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.primary_manager_name, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.secondary_manager_name, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_search_tsv 
  BEFORE INSERT OR UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_organizations_search_tsv();

-- Step 3: Drop the new normalized unique constraint
DROP INDEX IF EXISTS unique_organization_name_normalized_type_active;

-- Step 4: Recreate the original unique constraint that was dropped
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_unique_name_type_active 
ON organizations(name, type) 
WHERE deleted_at IS NULL;

-- Step 5: Drop the normalized name index
DROP INDEX IF EXISTS idx_organizations_name_normalized;

-- Step 6: Drop the normalized name column
ALTER TABLE organizations 
DROP COLUMN IF EXISTS name_normalized;

-- Step 7: Update existing records to restore original search_tsv
UPDATE organizations 
SET updated_at = updated_at 
WHERE deleted_at IS NULL;

COMMIT;