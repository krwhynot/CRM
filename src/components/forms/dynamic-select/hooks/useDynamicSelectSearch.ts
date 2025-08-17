import { useState, useCallback, useEffect, useRef } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import type { SelectOption } from "../types"

export interface UseDynamicSelectSearchProps {
  onSearch: (query: string) => Promise<SelectOption[]>
  debounceMs?: number
  minSearchLength?: number
  preloadOptions?: SelectOption[]
  onSearchResultsUpdate?: (setter: (updateFn: (results: SelectOption[]) => SelectOption[]) => void) => void
  onSearchQueryChange?: (query: string) => void
  // React Query options (future enhancement)
  queryKeyPrefix?: string
  enableReactQuery?: boolean
  staleTime?: number
  gcTime?: number
}

export function useDynamicSelectSearch({
  onSearch,
  debounceMs = 500,
  minSearchLength = 1,
  preloadOptions = [],
  onSearchResultsUpdate,
  onSearchQueryChange,
  queryKeyPrefix = "dynamic-select",
  enableReactQuery = false, // MVP: Use simple caching by default
  staleTime = 30 * 1000,
  gcTime = 5 * 60 * 1000,
}: UseDynamicSelectSearchProps) {
  
  // MVP: Simple manual caching implementation
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Simple cache for search results
  const cacheRef = useRef<Map<string, { results: SelectOption[], timestamp: number }>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])
  
  // Call external search query change handler
  useEffect(() => {
    onSearchQueryChange?.(searchQuery)
  }, [searchQuery, onSearchQueryChange])
  
  // Register external update function
  useEffect(() => {
    if (onSearchResultsUpdate) {
      onSearchResultsUpdate((updateFn) => {
        if (isMountedRef.current) {
          setSearchResults(prev => updateFn(prev))
        }
      })
    }
  }, [onSearchResultsUpdate])
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.length >= minSearchLength) {
      performSearch(debouncedSearchQuery)
    } else if (debouncedSearchQuery === "") {
      setSearchResults([])
    }
  }, [debouncedSearchQuery, minSearchLength])
  
  const performSearch = useCallback(async (query: string) => {
    // Check cache first
    const cached = cacheRef.current.get(query)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp < staleTime)) {
      setSearchResults(cached.results)
      return
    }
    
    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    
    try {
      setIsLoading(true)
      const results = await onSearch(query)
      
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        setSearchResults(results)
        // Cache results
        cacheRef.current.set(query, { results, timestamp: now })
      }
    } catch (error) {
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        console.warn('Search failed:', error)
        setSearchResults([])
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [onSearch, staleTime])
  
  const loadInitialResults = useCallback(async () => {
    if (preloadOptions.length > 0) {
      setSearchResults(preloadOptions)
    } else {
      await performSearch("")
    }
  }, [preloadOptions, performSearch])
  
  const updateSearchResults = useCallback((updateFn: (results: SelectOption[]) => SelectOption[]) => {
    if (isMountedRef.current) {
      setSearchResults(updateFn)
    }
  }, [])
  
  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isLoading,
    performSearch,
    loadInitialResults,
    updateSearchResults,
  }
}