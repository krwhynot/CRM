import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InteractionType } from '@/types/entities'
import type { Json } from '@/lib/database.types'
import {
  createDbStageRecord,
  type OpportunityStageDB as OpportunityStage,
} from '@/lib/opportunity-stage-mapping'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Database response type for the RPC function
interface DatabaseMetricsResponse {
  total_organizations: number
  total_contacts: number
  total_opportunities: number
  total_interactions: number
  total_products: number
  principals_count: number
  distributors_count: number
  active_opportunities: number
  total_pipeline_value: number
  active_pipeline_value: number
  conversion_rate: number
  average_opportunity_value: number
  recent_interactions: number
  this_week_interactions: number
  this_month_interactions: number
  avg_interactions_per_opportunity: number
  principals_with_active_opportunities: number
  avg_opportunities_per_principal: number
  last_activity_date: string | null
  opportunities_by_stage: Json | null
  opportunity_values_by_stage: Json | null
  interactions_by_type: Json | null
  top_principals_by_value: Json | null
}

// Transform database response to match existing interface
function transformDatabaseMetrics(
  data: DatabaseMetricsResponse | undefined
): Omit<DashboardMetrics, 'isLoading' | 'error' | 'lastUpdated' | 'dataFreshness'> {
  if (!data) {
    return {
      // Core entity metrics
      totalOrganizations: 0,
      totalPrincipals: 0,
      totalDistributors: 0,
      totalContacts: 0,
      totalProducts: 0,
      totalOpportunities: 0,
      activeOpportunities: 0,

      // Financial metrics
      totalPipelineValue: 0,
      activePipelineValue: 0,
      conversionRate: 0,
      averageOpportunityValue: 0,

      // Breakdown metrics
      opportunitiesByStage: createDbStageRecord(0),
      opportunityValuesByStage: createDbStageRecord(0),
      principalsByPriority: {} as Record<PriorityLevel, number>,
      interactionsByType: {} as Record<InteractionType, number>,

      // Principal-specific metrics
      principalsWithActiveOpportunities: 0,
      avgOpportunitiesPerPrincipal: 0,
      topPrincipalsByValue: [],

      // Activity metrics
      totalActivities: 0,
      recentActivities: 0,
      thisWeekActivities: 0,
      thisMonthActivities: 0,
      avgActivitiesPerOpportunity: 0,
      interactionsRequiringFollowUp: 0,
      lastActivityDate: null,

      // Growth and trends
      growthMetrics: {
        organizationsGrowth: 0,
        contactsGrowth: 0,
        opportunitiesGrowth: 0,
        pipelineValueGrowth: 0,
        interactionsGrowth: 0,
        principalsGrowth: 0,
        distributorsGrowth: 0,
      },

      // Detailed metric objects
      opportunityMetrics: {
        totalPipelineValue: 0,
        activePipelineValue: 0,
        conversionRate: 0,
        averageValue: 0,
        byStage: createDbStageRecord(0),
        stageValues: createDbStageRecord(0),
      },
      principalMetrics: {
        byPriority: {} as Record<PriorityLevel, number>,
        withActiveOpportunities: 0,
        averageOpportunitiesPerPrincipal: 0,
        topByPipelineValue: [],
      },
      interactionMetrics: {
        total: 0,
        recentCount: 0,
        thisWeekCount: 0,
        thisMonthCount: 0,
        averagePerOpportunity: 0,
        followUpRequired: 0,
        lastActivityDate: null,
        byType: {} as Record<InteractionType, number>,
      },
    }
  }

  // Transform stage breakdowns, ensuring all stages are present
  const opportunitiesByStage = createDbStageRecord(0)
  const opportunityValuesByStage = createDbStageRecord(0)

  if (
    data.opportunities_by_stage &&
    typeof data.opportunities_by_stage === 'object' &&
    data.opportunities_by_stage !== null
  ) {
    Object.keys(data.opportunities_by_stage).forEach((stage) => {
      if (stage in opportunitiesByStage) {
        const stageData = data.opportunities_by_stage as Record<string, number>
        opportunitiesByStage[stage as OpportunityStage] = stageData[stage] || 0
      }
    })
  }

  if (
    data.opportunity_values_by_stage &&
    typeof data.opportunity_values_by_stage === 'object' &&
    data.opportunity_values_by_stage !== null
  ) {
    Object.keys(data.opportunity_values_by_stage).forEach((stage) => {
      if (stage in opportunityValuesByStage) {
        const stageData = data.opportunity_values_by_stage as Record<string, number>
        opportunityValuesByStage[stage as OpportunityStage] = stageData[stage] || 0
      }
    })
  }

  // Transform interactions by type
  const interactionsByType: Record<InteractionType, number> = {} as Record<InteractionType, number>
  if (
    data.interactions_by_type &&
    typeof data.interactions_by_type === 'object' &&
    data.interactions_by_type !== null
  ) {
    Object.keys(data.interactions_by_type).forEach((type) => {
      const typeData = data.interactions_by_type as Record<string, number>
      interactionsByType[type as InteractionType] = typeData[type] || 0
    })
  }

  return {
    // Core entity metrics
    totalOrganizations: data.total_organizations || 0,
    totalPrincipals: data.principals_count || 0,
    totalDistributors: data.distributors_count || 0,
    totalContacts: data.total_contacts || 0,
    totalProducts: data.total_products || 0,
    totalOpportunities: data.total_opportunities || 0,
    activeOpportunities: data.active_opportunities || 0,

    // Financial metrics
    totalPipelineValue: data.total_pipeline_value || 0,
    activePipelineValue: data.active_pipeline_value || 0,
    conversionRate: data.conversion_rate || 0,
    averageOpportunityValue: data.average_opportunity_value || 0,

    // Breakdown metrics
    opportunitiesByStage,
    opportunityValuesByStage,
    principalsByPriority: {} as Record<PriorityLevel, number>, // Placeholder for now
    interactionsByType,

    // Principal-specific metrics
    principalsWithActiveOpportunities: data.principals_with_active_opportunities || 0,
    avgOpportunitiesPerPrincipal: data.avg_opportunities_per_principal || 0,
    topPrincipalsByValue: (Array.isArray(data.top_principals_by_value)
      ? data.top_principals_by_value
      : []) as Array<{
      id: string
      name: string
      totalValue: number
      opportunityCount: number
    }>,

    // Activity metrics
    totalActivities: data.total_interactions || 0,
    recentActivities: data.recent_interactions || 0,
    thisWeekActivities: data.this_week_interactions || 0,
    thisMonthActivities: data.this_month_interactions || 0,
    avgActivitiesPerOpportunity: data.avg_interactions_per_opportunity || 0,
    interactionsRequiringFollowUp: 0, // Placeholder - not calculated in DB function yet
    lastActivityDate: data.last_activity_date ? new Date(data.last_activity_date) : null,

    // Growth and trends (placeholder for now)
    growthMetrics: {
      organizationsGrowth: 0,
      contactsGrowth: 0,
      opportunitiesGrowth: 0,
      pipelineValueGrowth: 0,
      interactionsGrowth: 0,
      principalsGrowth: 0,
      distributorsGrowth: 0,
    },

    // Detailed metric objects
    opportunityMetrics: {
      totalPipelineValue: data.total_pipeline_value || 0,
      activePipelineValue: data.active_pipeline_value || 0,
      conversionRate: data.conversion_rate || 0,
      averageValue: data.average_opportunity_value || 0,
      byStage: opportunitiesByStage,
      stageValues: opportunityValuesByStage,
    },
    principalMetrics: {
      byPriority: {} as Record<PriorityLevel, number>, // Placeholder for now
      withActiveOpportunities: data.principals_with_active_opportunities || 0,
      averageOpportunitiesPerPrincipal: data.avg_opportunities_per_principal || 0,
      topByPipelineValue: (Array.isArray(data.top_principals_by_value)
        ? data.top_principals_by_value
        : []) as Array<{
        id: string
        name: string
        totalValue: number
        opportunityCount: number
      }>,
    },
    interactionMetrics: {
      total: data.total_interactions || 0,
      recentCount: data.recent_interactions || 0,
      thisWeekCount: data.this_week_interactions || 0,
      thisMonthCount: data.this_month_interactions || 0,
      averagePerOpportunity: data.avg_interactions_per_opportunity || 0,
      followUpRequired: 0, // Placeholder - not calculated in DB function yet
      lastActivityDate: data.last_activity_date ? new Date(data.last_activity_date) : null,
      byType: interactionsByType,
    },
  }
}

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

  // Activity metrics
  totalActivities: number
  recentActivities: number
  thisWeekActivities: number
  thisMonthActivities: number
  avgActivitiesPerOpportunity: number
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
 * Optimized dashboard metrics hook using server-side aggregation for maximum performance.
 * Replaces heavy client-side calculations with efficient database queries.
 */
export function useDashboardMetrics(options: DashboardMetricsOptions = {}): DashboardMetrics {
  // ============================================================================
  // SERVER-SIDE DATA FETCHING
  // ============================================================================

  const query = useQuery<DatabaseMetricsResponse, Error>({
    queryKey: ['dashboard', 'metrics', options.filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_principal_ids: options.filters?.principalIds || undefined,
        p_date_from: options.filters?.dateRange?.start?.toISOString() || undefined,
        p_date_to: options.filters?.dateRange?.end?.toISOString() || undefined,
      })
      if (error) {
        // Dashboard metrics RPC error - propagating to React Query error handling
        throw error
      }
      // The RPC returns an array with a single object
      return Array.isArray(data) ? data[0] : data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (
        error &&
        'status' in error &&
        typeof error.status === 'number' &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false
      }
      return failureCount < 3
    },
  })

  // ============================================================================
  // DATA FRESHNESS TRACKING
  // ============================================================================

  const dataFreshness = useMemo(() => {
    const timestamp = query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null
    return {
      organizations: timestamp,
      opportunities: timestamp,
      contacts: timestamp,
      interactions: timestamp,
      products: timestamp,
    }
  }, [query.dataUpdatedAt])

  const lastUpdated = useMemo(() => {
    return query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null
  }, [query.dataUpdatedAt])

  // ============================================================================
  // TRANSFORM AND RETURN METRICS
  // ============================================================================

  return useMemo(
    () => ({
      ...transformDatabaseMetrics(query.data),

      // Loading and error states
      isLoading: query.isLoading,
      error: query.error,
      lastUpdated,
      dataFreshness,
    }),
    [query.data, query.isLoading, query.error, lastUpdated, dataFreshness]
  )
}

// ============================================================================
// SPECIALIZED HOOKS FOR SPECIFIC METRICS
// ============================================================================

/**
 * Hook for opportunity-specific metrics only - now optimized with server-side aggregation
 */
export function useOpportunityMetrics(filters?: MetricsFilters) {
  const { opportunityMetrics, isLoading, error } = useDashboardMetrics({ filters })
  return {
    ...opportunityMetrics,
    isLoading,
    error,
  }
}

/**
 * Hook for principal-specific metrics only - now optimized with server-side aggregation
 */
export function usePrincipalMetrics(filters?: MetricsFilters) {
  const { principalMetrics, isLoading, error } = useDashboardMetrics({ filters })
  return {
    ...principalMetrics,
    isLoading,
    error,
  }
}

/**
 * Hook for interaction-specific metrics only - now optimized with server-side aggregation
 */
export function useInteractionMetrics(filters?: MetricsFilters) {
  const { interactionMetrics, isLoading, error } = useDashboardMetrics({ filters })
  return {
    ...interactionMetrics,
    isLoading,
    error,
  }
}

/**
 * Hook for real-time activity metrics with shorter cache time
 * Now uses optimized server-side aggregation instead of client-side filtering
 */
export function useRealTimeActivityMetrics() {
  // Use optimized metrics with shorter cache time for real-time data
  const query = useQuery<DatabaseMetricsResponse, Error>({
    queryKey: ['dashboard', 'real-time-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_metrics')
      if (error) {
        // Real-time metrics RPC error - propagating to React Query error handling
        throw error
      }
      return Array.isArray(data) ? data[0] : data
    },
    staleTime: 30 * 1000, // 30 seconds for real-time data
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  })

  return {
    totalActivities: query.data?.total_interactions || 0,
    recentActivities: query.data?.recent_interactions || 0,
    thisWeekActivities: query.data?.this_week_interactions || 0,
    lastActivityDate: query.data?.last_activity_date
      ? new Date(query.data.last_activity_date)
      : null,
    interactionsRequiringFollowUp: 0, // Placeholder for now
    isLoading: query.isLoading,
    error: query.error,
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useDashboardMetrics
