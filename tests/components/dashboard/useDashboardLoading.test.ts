import { renderHook, act } from '@testing-library/react'
import { useDashboardLoading } from '@/features/dashboard/hooks/useDashboardLoading'
import { describe, it, expect } from 'vitest'

describe('useDashboardLoading', () => {
  it('should initialize with loading false', () => {
    const { result } = renderHook(() => useDashboardLoading())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.loadingMessage).toBeNull()
  })

  it('should set loading state', () => {
    const { result } = renderHook(() => useDashboardLoading())
    
    act(() => {
      result.current.setLoading(true)
    })
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.loadingMessage).toBeNull()
  })

  it('should set loading state with message', () => {
    const { result } = renderHook(() => useDashboardLoading())
    const message = 'Loading dashboard data...'
    
    act(() => {
      result.current.setLoading(true, message)
    })
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.loadingMessage).toBe(message)
  })

  it('should clear loading state', () => {
    const { result } = renderHook(() => useDashboardLoading())
    
    // First set loading
    act(() => {
      result.current.setLoading(true, 'Loading...')
    })
    
    // Then clear it
    act(() => {
      result.current.setLoading(false)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.loadingMessage).toBeNull()
  })

  it('should update loading message while loading', () => {
    const { result } = renderHook(() => useDashboardLoading())
    
    act(() => {
      result.current.setLoading(true, 'Step 1...')
    })
    
    expect(result.current.loadingMessage).toBe('Step 1...')
    
    act(() => {
      result.current.setLoading(true, 'Step 2...')
    })
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.loadingMessage).toBe('Step 2...')
  })
})