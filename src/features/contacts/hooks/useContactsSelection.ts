import { useCallback } from 'react'
import type { ContactWithOrganization } from '@/types/entities'
import { useEntitySelection, type UseEntitySelectionReturn } from '@/hooks/useEntitySelection'

interface UseContactsSelectionReturn {
  selectedItems: Set<string>
  handleSelectAll: (checked: boolean, contacts: ContactWithOrganization[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
}

export const useContactsSelection = (): UseContactsSelectionReturn => {
  const {
    selectedItems,
    handleSelectAll: genericHandleSelectAll,
    handleSelectItem,
    clearSelection,
  } = useEntitySelection<ContactWithOrganization>()

  // Maintain backward compatibility with existing interface
  const handleSelectAll = useCallback(
    (checked: boolean, contacts: ContactWithOrganization[]) => {
      genericHandleSelectAll(checked, contacts)
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
