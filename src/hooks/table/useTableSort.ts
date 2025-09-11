import { useState, useCallback, useMemo } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig<T> {
  /** Field to sort by */
  field: keyof T | string
  /** Sort direction */
  direction: SortDirection
  /** Custom sort function for complex sorting */
  sortFn?: (a: T, b: T) => number
}

/**
 * Generic table sorting hook that provides sorting state management
 * Supports single and multi-column sorting
 */
export interface UseTableSortOptions<T> {
  /** Initial sort configuration */
  initialSort?: SortConfig<T>
  /** Allow multi-column sorting */
  allowMultiSort?: boolean
  /** Custom sort functions for specific fields */
  customSortFns?: Record<string, (a: T, b: T) => number>
}

export interface UseTableSortReturn<T> {
  /** Current sort configuration(s) */
  sortConfig: SortConfig<T>[]
  /** Sorted data based on current sort config */
  sortedData: T[]
  /** Update sort for a specific field */
  handleSort: (field: keyof T | string, customSortFn?: (a: T, b: T) => number) => void
  /** Clear all sorting */
  clearSort: () => void
  /** Get sort direction for a field (for UI indicators) */
  getSortDirection: (field: keyof T | string) => SortDirection | undefined
  /** Check if a field is being sorted */
  isSorted: (field: keyof T | string) => boolean
}

export function useTableSort<T>({
  initialSort,
  allowMultiSort = false,
  customSortFns = {},
}: UseTableSortOptions<T> = {}): UseTableSortReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>[]>(
    initialSort ? [initialSort] : []
  )

  const handleSort = useCallback((field: keyof T | string, customSortFn?: (a: T, b: T) => number) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(config => config.field === field)
      
      if (existingIndex >= 0) {
        // Field is already sorted, toggle direction or remove
        const existing = prev[existingIndex]
        if (existing.direction === 'asc') {
          // Change to desc
          const newConfig = [...prev]
          newConfig[existingIndex] = { ...existing, direction: 'desc' }
          return newConfig
        } else {
          // Remove sort for this field
          return allowMultiSort ? prev.filter((_, i) => i !== existingIndex) : []
        }
      } else {
        // New field to sort
        const newSort: SortConfig<T> = {
          field,
          direction: 'asc',
          sortFn: customSortFn || customSortFns[String(field)]
        }
        
        return allowMultiSort ? [...prev, newSort] : [newSort]
      }
    })
  }, [allowMultiSort, customSortFns])

  const clearSort = useCallback(() => {
    setSortConfig([])
  }, [])

  const getSortDirection = useCallback((field: keyof T | string): SortDirection | undefined => {
    const config = sortConfig.find(config => config.field === field)
    return config?.direction
  }, [sortConfig])

  const isSorted = useCallback((field: keyof T | string): boolean => {
    return sortConfig.some(config => config.field === field)
  }, [sortConfig])

  return {
    sortConfig,
    sortedData: [], // Will be computed when used with data
    handleSort,
    clearSort,
    getSortDirection,
    isSorted,
  }
}

/**
 * Hook that combines sorting with data to return sorted results
 */
export function useTableSortWithData<T>(
  data: T[],
  options: UseTableSortOptions<T> = {}
): UseTableSortReturn<T> {
  const sortState = useTableSort(options)
  
  const sortedData = useMemo(() => {
    if (sortState.sortConfig.length === 0) {
      return data
    }

    return [...data].sort((a, b) => {
      for (const config of sortState.sortConfig) {
        let result = 0
        
        if (config.sortFn) {
          // Use custom sort function
          result = config.sortFn(a, b)
        } else {
          // Default string/number sorting
          const aValue = getNestedValue(a, config.field)
          const bValue = getNestedValue(b, config.field)
          
          if (aValue === null || aValue === undefined) return 1
          if (bValue === null || bValue === undefined) return -1
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            result = aValue.localeCompare(bValue)
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            result = aValue - bValue
          } else {
            result = String(aValue).localeCompare(String(bValue))
          }
        }
        
        if (result !== 0) {
          return config.direction === 'desc' ? -result : result
        }
      }
      
      return 0
    })
  }, [data, sortState.sortConfig])

  return {
    ...sortState,
    sortedData,
  }
}

/**
 * Helper function to get nested values from objects using dot notation
 */
function getNestedValue<T>(obj: T, path: keyof T | string): unknown {
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((current: unknown, key: string) => {
      return (current as Record<string, unknown>)?.[key]
    }, obj)
  }
  return (obj as Record<string, unknown>)[path as string]
}