import { useState, useCallback } from 'react'
import type { ContactWithOrganization } from '@/types/entities'

interface UseContactsSelectionReturn {
  selectedItems: Set<string>
  handleSelectAll: (checked: boolean, contacts: ContactWithOrganization[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
}

export const useContactsSelection = (): UseContactsSelectionReturn => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectAll = useCallback(
    (checked: boolean, contacts: ContactWithOrganization[]) => {
      if (checked) {
        setSelectedItems(new Set(contacts.map((contact) => contact.id)))
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