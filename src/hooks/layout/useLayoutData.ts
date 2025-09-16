/**
 * useLayoutData Hook - Layout-Driven Data Fetching
 *
 * This hook provides the main entry point for layout-driven data fetching, integrating
 * layout configurations with TanStack Query, universal filters, and preference management.
 * It follows existing patterns from the CRM codebase and integrates with the data binding
 * system created in Task 2.3.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type {
  LayoutConfiguration,
  LayoutEntityType
} from '@/types/layout/schema.types'
import type { UniversalFilterState } from '@/types/filters.types'
import {
  LayoutDataBindingService,
  type DataSourceConfig,
  type DataBindingContext,
  LayoutDataTransforms,
  DEFAULT_QUERY_CONFIGS
} from '@/lib/layout/data-binding'
import { AutoQueryService, LayoutCacheManager } from '@/lib/layout/query-integration'
import { useUniversalFilters } from '@/hooks/useUniversalFilters'
import { useLayoutPreferenceValue } from '@/hooks/useLayoutPreferences'
import { debugQueryState, measureQueryPerformance } from '@/lib/query-debug'

// Hook configuration for layout-driven data fetching
export interface UseLayoutDataOptions<T = any> {
  layoutConfig: LayoutConfiguration
  dataSource?: DataSourceConfig<T>
  initialFilters?: Partial<UniversalFilterState>
  sorting?: { field: string; order: 'asc' | 'desc' }
  pagination?: { offset: number; limit: number }
  enabled?: boolean
  queryOptions?: Partial<UseQueryOptions<T[]>>
  transformData?: boolean
  autoRefresh?: boolean
  prefetchRelated?: boolean
}

// Hook return type
export interface UseLayoutDataReturn<T = any> {
  // Data state
  data: T[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isFetching: boolean

  // Filter state and controls
  filters: UniversalFilterState
  updateFilters: (filters: UniversalFilterState) => void
  resetFilters: () => void

  // Data binding context
  context: DataBindingContext<T>

  // Query controls
  refetch: () => Promise<any>
  invalidate: () => void

  // Computed properties
  hasActiveFilters: boolean
  totalResults: number
  isEmpty: boolean
}

/**
 * Main hook for layout-driven data fetching
 * Combines layout configuration, data sources, filters, and preferences
 */
export function useLayoutData<T = any>(
  options: UseLayoutDataOptions<T>
): UseLayoutDataReturn<T> {
  const {
    layoutConfig,
    dataSource,
    initialFilters = {},
    sorting,
    pagination,
    enabled = true,
    queryOptions = {},
    transformData = true,
    autoRefresh = false,
    prefetchRelated = false
  } = options

  // Get or create data source configuration
  const effectiveDataSource = useMemo(() => {
    if (dataSource) {
      return dataSource
    }

    // Use default configuration for the entity type
    const defaultConfig = DEFAULT_QUERY_CONFIGS[layoutConfig.entityType]
    if (defaultConfig?.dataSource) {
      return {
        ...defaultConfig.dataSource,
        entityType: layoutConfig.entityType
      } as DataSourceConfig<T>
    }

    throw new Error(`No data source provided and no default configuration found for entity type: ${layoutConfig.entityType}`)
  }, [dataSource, layoutConfig.entityType])

  // Universal filters integration
  const {
    filters,
    handleFiltersChange,
    resetFilters,
    computed: filterComputed
  } = useUniversalFilters(initialFilters)

  // Layout preferences integration
  const [savedSorting, updateSavedSorting] = useLayoutPreferenceValue(
    `layout.${layoutConfig.id}.sorting`,
    sorting || { field: effectiveDataSource.sorting?.defaultSortBy || 'created_at', order: 'asc' },
    'user',
    layoutConfig.entityType
  )

  // Use saved sorting if no explicit sorting provided
  const effectiveSorting = sorting || savedSorting

  // Generate query key and function
  const queryKey = useMemo(() => {
    return LayoutDataBindingService.generateQueryKey(
      layoutConfig.id,
      layoutConfig.entityType,
      filters,
      [effectiveSorting, pagination]
    )
  }, [layoutConfig.id, layoutConfig.entityType, filters, effectiveSorting, pagination])

  const queryFn = useMemo(() => {
    return LayoutDataBindingService.generateQueryFunction(
      effectiveDataSource,
      filters,
      effectiveSorting,
      pagination
    )
  }, [effectiveDataSource, filters, effectiveSorting, pagination])

  // Main data query
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const timer = measureQueryPerformance(`Layout data query: ${layoutConfig.name}`)

      try {
        const rawData = await queryFn()
        timer.end()

        // Apply data transforms if enabled
        if (transformData) {
          const transformKey = layoutConfig.entityType
          if (LayoutDataTransforms[transformKey as keyof typeof LayoutDataTransforms]) {
            return LayoutDataTransforms[transformKey as keyof typeof LayoutDataTransforms](rawData)
          }
        }

        return rawData as T[]
      } catch (error) {
        timer.end()
        throw error
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes default
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error instanceof Error && error.message.includes('Authentication required')) {
        return false
      }
      return failureCount < 3
    },
    ...queryOptions
  })

  // Debug query state in development
  useEffect(() => {
    debugQueryState(queryKey, `Layout data: ${layoutConfig.name}`, queryResult.data, {
      isLoading: queryResult.isLoading,
      isError: queryResult.isError,
      error: queryResult.error || undefined,
      dataUpdatedAt: queryResult.dataUpdatedAt,
      status: queryResult.status,
      fetchStatus: queryResult.fetchStatus
    })
  }, [queryResult.data, queryResult.isLoading, queryResult.isError, queryKey, layoutConfig.name])

  // Update saved sorting when effective sorting changes
  useEffect(() => {
    if (sorting && JSON.stringify(sorting) !== JSON.stringify(savedSorting)) {
      updateSavedSorting(sorting)
    }
  }, [sorting, savedSorting, updateSavedSorting])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      queryResult.refetch()
    }, 30 * 1000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, queryResult.refetch])

  // Data binding context
  const context = useMemo((): DataBindingContext<T> => ({
    entityType: layoutConfig.entityType,
    entityId: undefined, // Could be added for detail views
    data: queryResult.data || [],
    loading: queryResult.isLoading,
    error: queryResult.error,
    filters,
    sorting: effectiveSorting,
    pagination: pagination || { offset: 0, limit: effectiveDataSource.pagination?.defaultLimit || 50, total: (queryResult.data?.length || 0) },
    refetch: queryResult.refetch,
    invalidate: () => LayoutCacheManager.invalidateLayoutQueries(
      // Note: We can't access queryClient directly here, would need to be passed or use useQueryClient
      {} as any, // Placeholder - should use actual queryClient
      layoutConfig.id,
      layoutConfig.entityType
    )
  }), [
    layoutConfig.entityType,
    layoutConfig.id,
    queryResult.data,
    queryResult.isLoading,
    queryResult.error,
    filters,
    effectiveSorting,
    pagination,
    queryResult.refetch,
    effectiveDataSource.pagination?.defaultLimit
  ])

  // Enhanced filter change handler
  const updateFilters = useCallback((newFilters: UniversalFilterState) => {
    // Validate filters before applying
    const validation = LayoutDataBindingService.validateFilterConfig(newFilters, layoutConfig.entityType)

    if (!validation.isValid) {
      console.warn('Invalid filters:', validation.errors)
      return
    }

    handleFiltersChange(newFilters)
  }, [handleFiltersChange, layoutConfig.entityType])

  // Computed properties
  const hasActiveFilters = filterComputed.hasActiveFilters
  const totalResults = queryResult.data?.length || 0
  const isEmpty = totalResults === 0 && !queryResult.isLoading

  return {
    // Data state
    data: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isFetching: queryResult.isFetching,

    // Filter state and controls
    filters,
    updateFilters,
    resetFilters,

    // Data binding context
    context,

    // Query controls
    refetch: queryResult.refetch,
    invalidate: context.invalidate,

    // Computed properties
    hasActiveFilters,
    totalResults,
    isEmpty
  }
}

/**
 * Hook for entity-specific layout data with default configurations
 * Provides a simplified interface for common entity types
 */
export function useEntityLayoutData<T = any>(
  entityType: LayoutEntityType,
  layoutId?: string,
  options?: Partial<UseLayoutDataOptions<T>>
): UseLayoutDataReturn<T> {
  // Create minimal layout config if no layoutId provided
  const layoutConfig = useMemo((): LayoutConfiguration => {
    return {
      id: layoutId || `default-${entityType}`,
      name: `${entityType} Layout`,
      version: '1.0.0',
      entityType,
      type: 'slots',
      metadata: {
        displayName: `${entityType} Layout`,
        category: 'default',
        tags: [entityType],
        isShared: false,
        isDefault: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usageCount: 0
      },
      structure: {
        slots: [],
        composition: {
          requiredSlots: [],
          slotOrder: [],
          inheritance: { overrides: [], merge: [] },
          validation: { required: [], dependencies: {}, conflicts: {} }
        },
        responsive: {
          breakpoints: { mobile: 768, tablet: 1024, laptop: 1280, desktop: 1920 },
          mobileFirst: true,
          adaptiveLayout: true
        }
      }
    } as LayoutConfiguration
  }, [entityType, layoutId])

  return useLayoutData({
    layoutConfig,
    ...options
  })
}

/**
 * Hook for layout data with search capabilities
 * Extends basic layout data with search functionality
 */
export function useLayoutDataWithSearch<T = any>(
  options: UseLayoutDataOptions<T> & {
    searchTerm?: string
    searchableFields?: string[]
  }
): UseLayoutDataReturn<T> & {
  searchTerm: string
  setSearchTerm: (term: string) => void
  clearSearch: () => void
} {
  const { searchTerm: initialSearchTerm = '', searchableFields = [], ...layoutOptions } = options
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)

  // Create enhanced data source with search capabilities
  const enhancedDataSource = useMemo(() => {
    if (!options.dataSource) return undefined

    return {
      ...options.dataSource,
      // Add search filter to dynamic filters
      filters: {
        ...options.dataSource.filters,
        dynamic: [
          ...(options.dataSource.filters?.dynamic || []),
          ...(searchTerm && searchableFields.length > 0 ? [{
            field: 'search',
            source: 'props' as const,
            sourceKey: 'searchTerm',
            operator: 'ilike' as const,
            transform: (value: string) => `%${value}%`
          }] : [])
        ]
      }
    }
  }, [options.dataSource, searchTerm, searchableFields])

  const layoutData = useLayoutData({
    ...layoutOptions,
    dataSource: enhancedDataSource
  })

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  return {
    ...layoutData,
    searchTerm,
    setSearchTerm,
    clearSearch
  }
}

/**
 * Hook for layout data with automatic preference persistence
 * Automatically saves and restores filter and sorting preferences
 */
export function useLayoutDataWithPreferences<T = any>(
  options: UseLayoutDataOptions<T>
): UseLayoutDataReturn<T> {
  const { layoutConfig } = options

  // Load saved filter preferences
  const [savedFilters, updateSavedFilters] = useLayoutPreferenceValue(
    `layout.${layoutConfig.id}.filters`,
    options.initialFilters || {},
    'user',
    layoutConfig.entityType
  )

  // Use saved filters as initial filters
  const layoutData = useLayoutData({
    ...options,
    initialFilters: savedFilters
  })

  // Save filters when they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(layoutData.filters) !== JSON.stringify(savedFilters)) {
        updateSavedFilters(layoutData.filters)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [layoutData.filters, savedFilters, updateSavedFilters])

  return layoutData
}

export default useLayoutData