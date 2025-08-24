import { renderHook, act } from '@testing-library/react'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { FilterState } from '@/types/dashboard'
import { vi } from 'vitest'

// Mock the useDebounce hook
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value)
}))

describe('useDashboardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useDashboardFilters())
    
    expect(result.current.filters).toEqual({
      principal: 'all',
      product: 'all',
      weeks: 'Last 4 Weeks'
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('should initialize with custom filters', () => {
    const customFilters: FilterState = {
      principal: 'principal-1',
      product: 'product-1',
      weeks: 'Last 8 Weeks'
    }
    
    const { result } = renderHook(() => useDashboardFilters(customFilters))
    
    expect(result.current.filters).toEqual(customFilters)
  })

  it('should update filters and trigger loading state', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDashboardFilters())
    
    const newFilters: FilterState = {
      principal: 'principal-2',
      product: 'product-2',
      weeks: 'Last 12 Weeks'
    }
    
    act(() => {
      result.current.handleFiltersChange(newFilters)
    })
    
    expect(result.current.filters).toEqual(newFilters)
    expect(result.current.isLoading).toBe(true)
    
    // Fast forward through the loading simulation
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    
    vi.useRealTimers()
  })

  it('should provide debounced filters', () => {
    const mockUseDebounce = require('@/hooks/useDebounce').useDebounce as ReturnType<typeof vi.fn>
    const mockDebouncedValue = { principal: 'debounced', product: 'debounced', weeks: 'debounced' }
    mockUseDebounce.mockReturnValue(mockDebouncedValue)
    
    const { result } = renderHook(() => useDashboardFilters())
    
    expect(result.current.debouncedFilters).toBe(mockDebouncedValue)
    expect(mockUseDebounce).toHaveBeenCalledWith(result.current.filters, 300)
  })

  it('should handle multiple rapid filter changes', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDashboardFilters())
    
    // Trigger multiple filter changes rapidly
    act(() => {
      result.current.handleFiltersChange({ principal: 'p1', product: 'all', weeks: 'Last 4 Weeks' })
    })
    
    act(() => {
      result.current.handleFiltersChange({ principal: 'p2', product: 'all', weeks: 'Last 4 Weeks' })
    })
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.filters.principal).toBe('p2')
    
    // Fast forward and check loading completes
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    
    vi.useRealTimers()
  })
})
