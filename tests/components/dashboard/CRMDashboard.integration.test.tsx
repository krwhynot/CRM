import { render, screen } from '@testing-library/react'
import { CRMDashboard } from '@/features/dashboard/components/CRMDashboard'
import { vi } from 'vitest'
import type { ChartDataPoint } from '@/types/dashboard'

// Mock component prop types
interface MockDashboardFiltersProps {
  filters: Record<string, string>
  onFiltersChange: (filters: Record<string, string>) => void
  isLoading: boolean
}

interface MockDashboardChartsProps {
  opportunityChartData: ChartDataPoint[]
  interactionChartData: ChartDataPoint[]
  isLoading: boolean
}

interface MockOpportunityKanbanProps {
  opportunities: Array<{ id: string; [key: string]: unknown }>
  loading: boolean
}

interface MockActivityFeedProps {
  activities: Array<{ id: string; [key: string]: unknown }>
  loading: boolean
}

// Mock all the dependencies
vi.mock('@/features/dashboard/hooks/useDashboardFilters', () => ({
  useDashboardFilters: () => ({
    filters: { principal: 'all', product: 'all', weeks: 'Last 4 Weeks' },
    debouncedFilters: { principal: 'all', product: 'all', weeks: 'Last 4 Weeks' },
    isLoading: false,
    handleFiltersChange: vi.fn()
  })
}))

vi.mock('@/features/dashboard/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    principals: [
      { id: 'p1', name: 'Principal 1', company: 'Company 1' },
      { id: 'p2', name: 'Principal 2', company: 'Company 2' }
    ],
    products: [
      { id: 'pr1', name: 'Product 1', category: 'Category 1', principalId: 'p1' }
    ],
    filteredOpportunities: [
      {
        id: 'o1',
        principalId: 'p1',
        productId: 'pr1',
        date: new Date(),
        title: 'Test Opportunity',
        value: 1000,
        status: 'open',
        interactions: []
      }
    ],
    opportunityChartData: [
      { week: 'Week 1', count: 5, weekStart: new Date() },
      { week: 'Week 2', count: 3, weekStart: new Date() }
    ],
    interactionChartData: [
      { week: 'Week 1', count: 2, weekStart: new Date() },
      { week: 'Week 2', count: 4, weekStart: new Date() }
    ],
    activityItems: [
      {
        id: 'a1',
        type: 'opportunity',
        title: 'Test Activity',
        date: new Date(),
        principalName: 'Principal 1'
      }
    ]
  })
}))

vi.mock('@/features/dashboard/hooks/useDashboardLoading', () => ({
  useDashboardLoading: () => ({
    isInitialLoad: false,
    showEmptyState: false
  })
}))

// Mock child components to focus on integration logic
vi.mock('@/features/dashboard/components/DashboardFilters', () => ({
  DashboardFilters: ({ filters, onFiltersChange, isLoading }: MockDashboardFiltersProps) => (
    <div data-testid="dashboard-filters">
      <div data-testid="filters-state">{JSON.stringify(filters)}</div>
      <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
      <button onClick={() => onFiltersChange({ principal: 'p1', product: 'all', weeks: 'Last 4 Weeks' })}>
        Change Filters
      </button>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/DashboardCharts', () => ({
  DashboardCharts: ({ opportunityChartData, interactionChartData, isLoading }: MockDashboardChartsProps) => (
    <div data-testid="dashboard-charts">
      <div data-testid="opportunity-data-count">{opportunityChartData.length}</div>
      <div data-testid="interaction-data-count">{interactionChartData.length}</div>
      <div data-testid="charts-loading">{isLoading ? 'loading' : 'not-loading'}</div>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/OpportunityKanban', () => ({
  OpportunityKanban: ({ opportunities, loading }: MockOpportunityKanbanProps) => (
    <div data-testid="opportunity-kanban">
      <div data-testid="opportunities-count">{opportunities.length}</div>
      <div data-testid="kanban-loading">{loading ? 'loading' : 'not-loading'}</div>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/SimpleActivityFeed', () => ({
  SimpleActivityFeed: ({ activities, loading }: MockActivityFeedProps) => (
    <div data-testid="activity-feed">
      <div data-testid="activities-count">{activities.length}</div>
      <div data-testid="feed-loading">{loading ? 'loading' : 'not-loading'}</div>
    </div>
  )
}))

describe('CRMDashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all dashboard sections', () => {
    render(<CRMDashboard />)
    
    expect(screen.getByTestId('dashboard-filters')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument()
    expect(screen.getByTestId('opportunity-kanban')).toBeInTheDocument()
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
  })

  it('should pass correct data to child components', () => {
    render(<CRMDashboard />)
    
    // Verify filters receive correct props
    expect(screen.getByTestId('filters-state')).toHaveTextContent('{"principal":"all","product":"all","weeks":"Last 4 Weeks"}')
    expect(screen.getByTestId('loading-state')).toHaveTextContent('not-loading')
    
    // Verify charts receive correct data
    expect(screen.getByTestId('opportunity-data-count')).toHaveTextContent('2')
    expect(screen.getByTestId('interaction-data-count')).toHaveTextContent('2')
    expect(screen.getByTestId('charts-loading')).toHaveTextContent('not-loading')
    
    // Verify kanban receives opportunities
    expect(screen.getByTestId('opportunities-count')).toHaveTextContent('1')
    expect(screen.getByTestId('kanban-loading')).toHaveTextContent('not-loading')
    
    // Verify activity feed receives activities
    expect(screen.getByTestId('activities-count')).toHaveTextContent('1')
    expect(screen.getByTestId('feed-loading')).toHaveTextContent('not-loading')
  })

  it('should handle loading states correctly', () => {
    // Mock loading state
    const mockUseDashboardFilters = require('@/features/dashboard/hooks/useDashboardFilters').useDashboardFilters as ReturnType<typeof vi.fn>
    mockUseDashboardFilters.mockReturnValue({
      filters: { principal: 'all', product: 'all', weeks: 'Last 4 Weeks' },
      debouncedFilters: { principal: 'all', product: 'all', weeks: 'Last 4 Weeks' },
      isLoading: true,
      handleFiltersChange: vi.fn()
    })
    
    render(<CRMDashboard />)
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    expect(screen.getByTestId('charts-loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('kanban-loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('feed-loading')).toHaveTextContent('loading')
  })
})

describe('CRMDashboard Initial Load', () => {
  it('should show skeleton during initial load', () => {
    const mockUseDashboardLoading = require('@/features/dashboard/hooks/useDashboardLoading').useDashboardLoading as ReturnType<typeof vi.fn>
    mockUseDashboardLoading.mockReturnValue({
      isInitialLoad: true,
      showEmptyState: false
    })
    
    render(<CRMDashboard />)
    
    // Should show skeleton instead of dashboard content
    expect(screen.queryByTestId('dashboard-filters')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-charts')).not.toBeInTheDocument()
  })
})

describe('CRMDashboard Empty State', () => {
  it('should show empty state when appropriate', () => {
    const mockUseDashboardLoading = require('@/features/dashboard/hooks/useDashboardLoading').useDashboardLoading as ReturnType<typeof vi.fn>
    mockUseDashboardLoading.mockReturnValue({
      isInitialLoad: false,
      showEmptyState: true
    })
    
    render(<CRMDashboard />)
    
    // Should show filters but not other components
    expect(screen.getByTestId('dashboard-filters')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-charts')).not.toBeInTheDocument()
    expect(screen.queryByTestId('opportunity-kanban')).not.toBeInTheDocument()
    expect(screen.queryByTestId('activity-feed')).not.toBeInTheDocument()
  })
})
