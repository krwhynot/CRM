/**
 * Organization List Hook
 *
 * Feature-specific adapter that uses generic entity hooks for organization management.
 * Provides organization-specific filtering, sorting, and business intelligence.
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
import type { Organization, OrganizationFilters } from '@/types/entities'

// Extended organization interface with computed fields
export interface OrganizationWithMetrics extends Organization {
  // Relationship counts
  contact_count?: number
  opportunity_count?: number
  active_opportunity_count?: number
  interaction_count?: number

  // Business metrics
  total_opportunity_value?: number
  average_opportunity_value?: number
  last_interaction_date?: string | Date
  last_opportunity_date?: string | Date
  engagement_score?: number

  // Weekly context
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
  needs_follow_up?: boolean

  // Principal products tracking
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    opportunity_count?: number
  }>

  // Geographic data
  full_address?: string
  region?: string
}

// Organization-specific filters extending base filters
export interface OrganizationListFilters extends BaseFilters {
  organization_type?: string | string[]
  segment?: string | string[]
  priority_rating?: string | string[]
  state_province?: string | string[]
  city?: string
  principal?: string | string[]
  manager?: string | string[]
  last_activity_days?: number
  has_opportunities?: boolean
  has_contacts?: boolean
  quickView?:
    | 'high_engagement'
    | 'multiple_opportunities'
    | 'inactive_orgs'
    | 'needs_follow_up'
    | 'none'
  timeRange?: 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'all'
}

// Query key factory for organizations
const organizationQueryKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationQueryKeys.all, 'list'] as const,
  list: (filters?: OrganizationListFilters) =>
    [...organizationQueryKeys.lists(), { filters }] as const,
  details: () => [...organizationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationQueryKeys.details(), id] as const,
}

// Create organization list configuration
const organizationListConfig = createEntityListConfig<OrganizationWithMetrics>(
  'organizations',
  'organizations',
  {
    queryKeyFactory: organizationQueryKeys,
    select: `
      *,
      contacts(
        id,
        first_name,
        last_name,
        is_primary_contact,
        email,
        phone
      ),
      opportunities(
        id,
        name,
        stage,
        value,
        probability,
        close_date,
        created_at,
        updated_at
      ),
      interactions(
        id,
        interaction_date,
        interaction_type,
        created_at
      )
    `,
    defaultSort: {
      column: 'name',
      direction: 'asc',
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
)

// Create organization actions configuration
const organizationActionsConfig = createEntityActionsConfig<OrganizationWithMetrics>(
  'organizations',
  'organization',
  organizationQueryKeys,
  {
    softDelete: true,
    optimisticUpdates: true,
    bulkOperations: true,
  }
)

/**
 * Hook for managing organization lists with business logic
 */
export function useOrganizationList(
  initialFilters?: Partial<OrganizationListFilters>,
  options?: {
    includeDeleted?: boolean
    autoRefresh?: boolean
    onFiltersChange?: (filters: OrganizationListFilters) => void
  }
) {
  // Default filters with organization-specific business logic
  const defaultFilters: OrganizationListFilters = {
    search: '',
    orderBy: 'name',
    orderDirection: 'asc',
    quickView: 'none',
    timeRange: 'this_month',
    limit: 100,
    ...initialFilters,
  }

  // Use generic entity list hook
  const listResult = useEntityList<OrganizationWithMetrics, OrganizationListFilters>(
    organizationListConfig,
    {
      initialFilters: defaultFilters,
      includeDeleted: options?.includeDeleted,
      onFiltersChange: options?.onFiltersChange,
      refetchInterval: options?.autoRefresh ? 60000 : undefined, // 1 minute refresh
    }
  )

  // Use generic entity actions
  const actionsResult = useEntityActions<OrganizationWithMetrics>(
    listResult.data,
    organizationActionsConfig
  )

  // Custom filtering logic for organizations
  const customFilterFn = (
    organization: OrganizationWithMetrics,
    filters: OrganizationListFilters
  ): boolean => {
    // Organization type filter
    if (filters.organization_type) {
      const types = Array.isArray(filters.organization_type)
        ? filters.organization_type
        : [filters.organization_type]
      if (!types.includes(organization.organization_type)) return false
    }

    // Segment filter
    if (filters.segment) {
      const segments = Array.isArray(filters.segment) ? filters.segment : [filters.segment]
      if (!organization.segment || !segments.includes(organization.segment)) return false
    }

    // Priority rating filter
    if (filters.priority_rating) {
      const priorities = Array.isArray(filters.priority_rating)
        ? filters.priority_rating
        : [filters.priority_rating]
      if (!organization.priority_rating || !priorities.includes(organization.priority_rating))
        return false
    }

    // Location filters
    if (filters.state_province && organization.state_province !== filters.state_province) {
      return false
    }
    if (
      filters.city &&
      (!organization.city || !organization.city.toLowerCase().includes(filters.city.toLowerCase()))
    ) {
      return false
    }

    // Relationship filters
    if (filters.has_opportunities !== undefined) {
      const hasOpps = (organization.opportunity_count || 0) > 0
      if (filters.has_opportunities !== hasOpps) return false
    }
    if (filters.has_contacts !== undefined) {
      const hasContacts = (organization.contact_count || 0) > 0
      if (filters.has_contacts !== hasContacts) return false
    }

    // Quick view filters
    if (filters.quickView && filters.quickView !== 'none') {
      switch (filters.quickView) {
        case 'high_engagement':
          return organization.high_engagement_this_week || (organization.engagement_score || 0) > 70
        case 'multiple_opportunities':
          return (organization.active_opportunity_count || 0) > 1
        case 'inactive_orgs':
          return organization.inactive_status || (organization.engagement_score || 0) < 30
        case 'needs_follow_up':
          return organization.needs_follow_up || false
      }
    }

    // Last activity filter
    if (filters.last_activity_days && organization.last_interaction_date) {
      const daysSinceActivity = Math.ceil(
        (Date.now() - new Date(organization.last_interaction_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      if (daysSinceActivity > filters.last_activity_days) return false
    }

    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.timeRange) {
        case 'this_week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'this_quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          break
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          return true
      }

      // Check if organization has activity in the time range
      const hasRecentActivity =
        (organization.last_interaction_date &&
          new Date(organization.last_interaction_date) >= startDate) ||
        (organization.last_opportunity_date &&
          new Date(organization.last_opportunity_date) >= startDate) ||
        (organization.updated_at && new Date(organization.updated_at) >= startDate)

      if (!hasRecentActivity) return false
    }

    return true
  }

  // Use advanced filters with organization-specific logic
  const filtersResult = useEntityFilters<OrganizationListFilters, OrganizationWithMetrics>(
    listResult.data,
    {
      defaultFilters,
      persistFilters: true,
      filterKey: 'organizations',
      onFiltersChange: options?.onFiltersChange,
    },
    customFilterFn
  )

  // Compute enhanced organization data with metrics
  const enhancedOrganizations = useMemo(() => {
    return filtersResult.filteredData.map((organization) => {
      // Calculate metrics from related data
      const opportunities = (organization as any).opportunities || []
      const contacts = (organization as any).contacts || []
      const interactions = (organization as any).interactions || []

      const activeOpportunities = opportunities.filter(
        (opp: any) => !['closed-won', 'closed-lost', 'cancelled'].includes(opp.stage)
      )

      const totalOpportunityValue = opportunities.reduce(
        (sum: number, opp: any) => sum + (opp.value || 0),
        0
      )

      const lastInteraction =
        interactions.length > 0
          ? interactions.sort(
              (a: any, b: any) =>
                new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime()
            )[0]
          : null

      const lastOpportunity =
        opportunities.length > 0
          ? opportunities.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null

      // Calculate engagement score
      const daysWithoutActivity = lastInteraction
        ? Math.ceil(
            (Date.now() - new Date(lastInteraction.interaction_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 365

      const engagementScore = Math.max(0, 100 - Math.min(daysWithoutActivity * 2, 100))

      // Determine status flags
      const needsFollowUp = daysWithoutActivity > 14 && activeOpportunities.length > 0
      const highEngagement = engagementScore > 70 && daysWithoutActivity <= 7
      const multipleOpportunities = activeOpportunities.length > 1
      const inactiveStatus = daysWithoutActivity > 60

      return {
        ...organization,
        contact_count: contacts.length,
        opportunity_count: opportunities.length,
        active_opportunity_count: activeOpportunities.length,
        interaction_count: interactions.length,
        total_opportunity_value: totalOpportunityValue,
        average_opportunity_value:
          opportunities.length > 0 ? totalOpportunityValue / opportunities.length : 0,
        last_interaction_date: lastInteraction?.interaction_date,
        last_opportunity_date: lastOpportunity?.created_at,
        engagement_score: engagementScore,
        needs_follow_up: needsFollowUp,
        high_engagement_this_week: highEngagement,
        multiple_opportunities: multipleOpportunities,
        inactive_status: inactiveStatus,
        full_address: [
          organization.address_line_1,
          organization.address_line_2,
          organization.city,
          organization.state_province,
          organization.postal_code,
        ]
          .filter(Boolean)
          .join(', '),
      } as OrganizationWithMetrics
    })
  }, [filtersResult.filteredData])

  return {
    // Data
    organizations: listResult.data,
    filteredOrganizations: enhancedOrganizations,

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
 * Hook for organization statistics and business intelligence
 */
export function useOrganizationMetrics(organizations: OrganizationWithMetrics[]) {
  return useMemo(() => {
    const total = organizations.length

    const byType = organizations.reduce(
      (acc, org) => {
        acc[org.organization_type] = (acc[org.organization_type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const bySegment = organizations.reduce(
      (acc, org) => {
        if (org.segment) {
          acc[org.segment] = (acc[org.segment] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    const byPriority = organizations.reduce(
      (acc, org) => {
        if (org.priority_rating) {
          acc[org.priority_rating] = (acc[org.priority_rating] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    const totalOpportunityValue = organizations.reduce(
      (sum, org) => sum + (org.total_opportunity_value || 0),
      0
    )

    const withOpportunities = organizations.filter((org) => (org.opportunity_count || 0) > 0).length
    const withContacts = organizations.filter((org) => (org.contact_count || 0) > 0).length
    const highEngagement = organizations.filter((org) => org.high_engagement_this_week).length
    const needsFollowUp = organizations.filter((org) => org.needs_follow_up).length
    const inactive = organizations.filter((org) => org.inactive_status).length

    return {
      total,
      byType,
      bySegment,
      byPriority,
      totalOpportunityValue,
      averageOpportunityValue:
        withOpportunities > 0 ? totalOpportunityValue / withOpportunities : 0,
      withOpportunities,
      withContacts,
      highEngagement,
      needsFollowUp,
      inactive,
      engagementRate: total > 0 ? ((total - inactive) / total) * 100 : 0,
      opportunityRate: total > 0 ? (withOpportunities / total) * 100 : 0,
    }
  }, [organizations])
}
