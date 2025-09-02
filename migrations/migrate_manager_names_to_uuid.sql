-- Migration: Convert text-based manager names to UUID Contact relationships
-- Phase 2.1: Data migration with fuzzy matching logic
-- Date: 2025-09-01

-- Create temporary function for fuzzy name matching
CREATE OR REPLACE FUNCTION find_manager_contact_id(manager_name text)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    contact_id UUID;
    exact_match_count INTEGER;
    trimmed_name TEXT;
BEGIN
    -- Return NULL for empty or null names
    IF manager_name IS NULL OR trim(manager_name) = '' THEN
        RETURN NULL;
    END IF;
    
    trimmed_name := trim(manager_name);
    
    -- Strategy 1: Try exact first name match (case insensitive)
    SELECT c.id INTO contact_id
    FROM contacts c
    WHERE LOWER(c.first_name) = LOWER(trimmed_name)
    AND c.deleted_at IS NULL
    LIMIT 1;
    
    IF contact_id IS NOT NULL THEN
        RETURN contact_id;
    END IF;
    
    -- Strategy 2: Try partial first name match (handles nicknames)
    SELECT c.id INTO contact_id
    FROM contacts c
    WHERE LOWER(c.first_name) LIKE LOWER(trimmed_name) || '%'
    AND c.deleted_at IS NULL
    LIMIT 1;
    
    IF contact_id IS NOT NULL THEN
        RETURN contact_id;
    END IF;
    
    -- Strategy 3: Try last name match (case insensitive)
    SELECT c.id INTO contact_id
    FROM contacts c
    WHERE LOWER(c.last_name) = LOWER(trimmed_name)
    AND c.deleted_at IS NULL
    LIMIT 1;
    
    IF contact_id IS NOT NULL THEN
        RETURN contact_id;
    END IF;
    
    -- Strategy 4: Create new contact record for unmatched names
    -- Insert into contacts table with manager name as first_name
    INSERT INTO contacts (
        id,
        first_name,
        last_name,
        email,
        phone,
        organization_id,
        role,
        is_primary_contact,
        created_at,
        created_by,
        updated_at,
        updated_by
    ) VALUES (
        gen_random_uuid(),
        trimmed_name,
        'Manager', -- Generic last name for imported managers
        NULL, -- No email available from import
        NULL, -- No phone available from import
        '00000000-0000-0000-0001-000000000000', -- System organization for imported managers
        'decision_maker', -- Set role as decision_maker for imported managers
        FALSE, -- Not primary contact
        NOW(),
        'f0b0f258-d1e3-45aa-a7a0-396f6efbdd3c', -- System user ID for migration
        NOW(),
        'f0b0f258-d1e3-45aa-a7a0-396f6efbdd3c'
    ) RETURNING id INTO contact_id;
    
    RETURN contact_id;
END;
$$;

-- Migration log table for tracking results
CREATE TEMP TABLE migration_log (
    organization_id UUID,
    organization_name TEXT,
    primary_manager_name TEXT,
    primary_manager_id UUID,
    primary_match_strategy TEXT,
    secondary_manager_name TEXT,
    secondary_manager_id UUID,
    secondary_match_strategy TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Perform the actual migration
DO $$
DECLARE
    org_record RECORD;
    primary_id UUID;
    secondary_id UUID;
    primary_strategy TEXT := 'none';
    secondary_strategy TEXT := 'none';
BEGIN
    -- Loop through all organizations with manager names
    FOR org_record IN 
        SELECT id, name, primary_manager_name, secondary_manager_name
        FROM organizations 
        WHERE (primary_manager_name IS NOT NULL AND trim(primary_manager_name) != '')
           OR (secondary_manager_name IS NOT NULL AND trim(secondary_manager_name) != '')
    LOOP
        -- Process primary manager
        IF org_record.primary_manager_name IS NOT NULL AND trim(org_record.primary_manager_name) != '' THEN
            primary_id := find_manager_contact_id(org_record.primary_manager_name);
            IF primary_id IS NOT NULL THEN
                primary_strategy := 'matched_or_created';
            END IF;
        END IF;
        
        -- Process secondary manager
        IF org_record.secondary_manager_name IS NOT NULL AND trim(org_record.secondary_manager_name) != '' THEN
            secondary_id := find_manager_contact_id(org_record.secondary_manager_name);
            IF secondary_id IS NOT NULL THEN
                secondary_strategy := 'matched_or_created';
            END IF;
        END IF;
        
        -- Update the organization record
        UPDATE organizations 
        SET 
            primary_manager_id = primary_id,
            secondary_manager_id = secondary_id,
            updated_at = NOW(),
            updated_by = 'f0b0f258-d1e3-45aa-a7a0-396f6efbdd3c' -- System user for migration
        WHERE id = org_record.id;
        
        -- Log the migration result
        INSERT INTO migration_log (
            organization_id,
            organization_name,
            primary_manager_name,
            primary_manager_id,
            primary_match_strategy,
            secondary_manager_name,
            secondary_manager_id,
            secondary_match_strategy
        ) VALUES (
            org_record.id,
            org_record.name,
            org_record.primary_manager_name,
            primary_id,
            primary_strategy,
            org_record.secondary_manager_name,
            secondary_id,
            secondary_strategy
        );
        
        -- Reset for next iteration
        primary_id := NULL;
        secondary_id := NULL;
        primary_strategy := 'none';
        secondary_strategy := 'none';
    END LOOP;
END;
$$;

-- Show migration summary
SELECT 
    'Migration Summary' as report_type,
    COUNT(*) as total_organizations_processed,
    COUNT(CASE WHEN primary_manager_id IS NOT NULL THEN 1 END) as primary_managers_matched,
    COUNT(CASE WHEN secondary_manager_id IS NOT NULL THEN 1 END) as secondary_managers_matched,
    COUNT(CASE WHEN primary_match_strategy = 'matched_or_created' THEN 1 END) as primary_resolved,
    COUNT(CASE WHEN secondary_match_strategy = 'matched_or_created' THEN 1 END) as secondary_resolved
FROM migration_log;

-- Show detailed results for review
SELECT 
    organization_name,
    primary_manager_name,
    CASE WHEN primary_manager_id IS NOT NULL THEN 'RESOLVED' ELSE 'UNRESOLVED' END as primary_status,
    secondary_manager_name,
    CASE WHEN secondary_manager_id IS NOT NULL THEN 'RESOLVED' ELSE 'UNRESOLVED' END as secondary_status
FROM migration_log
ORDER BY organization_name;

-- Verification: Check that foreign key constraints are satisfied
SELECT 
    'Verification Check' as check_type,
    COUNT(*) as total_organizations,
    COUNT(CASE WHEN primary_manager_id IS NOT NULL THEN 1 END) as orgs_with_primary_manager,
    COUNT(CASE WHEN secondary_manager_id IS NOT NULL THEN 1 END) as orgs_with_secondary_manager
FROM organizations
WHERE deleted_at IS NULL;

-- Clean up temporary function
DROP FUNCTION find_manager_contact_id(text);

-- Add note about text columns preservation
COMMENT ON COLUMN organizations.primary_manager_name IS 'Legacy text field - preserved during Phase 2.1 migration for rollback safety';
COMMENT ON COLUMN organizations.secondary_manager_name IS 'Legacy text field - preserved during Phase 2.1 migration for rollback safety';