import { useState, useCallback } from 'react'

/**
 * Generic table selection hook that provides selection state management
 * Extracted from OpportunitiesTable, OrganizationsTable, ContactsTable, ProductsTable
 */
export interface UseTableSelectionOptions<T> {
  /** Function to extract unique ID from item */
  getItemId: (item: T) => string
  /** Initial selected items */
  initialSelected?: Set<string>
}

export interface UseTableSelectionReturn<T> {
  /** Set of selected item IDs */
  selectedItems: Set<string>
  /** Handle individual item selection toggle */
  handleSelectItem: (itemId: string, checked: boolean) => void
  /** Handle select all / deselect all */
  handleSelectAll: (checked: boolean, items: T[]) => void
  /** Clear all selections */
  clearSelection: () => void
  /** Check if all visible items are selected */
  isAllSelected: (items: T[]) => boolean
  /** Check if some (but not all) items are selected */
  isIndeterminate: (items: T[]) => boolean
  /** Get array of selected item IDs */
  getSelectedIds: () => string[]
  /** Get count of selected items */
  getSelectedCount: () => number
}

export function useTableSelection<T>({
  getItemId,
  initialSelected = new Set(),
}: UseTableSelectionOptions<T>): UseTableSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(initialSelected)

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(
    (checked: boolean, items: T[]) => {
      if (checked) {
        // Select all visible items
        const allIds = new Set(items.map(getItemId))
        setSelectedItems((prev) => new Set([...prev, ...allIds]))
      } else {
        // Deselect all visible items
        const visibleIds = new Set(items.map(getItemId))
        setSelectedItems((prev) => new Set([...prev].filter((id) => !visibleIds.has(id))))
      }
    },
    [getItemId]
  )

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const isAllSelected = useCallback(
    (items: T[]) => {
      if (items.length === 0) return false
      return items.every((item) => selectedItems.has(getItemId(item)))
    },
    [selectedItems, getItemId]
  )

  const isIndeterminate = useCallback(
    (items: T[]) => {
      if (items.length === 0) return false
      const selectedCount = items.filter((item) => selectedItems.has(getItemId(item))).length
      return selectedCount > 0 && selectedCount < items.length
    },
    [selectedItems, getItemId]
  )

  const getSelectedIds = useCallback(() => {
    return Array.from(selectedItems)
  }, [selectedItems])

  const getSelectedCount = useCallback(() => {
    return selectedItems.size
  }, [selectedItems])

  return {
    selectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
    getSelectedIds,
    getSelectedCount,
  }
}
