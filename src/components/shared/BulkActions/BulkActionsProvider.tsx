import React, { createContext, useContext, useEffect } from 'react'
import { useTableSelection, type UseTableSelectionReturn } from '@/hooks/table/useTableSelection'
import {
  useBulkActions,
  type UseBulkActionsReturn,
  type UseBulkActionsOptions,
} from './useBulkActions'

/**
 * Context for bulk actions state management
 * Combines selection and bulk operations into a unified system
 */
export interface BulkActionsContextValue<T> {
  selection: UseTableSelectionReturn<T>
  bulkActions: UseBulkActionsReturn<T>
  /** Selected items as array for convenience */
  selectedItems: T[]
}

const BulkActionsContext = createContext<BulkActionsContextValue<any> | null>(null)

export interface BulkActionsProviderProps<T> extends UseBulkActionsOptions<T> {
  children: React.ReactNode
  /** All available items for selection */
  items: T[]
  /** Initial selected items */
  initialSelected?: Set<string>
}

/**
 * Provider that combines table selection and bulk actions
 * Provides unified state management for table bulk operations
 */
export function BulkActionsProvider<T>({
  children,
  items,
  initialSelected,
  getItemId,
  getItemName,
  entityType,
  entityTypePlural,
}: BulkActionsProviderProps<T>) {
  const selection = useTableSelection<T>({
    getItemId,
    initialSelected,
  })

  const bulkActions = useBulkActions<T>({
    getItemId,
    getItemName,
    entityType,
    entityTypePlural,
  })

  // Calculate selected items array
  const selectedItems = items.filter((item) => selection.selectedItems.has(getItemId(item)))

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A or Cmd+A to select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        selection.handleSelectAll(true, items)
      }

      // Escape to clear selection
      if (event.key === 'Escape') {
        selection.clearSelection()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, selection])

  const contextValue: BulkActionsContextValue<T> = {
    selection,
    bulkActions,
    selectedItems,
  }

  return <BulkActionsContext.Provider value={contextValue}>{children}</BulkActionsContext.Provider>
}

/**
 * Hook to access bulk actions context
 */
export function useBulkActionsContext<T>(): BulkActionsContextValue<T> {
  const context = useContext(BulkActionsContext)
  if (!context) {
    throw new Error('useBulkActionsContext must be used within a BulkActionsProvider')
  }
  return context
}
