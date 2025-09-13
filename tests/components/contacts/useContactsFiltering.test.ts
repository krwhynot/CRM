import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useContactsFiltering } from '@/features/contacts/hooks/useContactsFiltering'
import type { ContactWithOrganization } from '@/types/entities'

const mockContacts: ContactWithOrganization[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    title: 'Manager',
    email: 'john@test.com',
    phone: '123-456-7890',
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    is_primary_contact: true,
    organization_id: '1',
    organization: {
      id: '1',
      name: 'Test Corp',
      type: 'customer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      description: null,
      phone: null,
      email: null,
      website: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      state_province: null,
      postal_code: null,
      country: null,
      industry: null,
      is_active: true,
      deleted_at: null,
      created_by: 'test-user',
      updated_by: 'test-user',
      import_notes: null,
      import_session_id: null,
      primary_manager_id: null,
      secondary_manager_id: null,
      is_distributor: false,
      is_principal: false,
      notes: null,
      parent_organization_id: null,
      priority: 'High',
      segment: 'A',
      primary_manager_name: null,
      search_tsv: null,
      secondary_manager_name: null
    },
    department: 'Sales',
    created_at: new Date().toISOString(), // Recent
    updated_at: new Date().toISOString(),
    mobile_phone: null,
    linkedin_url: null,
    notes: null,
    role: null,
    created_by: '',
    updated_by: '',
    deleted_at: null,
    search_tsv: null
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    title: 'Director',
    email: 'jane@example.com',
    purchase_influence: 'Medium',
    decision_authority: 'Influencer',
    is_primary_contact: false,
    organization_id: '2',
    organization: {
      id: '2',
      name: 'Example Inc',
      type: 'distributor',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      description: null,
      phone: null,
      email: null,
      website: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      state_province: null,
      postal_code: null,
      country: null,
      industry: null,
      is_active: true,
      deleted_at: null,
      created_by: 'test-user',
      updated_by: 'test-user',
      import_notes: null,
      import_session_id: null,
      primary_manager_id: null,
      secondary_manager_id: null,
      is_distributor: false,
      is_principal: false,
      notes: null,
      parent_organization_id: null,
      priority: 'Medium',
      segment: 'B',
      primary_manager_name: null,
      search_tsv: null,
      secondary_manager_name: null
    },
    department: 'Operations',
    created_at: '2023-01-01T00:00:00Z', // Old
    updated_at: '2023-01-01T00:00:00Z',
    mobile_phone: null,
    linkedin_url: null,
    notes: null,
    role: null,
    created_by: '',
    updated_by: '',
    deleted_at: null,
    phone: null,
    search_tsv: null
  }
]

describe('useContactsFiltering', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    expect(result.current.activeFilter).toBe('all')
    expect(result.current.searchTerm).toBe('')
    expect(result.current.filteredContacts).toHaveLength(2)
  })

  it('should filter contacts by decision makers', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setActiveFilter('decision-makers')
    })
    
    expect(result.current.activeFilter).toBe('decision-makers')
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].decision_authority).toBe('Decision Maker')
  })

  it('should filter contacts by primary contacts', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setActiveFilter('primary-contacts')
    })
    
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].is_primary_contact).toBe(true)
  })

  it('should filter contacts by high influence', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setActiveFilter('high-influence')
    })
    
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].purchase_influence).toBe('High')
  })

  it('should filter contacts by recently added', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setActiveFilter('recently-added')
    })
    
    // Only the first contact should be recent (created today)
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].id).toBe('1')
  })

  it('should search contacts by name', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setSearchTerm('Jane')
    })
    
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].first_name).toBe('Jane')
  })

  it('should search contacts by email', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setSearchTerm('john@test.com')
    })
    
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].email).toBe('john@test.com')
  })

  it('should search contacts by organization name', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setSearchTerm('Test Corp')
    })
    
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].organization?.name).toBe('Test Corp')
  })

  it('should combine filter and search', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setActiveFilter('decision-makers')
      result.current.setSearchTerm('John')
    })
    
    expect(result.current.filteredContacts).toHaveLength(1)
    expect(result.current.filteredContacts[0].first_name).toBe('John')
    expect(result.current.filteredContacts[0].decision_authority).toBe('Decision Maker')
  })

  it('should update filter pills with correct counts', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    const filterPills = result.current.filterPills
    
    expect(filterPills.find((p: { key: string; }) => p.key === 'all')?.count).toBe(2)
    expect(filterPills.find((p: { key: string; }) => p.key === 'decision-makers')?.count).toBe(1)
    expect(filterPills.find((p: { key: string; }) => p.key === 'primary-contacts')?.count).toBe(1)
    expect(filterPills.find((p: { key: string; }) => p.key === 'high-influence')?.count).toBe(1)
    expect(filterPills.find((p: { key: string; }) => p.key === 'recently-added')?.count).toBe(1)
  })

  it('should return empty results when no matches found', () => {
    const { result } = renderHook(() => useContactsFiltering(mockContacts))
    
    act(() => {
      result.current.setSearchTerm('NonexistentName')
    })
    
    expect(result.current.filteredContacts).toHaveLength(0)
  })
})
