import { renderHook, act } from '@testing-library/react'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useDashboardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useDashboardFilters())
    
    expect(result.current.filters).toEqual({
      timeRange: 'month',
      principal: null,
      segment: null,
      priority: null
    })
  })

  it('should update filters', () => {
    const { result } = renderHook(() => useDashboardFilters())
    
    act(() => {
      result.current.setFilters({
        timeRange: 'quarter',
        principal: 'principal-1'
      })
    })
    
    expect(result.current.filters.timeRange).toBe('quarter')
    expect(result.current.filters.principal).toBe('principal-1')
    expect(result.current.filters.segment).toBeNull()
    expect(result.current.filters.priority).toBeNull()
  })

  it('should reset filters to defaults', () => {
    const { result } = renderHook(() => useDashboardFilters())
    
    // First set some filters
    act(() => {
      result.current.setFilters({
        timeRange: 'year',
        principal: 'test-principal',
        segment: 'test-segment',
        priority: 'A'
      })
    })
    
    // Then reset
    act(() => {
      result.current.resetFilters()
    })
    
    expect(result.current.filters).toEqual({
      timeRange: 'month',
      principal: null,
      segment: null,
      priority: null
    })
  })

  it('should merge partial filter updates', () => {
    const { result } = renderHook(() => useDashboardFilters())
    
    act(() => {
      result.current.setFilters({ principal: 'principal-1' })
    })
    
    expect(result.current.filters.principal).toBe('principal-1')
    expect(result.current.filters.timeRange).toBe('month') // unchanged
    
    act(() => {
      result.current.setFilters({ segment: 'segment-1' })
    })
    
    expect(result.current.filters.principal).toBe('principal-1') // unchanged
    expect(result.current.filters.segment).toBe('segment-1')
    expect(result.current.filters.timeRange).toBe('month') // unchanged
  })

  it('should handle all time range options', () => {
    const { result } = renderHook(() => useDashboardFilters())
    const timeRanges = ['today', 'week', 'month', 'quarter', 'year', 'all'] as const
    
    timeRanges.forEach(timeRange => {
      act(() => {
        result.current.setFilters({ timeRange })
      })
      
      expect(result.current.filters.timeRange).toBe(timeRange)
    })
  })
})