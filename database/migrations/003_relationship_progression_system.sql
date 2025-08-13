-- ============================================================================
-- KitchenPantry CRM - Relationship Progression Tracking System
-- Migration: 003_relationship_progression_system
-- Description: Partnership-focused relationship milestone and progression tracking
-- ============================================================================

-- ============================================================================
-- ENUM Types for Relationship Progression
-- ============================================================================

-- Partnership stages focused on relationship building rather than deal values
CREATE TYPE relationship_stage AS ENUM (
    'initial_contact',      -- First meaningful interaction
    'trust_building',       -- Active engagement, learning about each other
    'partnership_deepening', -- Multiple touchpoints, strategic conversations
    'strategic_collaboration' -- Long-term partnership, joint planning
);

-- Relationship progression milestones
CREATE TYPE progression_milestone AS ENUM (
    'first_contact',           -- Initial contact established
    'contact_response',        -- First positive response received
    'meeting_scheduled',       -- First meeting/call scheduled
    'meeting_completed',       -- First meeting/call completed
    'stakeholder_introduction', -- Introduction to additional stakeholders
    'needs_assessment',        -- Understanding of needs/challenges completed
    'solution_presentation',   -- Solution/capability presentation made
    'site_visit_requested',    -- Customer requests site visit
    'site_visit_completed',    -- Site visit completed
    'strategic_discussion',    -- Strategic planning conversation held
    'partnership_proposal',    -- Formal partnership discussion initiated
    'trial_program',          -- Trial/pilot program established
    'contract_discussion',     -- Contract terms discussion
    'partnership_established'  -- Formal partnership agreement
);

-- Trust building activity types
CREATE TYPE trust_activity AS ENUM (
    'knowledge_sharing',       -- Sharing industry insights/knowledge
    'problem_solving',         -- Helping solve customer challenges
    'relationship_building',   -- Social/relationship activities
    'strategic_planning',      -- Joint strategic planning
    'capability_demonstration', -- Demonstrating capabilities/expertise
    'reference_providing',     -- Providing references/testimonials
    'market_intelligence',     -- Sharing market insights
    'educational_content'      -- Providing educational resources
);

-- Communication quality indicators
CREATE TYPE communication_quality AS ENUM (
    'minimal',     -- Basic acknowledgment
    'responsive',  -- Timely responses
    'engaged',     -- Active participation in discussions
    'collaborative', -- Proactive collaboration
    'strategic'    -- Strategic partnership discussions
);

-- ============================================================================
-- Core Relationship Progression Tables
-- ============================================================================

-- Relationship progression tracking (one per organization relationship)
CREATE TABLE relationship_progressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    current_stage relationship_stage NOT NULL DEFAULT 'initial_contact',
    relationship_maturity_score INTEGER DEFAULT 0 CHECK (relationship_maturity_score >= 0 AND relationship_maturity_score <= 100),
    trust_level_score INTEGER DEFAULT 0 CHECK (trust_level_score >= 0 AND trust_level_score <= 100),
    communication_frequency_score INTEGER DEFAULT 0 CHECK (communication_frequency_score >= 0 AND communication_frequency_score <= 100),
    stakeholder_engagement_score INTEGER DEFAULT 0 CHECK (stakeholder_engagement_score >= 0 AND stakeholder_engagement_score <= 100),
    product_portfolio_depth_score INTEGER DEFAULT 0 CHECK (product_portfolio_depth_score >= 0 AND product_portfolio_depth_score <= 100),
    
    -- Partnership health indicators
    partnership_resilience_score INTEGER DEFAULT 0 CHECK (partnership_resilience_score >= 0 AND partnership_resilience_score <= 100),
    strategic_value_score INTEGER DEFAULT 0 CHECK (strategic_value_score >= 0 AND strategic_value_score <= 100),
    
    -- Timeline tracking
    first_contact_date TIMESTAMPTZ,
    last_milestone_date TIMESTAMPTZ,
    last_interaction_date TIMESTAMPTZ,
    last_progression_update TIMESTAMPTZ DEFAULT NOW(),
    
    -- Communication tracking
    total_interactions_count INTEGER DEFAULT 0,
    response_time_avg_hours DECIMAL(8,2),
    response_quality communication_quality DEFAULT 'minimal',
    
    -- Stakeholder expansion tracking
    contacts_engaged_count INTEGER DEFAULT 0,
    decision_makers_engaged_count INTEGER DEFAULT 0,
    
    -- Product engagement tracking
    products_discussed_count INTEGER DEFAULT 0,
    product_categories_engaged INTEGER DEFAULT 0,
    
    -- Notes and observations
    relationship_notes TEXT,
    strategic_insights TEXT,
    growth_opportunities TEXT,
    risk_factors TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Partnership milestones achieved (tracking progression history)
CREATE TABLE relationship_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    relationship_progression_id UUID NOT NULL REFERENCES relationship_progressions(id) ON DELETE CASCADE,
    milestone progression_milestone NOT NULL,
    achieved_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Context about milestone achievement
    interaction_id UUID REFERENCES interactions(id),
    contact_id UUID REFERENCES contacts(id),
    opportunity_id UUID REFERENCES opportunities(id),
    
    -- Details about the milestone
    milestone_description TEXT,
    impact_assessment TEXT,
    next_steps TEXT,
    significance_score INTEGER DEFAULT 1 CHECK (significance_score >= 1 AND significance_score <= 5),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Prevent duplicate milestones for same relationship
    UNIQUE(relationship_progression_id, milestone)
);

-- Trust building activities log
CREATE TABLE trust_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    relationship_progression_id UUID NOT NULL REFERENCES relationship_progressions(id) ON DELETE CASCADE,
    activity_type trust_activity NOT NULL,
    activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Activity details
    title TEXT NOT NULL,
    description TEXT,
    outcome_description TEXT,
    impact_on_trust INTEGER DEFAULT 0 CHECK (impact_on_trust >= -5 AND impact_on_trust <= 5),
    
    -- Related entities
    interaction_id UUID REFERENCES interactions(id),
    contact_id UUID REFERENCES contacts(id),
    opportunity_id UUID REFERENCES opportunities(id),
    
    -- Tracking
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Communication pattern analysis (aggregated metrics)
CREATE TABLE communication_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    relationship_progression_id UUID NOT NULL REFERENCES relationship_progressions(id) ON DELETE CASCADE,
    analysis_period_start TIMESTAMPTZ NOT NULL,
    analysis_period_end TIMESTAMPTZ NOT NULL,
    
    -- Communication frequency metrics
    total_interactions INTEGER DEFAULT 0,
    customer_initiated_interactions INTEGER DEFAULT 0,
    our_initiated_interactions INTEGER DEFAULT 0,
    avg_response_time_hours DECIMAL(8,2),
    
    -- Communication quality metrics
    quality_improvement_trend INTEGER DEFAULT 0 CHECK (quality_improvement_trend >= -5 AND quality_improvement_trend <= 5),
    engagement_depth_score INTEGER DEFAULT 0 CHECK (engagement_depth_score >= 0 AND engagement_depth_score <= 100),
    
    -- Meeting progression tracking
    calls_count INTEGER DEFAULT 0,
    demos_count INTEGER DEFAULT 0,
    meetings_count INTEGER DEFAULT 0,
    site_visits_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Relationship health snapshots (periodic assessments)
CREATE TABLE relationship_health_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    relationship_progression_id UUID NOT NULL REFERENCES relationship_progressions(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Health scores at time of snapshot
    overall_health_score INTEGER NOT NULL CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
    trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
    engagement_score INTEGER NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
    growth_potential_score INTEGER NOT NULL CHECK (growth_potential_score >= 0 AND growth_potential_score <= 100),
    
    -- Qualitative assessment
    health_status TEXT, -- 'excellent', 'good', 'fair', 'at_risk', 'critical'
    primary_strengths TEXT[],
    areas_for_improvement TEXT[],
    recommended_actions TEXT[],
    
    -- Risk assessment
    risk_level INTEGER DEFAULT 1 CHECK (risk_level >= 1 AND risk_level <= 5),
    risk_factors TEXT[],
    mitigation_strategies TEXT[],
    
    -- Analyst notes
    analyst_notes TEXT,
    confidence_level INTEGER DEFAULT 5 CHECK (confidence_level >= 1 AND confidence_level <= 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Relationship progressions indexes
CREATE INDEX idx_relationship_progressions_organization ON relationship_progressions(organization_id);
CREATE INDEX idx_relationship_progressions_stage ON relationship_progressions(current_stage);
CREATE INDEX idx_relationship_progressions_maturity ON relationship_progressions(relationship_maturity_score);
CREATE INDEX idx_relationship_progressions_active ON relationship_progressions(is_active) WHERE is_active = true;
CREATE INDEX idx_relationship_progressions_last_interaction ON relationship_progressions(last_interaction_date);

-- Relationship milestones indexes
CREATE INDEX idx_relationship_milestones_progression ON relationship_milestones(relationship_progression_id);
CREATE INDEX idx_relationship_milestones_type ON relationship_milestones(milestone);
CREATE INDEX idx_relationship_milestones_date ON relationship_milestones(achieved_date);
CREATE INDEX idx_relationship_milestones_interaction ON relationship_milestones(interaction_id);

-- Trust activities indexes
CREATE INDEX idx_trust_activities_progression ON trust_activities(relationship_progression_id);
CREATE INDEX idx_trust_activities_type ON trust_activities(activity_type);
CREATE INDEX idx_trust_activities_date ON trust_activities(activity_date);
CREATE INDEX idx_trust_activities_impact ON trust_activities(impact_on_trust);

-- Communication patterns indexes
CREATE INDEX idx_communication_patterns_progression ON communication_patterns(relationship_progression_id);
CREATE INDEX idx_communication_patterns_period ON communication_patterns(analysis_period_start, analysis_period_end);

-- Relationship health snapshots indexes
CREATE INDEX idx_relationship_health_progression ON relationship_health_snapshots(relationship_progression_id);
CREATE INDEX idx_relationship_health_date ON relationship_health_snapshots(snapshot_date);
CREATE INDEX idx_relationship_health_overall ON relationship_health_snapshots(overall_health_score);

-- ============================================================================
-- Triggers for automatic updated_at timestamps
-- ============================================================================

CREATE TRIGGER update_relationship_progressions_updated_at 
    BEFORE UPDATE ON relationship_progressions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Views for Relationship Analysis
-- ============================================================================

-- Comprehensive relationship overview with latest metrics
CREATE VIEW relationship_overview AS
SELECT 
    rp.*,
    o.name as organization_name,
    o.type as organization_type,
    COUNT(DISTINCT rm.id) as milestones_achieved,
    COUNT(DISTINCT ta.id) as trust_activities_count,
    AVG(rhs.overall_health_score) as avg_health_score,
    MAX(rhs.snapshot_date) as last_health_assessment
FROM relationship_progressions rp
LEFT JOIN organizations o ON rp.organization_id = o.id
LEFT JOIN relationship_milestones rm ON rp.id = rm.relationship_progression_id
LEFT JOIN trust_activities ta ON rp.id = ta.relationship_progression_id
LEFT JOIN relationship_health_snapshots rhs ON rp.id = rhs.relationship_progression_id
WHERE rp.is_active = true
GROUP BY rp.id, o.name, o.type;

-- Milestone progression timeline view
CREATE VIEW milestone_progression_timeline AS
SELECT 
    rm.relationship_progression_id,
    o.name as organization_name,
    rm.milestone,
    rm.achieved_date,
    rm.significance_score,
    LEAD(rm.milestone) OVER (PARTITION BY rm.relationship_progression_id ORDER BY rm.achieved_date) as next_milestone,
    LEAD(rm.achieved_date) OVER (PARTITION BY rm.relationship_progression_id ORDER BY rm.achieved_date) - rm.achieved_date as time_to_next_milestone
FROM relationship_milestones rm
JOIN relationship_progressions rp ON rm.relationship_progression_id = rp.id
JOIN organizations o ON rp.organization_id = o.id
ORDER BY rm.relationship_progression_id, rm.achieved_date;

-- ============================================================================
-- Functions for Relationship Progression Calculations
-- ============================================================================

-- Function to calculate relationship maturity score based on milestones and activities
CREATE OR REPLACE FUNCTION calculate_relationship_maturity_score(progression_id UUID)
RETURNS INTEGER AS $$
DECLARE
    milestone_score INTEGER := 0;
    activity_score INTEGER := 0;
    communication_score INTEGER := 0;
    final_score INTEGER := 0;
BEGIN
    -- Calculate milestone-based score (0-40 points)
    SELECT COALESCE(SUM(
        CASE rm.milestone
            WHEN 'first_contact' THEN 2
            WHEN 'contact_response' THEN 3
            WHEN 'meeting_scheduled' THEN 4
            WHEN 'meeting_completed' THEN 5
            WHEN 'stakeholder_introduction' THEN 6
            WHEN 'needs_assessment' THEN 7
            WHEN 'solution_presentation' THEN 8
            WHEN 'site_visit_requested' THEN 4
            WHEN 'site_visit_completed' THEN 8
            WHEN 'strategic_discussion' THEN 10
            WHEN 'partnership_proposal' THEN 12
            WHEN 'trial_program' THEN 15
            WHEN 'contract_discussion' THEN 18
            WHEN 'partnership_established' THEN 25
            ELSE 1
        END
    ), 0)
    INTO milestone_score
    FROM relationship_milestones rm
    WHERE rm.relationship_progression_id = progression_id;
    
    -- Cap milestone score at 40
    milestone_score := LEAST(milestone_score, 40);
    
    -- Calculate trust activity score (0-30 points)
    SELECT COALESCE(COUNT(*) * 2, 0)
    INTO activity_score
    FROM trust_activities ta
    WHERE ta.relationship_progression_id = progression_id
    AND ta.impact_on_trust > 0;
    
    -- Cap activity score at 30
    activity_score := LEAST(activity_score, 30);
    
    -- Calculate communication score (0-30 points)
    SELECT COALESCE(
        (contacts_engaged_count * 5) + 
        (CASE WHEN response_quality = 'strategic' THEN 15
              WHEN response_quality = 'collaborative' THEN 12
              WHEN response_quality = 'engaged' THEN 8
              WHEN response_quality = 'responsive' THEN 5
              ELSE 2 END),
        0)
    INTO communication_score
    FROM relationship_progressions
    WHERE id = progression_id;
    
    -- Cap communication score at 30
    communication_score := LEAST(communication_score, 30);
    
    -- Calculate final score
    final_score := milestone_score + activity_score + communication_score;
    
    -- Ensure score is between 0-100
    final_score := LEAST(GREATEST(final_score, 0), 100);
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update relationship stage based on milestones
CREATE OR REPLACE FUNCTION update_relationship_stage(progression_id UUID)
RETURNS relationship_stage AS $$
DECLARE
    new_stage relationship_stage;
    milestone_count INTEGER;
    strategic_milestones INTEGER;
BEGIN
    -- Count total milestones achieved
    SELECT COUNT(*) INTO milestone_count
    FROM relationship_milestones
    WHERE relationship_progression_id = progression_id;
    
    -- Count strategic milestones
    SELECT COUNT(*) INTO strategic_milestones
    FROM relationship_milestones
    WHERE relationship_progression_id = progression_id
    AND milestone IN ('strategic_discussion', 'partnership_proposal', 'trial_program', 'contract_discussion', 'partnership_established');
    
    -- Determine stage based on milestone patterns
    IF strategic_milestones >= 2 THEN
        new_stage := 'strategic_collaboration';
    ELSIF milestone_count >= 8 THEN
        new_stage := 'partnership_deepening';
    ELSIF milestone_count >= 4 THEN
        new_stage := 'trust_building';
    ELSE
        new_stage := 'initial_contact';
    END IF;
    
    -- Update the progression record
    UPDATE relationship_progressions 
    SET current_stage = new_stage,
        last_progression_update = NOW()
    WHERE id = progression_id;
    
    RETURN new_stage;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers for Automatic Score Updates
-- ============================================================================

-- Function to automatically update progression scores when milestones are added
CREATE OR REPLACE FUNCTION update_progression_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Update maturity score
    UPDATE relationship_progressions
    SET relationship_maturity_score = calculate_relationship_maturity_score(NEW.relationship_progression_id),
        last_milestone_date = NEW.achieved_date,
        updated_at = NOW()
    WHERE id = NEW.relationship_progression_id;
    
    -- Update relationship stage
    PERFORM update_relationship_stage(NEW.relationship_progression_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progression_scores
    AFTER INSERT ON relationship_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_progression_scores();

-- Function to update progression scores when trust activities are added
CREATE OR REPLACE FUNCTION update_trust_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trust level score based on positive trust activities
    UPDATE relationship_progressions
    SET trust_level_score = LEAST(
        COALESCE(trust_level_score, 0) + GREATEST(NEW.impact_on_trust * 2, 0),
        100
    ),
    updated_at = NOW()
    WHERE id = NEW.relationship_progression_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trust_scores
    AFTER INSERT ON trust_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_trust_scores();

-- ============================================================================
-- End of Migration
-- ============================================================================

-- Verification queries (run these after migration to verify success)
/*
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%relationship%' OR table_name LIKE '%trust%' OR table_name LIKE '%communication%'
ORDER BY table_name;

-- Check enums created
SELECT enumname, enumlabel FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE enumname IN ('relationship_stage', 'progression_milestone', 'trust_activity', 'communication_quality')
ORDER BY enumname, enumlabel;

-- Check views created
SELECT viewname FROM pg_views WHERE schemaname = 'public' 
AND viewname LIKE '%relationship%'
ORDER BY viewname;

-- Check functions created
SELECT proname FROM pg_proc WHERE proname LIKE '%relationship%' OR proname LIKE '%trust%';
*/