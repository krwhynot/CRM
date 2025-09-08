import { renderHook, act } from '@testing-library/react'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import type { FilterState } from '@/types/dashboard'
import { vi } from 'vitest'

// Mock the useDebounce hook
vi.mock('@/lib/performance-optimizations', () => ({
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
    const mockUseDebounce = require('@/lib/performance-optimizations').useDebounce as ReturnType<typeof vi.fn>
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

  // Phase 7: Testing & Integration - Enhanced Weekly Filter Pattern Tests
  describe('Weekly Filter Patterns (Phase 6 Enhancements)', () => {
    it('should handle different weekly filter options correctly', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      const weekOptions = [
        'Last 4 Weeks',
        'Last 8 Weeks', 
        'Last 12 Weeks',
        'This Month',
        'Last Month',
        'This Quarter'
      ]
      
      weekOptions.forEach(weeks => {
        act(() => {
          result.current.handleFiltersChange({
            ...result.current.filters,
            weeks
          })
        })
        
        expect(result.current.filters.weeks).toBe(weeks)
      })
    })
    
    it('should apply quick view presets correctly', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Test action items due preset
      act(() => {
        result.current.applyQuickView('action_items_due')
      })
      
      expect(result.current.filters.focus).toBe('overdue')
      expect(result.current.filters.quickView).toBe('action_items_due')
      expect(result.current.computed.hasActiveQuickView).toBe(true)
      
      // Test pipeline movers preset
      act(() => {
        result.current.applyQuickView('pipeline_movers')
      })
      
      expect(result.current.filters.focus).toBe('high_priority')
      expect(result.current.filters.quickView).toBe('pipeline_movers')
      
      // Test clearing quick view
      act(() => {
        result.current.applyQuickView('none')
      })
      
      expect(result.current.filters.quickView).toBe('none')
      expect(result.current.computed.hasActiveQuickView).toBe(false)
    })
    
    it('should calculate filter summary correctly for different states', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // No active filters
      expect(result.current.computed.filterSummary).toBe('all data')
      
      // Active quick view
      act(() => {
        result.current.applyQuickView('recent_wins')
      })
      
      expect(result.current.computed.filterSummary).toBe('recent_wins view')
      
      // Custom filters without quick view
      act(() => {
        result.current.handleFiltersChange({
          principal: 'p1',
          product: 'all',
          weeks: 'Last 4 Weeks',
          focus: 'my_tasks',
          quickView: 'none'
        })
      })
      
      expect(result.current.computed.filterSummary).toBe('custom view')
    })
    
    it('should handle focus filter changes with computed properties', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Test my_tasks focus
      act(() => {
        result.current.handleFiltersChange({
          ...result.current.filters,
          focus: 'my_tasks'
        })
      })
      
      expect(result.current.computed.isMyTasksView).toBe(true)
      expect(result.current.computed.isTeamView).toBe(false)
      expect(result.current.computed.hasActiveFocus).toBe(true)
      
      // Test team_overview focus
      act(() => {
        result.current.handleFiltersChange({
          ...result.current.filters,
          focus: 'team_overview'
        })
      })
      
      expect(result.current.computed.isMyTasksView).toBe(false)
      expect(result.current.computed.isTeamView).toBe(true)
      expect(result.current.computed.hasActiveFocus).toBe(true)
      
      // Test all_activity focus (default)
      act(() => {
        result.current.handleFiltersChange({
          ...result.current.filters,
          focus: 'all_activity'
        })
      })
      
      expect(result.current.computed.isMyTasksView).toBe(false)
      expect(result.current.computed.isTeamView).toBe(false)
      expect(result.current.computed.hasActiveFocus).toBe(false)
    })
  })
  
  describe('Integration with Phase 6 Enhancements', () => {
    it('should maintain state consistency during complex filter operations', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useDashboardFilters())
      
      // Simulate complex filter workflow
      act(() => {
        // Step 1: Apply principal and product filters
        result.current.handleFiltersChange({
          principal: 'principal-1',
          product: 'product-1',
          weeks: 'Last 8 Weeks',
          focus: 'all_activity',
          quickView: 'none'
        })
      })
      
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      act(() => {
        // Step 2: Apply quick view preset
        result.current.applyQuickView('pipeline_movers')
      })
      
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      // Verify final state maintains all filters
      expect(result.current.filters.principal).toBe('principal-1')
      expect(result.current.filters.product).toBe('product-1')
      expect(result.current.filters.weeks).toBe('Last 8 Weeks')
      expect(result.current.filters.focus).toBe('high_priority')
      expect(result.current.filters.quickView).toBe('pipeline_movers')
      
      expect(result.current.computed.hasActiveFilters).toBe(true)
      expect(result.current.computed.hasActiveFocus).toBe(true)
      expect(result.current.computed.hasActiveQuickView).toBe(true)
      
      vi.useRealTimers()
    })

    it('should handle edge cases in quick view preset application', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Test undefined preset
      act(() => {
        result.current.applyQuickView(undefined)
      })
      
      expect(result.current.filters.quickView).toBe('none')
      
      // Test invalid preset (should not crash)
      act(() => {
        result.current.applyQuickView('invalid_preset' as any)
      })
      
      expect(result.current.filters.quickView).toBe('none')
    })
  })

  describe('Performance and Debouncing Integration', () => {
    it('should work correctly with debounced filters', () => {
      const mockUseDebounce = require('@/lib/performance-optimizations').useDebounce as ReturnType<typeof vi.fn>
      const mockDebouncedValue = { 
        principal: 'debounced', 
        product: 'debounced', 
        weeks: 'debounced',
        focus: 'my_tasks',
        quickView: 'action_items_due'
      }
      mockUseDebounce.mockReturnValue(mockDebouncedValue)
      
      const { result } = renderHook(() => useDashboardFilters())
      
      expect(result.current.debouncedFilters).toBe(mockDebouncedValue)
      expect(mockUseDebounce).toHaveBeenCalledWith(result.current.filters, 300)
      
      // Test computed properties with debounced filters
      expect(result.current.computed.hasActiveQuickView).toBe(true)
      expect(result.current.computed.isMyTasksView).toBe(true)
    })
  })
})

// Phase 7: Integration Testing with Enhanced Dashboard Components
describe('useDashboardFilters Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Cross-Component Filter State Consistency', () => {
    it('should maintain consistent filter state across re-renders', () => {
      const { result, rerender } = renderHook(() => useDashboardFilters())
      
      const initialState = { ...result.current.filters }
      
      // Trigger re-render
      rerender()
      
      expect(result.current.filters).toEqual(initialState)
      expect(result.current.computed.hasActiveFilters).toBe(false)
    })
    
    it('should handle filter state updates that affect multiple computed properties', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Apply filters that affect multiple computed properties
      act(() => {
        result.current.handleFiltersChange({
          principal: 'specific-principal',
          product: 'specific-product',
          weeks: 'Last 12 Weeks',
          focus: 'my_tasks',
          quickView: 'needs_attention'
        })
      })
      
      // Verify all computed properties are correctly updated
      expect(result.current.computed.hasActiveFilters).toBe(true)
      expect(result.current.computed.hasActiveFocus).toBe(true)
      expect(result.current.computed.hasActiveQuickView).toBe(true)
      expect(result.current.computed.isMyTasksView).toBe(true)
      expect(result.current.computed.isTeamView).toBe(false)
      expect(result.current.computed.filterSummary).toBe('needs_attention view')
    })
  })
  
  describe('Performance Impact Testing', () => {
    it('should not cause excessive re-computations on repeated identical updates', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useDashboardFilters())
      
      const initialComputedRef = result.current.computed
      
      // Apply same filter multiple times
      act(() => {
        result.current.handleFiltersChange(result.current.filters)
      })
      
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      // Computed properties should be stable for identical input
      expect(result.current.computed).toBe(initialComputedRef)
      
      vi.useRealTimers()
    })
    
    it('should handle rapid filter changes without state inconsistency', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useDashboardFilters())
      
      const filterSequence = [
        { focus: 'my_tasks', quickView: 'none' },
        { focus: 'team_overview', quickView: 'pipeline_movers' },
        { focus: 'high_priority', quickView: 'action_items_due' },
        { focus: 'all_activity', quickView: 'recent_wins' }
      ]
      
      filterSequence.forEach(filters => {
        act(() => {
          result.current.handleFiltersChange({
            ...result.current.filters,
            ...filters
          })
        })
      })
      
      // Only the last update should be active
      expect(result.current.filters.focus).toBe('all_activity')
      expect(result.current.filters.quickView).toBe('recent_wins')
      
      // Fast forward through all loading states
      act(() => {
        vi.advanceTimersByTime(1200) // 4 updates * 300ms each
      })
      
      expect(result.current.isLoading).toBe(false)
      
      vi.useRealTimers()
    })
  })
})
