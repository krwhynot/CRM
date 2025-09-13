import { useState, useMemo } from 'react'
import { useInteractions } from './useInteractions'
import type { InteractionWithRelations, InteractionFilters } from '@/types/interaction.types'
import { DEFAULT_WEEKLY_FILTERS } from '@/types/shared-filters.types'

interface UseInteractionTableDataConfig {
  filters?: InteractionFilters
}

export function useInteractionTableData({
  filters: propFilters,
}: UseInteractionTableDataConfig = {}) {
  // Fetch interactions data
  const { data: interactions = [], isLoading } = useInteractions()

  // Enhanced filtering state
  const [filters, setFilters] = useState<InteractionFilters>(() => ({
    ...DEFAULT_WEEKLY_FILTERS,
    ...propFilters,
  }))

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filter interactions based on search
  const filteredInteractions = useMemo(() => {
    let filtered = [...interactions]

    // Apply search filter
    if (filters?.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter((interaction) => {
        return (
          interaction.subject?.toLowerCase().includes(term) ||
          interaction.description?.toLowerCase().includes(term) ||
          interaction.notes?.toLowerCase().includes(term) ||
          interaction.contact?.first_name?.toLowerCase().includes(term) ||
          interaction.contact?.last_name?.toLowerCase().includes(term) ||
          interaction.organization?.name?.toLowerCase().includes(term) ||
          interaction.opportunity?.name?.toLowerCase().includes(term) ||
          interaction.type.toLowerCase().includes(term) ||
          interaction.outcome?.toLowerCase().includes(term)
        )
      })
    }

    // Apply quick view filters if provided
    if (filters?.quickView && filters.quickView !== 'none') {
      switch (filters.quickView) {
        case 'follow_ups_due':
          filtered = filtered.filter(
            (interaction) => interaction.follow_up_required && !interaction.follow_up_completed
          )
          break
        case 'overdue_actions':
          filtered = filtered.filter((interaction) => {
            if (!interaction.follow_up_date || interaction.follow_up_completed) return false
            const followUpDate = new Date(interaction.follow_up_date)
            const today = new Date()
            return followUpDate < today
          })
          break
        case 'this_week_activity':
          filtered = filtered.filter((interaction) => {
            const interactionDate = new Date(interaction.interaction_date)
            const today = new Date()
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return interactionDate >= weekAgo
          })
          break
        case 'high_value_interactions':
          filtered = filtered.filter(
            (interaction) => interaction.type === 'demo' || interaction.type === 'proposal'
          )
          break
        default:
          break
      }
    }

    // Sort by date by default (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.interaction_date).getTime()
      const dateB = new Date(b.interaction_date).getTime()
      return dateB - dateA
    })

    return filtered
  }, [interactions, filters])

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const isRowExpanded = (id: string) => expandedRows.has(id)

  // Computed values
  const emptyMessage = filters.search
    ? 'No interactions match your search.'
    : 'No interactions found'
  const emptySubtext = filters.search
    ? 'Try adjusting your search terms'
    : 'Get started by logging your first customer interaction'

  return {
    // Data
    interactions,
    filteredInteractions,
    sortedInteractions: filteredInteractions, // alias for compatibility
    isLoading,

    // Filters
    filters,
    setFilters,

    // Row expansion
    expandedRows,
    toggleRowExpansion,
    isRowExpanded,

    // UI state
    emptyMessage,
    emptySubtext,
  }
}
