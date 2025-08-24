import { renderHook } from '@testing-library/react'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { FilterState } from '@/types/dashboard'
import { vi } from 'vitest'

// Mock the sample data generation
const mockSampleData = {
  opportunities: [
    {
      id: 'opp-1',
      principalId: 'principal-1',
      productId: 'product-1',
      date: new Date('2024-01-01'),
      title: 'Test Opportunity 1',
      value: 1000,
      status: 'open' as const,
      interactions: [
        {
          id: 'int-1',
          type: 'call',
          date: new Date('2024-01-02'),
          description: 'Follow up call',
          opportunityId: 'opp-1'
        }
      ]
    },
    {
      id: 'opp-2',
      principalId: 'principal-2',
      productId: 'product-2',
      date: new Date('2024-01-03'),
      title: 'Test Opportunity 2',
      value: 2000,
      status: 'pending' as const,
      interactions: []
    }
  ],
  principals: [
    { id: 'principal-1', name: 'Principal 1', company: 'Company 1' },
    { id: 'principal-2', name: 'Principal 2', company: 'Company 2' }
  ],
  products: [
    { id: 'product-1', name: 'Product 1', category: 'Category 1', principalId: 'principal-1' },
    { id: 'product-2', name: 'Product 2', category: 'Category 2', principalId: 'principal-2' }
  ]
}

vi.mock('@/utils/sampleData', () => ({
  generateSampleData: () => mockSampleData
}))

vi.mock('@/utils/dateUtils', () => ({
  getWeeksBack: vi.fn(() => 4),
  generateWeeksData: vi.fn(() => [
    { week: 'Week 1', weekStart: new Date('2024-01-01') },
    { week: 'Week 2', weekStart: new Date('2024-01-08') }
  ]),
  isSameWeekMonday: vi.fn((date1, date2) => {
    // Simple mock - consider dates in same week if within 7 days
    const diffTime = Math.abs(date1.getTime() - date2.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  })
}))

describe('useDashboardData', () => {
  const defaultFilters: FilterState = {
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks'
  }

  it('should return all sample data', () => {
    const { result } = renderHook(() => useDashboardData(defaultFilters))
    
    expect(result.current.opportunities).toEqual(mockSampleData.opportunities)
    expect(result.current.principals).toEqual(mockSampleData.principals)
    expect(result.current.products).toEqual(mockSampleData.products)
  })

  it('should filter opportunities by principal', () => {
    const principalFilter: FilterState = {
      principal: 'principal-1',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => useDashboardData(principalFilter))
    
    expect(result.current.filteredOpportunities).toHaveLength(1)
    expect(result.current.filteredOpportunities[0].principalId).toBe('principal-1')
  })

  it('should filter opportunities by product', () => {
    const productFilter: FilterState = {
      principal: 'all',
      product: 'product-2',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => useDashboardData(productFilter))
    
    expect(result.current.filteredOpportunities).toHaveLength(1)
    expect(result.current.filteredOpportunities[0].productId).toBe('product-2')
  })

  it('should filter opportunities by both principal and product', () => {
    const bothFilter: FilterState = {
      principal: 'principal-1',
      product: 'product-1',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => useDashboardData(bothFilter))
    
    expect(result.current.filteredOpportunities).toHaveLength(1)
    expect(result.current.filteredOpportunities[0].principalId).toBe('principal-1')
    expect(result.current.filteredOpportunities[0].productId).toBe('product-1')
  })

  it('should return empty array when no opportunities match filter', () => {
    const noMatchFilter: FilterState = {
      principal: 'non-existent-principal',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    
    const { result } = renderHook(() => useDashboardData(noMatchFilter))
    
    expect(result.current.filteredOpportunities).toHaveLength(0)
  })

  it('should generate chart data', () => {
    const { result } = renderHook(() => useDashboardData(defaultFilters))
    
    expect(result.current.opportunityChartData).toBeDefined()
    expect(result.current.interactionChartData).toBeDefined()
    expect(Array.isArray(result.current.opportunityChartData)).toBe(true)
    expect(Array.isArray(result.current.interactionChartData)).toBe(true)
  })

  it('should generate activity items', () => {
    const { result } = renderHook(() => useDashboardData(defaultFilters))
    
    expect(result.current.activityItems).toBeDefined()
    expect(Array.isArray(result.current.activityItems)).toBe(true)
    
    // Should have opportunities + interactions as activities
    const opportunityActivities = result.current.activityItems.filter(item => item.type === 'opportunity')
    const interactionActivities = result.current.activityItems.filter(item => item.type === 'interaction')
    
    expect(opportunityActivities.length).toBe(2) // 2 opportunities
    expect(interactionActivities.length).toBe(1) // 1 interaction
  })

  it('should update data when filters change', () => {
    const { result, rerender } = renderHook(
      ({ filters }) => useDashboardData(filters),
      { initialProps: { filters: defaultFilters } }
    )
    
    const initialCount = result.current.filteredOpportunities.length
    expect(initialCount).toBe(2)
    
    // Change filters to be more restrictive
    const restrictiveFilters: FilterState = {
      principal: 'principal-1',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    
    rerender({ filters: restrictiveFilters })
    
    const newCount = result.current.filteredOpportunities.length
    expect(newCount).toBe(1)
    expect(newCount).toBeLessThan(initialCount)
  })
})
