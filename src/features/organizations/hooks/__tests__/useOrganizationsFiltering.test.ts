import { renderHook, act } from '@testing-library/react'
import { useOrganizationsFiltering } from '../useOrganizationsFiltering'
import type { Organization } from '@/types/entities'

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'ACME Restaurant Corp',
    type: 'customer' as const,
    priority: 'A+',
    segment: 'Restaurant',
    phone: '(555) 123-4567',
    primary_manager_name: 'John Smith',
    city: 'New York',
    state_province: 'NY',
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: '2',
    name: 'Global Food Distributors',
    type: 'distributor' as const,
    priority: 'A',
    segment: 'Distribution',
    phone: '(555) 234-5678',
    primary_manager_name: 'Sarah Wilson',
    city: 'Chicago',
    state_province: 'IL',
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
  },
  {
    id: '3',
    name: 'Café Central',
    type: 'customer' as const,
    priority: 'B',
    segment: 'Fine Dining',
    phone: '(555) 345-6789',
    primary_manager_name: 'Maria Garcia',
    city: 'Los Angeles',
    state_province: 'CA',
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
]

describe('useOrganizationsFiltering', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    expect(result.current.activeFilter).toBe('all')
    expect(result.current.searchTerm).toBe('')
    expect(result.current.filteredOrganizations).toHaveLength(3)
    expect(result.current.filterPills).toHaveLength(5)
  })

  it('should filter by high-priority organizations', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setActiveFilter('high-priority')
    })

    expect(result.current.activeFilter).toBe('high-priority')
    expect(result.current.filteredOrganizations).toHaveLength(2) // A+ and A priority
    expect(result.current.filteredOrganizations[0].priority).toBe('A+')
    expect(result.current.filteredOrganizations[1].priority).toBe('A')
  })

  it('should filter by customer organizations', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setActiveFilter('customers')
    })

    expect(result.current.activeFilter).toBe('customers')
    expect(result.current.filteredOrganizations).toHaveLength(2) // 2 customers
    expect(result.current.filteredOrganizations.every((org) => org.type === 'customer')).toBe(true)
  })

  it('should filter by distributor organizations', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setActiveFilter('distributors')
    })

    expect(result.current.activeFilter).toBe('distributors')
    expect(result.current.filteredOrganizations).toHaveLength(1) // 1 distributor
    expect(result.current.filteredOrganizations[0].type).toBe('distributor')
  })

  it('should filter by recently contacted organizations (within 14 days)', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setActiveFilter('recently-contacted')
    })

    expect(result.current.activeFilter).toBe('recently-contacted')
    expect(result.current.filteredOrganizations).toHaveLength(2) // Updated within 14 days
  })

  it('should search by organization name', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setSearchTerm('ACME')
    })

    expect(result.current.searchTerm).toBe('ACME')
    expect(result.current.filteredOrganizations).toHaveLength(1)
    expect(result.current.filteredOrganizations[0].name).toBe('ACME Restaurant Corp')
  })

  it('should search by city', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setSearchTerm('chicago')
    })

    expect(result.current.filteredOrganizations).toHaveLength(1)
    expect(result.current.filteredOrganizations[0].city).toBe('Chicago')
  })

  it('should search by manager name', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setSearchTerm('maria')
    })

    expect(result.current.filteredOrganizations).toHaveLength(1)
    expect(result.current.filteredOrganizations[0].primary_manager_name).toBe('Maria Garcia')
  })

  it('should search by phone number', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setSearchTerm('555-234')
    })

    expect(result.current.filteredOrganizations).toHaveLength(1)
    expect(result.current.filteredOrganizations[0].phone).toBe('(555) 234-5678')
  })

  it('should combine filters and search', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    // Filter by customers and search for 'café'
    act(() => {
      result.current.setActiveFilter('customers')
      result.current.setSearchTerm('café')
    })

    expect(result.current.filteredOrganizations).toHaveLength(1)
    expect(result.current.filteredOrganizations[0].name).toBe('Café Central')
  })

  it('should calculate correct filter pill counts', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    const pillMap = result.current.filterPills.reduce(
      (acc, pill) => {
        acc[pill.key] = pill.count
        return acc
      },
      {} as Record<string, number>
    )

    expect(pillMap.all).toBe(3)
    expect(pillMap['high-priority']).toBe(2) // A+ and A priorities
    expect(pillMap.customers).toBe(2)
    expect(pillMap.distributors).toBe(1)
    expect(pillMap['recently-contacted']).toBe(2) // Within 14 days
  })

  it('should return empty results for no matches', () => {
    const { result } = renderHook(() => useOrganizationsFiltering(mockOrganizations))

    act(() => {
      result.current.setSearchTerm('nonexistent')
    })

    expect(result.current.filteredOrganizations).toHaveLength(0)
  })

  it('should handle empty organization list', () => {
    const { result } = renderHook(() => useOrganizationsFiltering([]))

    expect(result.current.filteredOrganizations).toHaveLength(0)
    expect(result.current.filterPills.find((p) => p.key === 'all')?.count).toBe(0)
  })
})
