/**
 * Query debugging utilities for identifying data loading inconsistencies
 * Helps track cache state, query behavior, and data flow issues
 */

import type { QueryKey, Query } from '@tanstack/react-query'

export interface QueryDebugInfo {
  queryKey: QueryKey
  data?: { count: number | string; sample: unknown } | null
  isLoading: boolean
  isError: boolean
  error?: Error | { message: string } | string
  dataUpdatedAt: number
  status: string
  fetchStatus: string
}

interface QueryState {
  isLoading: boolean
  isError: boolean
  error?: Error | { message: string }
  dataUpdatedAt: number
  status: string
  fetchStatus: string
}

/**
 * Debug query state and cache behavior
 */
export function debugQueryState(
  queryKey: QueryKey,
  hookName: string,
  data: unknown,
  queryState: QueryState
) {
  const debugInfo: QueryDebugInfo = {
    queryKey,
    data: data
      ? {
          count: Array.isArray(data) ? data.length : 'non-array',
          sample: Array.isArray(data) ? data.slice(0, 2) : data,
        }
      : null,
    isLoading: queryState.isLoading,
    isError: queryState.isError,
    error:
      typeof queryState.error === 'object' && queryState.error && 'message' in queryState.error
        ? queryState.error.message
        : typeof queryState.error === 'string'
          ? queryState.error
          : queryState.error
            ? String(queryState.error)
            : undefined,
    dataUpdatedAt: queryState.dataUpdatedAt,
    status: queryState.status,
    fetchStatus: queryState.fetchStatus,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [${hookName}] Query State:`, debugInfo)

    // Warn about potential issues
    if (queryState.isError) {
      console.warn(`⚠️  [${hookName}] Query failed:`, queryState.error)
    }

    if (Array.isArray(data) && data.length === 0 && !queryState.isLoading) {
      console.warn(`⚠️  [${hookName}] Query returned empty array - potential data issue`)
    }

    if (queryState.dataUpdatedAt && Date.now() - queryState.dataUpdatedAt > 5 * 60 * 1000) {
      console.warn(
        `⚠️  [${hookName}] Data is stale (${Math.round((Date.now() - queryState.dataUpdatedAt) / 1000 / 60)} minutes old)`
      )
    }
  }

  return debugInfo
}

/**
 * Compare query states between different components/pages
 */
export function compareQueryStates(
  state1: QueryDebugInfo,
  state2: QueryDebugInfo,
  component1: string,
  component2: string
) {
  // Compare basic metrics
  const comparison = {
    dataCount: {
      [component1]: state1.data?.count || 0,
      [component2]: state2.data?.count || 0,
    },
    loading: {
      [component1]: state1.isLoading,
      [component2]: state2.isLoading,
    },
    error: {
      [component1]: state1.isError,
      [component2]: state2.isError,
    },
    cacheAge: {
      [component1]: state1.dataUpdatedAt ? Date.now() - state1.dataUpdatedAt : 'unknown',
      [component2]: state2.dataUpdatedAt ? Date.now() - state2.dataUpdatedAt : 'unknown',
    },
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔀 Comparing query states: ${component1} vs ${component2}`)
    console.table(comparison)

    // Flag inconsistencies
    if (state1.data?.count !== state2.data?.count) {
      console.error(
        `❌ DATA INCONSISTENCY: ${component1} has ${state1.data?.count} items, ${component2} has ${state2.data?.count} items`
      )
    }

    if (state1.isError !== state2.isError) {
      console.error(
        `❌ ERROR STATE MISMATCH: ${component1} error=${state1.isError}, ${component2} error=${state2.isError}`
      )
    }
  }

  return comparison
}

import type { QueryClient } from '@tanstack/react-query'

/**
 * Monitor React Query cache for specific key patterns
 */
export function monitorQueryCache(
  queryClient: QueryClient,
  keyPattern: string[] = ['organizations']
) {
  const cache = queryClient.getQueryCache()
  const queries = cache.getAll()

  const matchingQueries = queries.filter(
    (query: Query) =>
      Array.isArray(query.queryKey) &&
      query.queryKey.some((key: unknown) => typeof key === 'string' && keyPattern.includes(key))
  )

  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Query Cache Analysis for pattern [${keyPattern.join(', ')}]:`)
    console.log(`Total queries in cache: ${queries.length}`)
    console.log(`Matching queries: ${matchingQueries.length}`)

    matchingQueries.forEach((query: Query, index: number) => {
      console.log(`Query ${index + 1}:`, {
        key: query.queryKey,
        state: query.state.status,
        dataCount: Array.isArray(query.state.data) ? query.state.data.length : 'non-array',
        lastUpdated: new Date(query.state.dataUpdatedAt).toLocaleTimeString(),
        isStale: query.isStale(),
        // Note: isInactive() is not a standard Query method, removing it
        // Active/inactive status can be determined by checking observers
        hasObservers: query.getObserversCount() > 0,
      })
    })
  }

  return matchingQueries
}

interface NetworkError {
  message: string
  status?: number
}

/**
 * Log network request details for debugging
 */
export function logNetworkRequest(
  url: string,
  method: string,
  payload?: unknown,
  response?: unknown,
  error?: NetworkError
) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString()

    if (error) {
      console.error(`🌐 [${timestamp}] ${method} ${url} FAILED:`, {
        error: error.message,
        status: error.status,
        payload,
      })
    } else {
      console.log(`🌐 [${timestamp}] ${method} ${url} SUCCESS:`, {
        responseSize: response
          ? Array.isArray(response)
            ? response.length
            : 'non-array'
          : 'unknown',
        payload,
      })
    }
  }
}

/**
 * Performance timing for query operations
 */
export function measureQueryPerformance(operationName: string) {
  const startTime = performance.now()

  return {
    end: () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️  [${operationName}] took ${duration.toFixed(2)}ms`)
      }
      return duration
    },
  }
}
