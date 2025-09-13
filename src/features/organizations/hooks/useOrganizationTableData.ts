import { useMemo, useState } from 'react'
import { useOrganizations } from './useOrganizations'
import type { Organization } from '@/types/entities'

// Extended organization interface with weekly context
export interface OrganizationWithWeeklyContext extends Organization {
  // Principal products tracking
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    list_price?: number
    opportunity_count?: number
  }>

  // Organization metrics
  total_opportunities?: number
  active_opportunities?: number
  total_products?: number
  weekly_engagement_score?: number
  last_interaction_date?: string | Date

  // Weekly context
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
}

interface UseOrganizationTableDataConfig {
  filters?: any
}

export function useOrganizationTableData({ filters }: UseOrganizationTableDataConfig) {
  const { data: organizations = [], isLoading } = useOrganizations()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Convert to organizations with context
  const organizationsWithContext: OrganizationWithWeeklyContext[] = useMemo(() => {
    return organizations.map((org) => ({
      ...org,
      // Add any additional context calculations here
    }))
  }, [organizations])

  // Filter and sort organizations
  const sortedOrganizations = useMemo(() => {
    let filtered = [...organizationsWithContext]

    // Apply filters if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (organization) =>
          organization.name?.toLowerCase().includes(searchTerm) ||
          organization.primary_manager_name?.toLowerCase().includes(searchTerm) ||
          organization.phone?.toLowerCase().includes(searchTerm) ||
          organization.segment?.toLowerCase().includes(searchTerm) ||
          organization.city?.toLowerCase().includes(searchTerm)
      )
    }

    // Apply quick view filters if provided
    if (filters?.quickView && filters.quickView !== 'none') {
      switch (filters.quickView) {
        case 'high_engagement':
          filtered = filtered.filter(
            (org) => org.high_engagement_this_week || (org.weekly_engagement_score || 0) > 70
          )
          break
        case 'multiple_opportunities':
          filtered = filtered.filter((org) => (org.active_opportunities || 0) > 1)
          break
        case 'inactive_orgs':
          filtered = filtered.filter(
            (org) => org.inactive_status || (org.weekly_engagement_score || 0) < 30
          )
          break
        default:
          break
      }
    }

    // Sort by name by default
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return filtered
  }, [organizationsWithContext, filters])

  // Row expansion handlers
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const isRowExpanded = (id: string) => expandedRows.has(id)

  // Empty state messages
  const hasFilters = filters?.search || filters?.quickView !== 'none'
  const emptyMessage = hasFilters
    ? 'No organizations match your criteria'
    : 'No organizations found'
  const emptySubtext = hasFilters
    ? 'Try adjusting your filters'
    : 'Get started by adding your first organization'

  return {
    organizations: organizationsWithContext,
    sortedOrganizations,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  }
}
