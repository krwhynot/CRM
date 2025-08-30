import { useState, useMemo } from 'react'
import type { Organization } from '@/types/entities'

export type OrganizationFilterType = 'all' | 'high-priority' | 'customers' | 'distributors' | 'recently-contacted'

interface FilterPill {
  key: OrganizationFilterType
  label: string
  count: number
}

interface UseOrganizationsFilteringReturn {
  activeFilter: OrganizationFilterType
  setActiveFilter: (filter: OrganizationFilterType) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredOrganizations: Organization[]
  filterPills: FilterPill[]
}

// Base filter pills configuration (static - moved outside function)
const baseFilterPills: Omit<FilterPill, 'count'>[] = [
  { key: 'all', label: 'All' },
  { key: 'high-priority', label: 'High Priority' },
  { key: 'customers', label: 'Customers' },
  { key: 'distributors', label: 'Distributors' },
  { key: 'recently-contacted', label: 'Recently Contacted' }
]

export const useOrganizationsFiltering = (
  organizations: Organization[]
): UseOrganizationsFilteringReturn => {
  const [activeFilter, setActiveFilter] = useState<OrganizationFilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtered and searched organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations

    // Apply filter
    switch (activeFilter) {
      case 'high-priority':
        filtered = filtered.filter(org => org.priority === 'A' || org.priority === 'A+')
        break
      case 'customers':
        filtered = filtered.filter(org => org.type === 'customer')
        break
      case 'distributors':
        filtered = filtered.filter(org => org.type === 'distributor')
        break
      case 'recently-contacted': {
        // Filter organizations contacted within the last 14 days
        const fourteenDaysAgo = new Date()
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
        filtered = filtered.filter(org => {
          if (!org.updated_at) return false
          const updatedDate = new Date(org.updated_at)
          return updatedDate > fourteenDaysAgo
        })
        break
      }
      case 'all':
      default:
        // No filtering needed for 'all'
        break
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(org => 
        org.name?.toLowerCase().includes(term) ||
        org.segment?.toLowerCase().includes(term) ||
        org.city?.toLowerCase().includes(term) ||
        org.state_province?.toLowerCase().includes(term) ||
        org.phone?.includes(term) ||
        org.primary_manager_name?.toLowerCase().includes(term) ||
        org.secondary_manager_name?.toLowerCase().includes(term) ||
        org.address_line_1?.toLowerCase().includes(term) ||
        org.address_line_2?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [organizations, activeFilter, searchTerm])

  // Update filter pills with counts
  const filterPills = useMemo(() => {
    return baseFilterPills.map(pill => ({
      ...pill,
      count: getFilterCount(pill.key, organizations)
    }))
  }, [organizations])

  return {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredOrganizations,
    filterPills
  }
}

// Helper function to calculate filter counts
function getFilterCount(filterKey: OrganizationFilterType, organizations: Organization[]): number {
  switch (filterKey) {
    case 'all':
      return organizations.length
    case 'high-priority':
      return organizations.filter(org => org.priority === 'A' || org.priority === 'A+').length
    case 'customers':
      return organizations.filter(org => org.type === 'customer').length
    case 'distributors':
      return organizations.filter(org => org.type === 'distributor').length
    case 'recently-contacted': {
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      return organizations.filter(org => {
        if (!org.updated_at) return false
        const updatedDate = new Date(org.updated_at)
        return updatedDate > fourteenDaysAgo
      }).length
    }
    default:
      return 0
  }
}