/**
 * Dashboard Store - Principal-centric relationship health analytics
 * 
 * This store manages dashboard data with focus on relationship strength
 * and principal performance metrics rather than deal values
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  PrincipalOrganization,
  OrganizationSummary 
} from '@/types/organizations.types'
import type { 
  InteractionSummary,
  InteractionActivityMetrics,
  ActivityFeedItem 
} from '@/types/interactions.types'

// =============================================================================
// RELATIONSHIP HEALTH TYPES
// =============================================================================

export interface RelationshipHealthScore {
  principal_id: string
  principal_name: string
  overall_score: number // 0-100
  engagement_score: number // 0-100
  response_quality_score: number // 0-100  
  progression_score: number // 0-100
  recency_score: number // 0-100
  health_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  trending: 'up' | 'down' | 'stable'
  last_interaction_date: string | null
  days_since_interaction: number | null
  risk_factors: string[]
  strengths: string[]
}

export interface PrincipalOverviewCard {
  principal: PrincipalOrganization
  health_score: RelationshipHealthScore
  activity_summary: PrincipalActivitySummary
  key_metrics: PrincipalKeyMetrics
}

export interface PrincipalActivitySummary {
  total_interactions: number
  interactions_last_30_days: number
  response_rate: number
  avg_response_time_hours: number
  engagement_frequency: 'high' | 'medium' | 'low'
  communication_channels: Array<{ type: string; count: number; percentage: number }>
}

export interface PrincipalKeyMetrics {
  distributor_count: number
  active_opportunities: number
  pipeline_momentum: 'accelerating' | 'steady' | 'slowing'
  relationship_depth: 'strategic' | 'operational' | 'transactional'
  account_penetration: number // 0-100 percentage
}

export interface DashboardFilters {
  date_range: {
    start: string
    end: string
    preset?: '7d' | '30d' | '90d' | '12m' | 'ytd' | 'custom'
  }
  health_status?: ('excellent' | 'good' | 'fair' | 'poor' | 'critical')[]
  principal_types?: string[]
  activity_level?: ('high' | 'medium' | 'low')[]
  risk_level?: ('high' | 'medium' | 'low')[]
}

// =============================================================================
// DASHBOARD STORE
// =============================================================================

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)
  
  const filters = ref<DashboardFilters>({
    date_range: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: '30d'
    }
  })
  
  const principalOverviewCards = ref<PrincipalOverviewCard[]>([])
  const activityFeed = ref<ActivityFeedItem[]>([])
  const overallMetrics = ref({
    total_principals: 0,
    avg_health_score: 0,
    health_distribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0
    },
    at_risk_relationships: 0,
    trending_up: 0,
    trending_down: 0
  })

  // =============================================================================
  // RELATIONSHIP HEALTH ALGORITHM
  // =============================================================================

  /**
   * Calculate relationship health score based on multiple factors
   */
  function calculateRelationshipHealth(
    interactions: InteractionSummary[],
    organizationData: PrincipalOrganization,
    activityMetrics?: InteractionActivityMetrics[]
  ): RelationshipHealthScore {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    // Get recent interactions
    const recentInteractions = interactions.filter(i => 
      new Date(i.scheduled_at || i.completed_at || '') >= thirtyDaysAgo
    )
    
    const lastInteraction = interactions
      .sort((a, b) => new Date(b.completed_at || b.scheduled_at || '').getTime() - 
                      new Date(a.completed_at || a.scheduled_at || '').getTime())[0]
    
    const daysSinceLastInteraction = lastInteraction 
      ? Math.floor((now.getTime() - new Date(lastInteraction.completed_at || lastInteraction.scheduled_at || '').getTime()) / (24 * 60 * 60 * 1000))
      : null

    // 1. ENGAGEMENT FREQUENCY SCORE (0-100)
    const interactionCount30d = recentInteractions.length
    const expectedInteractionFrequency = getExpectedFrequency(organizationData)
    const engagementScore = Math.min(100, (interactionCount30d / expectedInteractionFrequency) * 100)

    // 2. RESPONSE QUALITY SCORE (0-100)
    const completedInteractions = recentInteractions.filter(i => i.completed_at)
    const responseRate = completedInteractions.length / Math.max(1, recentInteractions.length)
    const avgMetrics = activityMetrics?.length ? 
      activityMetrics.reduce((acc, m) => ({
        engagement: acc.engagement + (m.engagement_score || 5),
        count: acc.count + 1
      }), { engagement: 0, count: 0 }) : null
    
    const avgEngagementScore = avgMetrics ? avgMetrics.engagement / avgMetrics.count : 5
    const responseQualityScore = (responseRate * 50) + (avgEngagementScore * 10)

    // 3. RELATIONSHIP PROGRESSION SCORE (0-100)
    const opportunityGrowth = Math.min(100, organizationData.active_opportunities * 10)
    const distributorGrowth = Math.min(100, organizationData.distributor_count * 5)
    const progressionScore = (opportunityGrowth * 0.6) + (distributorGrowth * 0.4)

    // 4. RECENCY SCORE (0-100)
    const recencyScore = daysSinceLastInteraction === null ? 0 :
      daysSinceLastInteraction <= 7 ? 100 :
      daysSinceLastInteraction <= 14 ? 80 :
      daysSinceLastInteraction <= 30 ? 60 :
      daysSinceLastInteraction <= 60 ? 40 :
      daysSinceLastInteraction <= 90 ? 20 : 0

    // OVERALL SCORE (weighted average)
    const overallScore = Math.round(
      (engagementScore * 0.3) +
      (responseQualityScore * 0.25) +
      (progressionScore * 0.25) +
      (recencyScore * 0.2)
    )

    // HEALTH STATUS
    const healthStatus: RelationshipHealthScore['health_status'] =
      overallScore >= 80 ? 'excellent' :
      overallScore >= 65 ? 'good' :
      overallScore >= 50 ? 'fair' :
      overallScore >= 35 ? 'poor' : 'critical'

    // TRENDING ANALYSIS
    const olderInteractions = interactions.filter(i => 
      new Date(i.scheduled_at || i.completed_at || '') >= ninetyDaysAgo &&
      new Date(i.scheduled_at || i.completed_at || '') < thirtyDaysAgo
    )
    
    const trending: RelationshipHealthScore['trending'] = 
      recentInteractions.length > olderInteractions.length ? 'up' :
      recentInteractions.length < olderInteractions.length ? 'down' : 'stable'

    // RISK FACTORS & STRENGTHS
    const riskFactors: string[] = []
    const strengths: string[] = []

    if (daysSinceLastInteraction && daysSinceLastInteraction > 30) {
      riskFactors.push('No recent contact')
    }
    if (responseRate < 0.5) {
      riskFactors.push('Low response rate')
    }
    if (interactionCount30d < expectedInteractionFrequency * 0.5) {
      riskFactors.push('Below expected interaction frequency')
    }

    if (responseRate > 0.8) {
      strengths.push('High response rate')
    }
    if (organizationData.active_opportunities > 3) {
      strengths.push('Multiple active opportunities')
    }
    if (interactionCount30d > expectedInteractionFrequency * 1.2) {
      strengths.push('High engagement level')
    }

    return {
      principal_id: organizationData.id,
      principal_name: organizationData.name,
      overall_score: overallScore,
      engagement_score: Math.round(engagementScore),
      response_quality_score: Math.round(responseQualityScore),
      progression_score: Math.round(progressionScore),
      recency_score: Math.round(recencyScore),
      health_status: healthStatus,
      trending,
      last_interaction_date: lastInteraction?.completed_at || lastInteraction?.scheduled_at || null,
      days_since_interaction: daysSinceLastInteraction,
      risk_factors: riskFactors,
      strengths
    }
  }

  /**
   * Determine expected interaction frequency based on organization characteristics
   */
  function getExpectedFrequency(org: PrincipalOrganization): number {
    // Base frequency expectations (interactions per 30 days)
    let baseFrequency = 2

    // Adjust based on organization size and activity
    if (org.active_opportunities > 5) baseFrequency += 2
    if (org.distributor_count > 10) baseFrequency += 1
    if (org.annual_revenue && org.annual_revenue > 10000000) baseFrequency += 1

    return baseFrequency
  }

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  const healthScoreDistribution = computed(() => {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0, critical: 0 }
    principalOverviewCards.value.forEach(card => {
      distribution[card.health_score.health_status]++
    })
    return distribution
  })

  const averageHealthScore = computed(() => {
    if (principalOverviewCards.value.length === 0) return 0
    const total = principalOverviewCards.value.reduce((sum, card) => sum + card.health_score.overall_score, 0)
    return Math.round(total / principalOverviewCards.value.length)
  })

  const atRiskPrincipals = computed(() => {
    return principalOverviewCards.value.filter(card => 
      card.health_score.health_status === 'poor' || 
      card.health_score.health_status === 'critical' ||
      card.health_score.risk_factors.length > 2
    )
  })

  const trendingPrincipals = computed(() => {
    return {
      up: principalOverviewCards.value.filter(card => card.health_score.trending === 'up'),
      down: principalOverviewCards.value.filter(card => card.health_score.trending === 'down')
    }
  })

  // =============================================================================
  // ACTIONS
  // =============================================================================

  /**
   * Load dashboard data
   */
  async function loadDashboardData() {
    isLoading.value = true
    error.value = null

    try {
      // This would typically call multiple services
      // For now, we'll simulate the data loading
      await simulateDataLoad()
      
      lastUpdated.value = new Date().toISOString()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load dashboard data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update dashboard filters
   */
  function updateFilters(newFilters: Partial<DashboardFilters>) {
    filters.value = { ...filters.value, ...newFilters }
    loadDashboardData()
  }

  /**
   * Set date range preset
   */
  function setDateRangePreset(preset: DashboardFilters['date_range']['preset']) {
    const now = new Date()
    let start: Date

    switch (preset) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '12m':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      case 'ytd':
        start = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return
    }

    updateFilters({
      date_range: {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
        preset
      }
    })
  }

  /**
   * Refresh dashboard data
   */
  async function refresh() {
    await loadDashboardData()
  }

  /**
   * Simulate data loading (to be replaced with actual API calls)
   */
  async function simulateDataLoad() {
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  return {
    // State
    isLoading,
    error,
    lastUpdated,
    filters,
    principalOverviewCards,
    activityFeed,
    overallMetrics,

    // Computed
    healthScoreDistribution,
    averageHealthScore,
    atRiskPrincipals,
    trendingPrincipals,

    // Actions
    loadDashboardData,
    updateFilters,
    setDateRangePreset,
    refresh,
    calculateRelationshipHealth
  }
})