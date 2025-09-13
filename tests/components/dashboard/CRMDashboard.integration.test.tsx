// Removed unused: import React from 'react'
import { render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { CRMDashboard } from '@/features/dashboard/components/CRMDashboard'
import type { FilterState } from '@/types/dashboard'
import { mockData } from '../../config/test-constants'

// Type definitions for mock props
interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

interface ChartsGridProps {
  visibleChartIds: string[];
  isLoading: boolean;
}

interface WeeklyKPIHeaderProps {
  filters: FilterState;
}

interface SimpleActivityFeedProps {
  activities: any[];
  loading: boolean;
}

interface OpportunityKanbanProps {
  opportunities: any[];
  loading: boolean;
}

interface EmptyStateProps {
  type: string;
  title: string;
}

// Mock all dashboard hooks
const mockDashboardFilters = {
  filters: {
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks',
    focus: 'all_activity',
    quickView: 'none'
  } as FilterState,
  debouncedFilters: {
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks',
    focus: 'all_activity',
    quickView: 'none'
  } as FilterState,
  isLoading: false,
  handleFiltersChange: vi.fn(),
  applyQuickView: vi.fn(),
  computed: {
    hasActiveFilters: false,
    hasActiveFocus: false,
    hasActiveQuickView: false,
    isMyTasksView: false,
    isTeamView: false,
    filterSummary: 'all data'
  }
}

const mockDashboardData = {
  principals: [
    { id: 'p1', name: 'Principal 1', company: 'Company 1' },
    { id: 'p2', name: 'Principal 2', company: 'Company 2' }
  ],
  products: [
    { id: 'prod1', name: 'Product 1', category: 'Category 1', principalId: 'p1' },
    { id: 'prod2', name: 'Product 2', category: 'Category 2', principalId: 'p2' }
  ],
  filteredOpportunities: [],
  opportunityChartData: [
    { week: '2024-01', count: 5, weekStart: new Date('2024-01-01') }
  ],
  interactionChartData: [
    { week: '2024-01', count: 12, weekStart: new Date('2024-01-01') }
  ],
  activityItems: [
    {
      id: 'act1',
      type: 'opportunity' as const,
      title: 'Test Activity',
      date: new Date(),
      principalName: 'Principal 1'
    }
  ],
  weeklyActivityData: [
    { week: '2024-01', count: 8, weekStart: new Date('2024-01-01') }
  ],
  principalPerformanceData: [
    { name: 'Principal 1', interactions: 10, performance: 'high' as const }
  ],
  teamPerformanceData: [
    { name: 'Team Member 1', interactions: 15, opportunities: 5, movements: 3, rank: 1 }
  ],
  pipelineFlowData: {
    stages: ['Lead', 'Qualified'],
    flows: [{ from: 'Lead', to: 'Qualified', count: 3, value: 15000, percentage: 60 }],
    totalMovements: 5,
    timeRange: 'Last 4 Weeks'
  },
  pipelineValueFunnelData: {
    stages: [
      { name: 'Lead', count: 10, value: 50000, conversionRate: 0.5, dropOffRate: 0.5, color: mockData.sampleColorHex }
    ],
    totalValue: 50000,
    totalOpportunities: 10,
    overallConversion: 0.5
  }
}

const mockDashboardLoading = {
  isInitialLoad: false,
  showEmptyState: false
}

const mockChartVisibility = {
  visibleCharts: {
    'weekly-activity': true,
    'principal-performance': true,
    'team-performance': false,
    'opportunities': true,
    'activities': true,
    'pipeline-flow': false,
    'pipeline-funnel': false
  },
  toggleChartVisibility: vi.fn(),
  showAllCharts: vi.fn(),
  resetToDefaults: vi.fn()
}

// Mock all the hooks
vi.mock('@/features/dashboard/hooks/useDashboardFilters', () => ({
  useDashboardFilters: vi.fn(() => mockDashboardFilters)
}))

vi.mock('@/features/dashboard/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(() => mockDashboardData)
}))

vi.mock('@/features/dashboard/hooks/useDashboardLoading', () => ({
  useDashboardLoading: vi.fn(() => mockDashboardLoading)
}))

vi.mock('@/stores', () => ({
  useChartVisibility: vi.fn(() => mockChartVisibility),
  CHART_METADATA: {
    'weekly-activity': { title: 'Weekly Activity', description: 'Weekly activity trends' },
    'principal-performance': { title: 'Principal Performance', description: 'Principal performance metrics' },
    'team-performance': { title: 'Team Performance', description: 'Team performance metrics' },
    'opportunities': { title: 'Opportunities', description: 'Opportunity trends' },
    'activities': { title: 'Activities', description: 'Activity trends' },
    'pipeline-flow': { title: 'Pipeline Flow', description: 'Pipeline movement flow' },
    'pipeline-funnel': { title: 'Pipeline Funnel', description: 'Pipeline value funnel' }
  }
}))

// Mock child components to focus on orchestration testing
vi.mock('@/features/dashboard/components/DashboardFilters', () => ({
  DashboardFilters: ({ filters, onFiltersChange }: DashboardFiltersProps) => (
    <div data-testid="dashboard-filters">
      <button onClick={() => onFiltersChange({ ...filters, principal: 'p1' })}>
        Change Principal
      </button>
      <span data-testid="filter-state">{JSON.stringify(filters)}</span>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/ChartsGrid', () => ({
  ChartsGrid: ({ visibleChartIds, isLoading }: ChartsGridProps) => (
    <div data-testid="charts-grid">
      <span data-testid="visible-charts">{visibleChartIds.join(',')}</span>
      <span data-testid="charts-loading">{isLoading ? 'loading' : 'loaded'}</span>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/WeeklyKPIHeader', () => ({
  WeeklyKPIHeader: ({ filters }: WeeklyKPIHeaderProps) => (
    <div data-testid="weekly-kpi-header">
      <span data-testid="kpi-filters">{JSON.stringify(filters)}</span>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/SimpleActivityFeed', () => ({
  SimpleActivityFeed: ({ activities, loading }: SimpleActivityFeedProps) => (
    <div data-testid="activity-feed">
      <span data-testid="activity-count">{activities.length}</span>
      <span data-testid="activity-loading">{loading ? 'loading' : 'loaded'}</span>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/OpportunityKanban', () => ({
  OpportunityKanban: ({ opportunities, loading }: OpportunityKanbanProps) => (
    <div data-testid="opportunity-kanban">
      <span data-testid="opp-count">{opportunities.length}</span>
      <span data-testid="opp-loading">{loading ? 'loading' : 'loaded'}</span>
    </div>
  )
}))

vi.mock('@/features/dashboard/components/DashboardSkeleton', () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Loading...</div>
}))

vi.mock('@/features/dashboard/components/EmptyState', () => ({
  EmptyState: ({ type, title }: EmptyStateProps) => (
    <div data-testid="empty-state">
      <span data-testid="empty-type">{type}</span>
      <span data-testid="empty-title">{title}</span>
    </div>
  )
}))

describe('CRMDashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Phase 7: Enhanced Dashboard Orchestration', () => {
    it('should orchestrate all dashboard components with proper data flow', () => {
      render(<CRMDashboard />)
      
      // Verify all major components are rendered
      expect(screen.getByTestId('dashboard-filters')).toBeInTheDocument()
      expect(screen.getByTestId('charts-grid')).toBeInTheDocument()
      expect(screen.getByTestId('weekly-kpi-header')).toBeInTheDocument()
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
      expect(screen.getByTestId('opportunity-kanban')).toBeInTheDocument()
      
      // Verify data is passed correctly
      expect(screen.getByTestId('activity-count')).toHaveTextContent('1')
      expect(screen.getByTestId('opp-count')).toHaveTextContent('0')
    })

    it('should handle filter changes and propagate them to child components', async () => {
      const user = userEvent.setup()
      render(<CRMDashboard />)
      
      // Click filter change button
      await user.click(screen.getByText('Change Principal'))
      
      // Verify the filter change handler was called
      expect(mockDashboardFilters.handleFiltersChange).toHaveBeenCalledWith({
        principal: 'p1',
        product: 'all',
        weeks: 'Last 4 Weeks',
        focus: 'all_activity',
        quickView: 'none'
      })
    })

    it('should manage chart visibility state correctly', () => {
      render(<CRMDashboard />)
      
      // Verify visible charts are passed to ChartsGrid
      const visibleCharts = screen.getByTestId('visible-charts')
      expect(visibleCharts).toHaveTextContent('weekly-activity,principal-performance,opportunities,activities')
    })

    it('should handle chart visibility toggles', async () => {
      const user = userEvent.setup()
      render(<CRMDashboard />)
      
      // Find and click show all charts button
      const showAllButton = screen.getByText('Show All')
      await user.click(showAllButton)
      
      expect(mockChartVisibility.showAllCharts).toHaveBeenCalled()
    })

    it('should handle reset to defaults', async () => {
      const user = userEvent.setup()
      render(<CRMDashboard />)
      
      // Find and click reset button
      const resetButton = screen.getByText('Reset')
      await user.click(resetButton)
      
      expect(mockChartVisibility.resetToDefaults).toHaveBeenCalled()
    })

    it('should pass debounced filters to data-dependent components', () => {
      render(<CRMDashboard />)
      
      // Verify KPI header receives debounced filters
      const kpiFilters = screen.getByTestId('kpi-filters')
      expect(kpiFilters).toHaveTextContent(JSON.stringify(mockDashboardFilters.debouncedFilters))
    })

    it('should display chart visibility controls with correct counts', () => {
      render(<CRMDashboard />)
      
      // Check chart count display
      expect(screen.getByText('Charts (4/7)')).toBeInTheDocument()
    })
  })

  describe('Loading States Integration', () => {
    it('should show skeleton during initial load', () => {
      // Mock initial loading state
      const useDashboardLoading = require('@/features/dashboard/hooks/useDashboardLoading').useDashboardLoading
      useDashboardLoading.mockReturnValue({
        isInitialLoad: true,
        showEmptyState: false
      })
      
      render(<CRMDashboard />)
      
      expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('dashboard-filters')).not.toBeInTheDocument()
    })

    it('should show empty state when no data available', () => {
      // Mock empty state
      const useDashboardLoading = require('@/features/dashboard/hooks/useDashboardLoading').useDashboardLoading
      useDashboardLoading.mockReturnValue({
        isInitialLoad: false,
        showEmptyState: true
      })
      
      render(<CRMDashboard />)
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('empty-type')).toHaveTextContent('dashboard')
      expect(screen.getByTestId('empty-title')).toHaveTextContent('Select a principal to view their activity')
      
      // Filters should still be shown
      expect(screen.getByTestId('dashboard-filters')).toBeInTheDocument()
      
      // Charts and other components should not be shown
      expect(screen.queryByTestId('charts-grid')).not.toBeInTheDocument()
    })

    it('should propagate loading states to child components', () => {
      // Mock loading state
      const useDashboardFilters = require('@/features/dashboard/hooks/useDashboardFilters').useDashboardFilters
      useDashboardFilters.mockReturnValue({
        ...mockDashboardFilters,
        isLoading: true
      })
      
      render(<CRMDashboard />)
      
      // Verify loading states are passed down
      expect(screen.getByTestId('charts-loading')).toHaveTextContent('loading')
      expect(screen.getByTestId('activity-loading')).toHaveTextContent('loading')
      expect(screen.getByTestId('opp-loading')).toHaveTextContent('loading')
    })
  })

  describe('Data Integration and Flow', () => {
    it('should pass correct data to all child components', () => {
      render(<CRMDashboard />)
      
      // Verify data flow to various components
      expect(screen.getByTestId('activity-count')).toHaveTextContent('1')
      expect(screen.getByTestId('opp-count')).toHaveTextContent('0')
      expect(screen.getByTestId('visible-charts')).toHaveTextContent('weekly-activity,principal-performance,opportunities,activities')
    })

    it('should handle data updates correctly', () => {
      const { rerender } = render(<CRMDashboard />)
      
      // Update mock data
      const useDashboardData = require('@/features/dashboard/hooks/useDashboardData').useDashboardData
      useDashboardData.mockReturnValue({
        ...mockDashboardData,
        activityItems: [...mockDashboardData.activityItems, {
          id: 'act2',
          type: 'interaction' as const,
          title: 'New Activity',
          date: new Date(),
          principalName: 'Principal 2'
        }]
      })
      
      rerender(<CRMDashboard />)
      
      // Verify updated data is reflected
      expect(screen.getByTestId('activity-count')).toHaveTextContent('2')
    })
  })

  describe('Chart Visibility Integration', () => {
    it('should handle individual chart toggle correctly', async () => {
      const user = userEvent.setup()
      render(<CRMDashboard />)
      
      // Find chart toggle buttons (they should be rendered by ToggleGroup)
      const weeklyActivityToggle = screen.getByLabelText('Toggle Weekly Activity chart')
      expect(weeklyActivityToggle).toBeInTheDocument()
      
      await user.click(weeklyActivityToggle)
      
      // The ToggleGroup should trigger visibility changes
      expect(mockChartVisibility.toggleChartVisibility).toHaveBeenCalled()
    })

    it('should update visible charts when chart visibility changes', () => {
      // Mock different visibility state
      const useChartVisibility = require('@/stores').useChartVisibility
      useChartVisibility.mockReturnValue({
        ...mockChartVisibility,
        visibleCharts: {
          'weekly-activity': false,
          'principal-performance': false,
          'team-performance': false,
          'opportunities': true,
          'activities': true,
          'pipeline-flow': false,
          'pipeline-funnel': false
        }
      })
      
      render(<CRMDashboard />)
      
      expect(screen.getByTestId('visible-charts')).toHaveTextContent('opportunities,activities')
      expect(screen.getByText('Charts (2/7)')).toBeInTheDocument()
    })
  })

  describe('Filter State Consistency', () => {
    it('should maintain filter consistency across components', () => {
      render(<CRMDashboard />)
      
      // Check that filters are consistent between DashboardFilters and KPI header
      const filterState = screen.getByTestId('filter-state')
      const kpiFilters = screen.getByTestId('kpi-filters')
      
      expect(filterState).toHaveTextContent(JSON.stringify(mockDashboardFilters.filters))
      expect(kpiFilters).toHaveTextContent(JSON.stringify(mockDashboardFilters.debouncedFilters))
    })

    it('should handle complex filter state changes', async () => {
      const user = userEvent.setup()
      
      // Mock enhanced filter state
      const useDashboardFilters = require('@/features/dashboard/hooks/useDashboardFilters').useDashboardFilters
      useDashboardFilters.mockReturnValue({
        ...mockDashboardFilters,
        filters: {
          principal: 'p1',
          product: 'prod1',
          weeks: 'Last 8 Weeks',
          focus: 'my_tasks',
          quickView: 'action_items_due'
        },
        computed: {
          hasActiveFilters: true,
          hasActiveFocus: true,
          hasActiveQuickView: true,
          isMyTasksView: true,
          isTeamView: false,
          filterSummary: 'action_items_due view'
        }
      })
      
      render(<CRMDashboard />)
      
      const filterState = screen.getByTestId('filter-state')
      expect(filterState).toHaveTextContent('"principal":"p1"')
      expect(filterState).toHaveTextContent('"focus":"my_tasks"')
      expect(filterState).toHaveTextContent('"quickView":"action_items_due"')
    })
  })

  describe('Mobile Responsive Behavior', () => {
    it('should show mobile-specific controls', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<CRMDashboard />)
      
      // Mobile-specific buttons should be present
      expect(screen.getAllByText('Show All')).toHaveLength(2) // One for mobile, one for desktop
      expect(screen.getAllByText('Reset')).toHaveLength(2)
    })

    it('should enable mobile carousel for charts', () => {
      render(<CRMDashboard />)
      
      // ChartsGrid should receive enableMobileCarousel prop
      const chartsGrid = screen.getByTestId('charts-grid')
      expect(chartsGrid).toBeInTheDocument()
    })
  })

  describe('Performance Integration', () => {
    it('should use debounced filters for data-heavy components', () => {
      // Mock different regular vs debounced filters to simulate delay
      const useDashboardFilters = require('@/features/dashboard/hooks/useDashboardFilters').useDashboardFilters
      useDashboardFilters.mockReturnValue({
        ...mockDashboardFilters,
        filters: {
          principal: 'latest-change',
          product: 'all',
          weeks: 'Last 4 Weeks',
          focus: 'all_activity',
          quickView: 'none'
        },
        debouncedFilters: {
          principal: 'previous-value',
          product: 'all',
          weeks: 'Last 4 Weeks',
          focus: 'all_activity',
          quickView: 'none'
        }
      })
      
      render(<CRMDashboard />)
      
      // KPI Header should use debounced filters (not immediate)
      const kpiFilters = screen.getByTestId('kpi-filters')
      expect(kpiFilters).toHaveTextContent('"principal":"previous-value"')
      
      // Dashboard filters should show current state
      const filterState = screen.getByTestId('filter-state')
      expect(filterState).toHaveTextContent('"principal":"latest-change"')
    })
  })
})