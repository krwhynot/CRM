import { useState, useCallback } from 'react'

/**
 * Generic entity selection hook for multi-item selection operations
 *
 * Implements the Set<string> pattern for ID-based selection used across
 * contacts and opportunities hooks. Provides consistent interface for
 * bulk operations like export, delete, and modify.
 *
 * @template T - Entity type that must have an 'id' property
 */
export interface UseEntitySelectionReturn {
  selectedItems: Set<string>
  handleSelectAll: (checked: boolean, items: { id: string }[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
}

export const useEntitySelection = <T extends { id: string }>(): UseEntitySelectionReturn => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectAll = useCallback((checked: boolean, items: T[]) => {
    if (checked) {
      setSelectedItems(new Set(items.map((item) => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }, [])

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
