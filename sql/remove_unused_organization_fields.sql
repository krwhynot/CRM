-- Remove unused fields from organizations table
-- Migration: remove_unused_organization_fields
-- Date: 2025-01-27
-- 
-- Fields being removed: size, annual_revenue, employee_count
-- These fields are not used in the application and are being removed to simplify the schema

BEGIN;

-- Drop the columns from the organizations table
ALTER TABLE organizations DROP COLUMN IF EXISTS size;
ALTER TABLE organizations DROP COLUMN IF EXISTS annual_revenue;
ALTER TABLE organizations DROP COLUMN IF EXISTS employee_count;

-- Drop the organization_size enum type since it's no longer needed
DROP TYPE IF EXISTS organization_size;

COMMIT;

-- Rollback script (if needed):
-- BEGIN;
-- 
-- -- Recreate the enum type
-- CREATE TYPE organization_size AS ENUM ('small', 'medium', 'large', 'enterprise');
-- 
-- -- Add the columns back
-- ALTER TABLE organizations ADD COLUMN size organization_size;
-- ALTER TABLE organizations ADD COLUMN annual_revenue NUMERIC(15,2);
-- ALTER TABLE organizations ADD COLUMN employee_count INTEGER;
-- 
-- COMMIT;