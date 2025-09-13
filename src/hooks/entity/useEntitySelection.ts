/**
 * Generic Entity Selection Hook
 *
 * Provides comprehensive selection management for any entity type.
 * Supports individual selection, bulk selection, and optimistic selection state.
 */

import { useState, useCallback, useMemo } from 'react'
import type { BaseEntity, SelectionState, SelectionActions } from './types'

export interface UseEntitySelectionOptions<T extends BaseEntity> {
  initialSelection?: Set<string>
  onSelectionChange?: (selected: Set<string>, entities: T[]) => void
  maxSelection?: number
  autoDeselect?: boolean // Deselect when entities are removed from list
}

export interface UseEntitySelectionReturn<T extends BaseEntity>
  extends SelectionState<T>,
    SelectionActions<T> {
  // Additional utility methods
  isSelected: (id: string) => boolean
  getSelectedIds: () => string[]
  selectEntity: (entity: T) => void
  deselectEntity: (entity: T) => void
  selectWhere: (predicate: (entity: T) => boolean, entities: T[]) => void
  deselectWhere: (predicate: (entity: T) => boolean, entities: T[]) => void
}

/**
 * Generic selection hook that manages selection state for any entity type
 */
export function useEntitySelection<T extends BaseEntity>(
  entities: T[] = [],
  options: UseEntitySelectionOptions<T> = {}
): UseEntitySelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    options.initialSelection || new Set()
  )

  // Memoized selection state
  const selectionState = useMemo((): SelectionState<T> => {
    const selectedEntities = entities.filter((entity) => selectedItems.has(entity.id))
    const isAllSelected = entities.length > 0 && selectedItems.size === entities.length
    const hasSelection = selectedItems.size > 0
    const selectionCount = selectedItems.size

    return {
      selectedItems,
      selectedEntities,
      isAllSelected,
      hasSelection,
      selectionCount,
    }
  }, [entities, selectedItems])

  // Handle individual item selection
  const handleSelectItem = useCallback(
    (id: string, checked: boolean) => {
      setSelectedItems((prev) => {
        const newSelection = new Set(prev)

        if (checked) {
          // Check max selection limit
          if (options.maxSelection && newSelection.size >= options.maxSelection) {
            return prev // Don't exceed max selection
          }
          newSelection.add(id)
        } else {
          newSelection.delete(id)
        }

        // Notify of change
        const selectedEntities = entities.filter((entity) => newSelection.has(entity.id))
        options.onSelectionChange?.(newSelection, selectedEntities)

        return newSelection
      })
    },
    [entities, options]
  )

  // Handle select all/none
  const handleSelectAll = useCallback(
    (checked: boolean, targetEntities: T[] = entities) => {
      setSelectedItems((prev) => {
        let newSelection: Set<string>

        if (checked) {
          // Select all entities
          const targetIds = targetEntities.map((entity) => entity.id)

          // Check max selection limit
          if (options.maxSelection && targetIds.length > options.maxSelection) {
            // Select only up to the limit
            newSelection = new Set(targetIds.slice(0, options.maxSelection))
          } else {
            newSelection = new Set([...prev, ...targetIds])
          }
        } else {
          // Deselect all target entities
          const targetIds = new Set(targetEntities.map((entity) => entity.id))
          newSelection = new Set([...prev].filter((id) => !targetIds.has(id)))
        }

        // Notify of change
        const selectedEntities = entities.filter((entity) => newSelection.has(entity.id))
        options.onSelectionChange?.(newSelection, selectedEntities)

        return newSelection
      })
    },
    [entities, options]
  )

  // Clear all selection
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
    options.onSelectionChange?.(new Set(), [])
  }, [options])

  // Select multiple items by IDs
  const selectMultiple = useCallback(
    (ids: string[]) => {
      setSelectedItems((prev) => {
        let newSelection = new Set(prev)

        for (const id of ids) {
          if (options.maxSelection && newSelection.size >= options.maxSelection) {
            break
          }
          newSelection.add(id)
        }

        const selectedEntities = entities.filter((entity) => newSelection.has(entity.id))
        options.onSelectionChange?.(newSelection, selectedEntities)

        return newSelection
      })
    },
    [entities, options]
  )

  // Deselect multiple items by IDs
  const deselectMultiple = useCallback(
    (ids: string[]) => {
      setSelectedItems((prev) => {
        const newSelection = new Set(prev)
        ids.forEach((id) => newSelection.delete(id))

        const selectedEntities = entities.filter((entity) => newSelection.has(entity.id))
        options.onSelectionChange?.(newSelection, selectedEntities)

        return newSelection
      })
    },
    [entities, options]
  )

  // Toggle selection of a single item
  const toggleSelection = useCallback(
    (id: string) => {
      const isCurrentlySelected = selectedItems.has(id)
      handleSelectItem(id, !isCurrentlySelected)
    },
    [selectedItems, handleSelectItem]
  )

  // Utility methods
  const isSelected = useCallback(
    (id: string) => {
      return selectedItems.has(id)
    },
    [selectedItems]
  )

  const getSelectedIds = useCallback(() => {
    return Array.from(selectedItems)
  }, [selectedItems])

  const selectEntity = useCallback(
    (entity: T) => {
      handleSelectItem(entity.id, true)
    },
    [handleSelectItem]
  )

  const deselectEntity = useCallback(
    (entity: T) => {
      handleSelectItem(entity.id, false)
    },
    [handleSelectItem]
  )

  // Select entities based on predicate
  const selectWhere = useCallback(
    (predicate: (entity: T) => boolean, targetEntities: T[]) => {
      const idsToSelect = targetEntities.filter(predicate).map((entity) => entity.id)
      selectMultiple(idsToSelect)
    },
    [selectMultiple]
  )

  // Deselect entities based on predicate
  const deselectWhere = useCallback(
    (predicate: (entity: T) => boolean, targetEntities: T[]) => {
      const idsToDeselect = targetEntities.filter(predicate).map((entity) => entity.id)
      deselectMultiple(idsToDeselect)
    },
    [deselectMultiple]
  )

  // Auto-deselect entities that are no longer in the list
  useMemo(() => {
    if (options.autoDeselect && entities.length > 0) {
      const currentEntityIds = new Set(entities.map((e) => e.id))
      const invalidSelections = Array.from(selectedItems).filter((id) => !currentEntityIds.has(id))

      if (invalidSelections.length > 0) {
        deselectMultiple(invalidSelections)
      }
    }
  }, [entities, selectedItems, options.autoDeselect, deselectMultiple])

  return {
    // Selection state
    ...selectionState,

    // Selection actions
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    selectMultiple,
    deselectMultiple,
    toggleSelection,

    // Utility methods
    isSelected,
    getSelectedIds,
    selectEntity,
    deselectEntity,
    selectWhere,
    deselectWhere,
  }
}

/**
 * Hook for advanced selection scenarios with custom logic
 */
export function useAdvancedEntitySelection<T extends BaseEntity>(
  entities: T[] = [],
  options: UseEntitySelectionOptions<T> & {
    selectAllStrategy?: 'page' | 'all' | 'visible'
    persistSelection?: boolean
    selectionKey?: string
  } = {}
) {
  const baseSelection = useEntitySelection(entities, options)

  // Persist selection to localStorage if enabled
  useMemo(() => {
    if (options.persistSelection && options.selectionKey) {
      const savedSelection = localStorage.getItem(`selection-${options.selectionKey}`)
      if (savedSelection) {
        try {
          const parsed = JSON.parse(savedSelection) as string[]
          baseSelection.selectMultiple(parsed)
        } catch {
          // Ignore invalid saved selection
        }
      }
    }
  }, [options.persistSelection, options.selectionKey])

  // Save selection to localStorage when it changes
  useMemo(() => {
    if (options.persistSelection && options.selectionKey) {
      localStorage.setItem(
        `selection-${options.selectionKey}`,
        JSON.stringify(baseSelection.getSelectedIds())
      )
    }
  }, [baseSelection.selectedItems, options.persistSelection, options.selectionKey])

  return {
    ...baseSelection,
    clearPersistedSelection: () => {
      if (options.selectionKey) {
        localStorage.removeItem(`selection-${options.selectionKey}`)
      }
      baseSelection.clearSelection()
    },
  }
}

/**
 * Hook for bulk action selection with confirmation
 */
export function useBulkSelectionWithConfirmation<T extends BaseEntity>(
  entities: T[],
  options: UseEntitySelectionOptions<T> & {
    dangerousActions?: string[]
    requireConfirmation?: (action: string, entities: T[]) => boolean
  } = {}
) {
  const selection = useEntitySelection(entities, options)
  const [pendingAction, setPendingAction] = useState<{
    action: string
    entities: T[]
    callback: () => Promise<void>
  } | null>(null)

  const executeBulkAction = useCallback(
    async (action: string, callback: () => Promise<void>) => {
      const selectedEntities = selection.selectedEntities

      if (selectedEntities.length === 0) {
        return
      }

      const needsConfirmation =
        options.requireConfirmation?.(action, selectedEntities) ||
        options.dangerousActions?.includes(action)

      if (needsConfirmation) {
        setPendingAction({ action, entities: selectedEntities, callback })
      } else {
        await callback()
        selection.clearSelection()
      }
    },
    [selection, options]
  )

  const confirmPendingAction = useCallback(async () => {
    if (pendingAction) {
      await pendingAction.callback()
      selection.clearSelection()
      setPendingAction(null)
    }
  }, [pendingAction, selection])

  const cancelPendingAction = useCallback(() => {
    setPendingAction(null)
  }, [])

  return {
    ...selection,
    pendingAction,
    executeBulkAction,
    confirmPendingAction,
    cancelPendingAction,
  }
}
