-- Migration: Fix 406 PostgREST errors in organizations table
-- Date: 2025-01-09
-- Purpose: Add normalized name column and optimize unique constraints to prevent 406 errors

BEGIN;

-- Step 1: Add name_normalized column as a generated column for consistent case-insensitive matching
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS name_normalized text 
GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED;

-- Step 2: Create index on normalized name for performance
CREATE INDEX IF NOT EXISTS idx_organizations_name_normalized 
ON organizations(name_normalized) 
WHERE deleted_at IS NULL;

-- Step 3: Remove duplicate unique constraint (keep the more descriptive one)
-- We have both 'idx_organizations_unique_name_type_active' and 'unique_organization_name_type_active'
-- Drop the less descriptive one
DROP INDEX IF EXISTS idx_organizations_unique_name_type_active;

-- Step 4: Create a new unique constraint using the normalized name to prevent case-sensitivity issues
CREATE UNIQUE INDEX IF NOT EXISTS unique_organization_name_normalized_type_active 
ON organizations(name_normalized, type) 
WHERE deleted_at IS NULL;

-- Step 5: Update the search_tsv column to include normalized name for better full-text search
-- This helps with case-insensitive search across all text fields
DROP TRIGGER IF EXISTS update_organizations_search_tsv ON organizations;
DROP FUNCTION IF EXISTS update_organizations_search_tsv();

CREATE OR REPLACE FUNCTION update_organizations_search_tsv() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.name_normalized, '')), 'A') ||
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

-- Step 6: Update existing records to populate the search_tsv with new logic
UPDATE organizations 
SET updated_at = updated_at 
WHERE deleted_at IS NULL;

-- Step 7: Add helpful comment for future developers
COMMENT ON COLUMN organizations.name_normalized IS 
'Normalized version of name (lowercase, trimmed) for case-insensitive matching and preventing 406 PostgREST errors';

COMMENT ON INDEX unique_organization_name_normalized_type_active IS 
'Ensures unique organizations by normalized name and type, preventing 406 errors from case sensitivity issues';

COMMIT;