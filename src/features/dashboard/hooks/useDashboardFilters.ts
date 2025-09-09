import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '@/lib/performance-optimizations'
import type { FilterState, UseDashboardFiltersReturn } from '@/types/dashboard'

export const useDashboardFilters = (
  initialFilters: FilterState = {
    principal: 'all',
    product: 'all',
    weeks: 'Current Week',
    accountManagers: [],
    focus: 'all_activity',
    quickView: 'none',
  }
): UseDashboardFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced filters to prevent excessive recalculations
  const debouncedFilters = useDebounce(filters, 300)

  // Handle filter changes with loading state simulation
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setIsLoading(true)
    setFilters(newFilters)

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }, [])

  // Quick view preset application
  const applyQuickView = useCallback(
    (preset: FilterState['quickView']) => {
      const quickViewPresets: Record<
        NonNullable<FilterState['quickView']>,
        Partial<FilterState>
      > = {
        action_items_due: {
          focus: 'overdue',
          quickView: 'action_items_due',
        },
        pipeline_movers: {
          focus: 'high_priority',
          quickView: 'pipeline_movers',
        },
        recent_wins: {
          focus: 'all_activity',
          quickView: 'recent_wins',
        },
        needs_attention: {
          focus: 'overdue',
          quickView: 'needs_attention',
        },
        none: {
          quickView: 'none',
        },
      }

      if (preset && preset !== 'none' && quickViewPresets[preset]) {
        handleFiltersChange({
          ...filters,
          ...quickViewPresets[preset],
        })
      } else {
        handleFiltersChange({
          ...filters,
          quickView: 'none',
        })
      }
    },
    [filters, handleFiltersChange]
  )

  // Computed filter properties for enhanced UX
  const computed = useMemo(() => {
    const hasActiveQuickView = debouncedFilters.quickView && debouncedFilters.quickView !== 'none'
    const hasActiveFocus = debouncedFilters.focus && debouncedFilters.focus !== 'all_activity'
    const hasAccountManagerFilters =
      debouncedFilters.accountManagers && debouncedFilters.accountManagers.length > 0
    const isMultiPrincipalView =
      Array.isArray(debouncedFilters.principal) && debouncedFilters.principal.length > 1

    const hasPrincipalFilters = Array.isArray(debouncedFilters.principal)
      ? debouncedFilters.principal.length > 0 && !debouncedFilters.principal.includes('all')
      : debouncedFilters.principal !== 'all'

    const hasActiveFilters =
      hasPrincipalFilters ||
      debouncedFilters.product !== 'all' ||
      hasActiveFocus ||
      hasActiveQuickView ||
      hasAccountManagerFilters

    // Enhanced filter summary
    const summaryParts: string[] = []
    if (hasActiveQuickView) summaryParts.push(debouncedFilters.quickView!)
    if (hasAccountManagerFilters)
      summaryParts.push(
        `${debouncedFilters.accountManagers!.length} AM${debouncedFilters.accountManagers!.length > 1 ? 's' : ''}`
      )
    if (isMultiPrincipalView)
      summaryParts.push(`${(debouncedFilters.principal as string[]).length} principals`)

    const filterSummary = hasActiveFilters
      ? summaryParts.length > 0
        ? summaryParts.join(' + ') + ' view'
        : 'custom view'
      : 'all data'

    return {
      hasActiveFilters,
      hasActiveFocus,
      hasActiveQuickView,
      hasAccountManagerFilters,
      isMultiPrincipalView,
      isMyTasksView: debouncedFilters.focus === 'my_tasks',
      isTeamView: debouncedFilters.focus === 'team_overview',
      filterSummary,
    }
  }, [debouncedFilters])

  return {
    filters,
    debouncedFilters,
    isLoading,
    handleFiltersChange,
    applyQuickView,
    computed,
  }
}
