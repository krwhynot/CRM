-- Migration: Handle duplicate organizations before applying normalization
-- Date: 2025-01-09
-- Purpose: Merge duplicate organizations with intelligent data consolidation

BEGIN;

-- Step 1: Create a temporary table to track duplicates and their consolidation
CREATE TEMP TABLE duplicate_organizations AS
SELECT 
  LOWER(TRIM(name)) as name_normalized,
  type,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at) as organization_ids,
  ARRAY_AGG(name ORDER BY created_at) as original_names,
  MIN(created_at) as earliest_created,
  MAX(updated_at) as latest_updated
FROM organizations 
WHERE deleted_at IS NULL
GROUP BY LOWER(TRIM(name)), type
HAVING COUNT(*) > 1;

-- Step 2: For each set of duplicates, keep the oldest record and merge data from newer ones
DO $$
DECLARE
  dup_record RECORD;
  primary_id UUID;
  secondary_ids UUID[];
  merged_notes TEXT;
  merged_import_notes TEXT;
  merged_primary_manager TEXT;
  merged_secondary_manager TEXT;
BEGIN
  FOR dup_record IN SELECT * FROM duplicate_organizations LOOP
    -- The first ID (oldest) becomes the primary record
    primary_id := dup_record.organization_ids[1];
    secondary_ids := dup_record.organization_ids[2:];
    
    RAISE NOTICE 'Processing duplicates for: % (%) - Primary ID: %, Secondary IDs: %', 
      dup_record.name_normalized, dup_record.type, primary_id, secondary_ids;
    
    -- Gather data from all duplicate records to merge
    SELECT 
      STRING_AGG(DISTINCT notes, ' | ' ORDER BY notes) FILTER (WHERE notes IS NOT NULL),
      STRING_AGG(DISTINCT import_notes, ' | ' ORDER BY import_notes) FILTER (WHERE import_notes IS NOT NULL),
      STRING_AGG(DISTINCT primary_manager_name, ', ' ORDER BY primary_manager_name) FILTER (WHERE primary_manager_name IS NOT NULL),
      STRING_AGG(DISTINCT secondary_manager_name, ', ' ORDER BY secondary_manager_name) FILTER (WHERE secondary_manager_name IS NOT NULL)
    INTO merged_notes, merged_import_notes, merged_primary_manager, merged_secondary_manager
    FROM organizations 
    WHERE id = ANY(dup_record.organization_ids) AND deleted_at IS NULL;
    
    -- Update the primary record with merged data
    UPDATE organizations 
    SET 
      notes = CASE 
        WHEN merged_notes IS NOT NULL AND LENGTH(merged_notes) > 0 
        THEN COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN ' | ' ELSE '' END || 'MERGED: ' || merged_notes
        ELSE notes 
      END,
      import_notes = CASE 
        WHEN merged_import_notes IS NOT NULL AND LENGTH(merged_import_notes) > 0 
        THEN COALESCE(import_notes, '') || CASE WHEN import_notes IS NOT NULL THEN ' | ' ELSE '' END || 'MERGED: ' || merged_import_notes
        ELSE import_notes 
      END,
      primary_manager_name = COALESCE(primary_manager_name, merged_primary_manager),
      secondary_manager_name = COALESCE(secondary_manager_name, merged_secondary_manager),
      updated_at = dup_record.latest_updated
    WHERE id = primary_id;
    
    -- Soft delete the duplicate records (preserve data for audit trail)
    UPDATE organizations 
    SET 
      deleted_at = NOW(),
      updated_at = NOW(),
      notes = COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN ' | ' ELSE '' END || 
              'MERGED INTO: ' || primary_id::text || ' on ' || NOW()::text
    WHERE id = ANY(secondary_ids) AND deleted_at IS NULL;
    
    RAISE NOTICE 'Merged % duplicate records into primary record %', array_length(secondary_ids, 1), primary_id;
  END LOOP;
END $$;

-- Step 3: Verify no duplicates remain
DO $$
DECLARE
  remaining_duplicates INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_duplicates
  FROM (
    SELECT LOWER(TRIM(name)), type, COUNT(*)
    FROM organizations 
    WHERE deleted_at IS NULL
    GROUP BY LOWER(TRIM(name)), type
    HAVING COUNT(*) > 1
  ) AS dups;
  
  IF remaining_duplicates > 0 THEN
    RAISE EXCEPTION 'Still have % duplicate groups after merge process', remaining_duplicates;
  END IF;
  
  RAISE NOTICE 'Duplicate merge completed successfully. No remaining duplicates found.';
END $$;

-- Step 4: Add audit log entry
INSERT INTO organizations (
  name, 
  type, 
  segment, 
  notes, 
  created_by, 
  updated_by,
  deleted_at  -- Create as already deleted for audit purposes
) 
SELECT 
  'AUDIT_DUPLICATE_MERGE_' || NOW()::date,
  'audit',
  'System',
  'Duplicate organization merge completed. Processed ' || COUNT(*) || ' duplicate groups.',
  (SELECT id FROM auth.users LIMIT 1),  -- Use first available user for system operations
  (SELECT id FROM auth.users LIMIT 1),
  NOW()  -- Immediately mark as deleted (audit record only)
FROM duplicate_organizations;

COMMIT;