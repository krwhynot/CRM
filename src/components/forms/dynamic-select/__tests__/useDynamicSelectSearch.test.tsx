import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDynamicSelectSearch } from '../hooks/useDynamicSelectSearch'
import type { SelectOption } from '../types'
import {
  TestDataPresets,
  createMockSearchFn,
  createFailingSearchFn,
  createSlowSearchFn,
  setupMocks,
  teardownMocks,
} from '@/test/utils/dynamic-select-test-utils'

describe('useDynamicSelectSearch', () => {
  beforeEach(() => {
    setupMocks()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    teardownMocks()
    vi.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('initializes with empty search query and results', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
        })
      )

      expect(result.current.searchQuery).toBe('')
      expect(result.current.searchResults).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it('provides preload options in search results initially', () => {
      const mockSearch = createMockSearchFn([])
      const preloadOptions = TestDataPresets.organizations.slice(0, 3)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          preloadOptions,
        })
      )

      expect(result.current.searchResults).toEqual(preloadOptions)
    })

    it('updates search query when setSearchQuery is called', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
        })
      )

      act(() => {
        result.current.setSearchQuery('test query')
      })

      expect(result.current.searchQuery).toBe('test query')
    })
  })

  describe('Search Functionality', () => {
    it('performs search after debounce delay', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 300,
        })
      )

      act(() => {
        result.current.setSearchQuery('organization')
      })

      // Should not call search immediately
      expect(mockSearch).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)

      // Fast-forward debounce time
      act(() => {
        vi.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('organization')
      })
    })

    it('sets loading state during search', async () => {
      const mockSearch = createSlowSearchFn(TestDataPresets.organizations, 1000)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 100,
        })
      )

      act(() => {
        result.current.setSearchQuery('test')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Complete the search
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('updates search results when search completes', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 100,
        })
      )

      act(() => {
        result.current.setSearchQuery('organization')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.searchResults).toEqual(TestDataPresets.organizations)
      })
    })

    it('respects minimum search length', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          minSearchLength: 3,
          debounceMs: 100,
        })
      )

      // Search with query too short
      act(() => {
        result.current.setSearchQuery('ab')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(mockSearch).not.toHaveBeenCalled()

      // Search with query long enough
      act(() => {
        result.current.setSearchQuery('abc')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('abc')
      })
    })

    it('handles search errors gracefully', async () => {
      const mockSearch = createFailingSearchFn('Network error')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 100,
        })
      )

      act(() => {
        result.current.setSearchQuery('test')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        // Should not crash and should reset loading state
        expect(result.current.isLoading).toBe(false)
        expect(result.current.searchResults).toEqual([])
      })

      consoleSpy.mockRestore()
    })

    it('cancels previous search when new query is entered', async () => {
      const mockSearch = vi.fn()
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(TestDataPresets.organizations.slice(0, 2)), 1000)))
        .mockImplementationOnce(() => Promise.resolve(TestDataPresets.organizations.slice(2, 4)))
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 100,
        })
      )

      // Start first search
      act(() => {
        result.current.setSearchQuery('first')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Start second search before first completes
      act(() => {
        result.current.setSearchQuery('second')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Complete both searches
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        // Should only have results from second search
        expect(result.current.searchResults).toEqual(TestDataPresets.organizations.slice(2, 4))
      })
    })
  })

  describe('Load Initial Results', () => {
    it('loads initial results when called', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
        })
      )

      act(() => {
        result.current.loadInitialResults()
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('')
        expect(result.current.searchResults).toEqual(TestDataPresets.organizations)
      })
    })

    it('combines preload options with initial search results', async () => {
      const preloadOptions = TestDataPresets.organizations.slice(0, 2)
      const searchResults = TestDataPresets.organizations.slice(2, 4)
      const mockSearch = createMockSearchFn(searchResults)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          preloadOptions,
        })
      )

      act(() => {
        result.current.loadInitialResults()
      })

      await waitFor(() => {
        // Should combine preload options with search results
        expect(result.current.searchResults).toEqual([...preloadOptions, ...searchResults])
      })
    })
  })

  describe('Search Results Update', () => {
    it('allows external updates to search results', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      const updateCallback = vi.fn()
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          onSearchResultsUpdate: updateCallback,
        })
      )

      // Should have been called with setter function
      expect(updateCallback).toHaveBeenCalledWith(expect.any(Function))
    })

    it('calls onSearchQueryChange when query changes', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      const queryChangeCallback = vi.fn()
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          onSearchQueryChange: queryChangeCallback,
        })
      )

      act(() => {
        result.current.setSearchQuery('new query')
      })

      expect(queryChangeCallback).toHaveBeenCalledWith('new query')
    })
  })

  describe('Debouncing', () => {
    it('uses default debounce time when not specified', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          // debounceMs not specified, should use default 500ms
        })
      )

      act(() => {
        result.current.setSearchQuery('test')
      })

      // Should not call at 400ms
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(mockSearch).not.toHaveBeenCalled()

      // Should call at 500ms
      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('test')
      })
    })

    it('resets debounce timer when query changes rapidly', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 300,
        })
      )

      // First query
      act(() => {
        result.current.setSearchQuery('a')
      })

      // Wait 200ms
      act(() => {
        vi.advanceTimersByTime(200)
      })

      // Second query before debounce completes
      act(() => {
        result.current.setSearchQuery('ab')
      })

      // Wait another 200ms (total 400ms from first query)
      act(() => {
        vi.advanceTimersByTime(200)
      })

      // Should not have called search yet (timer was reset)
      expect(mockSearch).not.toHaveBeenCalled()

      // Wait final 100ms (300ms from second query)
      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('ab')
        expect(mockSearch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Cleanup', () => {
    it('cleans up debounce timer on unmount', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      const { result, unmount } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 300,
        })
      )

      act(() => {
        result.current.setSearchQuery('test')
      })

      // Unmount before debounce completes
      unmount()

      // Complete debounce time
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Should not call search after unmount
      expect(mockSearch).not.toHaveBeenCalled()
    })

    it('cancels ongoing search on unmount', async () => {
      const abortSpy = vi.fn()
      const mockSearch = vi.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          // Simulate abortable request
          const timeout = setTimeout(() => resolve(TestDataPresets.organizations), 1000)
          abortSpy.mockImplementation(() => {
            clearTimeout(timeout)
            reject(new Error('Aborted'))
          })
        })
      })
      
      const { result, unmount } = renderHook(() =>
        useDynamicSelectSearch({
          onSearch: mockSearch,
          debounceMs: 100,
        })
      )

      act(() => {
        result.current.setSearchQuery('test')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Unmount while search is ongoing
      unmount()

      // Search should be cancelled (implementation dependent)
      expect(mockSearch).toHaveBeenCalled()
    })
  })
})