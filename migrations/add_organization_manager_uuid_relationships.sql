-- Migration: Add UUID manager relationships to organizations table
-- Phase 2.1: Convert text-based manager names to proper Contact entity relationships
-- Date: 2025-09-01

-- Add UUID columns for manager relationships
ALTER TABLE organizations 
ADD COLUMN primary_manager_id UUID,
ADD COLUMN secondary_manager_id UUID;

-- Add foreign key constraints to contacts table
-- Using ON DELETE SET NULL to prevent orphaned organizations if a manager contact is deleted
ALTER TABLE organizations
ADD CONSTRAINT fk_organizations_primary_manager 
  FOREIGN KEY (primary_manager_id) 
  REFERENCES contacts(id) 
  ON DELETE SET NULL,
ADD CONSTRAINT fk_organizations_secondary_manager 
  FOREIGN KEY (secondary_manager_id) 
  REFERENCES contacts(id) 
  ON DELETE SET NULL;

-- Add indexes for performance on manager lookups
CREATE INDEX idx_organizations_primary_manager_id ON organizations(primary_manager_id);
CREATE INDEX idx_organizations_secondary_manager_id ON organizations(secondary_manager_id);

-- Add composite index for queries filtering by both managers
CREATE INDEX idx_organizations_managers ON organizations(primary_manager_id, secondary_manager_id);

-- Add comments for documentation
COMMENT ON COLUMN organizations.primary_manager_id IS 'UUID reference to primary manager contact (Phase 2.1 enhancement)';
COMMENT ON COLUMN organizations.secondary_manager_id IS 'UUID reference to secondary manager contact (Phase 2.1 enhancement)';

-- Note: Keeping existing primary_manager_name and secondary_manager_name columns 
-- during transition period for rollback safety and gradual migration