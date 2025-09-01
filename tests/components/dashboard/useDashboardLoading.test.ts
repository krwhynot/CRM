import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDashboardLoading } from '@/features/dashboard/hooks/useDashboardLoading'
import type { FilterState, ActivityItem } from '@/types/dashboard'

describe('useDashboardLoading', () => {
  const mockFilters: FilterState = {
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks'
  }

  const mockActivityItems: ActivityItem[] = [
    {
      id: 'activity-1',
      type: 'opportunity',
      title: 'Test Activity',
      date: new Date(),
      principalName: 'Test Principal'
    }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start with initial loading true', () => {
    const { result } = renderHook(() => 
      useDashboardLoading(mockFilters, mockActivityItems)
    )
    
    expect(result.current.isInitialLoad).toBe(true)
  })

  it('should set initial loading to false after 1.5 seconds', () => {
    const { result } = renderHook(() => 
      useDashboardLoading(mockFilters, mockActivityItems)
    )
    
    expect(result.current.isInitialLoad).toBe(true)
    
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    
    expect(result.current.isInitialLoad).toBe(false)
  })

  it('should show empty state when principal is "all" and no activity items', () => {
    const emptyActivityItems: ActivityItem[] = []
    const allFilters: FilterState = {
      principal: 'all',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => 
      useDashboardLoading(allFilters, emptyActivityItems)
    )
    
    expect(result.current.showEmptyState).toBe(true)
  })

  it('should not show empty state when principal is specific', () => {
    const specificFilters: FilterState = {
      principal: 'principal-1',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => 
      useDashboardLoading(specificFilters, [])
    )
    
    expect(result.current.showEmptyState).toBe(false)
  })

  it('should not show empty state when there are activity items', () => {
    const allFilters: FilterState = {
      principal: 'all',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => 
      useDashboardLoading(allFilters, mockActivityItems)
    )
    
    expect(result.current.showEmptyState).toBe(false)
  })

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount } = renderHook(() => 
      useDashboardLoading(mockFilters, mockActivityItems)
    )
    
    unmount()
    
    expect(clearTimeoutSpy).toHaveBeenCalled()
    
    clearTimeoutSpy.mockRestore()
  })

  it('should update empty state when filters or activity items change', () => {
    const { result, rerender } = renderHook(
      ({ filters, activities }) => useDashboardLoading(filters, activities),
      {
        initialProps: {
          filters: { principal: 'principal-1', product: 'all', weeks: 'Last 4 Weeks' } as FilterState,
          activities: mockActivityItems
        }
      }
    )
    
    expect(result.current.showEmptyState).toBe(false)
    
    // Change to show empty state
    rerender({
      filters: { principal: 'all', product: 'all', weeks: 'Last 4 Weeks' } as FilterState,
      activities: []
    })
    
    expect(result.current.showEmptyState).toBe(true)
  })
})
