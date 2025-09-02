import { useState, useMemo } from 'react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface UseOpportunitiesSearchReturn {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredOpportunities: OpportunityWithLastActivity[]
}

export const useOpportunitiesSearch = (
  opportunities: OpportunityWithLastActivity[]
): UseOpportunitiesSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOpportunities = useMemo(() => {
    if (!searchTerm.trim()) return opportunities

    const lowerSearchTerm = searchTerm.toLowerCase()

    return opportunities.filter(
      (opportunity) =>
        opportunity.name.toLowerCase().includes(lowerSearchTerm) ||
        (opportunity.organization?.name &&
          opportunity.organization.name.toLowerCase().includes(lowerSearchTerm)) ||
        (opportunity.contact &&
          `${opportunity.contact.first_name} ${opportunity.contact.last_name}`
            .toLowerCase()
            .includes(lowerSearchTerm))
    )
  }, [opportunities, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredOpportunities,
  }
}
