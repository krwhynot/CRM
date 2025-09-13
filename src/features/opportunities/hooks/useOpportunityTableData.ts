import { useMemo, useState } from 'react'
import { useOpportunities } from './useOpportunities'
import type { Opportunity } from '@/types/entities'
import type { OpportunityWithRelations } from '@/types/opportunity.types'

interface UseOpportunityTableDataConfig {
  filters?: any
}

export function useOpportunityTableData({ filters }: UseOpportunityTableDataConfig) {
  const { data: opportunities = [], isLoading } = useOpportunities()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Convert to opportunities with context
  const opportunitiesWithContext: OpportunityWithRelations[] = useMemo(() => {
    return opportunities.map((opp) => ({
      ...opp,
      // Add any additional context calculations here
    }))
  }, [opportunities])

  // Filter and sort opportunities
  const sortedOpportunities = useMemo(() => {
    let filtered = [...opportunitiesWithContext]

    // Apply filters if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (opportunity) =>
          opportunity.name?.toLowerCase().includes(searchTerm) ||
          opportunity.stage?.toLowerCase().includes(searchTerm) ||
          opportunity.organization?.name?.toLowerCase().includes(searchTerm)
      )
    }

    // Apply quick view filters if provided
    if (filters?.quickView && filters.quickView !== 'none') {
      switch (filters.quickView) {
        case 'high_value':
          filtered = filtered.filter((opp) => (opp.value || 0) > 10000)
          break
        case 'closing_soon':
          filtered = filtered.filter((opp) => {
            if (!opp.close_date) return false
            const closeDate = new Date(opp.close_date)
            const today = new Date()
            const daysUntilClose = Math.ceil(
              (closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysUntilClose <= 30 && daysUntilClose >= 0
          })
          break
        case 'stalled':
          filtered = filtered.filter((opp) => {
            if (!opp.updated_at) return false
            const lastUpdate = new Date(opp.updated_at)
            const today = new Date()
            const daysSinceUpdate = Math.ceil(
              (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysSinceUpdate > 30
          })
          break
        default:
          break
      }
    }

    // Sort by close date by default
    filtered.sort((a, b) => {
      if (!a.close_date && !b.close_date) return 0
      if (!a.close_date) return 1
      if (!b.close_date) return -1
      return new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
    })

    return filtered
  }, [opportunitiesWithContext, filters])

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
    ? 'No opportunities match your criteria'
    : 'No opportunities found'
  const emptySubtext = hasFilters
    ? 'Try adjusting your filters'
    : 'Get started by adding your first opportunity'

  return {
    opportunities: opportunitiesWithContext,
    sortedOpportunities,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  }
}
