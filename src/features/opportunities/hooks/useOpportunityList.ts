/**
 * Opportunity List Hook
 *
 * Feature-specific adapter that uses generic entity hooks for opportunity management.
 * Provides opportunity-specific filtering, sorting, and business logic.
 */

import { useMemo } from 'react'
import {
  useEntityList,
  useEntityActions,
  useEntityFilters,
  createEntityListConfig,
  createEntityActionsConfig,
  type BaseFilters,
} from '@/hooks/entity'
import type { Opportunity, OpportunityFilters } from '@/types/entities'

// Extended opportunity interface with computed fields
export interface OpportunityWithLastActivity extends Opportunity {
  last_activity_date?: string | Date
  activity_count?: number
  days_since_created?: number
  days_until_close?: number
  weighted_value?: number
  stage_duration?: number
  next_action_required?: boolean
  primary_contact_name?: string
  organization_name?: string
  organization_segment?: string
  principal_names?: string[]
}

// Opportunity-specific filters extending base filters
export interface OpportunityListFilters extends BaseFilters {
  stage?: string | string[]
  value_min?: number
  value_max?: number
  close_date_from?: string
  close_date_to?: string
  organization_type?: string | string[]
  principal?: string | string[]
  assigned_to?: string | string[]
  priority?: string | string[]
  last_activity_days?: number
  needs_follow_up?: boolean
  quickView?: 'high_value' | 'closing_soon' | 'stale' | 'new' | 'none'
}

// Query key factory for opportunities
const opportunityQueryKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityQueryKeys.all, 'list'] as const,
  list: (filters?: OpportunityListFilters) =>
    [...opportunityQueryKeys.lists(), { filters }] as const,
  details: () => [...opportunityQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityQueryKeys.details(), id] as const,
}

// Create opportunity list configuration
const opportunityListConfig = createEntityListConfig<OpportunityWithLastActivity>(
  'opportunities',
  'opportunities',
  {
    queryKeyFactory: opportunityQueryKeys,
    select: `
      *,
      organization:organizations!opportunities_organization_id_fkey(
        id,
        name,
        organization_type,
        segment,
        priority_rating
      ),
      contacts:opportunity_contacts(
        contact:contacts(
          id,
          first_name,
          last_name,
          is_primary_contact
        )
      ),
      products:opportunity_products(
        product:products(
          id,
          name,
          principal_organization_id
        )
      ),
      interactions(
        id,
        interaction_date,
        interaction_type
      )
    `,
    defaultSort: {
      column: 'updated_at',
      direction: 'desc',
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for frequently changing data
  }
)

// Create opportunity actions configuration
const opportunityActionsConfig = createEntityActionsConfig<OpportunityWithLastActivity>(
  'opportunities',
  'opportunity',
  opportunityQueryKeys,
  {
    softDelete: true,
    optimisticUpdates: true,
    bulkOperations: true,
  }
)

/**
 * Hook for managing opportunity lists with business logic
 */
export function useOpportunityList(
  initialFilters?: Partial<OpportunityListFilters>,
  options?: {
    includeDeleted?: boolean
    autoRefresh?: boolean
    onFiltersChange?: (filters: OpportunityListFilters) => void
  }
) {
  // Default filters with opportunity-specific business logic
  const defaultFilters: OpportunityListFilters = {
    search: '',
    orderBy: 'updated_at',
    orderDirection: 'desc',
    quickView: 'none',
    limit: 100,
    ...initialFilters,
  }

  // Use generic entity list hook
  const listResult = useEntityList<OpportunityWithLastActivity, OpportunityListFilters>(
    opportunityListConfig,
    {
      initialFilters: defaultFilters,
      includeDeleted: options?.includeDeleted,
      onFiltersChange: options?.onFiltersChange,
      refetchInterval: options?.autoRefresh ? 30000 : undefined, // 30 second refresh
    }
  )

  // Use generic entity actions
  const actionsResult = useEntityActions<OpportunityWithLastActivity>(
    listResult.data,
    opportunityActionsConfig
  )

  // Custom filtering logic for opportunities
  const customFilterFn = (
    opportunity: OpportunityWithLastActivity,
    filters: OpportunityListFilters
  ): boolean => {
    // Stage filter
    if (filters.stage) {
      const stages = Array.isArray(filters.stage) ? filters.stage : [filters.stage]
      if (!stages.includes(opportunity.stage)) return false
    }

    // Value range filter
    if (filters.value_min && opportunity.value && opportunity.value < filters.value_min) {
      return false
    }
    if (filters.value_max && opportunity.value && opportunity.value > filters.value_max) {
      return false
    }

    // Close date range filter
    if (filters.close_date_from && opportunity.close_date) {
      const closeDate = new Date(opportunity.close_date)
      const fromDate = new Date(filters.close_date_from)
      if (closeDate < fromDate) return false
    }
    if (filters.close_date_to && opportunity.close_date) {
      const closeDate = new Date(opportunity.close_date)
      const toDate = new Date(filters.close_date_to)
      if (closeDate > toDate) return false
    }

    // Quick view filters
    if (filters.quickView && filters.quickView !== 'none') {
      switch (filters.quickView) {
        case 'high_value':
          return (opportunity.value || 0) >= 50000
        case 'closing_soon':
          if (opportunity.close_date) {
            const daysUntilClose = Math.ceil(
              (new Date(opportunity.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            return daysUntilClose <= 30 && daysUntilClose >= 0
          }
          return false
        case 'stale':
          if (opportunity.last_activity_date) {
            const daysSinceActivity = Math.ceil(
              (Date.now() - new Date(opportunity.last_activity_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
            return daysSinceActivity > 14
          }
          return true
        case 'new':
          if (opportunity.created_at) {
            const daysOld = Math.ceil(
              (Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysOld <= 7
          }
          return false
      }
    }

    // Last activity filter
    if (filters.last_activity_days && opportunity.last_activity_date) {
      const daysSinceActivity = Math.ceil(
        (Date.now() - new Date(opportunity.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceActivity > filters.last_activity_days) return false
    }

    return true
  }

  // Use advanced filters with opportunity-specific logic
  const filtersResult = useEntityFilters<OpportunityListFilters, OpportunityWithLastActivity>(
    listResult.data,
    {
      defaultFilters,
      persistFilters: true,
      filterKey: 'opportunities',
      onFiltersChange: options?.onFiltersChange,
    },
    customFilterFn
  )

  // Compute enhanced opportunity data
  const enhancedOpportunities = useMemo(() => {
    return filtersResult.filteredData.map((opportunity) => {
      const now = new Date()
      const created = new Date(opportunity.created_at || now)
      const closeDate = opportunity.close_date ? new Date(opportunity.close_date) : null

      return {
        ...opportunity,
        days_since_created: Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)),
        days_until_close: closeDate
          ? Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        weighted_value:
          opportunity.value && opportunity.probability
            ? opportunity.value * (opportunity.probability / 100)
            : opportunity.value,
      } as OpportunityWithLastActivity
    })
  }, [filtersResult.filteredData])

  return {
    // Data
    opportunities: listResult.data,
    filteredOpportunities: enhancedOpportunities,

    // State
    isLoading: listResult.isLoading,
    isError: listResult.isError,
    error: listResult.error,

    // Filtering
    filters: filtersResult.filters,
    setFilters: filtersResult.setFilters,
    clearFilters: filtersResult.clearFilters,
    hasActiveFilters: filtersResult.hasActiveFilters,

    // Actions
    actions: actionsResult,

    // Utilities
    refetch: listResult.refetch,
    invalidateList: listResult.invalidateList,
  }
}

/**
 * Hook for opportunity statistics and metrics
 */
export function useOpportunityMetrics(opportunities: OpportunityWithLastActivity[]) {
  return useMemo(() => {
    const total = opportunities.length
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0)
    const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.weighted_value || 0), 0)

    const byStage = opportunities.reduce(
      (acc, opp) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const closingSoon = opportunities.filter((opp) => {
      if (!opp.close_date) return false
      const daysUntilClose = Math.ceil(
        (new Date(opp.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilClose <= 30 && daysUntilClose >= 0
    }).length

    const highValue = opportunities.filter((opp) => (opp.value || 0) >= 50000).length

    return {
      total,
      totalValue,
      weightedValue,
      averageValue: total > 0 ? totalValue / total : 0,
      byStage,
      closingSoon,
      highValue,
      conversionRate: total > 0 ? ((byStage['closed-won'] || 0) / total) * 100 : 0,
    }
  }, [opportunities])
}
