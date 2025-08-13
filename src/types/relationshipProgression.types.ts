/**
 * Relationship Progression Tracking Types
 * Partnership-focused relationship milestone and progression tracking
 */

import { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

// ============================================================================
// Database Enums
// ============================================================================

export type RelationshipStage = 
  | 'initial_contact'        // First meaningful interaction
  | 'trust_building'         // Active engagement, learning about each other  
  | 'partnership_deepening'  // Multiple touchpoints, strategic conversations
  | 'strategic_collaboration' // Long-term partnership, joint planning

export type ProgressionMilestone = 
  | 'first_contact'           // Initial contact established
  | 'contact_response'        // First positive response received
  | 'meeting_scheduled'       // First meeting/call scheduled
  | 'meeting_completed'       // First meeting/call completed
  | 'stakeholder_introduction' // Introduction to additional stakeholders
  | 'needs_assessment'        // Understanding of needs/challenges completed
  | 'solution_presentation'   // Solution/capability presentation made
  | 'site_visit_requested'    // Customer requests site visit
  | 'site_visit_completed'    // Site visit completed
  | 'strategic_discussion'    // Strategic planning conversation held
  | 'partnership_proposal'    // Formal partnership discussion initiated
  | 'trial_program'          // Trial/pilot program established
  | 'contract_discussion'     // Contract terms discussion
  | 'partnership_established' // Formal partnership agreement

export type TrustActivity = 
  | 'knowledge_sharing'       // Sharing industry insights/knowledge
  | 'problem_solving'         // Helping solve customer challenges
  | 'relationship_building'   // Social/relationship activities
  | 'strategic_planning'      // Joint strategic planning
  | 'capability_demonstration' // Demonstrating capabilities/expertise
  | 'reference_providing'     // Providing references/testimonials
  | 'market_intelligence'     // Sharing market insights
  | 'educational_content'     // Providing educational resources

export type CommunicationQuality = 
  | 'minimal'      // Basic acknowledgment
  | 'responsive'   // Timely responses
  | 'engaged'      // Active participation in discussions
  | 'collaborative' // Proactive collaboration
  | 'strategic'    // Strategic partnership discussions

// ============================================================================
// Base Entity Types (from database)
// ============================================================================

// These will be updated once we regenerate database types
export interface RelationshipProgression {
  id: string
  organization_id: string
  current_stage: RelationshipStage
  relationship_maturity_score: number
  trust_level_score: number
  communication_frequency_score: number
  stakeholder_engagement_score: number
  product_portfolio_depth_score: number
  partnership_resilience_score: number
  strategic_value_score: number
  
  // Timeline tracking
  first_contact_date?: string
  last_milestone_date?: string
  last_interaction_date?: string
  last_progression_update?: string
  
  // Communication tracking
  total_interactions_count: number
  response_time_avg_hours?: number
  response_quality: CommunicationQuality
  
  // Stakeholder expansion tracking
  contacts_engaged_count: number
  decision_makers_engaged_count: number
  
  // Product engagement tracking
  products_discussed_count: number
  product_categories_engaged: number
  
  // Notes and observations
  relationship_notes?: string
  strategic_insights?: string
  growth_opportunities?: string
  risk_factors?: string
  
  is_active: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface RelationshipMilestone {
  id: string
  relationship_progression_id: string
  milestone: ProgressionMilestone
  achieved_date: string
  
  // Context about milestone achievement
  interaction_id?: string
  contact_id?: string
  opportunity_id?: string
  
  // Details about the milestone
  milestone_description?: string
  impact_assessment?: string
  next_steps?: string
  significance_score: number // 1-5
  
  // Metadata
  notes?: string
  created_at?: string
  created_by?: string
}

export interface TrustActivityRecord {
  id: string
  relationship_progression_id: string
  activity_type: TrustActivity
  activity_date: string
  
  // Activity details
  title: string
  description?: string
  outcome_description?: string
  impact_on_trust: number // -5 to +5
  
  // Related entities
  interaction_id?: string
  contact_id?: string
  opportunity_id?: string
  
  // Tracking
  follow_up_required: boolean
  follow_up_date?: string
  follow_up_notes?: string
  
  created_at?: string
  created_by?: string
}

export interface CommunicationPattern {
  id: string
  relationship_progression_id: string
  analysis_period_start: string
  analysis_period_end: string
  
  // Communication frequency metrics
  total_interactions: number
  customer_initiated_interactions: number
  our_initiated_interactions: number
  avg_response_time_hours?: number
  
  // Communication quality metrics
  quality_improvement_trend: number // -5 to +5
  engagement_depth_score: number // 0-100
  
  // Meeting progression tracking
  calls_count: number
  demos_count: number
  meetings_count: number
  site_visits_count: number
  
  created_at?: string
  created_by?: string
}

export interface RelationshipHealthSnapshot {
  id: string
  relationship_progression_id: string
  snapshot_date: string
  
  // Health scores at time of snapshot
  overall_health_score: number // 0-100
  trust_score: number // 0-100
  engagement_score: number // 0-100
  growth_potential_score: number // 0-100
  
  // Qualitative assessment
  health_status?: string // 'excellent', 'good', 'fair', 'at_risk', 'critical'
  primary_strengths?: string[]
  areas_for_improvement?: string[]
  recommended_actions?: string[]
  
  // Risk assessment
  risk_level: number // 1-5
  risk_factors?: string[]
  mitigation_strategies?: string[]
  
  // Analyst notes
  analyst_notes?: string
  confidence_level: number // 1-5
  
  created_at?: string
  created_by?: string
}

// ============================================================================
// Insert and Update Types
// ============================================================================

export type RelationshipProgressionInsert = Omit<
  RelationshipProgression,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type RelationshipProgressionUpdate = Partial<
  Omit<RelationshipProgression, 'id' | 'created_at'>
> & {
  updated_at?: string
}

export type RelationshipMilestoneInsert = Omit<
  RelationshipMilestone,
  'id' | 'created_at'
> & {
  id?: string
  created_at?: string
}

export type TrustActivityInsert = Omit<
  TrustActivityRecord,
  'id' | 'created_at'
> & {
  id?: string
  created_at?: string
}

export type CommunicationPatternInsert = Omit<
  CommunicationPattern,
  'id' | 'created_at'
> & {
  id?: string
  created_at?: string
}

export type RelationshipHealthSnapshotInsert = Omit<
  RelationshipHealthSnapshot,
  'id' | 'created_at'
> & {
  id?: string
  created_at?: string
}

// ============================================================================
// View Types (for complex queries)
// ============================================================================

export interface RelationshipOverview {
  // All fields from RelationshipProgression
  id: string
  organization_id: string
  current_stage: RelationshipStage
  relationship_maturity_score: number
  trust_level_score: number
  communication_frequency_score: number
  stakeholder_engagement_score: number
  product_portfolio_depth_score: number
  partnership_resilience_score: number
  strategic_value_score: number
  
  // Organization details
  organization_name: string
  organization_type: string
  
  // Aggregated metrics
  milestones_achieved: number
  trust_activities_count: number
  avg_health_score: number
  last_health_assessment?: string
  
  // Computed fields
  days_since_first_contact?: number
  days_since_last_interaction?: number
  progression_velocity?: number
}

export interface MilestoneProgressionTimeline {
  relationship_progression_id: string
  organization_name: string
  milestone: ProgressionMilestone
  achieved_date: string
  significance_score: number
  next_milestone?: ProgressionMilestone
  time_to_next_milestone?: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface RelationshipProgressionWithDetails extends RelationshipProgression {
  organization?: {
    id: string
    name: string
    type: string
  }
  recent_milestones?: RelationshipMilestone[]
  recent_trust_activities?: TrustActivityRecord[]
  latest_health_snapshot?: RelationshipHealthSnapshot
  communication_trend?: CommunicationPattern
}

export interface RelationshipAnalytics {
  organization_id: string
  organization_name: string
  
  // Current state
  current_stage: RelationshipStage
  overall_health_score: number
  maturity_score: number
  trust_level: number
  
  // Progress indicators
  milestones_achieved: number
  days_in_current_stage: number
  progression_velocity: number
  
  // Trends
  health_trend: 'improving' | 'stable' | 'declining'
  engagement_trend: 'increasing' | 'stable' | 'decreasing'
  
  // Risk assessment
  risk_level: number
  primary_risks: string[]
  
  // Opportunities
  growth_opportunities: string[]
  recommended_next_actions: string[]
}

// ============================================================================
// Form Types for UI Components
// ============================================================================

export interface MilestoneFormData {
  milestone: ProgressionMilestone
  achieved_date: string
  interaction_id?: string
  contact_id?: string
  opportunity_id?: string
  milestone_description?: string
  impact_assessment?: string
  next_steps?: string
  significance_score: number
  notes?: string
}

export interface TrustActivityFormData {
  activity_type: TrustActivity
  activity_date: string
  title: string
  description?: string
  outcome_description?: string
  impact_on_trust: number
  interaction_id?: string
  contact_id?: string
  opportunity_id?: string
  follow_up_required: boolean
  follow_up_date?: string
  follow_up_notes?: string
}

export interface HealthAssessmentFormData {
  overall_health_score: number
  trust_score: number
  engagement_score: number
  growth_potential_score: number
  health_status?: string
  primary_strengths: string[]
  areas_for_improvement: string[]
  recommended_actions: string[]
  risk_level: number
  risk_factors: string[]
  mitigation_strategies: string[]
  analyst_notes?: string
  confidence_level: number
}

// ============================================================================
// Utility Types
// ============================================================================

export interface StageTransition {
  from_stage: RelationshipStage
  to_stage: RelationshipStage
  transition_date: string
  trigger_milestone?: ProgressionMilestone
  reasons: string[]
}

export interface ProgressionMetrics {
  total_relationships: number
  by_stage: Record<RelationshipStage, number>
  avg_maturity_score: number
  avg_time_to_partnership: number
  top_performing_relationships: RelationshipOverview[]
  at_risk_relationships: RelationshipOverview[]
}

// ============================================================================
// Constants and Utilities
// ============================================================================

export const RELATIONSHIP_STAGES: { value: RelationshipStage; label: string; description: string }[] = [
  {
    value: 'initial_contact',
    label: 'Initial Contact',
    description: 'First meaningful interaction established'
  },
  {
    value: 'trust_building',
    label: 'Trust Building',
    description: 'Active engagement and mutual understanding'
  },
  {
    value: 'partnership_deepening',
    label: 'Partnership Deepening',
    description: 'Multiple touchpoints and strategic conversations'
  },
  {
    value: 'strategic_collaboration',
    label: 'Strategic Collaboration',
    description: 'Long-term partnership with joint planning'
  }
]

export const PROGRESSION_MILESTONES: { value: ProgressionMilestone; label: string; category: string }[] = [
  // Initial engagement milestones
  { value: 'first_contact', label: 'First Contact', category: 'Initial' },
  { value: 'contact_response', label: 'First Response', category: 'Initial' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', category: 'Initial' },
  { value: 'meeting_completed', label: 'Meeting Completed', category: 'Initial' },
  
  // Relationship building milestones
  { value: 'stakeholder_introduction', label: 'Stakeholder Introduction', category: 'Building' },
  { value: 'needs_assessment', label: 'Needs Assessment', category: 'Building' },
  { value: 'solution_presentation', label: 'Solution Presentation', category: 'Building' },
  
  // Partnership development milestones
  { value: 'site_visit_requested', label: 'Site Visit Requested', category: 'Partnership' },
  { value: 'site_visit_completed', label: 'Site Visit Completed', category: 'Partnership' },
  { value: 'strategic_discussion', label: 'Strategic Discussion', category: 'Partnership' },
  
  // Formal partnership milestones
  { value: 'partnership_proposal', label: 'Partnership Proposal', category: 'Formal' },
  { value: 'trial_program', label: 'Trial Program', category: 'Formal' },
  { value: 'contract_discussion', label: 'Contract Discussion', category: 'Formal' },
  { value: 'partnership_established', label: 'Partnership Established', category: 'Formal' }
]

export const TRUST_ACTIVITIES: { value: TrustActivity; label: string; description: string }[] = [
  { value: 'knowledge_sharing', label: 'Knowledge Sharing', description: 'Sharing industry insights and expertise' },
  { value: 'problem_solving', label: 'Problem Solving', description: 'Helping solve customer challenges' },
  { value: 'relationship_building', label: 'Relationship Building', description: 'Social and relationship activities' },
  { value: 'strategic_planning', label: 'Strategic Planning', description: 'Joint strategic planning sessions' },
  { value: 'capability_demonstration', label: 'Capability Demo', description: 'Demonstrating capabilities and expertise' },
  { value: 'reference_providing', label: 'Reference Providing', description: 'Providing references and testimonials' },
  { value: 'market_intelligence', label: 'Market Intelligence', description: 'Sharing market insights and trends' },
  { value: 'educational_content', label: 'Educational Content', description: 'Providing educational resources' }
]

export const COMMUNICATION_QUALITIES: { value: CommunicationQuality; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Basic acknowledgment only' },
  { value: 'responsive', label: 'Responsive', description: 'Timely and relevant responses' },
  { value: 'engaged', label: 'Engaged', description: 'Active participation in discussions' },
  { value: 'collaborative', label: 'Collaborative', description: 'Proactive collaboration and input' },
  { value: 'strategic', label: 'Strategic', description: 'Strategic partnership discussions' }
]

// Score interpretation helpers
export const getHealthScoreLevel = (score: number): { level: string; color: string; description: string } => {
  if (score >= 90) return { level: 'Excellent', color: 'green', description: 'Outstanding relationship health' }
  if (score >= 80) return { level: 'Good', color: 'blue', description: 'Strong relationship foundation' }
  if (score >= 70) return { level: 'Fair', color: 'yellow', description: 'Adequate relationship status' }
  if (score >= 60) return { level: 'At Risk', color: 'orange', description: 'Requires attention and improvement' }
  return { level: 'Critical', color: 'red', description: 'Immediate action required' }
}

export const getMaturityLevel = (score: number): { level: string; description: string } => {
  if (score >= 90) return { level: 'Strategic Partner', description: 'Fully developed strategic partnership' }
  if (score >= 75) return { level: 'Established Partner', description: 'Strong partnership foundation' }
  if (score >= 60) return { level: 'Developing Partner', description: 'Partnership actively developing' }
  if (score >= 40) return { level: 'Engaged Prospect', description: 'Active engagement and trust building' }
  return { level: 'Early Stage', description: 'Initial contact and exploration phase' }
}