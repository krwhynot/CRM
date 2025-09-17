import { useMemo } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

/**
 * Generic data state interface that can be returned by any TanStack Query hook
 */
export interface QueryDataState<TData> {
  data: TData[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<any>
  isError: boolean
  isFetching?: boolean
  isRefetching?: boolean
  isStale?: boolean
}

/**
 * Configuration for entity data state management
 */
export interface EntityDataStateConfig {
  /**
   * Whether to enable retry logic on error
   * @default true
   */
  enableRetry?: boolean

  /**
   * Custom error message to display
   */
  errorMessage?: string

  /**
   * Custom loading message to display
   */
  loadingMessage?: string

  /**
   * Whether to treat empty data as an error state
   * @default false
   */
  treatEmptyAsError?: boolean
}

/**
 * Return type for useEntityDataState hook
 */
export interface EntityDataStateReturn<TData> {
  // Data state
  data: TData[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isEmpty: boolean

  // Actions
  onRetry: () => Promise<any>
  refresh: () => Promise<any>

  // DataTable integration props
  dataTableStateProps: {
    loading: boolean
    data: TData[]
  }

  // Enhanced DataTable integration props (for future error state integration)
  enhancedDataTableStateProps: {
    loading: boolean
    data: TData[]
    isError: boolean
    error: Error | null
    onRetry: () => Promise<any>
  }

  // Query meta information
  queryMeta: {
    isFetching: boolean
    isRefetching: boolean
    isStale: boolean
  }
}

/**
 * Generic hook for unified data state management across all entity types.
 *
 * Abstracts common loading/error/data patterns from TanStack Query hooks and
 * returns standardized interface compatible with enhanced DataTable props.
 * Includes retry logic, error handling, and loading state management.
 *
 * @example
 * ```tsx
 * // Basic usage with any query hook
 * const contactsQuery = useContacts(filters)
 * const { data, isLoading, isError, onRetry, dataTableStateProps } = useEntityDataState(contactsQuery)
 *
 * return (
 *   <DataTable
 *     columns={columns}
 *     {...dataTableStateProps}
 *     // Additional DataTable props...
 *   />
 * )
 * ```
 *
 * @example
 * ```tsx
 * // Advanced usage with configuration
 * const organizationsQuery = useOrganizations(filters)
 * const {
 *   data,
 *   isLoading,
 *   isError,
 *   onRetry,
 *   enhancedDataTableStateProps
 * } = useEntityDataState(organizationsQuery, {
 *   enableRetry: true,
 *   errorMessage: 'Failed to load organizations',
 *   treatEmptyAsError: false
 * })
 *
 * return (
 *   <DataTable
 *     columns={columns}
 *     {...enhancedDataTableStateProps}
 *     // Additional DataTable props...
 *   />
 * )
 * ```
 *
 * @template TData - The entity type (Contact, Organization, etc.)
 * @param queryResult - Result from any TanStack Query hook (useContacts, useOrganizations, etc.)
 * @param config - Optional configuration for error handling and retry logic
 */
export function useEntityDataState<TData>(
  queryResult: UseQueryResult<TData[], Error> | QueryDataState<TData>,
  config: EntityDataStateConfig = {}
): EntityDataStateReturn<TData> {
  const { enableRetry = true, errorMessage, loadingMessage, treatEmptyAsError = false } = config

  // Extract query state with fallbacks
  const data = queryResult.data || []
  const isLoading = queryResult.isLoading || false
  const error = queryResult.error || null
  const isError = queryResult.isError || false
  const isFetching = queryResult.isFetching || false
  const isRefetching = queryResult.isRefetching || false
  const isStale = queryResult.isStale || false

  // Determine if data is empty
  const isEmpty = useMemo(() => {
    return !isLoading && data.length === 0
  }, [data.length, isLoading])

  // Enhanced error state that can include empty data treatment
  const enhancedIsError = useMemo(() => {
    if (treatEmptyAsError && isEmpty && !isLoading) {
      return true
    }
    return isError
  }, [treatEmptyAsError, isEmpty, isLoading, isError])

  // Enhanced error object that can include empty data error
  const enhancedError = useMemo(() => {
    if (treatEmptyAsError && isEmpty && !isLoading && !error) {
      return new Error(errorMessage || 'No data available')
    }
    return error
  }, [treatEmptyAsError, isEmpty, isLoading, error, errorMessage])

  // Retry function with optional error handling
  const onRetry = useMemo(() => {
    if (!enableRetry) {
      return async () => {
        throw new Error('Retry is disabled')
      }
    }

    return async () => {
      try {
        return await queryResult.refetch()
      } catch (retryError) {
        // Log retry failure but don't throw to prevent UI crashes
        console.error('Retry failed:', retryError)
        throw retryError
      }
    }
  }, [enableRetry, queryResult.refetch])

  // Refresh function (alias for refetch for clarity)
  const refresh = useMemo(() => {
    return queryResult.refetch
  }, [queryResult.refetch])

  // Basic DataTable integration props (current compatibility)
  const dataTableStateProps = useMemo(
    () => ({
      loading: isLoading,
      data: data,
    }),
    [isLoading, data]
  )

  // Enhanced DataTable integration props (for future error state integration)
  const enhancedDataTableStateProps = useMemo(
    () => ({
      loading: isLoading,
      data: data,
      isError: enhancedIsError,
      error: enhancedError,
      onRetry: onRetry,
    }),
    [isLoading, data, enhancedIsError, enhancedError, onRetry]
  )

  // Query meta information for advanced usage
  const queryMeta = useMemo(
    () => ({
      isFetching,
      isRefetching,
      isStale,
    }),
    [isFetching, isRefetching, isStale]
  )

  return {
    // Data state
    data,
    isLoading,
    isError: enhancedIsError,
    error: enhancedError,
    isEmpty,

    // Actions
    onRetry,
    refresh,

    // DataTable integration
    dataTableStateProps,
    enhancedDataTableStateProps,

    // Query meta
    queryMeta,
  }
}

/**
 * Type helper to ensure query result compatibility
 * Can be used to type-check that a query hook returns compatible data
 */
export type CompatibleQueryResult<TData> = UseQueryResult<TData[], Error> | QueryDataState<TData>

/**
 * Utility function to check if a query result is compatible with useEntityDataState
 */
export function isCompatibleQueryResult<TData>(
  queryResult: any
): queryResult is CompatibleQueryResult<TData> {
  return (
    queryResult &&
    typeof queryResult === 'object' &&
    'data' in queryResult &&
    'isLoading' in queryResult &&
    'error' in queryResult &&
    'refetch' in queryResult &&
    typeof queryResult.refetch === 'function'
  )
}
