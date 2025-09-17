import { useState, useCallback, useMemo } from 'react'
import { toast } from '@/lib/toast-styles'

export interface UnifiedBulkEntity {
  id: string
  name?: string
  // Support for different name patterns
  first_name?: string
  last_name?: string
}

interface UseUnifiedBulkOperationsProps<T extends UnifiedBulkEntity> {
  entities: T[]
  onBulkDelete?: (entities: T[]) => Promise<void>
  deleteEntity?: (id: string) => Promise<void>
  entityType?: string
  entityTypePlural?: string
}

export interface UnifiedBulkOperationsHook<T extends UnifiedBulkEntity> {
  selectedItems: Set<string>
  selectedEntities: T[]
  selectedCount: number
  showBulkActions: boolean
  handleSelectAll: (checked: boolean, entities: T[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  handleBulkDelete: () => Promise<void>
  clearSelection: () => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isDeleting: boolean
  // For DataTable selection sync
  handleSelectionChange: (selectedIds: string[]) => void
}

/**
 * Unified bulk operations hook that consolidates selection state management
 * and bulk delete operations across all entities.
 *
 * Supports both custom bulk delete handler and fallback to individual deletions.
 * Handles toast notifications and error reporting for bulk operations.
 */
export const useUnifiedBulkOperations = <T extends UnifiedBulkEntity>({
  entities,
  onBulkDelete,
  deleteEntity,
  entityType = 'item',
  entityTypePlural = 'items',
}: UseUnifiedBulkOperationsProps<T>): UnifiedBulkOperationsHook<T> => {
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

  // Sync selection with DataTable
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    const newSelectedSet = new Set(selectedIds)

    // Update selection state to match DataTable
    setSelectedItems((prev) => {
      const current = new Set(prev)

      // Add newly selected items
      selectedIds.forEach((id) => {
        if (!current.has(id)) {
          current.add(id)
        }
      })

      // Remove unselected items
      Array.from(current).forEach((id) => {
        if (!newSelectedSet.has(id)) {
          current.delete(id)
        }
      })

      return current
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  // Helper function to get entity name for display
  const getEntityName = useCallback(
    (entity: T): string => {
      if (entity.name) return entity.name
      if (entity.first_name && entity.last_name) {
        return `${entity.first_name} ${entity.last_name}`
      }
      return entity.first_name || entity.last_name || `${entityType} ${entity.id}`
    },
    [entityType]
  )

  // Enhanced bulk delete handler with fallback and detailed error reporting
  const handleBulkDelete = useCallback(async () => {
    if (selectedEntities.length === 0) return

    setIsDeleting(true)
    let successCount = 0
    let errorCount = 0
    const results: Array<{ id: string; status: 'success' | 'error'; error?: string }> = []

    try {
      if (onBulkDelete) {
        // Use custom bulk delete handler if provided
        await onBulkDelete(selectedEntities)
        successCount = selectedEntities.length

        toast.success(
          `Successfully archived ${successCount} ${successCount === 1 ? entityType : entityTypePlural}`
        )
        clearSelection()
      } else if (deleteEntity) {
        // Fallback to individual deletions
        for (const entity of selectedEntities) {
          try {
            await deleteEntity(entity.id)
            results.push({ id: entity.id, status: 'success' })
            successCount++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            results.push({
              id: entity.id,
              status: 'error',
              error: errorMessage,
            })
            errorCount++
            console.error(`Failed to delete ${entityType} ${getEntityName(entity)}:`, error)
          }
        }

        // Show detailed toast notifications based on results
        if (successCount > 0 && errorCount === 0) {
          toast.success(
            `Successfully archived ${successCount} ${successCount === 1 ? entityType : entityTypePlural}`
          )
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(`Archived ${successCount} ${entityTypePlural}, but ${errorCount} failed`)
        } else if (errorCount > 0) {
          toast.error(
            `Failed to archive ${errorCount} ${errorCount === 1 ? entityType : entityTypePlural}`
          )
        }

        // Clear selection for successfully deleted items
        if (successCount > 0) {
          const successfulIds = results.filter((r) => r.status === 'success').map((r) => r.id)

          setSelectedItems((prev) => {
            const newSelected = new Set(prev)
            successfulIds.forEach((id) => newSelected.delete(id))
            return newSelected
          })
        }
      } else {
        console.warn('No delete handler provided to useUnifiedBulkOperations')
        toast.error('Delete operation not configured')
      }
    } catch (error) {
      console.error('Bulk delete operation failed:', error)
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }, [
    selectedEntities,
    onBulkDelete,
    deleteEntity,
    entityType,
    entityTypePlural,
    clearSelection,
    getEntityName,
  ])

  return {
    selectedItems,
    selectedEntities,
    selectedCount,
    showBulkActions,
    handleSelectAll,
    handleSelectItem,
    handleSelectionChange,
    handleBulkDelete,
    clearSelection,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
  }
}
