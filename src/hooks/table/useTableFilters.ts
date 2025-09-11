import { useState, useCallback, useMemo } from 'react'

/**
 * Generic table filters hook that provides filtering state management
 * Extracted from all table components to centralize filter logic
 */
export interface UseTableFiltersOptions<T, F extends Record<string, unknown>> {
  /** Initial filter values */
  initialFilters: F
  /** Function to apply filters to data */
  filterFunction: (items: T[], filters: F) => T[]
  /** Optional callback when filters change */
  onFiltersChange?: (filters: F) => void
}

export interface UseTableFiltersReturn<T, F extends Record<string, unknown>> {
  /** Current filter values */
  filters: F
  /** Filtered data based on current filters */
  filteredData: T[]
  /** Update filter values */
  updateFilters: (newFilters: Partial<F>) => void
  /** Reset filters to initial values */
  resetFilters: () => void
  /** Set specific filter value */
  setFilter: <K extends keyof F>(key: K, value: F[K]) => void
  /** Check if any filters are active (different from initial) */
  hasActiveFilters: () => boolean
}

export function useTableFilters<T, F extends Record<string, unknown>>({
  initialFilters,
  filterFunction,
  onFiltersChange,
}: UseTableFiltersOptions<T, F>) {
  const [filters, setFilters] = useState<F>(initialFilters)

  const updateFilters = useCallback((newFilters: Partial<F>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      onFiltersChange?.(updated)
      return updated
    })
  }, [onFiltersChange])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    onFiltersChange?.(initialFilters)
  }, [initialFilters, onFiltersChange])

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    updateFilters({ [key]: value } as Partial<F>)
  }, [updateFilters])

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => 
      filters[key] !== initialFilters[key]
    )
  }, [filters, initialFilters])

  return {
    filters,
    updateFilters,
    resetFilters,
    setFilter,
    hasActiveFilters,
  }
}

/**
 * Hook that combines filtering with data to return filtered results
 */
export function useTableFiltersWithData<T, F extends Record<string, unknown>>(
  data: T[],
  options: UseTableFiltersOptions<T, F>
): UseTableFiltersReturn<T, F> {
  const filterState = useTableFilters(options)
  
  const filteredData = useMemo(() => {
    return options.filterFunction(data, filterState.filters)
  }, [data, filterState.filters, options.filterFunction])

  return {
    ...filterState,
    filteredData,
  }
}