-- Migration: Enhance interactions table with priority, account manager, and multiple principals
-- Created: 2025-01-07
-- Purpose: Add comprehensive interaction tracking fields to match user spreadsheet data

BEGIN;

-- Add interaction priority enum
CREATE TYPE interaction_priority AS ENUM ('A+', 'A', 'B', 'C', 'D');

-- Add account manager field and priority to interactions table
ALTER TABLE interactions 
ADD COLUMN priority interaction_priority,
ADD COLUMN account_manager TEXT,
ADD COLUMN principals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN import_notes TEXT;

-- Update interaction_type enum to include user's specific types
ALTER TYPE interaction_type ADD VALUE IF NOT EXISTS 'in_person';
ALTER TYPE interaction_type ADD VALUE IF NOT EXISTS 'quoted';  
ALTER TYPE interaction_type ADD VALUE IF NOT EXISTS 'distribution';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interactions_priority ON interactions(priority) WHERE priority IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interactions_account_manager ON interactions(account_manager) WHERE account_manager IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interactions_principals ON interactions USING gin(principals) WHERE principals IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN interactions.priority IS 'Interaction priority level: A+ (highest) to D (lowest)';
COMMENT ON COLUMN interactions.account_manager IS 'Name of account manager responsible (Sue, Gary, Dale, etc.)';
COMMENT ON COLUMN interactions.principals IS 'Array of principal organizations involved in this interaction';
COMMENT ON COLUMN interactions.import_notes IS 'Notes from data import/migration process';

-- Update the trigger to handle new fields
CREATE OR REPLACE FUNCTION update_interactions_search_tsv() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_tsv := 
        setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.follow_up_notes, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.account_manager, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.import_notes, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;