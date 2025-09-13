import { useState } from 'react'
import { useContacts } from './useContacts'
import { useContactsSorting } from './useContactsSorting'
import { useContactsDisplay } from './useContactsDisplay'
import type { ContactFilters } from '@/types/entities'

interface UseContactTableDataProps {
  filters?: ContactFilters
}

export function useContactTableData({ filters }: UseContactTableDataProps = {}) {
  // Enhanced filtering state
  const [contactFilters, setContactFilters] = useState<ContactFilters>({
    search: '',
    organization: 'all',
    authorityLevel: 'all',
    activityLevel: 'all',
    ...filters, // merge any filters passed as props
  })

  // Data fetching - combine component filters with prop filters
  const { data: contacts = [], isLoading } = useContacts({
    ...contactFilters,
    ...filters, // prop filters override component filters
  })

  // Use filtered data from the hook with the complete filters
  const { sortedContacts } = useContactsSorting(contacts)

  const { toggleRowExpansion, isRowExpanded } = useContactsDisplay(
    sortedContacts.map((contact) => contact.id)
  )

  // Computed values
  const emptyMessage = contactFilters.search ? 'No contacts match your search.' : 'No contacts yet'
  const emptySubtext = contactFilters.search
    ? 'Try adjusting your search terms or filters'
    : 'Get started by adding your first contact'

  return {
    // Data
    contacts,
    sortedContacts,
    isLoading,

    // Filters
    contactFilters,
    setContactFilters,

    // Row expansion
    toggleRowExpansion,
    isRowExpanded,

    // UI state
    emptyMessage,
    emptySubtext,
  }
}
