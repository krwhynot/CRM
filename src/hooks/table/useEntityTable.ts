import { useState, useMemo, useCallback } from 'react'
import { semanticSpacing } from '@/styles/tokens'

/**
 * Shared hook for standardized table data management.
 * Enforces consistent patterns across all entity tables.
 *
 * Features:
 * - Filtering with memoization
 * - Sorting capabilities
 * - Row expansion state
 * - Selection management
 * - Empty state messages
 * - Performance optimizations
 */

export interface EntityTableConfig<T> {
  // Data
  data: T[]

  // Filtering
  filters?: Record<string, any>
  filterFunction?: (items: T[], filters: Record<string, any>) => T[]

  // Sorting
  sortKey?: keyof T | string
  sortDirection?: 'asc' | 'desc'
  defaultSortKey?: keyof T | string

  // Features
  enableExpansion?: boolean
  enableSelection?: boolean

  // Messages
  emptyMessage?: string
  emptyFilteredMessage?: string
  emptyDescription?: string
  emptyFilteredDescription?: string

  // Entity info
  entityName?: string
  entityNamePlural?: string
}

export interface EntityTableState<T> {
  // Filtered and sorted data
  processedData: T[]

  // Row expansion
  expandedRows: Set<string>
  toggleRowExpansion: (id: string) => void
  isRowExpanded: (id: string) => boolean
  expandAll: () => void
  collapseAll: () => void

  // Selection
  selectedRows: Set<string>
  toggleRowSelection: (id: string) => void
  isRowSelected: (id: string) => boolean
  selectAll: () => void
  clearSelection: () => void

  // Sorting
  sortKey: keyof T | string | undefined
  sortDirection: 'asc' | 'desc'
  handleSort: (key: keyof T | string) => void

  // Messages
  emptyMessage: string
  emptyDescription: string

  // Utilities
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  hasFilters: boolean
  clearFilters?: () => void
}

export function useEntityTable<T extends { id: string }>(
  config: EntityTableConfig<T>
): EntityTableState<T> {
  const {
    data = [],
    filters = {},
    filterFunction,
    sortKey: initialSortKey,
    sortDirection: initialSortDirection = 'asc',
    defaultSortKey,
    enableExpansion = true,
    enableSelection = true,
    emptyMessage = 'No data found',
    emptyFilteredMessage = 'No results match your criteria',
    emptyDescription = 'Get started by adding your first item',
    emptyFilteredDescription = 'Try adjusting your filters',
    entityName = 'item',
    entityNamePlural = 'items',
  } = config

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Expansion state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Sorting state
  const [sortKey, setSortKey] = useState<keyof T | string | undefined>(
    initialSortKey || defaultSortKey
  )
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)

  // Check if filters are active
  const hasFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) =>
        value !== undefined && value !== null && value !== '' && value !== 'all' && value !== 'none'
    )
  }, [filters])

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterFunction) return data
    return filterFunction(data, filters)
  }, [data, filters, filterFunction])

  // Sort data
  const processedData = useMemo(() => {
    if (!sortKey) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey as string)
      const bValue = getNestedValue(b, sortKey as string)

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredData, sortKey, sortDirection])

  // Expansion handlers
  const toggleRowExpansion = useCallback(
    (id: string) => {
      if (!enableExpansion) return

      setExpandedRows((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    [enableExpansion]
  )

  const isRowExpanded = useCallback(
    (id: string) => {
      return expandedRows.has(id)
    },
    [expandedRows]
  )

  const expandAll = useCallback(() => {
    if (!enableExpansion) return
    setExpandedRows(new Set(processedData.map((item) => item.id)))
  }, [enableExpansion, processedData])

  const collapseAll = useCallback(() => {
    setExpandedRows(new Set())
  }, [])

  // Selection handlers
  const toggleRowSelection = useCallback(
    (id: string) => {
      if (!enableSelection) return

      setSelectedRows((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    [enableSelection]
  )

  const isRowSelected = useCallback(
    (id: string) => {
      return selectedRows.has(id)
    },
    [selectedRows]
  )

  const selectAll = useCallback(() => {
    if (!enableSelection) return
    setSelectedRows(new Set(processedData.map((item) => item.id)))
  }, [enableSelection, processedData])

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  // Sorting handler
  const handleSort = useCallback(
    (key: keyof T | string) => {
      if (sortKey === key) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDirection('asc')
      }
    },
    [sortKey]
  )

  // Dynamic messages
  const dynamicEmptyMessage = hasFilters ? emptyFilteredMessage : emptyMessage
  const dynamicEmptyDescription = hasFilters ? emptyFilteredDescription : emptyDescription

  return {
    // Data
    processedData,

    // Expansion
    expandedRows,
    toggleRowExpansion,
    isRowExpanded,
    expandAll,
    collapseAll,

    // Selection
    selectedRows,
    toggleRowSelection,
    isRowSelected,
    selectAll,
    clearSelection,

    // Sorting
    sortKey,
    sortDirection,
    handleSort,

    // Messages
    emptyMessage: dynamicEmptyMessage,
    emptyDescription: dynamicEmptyDescription,

    // Utilities
    isLoading,
    setIsLoading,
    hasFilters,
  }
}

/**
 * Helper function to get nested object values
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    if (value === null || value === undefined) return null
    value = value[key]
  }

  return value
}

/**
 * Hook for consistent table styling
 */
export function useTableStyles() {
  return {
    container: semanticSpacing.layoutContainer,
    card: semanticSpacing.cardContainer,
    toolbar: semanticSpacing.sectionPadding,
    filters: semanticSpacing.stackContainer,
  }
}
