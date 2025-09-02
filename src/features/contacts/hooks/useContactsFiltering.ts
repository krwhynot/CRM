import { useState, useMemo } from 'react'
import type { ContactWithOrganization } from '@/types/entities'

export type FilterType =
  | 'all'
  | 'decision-makers'
  | 'primary-contacts'
  | 'high-influence'
  | 'recently-added'

interface FilterPill {
  key: FilterType
  label: string
  count: number
}

interface UseContactsFilteringReturn {
  activeFilter: FilterType
  setActiveFilter: (filter: FilterType) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredContacts: ContactWithOrganization[]
  filterPills: FilterPill[]
}

// Base filter pills configuration (static - moved outside function)
const baseFilterPills: Omit<FilterPill, 'count'>[] = [
  { key: 'all', label: 'All' },
  { key: 'decision-makers', label: 'Decision Makers' },
  { key: 'primary-contacts', label: 'Primary Contacts' },
  { key: 'high-influence', label: 'High Influence' },
  { key: 'recently-added', label: 'Recently Added' },
]

export const useContactsFiltering = (
  contacts: ContactWithOrganization[]
): UseContactsFilteringReturn => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtered and searched contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    // Apply filter
    switch (activeFilter) {
      case 'decision-makers':
        filtered = filtered.filter((contact) => contact.decision_authority === 'Decision Maker')
        break
      case 'primary-contacts':
        filtered = filtered.filter((contact) => contact.is_primary_contact)
        break
      case 'high-influence':
        filtered = filtered.filter((contact) => contact.purchase_influence === 'High')
        break
      case 'recently-added': {
        // Filter contacts added within the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        filtered = filtered.filter((contact) => {
          if (!contact.created_at) return false
          const createdDate = new Date(contact.created_at)
          return createdDate > sevenDaysAgo
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
      filtered = filtered.filter(
        (contact) =>
          `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(term) ||
          contact.title?.toLowerCase().includes(term) ||
          contact.email?.toLowerCase().includes(term) ||
          contact.organization?.name?.toLowerCase().includes(term) ||
          contact.phone?.includes(term) ||
          contact.mobile_phone?.includes(term) ||
          contact.department?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [contacts, activeFilter, searchTerm])

  // Update filter pills with counts
  const filterPills = useMemo(() => {
    return baseFilterPills.map((pill) => ({
      ...pill,
      count: getFilterCount(pill.key, contacts),
    }))
  }, [contacts])

  return {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredContacts,
    filterPills,
  }
}

// Helper function to calculate filter counts
function getFilterCount(filterKey: FilterType, contacts: ContactWithOrganization[]): number {
  switch (filterKey) {
    case 'all':
      return contacts.length
    case 'decision-makers':
      return contacts.filter((c) => c.decision_authority === 'Decision Maker').length
    case 'primary-contacts':
      return contacts.filter((c) => c.is_primary_contact).length
    case 'high-influence':
      return contacts.filter((c) => c.purchase_influence === 'High').length
    case 'recently-added': {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return contacts.filter((c) => {
        if (!c.created_at) return false
        const createdDate = new Date(c.created_at)
        return createdDate > sevenDaysAgo
      }).length
    }
    default:
      return 0
  }
}
