import { useState, useCallback } from 'react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface UseOpportunitiesSelectionReturn {
  selectedItems: Set<string>
  handleSelectAll: (checked: boolean, opportunities: OpportunityWithLastActivity[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
}

export const useOpportunitiesSelection = (): UseOpportunitiesSelectionReturn => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectAll = useCallback(
    (checked: boolean, opportunities: OpportunityWithLastActivity[]) => {
      if (checked) {
        setSelectedItems(new Set(opportunities.map((opp) => opp.id)))
      } else {
        setSelectedItems(new Set())
      }
    },
    []
  )

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      return newSelected
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  return {
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
  }
}
