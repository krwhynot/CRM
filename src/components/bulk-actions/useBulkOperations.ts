import { useState, useCallback, useMemo } from 'react'
import type { DeletableEntity, BulkOperationsHook } from './types'

interface UseBulkOperationsProps<T extends DeletableEntity> {
  entities: T[]
  onBulkDelete: (entities: T[]) => Promise<void>
}

export const useBulkOperations = <T extends DeletableEntity>({
  entities,
  onBulkDelete,
}: UseBulkOperationsProps<T>): BulkOperationsHook<T> => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoized calculations
  const selectedEntities = useMemo(
    () => entities.filter((entity) => selectedItems.has(entity.id)),
    [entities, selectedItems]
  )

  const selectedCount = selectedItems.size
  const showBulkActions = selectedCount > 0

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean, entitiesArray: T[]) => {
    if (checked) {
      setSelectedItems(new Set(entitiesArray.map((entity) => entity.id)))
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

  // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    if (selectedEntities.length === 0) return

    setIsDeleting(true)
    try {
      await onBulkDelete(selectedEntities)
      clearSelection()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      // Error handling is typically done in the calling component
      console.error('Bulk delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedEntities, onBulkDelete, clearSelection])

  return {
    selectedItems,
    selectedEntities,
    selectedCount,
    showBulkActions,
    handleSelectAll,
    handleSelectItem,
    handleBulkDelete,
    clearSelection,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
  }
}
