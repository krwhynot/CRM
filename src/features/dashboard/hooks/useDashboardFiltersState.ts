import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/performance-optimizations'
import type { FilterState } from '@/types/dashboard'

export const useDashboardFiltersState = (
  filters: FilterState,
  onFiltersChange: (filters: FilterState) => void
) => {
  // Local state for immediate UI updates
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  // Debounce the filter changes by 300ms
  const debouncedFilters = useDebounce(localFilters, 300)

  // Update parent when debounced filters change
  useEffect(() => {
    onFiltersChange(debouncedFilters)
  }, [debouncedFilters, onFiltersChange])

  // Update local state when external filters change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    // Handle arrays (like accountManagers) vs strings
    const processedValue = key === 'accountManagers' ? value : String(value)

    // Reset product when principal changes
    if (key === 'principal' && String(processedValue) !== localFilters.principal) {
      setLocalFilters({
        ...localFilters,
        [key]: processedValue,
        product: 'all',
      })
    } else {
      setLocalFilters({
        ...localFilters,
        [key]: processedValue,
      })
    }
  }

  const resetFilters = () => {
    const resetState: FilterState = {
      principal: 'all',
      product: 'all',
      weeks: 'Current Week',
      accountManagers: [],
      focus: 'all_activity',
      quickView: 'none',
    }
    setLocalFilters(resetState)
    onFiltersChange(resetState)
  }

  return {
    localFilters,
    handleFilterChange,
    resetFilters,
  }
}
