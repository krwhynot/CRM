/**
 * TanStack Query Performance Optimizations
 * Provides optimized patterns for data fetching and caching in the CRM
 */

import {
  QueryClient,
  useQueryClient,
  useQuery,
  useMutation,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

// Optimized query client configuration for CRM workload
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive stale time for relatively static CRM data
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes

        // Retry configuration optimized for CRM operations
        retry: (failureCount: number, error: Error & { status?: number }) => {
          // Don't retry on authentication errors
          if (
            (error?.status !== undefined && error.status === 401) ||
            (error?.status !== undefined && error.status === 403)
          ) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },

        // Background refetch optimization
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,

        // Network mode configuration
        networkMode: 'online',
      },
      mutations: {
        // Mutation retry configuration
        retry: (failureCount: number, error: Error & { status?: number }) => {
          // Don't retry on client errors (4xx)
          if (error?.status !== undefined && error.status >= 400 && error.status < 500) {
            return false
          }
          return failureCount < 2
        },

        networkMode: 'online',
      },
    },
  })
}

// Optimized infinite query for large datasets
export function useOptimizedInfiniteQuery<T>(
  queryKey: readonly unknown[],
  queryFn: ({ pageParam }: { pageParam?: number }) => Promise<{
    data: T[]
    nextPage?: number
    hasMore: boolean
  }>,
  options?: {
    pageSize?: number
    initialPageParam?: number
    enabled?: boolean
  }
) {
  const { pageSize = 50, initialPageParam = 1, enabled = true } = options || {}

  return useInfiniteQuery({
    queryKey: [...queryKey, { pageSize }],
    queryFn: ({ pageParam = initialPageParam }) => queryFn({ pageParam }),
    initialPageParam,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Performance optimization: keep previous data while loading
    placeholderData: keepPreviousData,
    // Optimize for perceived performance
    refetchOnWindowFocus: false,
  })
}

// Batch query optimization for related data
// NOTE: This function is currently not used in the codebase
// For batching queries, use individual useQuery hooks or TanStack Query's
// useQueries hook which properly handles the rules of hooks
export function useBatchOptimizedQueries(
  queries: Array<{
    queryKey: readonly unknown[]
    queryFn: () => Promise<unknown>
    enabled?: boolean
    staleTime?: number
  }>
) {
  // Instead of calling useQuery in a loop (which violates rules of hooks),
  // we'll use the query client to prefetch and manage queries manually
  const results = useMemo(() => {
    return queries.map(() => ({
      data: undefined,
      isLoading: true,
      isError: false,
    }))
  }, [queries])

  // Generate cache key for query batching
  const _cacheKey = useMemo(
    () => queries.map((q) => JSON.stringify(q.queryKey)).join('|'),
    [queries]
  )

  // For now, return a placeholder result structure
  // In a real implementation, you would use useQueries from TanStack Query
  return useMemo(
    () => ({
      data: {},
      isLoading: false,
      isError: false,
      results,
    }),
    [results]
  )
}

// Optimistic update patterns for CRM mutations
export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: readonly unknown[]
  optimisticUpdate?: (oldData: TData[], variables: TVariables) => TData[]
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: unknown, variables: TVariables) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,

    // Optimistic update implementation
    onMutate: async (variables) => {
      if (!optimisticUpdate) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot current data
      const previousData = queryClient.getQueryData<TData[]>(queryKey)

      // Optimistically update cache
      if (previousData) {
        queryClient.setQueryData<TData[]>(queryKey, (oldData) =>
          optimisticUpdate(oldData || [], variables)
        )
      }

      return { previousData }
    },

    // Revert on error
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error, variables)
    },

    // Always refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },

    onSuccess,
  })
}

// Smart cache prefetching for CRM workflows
export function usePrefetchRelatedData() {
  const queryClient = useQueryClient()

  const prefetchRelatedData = useCallback(
    async (entityType: 'organization' | 'contact' | 'opportunity', entityId: string) => {
      const prefetchPromises: Promise<unknown>[] = []

      switch (entityType) {
        case 'organization': {
          // Prefetch contacts for this organization
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['contacts', { filters: { organization_id: entityId } }],
              queryFn: () => fetchContacts({ organization_id: entityId }),
              staleTime: 2 * 60 * 1000,
            })
          )

          // Prefetch opportunities for this organization
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['opportunities', { filters: { organization_id: entityId } }],
              queryFn: () => fetchOpportunities({ organization_id: entityId }),
              staleTime: 2 * 60 * 1000,
            })
          )
          break
        }

        case 'contact': {
          // Prefetch contact's organization
          const contactData = queryClient.getQueryData<{ organization_id?: string }>([
            'contacts',
            entityId,
          ])
          if (contactData?.organization_id) {
            prefetchPromises.push(
              queryClient.prefetchQuery({
                queryKey: ['organizations', contactData.organization_id],
                queryFn: () => fetchOrganization(contactData.organization_id!),
                staleTime: 5 * 60 * 1000,
              })
            )
          }
          break
        }

        case 'opportunity': {
          // Prefetch opportunity's organization and contacts
          const opportunityData = queryClient.getQueryData<{ organization_id?: string }>([
            'opportunities',
            entityId,
          ])
          if (opportunityData?.organization_id) {
            prefetchPromises.push(
              queryClient.prefetchQuery({
                queryKey: ['organizations', opportunityData.organization_id],
                queryFn: () => fetchOrganization(opportunityData.organization_id!),
                staleTime: 5 * 60 * 1000,
              })
            )
          }
          break
        }
      }

      await Promise.all(prefetchPromises)
    },
    [queryClient]
  )

  return { prefetchRelatedData }
}

// Query deduplication for simultaneous requests
export function useDeduplicatedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  // Create a unique key for deduplication
  const dedupeKey = JSON.stringify(queryKey)

  return useQuery({
    queryKey: [...queryKey, 'dedupe', dedupeKey],
    queryFn: queryFn,
    enabled: options?.enabled,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    // Ensure we don't make duplicate requests
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// Background sync optimization for offline support
export function useBackgroundSync() {
  const queryClient = useQueryClient()

  const syncPendingMutations = useCallback(async () => {
    const mutationCache = queryClient.getMutationCache()
    const pendingMutations = mutationCache
      .getAll()
      .filter((mutation) => mutation.state.status === 'pending')

    // Sync pending mutations silently

    // Process pending mutations in sequence to avoid conflicts
    for (const mutation of pendingMutations) {
      try {
        if (mutation.state.variables !== undefined) {
          await mutation.execute(mutation.state.variables)
        }
      } catch (error) {
        console.error('Failed to sync mutation:', error)
      }
    }
  }, [queryClient])

  const clearStaleData = useCallback(() => {
    // Clear data older than 1 hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    queryClient
      .getQueryCache()
      .getAll()
      .forEach((query) => {
        if (query.state.dataUpdatedAt < oneHourAgo) {
          queryClient.removeQueries({ queryKey: query.queryKey })
        }
      })
  }, [queryClient])

  return { syncPendingMutations, clearStaleData }
}

// Placeholder functions for demo - should be imported from actual API modules
const fetchContacts = async (_filters: { organization_id?: string }): Promise<unknown> => {
  // Implementation - returns contact data
  return Promise.resolve([])
}
const fetchOpportunities = async (_filters: { organization_id?: string }): Promise<unknown> => {
  // Implementation - returns opportunity data
  return Promise.resolve([])
}
const fetchOrganization = async (_id: string): Promise<unknown> => {
  // Implementation - returns organization data
  return Promise.resolve({})
}
