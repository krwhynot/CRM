-- ============================================================================
-- KitchenPantry CRM - Relationship Progression Tracking System Rollback
-- Rollback for Migration: 003_relationship_progression_system
-- Description: Removes relationship progression tracking system
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_trust_scores ON trust_activities;
DROP TRIGGER IF EXISTS trigger_update_progression_scores ON relationship_milestones;
DROP TRIGGER IF EXISTS update_relationship_progressions_updated_at ON relationship_progressions;

-- Drop functions
DROP FUNCTION IF EXISTS update_trust_scores();
DROP FUNCTION IF EXISTS update_progression_scores();
DROP FUNCTION IF EXISTS update_relationship_stage(UUID);
DROP FUNCTION IF EXISTS calculate_relationship_maturity_score(UUID);

-- Drop views
DROP VIEW IF EXISTS milestone_progression_timeline;
DROP VIEW IF EXISTS relationship_overview;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS relationship_health_snapshots;
DROP TABLE IF EXISTS communication_patterns;
DROP TABLE IF EXISTS trust_activities;
DROP TABLE IF EXISTS relationship_milestones;
DROP TABLE IF EXISTS relationship_progressions;

-- Drop enum types
DROP TYPE IF EXISTS communication_quality;
DROP TYPE IF EXISTS trust_activity;
DROP TYPE IF EXISTS progression_milestone;
DROP TYPE IF EXISTS relationship_stage;

-- ============================================================================
-- Verification queries (run these after rollback to verify cleanup)
-- ============================================================================
/*
-- Check tables removed
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%relationship%' OR table_name LIKE '%trust%' OR table_name LIKE '%communication%')
ORDER BY table_name;

-- Check enums removed
SELECT enumname FROM pg_type 
WHERE enumname IN ('relationship_stage', 'progression_milestone', 'trust_activity', 'communication_quality');

-- Check views removed
SELECT viewname FROM pg_views WHERE schemaname = 'public' 
AND viewname LIKE '%relationship%'
ORDER BY viewname;

-- Check functions removed
SELECT proname FROM pg_proc WHERE proname LIKE '%relationship%' OR proname LIKE '%trust%';
*/