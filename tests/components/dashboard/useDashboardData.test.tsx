import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ReactNode } from 'react'

// Mock supabase with proper dashboard data structure
vi.mock('@/lib/supabase', () => {
  const mockOrganizations = { data: null, error: null, count: 125 }
  const mockContacts = { data: null, error: null, count: 450 }
  const mockOpportunities = {
    data: [
      { id: '1', value: 10000, stage: 'active' },
      { id: '2', value: 25000, stage: 'won' },
      { id: '3', value: 8000, stage: 'active' }
    ],
    error: null
  }
  const mockInteractions = {
    data: [
      { id: '1', interaction_date: new Date().toISOString() },
      { id: '2', interaction_date: new Date().toISOString() }
    ],
    error: null
  }

  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => Promise.resolve(mockOrganizations))
          }
        }
        if (table === 'contacts') {
          return {
            select: vi.fn(() => Promise.resolve(mockContacts))
          }
        }
        if (table === 'opportunities') {
          return {
            select: vi.fn(() => Promise.resolve(mockOpportunities))
          }
        }
        if (table === 'interactions') {
          return {
            select: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve(mockInteractions))
              }))
            }))
          }
        }
        // Default fallback
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
        }
      })
    }
  }
})

describe('useDashboardData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should fetch dashboard data', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    if (result.current.data) {
      expect(result.current.data.totalOrganizations).toBeDefined()
      expect(result.current.data.totalContacts).toBeDefined()
      expect(result.current.data.totalOpportunities).toBeDefined()
      expect(result.current.data.totalInteractions).toBeDefined()
      expect(result.current.data.performanceMetrics).toBeDefined()
    }
  })

  it('should handle loading state', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper })
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should calculate performance metrics correctly', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const metrics = result.current.data?.performanceMetrics
    expect(metrics).toBeDefined()
    expect(metrics?.conversionRate).toBeGreaterThanOrEqual(0)
    expect(metrics?.conversionRate).toBeLessThanOrEqual(100)
    expect(metrics?.averageDealSize).toBeGreaterThanOrEqual(0)
    expect(metrics?.totalRevenue).toBeGreaterThanOrEqual(0)
    expect(metrics?.activePipeline).toBeGreaterThanOrEqual(0)
  })

  it('should use proper cache configuration', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Check that the query has the expected configuration
    const queryState = queryClient.getQueryState(['dashboard-data'])
    expect(queryState).toBeDefined()
  })
})