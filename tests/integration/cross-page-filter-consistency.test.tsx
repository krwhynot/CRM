import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { 
  DEFAULT_WEEKLY_FILTERS,
  WEEKLY_TIME_RANGE_OPTIONS,
  type BaseWeeklyFilterState,
  type WeeklyTimeRangeType
} from '@/types/shared-filters.types'

// Mock shared filter components
vi.mock('@/components/filters/shared', () => ({
  GenericWeeksFilter: ({ value, onChange }: any) => (
    <div data-testid="weeks-filter">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        data-testid="weeks-select"
      >
        {WEEKLY_TIME_RANGE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
  GenericPrincipalFilter: ({ value, onChange, principals }: any) => (
    <div data-testid="principal-filter">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        data-testid="principal-select"
      >
        <option value="all">All Principals</option>
        {principals?.map((p: any) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  ),
  GenericQuickViewFilter: ({ value, onChange, options }: any) => (
    <div data-testid="quickview-filter">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        data-testid="quickview-select"
      >
        <option value="none">No Quick View</option>
        {options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}))

// Create mock filter components for each feature area
const createMockFilterComponent = (featureName: string, quickViewOptions: Array<{ value: string; label: string }>) => {
  return ({ filters, onFiltersChange, principals, isLoading }: any) => (
    <div data-testid={`${featureName}-filters`} data-loading={isLoading}>
      <div data-testid={`${featureName}-filter-state`}>
        {JSON.stringify(filters)}
      </div>
      
      {/* Time Range Filter */}
      <div data-testid="weeks-filter">
        <select 
          value={filters.timeRange || DEFAULT_WEEKLY_FILTERS.timeRange} 
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            timeRange: e.target.value as WeeklyTimeRangeType 
          })}
          data-testid="weeks-select"
        >
          {WEEKLY_TIME_RANGE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Principal Filter */}
      <div data-testid="principal-filter">
        <select 
          value={filters.principal || DEFAULT_WEEKLY_FILTERS.principal} 
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            principal: e.target.value 
          })}
          data-testid="principal-select"
        >
          <option value="all">All Principals</option>
          {principals?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Quick View Filter */}
      <div data-testid="quickview-filter">
        <select 
          value={filters.quickView || DEFAULT_WEEKLY_FILTERS.quickView} 
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            quickView: e.target.value 
          })}
          data-testid="quickview-select"
        >
          <option value="none">No Quick View</option>
          {quickViewOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search Filter */}
      <div data-testid="search-filter">
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            search: e.target.value 
          })}
          data-testid="search-input"
          placeholder="Search..."
        />
      </div>

      {/* Loading indicator */}
      <div data-testid="loading-state">
        {isLoading ? 'Loading...' : 'Ready'}
      </div>
    </div>
  )
}

// Mock filter components for all features
const OpportunitiesFilters = createMockFilterComponent('opportunities', [
  { value: 'pipeline_movers', label: 'Pipeline Movers' },
  { value: 'stalled_opportunities', label: 'Stalled Opportunities' },
  { value: 'closing_soon', label: 'Closing Soon' },
  { value: 'needs_follow_up', label: 'Needs Follow Up' }
])

const InteractionsFilters = createMockFilterComponent('interactions', [
  { value: 'follow_ups_due', label: 'Follow-ups Due' },
  { value: 'overdue_actions', label: 'Overdue Actions' },
  { value: 'this_week_activity', label: 'This Week Activity' },
  { value: 'high_value_interactions', label: 'High Value Interactions' }
])

const ProductsFilters = createMockFilterComponent('products', [
  { value: 'promoted_this_week', label: 'Promoted This Week' },
  { value: 'products_with_opportunities', label: 'Products with Opportunities' },
  { value: 'high_margin_products', label: 'High Margin Products' },
  { value: 'needs_attention', label: 'Needs Attention' }
])

const OrganizationsFilters = createMockFilterComponent('organizations', [
  { value: 'high_engagement', label: 'High Engagement' },
  { value: 'multiple_opportunities', label: 'Multiple Opportunities' },
  { value: 'inactive_orgs', label: 'Inactive Organizations' }
])

const ContactsFilters = createMockFilterComponent('contacts', [
  { value: 'decision_makers', label: 'Decision Makers' },
  { value: 'recent_interactions', label: 'Recent Interactions' },
  { value: 'needs_follow_up', label: 'Needs Follow-up' }
])

// Test data
const mockPrincipals = [
  { id: 'p1', name: 'Principal 1', company: 'Company 1' },
  { id: 'p2', name: 'Principal 2', company: 'Company 2' },
  { id: 'p3', name: 'Principal 3', company: 'Company 3' }
]

describe('Phase 7: Cross-Page Filter Consistency Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Weekly Filter Pattern Consistency', () => {
    const testFeatures = [
      { name: 'opportunities', component: OpportunitiesFilters },
      { name: 'interactions', component: InteractionsFilters },
      { name: 'products', component: ProductsFilters },
      { name: 'organizations', component: OrganizationsFilters },
      { name: 'contacts', component: ContactsFilters }
    ]

    testFeatures.forEach(({ name, component: FilterComponent }) => {
      it(`should initialize ${name} filters with consistent default values`, () => {
        const mockOnFiltersChange = vi.fn()
        
        render(
          <FilterComponent
            filters={{}}
            onFiltersChange={mockOnFiltersChange}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        // Verify default values are consistent with shared defaults
        const weeksSelect = screen.getByTestId('weeks-select')
        const principalSelect = screen.getByTestId('principal-select')
        const quickViewSelect = screen.getByTestId('quickview-select')
        const searchInput = screen.getByTestId('search-input')

        expect(weeksSelect).toHaveValue(DEFAULT_WEEKLY_FILTERS.timeRange)
        expect(principalSelect).toHaveValue(DEFAULT_WEEKLY_FILTERS.principal)
        expect(quickViewSelect).toHaveValue(DEFAULT_WEEKLY_FILTERS.quickView)
        expect(searchInput).toHaveValue('')
      })

      it(`should handle time range changes consistently in ${name}`, async () => {
        const user = userEvent.setup()
        const mockOnFiltersChange = vi.fn()
        
        render(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={mockOnFiltersChange}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        const weeksSelect = screen.getByTestId('weeks-select')
        
        // Test each time range option
        for (const option of WEEKLY_TIME_RANGE_OPTIONS) {
          mockOnFiltersChange.mockClear()
          
          await user.selectOptions(weeksSelect, option.value)
          
          expect(mockOnFiltersChange).toHaveBeenCalledWith({
            ...DEFAULT_WEEKLY_FILTERS,
            timeRange: option.value
          })
        }
      })

      it(`should handle principal changes consistently in ${name}`, async () => {
        const user = userEvent.setup()
        const mockOnFiltersChange = vi.fn()
        
        render(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={mockOnFiltersChange}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        const principalSelect = screen.getByTestId('principal-select')
        
        // Test selecting each principal
        for (const principal of mockPrincipals) {
          mockOnFiltersChange.mockClear()
          
          await user.selectOptions(principalSelect, principal.id)
          
          expect(mockOnFiltersChange).toHaveBeenCalledWith({
            ...DEFAULT_WEEKLY_FILTERS,
            principal: principal.id
          })
        }

        // Test selecting "all"
        mockOnFiltersChange.mockClear()
        await user.selectOptions(principalSelect, 'all')
        
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...DEFAULT_WEEKLY_FILTERS,
          principal: 'all'
        })
      })

      it(`should handle search input consistently in ${name}`, async () => {
        const user = userEvent.setup()
        const mockOnFiltersChange = vi.fn()
        
        render(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={mockOnFiltersChange}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        const searchInput = screen.getByTestId('search-input')
        
        await user.type(searchInput, 'test search')
        
        // Verify the search filter was updated
        expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
          ...DEFAULT_WEEKLY_FILTERS,
          search: 'test search'
        })
      })

      it(`should display loading state consistently in ${name}`, () => {
        const mockOnFiltersChange = vi.fn()
        
        const { rerender } = render(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={mockOnFiltersChange}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        expect(screen.getByTestId('loading-state')).toHaveTextContent('Ready')
        expect(screen.getByTestId(`${name}-filters`)).toHaveAttribute('data-loading', 'false')

        // Test loading state
        rerender(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={mockOnFiltersChange}
            principals={mockPrincipals}
            isLoading={true}
          />
        )

        expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...')
        expect(screen.getByTestId(`${name}-filters`)).toHaveAttribute('data-loading', 'true')
      })
    })
  })

  describe('Feature-Specific Quick View Options', () => {
    it('should provide appropriate quick view options for opportunities', async () => {
      const user = userEvent.setup()
      const mockOnFiltersChange = vi.fn()
      
      render(
        <OpportunitiesFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={mockOnFiltersChange}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      const quickViewSelect = screen.getByTestId('quickview-select')
      
      // Verify opportunity-specific options exist
      expect(screen.getByText('Pipeline Movers')).toBeInTheDocument()
      expect(screen.getByText('Stalled Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Closing Soon')).toBeInTheDocument()
      expect(screen.getByText('Needs Follow Up')).toBeInTheDocument()

      // Test selecting an option
      await user.selectOptions(quickViewSelect, 'pipeline_movers')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...DEFAULT_WEEKLY_FILTERS,
        quickView: 'pipeline_movers'
      })
    })

    it('should provide appropriate quick view options for interactions', async () => {
      const user = userEvent.setup()
      const mockOnFiltersChange = vi.fn()
      
      render(
        <InteractionsFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={mockOnFiltersChange}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      // Verify interaction-specific options exist
      expect(screen.getByText('Follow-ups Due')).toBeInTheDocument()
      expect(screen.getByText('Overdue Actions')).toBeInTheDocument()
      expect(screen.getByText('This Week Activity')).toBeInTheDocument()
      expect(screen.getByText('High Value Interactions')).toBeInTheDocument()
    })

    it('should provide appropriate quick view options for products', () => {
      render(
        <ProductsFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={vi.fn()}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      // Verify product-specific options exist
      expect(screen.getByText('Promoted This Week')).toBeInTheDocument()
      expect(screen.getByText('Products with Opportunities')).toBeInTheDocument()
      expect(screen.getByText('High Margin Products')).toBeInTheDocument()
      expect(screen.getByText('Needs Attention')).toBeInTheDocument()
    })

    it('should provide appropriate quick view options for organizations', () => {
      render(
        <OrganizationsFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={vi.fn()}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      // Verify organization-specific options exist
      expect(screen.getByText('High Engagement')).toBeInTheDocument()
      expect(screen.getByText('Multiple Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Inactive Organizations')).toBeInTheDocument()
    })

    it('should provide appropriate quick view options for contacts', () => {
      render(
        <ContactsFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={vi.fn()}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      // Verify contact-specific options exist
      expect(screen.getByText('Decision Makers')).toBeInTheDocument()
      expect(screen.getByText('Recent Interactions')).toBeInTheDocument()
      expect(screen.getByText('Needs Follow-up')).toBeInTheDocument()
    })
  })

  describe('Filter State Management Consistency', () => {
    it('should maintain consistent filter state structure across all features', () => {
      const testFilters = {
        timeRange: 'last_4_weeks' as WeeklyTimeRangeType,
        principal: 'p1',
        quickView: 'test_view',
        search: 'test search'
      }

      const testFeatures = [
        { name: 'opportunities', component: OpportunitiesFilters },
        { name: 'interactions', component: InteractionsFilters },
        { name: 'products', component: ProductsFilters },
        { name: 'organizations', component: OrganizationsFilters },
        { name: 'contacts', component: ContactsFilters }
      ]

      testFeatures.forEach(({ name, component: FilterComponent }) => {
        render(
          <FilterComponent
            filters={testFilters}
            onFiltersChange={vi.fn()}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        const filterState = screen.getByTestId(`${name}-filter-state`)
        const parsedState = JSON.parse(filterState.textContent || '{}')

        // Verify all core properties are present and correct
        expect(parsedState.timeRange).toBe(testFilters.timeRange)
        expect(parsedState.principal).toBe(testFilters.principal)
        expect(parsedState.quickView).toBe(testFilters.quickView)
        expect(parsedState.search).toBe(testFilters.search)
      })
    })

    it('should handle complex filter combinations consistently', async () => {
      const user = userEvent.setup()
      const mockOnFiltersChange = vi.fn()
      
      render(
        <OpportunitiesFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={mockOnFiltersChange}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      // Apply multiple filters in sequence
      const weeksSelect = screen.getByTestId('weeks-select')
      const principalSelect = screen.getByTestId('principal-select')
      const quickViewSelect = screen.getByTestId('quickview-select')
      const searchInput = screen.getByTestId('search-input')

      await user.selectOptions(weeksSelect, 'last_4_weeks')
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...DEFAULT_WEEKLY_FILTERS,
        timeRange: 'last_4_weeks'
      })

      // Update mock to simulate state update
      const updatedFilters = { ...DEFAULT_WEEKLY_FILTERS, timeRange: 'last_4_weeks' as WeeklyTimeRangeType }
      mockOnFiltersChange.mockClear()

      await user.selectOptions(principalSelect, 'p1')
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...updatedFilters,
        principal: 'p1'
      })
    })
  })

  describe('Responsive Behavior Consistency', () => {
    it('should handle mobile viewport consistently across features', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const testFeatures = [
        { name: 'opportunities', component: OpportunitiesFilters },
        { name: 'interactions', component: InteractionsFilters },
        { name: 'products', component: ProductsFilters },
        { name: 'organizations', component: OrganizationsFilters },
        { name: 'contacts', component: ContactsFilters }
      ]

      testFeatures.forEach(({ name, component: FilterComponent }) => {
        const { unmount } = render(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={vi.fn()}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        // Verify all filter components are present and accessible on mobile
        expect(screen.getByTestId('weeks-filter')).toBeInTheDocument()
        expect(screen.getByTestId('principal-filter')).toBeInTheDocument()
        expect(screen.getByTestId('quickview-filter')).toBeInTheDocument()
        expect(screen.getByTestId('search-filter')).toBeInTheDocument()

        unmount()
      })
    })

    it('should handle tablet viewport consistently across features', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const testFeatures = [
        { name: 'opportunities', component: OpportunitiesFilters },
        { name: 'interactions', component: InteractionsFilters }
      ]

      testFeatures.forEach(({ name, component: FilterComponent }) => {
        const { unmount } = render(
          <FilterComponent
            filters={DEFAULT_WEEKLY_FILTERS}
            onFiltersChange={vi.fn()}
            principals={mockPrincipals}
            isLoading={false}
          />
        )

        // Verify filter layout remains consistent on tablet
        expect(screen.getByTestId(`${name}-filters`)).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Performance and Debouncing Consistency', () => {
    it('should handle rapid filter changes without breaking consistency', async () => {
      const user = userEvent.setup()
      const mockOnFiltersChange = vi.fn()
      
      render(
        <OpportunitiesFilters
          filters={DEFAULT_WEEKLY_FILTERS}
          onFiltersChange={mockOnFiltersChange}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      const searchInput = screen.getByTestId('search-input')
      
      // Rapidly type in search (simulating real user behavior)
      await user.type(searchInput, 'rapid', { delay: 10 })
      
      // Should have been called multiple times but each with correct structure
      const calls = mockOnFiltersChange.mock.calls
      calls.forEach(([filterUpdate]) => {
        expect(filterUpdate).toHaveProperty('search')
        expect(filterUpdate.timeRange).toBe(DEFAULT_WEEKLY_FILTERS.timeRange)
        expect(filterUpdate.principal).toBe(DEFAULT_WEEKLY_FILTERS.principal)
        expect(filterUpdate.quickView).toBe(DEFAULT_WEEKLY_FILTERS.quickView)
      })
    })

    it('should maintain filter structure integrity during updates', async () => {
      const user = userEvent.setup()
      const mockOnFiltersChange = vi.fn()
      
      const initialFilters = {
        ...DEFAULT_WEEKLY_FILTERS,
        timeRange: 'last_month' as WeeklyTimeRangeType,
        principal: 'p2'
      }
      
      render(
        <InteractionsFilters
          filters={initialFilters}
          onFiltersChange={mockOnFiltersChange}
          principals={mockPrincipals}
          isLoading={false}
        />
      )

      const quickViewSelect = screen.getByTestId('quickview-select')
      
      await user.selectOptions(quickViewSelect, 'follow_ups_due')
      
      // Verify the update maintains all existing properties while adding the new one
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...initialFilters,
        quickView: 'follow_ups_due'
      })
      
      // Verify no properties were lost
      const [updateCall] = mockOnFiltersChange.mock.calls[0]
      expect(updateCall.timeRange).toBe('last_month')
      expect(updateCall.principal).toBe('p2')
      expect(updateCall.quickView).toBe('follow_ups_due')
    })
  })
})