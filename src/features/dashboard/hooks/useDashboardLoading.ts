import { useState, useEffect } from 'react'
import type { FilterState, ActivityItem, UseDashboardLoadingReturn } from '@/types/dashboard'

export const useDashboardLoading = (
  debouncedFilters: FilterState,
  activityItems: ActivityItem[]
): UseDashboardLoadingReturn => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Show empty state if no principal selected and no data would be visible
  const showEmptyState = debouncedFilters.principal === 'all' && activityItems.length === 0

  return {
    isInitialLoad,
    showEmptyState,
  }
}
