/**
 * Engagement Analytics Store
 * 
 * Pinia store for managing engagement analytics state and operations
 * Provides reactive state management for relationship health and engagement patterns
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { engagementAggregationService } from '../services/engagementAggregation.service'
import type { 
  PrincipalEngagementAnalytics,
  EngagementAnalyticsFilter,
  EngagementQueryOptions,
  EngagementRecommendation,
  NextBestAction,
  RelationshipRiskFactor,
  ChurnRiskIndicator,
  GrowthOpportunityIndicator,
  RelationshipHealthMetrics,
  EngagementPatternAnalytics,
  CommunicationTrendAnalytics,
  RelationshipBenchmark,
  PrincipalComparisonReport,
  RelationshipStage
} from '../types/engagement.types'

export const useEngagementStore = defineStore('engagement', () => {
  
  // =============================================================================
  // STATE
  // =============================================================================
  
  // Core engagement analytics
  const principalEngagements = ref<Map<string, PrincipalEngagementAnalytics>>(new Map())
  const currentPrincipalId = ref<string | null>(null)
  const allEngagements = ref<PrincipalEngagementAnalytics[]>([])
  
  // Loading and error states
  const isLoading = ref(false)
  const isLoadingAll = ref(false)
  const isLoadingRecommendations = ref(false)
  const error = ref<string | null>(null)
  
  // Recommendations and actions
  const recommendations = ref<Map<string, EngagementRecommendation[]>>(new Map())
  const nextBestActions = ref<Map<string, NextBestAction[]>>(new Map())
  
  // Analytics components
  const riskFactors = ref<Map<string, RelationshipRiskFactor[]>>(new Map())
  const churnRisks = ref<Map<string, ChurnRiskIndicator[]>>(new Map())
  const growthOpportunities = ref<Map<string, GrowthOpportunityIndicator[]>>(new Map())
  
  // Comparison and benchmarking
  const comparisonReport = ref<PrincipalComparisonReport | null>(null)
  const benchmarkData = ref<Map<string, RelationshipBenchmark>>(new Map())
  
  // Cache and performance
  const lastUpdated = ref<Map<string, string>>(new Map())
  const cacheTimeout = ref(15) // minutes
  
  // Filters and options
  const currentFilter = ref<EngagementAnalyticsFilter>({})
  const defaultOptions = ref<EngagementQueryOptions>({
    include_patterns: true,
    include_health_metrics: true,
    include_risk_factors: true,
    include_trends: true,
    include_forecasts: false,
    include_recommendations: true,
    cache_timeout_minutes: 15
  })

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /**
   * Current principal engagement analytics
   */
  const currentEngagement = computed((): PrincipalEngagementAnalytics | null => {
    return currentPrincipalId.value 
      ? principalEngagements.value.get(currentPrincipalId.value) || null 
      : null
  })

  /**
   * Current principal's relationship health
   */
  const currentHealthMetrics = computed((): RelationshipHealthMetrics | null => {
    return currentEngagement.value?.relationship_health || null
  })

  /**
   * Current principal's engagement patterns
   */
  const currentEngagementPatterns = computed((): EngagementPatternAnalytics | null => {
    return currentEngagement.value?.engagement_patterns || null
  })

  /**
   * Current principal's communication trends
   */
  const currentCommunicationTrends = computed((): CommunicationTrendAnalytics | null => {
    return currentEngagement.value?.communication_trends || null
  })

  /**
   * Current principal's recommendations
   */
  const currentRecommendations = computed((): EngagementRecommendation[] => {
    return currentPrincipalId.value 
      ? recommendations.value.get(currentPrincipalId.value) || []
      : []
  })

  /**
   * Current principal's next best actions
   */
  const currentNextBestActions = computed((): NextBestAction[] => {
    return currentPrincipalId.value 
      ? nextBestActions.value.get(currentPrincipalId.value) || []
      : []
  })

  /**
   * High-risk principals across all engagements
   */
  const highRiskPrincipals = computed((): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(engagement => engagement.risk_score >= 75)
  })

  /**
   * Principals with declining health
   */
  const decliningHealthPrincipals = computed((): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(
      engagement => engagement.relationship_health.health_trend === 'declining'
    )
  })

  /**
   * Principals with growth opportunities
   */
  const growthOpportunityPrincipals = computed((): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(
      engagement => engagement.engagement_patterns.growth_opportunity_indicators.length > 0
    )
  })

  /**
   * Top-performing principals by health score
   */
  const topPerformingPrincipals = computed((): PrincipalEngagementAnalytics[] => {
    return [...allEngagements.value]
      .sort((a, b) => b.relationship_health.overall_health_score - a.relationship_health.overall_health_score)
      .slice(0, 10)
  })

  /**
   * Principals requiring immediate attention
   */
  const immediateAttentionPrincipals = computed((): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(engagement => {
      const hasHighRisk = engagement.risk_score >= 80
      const hasDeclineHealth = engagement.relationship_health.health_trend === 'declining'
      const hasLongGap = engagement.days_since_last_interaction && engagement.days_since_last_interaction > 45
      const hasCriticalRisks = engagement.relationship_risk_factors.some(risk => risk.severity === 'critical')
      
      return hasHighRisk || hasDeclineHealth || hasLongGap || hasCriticalRisks
    })
  })

  /**
   * Summary statistics across all principals
   */
  const summaryStatistics = computed(() => {
    if (allEngagements.value.length === 0) {
      return {
        total_principals: 0,
        average_health_score: 0,
        average_risk_score: 0,
        total_interactions: 0,
        active_distributors: 0,
        high_risk_count: 0,
        growth_opportunity_count: 0
      }
    }

    const totalPrincipals = allEngagements.value.length
    const averageHealthScore = allEngagements.value.reduce(
      (sum, eng) => sum + eng.relationship_health.overall_health_score, 0
    ) / totalPrincipals
    
    const averageRiskScore = allEngagements.value.reduce(
      (sum, eng) => sum + eng.risk_score, 0
    ) / totalPrincipals

    const totalInteractions = allEngagements.value.reduce(
      (sum, eng) => sum + eng.total_interactions, 0
    )

    const activeDistributors = new Set(
      allEngagements.value.flatMap(eng => 
        eng.distributor_relationships.map(rel => rel.distributor_id)
      )
    ).size

    const highRiskCount = highRiskPrincipals.value.length
    const growthOpportunityCount = growthOpportunityPrincipals.value.length

    return {
      total_principals: totalPrincipals,
      average_health_score: Math.round(averageHealthScore * 10) / 10,
      average_risk_score: Math.round(averageRiskScore * 10) / 10,
      total_interactions: totalInteractions,
      active_distributors: activeDistributors,
      high_risk_count: highRiskCount,
      growth_opportunity_count: growthOpportunityCount
    }
  })

  /**
   * Health score distribution
   */
  const healthScoreDistribution = computed(() => {
    const distribution = {
      excellent: 0, // 90-100
      good: 0,      // 75-89
      average: 0,   // 60-74
      poor: 0,      // 40-59
      critical: 0   // 0-39
    }

    allEngagements.value.forEach(engagement => {
      const score = engagement.relationship_health.overall_health_score
      if (score >= 90) distribution.excellent++
      else if (score >= 75) distribution.good++
      else if (score >= 60) distribution.average++
      else if (score >= 40) distribution.poor++
      else distribution.critical++
    })

    return distribution
  })

  /**
   * Check if data is cached and fresh
   */
  const isCached = computed(() => (principalId: string): boolean => {
    if (!principalEngagements.value.has(principalId)) return false
    
    const lastUpdate = lastUpdated.value.get(principalId)
    if (!lastUpdate) return false
    
    const cacheAge = Date.now() - new Date(lastUpdate).getTime()
    const maxAge = cacheTimeout.value * 60 * 1000 // Convert to milliseconds
    
    return cacheAge < maxAge
  })

  // =============================================================================
  // ACTIONS - CORE DATA FETCHING
  // =============================================================================

  /**
   * Load engagement analytics for a specific principal
   */
  const loadPrincipalEngagement = async (
    principalId: string, 
    options: EngagementQueryOptions = {},
    forceRefresh = false
  ): Promise<void> => {
    // Check cache first
    if (!forceRefresh && isCached.value(principalId)) {
      currentPrincipalId.value = principalId
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const mergedOptions = { ...defaultOptions.value, ...options }
      const analytics = await engagementAggregationService.aggregateEngagementByPrincipal(
        principalId,
        mergedOptions
      )

      // Store in reactive state
      principalEngagements.value.set(principalId, analytics)
      lastUpdated.value.set(principalId, new Date().toISOString())
      currentPrincipalId.value = principalId

      // Load additional data if requested
      if (mergedOptions.include_recommendations) {
        await loadRecommendations(principalId)
        await loadNextBestActions(principalId)
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load engagement analytics'
      console.error('Error loading principal engagement:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load engagement analytics for all principals
   */
  const loadAllPrincipalsEngagement = async (
    filter: EngagementAnalyticsFilter = {},
    options: EngagementQueryOptions = {},
    forceRefresh = false
  ): Promise<void> => {
    isLoadingAll.value = true
    error.value = null

    try {
      const mergedOptions = { ...defaultOptions.value, ...options }
      const analytics = await engagementAggregationService.aggregateAllPrincipals(
        filter,
        mergedOptions,
        forceRefresh
      )

      // Store in reactive state
      allEngagements.value = analytics
      
      // Cache individual principal data
      analytics.forEach(engagement => {
        principalEngagements.value.set(engagement.principal_id, engagement)
        lastUpdated.value.set(engagement.principal_id, new Date().toISOString())
      })

      // Update filter state
      currentFilter.value = filter

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load all engagement analytics'
      console.error('Error loading all principals engagement:', err)
    } finally {
      isLoadingAll.value = false
    }
  }

  /**
   * Refresh engagement data for current principal
   */
  const refreshCurrentEngagement = async (): Promise<void> => {
    if (!currentPrincipalId.value) return
    await loadPrincipalEngagement(currentPrincipalId.value, defaultOptions.value, true)
  }

  /**
   * Refresh all engagement data
   */
  const refreshAllEngagements = async (): Promise<void> => {
    await loadAllPrincipalsEngagement(currentFilter.value, defaultOptions.value, true)
  }

  // =============================================================================
  // ACTIONS - RECOMMENDATIONS AND INSIGHTS
  // =============================================================================

  /**
   * Load recommendations for a principal
   */
  const loadRecommendations = async (principalId: string): Promise<void> => {
    try {
      const recs = await engagementAggregationService.generateEngagementRecommendations(principalId)
      recommendations.value.set(principalId, recs)
    } catch (err) {
      console.error('Error loading recommendations:', err)
    }
  }

  /**
   * Load next best actions for a principal
   */
  const loadNextBestActions = async (principalId: string): Promise<void> => {
    try {
      const actions = await engagementAggregationService.getNextBestActions(principalId)
      nextBestActions.value.set(principalId, actions)
    } catch (err) {
      console.error('Error loading next best actions:', err)
    }
  }

  /**
   * Load risk factors for a principal
   */
  const loadRiskFactors = async (principalId: string): Promise<void> => {
    try {
      const risks = await engagementAggregationService.assessRelationshipRisk(principalId)
      riskFactors.value.set(principalId, risks)
    } catch (err) {
      console.error('Error loading risk factors:', err)
    }
  }

  /**
   * Load churn risk indicators for a principal
   */
  const loadChurnRisks = async (principalId: string): Promise<void> => {
    try {
      const risks = await engagementAggregationService.identifyChurnRisk(principalId)
      churnRisks.value.set(principalId, risks)
    } catch (err) {
      console.error('Error loading churn risks:', err)
    }
  }

  /**
   * Load growth opportunities for a principal
   */
  const loadGrowthOpportunities = async (principalId: string): Promise<void> => {
    try {
      const opportunities = await engagementAggregationService.identifyGrowthOpportunities(principalId)
      growthOpportunities.value.set(principalId, opportunities)
    } catch (err) {
      console.error('Error loading growth opportunities:', err)
    }
  }

  // =============================================================================
  // ACTIONS - FILTERING AND SEARCH
  // =============================================================================

  /**
   * Filter principals by health score range
   */
  const filterByHealthScore = (minScore: number, maxScore: number): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(engagement => {
      const score = engagement.relationship_health.overall_health_score
      return score >= minScore && score <= maxScore
    })
  }

  /**
   * Filter principals by risk score range
   */
  const filterByRiskScore = (minScore: number, maxScore: number): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(engagement => {
      const score = engagement.risk_score
      return score >= minScore && score <= maxScore
    })
  }

  /**
   * Filter principals by relationship stage
   */
  const filterByRelationshipStage = (stages: RelationshipStage[]): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(engagement =>
      engagement.distributor_relationships.some(rel => 
        stages.includes(rel.relationship_stage)
      )
    )
  }

  /**
   * Search principals by name
   */
  const searchPrincipals = (query: string): PrincipalEngagementAnalytics[] => {
    if (!query.trim()) return allEngagements.value
    
    const searchTerm = query.toLowerCase()
    return allEngagements.value.filter(engagement =>
      engagement.principal_name.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Get principals requiring specific action types
   */
  const getPrincipalsRequiringAction = (actionType: string): PrincipalEngagementAnalytics[] => {
    return allEngagements.value.filter(engagement => {
      const principalActions = nextBestActions.value.get(engagement.principal_id) || []
      return principalActions.some(action => action.action_type === actionType)
    })
  }

  // =============================================================================
  // ACTIONS - UTILITIES AND HELPERS
  // =============================================================================

  /**
   * Set current principal
   */
  const setCurrentPrincipal = async (principalId: string): Promise<void> => {
    if (principalEngagements.value.has(principalId)) {
      currentPrincipalId.value = principalId
    } else {
      await loadPrincipalEngagement(principalId)
    }
  }

  /**
   * Clear current engagement data
   */
  const clearCurrentEngagement = (): void => {
    currentPrincipalId.value = null
  }

  /**
   * Clear all cached data
   */
  const clearCache = (): void => {
    principalEngagements.value.clear()
    allEngagements.value = []
    recommendations.value.clear()
    nextBestActions.value.clear()
    riskFactors.value.clear()
    churnRisks.value.clear()
    growthOpportunities.value.clear()
    lastUpdated.value.clear()
    currentPrincipalId.value = null
    error.value = null
  }

  /**
   * Update cache timeout
   */
  const setCacheTimeout = (minutes: number): void => {
    cacheTimeout.value = minutes
  }

  /**
   * Get engagement analytics by principal ID
   */
  const getEngagementById = (principalId: string): PrincipalEngagementAnalytics | null => {
    return principalEngagements.value.get(principalId) || null
  }

  /**
   * Check if principal has critical risks
   */
  const hasCriticalRisks = (principalId: string): boolean => {
    const engagement = principalEngagements.value.get(principalId)
    if (!engagement) return false
    
    return engagement.relationship_risk_factors.some(risk => risk.severity === 'critical')
  }

  /**
   * Get health score category
   */
  const getHealthScoreCategory = (score: number): string => {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'average'
    if (score >= 40) return 'poor'
    return 'critical'
  }

  /**
   * Get risk score category
   */
  const getRiskScoreCategory = (score: number): string => {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  /**
   * Export engagement data
   */
  const exportEngagementData = (principalId?: string) => {
    const data = principalId 
      ? principalEngagements.value.get(principalId)
      : allEngagements.value

    return {
      data,
      exported_at: new Date().toISOString(),
      version: '1.0'
    }
  }

  // =============================================================================
  // RETURN STORE INTERFACE
  // =============================================================================

  return {
    // State
    principalEngagements,
    currentPrincipalId,
    allEngagements,
    isLoading,
    isLoadingAll,
    isLoadingRecommendations,
    error,
    recommendations,
    nextBestActions,
    riskFactors,
    churnRisks,
    growthOpportunities,
    comparisonReport,
    benchmarkData,
    lastUpdated,
    cacheTimeout,
    currentFilter,
    defaultOptions,

    // Computed
    currentEngagement,
    currentHealthMetrics,
    currentEngagementPatterns,
    currentCommunicationTrends,
    currentRecommendations,
    currentNextBestActions,
    highRiskPrincipals,
    decliningHealthPrincipals,
    growthOpportunityPrincipals,
    topPerformingPrincipals,
    immediateAttentionPrincipals,
    summaryStatistics,
    healthScoreDistribution,
    isCached,

    // Core Actions
    loadPrincipalEngagement,
    loadAllPrincipalsEngagement,
    refreshCurrentEngagement,
    refreshAllEngagements,

    // Insight Actions
    loadRecommendations,
    loadNextBestActions,
    loadRiskFactors,
    loadChurnRisks,
    loadGrowthOpportunities,

    // Filtering Actions
    filterByHealthScore,
    filterByRiskScore,
    filterByRelationshipStage,
    searchPrincipals,
    getPrincipalsRequiringAction,

    // Utility Actions
    setCurrentPrincipal,
    clearCurrentEngagement,
    clearCache,
    setCacheTimeout,
    getEngagementById,
    hasCriticalRisks,
    getHealthScoreCategory,
    getRiskScoreCategory,
    exportEngagementData
  }
})

// Export store type for use in components
export type EngagementStore = ReturnType<typeof useEngagementStore>