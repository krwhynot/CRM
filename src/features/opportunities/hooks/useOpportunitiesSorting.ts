import { useState, useCallback, useMemo } from 'react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

export type SortField = 'last_activity' | 'company' | 'stage' | 'value' | 'probability'
export type SortDirection = 'asc' | 'desc'

interface UseOpportunitiesSortingReturn {
  sortField: SortField
  sortDirection: SortDirection
  handleSort: (field: SortField) => void
  sortedOpportunities: OpportunityWithLastActivity[]
}

export const useOpportunitiesSorting = (
  opportunities: OpportunityWithLastActivity[]
): UseOpportunitiesSortingReturn => {
  const [sortField, setSortField] = useState<SortField>('last_activity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'last_activity' ? 'desc' : 'asc') // Default last activity to desc
    }
  }, [sortField, sortDirection])

  const sortedOpportunities = useMemo(() => {
    const sorted = [...opportunities].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      
      switch (sortField) {
        case 'last_activity':
          if (a.last_activity_date && b.last_activity_date) {
            return (new Date(a.last_activity_date).getTime() - new Date(b.last_activity_date).getTime()) * direction
          }
          if (a.last_activity_date && !b.last_activity_date) return -1 * direction
          if (!a.last_activity_date && b.last_activity_date) return 1 * direction
          return (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()) * direction
        
        case 'company': {
          const aName = a.organization?.name || 'Z'
          const bName = b.organization?.name || 'Z'
          return aName.localeCompare(bName) * direction
        }
        
        case 'stage':
          return a.stage.localeCompare(b.stage) * direction
        
        case 'value': {
          const aValue = a.estimated_value || 0
          const bValue = b.estimated_value || 0
          return (aValue - bValue) * direction
        }
        
        case 'probability': {
          const aProb = a.probability || 0
          const bProb = b.probability || 0
          return (aProb - bProb) * direction
        }
        
        default:
          return 0
      }
    })
    
    return sorted
  }, [opportunities, sortField, sortDirection])

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedOpportunities
  }
}