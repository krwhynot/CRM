/**
 * Integration Tests for Error Scenarios
 * 
 * Tests error handling in interaction components:
 * - Network failures during data loading
 * - Database errors during interaction creation
 * - Authentication failures
 * - Validation errors
 * - Timeout scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InteractionTimelineEmbed } from '@/features/interactions/components/InteractionTimelineEmbed'
import { QuickInteractionBar } from '@/features/interactions/components/QuickInteractionBar'
import { toast } from 'sonner'
import '../../backend/setup/test-setup'

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: vi.fn(() => false),
  useIsIPad: vi.fn(() => false)
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        retry: 0, // Disable retry for faster tests
        staleTime: 0,
        gcTime: 0
      },
      mutations: { 
        retry: 0
      }
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Interaction Error Scenarios', () => {
  let mockQueryBuilder: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    }

    mockSupabase.from.mockReturnValue(mockQueryBuilder)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Network and Database Errors', () => {
    it('should display error state when interactions fail to load', async () => {
      // Mock network error
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: null,
          error: { 
            message: 'Network error',
            code: 'PGRST301'
          }
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      })

      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // AlertCircle icon
    })

    it('should display different error messages for different error types', async () => {
      // Mock database connection error
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: null,
          error: { 
            message: 'Connection refused',
            code: 'PGRST000'
          }
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      })

      // Should show generic error message for user
      expect(screen.queryByText('Connection refused')).not.toBeInTheDocument()
    })

    it('should handle timeout errors gracefully', async () => {
      // Mock timeout
      mockQueryBuilder.order.mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100)
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should recover from temporary network issues', async () => {
      let attemptCount = 0
      
      mockQueryBuilder.order.mockImplementation(() => {
        attemptCount++
        if (attemptCount === 1) {
          return Promise.resolve({
            data: null,
            error: { message: 'Network error' }
          })
        }
        return Promise.resolve({
          data: [
            {
              id: '1',
              type: 'call',
              subject: 'Test call',
              interaction_date: '2024-01-15T10:00:00Z',
              opportunity_id: 'opp-1'
            }
          ],
          error: null
        })
      })

      const { rerender } = render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      // First render shows error
      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      })

      // Force refetch by re-enabling
      rerender(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={false}
        />
      )
      
      rerender(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />
      )

      // Should recover and show data
      await waitFor(() => {
        expect(screen.getByText('Test call')).toBeInTheDocument()
      })
    })
  })

  describe('Authentication Errors', () => {
    it('should handle authentication failure during interaction creation', async () => {
      // Mock auth failure
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const onSuccess = vi.fn()
      const onCancel = vi.fn()

      render(
        <QuickInteractionBar
          opportunityId="opp-1"
          onSuccess={onSuccess}
          onCancel={onCancel}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })

      expect(onSuccess).not.toHaveBeenCalled()
    })

    it('should handle token expiration during form submission', async () => {
      // Mock expired token
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' }
      })

      render(
        <QuickInteractionBar
          opportunityId="opp-1"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Test subject')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })

      // Form should remain populated for user to retry
      expect(screen.getByDisplayValue('Test subject')).toBeInTheDocument()
    })
  })

  describe('Validation Errors', () => {
    it('should handle server-side validation errors', async () => {
      // Mock successful auth but validation error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })

      mockQueryBuilder.insert.mockImplementation(() => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: {
              message: 'Value too long for type character varying(255)',
              code: '22001',
              details: 'subject field exceeds maximum length'
            }
          })
        })
      }))

      render(
        <QuickInteractionBar
          opportunityId="opp-1"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'A'.repeat(300)) // Exceed character limit

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })
    })

    it('should handle foreign key constraint violations', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })

      mockQueryBuilder.insert.mockImplementation(() => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: {
              message: 'Foreign key violation',
              code: '23503',
              details: 'Key (opportunity_id)=(invalid-id) is not present in table opportunities'
            }
          })
        })
      }))

      render(
        <QuickInteractionBar
          opportunityId="invalid-id"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })
    })
  })

  describe('Permission and RLS Errors', () => {
    it('should handle RLS policy violations', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'unauthorized-user' } },
        error: null
      })

      mockQueryBuilder.insert.mockImplementation(() => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: {
              message: 'new row violates row-level security policy',
              code: '42501'
            }
          })
        })
      }))

      render(
        <QuickInteractionBar
          opportunityId="opp-1"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })
    })

    it('should handle read permission errors for interactions', async () => {
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: null,
          error: { 
            message: 'permission denied for table interactions',
            code: '42501'
          }
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      })
    })
  })

  describe('Data Consistency Errors', () => {
    it('should handle malformed data responses', async () => {
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: [
            {
              // Missing required fields
              id: '1',
              type: null,
              subject: undefined
              // opportunity_id missing
            }
          ],
          error: null
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.queryByText('Failed to load interactions')).not.toBeInTheDocument()
      })

      // Should handle gracefully with fallback values
      expect(screen.getByTestId('interaction-timeline')).toBeInTheDocument()
    })

    it('should handle partial relationship data', async () => {
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: [
            {
              id: '1',
              type: 'call',
              subject: 'Test call',
              interaction_date: '2024-01-15T10:00:00Z',
              opportunity_id: 'opp-1',
              contact: null, // Missing contact data
              organization: { id: 'org-1', name: null }, // Incomplete org data
              opportunity: undefined // Missing opportunity data
            }
          ],
          error: null
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Test call')).toBeInTheDocument()
      })

      // Should render without crashing despite missing relationship data
      expect(screen.queryByText('Failed to load interactions')).not.toBeInTheDocument()
    })
  })

  describe('Rate Limiting and Quotas', () => {
    it('should handle rate limiting errors', async () => {
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: null,
          error: { 
            message: 'Too many requests',
            code: '429'
          }
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      })
    })

    it('should handle database connection limit errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })

      mockQueryBuilder.insert.mockImplementation(() => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: {
              message: 'remaining connection slots are reserved',
              code: '53300'
            }
          })
        })
      }))

      render(
        <QuickInteractionBar
          opportunityId="opp-1"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should allow retry after error', async () => {
      let attemptCount = 0
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })

      mockQueryBuilder.insert.mockImplementation(() => ({
        select: () => ({
          single: () => {
            attemptCount++
            if (attemptCount === 1) {
              return Promise.resolve({
                data: null,
                error: { message: 'Temporary error' }
              })
            }
            return Promise.resolve({
              data: {
                id: 'success-interaction',
                type: 'follow_up',
                subject: 'Retry success',
                interaction_date: '2024-01-16T10:00:00Z',
                opportunity_id: 'opp-1'
              },
              error: null
            })
          }
        })
      }))

      const onSuccess = vi.fn()

      render(
        <QuickInteractionBar
          opportunityId="opp-1"
          onSuccess={onSuccess}
          onCancel={vi.fn()}
        />,
        { wrapper: createWrapper() }
      )

      const user = userEvent.setup()
      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Retry success')

      const addButton = screen.getByRole('button', { name: /add/i })
      
      // First attempt fails
      await user.click(addButton)
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })

      // Form should still be populated
      expect(screen.getByDisplayValue('Retry success')).toBeInTheDocument()

      // Second attempt succeeds
      await user.click(addButton)
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should maintain UI stability during errors', async () => {
      mockQueryBuilder.order.mockImplementation(() => 
        Promise.resolve({
          data: null,
          error: { message: 'Database error' }
        })
      )

      render(
        <InteractionTimelineEmbed 
          opportunityId="opp-1" 
          enabled={true}
        />, 
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load interactions')).toBeInTheDocument()
      })

      // UI should remain stable and not crash
      expect(screen.getByTestId('interaction-timeline')).toBeInTheDocument()
      
      // Error state should be clearly visible
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // Error icon
    })
  })
})