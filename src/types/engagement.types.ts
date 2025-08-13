/**
 * Engagement Analytics Types
 * 
 * Type definitions for relationship health and engagement pattern tracking
 * Focuses on cross-distributor aggregation and relationship progression analytics
 */

import type { 
  Interaction, 
  Organization, 
  Contact,
  InteractionType,
  PriorityLevel 
} from './entities'

// =============================================================================
// CORE ENGAGEMENT ANALYTICS TYPES
// =============================================================================

/**
 * Principal engagement aggregation - the main data structure
 * Aggregates all interactions across all distributors for a principal
 */
export interface PrincipalEngagementAnalytics {
  principal_id: string
  principal_name: string
  principal_type: string
  
  // Cross-distributor aggregation metrics
  total_interactions: number
  distributor_count: number
  distributor_relationships: DistributorRelationshipSummary[]
  
  // Engagement pattern analytics
  engagement_patterns: EngagementPatternAnalytics
  relationship_health: RelationshipHealthMetrics
  communication_trends: CommunicationTrendAnalytics
  
  // Risk assessment
  relationship_risk_factors: RelationshipRiskFactor[]
  risk_score: number // 0-100, higher = more risk
  
  // Time-based analytics
  engagement_timeline: EngagementTimelinePoint[]
  last_interaction_date: string | null
  first_interaction_date: string | null
  days_since_last_interaction: number | null
  
  // Computed aggregates
  computed_at: string
  next_computation_due: string
}

/**
 * Distributor relationship summary within principal context
 */
export interface DistributorRelationshipSummary {
  distributor_id: string
  distributor_name: string
  relationship_id: string
  
  // Relationship metadata
  territory: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  is_active: boolean
  
  // Engagement metrics for this distributor
  interaction_count: number
  last_interaction_date: string | null
  avg_interactions_per_month: number
  response_time_avg_hours: number | null
  engagement_quality_score: number // 1-10
  
  // Relationship progression
  relationship_stage: RelationshipStage
  trust_indicators: TrustIndicator[]
  milestone_progress: MilestoneProgress[]
}

/**
 * Engagement pattern analytics - identifies communication patterns
 */
export interface EngagementPatternAnalytics {
  // Frequency patterns
  interaction_frequency: InteractionFrequencyPattern
  seasonal_patterns: SeasonalEngagementPattern[]
  weekly_patterns: WeeklyEngagementPattern
  
  // Communication preferences
  preferred_interaction_types: InteractionTypePreference[]
  response_time_patterns: ResponseTimePattern
  
  // Engagement consistency
  consistency_score: number // 0-100, higher = more consistent
  engagement_velocity: number // interactions per time period
  engagement_depth: number // average interaction duration/quality
  
  // Pattern-based predictions
  predicted_next_interaction: string | null
  churn_risk_indicators: ChurnRiskIndicator[]
  growth_opportunity_indicators: GrowthOpportunityIndicator[]
}

/**
 * Relationship health comprehensive metrics
 */
export interface RelationshipHealthMetrics {
  // Overall health score
  overall_health_score: number // 0-100
  health_trend: 'improving' | 'stable' | 'declining'
  
  // Individual health components
  communication_health: HealthComponent
  response_health: HealthComponent
  engagement_depth_health: HealthComponent
  consistency_health: HealthComponent
  
  // Trust and partnership indicators
  trust_level: 'high' | 'medium' | 'low'
  partnership_depth: 'strategic' | 'transactional' | 'exploratory'
  relationship_maturity: 'new' | 'developing' | 'established' | 'mature'
  
  // Warning indicators
  warning_flags: RelationshipWarningFlag[]
  positive_indicators: RelationshipPositiveIndicator[]
  
  // Benchmarking
  health_percentile: number // Compared to other principal relationships
  improvement_recommendations: HealthImprovementRecommendation[]
}

/**
 * Communication trend analytics
 */
export interface CommunicationTrendAnalytics {
  // Volume trends
  interaction_volume_trend: TrendAnalysis
  response_rate_trend: TrendAnalysis
  initiative_ratio_trend: TrendAnalysis // Outbound vs inbound ratio
  
  // Quality trends
  interaction_quality_trend: QualityTrendAnalysis
  engagement_depth_trend: TrendAnalysis
  follow_through_rate_trend: TrendAnalysis
  
  // Type distribution trends
  interaction_type_evolution: InteractionTypeEvolution[]
  channel_preference_shifts: ChannelPreferenceShift[]
  
  // Predictive insights
  trend_forecast: TrendForecast[]
  seasonal_adjustments: SeasonalAdjustment[]
}

// =============================================================================
// SUPPORTING ANALYTICS TYPES
// =============================================================================

/**
 * Relationship stages for progression tracking
 */
export type RelationshipStage = 
  | 'initial_contact'
  | 'relationship_building' 
  | 'trust_establishment'
  | 'partnership_development'
  | 'strategic_partnership'
  | 'at_risk'
  | 'dormant'

/**
 * Trust indicators for relationship assessment
 */
export interface TrustIndicator {
  indicator_type: 'response_consistency' | 'transparency' | 'reliability' | 'mutual_investment'
  score: number // 1-10
  evidence: string[]
  last_updated: string
}

/**
 * Milestone progress tracking
 */
export interface MilestoneProgress {
  milestone_id: string
  milestone_name: string
  milestone_type: 'contract_signed' | 'trial_completed' | 'volume_threshold' | 'territory_expansion'
  target_date: string | null
  actual_date: string | null
  completion_percentage: number
  blocking_issues: string[]
}

/**
 * Interaction frequency patterns
 */
export interface InteractionFrequencyPattern {
  current_frequency: number // interactions per month
  historical_average: number
  frequency_trend: 'increasing' | 'stable' | 'decreasing'
  consistency_coefficient: number // 0-1, higher = more consistent
  seasonal_factor: number // Multiplier for seasonal adjustments
}

/**
 * Seasonal engagement patterns
 */
export interface SeasonalEngagementPattern {
  season: 'q1' | 'q2' | 'q3' | 'q4' | 'holiday' | 'trade_show_season'
  interaction_multiplier: number // Compared to baseline
  preferred_types: InteractionType[]
  response_time_adjustment: number // Hours adjustment
}

/**
 * Weekly engagement patterns
 */
export interface WeeklyEngagementPattern {
  day_of_week_preferences: Record<string, number> // 0-6, higher = more preferred
  best_contact_times: TimeWindow[]
  worst_contact_times: TimeWindow[]
  timezone_considerations: string[]
}

/**
 * Time window for scheduling insights
 */
export interface TimeWindow {
  start_hour: number // 0-23
  end_hour: number
  days_of_week: number[] // 0-6
  success_rate: number // 0-100
  average_response_time: number // hours
}

/**
 * Interaction type preferences
 */
export interface InteractionTypePreference {
  type: InteractionType
  preference_score: number // 1-10
  response_rate: number // 0-100
  average_outcome_rating: number // 1-10
  usage_trend: 'increasing' | 'stable' | 'decreasing'
}

/**
 * Response time pattern analysis
 */
export interface ResponseTimePattern {
  average_response_time_hours: number
  median_response_time_hours: number
  response_time_trend: 'improving' | 'stable' | 'worsening'
  response_consistency_score: number // 0-100
  fast_response_threshold: number // hours
  slow_response_threshold: number // hours
  response_time_percentiles: {
    p25: number
    p50: number
    p75: number
    p95: number
  }
}

/**
 * Health component breakdown
 */
export interface HealthComponent {
  score: number // 0-100
  weight: number // Relative importance
  trend: 'improving' | 'stable' | 'declining'
  key_indicators: string[]
  improvement_potential: number // 0-100
}

/**
 * Relationship risk factors
 */
export interface RelationshipRiskFactor {
  factor_type: 'communication_gap' | 'declining_engagement' | 'competitor_activity' | 'contract_expiration' | 'key_contact_departure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number // 0-100
  impact_score: number // 0-100
  description: string
  mitigation_suggestions: string[]
  first_detected: string
  last_updated: string
}

/**
 * Churn risk indicators
 */
export interface ChurnRiskIndicator {
  indicator_type: string
  risk_level: 'low' | 'medium' | 'high'
  confidence: number // 0-100
  contributing_factors: string[]
  recommended_actions: string[]
}

/**
 * Growth opportunity indicators
 */
export interface GrowthOpportunityIndicator {
  opportunity_type: 'upsell' | 'cross_sell' | 'territory_expansion' | 'strategic_partnership'
  confidence: number // 0-100
  potential_value: number | null
  timeline_estimate: string
  required_actions: string[]
  supporting_evidence: string[]
}

/**
 * Relationship warning flags
 */
export interface RelationshipWarningFlag {
  flag_type: 'no_recent_contact' | 'declining_response_rate' | 'shortened_interactions' | 'negative_sentiment'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggested_actions: string[]
  auto_generated: boolean
  acknowledged: boolean
  acknowledged_at: string | null
}

/**
 * Positive relationship indicators
 */
export interface RelationshipPositiveIndicator {
  indicator_type: 'increased_engagement' | 'proactive_communication' | 'referral_activity' | 'contract_renewal'
  strength: 'weak' | 'moderate' | 'strong'
  description: string
  impact_on_relationship: string
  leveraging_opportunities: string[]
}

/**
 * Health improvement recommendations
 */
export interface HealthImprovementRecommendation {
  category: 'communication' | 'engagement' | 'trust_building' | 'value_delivery'
  priority: PriorityLevel
  recommendation: string
  expected_impact: number // 0-100
  effort_required: 'low' | 'medium' | 'high'
  timeline: string
  success_metrics: string[]
}

/**
 * Engagement timeline points for visualization
 */
export interface EngagementTimelinePoint {
  date: string
  interaction_count: number
  engagement_score: number // 1-10
  relationship_milestones: string[]
  key_events: string[]
  trend_direction: 'up' | 'stable' | 'down'
}

// =============================================================================
// TREND ANALYSIS TYPES
// =============================================================================

/**
 * Generic trend analysis structure
 */
export interface TrendAnalysis {
  current_value: number
  previous_period_value: number
  change_percentage: number
  trend_direction: 'increasing' | 'stable' | 'decreasing'
  confidence: number // 0-100
  data_points: TrendDataPoint[]
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string
  value: number
  context?: string
}

/**
 * Quality trend analysis
 */
export interface QualityTrendAnalysis {
  outcome_ratings_trend: TrendAnalysis
  interaction_depth_trend: TrendAnalysis
  follow_through_trend: TrendAnalysis
  satisfaction_indicators_trend: TrendAnalysis
}

/**
 * Interaction type evolution tracking
 */
export interface InteractionTypeEvolution {
  type: InteractionType
  usage_over_time: TrendDataPoint[]
  effectiveness_trend: TrendAnalysis
  adoption_stage: 'introducing' | 'growing' | 'mature' | 'declining'
}

/**
 * Channel preference shifts
 */
export interface ChannelPreferenceShift {
  channel: InteractionType
  old_preference_score: number
  new_preference_score: number
  shift_magnitude: number
  shift_reason: string
  detected_at: string
}

/**
 * Trend forecasting
 */
export interface TrendForecast {
  metric: string
  current_value: number
  forecast_30_days: number
  forecast_90_days: number
  confidence_interval: {
    lower: number
    upper: number
  }
  methodology: string
}

/**
 * Seasonal adjustments
 */
export interface SeasonalAdjustment {
  period: string
  baseline_multiplier: number
  interaction_type_adjustments: Record<InteractionType, number>
  response_time_adjustment: number
  confidence: number
}

// =============================================================================
// AGGREGATION SERVICE TYPES
// =============================================================================

/**
 * Engagement aggregation service interface
 */
export interface EngagementAggregationService {
  // Core aggregation
  aggregateEngagementByPrincipal: (principalId: string) => Promise<PrincipalEngagementAnalytics>
  aggregateAllPrincipals: (forceRefresh?: boolean) => Promise<PrincipalEngagementAnalytics[]>
  
  // Pattern recognition
  analyzeEngagementPatterns: (principalId: string, timeframe?: string) => Promise<EngagementPatternAnalytics>
  calculateRelationshipHealth: (principalId: string) => Promise<RelationshipHealthMetrics>
  
  // Risk assessment
  assessRelationshipRisk: (principalId: string) => Promise<RelationshipRiskFactor[]>
  identifyChurnRisk: (principalId: string) => Promise<ChurnRiskIndicator[]>
  identifyGrowthOpportunities: (principalId: string) => Promise<GrowthOpportunityIndicator[]>
  
  // Trend analysis
  analyzeCommunicationTrends: (principalId: string) => Promise<CommunicationTrendAnalytics>
  forecastEngagement: (principalId: string, days: number) => Promise<TrendForecast[]>
  
  // Comparative analytics
  benchmarkRelationship: (principalId: string) => Promise<RelationshipBenchmark>
  comparePrincipalEngagement: (principalIds: string[]) => Promise<PrincipalComparisonReport>
  
  // Recommendations
  generateEngagementRecommendations: (principalId: string) => Promise<EngagementRecommendation[]>
  getNextBestActions: (principalId: string) => Promise<NextBestAction[]>
}

/**
 * Relationship benchmark data
 */
export interface RelationshipBenchmark {
  principal_id: string
  benchmark_cohort: string
  percentile_rankings: Record<string, number>
  industry_averages: Record<string, number>
  top_performers_comparison: Record<string, number>
  improvement_opportunities: BenchmarkOpportunity[]
}

/**
 * Principal comparison report
 */
export interface PrincipalComparisonReport {
  comparison_date: string
  principals: PrincipalComparisonMetrics[]
  key_differentiators: string[]
  best_practices_identified: string[]
  optimization_recommendations: string[]
}

/**
 * Principal comparison metrics
 */
export interface PrincipalComparisonMetrics {
  principal_id: string
  principal_name: string
  engagement_score: number
  health_score: number
  risk_score: number
  interaction_velocity: number
  response_quality: number
  relationship_stage: RelationshipStage
}

/**
 * Benchmark opportunity
 */
export interface BenchmarkOpportunity {
  area: string
  current_performance: number
  benchmark_performance: number
  gap_magnitude: number
  improvement_potential: string
  recommended_actions: string[]
}

/**
 * Engagement recommendations
 */
export interface EngagementRecommendation {
  category: 'communication' | 'relationship_building' | 'risk_mitigation' | 'growth'
  priority: PriorityLevel
  recommendation: string
  rationale: string
  expected_outcomes: string[]
  success_metrics: string[]
  timeline: string
  effort_required: 'low' | 'medium' | 'high'
}

/**
 * Next best actions
 */
export interface NextBestAction {
  action_type: InteractionType | 'strategic_review' | 'relationship_audit'
  priority: PriorityLevel
  suggested_timing: string
  target_contacts: string[]
  objective: string
  preparation_required: string[]
  success_indicators: string[]
  estimated_duration: number
}

// =============================================================================
// QUERY AND FILTER TYPES
// =============================================================================

/**
 * Engagement analytics filters
 */
export interface EngagementAnalyticsFilter {
  principal_ids?: string[]
  distributor_ids?: string[]
  relationship_stages?: RelationshipStage[]
  health_score_range?: { min: number; max: number }
  risk_score_range?: { min: number; max: number }
  interaction_count_range?: { min: number; max: number }
  date_range?: { start: string; end: string }
  include_dormant?: boolean
  include_at_risk?: boolean
}

/**
 * Engagement query options
 */
export interface EngagementQueryOptions {
  include_patterns?: boolean
  include_health_metrics?: boolean
  include_risk_factors?: boolean
  include_trends?: boolean
  include_forecasts?: boolean
  include_recommendations?: boolean
  cache_timeout_minutes?: number
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

/**
 * Engagement dashboard props
 */
export interface EngagementDashboardProps {
  principalId?: string
  timeframe?: 'last_30_days' | 'last_90_days' | 'last_year' | 'all_time'
  compareMode?: boolean
  selectedPrincipals?: string[]
  refreshInterval?: number
}

/**
 * Relationship health visualization props
 */
export interface RelationshipHealthVisualizationProps {
  healthMetrics: RelationshipHealthMetrics
  showDetails?: boolean
  interactive?: boolean
  onHealthComponentClick?: (component: string) => void
  onRecommendationClick?: (recommendation: HealthImprovementRecommendation) => void
}

/**
 * Engagement timeline visualization props
 */
export interface EngagementTimelineProps {
  timelineData: EngagementTimelinePoint[]
  highlightMilestones?: boolean
  showTrendLine?: boolean
  interactive?: boolean
  onTimelinePointClick?: (point: EngagementTimelinePoint) => void
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type {
  // Core types already exported above
}

/**
 * Validation utilities
 */
export const RELATIONSHIP_STAGES: RelationshipStage[] = [
  'initial_contact',
  'relationship_building',
  'trust_establishment',
  'partnership_development',
  'strategic_partnership',
  'at_risk',
  'dormant'
] as const

export const ENGAGEMENT_HEALTH_THRESHOLDS = {
  excellent: 90,
  good: 75,
  average: 60,
  poor: 40,
  critical: 25
} as const

export const RISK_SCORE_THRESHOLDS = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 90
} as const