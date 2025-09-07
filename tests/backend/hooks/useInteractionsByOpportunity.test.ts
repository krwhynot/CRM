/**
 * Unit Tests for useInteractionsByOpportunity Hook
 * 
 * Tests the hook functionality including:
 * - Data fetching and caching
 * - Lazy loading behavior
 * - Error handling
 * - Query invalidation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInteractionsByOpportunity } from '@/features/interactions/hooks/useInteractions'
import '../setup/test-setup'

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              then: vi.fn()
            }))
          }))
        }))
      }))
    }))
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockInteractions = [
  {
    id: '1',
    type: 'call',
    subject: 'Follow-up call',
    description: 'Discussed product requirements',
    interaction_date: '2024-01-15T10:00:00Z',
    opportunity_id: 'opp-1',
    contact_id: 'contact-1',
    organization_id: 'org-1',
    created_at: '2024-01-15T10:00:00Z',
    contact: { id: 'contact-1', first_name: 'John', last_name: 'Doe' },
    organization: { id: 'org-1', name: 'Acme Corp' },
    opportunity: { id: 'opp-1', name: 'Q1 Deal' }
  },
  {
    id: '2', 
    type: 'email',
    subject: 'Proposal sent',
    description: 'Sent pricing proposal',
    interaction_date: '2024-01-14T14:30:00Z',
    opportunity_id: 'opp-1',
    contact_id: 'contact-1',
    organization_id: 'org-1',
    created_at: '2024-01-14T14:30:00Z',
    contact: { id: 'contact-1', first_name: 'John', last_name: 'Doe' },
    organization: { id: 'org-1', name: 'Acme Corp' },
    opportunity: { id: 'opp-1', name: 'Q1 Deal' }
  }
]

describe('useInteractionsByOpportunity', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup successful mock response
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: mockInteractions,
                error: null
              }))
            }))
          }))
        }))
      }))
    }

    // Mock the supabase import
    vi.doMock('@/lib/supabase', () => ({
      supabase: mockSupabase
    }))
  })

  it('should fetch interactions for a given opportunity ID', async () => {
    const { result } = renderHook(
      () => useInteractionsByOpportunity('opp-1'),
      { wrapper: createWrapper() }
    )

    // Initial loading state
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify the query was constructed correctly
    expect(mockSupabase.from).toHaveBeenCalledWith('interactions')
  })

  it('should respect the enabled option for lazy loading', async () => {
    const { result } = renderHook(
      () => useInteractionsByOpportunity('opp-1', { enabled: false }),
      { wrapper: createWrapper() }
    )

    // Should not make request when disabled
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    
    // Query should be marked as disabled
    expect(result.current.status).toBe('pending')
  })

  it('should enable query when enabled option is true', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useInteractionsByOpportunity('opp-1', { enabled }),
      { 
        wrapper: createWrapper(),
        initialProps: { enabled: false }
      }
    )

    // Initially disabled
    expect(result.current.status).toBe('pending')

    // Enable the query
    rerender({ enabled: true })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('should not make request when opportunity ID is empty', () => {
    const { result } = renderHook(
      () => useInteractionsByOpportunity(''),
      { wrapper: createWrapper() }
    )

    expect(result.current.status).toBe('pending')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    // Setup error response
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            order: () => Promise.resolve({
              data: null,
              error: { message: 'Database error', code: 'PGRST301' }
            })
          })
        })
      })
    }))

    const { result } = renderHook(
      () => useInteractionsByOpportunity('opp-1'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should use correct stale time for caching', () => {
    const { result } = renderHook(
      () => useInteractionsByOpportunity('opp-1'),
      { wrapper: createWrapper() }
    )

    // The hook should be configured with 2 minute stale time
    // This is tested by verifying the query doesn't refetch immediately
    expect(result.current.isStale).toBe(false)
  })

  it('should construct proper query with all required relations', async () => {
    renderHook(
      () => useInteractionsByOpportunity('opp-1'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('interactions')
    })

    // Verify the select includes all necessary relations
    const selectCall = mockSupabase.from().select
    expect(selectCall).toHaveBeenCalledWith(
      expect.stringContaining('contact:contacts')
    )
  })

  it('should filter by opportunity ID and exclude deleted records', async () => {
    renderHook(
      () => useInteractionsByOpportunity('opp-1'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      const eqCall = mockSupabase.from().select().eq
      expect(eqCall).toHaveBeenCalledWith('opportunity_id', 'opp-1')
      
      const isCall = mockSupabase.from().select().eq().is
      expect(isCall).toHaveBeenCalledWith('deleted_at', null)
    })
  })

  it('should order results by interaction_date descending', async () => {
    renderHook(
      () => useInteractionsByOpportunity('opp-1'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      const orderCall = mockSupabase.from().select().eq().is().order
      expect(orderCall).toHaveBeenCalledWith('interaction_date', { ascending: false })
    })
  })
})