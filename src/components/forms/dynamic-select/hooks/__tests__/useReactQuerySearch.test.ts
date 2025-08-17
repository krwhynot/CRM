/**
 * Test file for React Query search integration
 * Tests the caching behavior and API of the useReactQuerySearch hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useReactQuerySearch } from '../useReactQuerySearch'
import type { SelectOption } from '../types'

// Mock search function
const mockSearch = vi.fn()

// Test data
const mockResults: SelectOption[] = [
  { value: '1', label: 'Organization 1', description: 'Test org 1' },
  { value: '2', label: 'Organization 2', description: 'Test org 2' },
]

describe('useReactQuerySearch', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )

  it('should initialize with empty state', async () => {
    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        queryKeyPrefix: 'test',
      }),
      { wrapper }
    )

    expect(result.current.searchQuery).toBe('')
    expect(result.current.searchResults).toEqual([])
    
    // Wait for initial query to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should use preload options for empty queries', async () => {
    const preloadOptions: SelectOption[] = [
      { value: 'preload', label: 'Preloaded Option' }
    ]

    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        preloadOptions,
        queryKeyPrefix: 'test',
        minSearchLength: 1,
      }),
      { wrapper }
    )

    // For empty query, should return preload options
    expect(result.current.searchResults).toEqual(preloadOptions)
  })

  it('should cache search results with React Query', async () => {
    mockSearch.mockResolvedValue(mockResults)

    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        queryKeyPrefix: 'test',
        debounceMs: 10, // Fast debounce for testing
      }),
      { wrapper }
    )

    // Trigger search
    result.current.setSearchQuery('test')

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.searchResults).toEqual(mockResults)
    expect(mockSearch).toHaveBeenCalledWith('test')

    // Second search with same query should use cache
    result.current.setSearchQuery('test')
    
    await waitFor(() => {
      expect(result.current.searchResults).toEqual(mockResults)
    })

    // Should only have been called once due to caching
    expect(mockSearch).toHaveBeenCalledTimes(1)
  })

  it('should handle search errors gracefully', async () => {
    const searchError = new Error('Search failed')
    mockSearch.mockRejectedValue(searchError)

    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        queryKeyPrefix: 'test',
        debounceMs: 10,
      }),
      { wrapper }
    )

    result.current.setSearchQuery('test')

    await waitFor(() => {
      expect(result.current.error).toEqual(searchError)
    }, { timeout: 1000 })

    expect(result.current.searchResults).toEqual([])
  })

  it('should support optimistic updates', async () => {
    mockSearch.mockResolvedValue(mockResults)

    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        queryKeyPrefix: 'test',
        debounceMs: 10,
      }),
      { wrapper }
    )

    // First search
    result.current.setSearchQuery('test')
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Optimistic update
    const newOption: SelectOption = { value: '3', label: 'New Option' }
    result.current.optimisticallyUpdateSearch(newOption, 'test')

    // Should immediately include the new option
    await waitFor(() => {
      expect(result.current.searchResults).toContainEqual(newOption)
    })
  })

  it('should support cache invalidation', async () => {
    mockSearch.mockResolvedValue(mockResults)

    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        queryKeyPrefix: 'test',
        debounceMs: 10,
      }),
      { wrapper }
    )

    // Initial search
    result.current.setSearchQuery('test')
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockSearch).toHaveBeenCalledTimes(1)

    // Invalidate cache
    result.current.invalidateSearchCache()

    // Next search should refetch
    result.current.setSearchQuery('test2')
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    
    expect(mockSearch).toHaveBeenCalledTimes(2)
  })

  it('should debounce search queries', async () => {
    mockSearch.mockResolvedValue(mockResults)

    const { result } = renderHook(
      () => useReactQuerySearch({
        onSearch: mockSearch,
        queryKeyPrefix: 'test',
        debounceMs: 100,
      }),
      { wrapper }
    )

    // Rapid query changes
    result.current.setSearchQuery('a')
    result.current.setSearchQuery('ab')
    result.current.setSearchQuery('abc')

    // Should not have called search yet
    expect(mockSearch).not.toHaveBeenCalled()

    // Wait for debounce
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('abc')
    }, { timeout: 200 })

    // Should only call once with final query
    expect(mockSearch).toHaveBeenCalledTimes(1)
  })
})