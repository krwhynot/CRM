/**
 * Integration Tests for Expand → Add → See Update Flow
 * 
 * Tests the complete user flow including:
 * - Expanding opportunity row
 * - Adding new interaction via quick add
 * - Seeing the interaction appear in timeline
 * - Query invalidation and cache updates
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OpportunitiesTableRefactored as OpportunitiesTable } from '@/features/opportunities/components/OpportunitiesTableRefactored'
// Removed unused: import { supabase } from '@/lib/supabase'
import '../../backend/setup/test-setup'

// Mock the supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: { id: 'test-user' } },
      error: null
    }))
  }
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: vi.fn(() => false),
  useIsIPad: vi.fn(() => false)
}))

const mockOpportunities = [
  {
    id: 'opp-1',
    name: 'Test Opportunity',
    stage: 'qualified',
    estimated_value: 10000,
    probability: 75,
    contact_id: 'contact-1',
    organization_id: 'org-1',
    interaction_count: 2,
    last_activity_date: '2024-01-15T10:00:00Z',
    created_at: '2024-01-10T09:00:00Z'
  }
]

const mockInteractions = [
  {
    id: 'interaction-1',
    type: 'email',
    subject: 'Initial contact',
    description: 'First interaction',
    interaction_date: '2024-01-14T10:00:00Z',
    opportunity_id: 'opp-1',
    contact_id: 'contact-1',
    organization_id: 'org-1',
    created_at: '2024-01-14T10:00:00Z',
    contact: { id: 'contact-1', first_name: 'John', last_name: 'Doe' },
    organization: { id: 'org-1', name: 'Test Corp' },
    opportunity: { id: 'opp-1', name: 'Test Opportunity' }
  },
  {
    id: 'interaction-2',
    type: 'call',
    subject: 'Follow-up call',
    description: 'Discussed requirements',
    interaction_date: '2024-01-15T10:00:00Z',
    opportunity_id: 'opp-1',
    contact_id: 'contact-1',
    organization_id: 'org-1',
    created_at: '2024-01-15T10:00:00Z',
    contact: { id: 'contact-1', first_name: 'John', last_name: 'Doe' },
    organization: { id: 'org-1', name: 'Test Corp' },
    opportunity: { id: 'opp-1', name: 'Test Opportunity' }
  }
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Expand → Add → See Update Flow Integration', () => {
  let mockQueryBuilder: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup query builder mock
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis()
    }

    mockSupabase.from.mockReturnValue(mockQueryBuilder)

    // Setup default responses
    setupMockResponses()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const setupMockResponses = () => {
    // Mock opportunities query
    mockQueryBuilder.select.mockImplementation((columns: string) => {
      if (columns.includes('opportunities')) {
        return {
          ...mockQueryBuilder,
          then: () => Promise.resolve({ data: mockOpportunities, error: null })
        }
      }
      if (columns.includes('interactions')) {
        return {
          ...mockQueryBuilder,
          then: () => Promise.resolve({ data: mockInteractions, error: null })
        }
      }
      return mockQueryBuilder
    })

    // Mock insert for new interaction
    mockQueryBuilder.insert.mockImplementation(() => ({
      select: () => ({
        single: () => Promise.resolve({
          data: {
            id: 'new-interaction',
            type: 'follow_up',
            subject: 'Quick follow-up',
            description: 'Added via quick add',
            interaction_date: '2024-01-16T10:00:00Z',
            opportunity_id: 'opp-1',
            contact_id: 'contact-1',
            organization_id: 'org-1',
            created_at: '2024-01-16T10:00:00Z'
          },
          error: null
        })
      })
    }))
  }

  describe('Complete User Flow', () => {
    it('should allow user to expand row, add interaction, and see it in timeline', async () => {
      const user = userEvent.setup()
      
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      // Step 1: Wait for opportunities to load and expand a row
      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
      })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      // Step 2: Verify the interactions tab is active and timeline loads
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /activity \(2\)/i })).toBeInTheDocument()
      })

      // Should show existing interactions
      expect(screen.getByText('Initial contact')).toBeInTheDocument()
      expect(screen.getByText('Follow-up call')).toBeInTheDocument()

      // Step 3: Open quick add form
      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      expect(screen.getByPlaceholderText(/quick.*summary/i)).toBeInTheDocument()

      // Step 4: Fill and submit the form
      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Quick follow-up')

      const notesInput = screen.getByPlaceholderText(/add details.*optional/i)
      await user.type(notesInput, 'Added via quick add')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      // Step 5: Verify the new interaction appears in the timeline
      await waitFor(() => {
        expect(screen.getByText('Quick follow-up')).toBeInTheDocument()
      })

      // Step 6: Verify the quick add form is hidden after success
      expect(screen.queryByPlaceholderText(/quick.*summary/i)).not.toBeInTheDocument()

      // Step 7: Verify the interaction count updated
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /activity \(3\)/i })).toBeInTheDocument()
      })
    })

    it('should maintain tab state during the flow', async () => {
      const user = userEvent.setup()
      
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
      })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      // Should default to interactions tab
      const interactionsTab = screen.getByRole('button', { name: /activity/i })
      expect(interactionsTab).toHaveClass('bg-primary')

      // Switch to details tab
      const detailsTab = screen.getByRole('button', { name: /details/i })
      await user.click(detailsTab)
      expect(detailsTab).toHaveClass('bg-primary')

      // Switch back to interactions and add interaction
      await user.click(interactionsTab)
      
      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Test interaction')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      // Should still be on interactions tab after adding
      await waitFor(() => {
        expect(interactionsTab).toHaveClass('bg-primary')
      })
    })

    it('should handle multiple opportunities independently', async () => {
      const user = userEvent.setup()
      
      // Add second opportunity
      const multipleOpportunities = [
        ...mockOpportunities,
        {
          ...mockOpportunities[0],
          id: 'opp-2',
          name: 'Second Opportunity'
        }
      ]

      // Update mock to return multiple opportunities
      mockQueryBuilder.select.mockImplementation((columns: string) => {
        if (columns.includes('opportunities')) {
          return {
            ...mockQueryBuilder,
            then: () => Promise.resolve({ data: multipleOpportunities, error: null })
          }
        }
        return mockQueryBuilder
      })

      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
        expect(screen.getByText('Second Opportunity')).toBeInTheDocument()
      })

      // Expand first opportunity
      const expandButton1 = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton1)

      // Expand second opportunity
      const expandButton2 = screen.getByTestId('expand-row-opp-2')
      await user.click(expandButton2)

      // Both should have their own tabs and quick add functionality
      const quickAddButtons = screen.getAllByRole('button', { name: /quick add/i })
      expect(quickAddButtons).toHaveLength(2)

      // Add interaction to first opportunity
      await user.click(quickAddButtons[0])
      
      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'First opp interaction')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      // Should only affect the first opportunity
      await waitFor(() => {
        expect(screen.getByText('First opp interaction')).toBeInTheDocument()
      })

      // Second opportunity should be unaffected
      expect(screen.getAllByRole('button', { name: /quick add/i })).toHaveLength(2)
    })
  })

  describe('Query Management', () => {
    it('should invalidate interaction queries after adding interaction', async () => {
      const user = userEvent.setup()
      
      const queryClient = new QueryClient()
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      render(<OpportunitiesTable />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
      })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Test interaction')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      // Should invalidate interaction-related queries
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            queryKey: expect.arrayContaining(['interactions'])
          })
        )
      })
    })

    it('should optimistically update the cache', async () => {
      const user = userEvent.setup()
      
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
      })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      // Count initial interactions
      expect(screen.getByRole('button', { name: /activity \(2\)/i })).toBeInTheDocument()

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'New interaction')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      // Should show the new interaction immediately
      await waitFor(() => {
        expect(screen.getByText('New interaction')).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery', () => {
    it('should handle interaction creation failure gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock failed interaction creation
      mockQueryBuilder.insert.mockImplementation(() => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          })
        })
      }))

      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
      })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Failed interaction')

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      // Should keep the form open on failure
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/quick.*summary/i)).toBeInTheDocument()
      })

      // Should not add the interaction to the timeline
      expect(screen.queryByText('Failed interaction')).not.toBeInTheDocument()

      // Count should remain unchanged
      expect(screen.getByRole('button', { name: /activity \(2\)/i })).toBeInTheDocument()
    })

    it('should maintain form state during temporary errors', async () => {
      const user = userEvent.setup()
      
      // Mock temporary failure then success
      let callCount = 0
      mockQueryBuilder.insert.mockImplementation(() => {
        callCount++
        return {
          select: () => ({
            single: () => {
              if (callCount === 1) {
                return Promise.resolve({
                  data: null,
                  error: { message: 'Network error' }
                })
              }
              return Promise.resolve({
                data: {
                  id: 'retry-interaction',
                  type: 'follow_up',
                  subject: 'Retry interaction',
                  description: 'This worked on retry',
                  interaction_date: '2024-01-16T10:00:00Z',
                  opportunity_id: 'opp-1'
                },
                error: null
              })
            }
          })
        }
      })

      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
      })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      const subjectInput = screen.getByPlaceholderText(/quick.*summary/i)
      const notesInput = screen.getByPlaceholderText(/add details.*optional/i)
      
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Retry interaction')
      await user.type(notesInput, 'This worked on retry')

      const addButton = screen.getByRole('button', { name: /add/i })
      
      // First attempt fails
      await user.click(addButton)

      // Form should still contain the data
      expect(screen.getByDisplayValue('Retry interaction')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This worked on retry')).toBeInTheDocument()

      // Second attempt succeeds
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Retry interaction')).toBeInTheDocument()
      })

      // Form should be cleared after success
      expect(screen.queryByDisplayValue('Retry interaction')).not.toBeInTheDocument()
    })
  })
})