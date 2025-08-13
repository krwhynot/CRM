/**
 * Engagement Aggregation Service
 * 
 * Core service for aggregating customer interactions by principal (manufacturer)
 * Provides unprecedented visibility into relationship health and engagement patterns
 * across all distributor relationships
 */

import { BaseService } from './baseService'
import type { 
  PrincipalEngagementAnalytics,
  EngagementPatternAnalytics,
  RelationshipHealthMetrics,
  CommunicationTrendAnalytics,
  RelationshipRiskFactor,
  ChurnRiskIndicator,
  GrowthOpportunityIndicator,
  DistributorRelationshipSummary,
  RelationshipStage,
  TrustIndicator,
  EngagementTimelinePoint,
  InteractionFrequencyPattern,
  ResponseTimePattern,
  InteractionTypePreference,
  HealthComponent,
  TrendAnalysis,
  EngagementRecommendation,
  NextBestAction,
  RelationshipBenchmark,
  EngagementAnalyticsFilter,
  EngagementQueryOptions
} from '../types/engagement.types'
import type { 
  Interaction, 
  InteractionListItem,
  InteractionType,
  Organization,
  Contact
} from '../types'

/**
 * Service for comprehensive engagement analytics and relationship intelligence
 * Focuses on cross-distributor aggregation and relationship progression tracking
 */
export class EngagementAggregationService extends BaseService<any, any, any> {
  constructor() {
    super('interactions') // Primary table for aggregation
  }

  // =============================================================================
  // CORE AGGREGATION METHODS
  // =============================================================================

  /**
   * Aggregate all engagement data for a specific principal
   * This is the main method that provides comprehensive relationship analytics
   */
  async aggregateEngagementByPrincipal(
    principalId: string,
    options: EngagementQueryOptions = {}
  ): Promise<PrincipalEngagementAnalytics> {
    try {
      // Get principal organization details
      const principal = await this.getPrincipalDetails(principalId)
      if (!principal) {
        throw new Error(`Principal with ID ${principalId} not found`)
      }

      // Get all distributor relationships for this principal
      const distributorRelationships = await this.getDistributorRelationships(principalId)

      // Aggregate interactions across all distributors
      const allInteractions = await this.getAllPrincipalInteractions(principalId)

      // Calculate engagement patterns
      const engagementPatterns = options.include_patterns !== false 
        ? await this.analyzeEngagementPatterns(principalId, allInteractions)
        : this.getEmptyEngagementPatterns()

      // Calculate relationship health
      const relationshipHealth = options.include_health_metrics !== false
        ? await this.calculateRelationshipHealth(principalId, allInteractions, distributorRelationships)
        : this.getEmptyHealthMetrics()

      // Analyze communication trends
      const communicationTrends = options.include_trends !== false
        ? await this.analyzeCommunicationTrends(principalId, allInteractions)
        : this.getEmptyCommunicationTrends()

      // Assess relationship risks
      const relationshipRiskFactors = options.include_risk_factors !== false
        ? await this.assessRelationshipRisk(principalId, allInteractions, distributorRelationships)
        : []

      // Build engagement timeline
      const engagementTimeline = await this.buildEngagementTimeline(allInteractions)

      // Calculate risk score
      const riskScore = this.calculateOverallRiskScore(relationshipRiskFactors)

      // Build distributor relationship summaries
      const distributorSummaries = await this.buildDistributorSummaries(
        distributorRelationships,
        allInteractions
      )

      const analytics: PrincipalEngagementAnalytics = {
        principal_id: principalId,
        principal_name: principal.name,
        principal_type: principal.type,
        
        // Cross-distributor aggregation
        total_interactions: allInteractions.length,
        distributor_count: distributorRelationships.length,
        distributor_relationships: distributorSummaries,
        
        // Analytics
        engagement_patterns: engagementPatterns,
        relationship_health: relationshipHealth,
        communication_trends: communicationTrends,
        
        // Risk assessment
        relationship_risk_factors: relationshipRiskFactors,
        risk_score: riskScore,
        
        // Timeline data
        engagement_timeline: engagementTimeline,
        last_interaction_date: this.getLastInteractionDate(allInteractions),
        first_interaction_date: this.getFirstInteractionDate(allInteractions),
        days_since_last_interaction: this.calculateDaysSinceLastInteraction(allInteractions),
        
        // Metadata
        computed_at: new Date().toISOString(),
        next_computation_due: this.calculateNextComputationDue()
      }

      return analytics

    } catch (error) {
      console.error('Error aggregating engagement by principal:', error)
      throw error
    }
  }

  /**
   * Aggregate engagement data for all principals
   */
  async aggregateAllPrincipals(
    filter: EngagementAnalyticsFilter = {},
    options: EngagementQueryOptions = {},
    forceRefresh: boolean = false
  ): Promise<PrincipalEngagementAnalytics[]> {
    try {
      // Get all principals (manufacturers)
      const principals = await this.getAllPrincipals(filter)
      
      const results: PrincipalEngagementAnalytics[] = []

      // Process each principal
      for (const principal of principals) {
        try {
          const analytics = await this.aggregateEngagementByPrincipal(
            principal.id,
            options
          )
          results.push(analytics)
        } catch (error) {
          console.warn(`Failed to aggregate engagement for principal ${principal.id}:`, error)
          // Continue with other principals
        }
      }

      return results.filter(result => this.passesFilter(result, filter))

    } catch (error) {
      console.error('Error aggregating all principals:', error)
      throw error
    }
  }

  // =============================================================================
  // ENGAGEMENT PATTERN ANALYSIS
  // =============================================================================

  /**
   * Analyze engagement patterns for relationship intelligence
   */
  async analyzeEngagementPatterns(
    principalId: string,
    interactions?: InteractionListItem[]
  ): Promise<EngagementPatternAnalytics> {
    const allInteractions = interactions || await this.getAllPrincipalInteractions(principalId)

    // Analyze interaction frequency
    const interactionFrequency = this.analyzeInteractionFrequency(allInteractions)

    // Analyze seasonal patterns
    const seasonalPatterns = this.analyzeSeasonalPatterns(allInteractions)

    // Analyze weekly patterns
    const weeklyPatterns = this.analyzeWeeklyPatterns(allInteractions)

    // Analyze type preferences
    const preferredInteractionTypes = this.analyzeInteractionTypePreferences(allInteractions)

    // Analyze response times
    const responseTimePatterns = this.analyzeResponseTimePatterns(allInteractions)

    // Calculate consistency and quality scores
    const consistencyScore = this.calculateConsistencyScore(allInteractions)
    const engagementVelocity = this.calculateEngagementVelocity(allInteractions)
    const engagementDepth = this.calculateEngagementDepth(allInteractions)

    // Generate predictive insights
    const predictedNextInteraction = this.predictNextInteraction(allInteractions)
    const churnRiskIndicators = await this.identifyChurnRisk(principalId, allInteractions)
    const growthOpportunityIndicators = await this.identifyGrowthOpportunities(principalId, allInteractions)

    return {
      // Frequency patterns
      interaction_frequency: interactionFrequency,
      seasonal_patterns: seasonalPatterns,
      weekly_patterns: weeklyPatterns,
      
      // Communication preferences
      preferred_interaction_types: preferredInteractionTypes,
      response_time_patterns: responseTimePatterns,
      
      // Engagement consistency
      consistency_score: consistencyScore,
      engagement_velocity: engagementVelocity,
      engagement_depth: engagementDepth,
      
      // Predictions
      predicted_next_interaction: predictedNextInteraction,
      churn_risk_indicators: churnRiskIndicators,
      growth_opportunity_indicators: growthOpportunityIndicators
    }
  }

  /**
   * Calculate comprehensive relationship health metrics
   */
  async calculateRelationshipHealth(
    principalId: string,
    interactions?: InteractionListItem[],
    distributorRelationships?: any[]
  ): Promise<RelationshipHealthMetrics> {
    const allInteractions = interactions || await this.getAllPrincipalInteractions(principalId)
    const relationships = distributorRelationships || await this.getDistributorRelationships(principalId)

    // Calculate individual health components
    const communicationHealth = this.calculateCommunicationHealth(allInteractions)
    const responseHealth = this.calculateResponseHealth(allInteractions)
    const engagementDepthHealth = this.calculateEngagementDepthHealth(allInteractions)
    const consistencyHealth = this.calculateConsistencyHealth(allInteractions)

    // Calculate overall health score
    const overallHealthScore = this.calculateOverallHealthScore([
      communicationHealth,
      responseHealth,
      engagementDepthHealth,
      consistencyHealth
    ])

    // Determine health trend
    const healthTrend = this.calculateHealthTrend(allInteractions)

    // Assess trust and partnership
    const trustLevel = this.assessTrustLevel(allInteractions, relationships)
    const partnershipDepth = this.assessPartnershipDepth(allInteractions, relationships)
    const relationshipMaturity = this.assessRelationshipMaturity(allInteractions, relationships)

    // Generate warning flags and positive indicators
    const warningFlags = await this.generateWarningFlags(principalId, allInteractions)
    const positiveIndicators = await this.generatePositiveIndicators(principalId, allInteractions)

    // Calculate benchmarking
    const healthPercentile = await this.calculateHealthPercentile(principalId, overallHealthScore)
    const improvementRecommendations = await this.generateHealthRecommendations(
      principalId,
      communicationHealth,
      responseHealth,
      engagementDepthHealth,
      consistencyHealth
    )

    return {
      // Overall health
      overall_health_score: overallHealthScore,
      health_trend: healthTrend,
      
      // Components
      communication_health: communicationHealth,
      response_health: responseHealth,
      engagement_depth_health: engagementDepthHealth,
      consistency_health: consistencyHealth,
      
      // Trust and partnership
      trust_level: trustLevel,
      partnership_depth: partnershipDepth,
      relationship_maturity: relationshipMaturity,
      
      // Indicators
      warning_flags: warningFlags,
      positive_indicators: positiveIndicators,
      
      // Benchmarking
      health_percentile: healthPercentile,
      improvement_recommendations: improvementRecommendations
    }
  }

  // =============================================================================
  // RISK ASSESSMENT AND OPPORTUNITY IDENTIFICATION
  // =============================================================================

  /**
   * Assess relationship risk factors
   */
  async assessRelationshipRisk(
    principalId: string,
    interactions?: InteractionListItem[],
    distributorRelationships?: any[]
  ): Promise<RelationshipRiskFactor[]> {
    const allInteractions = interactions || await this.getAllPrincipalInteractions(principalId)
    const relationships = distributorRelationships || await this.getDistributorRelationships(principalId)

    const riskFactors: RelationshipRiskFactor[] = []

    // Check for communication gaps
    const communicationGapRisk = this.assessCommunicationGapRisk(allInteractions)
    if (communicationGapRisk) riskFactors.push(communicationGapRisk)

    // Check for declining engagement
    const decliningEngagementRisk = this.assessDecliningEngagementRisk(allInteractions)
    if (decliningEngagementRisk) riskFactors.push(decliningEngagementRisk)

    // Check for contract expiration risks
    const contractExpirationRisks = this.assessContractExpirationRisks(relationships)
    riskFactors.push(...contractExpirationRisks)

    // Check for key contact departure risk
    const keyContactRisks = await this.assessKeyContactRisks(principalId, allInteractions)
    riskFactors.push(...keyContactRisks)

    // Check for competitor activity risk
    const competitorRisks = await this.assessCompetitorActivityRisk(principalId, allInteractions)
    riskFactors.push(...competitorRisks)

    return riskFactors.sort((a, b) => b.impact_score - a.impact_score)
  }

  /**
   * Identify churn risk indicators
   */
  async identifyChurnRisk(
    principalId: string,
    interactions?: InteractionListItem[]
  ): Promise<ChurnRiskIndicator[]> {
    const allInteractions = interactions || await this.getAllPrincipalInteractions(principalId)

    const indicators: ChurnRiskIndicator[] = []

    // Declining interaction frequency
    if (this.hasDeclineInInteractionFrequency(allInteractions)) {
      indicators.push({
        indicator_type: 'declining_interaction_frequency',
        risk_level: 'medium',
        confidence: 75,
        contributing_factors: [
          'Interaction volume down 40% in last 90 days',
          'Longer gaps between communications'
        ],
        recommended_actions: [
          'Schedule regular check-in cadence',
          'Proactive outreach to key contacts',
          'Review value proposition delivery'
        ]
      })
    }

    // Response time degradation
    if (this.hasResponseTimeDegradation(allInteractions)) {
      indicators.push({
        indicator_type: 'response_time_degradation',
        risk_level: 'medium',
        confidence: 65,
        contributing_factors: [
          'Average response time increased by 50%',
          'More follow-ups required to get responses'
        ],
        recommended_actions: [
          'Address any service issues',
          'Re-engage at executive level',
          'Review communication preferences'
        ]
      })
    }

    // Sentiment decline (if tracked)
    const sentimentDecline = this.assessSentimentDecline(allInteractions)
    if (sentimentDecline) {
      indicators.push(sentimentDecline)
    }

    return indicators
  }

  /**
   * Identify growth opportunities
   */
  async identifyGrowthOpportunities(
    principalId: string,
    interactions?: InteractionListItem[]
  ): Promise<GrowthOpportunityIndicator[]> {
    const allInteractions = interactions || await this.getAllPrincipalInteractions(principalId)

    const opportunities: GrowthOpportunityIndicator[] = []

    // Increasing engagement opportunity
    if (this.hasIncreasingEngagement(allInteractions)) {
      opportunities.push({
        opportunity_type: 'upsell',
        confidence: 80,
        potential_value: null,
        timeline_estimate: '3-6 months',
        required_actions: [
          'Present expanded product portfolio',
          'Schedule strategic planning session',
          'Develop customized proposal'
        ],
        supporting_evidence: [
          'Interaction frequency up 35%',
          'More strategic discussions',
          'Positive feedback on current products'
        ]
      })
    }

    // Territory expansion opportunity
    const territoryOpportunity = this.assessTerritoryExpansion(allInteractions)
    if (territoryOpportunity) {
      opportunities.push(territoryOpportunity)
    }

    // Strategic partnership indicators
    const strategicPartnership = this.assessStrategicPartnershipOpportunity(allInteractions)
    if (strategicPartnership) {
      opportunities.push(strategicPartnership)
    }

    return opportunities
  }

  // =============================================================================
  // COMMUNICATION TREND ANALYSIS
  // =============================================================================

  /**
   * Analyze communication trends for strategic insights
   */
  async analyzeCommunicationTrends(
    principalId: string,
    interactions?: InteractionListItem[]
  ): Promise<CommunicationTrendAnalytics> {
    const allInteractions = interactions || await this.getAllPrincipalInteractions(principalId)

    // Volume trends
    const interactionVolumeTrend = this.analyzeInteractionVolumeTrend(allInteractions)
    const responseRateTrend = this.analyzeResponseRateTrend(allInteractions)
    const initiativeRatioTrend = this.analyzeInitiativeRatioTrend(allInteractions)

    // Quality trends
    const interactionQualityTrend = this.analyzeInteractionQualityTrend(allInteractions)
    const engagementDepthTrend = this.analyzeEngagementDepthTrend(allInteractions)
    const followThroughRateTrend = this.analyzeFollowThroughRateTrend(allInteractions)

    // Type distribution trends
    const interactionTypeEvolution = this.analyzeInteractionTypeEvolution(allInteractions)
    const channelPreferenceShifts = this.analyzeChannelPreferenceShifts(allInteractions)

    // Predictive insights
    const trendForecast = this.generateTrendForecast(allInteractions)
    const seasonalAdjustments = this.calculateSeasonalAdjustments(allInteractions)

    return {
      // Volume trends
      interaction_volume_trend: interactionVolumeTrend,
      response_rate_trend: responseRateTrend,
      initiative_ratio_trend: initiativeRatioTrend,
      
      // Quality trends
      interaction_quality_trend: interactionQualityTrend,
      engagement_depth_trend: engagementDepthTrend,
      follow_through_rate_trend: followThroughRateTrend,
      
      // Type distribution
      interaction_type_evolution: interactionTypeEvolution,
      channel_preference_shifts: channelPreferenceShifts,
      
      // Predictions
      trend_forecast: trendForecast,
      seasonal_adjustments: seasonalAdjustments
    }
  }

  // =============================================================================
  // RECOMMENDATION GENERATION
  // =============================================================================

  /**
   * Generate engagement recommendations based on analytics
   */
  async generateEngagementRecommendations(
    principalId: string
  ): Promise<EngagementRecommendation[]> {
    const analytics = await this.aggregateEngagementByPrincipal(principalId)
    const recommendations: EngagementRecommendation[] = []

    // Communication recommendations
    if (analytics.relationship_health.communication_health.score < 70) {
      recommendations.push({
        category: 'communication',
        priority: 'high',
        recommendation: 'Establish regular communication cadence with key contacts',
        rationale: 'Communication health score is below optimal threshold',
        expected_outcomes: [
          'Improved relationship visibility',
          'Faster issue resolution',
          'Enhanced trust building'
        ],
        success_metrics: [
          'Communication health score > 80',
          'Average response time < 24 hours',
          'Monthly touchpoint completion > 90%'
        ],
        timeline: '30-60 days',
        effort_required: 'medium'
      })
    }

    // Risk mitigation recommendations
    for (const risk of analytics.relationship_risk_factors) {
      if (risk.severity === 'high' || risk.severity === 'critical') {
        recommendations.push({
          category: 'risk_mitigation',
          priority: risk.severity === 'critical' ? 'critical' : 'high',
          recommendation: risk.mitigation_suggestions[0] || 'Address identified risk factor',
          rationale: risk.description,
          expected_outcomes: [
            'Reduced relationship risk',
            'Prevented potential churn',
            'Maintained partnership value'
          ],
          success_metrics: [
            'Risk factor severity reduced',
            'Regular monitoring established',
            'Stakeholder satisfaction maintained'
          ],
          timeline: '2-4 weeks',
          effort_required: risk.severity === 'critical' ? 'high' : 'medium'
        })
      }
    }

    // Growth recommendations
    for (const opportunity of analytics.engagement_patterns.growth_opportunity_indicators) {
      if (opportunity.confidence > 70) {
        recommendations.push({
          category: 'growth',
          priority: 'medium',
          recommendation: opportunity.required_actions[0] || 'Pursue identified growth opportunity',
          rationale: `High-confidence growth opportunity identified: ${opportunity.opportunity_type}`,
          expected_outcomes: [
            'Revenue growth potential',
            'Strengthened partnership',
            'Market expansion'
          ],
          success_metrics: [
            'Opportunity progression tracked',
            'Revenue target achievement',
            'Partnership depth increase'
          ],
          timeline: opportunity.timeline_estimate,
          effort_required: 'medium'
        })
      }
    }

    return recommendations.sort((a, b) => this.priorityToNumber(b.priority) - this.priorityToNumber(a.priority))
  }

  /**
   * Get next best actions for relationship management
   */
  async getNextBestActions(principalId: string): Promise<NextBestAction[]> {
    const analytics = await this.aggregateEngagementByPrincipal(principalId)
    const actions: NextBestAction[] = []

    // Immediate actions based on risk factors
    for (const risk of analytics.relationship_risk_factors) {
      if (risk.severity === 'critical') {
        actions.push({
          action_type: 'strategic_review',
          priority: 'critical',
          suggested_timing: 'Within 1 week',
          target_contacts: ['Primary decision maker'],
          objective: 'Address critical relationship risk',
          preparation_required: [
            'Review risk factor details',
            'Prepare mitigation strategy',
            'Gather supporting data'
          ],
          success_indicators: [
            'Risk acknowledgment from client',
            'Mitigation plan agreed upon',
            'Timeline established'
          ],
          estimated_duration: 120
        })
      }
    }

    // Proactive engagement actions
    if (analytics.days_since_last_interaction && analytics.days_since_last_interaction > 30) {
      actions.push({
        action_type: 'call',
        priority: 'high',
        suggested_timing: 'This week',
        target_contacts: ['Primary contact'],
        objective: 'Re-establish regular communication',
        preparation_required: [
          'Review recent interaction history',
          'Prepare value-add discussion topics',
          'Check for any pending items'
        ],
        success_indicators: [
          'Successful contact made',
          'Next interaction scheduled',
          'Relationship status confirmed'
        ],
        estimated_duration: 30
      })
    }

    // Growth opportunity actions
    for (const opportunity of analytics.engagement_patterns.growth_opportunity_indicators) {
      if (opportunity.confidence > 80) {
        actions.push({
          action_type: 'meeting',
          priority: 'medium',
          suggested_timing: 'Next 2-3 weeks',
          target_contacts: ['Key stakeholders'],
          objective: `Explore ${opportunity.opportunity_type} opportunity`,
          preparation_required: opportunity.required_actions,
          success_indicators: [
            'Opportunity qualification completed',
            'Next steps defined',
            'Timeline established'
          ],
          estimated_duration: 90
        })
      }
    }

    return actions.sort((a, b) => this.priorityToNumber(b.priority) - this.priorityToNumber(a.priority))
  }

  // =============================================================================
  // DATA RETRIEVAL HELPERS
  // =============================================================================

  /**
   * Get all interactions for a principal across all distributors
   */
  private async getAllPrincipalInteractions(principalId: string): Promise<InteractionListItem[]> {
    // Get interactions where the principal is directly involved
    const { data: directInteractions, error: directError } = await this.supabase
      .from('interactions')
      .select(`
        *,
        organization:organizations(id, name, type),
        contact:contacts(id, first_name, last_name, email),
        opportunity:opportunities(id, name, stage, principal_organization_id)
      `)
      .eq('organization_id', principalId)

    if (directError) throw directError

    // Get interactions from opportunities where this principal is involved
    const { data: opportunityInteractions, error: oppError } = await this.supabase
      .from('interactions')
      .select(`
        *,
        organization:organizations(id, name, type),
        contact:contacts(id, first_name, last_name, email),
        opportunity:opportunities!inner(id, name, stage, principal_organization_id)
      `)
      .eq('opportunity.principal_organization_id', principalId)

    if (oppError) throw oppError

    // Combine and deduplicate
    const allInteractions = [
      ...(directInteractions || []),
      ...(opportunityInteractions || [])
    ]

    // Remove duplicates based on ID
    const uniqueInteractions = allInteractions.filter(
      (interaction, index, self) => 
        self.findIndex(i => i.id === interaction.id) === index
    )

    return uniqueInteractions.sort(
      (a, b) => new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime()
    )
  }

  /**
   * Get principal organization details
   */
  private async getPrincipalDetails(principalId: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', principalId)
      .eq('type', 'principal')
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get distributor relationships for a principal
   */
  private async getDistributorRelationships(principalId: string) {
    const { data, error } = await this.supabase
      .from('principal_distributor_relationships')
      .select(`
        *,
        distributor:organizations!distributor_id(id, name, type),
        principal:organizations!principal_id(id, name, type)
      `)
      .eq('principal_id', principalId)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  /**
   * Get all principals for batch processing
   */
  private async getAllPrincipals(filter: EngagementAnalyticsFilter = []): Promise<Organization[]> {
    let query = this.supabase
      .from('organizations')
      .select('*')
      .eq('type', 'principal')

    if (filter.principal_ids) {
      query = query.in('id', filter.principal_ids)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  // =============================================================================
  // ANALYSIS HELPER METHODS
  // =============================================================================

  /**
   * Analyze interaction frequency patterns
   */
  private analyzeInteractionFrequency(interactions: InteractionListItem[]): InteractionFrequencyPattern {
    if (interactions.length === 0) {
      return {
        current_frequency: 0,
        historical_average: 0,
        frequency_trend: 'stable',
        consistency_coefficient: 0,
        seasonal_factor: 1
      }
    }

    // Calculate monthly frequency for last 6 months
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000))
    const recentInteractions = interactions.filter(
      i => new Date(i.interaction_date) >= sixMonthsAgo
    )

    const currentFrequency = (recentInteractions.length / 6) // per month

    // Calculate historical average (all time)
    const firstInteractionDate = new Date(interactions[interactions.length - 1].interaction_date)
    const totalMonths = Math.max(1, (now.getTime() - firstInteractionDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    const historicalAverage = interactions.length / totalMonths

    // Determine trend
    const trend = currentFrequency > historicalAverage * 1.1 ? 'increasing' :
                 currentFrequency < historicalAverage * 0.9 ? 'decreasing' : 'stable'

    // Calculate consistency (coefficient of variation)
    const monthlyVolumes = this.getMonthlyVolumes(interactions)
    const consistencyCoefficient = this.calculateConsistencyCoefficient(monthlyVolumes)

    return {
      current_frequency: Math.round(currentFrequency * 10) / 10,
      historical_average: Math.round(historicalAverage * 10) / 10,
      frequency_trend: trend,
      consistency_coefficient: consistencyCoefficient,
      seasonal_factor: 1.0 // TODO: Implement seasonal analysis
    }
  }

  /**
   * Calculate consistency coefficient from monthly volumes
   */
  private calculateConsistencyCoefficient(monthlyVolumes: number[]): number {
    if (monthlyVolumes.length < 2) return 1

    const mean = monthlyVolumes.reduce((sum, vol) => sum + vol, 0) / monthlyVolumes.length
    const variance = monthlyVolumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / monthlyVolumes.length
    const stdDev = Math.sqrt(variance)
    
    // Coefficient of variation (lower = more consistent)
    const cv = mean === 0 ? 0 : stdDev / mean
    
    // Convert to consistency score (0-1, higher = more consistent)
    return Math.max(0, Math.min(1, 1 - cv))
  }

  /**
   * Get monthly interaction volumes
   */
  private getMonthlyVolumes(interactions: InteractionListItem[]): number[] {
    const monthlyVolumes: Record<string, number> = {}

    interactions.forEach(interaction => {
      const date = new Date(interaction.interaction_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyVolumes[monthKey] = (monthlyVolumes[monthKey] || 0) + 1
    })

    return Object.values(monthlyVolumes)
  }

  /**
   * Calculate overall health score from components
   */
  private calculateOverallHealthScore(components: HealthComponent[]): number {
    const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
    const weightedScore = components.reduce((sum, comp) => sum + (comp.score * comp.weight), 0)
    
    return totalWeight === 0 ? 0 : Math.round(weightedScore / totalWeight)
  }

  /**
   * Calculate communication health component
   */
  private calculateCommunicationHealth(interactions: InteractionListItem[]): HealthComponent {
    if (interactions.length === 0) {
      return {
        score: 0,
        weight: 0.3,
        trend: 'stable',
        key_indicators: ['No interactions recorded'],
        improvement_potential: 100
      }
    }

    // Factors for communication health
    const recentActivityScore = this.getRecentActivityScore(interactions)
    const diversityScore = this.getInteractionDiversityScore(interactions)
    const responseScore = this.getResponseQualityScore(interactions)

    const score = Math.round((recentActivityScore * 0.4 + diversityScore * 0.3 + responseScore * 0.3))

    return {
      score,
      weight: 0.3,
      trend: this.calculateTrendDirection(interactions, 'communication'),
      key_indicators: [
        `Recent activity: ${recentActivityScore}/100`,
        `Interaction diversity: ${diversityScore}/100`,
        `Response quality: ${responseScore}/100`
      ],
      improvement_potential: Math.max(0, 100 - score)
    }
  }

  /**
   * Calculate response health component
   */
  private calculateResponseHealth(interactions: InteractionListItem[]): HealthComponent {
    // Implementation for response health calculation
    const avgResponseTime = this.calculateAverageResponseTime(interactions)
    const responseRate = this.calculateResponseRate(interactions)

    const score = Math.min(100, Math.round(
      (responseRate * 0.6) + ((120 - Math.min(120, avgResponseTime)) / 120 * 100 * 0.4)
    ))

    return {
      score,
      weight: 0.25,
      trend: this.calculateTrendDirection(interactions, 'response'),
      key_indicators: [
        `Average response time: ${avgResponseTime} hours`,
        `Response rate: ${responseRate}%`
      ],
      improvement_potential: Math.max(0, 100 - score)
    }
  }

  /**
   * Calculate engagement depth health component
   */
  private calculateEngagementDepthHealth(interactions: InteractionListItem[]): HealthComponent {
    const avgDuration = this.calculateAverageEngagementDuration(interactions)
    const followUpRate = this.calculateFollowUpRate(interactions)
    const outcomeQuality = this.calculateOutcomeQuality(interactions)

    const score = Math.round((avgDuration * 0.3 + followUpRate * 0.35 + outcomeQuality * 0.35))

    return {
      score,
      weight: 0.25,
      trend: this.calculateTrendDirection(interactions, 'depth'),
      key_indicators: [
        `Average engagement duration: ${avgDuration} minutes`,
        `Follow-up completion rate: ${followUpRate}%`,
        `Outcome quality score: ${outcomeQuality}/100`
      ],
      improvement_potential: Math.max(0, 100 - score)
    }
  }

  /**
   * Calculate consistency health component
   */
  private calculateConsistencyHealth(interactions: InteractionListItem[]): HealthComponent {
    const monthlyVolumes = this.getMonthlyVolumes(interactions)
    const consistencyCoeff = this.calculateConsistencyCoefficient(monthlyVolumes)
    const score = Math.round(consistencyCoeff * 100)

    return {
      score,
      weight: 0.2,
      trend: this.calculateTrendDirection(interactions, 'consistency'),
      key_indicators: [
        `Consistency coefficient: ${consistencyCoeff.toFixed(2)}`,
        `Monthly interaction variance: ${this.calculateVariance(monthlyVolumes).toFixed(1)}`
      ],
      improvement_potential: Math.max(0, 100 - score)
    }
  }

  // =============================================================================
  // UTILITY AND HELPER METHODS
  // =============================================================================

  private getRecentActivityScore(interactions: InteractionListItem[]): number {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    const recentCount = interactions.filter(i => new Date(i.interaction_date) >= thirtyDaysAgo).length
    
    // Score based on recent activity (0-100 scale)
    return Math.min(100, recentCount * 10)
  }

  private getInteractionDiversityScore(interactions: InteractionListItem[]): number {
    const types = new Set(interactions.map(i => i.type))
    return Math.min(100, types.size * 12.5) // Max score at 8 different types
  }

  private getResponseQualityScore(interactions: InteractionListItem[]): number {
    const withOutcome = interactions.filter(i => i.outcome && i.outcome.trim() !== '')
    return interactions.length === 0 ? 0 : Math.round((withOutcome.length / interactions.length) * 100)
  }

  private calculateAverageResponseTime(interactions: InteractionListItem[]): number {
    // Simplified calculation - in real implementation, track actual response times
    return 24 // Default 24 hours
  }

  private calculateResponseRate(interactions: InteractionListItem[]): number {
    // Simplified calculation
    const outbound = interactions.filter(i => ['call', 'email'].includes(i.type))
    const responded = outbound.filter(i => i.follow_up_required === false)
    return outbound.length === 0 ? 100 : Math.round((responded.length / outbound.length) * 100)
  }

  private calculateAverageEngagementDuration(interactions: InteractionListItem[]): number {
    const withDuration = interactions.filter(i => i.duration_minutes && i.duration_minutes > 0)
    if (withDuration.length === 0) return 0
    
    const totalDuration = withDuration.reduce((sum, i) => sum + (i.duration_minutes || 0), 0)
    return Math.round(totalDuration / withDuration.length)
  }

  private calculateFollowUpRate(interactions: InteractionListItem[]): number {
    const requireFollowUp = interactions.filter(i => i.follow_up_required)
    const completedFollowUp = requireFollowUp.filter(i => i.follow_up_date && new Date(i.follow_up_date) < new Date())
    return requireFollowUp.length === 0 ? 100 : Math.round((completedFollowUp.length / requireFollowUp.length) * 100)
  }

  private calculateOutcomeQuality(interactions: InteractionListItem[]): number {
    // Simplified quality scoring based on outcome presence and positivity
    const withOutcome = interactions.filter(i => i.outcome && i.outcome.trim() !== '')
    if (withOutcome.length === 0) return 0

    // Basic sentiment analysis on outcomes (in real implementation, use proper sentiment analysis)
    const positiveWords = ['successful', 'positive', 'agreed', 'interested', 'approved', 'good', 'excellent']
    const positiveOutcomes = withOutcome.filter(i => 
      positiveWords.some(word => i.outcome!.toLowerCase().includes(word))
    )

    return Math.round((positiveOutcomes.length / withOutcome.length) * 100)
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return variance
  }

  private calculateTrendDirection(interactions: InteractionListItem[], metric: string): 'improving' | 'stable' | 'declining' {
    // Simplified trend calculation - compare recent vs historical performance
    return 'stable' // Default implementation
  }

  private getLastInteractionDate(interactions: InteractionListItem[]): string | null {
    return interactions.length > 0 ? interactions[0].interaction_date : null
  }

  private getFirstInteractionDate(interactions: InteractionListItem[]): string | null {
    return interactions.length > 0 ? interactions[interactions.length - 1].interaction_date : null
  }

  private calculateDaysSinceLastInteraction(interactions: InteractionListItem[]): number | null {
    if (interactions.length === 0) return null
    
    const lastInteraction = new Date(interactions[0].interaction_date)
    const now = new Date()
    return Math.floor((now.getTime() - lastInteraction.getTime()) / (24 * 60 * 60 * 1000))
  }

  private calculateNextComputationDue(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString()
  }

  private calculateOverallRiskScore(riskFactors: RelationshipRiskFactor[]): number {
    if (riskFactors.length === 0) return 0
    
    const weightedRisk = riskFactors.reduce((sum, factor) => {
      const severityWeight = factor.severity === 'critical' ? 1.0 : 
                           factor.severity === 'high' ? 0.8 :
                           factor.severity === 'medium' ? 0.6 : 0.3
      return sum + (factor.impact_score * severityWeight * (factor.probability / 100))
    }, 0)
    
    return Math.min(100, Math.round(weightedRisk / riskFactors.length))
  }

  private priorityToNumber(priority: string): number {
    switch (priority) {
      case 'critical': return 4
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  private passesFilter(analytics: PrincipalEngagementAnalytics, filter: EngagementAnalyticsFilter): boolean {
    // Implement filtering logic
    return true // Default implementation
  }

  // Empty data structure methods for optional analytics
  private getEmptyEngagementPatterns(): EngagementPatternAnalytics {
    return {
      interaction_frequency: {
        current_frequency: 0,
        historical_average: 0,
        frequency_trend: 'stable',
        consistency_coefficient: 0,
        seasonal_factor: 1
      },
      seasonal_patterns: [],
      weekly_patterns: {
        day_of_week_preferences: {},
        best_contact_times: [],
        worst_contact_times: [],
        timezone_considerations: []
      },
      preferred_interaction_types: [],
      response_time_patterns: {
        average_response_time_hours: 0,
        median_response_time_hours: 0,
        response_time_trend: 'stable',
        response_consistency_score: 0,
        fast_response_threshold: 4,
        slow_response_threshold: 48,
        response_time_percentiles: { p25: 0, p50: 0, p75: 0, p95: 0 }
      },
      consistency_score: 0,
      engagement_velocity: 0,
      engagement_depth: 0,
      predicted_next_interaction: null,
      churn_risk_indicators: [],
      growth_opportunity_indicators: []
    }
  }

  private getEmptyHealthMetrics(): RelationshipHealthMetrics {
    return {
      overall_health_score: 0,
      health_trend: 'stable',
      communication_health: { score: 0, weight: 0.3, trend: 'stable', key_indicators: [], improvement_potential: 0 },
      response_health: { score: 0, weight: 0.25, trend: 'stable', key_indicators: [], improvement_potential: 0 },
      engagement_depth_health: { score: 0, weight: 0.25, trend: 'stable', key_indicators: [], improvement_potential: 0 },
      consistency_health: { score: 0, weight: 0.2, trend: 'stable', key_indicators: [], improvement_potential: 0 },
      trust_level: 'low',
      partnership_depth: 'exploratory',
      relationship_maturity: 'new',
      warning_flags: [],
      positive_indicators: [],
      health_percentile: 0,
      improvement_recommendations: []
    }
  }

  private getEmptyCommunicationTrends(): CommunicationTrendAnalytics {
    return {
      interaction_volume_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
      response_rate_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
      initiative_ratio_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
      interaction_quality_trend: {
        outcome_ratings_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
        interaction_depth_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
        follow_through_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
        satisfaction_indicators_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] }
      },
      engagement_depth_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
      follow_through_rate_trend: { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] },
      interaction_type_evolution: [],
      channel_preference_shifts: [],
      trend_forecast: [],
      seasonal_adjustments: []
    }
  }

  // Placeholder methods for complex analysis (to be implemented based on business rules)
  private analyzeSeasonalPatterns(interactions: InteractionListItem[]) { return [] }
  private analyzeWeeklyPatterns(interactions: InteractionListItem[]) { return this.getEmptyEngagementPatterns().weekly_patterns }
  private analyzeInteractionTypePreferences(interactions: InteractionListItem[]) { return [] }
  private analyzeResponseTimePatterns(interactions: InteractionListItem[]) { return this.getEmptyEngagementPatterns().response_time_patterns }
  private calculateConsistencyScore(interactions: InteractionListItem[]) { return 0 }
  private calculateEngagementVelocity(interactions: InteractionListItem[]) { return 0 }
  private calculateEngagementDepth(interactions: InteractionListItem[]) { return 0 }
  private predictNextInteraction(interactions: InteractionListItem[]) { return null }
  private calculateHealthTrend(interactions: InteractionListItem[]) { return 'stable' as const }
  private assessTrustLevel(interactions: InteractionListItem[], relationships: any[]) { return 'medium' as const }
  private assessPartnershipDepth(interactions: InteractionListItem[], relationships: any[]) { return 'transactional' as const }
  private assessRelationshipMaturity(interactions: InteractionListItem[], relationships: any[]) { return 'developing' as const }
  private async generateWarningFlags(principalId: string, interactions: InteractionListItem[]) { return [] }
  private async generatePositiveIndicators(principalId: string, interactions: InteractionListItem[]) { return [] }
  private async calculateHealthPercentile(principalId: string, healthScore: number) { return 50 }
  private async generateHealthRecommendations(...args: any[]) { return [] }
  private buildEngagementTimeline(interactions: InteractionListItem[]): EngagementTimelinePoint[] { return [] }
  private async buildDistributorSummaries(relationships: any[], interactions: InteractionListItem[]): Promise<DistributorRelationshipSummary[]> { return [] }

  // Risk assessment placeholder methods
  private assessCommunicationGapRisk(interactions: InteractionListItem[]): RelationshipRiskFactor | null { return null }
  private assessDecliningEngagementRisk(interactions: InteractionListItem[]): RelationshipRiskFactor | null { return null }
  private assessContractExpirationRisks(relationships: any[]): RelationshipRiskFactor[] { return [] }
  private async assessKeyContactRisks(principalId: string, interactions: InteractionListItem[]): Promise<RelationshipRiskFactor[]> { return [] }
  private async assessCompetitorActivityRisk(principalId: string, interactions: InteractionListItem[]): Promise<RelationshipRiskFactor[]> { return [] }

  // Churn and growth placeholder methods
  private hasDeclineInInteractionFrequency(interactions: InteractionListItem[]): boolean { return false }
  private hasResponseTimeDegradation(interactions: InteractionListItem[]): boolean { return false }
  private assessSentimentDecline(interactions: InteractionListItem[]): ChurnRiskIndicator | null { return null }
  private hasIncreasingEngagement(interactions: InteractionListItem[]): boolean { return false }
  private assessTerritoryExpansion(interactions: InteractionListItem[]): GrowthOpportunityIndicator | null { return null }
  private assessStrategicPartnershipOpportunity(interactions: InteractionListItem[]): GrowthOpportunityIndicator | null { return null }

  // Trend analysis placeholder methods
  private analyzeInteractionVolumeTrend(interactions: InteractionListItem[]): TrendAnalysis { 
    return { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] }
  }
  private analyzeResponseRateTrend(interactions: InteractionListItem[]): TrendAnalysis { 
    return { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] }
  }
  private analyzeInitiativeRatioTrend(interactions: InteractionListItem[]): TrendAnalysis {
    return { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] }
  }
  private analyzeInteractionQualityTrend(interactions: InteractionListItem[]) {
    return this.getEmptyCommunicationTrends().interaction_quality_trend
  }
  private analyzeEngagementDepthTrend(interactions: InteractionListItem[]): TrendAnalysis {
    return { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] }
  }
  private analyzeFollowThroughRateTrend(interactions: InteractionListItem[]): TrendAnalysis {
    return { current_value: 0, previous_period_value: 0, change_percentage: 0, trend_direction: 'stable', confidence: 0, data_points: [] }
  }
  private analyzeInteractionTypeEvolution(interactions: InteractionListItem[]) { return [] }
  private analyzeChannelPreferenceShifts(interactions: InteractionListItem[]) { return [] }
  private generateTrendForecast(interactions: InteractionListItem[]) { return [] }
  private calculateSeasonalAdjustments(interactions: InteractionListItem[]) { return [] }
}

// Export service instance
export const engagementAggregationService = new EngagementAggregationService()

// Export types
export type {
  PrincipalEngagementAnalytics,
  EngagementPatternAnalytics,
  RelationshipHealthMetrics,
  CommunicationTrendAnalytics,
  RelationshipRiskFactor,
  ChurnRiskIndicator,
  GrowthOpportunityIndicator
} from '../types/engagement.types'