/**
 * Unit Tests for OpportunitiesTable Tab Switching Behavior
 * 
 * Tests the tab functionality including:
 * - Tab state management
 * - Tab switching between interactions and details
 * - Quick add button visibility
 * - Mobile responsiveness of tabs
 * - Lazy loading behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OpportunitiesTableRefactored as OpportunitiesTable } from '@/features/opportunities/components/OpportunitiesTableRefactored'
import { useOpportunitiesWithLastActivity } from '@/features/opportunities/hooks/useOpportunities'
import { useOpportunitiesDisplay } from '@/features/opportunities/hooks/useOpportunitiesDisplay'
import '../../backend/setup/test-setup'

// Mock dependencies
vi.mock('@/features/opportunities/hooks/useOpportunities', () => ({
  useOpportunities: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useOpportunitiesWithLastActivity: vi.fn(),
  useDeleteOpportunity: vi.fn(() => ({ mutateAsync: vi.fn() }))
}))

vi.mock('@/features/opportunities/hooks/useOpportunitiesSearch', () => ({
  useOpportunitiesSearch: vi.fn(() => ({
    searchTerm: '',
    setSearchTerm: vi.fn(),
    filteredOpportunities: mockOpportunities
  }))
}))

vi.mock('@/features/opportunities/hooks/useOpportunitiesSelection', () => ({
  useOpportunitiesSelection: vi.fn(() => ({
    selectedItems: new Set(),
    handleSelectAll: vi.fn(),
    handleSelectItem: vi.fn(),
    clearSelection: vi.fn()
  }))
}))

vi.mock('@/features/opportunities/hooks/useOpportunitiesSorting', () => ({
  useOpportunitiesSorting: vi.fn(() => ({
    sortedOpportunities: mockOpportunities
  }))
}))

vi.mock('@/features/opportunities/hooks/useOpportunitiesFormatting', () => ({
  useOpportunitiesFormatting: vi.fn(() => ({
    getStageConfig: vi.fn(),
    formatCurrency: vi.fn(),
    formatActivityType: vi.fn()
  }))
}))

vi.mock('@/features/opportunities/hooks/useOpportunitiesDisplay', () => ({
  useOpportunitiesDisplay: vi.fn()
}))

vi.mock('@/features/interactions/components/InteractionTimelineEmbed', () => ({
  InteractionTimelineEmbed: ({ enabled, onAddNew }: { enabled: boolean; onAddNew: () => void }) => (
    <div data-testid="interaction-timeline" data-enabled={enabled}>
      <button onClick={onAddNew} data-testid="timeline-add-button">Add New</button>
    </div>
  )
}))

vi.mock('@/features/interactions/components/QuickInteractionBar', () => ({
  QuickInteractionBar: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div data-testid="quick-interaction-bar">
      <button onClick={onSuccess} data-testid="quick-add-success">Success</button>
      <button onClick={onCancel} data-testid="quick-add-cancel">Cancel</button>
    </div>
  )
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
    interaction_count: 3,
    last_activity_date: '2024-01-15T10:00:00Z',
    created_at: '2024-01-10T09:00:00Z'
  }
]

const mockToggleRowExpansion = vi.fn()
const mockIsRowExpanded = vi.fn()

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

describe('OpportunitiesTable Tab Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    ;(useOpportunitiesWithLastActivity as any).mockReturnValue({
      data: mockOpportunities,
      isLoading: false
    })
    
    ;(useOpportunitiesDisplay as any).mockReturnValue({
      toggleRowExpansion: mockToggleRowExpansion,
      isRowExpanded: mockIsRowExpanded.mockReturnValue(true)
    })
  })

  describe('Tab Rendering', () => {
    it('should render interaction and details tabs when row is expanded', () => {
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      // Expand a row first
      const expandButton = screen.getByTestId('expand-row-opp-1')
      fireEvent.click(expandButton)

      // Should show tabs
      expect(screen.getByRole('button', { name: /activity/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument()
    })

    it('should show interaction count in activity tab label', () => {
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      fireEvent.click(expandButton)

      expect(screen.getByRole('button', { name: /activity \(3\)/i })).toBeInTheDocument()
    })

    it('should render quick add button only on interactions tab', () => {
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      fireEvent.click(expandButton)

      // Should have quick add button on interactions tab (default)
      expect(screen.getByRole('button', { name: /quick add/i })).toBeInTheDocument()

      // Switch to details tab
      const detailsTab = screen.getByRole('button', { name: /details/i })
      fireEvent.click(detailsTab)

      // Quick add button should not be visible
      expect(screen.queryByRole('button', { name: /quick add/i })).not.toBeInTheDocument()
    })
  })

  describe('Tab State Management', () => {
    it('should default to interactions tab', () => {
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      fireEvent.click(expandButton)

      const interactionsTab = screen.getByRole('button', { name: /activity/i })
      expect(interactionsTab).toHaveClass('bg-primary') // Selected state
    })

    it('should switch to details tab when clicked', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const detailsTab = screen.getByRole('button', { name: /details/i })
      await user.click(detailsTab)

      expect(detailsTab).toHaveClass('bg-primary')
    })

    it('should maintain separate tab state for each opportunity', async () => {
      const user = userEvent.setup()
      
      // Mock multiple opportunities
      const multipleOpportunities = [
        { ...mockOpportunities[0], id: 'opp-1' },
        { ...mockOpportunities[0], id: 'opp-2', name: 'Second Opportunity' }
      ]
      
      ;(useOpportunitiesWithLastActivity as any).mockReturnValue({
        data: multipleOpportunities,
        isLoading: false
      })

      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      // Expand first opportunity and switch to details
      const expandButton1 = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton1)
      
      const detailsTab1 = screen.getByRole('button', { name: /details/i })
      await user.click(detailsTab1)

      // Expand second opportunity (should default to interactions)
      const expandButton2 = screen.getByTestId('expand-row-opp-2')
      await user.click(expandButton2)

      // First opportunity should still be on details, second on interactions
      const allDetailsTabs = screen.getAllByRole('button', { name: /details/i })
      const allInteractionTabs = screen.getAllByRole('button', { name: /activity/i })

      // Each opportunity should maintain its own tab state
      expect(allDetailsTabs).toHaveLength(2)
      expect(allInteractionTabs).toHaveLength(2)
    })
  })

  describe('Quick Add Functionality', () => {
    it('should show quick add form when quick add button is clicked', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      expect(screen.getByTestId('quick-interaction-bar')).toBeInTheDocument()
    })

    it('should hide quick add form when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      expect(screen.getByTestId('quick-interaction-bar')).toBeInTheDocument()

      const cancelButton = screen.getByTestId('quick-add-cancel')
      await user.click(cancelButton)

      expect(screen.queryByTestId('quick-interaction-bar')).not.toBeInTheDocument()
    })

    it('should hide quick add form when success callback is triggered', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      await user.click(quickAddButton)

      expect(screen.getByTestId('quick-interaction-bar')).toBeInTheDocument()

      const successButton = screen.getByTestId('quick-add-success')
      await user.click(successButton)

      expect(screen.queryByTestId('quick-interaction-bar')).not.toBeInTheDocument()
    })

    it('should toggle quick add button appearance when form is open', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const quickAddButton = screen.getByRole('button', { name: /quick add/i })
      expect(quickAddButton).toHaveClass('border-input') // Outline variant

      await user.click(quickAddButton)

      expect(quickAddButton).toHaveClass('bg-primary') // Default variant when active
    })
  })

  describe('Lazy Loading Integration', () => {
    it('should pass enabled=true to InteractionTimelineEmbed when row is expanded', () => {
      mockIsRowExpanded.mockReturnValue(true)
      
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      fireEvent.click(expandButton)

      const timeline = screen.getByTestId('interaction-timeline')
      expect(timeline).toHaveAttribute('data-enabled', 'true')
    })

    it('should pass enabled=false to InteractionTimelineEmbed when row is collapsed', () => {
      mockIsRowExpanded.mockReturnValue(false)
      
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      // Don't expand the row
      const timeline = screen.queryByTestId('interaction-timeline')
      expect(timeline).not.toBeInTheDocument() // Should not render when collapsed
    })

    it('should trigger lazy loading when switching to interactions tab', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      // Switch to details tab first
      const detailsTab = screen.getByRole('button', { name: /details/i })
      await user.click(detailsTab)

      // Switch back to interactions tab
      const interactionsTab = screen.getByRole('button', { name: /activity/i })
      await user.click(interactionsTab)

      // Timeline should be enabled for lazy loading
      const timeline = screen.getByTestId('interaction-timeline')
      expect(timeline).toHaveAttribute('data-enabled', 'true')
    })
  })

  describe('Content Display', () => {
    it('should show InteractionTimelineEmbed on interactions tab', () => {
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      fireEvent.click(expandButton)

      expect(screen.getByTestId('interaction-timeline')).toBeInTheDocument()
    })

    it('should show opportunity details on details tab', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const detailsTab = screen.getByRole('button', { name: /details/i })
      await user.click(detailsTab)

      expect(screen.getByText(/opportunity details/i)).toBeInTheDocument()
      expect(screen.getByText(/financial/i)).toBeInTheDocument()
      expect(screen.getByText(/notes/i)).toBeInTheDocument()
    })

    it('should display opportunity information in details tab', async () => {
      const user = userEvent.setup()
      render(<OpportunitiesTable />, { wrapper: createWrapper() })

      const expandButton = screen.getByTestId('expand-row-opp-1')
      await user.click(expandButton)

      const detailsTab = screen.getByRole('button', { name: /details/i })
      await user.click(detailsTab)

      expect(screen.getByText(/stage: qualified/i)).toBeInTheDocument()
      expect(screen.getByText(/name: test opportunity/i)).toBeInTheDocument()
      expect(screen.getByText(/estimated value: \$10000/i)).toBeInTheDocument()
      expect(screen.getByText(/probability: 75%/i)).toBeInTheDocument()
    })
  })
})