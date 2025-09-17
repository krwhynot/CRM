import { useCallback } from 'react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import { useEntitySelection, type UseEntitySelectionReturn } from '@/hooks/useEntitySelection'

interface UseOpportunitiesSelectionReturn {
  selectedItems: Set<string>
  handleSelectAll: (checked: boolean, opportunities: OpportunityWithLastActivity[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
}

export const useOpportunitiesSelection = (): UseOpportunitiesSelectionReturn => {
  const {
    selectedItems,
    handleSelectAll: genericHandleSelectAll,
    handleSelectItem,
    clearSelection,
  } = useEntitySelection<OpportunityWithLastActivity>()

  // Maintain backward compatibility with existing interface
  const handleSelectAll = useCallback(
    (checked: boolean, opportunities: OpportunityWithLastActivity[]) => {
      genericHandleSelectAll(checked, opportunities)
    },
    [genericHandleSelectAll]
  )

  return {
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
  }
}
