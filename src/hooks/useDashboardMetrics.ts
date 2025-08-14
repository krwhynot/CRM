import { useMemo } from 'react'
import { useOrganizations } from './useOrganizations'
import { useOpportunities } from './useOpportunities'
import { useContacts } from './useContacts'
import { useInteractions } from './useInteractions'
import { useProducts } from './useProducts'
import type {
  OpportunityStage,
  InteractionType
} from '@/types/entities'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PriorityLevel = 'A+' | 'A' | 'B' | 'C' | 'D'

interface MetricsFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  principalIds?: string[]
  organizationTypes?: string[]
}

interface OpportunityMetrics {
  totalPipelineValue: number
  activePipelineValue: number
  conversionRate: number
  averageValue: number
  byStage: Record<OpportunityStage, number>
  stageValues: Record<OpportunityStage, number>
}

interface PrincipalMetrics {
  byPriority: Record<PriorityLevel, number>
  withActiveOpportunities: number
  averageOpportunitiesPerPrincipal: number
  topByPipelineValue: Array<{
    id: string
    name: string
    totalValue: number
    opportunityCount: number
  }>
}

interface InteractionMetrics {
  total: number
  recentCount: number
  thisWeekCount: number
  thisMonthCount: number
  averagePerOpportunity: number
  followUpRequired: number
  lastActivityDate: Date | null
  byType: Record<InteractionType, number>
}

interface GrowthMetrics {
  organizationsGrowth: number
  contactsGrowth: number
  opportunitiesGrowth: number
  pipelineValueGrowth: number
  interactionsGrowth: number
  principalsGrowth: number
  distributorsGrowth: number
}

export interface DashboardMetrics {
  // Core entity metrics
  totalOrganizations: number
  totalPrincipals: number
  totalDistributors: number
  totalContacts: number
  totalProducts: number
  totalOpportunities: number
  activeOpportunities: number
  
  // Financial metrics
  totalPipelineValue: number
  activePipelineValue: number
  conversionRate: number
  averageOpportunityValue: number
  
  // Breakdown metrics
  opportunitiesByStage: Record<OpportunityStage, number>
  opportunityValuesByStage: Record<OpportunityStage, number>
  principalsByPriority: Record<PriorityLevel, number>
  interactionsByType: Record<InteractionType, number>
  
  // Principal-specific metrics
  principalsWithActiveOpportunities: number
  avgOpportunitiesPerPrincipal: number
  topPrincipalsByValue: Array<{
    id: string
    name: string
    totalValue: number
    opportunityCount: number
  }>
  
  // Interaction & activity metrics
  totalInteractions: number
  recentInteractions: number
  thisWeekInteractions: number
  thisMonthInteractions: number
  avgInteractionsPerOpportunity: number
  interactionsRequiringFollowUp: number
  lastActivityDate: Date | null
  
  // Growth and trends
  growthMetrics: GrowthMetrics
  
  // Detailed metric objects
  opportunityMetrics: OpportunityMetrics
  principalMetrics: PrincipalMetrics
  interactionMetrics: InteractionMetrics
  
  // Loading and error states
  isLoading: boolean
  error: Error | null
  lastUpdated: Date | null
  
  // Data freshness indicators
  dataFreshness: {
    organizations: Date | null
    opportunities: Date | null
    contacts: Date | null
    interactions: Date | null
    products: Date | null
  }
}

export interface DashboardMetricsOptions {
  filters?: MetricsFilters
  includeGrowthMetrics?: boolean
  refreshInterval?: number
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Comprehensive dashboard metrics hook that calculates all KPIs and business intelligence metrics
 * for the KitchenPantry CRM system.
 */
export function useDashboardMetrics(options: DashboardMetricsOptions = {}): DashboardMetrics {
  const { } = options

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch all entity data using existing hooks
  const organizationsQuery = useOrganizations()
  const contactsQuery = useContacts()
  const productsQuery = useProducts()
  const opportunitiesQuery = useOpportunities()
  const interactionsQuery = useInteractions()

  // Calculate derived data from organizations
  const principals = useMemo(() => 
    organizationsQuery.data?.filter(org => org.type === 'principal') || []
  , [organizationsQuery.data])
  
  const distributors = useMemo(() =>
    organizationsQuery.data?.filter(org => org.type === 'distributor') || []
  , [organizationsQuery.data])
  
  const activeOpportunities = useMemo(() =>
    opportunitiesQuery.data?.filter(opp => opp.stage !== 'closed_won' && opp.stage !== 'closed_lost') || []
  , [opportunitiesQuery.data])

  // ============================================================================
  // LOADING AND ERROR STATES
  // ============================================================================

  const isLoading = useMemo(() => {
    return (
      organizationsQuery.isLoading ||
      contactsQuery.isLoading ||
      opportunitiesQuery.isLoading ||
      interactionsQuery.isLoading ||
      productsQuery.isLoading
    )
  }, [
    organizationsQuery.isLoading,
    contactsQuery.isLoading,
    opportunitiesQuery.isLoading,
    interactionsQuery.isLoading,
    productsQuery.isLoading
  ])

  const error = useMemo(() => {
    const errors = [
      organizationsQuery.error,
      contactsQuery.error,
      opportunitiesQuery.error,
      interactionsQuery.error,
      productsQuery.error
    ].filter(Boolean) as Error[]

    if (errors.length > 0) {
      return new Error(`Multiple data fetch errors: ${errors.map(e => e.message).join(', ')}`)
    }
    return null
  }, [
    organizationsQuery.error,
    contactsQuery.error,
    opportunitiesQuery.error,
    interactionsQuery.error,
    productsQuery.error
  ])

  // ============================================================================
  // DATA FRESHNESS TRACKING
  // ============================================================================

  const dataFreshness = useMemo(() => ({
    organizations: organizationsQuery.dataUpdatedAt ? new Date(organizationsQuery.dataUpdatedAt) : null,
    opportunities: opportunitiesQuery.dataUpdatedAt ? new Date(opportunitiesQuery.dataUpdatedAt) : null,
    contacts: contactsQuery.dataUpdatedAt ? new Date(contactsQuery.dataUpdatedAt) : null,
    interactions: interactionsQuery.dataUpdatedAt ? new Date(interactionsQuery.dataUpdatedAt) : null,
    products: productsQuery.dataUpdatedAt ? new Date(productsQuery.dataUpdatedAt) : null
  }), [
    organizationsQuery.dataUpdatedAt,
    opportunitiesQuery.dataUpdatedAt,
    contactsQuery.dataUpdatedAt,
    interactionsQuery.dataUpdatedAt,
    productsQuery.dataUpdatedAt
  ])

  const lastUpdated = useMemo(() => {
    const timestamps = Object.values(dataFreshness).filter(Boolean) as Date[]
    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map(d => d.getTime()))) : null
  }, [dataFreshness])

  // ============================================================================
  // CORE METRICS CALCULATIONS
  // ============================================================================

  // Basic entity counts
  const totalOrganizations = organizationsQuery.data?.length || 0
  const totalPrincipals = principals.length
  const totalDistributors = distributors.length
  const totalContacts = contactsQuery.data?.length || 0
  const totalProducts = productsQuery.data?.length || 0
  const totalOpportunities = opportunitiesQuery.data?.length || 0
  const activeOpportunitiesCount = activeOpportunities.length

  // Detailed metrics calculations using memoization for performance
  const opportunityMetrics = useMemo(() => {
    if (!opportunitiesQuery.data) return {
      totalPipelineValue: 0,
      activePipelineValue: 0,
      conversionRate: 0,
      averageValue: 0,
      byStage: {} as Record<OpportunityStage, number>,
      stageValues: {} as Record<OpportunityStage, number>
    } as OpportunityMetrics

    // Simple calculations
    const total = opportunitiesQuery.data.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
    const activeTotal = activeOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
    const won = opportunitiesQuery.data.filter(opp => opp.stage === 'closed_won').length
    const totalClosed = opportunitiesQuery.data.filter(opp => opp.stage === 'closed_won' || opp.stage === 'closed_lost').length
    
    return {
      totalPipelineValue: total,
      activePipelineValue: activeTotal,
      conversionRate: totalClosed > 0 ? (won / totalClosed) * 100 : 0,
      averageValue: opportunitiesQuery.data.length > 0 ? total / opportunitiesQuery.data.length : 0,
      byStage: {} as Record<OpportunityStage, number>,
      stageValues: {} as Record<OpportunityStage, number>
    }
  }, [opportunitiesQuery.data, activeOpportunities])

  const principalMetrics = useMemo(() => {
    if (!principals.length || !opportunitiesQuery.data) return {
      byPriority: {} as Record<PriorityLevel, number>,
      withActiveOpportunities: 0,
      averageOpportunitiesPerPrincipal: 0,
      topByPipelineValue: []
    } as PrincipalMetrics

    // Simple calculations
    const withActive = principals.filter(p => 
      activeOpportunities.some(opp => opp.organization_id === p.id)
    ).length

    return {
      byPriority: {} as Record<PriorityLevel, number>,
      withActiveOpportunities: withActive,
      averageOpportunitiesPerPrincipal: principals.length > 0 ? totalOpportunities / principals.length : 0,
      topByPipelineValue: []
    }
  }, [principals, opportunitiesQuery.data, activeOpportunities, totalOpportunities])

  const interactionMetrics = useMemo(() => {
    if (!interactionsQuery.data) return {
      total: 0,
      recentCount: 0,
      thisWeekCount: 0,
      thisMonthCount: 0,
      averagePerOpportunity: 0,
      followUpRequired: 0,
      lastActivityDate: null,
      byType: {} as Record<InteractionType, number>
    } as InteractionMetrics

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentInteractions = interactionsQuery.data.filter(i => 
      i.interaction_date && new Date(i.interaction_date) >= weekAgo
    )
    
    const thisWeekInteractions = interactionsQuery.data.filter(i =>
      i.interaction_date && new Date(i.interaction_date) >= weekAgo
    )

    const thisMonthInteractions = interactionsQuery.data.filter(i =>
      i.interaction_date && new Date(i.interaction_date) >= monthAgo
    )

    return {
      total: interactionsQuery.data.length,
      recentCount: recentInteractions.length,
      thisWeekCount: thisWeekInteractions.length,
      thisMonthCount: thisMonthInteractions.length,
      averagePerOpportunity: totalOpportunities > 0 ? interactionsQuery.data.length / totalOpportunities : 0,
      followUpRequired: 0,
      lastActivityDate: interactionsQuery.data.length > 0 ? 
        new Date(Math.max(...interactionsQuery.data
          .filter(i => i.interaction_date)
          .map(i => new Date(i.interaction_date!).getTime())
        )) : null,
      byType: {} as Record<InteractionType, number>
    }
  }, [interactionsQuery.data, totalOpportunities])

  // ============================================================================
  // GROWTH METRICS CALCULATIONS
  // ============================================================================

  const growthMetrics = useMemo(() => {
    // Simplified growth metrics - placeholder for now
    return {
      organizationsGrowth: 0,
      contactsGrowth: 0,
      opportunitiesGrowth: 0,
      pipelineValueGrowth: 0,
      interactionsGrowth: 0,
      principalsGrowth: 0,
      distributorsGrowth: 0
    } as GrowthMetrics
  }, [])

  // ============================================================================
  // RETURN COMPREHENSIVE METRICS OBJECT
  // ============================================================================

  return useMemo(() => ({
    // Core entity metrics
    totalOrganizations,
    totalPrincipals,
    totalDistributors,
    totalContacts,
    totalProducts,
    totalOpportunities,
    activeOpportunities: activeOpportunitiesCount,

    // Financial metrics
    totalPipelineValue: opportunityMetrics.totalPipelineValue || 0,
    activePipelineValue: opportunityMetrics.activePipelineValue || 0,
    conversionRate: opportunityMetrics.conversionRate || 0,
    averageOpportunityValue: opportunityMetrics.averageValue || 0,

    // Breakdown metrics
    opportunitiesByStage: opportunityMetrics.byStage || {},
    opportunityValuesByStage: opportunityMetrics.stageValues || {},
    principalsByPriority: principalMetrics.byPriority || {},
    interactionsByType: interactionMetrics.byType || {},

    // Principal-specific metrics
    principalsWithActiveOpportunities: principalMetrics.withActiveOpportunities || 0,
    avgOpportunitiesPerPrincipal: principalMetrics.averageOpportunitiesPerPrincipal || 0,
    topPrincipalsByValue: principalMetrics.topByPipelineValue || [],

    // Interaction & activity metrics
    totalInteractions: interactionMetrics.total || 0,
    recentInteractions: interactionMetrics.recentCount || 0,
    thisWeekInteractions: interactionMetrics.thisWeekCount || 0,
    thisMonthInteractions: interactionMetrics.thisMonthCount || 0,
    avgInteractionsPerOpportunity: interactionMetrics.averagePerOpportunity || 0,
    interactionsRequiringFollowUp: interactionMetrics.followUpRequired || 0,
    lastActivityDate: interactionMetrics.lastActivityDate,

    // Growth and trends
    growthMetrics,

    // Detailed metric objects for advanced usage
    opportunityMetrics,
    principalMetrics,
    interactionMetrics,

    // Loading and error states
    isLoading,
    error,
    lastUpdated,
    dataFreshness
  }), [
    totalOrganizations,
    totalPrincipals,
    totalDistributors,
    totalContacts,
    totalProducts,
    totalOpportunities,
    activeOpportunitiesCount,
    opportunityMetrics,
    principalMetrics,
    interactionMetrics,
    growthMetrics,
    isLoading,
    error,
    lastUpdated,
    dataFreshness
  ])
}

// ============================================================================
// SPECIALIZED HOOKS FOR SPECIFIC METRICS
// ============================================================================

/**
 * Hook for opportunity-specific metrics only
 */
export function useOpportunityMetrics(filters?: MetricsFilters) {
  const { opportunityMetrics } = useDashboardMetrics({ filters })
  return opportunityMetrics
}

/**
 * Hook for principal-specific metrics only
 */
export function usePrincipalMetrics(filters?: MetricsFilters) {
  const { principalMetrics } = useDashboardMetrics({ filters })
  return principalMetrics
}

/**
 * Hook for interaction-specific metrics only
 */
export function useInteractionMetrics(filters?: MetricsFilters) {
  const { interactionMetrics } = useDashboardMetrics({ filters })
  return interactionMetrics
}

/**
 * Hook for real-time activity metrics with shorter cache time
 */
export function useRealTimeActivityMetrics() {
  const { 
    totalInteractions,
    recentInteractions,
    thisWeekInteractions,
    lastActivityDate,
    interactionsRequiringFollowUp,
    isLoading,
    error 
  } = useDashboardMetrics({ 
    includeGrowthMetrics: false 
  })

  return {
    totalInteractions,
    recentInteractions,
    thisWeekInteractions,
    lastActivityDate,
    interactionsRequiringFollowUp,
    isLoading,
    error
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useDashboardMetrics