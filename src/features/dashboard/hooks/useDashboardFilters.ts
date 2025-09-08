import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '@/lib/performance-optimizations'
import type { FilterState, UseDashboardFiltersReturn } from '@/types/dashboard'

export const useDashboardFilters = (
  initialFilters: FilterState = {
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks',
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
  const applyQuickView = useCallback((preset: FilterState['quickView']) => {
    const quickViewPresets: Record<NonNullable<FilterState['quickView']>, Partial<FilterState>> = {
      action_items_due: {
        focus: 'overdue',
        quickView: 'action_items_due'
      },
      pipeline_movers: {
        focus: 'high_priority', 
        quickView: 'pipeline_movers'
      },
      recent_wins: {
        focus: 'all_activity',
        quickView: 'recent_wins'
      },
      needs_attention: {
        focus: 'overdue',
        quickView: 'needs_attention'
      },
      none: {
        quickView: 'none'
      }
    }

    if (preset && preset !== 'none' && quickViewPresets[preset]) {
      handleFiltersChange({
        ...filters,
        ...quickViewPresets[preset]
      })
    } else {
      handleFiltersChange({
        ...filters,
        quickView: 'none'
      })
    }
  }, [filters, handleFiltersChange])

  // Computed filter properties for enhanced UX
  const computed = useMemo(() => {
    const hasActiveQuickView = debouncedFilters.quickView && debouncedFilters.quickView !== 'none'
    const hasActiveFocus = debouncedFilters.focus && debouncedFilters.focus !== 'all_activity'
    const hasActiveFilters = debouncedFilters.principal !== 'all' || 
                            debouncedFilters.product !== 'all' || 
                            hasActiveFocus || 
                            hasActiveQuickView

    return {
      hasActiveFilters,
      hasActiveFocus,
      hasActiveQuickView,
      isMyTasksView: debouncedFilters.focus === 'my_tasks',
      isTeamView: debouncedFilters.focus === 'team_overview',
      filterSummary: hasActiveFilters 
        ? `${hasActiveQuickView ? debouncedFilters.quickView : 'custom'} view`
        : 'all data'
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
