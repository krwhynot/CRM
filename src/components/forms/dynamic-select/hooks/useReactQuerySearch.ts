import { useState, useCallback, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/useDebounce"
import type { SelectOption } from "../types"

export interface UseReactQuerySearchProps {
  onSearch: (query: string) => Promise<SelectOption[]>
  debounceMs?: number
  minSearchLength?: number
  preloadOptions?: SelectOption[]
  onSearchResultsUpdate?: (setter: (updateFn: (results: SelectOption[]) => SelectOption[]) => void) => void
  onSearchQueryChange?: (query: string) => void
  // React Query specific options
  queryKeyPrefix?: string
  staleTime?: number
  gcTime?: number
  enabled?: boolean
}

export function useReactQuerySearch({
  onSearch,
  debounceMs = 500,
  minSearchLength = 1,
  preloadOptions = [],
  onSearchResultsUpdate,
  onSearchQueryChange,
  queryKeyPrefix = "search",
  staleTime = 30 * 1000, // 30 seconds for search results
  gcTime = 5 * 60 * 1000, // 5 minutes garbage collection
  enabled = true,
}: UseReactQuerySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()
  
  // Refs for stable references and cleanup
  const isMountedRef = useRef(true)
  const onSearchRef = useRef(onSearch)
  const minSearchLengthRef = useRef(minSearchLength)
  const preloadOptionsRef = useRef(preloadOptions)
  
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)
  
  // Update refs when props change
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])
  
  useEffect(() => {
    minSearchLengthRef.current = minSearchLength
  }, [minSearchLength])
  
  useEffect(() => {
    preloadOptionsRef.current = preloadOptions
  }, [preloadOptions])

  // Create dynamic query key based on search query
  const createQueryKey = useCallback((query: string) => {
    return [queryKeyPrefix, "search", query.trim()]
  }, [queryKeyPrefix])

  // React Query for search results
  const {
    data: queryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: createQueryKey(debouncedSearchQuery || ""),
    queryFn: async ({ signal }) => {
      const query = debouncedSearchQuery || ""
      
      // Return preload options for empty or short queries
      if (query.length < minSearchLengthRef.current) {
        return preloadOptionsRef.current
      }

      try {
        // AbortController integration with React Query's signal
        const results = await onSearchRef.current(query)
        return results
      } catch (error) {
        // Check if error is due to cancellation
        if (signal?.aborted) {
          throw new Error("Search cancelled")
        }
        throw error
      }
    },
    enabled: enabled && isMountedRef.current,
    staleTime,
    gcTime,
    retry: 1,
    // Enable background refetching for better UX
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect for search queries to avoid unwanted API calls
    refetchOnReconnect: false,
    // Prevent automatic refetching on mount if we have stale data
    refetchOnMount: false,
    // Set initial data to preload options to avoid initial loading state
    initialData: preloadOptionsRef.current,
  })

  // Determine search results based on query state
  const searchResults = (() => {
    const query = debouncedSearchQuery || ""
    
    // For empty or short queries, use preload options
    if (query.length < minSearchLengthRef.current) {
      return preloadOptionsRef.current
    }
    
    // For valid queries, use React Query data
    return queryData || []
  })()

  // Create a stable callback that always works with current state
  const updateSearchResults = useCallback((updateFn: (results: SelectOption[]) => SelectOption[]) => {
    const queryKey = createQueryKey(debouncedSearchQuery || "")
    queryClient.setQueryData(queryKey, (currentResults: SelectOption[] = []) => {
      return updateFn(currentResults)
    })
  }, [queryClient, createQueryKey, debouncedSearchQuery])

  // Expose search results update function to parent components
  useEffect(() => {
    if (onSearchResultsUpdate) {
      onSearchResultsUpdate(updateSearchResults)
    }
  }, [onSearchResultsUpdate, updateSearchResults])

  // Track search query changes and notify parent
  useEffect(() => {
    if (onSearchQueryChange) {
      onSearchQueryChange(searchQuery)
    }
  }, [searchQuery, onSearchQueryChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Load initial results when needed
  const loadInitialResults = useCallback(async () => {
    if (searchQuery === "") {
      if (preloadOptions.length > 0) {
        // Set preload options in cache
        const queryKey = createQueryKey("")
        queryClient.setQueryData(queryKey, preloadOptions)
      } else if (searchResults.length === 0) {
        // Trigger a fresh search for empty query if no results
        await refetch()
      }
    }
  }, [searchQuery, preloadOptions, searchResults.length, refetch, queryClient, createQueryKey])

  // Manual search function for external triggers
  const performSearch = useCallback(async (query: string) => {
    if (!isMountedRef.current) return
    
    // Update search query to trigger React Query
    setSearchQuery(query)
    
    // If we need immediate results, we can manually trigger
    if (query.length >= minSearchLengthRef.current) {
      const queryKey = createQueryKey(query)
      await queryClient.refetchQueries({ queryKey })
    }
  }, [queryClient, createQueryKey])

  // Cache invalidation helper for when entities are created/updated
  const invalidateSearchCache = useCallback((entityType?: string) => {
    if (entityType) {
      // Invalidate specific entity type searches
      queryClient.invalidateQueries({ 
        queryKey: [queryKeyPrefix, entityType] 
      })
    } else {
      // Invalidate all searches with this prefix
      queryClient.invalidateQueries({ 
        queryKey: [queryKeyPrefix] 
      })
    }
  }, [queryClient, queryKeyPrefix])

  // Optimistic update helper for create operations
  const optimisticallyUpdateSearch = useCallback((newOption: SelectOption, query?: string) => {
    const targetQuery = query || debouncedSearchQuery || ""
    const queryKey = createQueryKey(targetQuery)
    
    queryClient.setQueryData(queryKey, (oldData: SelectOption[] = []) => {
      // Add new option at the beginning and remove duplicates
      const filtered = oldData.filter(option => option.value !== newOption.value)
      return [newOption, ...filtered]
    })
  }, [queryClient, createQueryKey, debouncedSearchQuery])

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults: updateSearchResults, // Maintain backward compatibility
    isLoading,
    error,
    performSearch,
    loadInitialResults,
    updateSearchResults,
    // New React Query specific methods
    invalidateSearchCache,
    optimisticallyUpdateSearch,
    refetch,
  }
}