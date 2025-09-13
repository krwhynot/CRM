/**
 * Generic Entity List Hook
 *
 * Provides comprehensive list management functionality for any CRM entity type.
 * Handles data fetching, filtering, sorting, pagination, and virtualization.
 */

import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useMemo, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { handleArrayResult } from '@/lib/database-utils'
import type {
  BaseEntity,
  BaseFilters,
  EntityQueryOptions,
  UseEntityListReturn,
  QueryKeyFactory,
} from './types'

// Configuration for entity list behavior
interface EntityListConfig<T extends BaseEntity> {
  tableName: string
  queryKeyFactory: QueryKeyFactory<string>
  select?: string
  defaultFilters?: BaseFilters
  defaultSort?: {
    column: keyof T
    direction: 'asc' | 'desc'
  }
  virtualizationThreshold?: number
  staleTime?: number
  cacheTime?: number
}

/**
 * Generic entity list hook that provides data fetching, filtering, and management
 * for any CRM entity type with full TypeScript support.
 */
export function useEntityList<T extends BaseEntity, TFilters extends BaseFilters = BaseFilters>(
  config: EntityListConfig<T>,
  options?: EntityQueryOptions<T> & {
    initialFilters?: TFilters
    onFiltersChange?: (filters: TFilters) => void
  }
): UseEntityListReturn<T, TFilters> {
  const queryClient = useQueryClient()

  // Filter state management
  const [filters, setFiltersState] = useState<TFilters>({
    ...config.defaultFilters,
    ...options?.initialFilters,
  } as TFilters)

  // Build query key based on current filters
  const queryKey = useMemo(
    () => config.queryKeyFactory.list(filters),
    [config.queryKeyFactory, filters]
  )

  // Build Supabase query function
  const queryFn = useCallback(async (): Promise<T[]> => {
    let query = supabase.from(config.tableName).select(config.select || '*')

    // Apply soft delete filter
    if (!options?.includeDeleted) {
      query = query.is('deleted_at', null)
    }

    // Apply search filter
    if (filters.search) {
      // This is a basic implementation - specific entities can override
      query = query.ilike('name', `%${filters.search}%`)
    }

    // Apply sorting
    if (filters.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.orderDirection !== 'desc',
      })
    } else if (config.defaultSort) {
      query = query.order(config.defaultSort.column as string, {
        ascending: config.defaultSort.direction === 'asc',
      })
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1)
      }
    }

    const result = await query
    return handleArrayResult(result, `fetch ${config.tableName}`) as T[]
  }, [config.tableName, config.select, config.defaultSort, filters, options?.includeDeleted])

  // Execute query
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey,
    queryFn,
    staleTime: config.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: config.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    ...options,
  })

  // Filter data client-side for complex filtering not handled by database
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Additional client-side filters can be applied here
      // This allows for complex filtering logic that's difficult to express in SQL
      return true
    })
  }, [data])

  // Update filters with callback support
  const setFilters = useCallback(
    (newFilters: TFilters | ((prev: TFilters) => TFilters)) => {
      const resolvedFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters

      setFiltersState(resolvedFilters)
      options?.onFiltersChange?.(resolvedFilters)
    },
    [filters, options]
  )

  // Invalidate queries helper
  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: config.queryKeyFactory.lists(),
    })
  }, [queryClient, config.queryKeyFactory])

  // Add optimistic update helper
  const optimisticUpdate = useCallback(
    (id: string, updates: Partial<T>) => {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old
        return old.map((item) => (item.id === id ? { ...item, ...updates } : item))
      })
    },
    [queryClient, queryKey]
  )

  // Add entity to cache
  const addToCache = useCallback(
    (entity: T) => {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return [entity]
        return [entity, ...old]
      })
    },
    [queryClient, queryKey]
  )

  // Remove entity from cache
  const removeFromCache = useCallback(
    (id: string) => {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old
        return old.filter((item) => item.id !== id)
      })
    },
    [queryClient, queryKey]
  )

  return {
    data,
    filteredData,
    filters,
    setFilters,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    // Additional utility methods
    invalidateList,
    optimisticUpdate,
    addToCache,
    removeFromCache,
  } as UseEntityListReturn<T, TFilters> & {
    invalidateList: () => void
    optimisticUpdate: (id: string, updates: Partial<T>) => void
    addToCache: (entity: T) => void
    removeFromCache: (id: string) => void
  }
}

/**
 * Helper function to create entity list configurations
 */
export function createEntityListConfig<T extends BaseEntity>(
  tableName: string,
  queryKeyPrefix: string,
  options?: Partial<EntityListConfig<T>>
): EntityListConfig<T> {
  const queryKeyFactory: QueryKeyFactory<string> = {
    all: [queryKeyPrefix] as const,
    lists: () => [queryKeyPrefix, 'list'] as const,
    list: (filters?: BaseFilters) => [queryKeyPrefix, 'list', { filters }] as const,
    details: () => [queryKeyPrefix, 'detail'] as const,
    detail: (id: string) => [queryKeyPrefix, 'detail', id] as const,
  }

  return {
    tableName,
    queryKeyFactory,
    select: '*',
    virtualizationThreshold: 500,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    ...options,
  }
}

/**
 * Specialized hook for virtualized lists (automatically enables virtualization for large datasets)
 */
export function useVirtualizedEntityList<
  T extends BaseEntity,
  TFilters extends BaseFilters = BaseFilters,
>(
  config: EntityListConfig<T>,
  options?: EntityQueryOptions<T> & {
    initialFilters?: TFilters
    onFiltersChange?: (filters: TFilters) => void
    forceVirtualization?: boolean
  }
) {
  const listResult = useEntityList(config, options)

  const shouldVirtualize = useMemo(() => {
    return (
      options?.forceVirtualization ||
      listResult.data.length >= (config.virtualizationThreshold ?? 500)
    )
  }, [options?.forceVirtualization, listResult.data.length, config.virtualizationThreshold])

  return {
    ...listResult,
    shouldVirtualize,
    virtualizationThreshold: config.virtualizationThreshold ?? 500,
  }
}
