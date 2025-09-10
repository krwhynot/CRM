/**
 * Bulk Actions Provider
 * 
 * Context provider for managing bulk selection and actions across CRM entities.
 * Provides a unified interface for selecting multiple items and performing bulk operations.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface BulkActionItem {
  id: string
  type: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  data: Record<string, unknown>
}

export interface BulkAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'secondary'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  disabled?: boolean
  disabledReason?: string
  handler: (items: BulkActionItem[]) => Promise<void> | void
}

export interface BulkActionsState {
  // Selection state
  selectedItems: Map<string, BulkActionItem>
  isAllSelected: boolean
  isPartiallySelected: boolean
  
  // Actions
  selectItem: (item: BulkActionItem) => void
  deselectItem: (id: string) => void
  selectAll: (items: BulkActionItem[]) => void
  deselectAll: () => void
  toggleItem: (item: BulkActionItem) => void
  toggleSelectAll: (items: BulkActionItem[]) => void
  
  // Bulk operations
  availableActions: BulkAction[]
  setAvailableActions: (actions: BulkAction[]) => void
  executeBulkAction: (actionId: string) => Promise<void>
  
  // State helpers
  getSelectedItems: () => BulkActionItem[]
  getSelectedIds: () => string[]
  isItemSelected: (id: string) => boolean
  getSelectionCount: () => number
  canExecuteAction: (actionId: string) => boolean
}

// =============================================================================
// CONTEXT
// =============================================================================

const BulkActionsContext = createContext<BulkActionsState | undefined>(undefined)

export function useBulkActions() {
  const context = useContext(BulkActionsContext)
  if (!context) {
    throw new Error('useBulkActions must be used within a BulkActionsProvider')
  }
  return context
}

// =============================================================================
// PROVIDER
// =============================================================================

interface BulkActionsProviderProps {
  children: React.ReactNode
  onActionExecuted?: (actionId: string, items: BulkActionItem[]) => void
  onSelectionChanged?: (selectedItems: BulkActionItem[]) => void
}

export function BulkActionsProvider({
  children,
  onActionExecuted,
  onSelectionChanged,
}: BulkActionsProviderProps) {
  // State
  const [selectedItems, setSelectedItems] = useState<Map<string, BulkActionItem>>(new Map())
  const [availableActions, setAvailableActions] = useState<BulkAction[]>([])

  // Selection state derivations
  const isAllSelected = useMemo(() => selectedItems.size > 0, [selectedItems.size])
  const isPartiallySelected = useMemo(() => selectedItems.size > 0, [selectedItems.size])

  // Selection actions
  const selectItem = useCallback((item: BulkActionItem) => {
    setSelectedItems(prev => {
      const newSelection = new Map(prev)
      newSelection.set(item.id, item)
      
      const selectedArray = Array.from(newSelection.values())
      onSelectionChanged?.(selectedArray)
      
      return newSelection
    })
  }, [onSelectionChanged])

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSelection = new Map(prev)
      newSelection.delete(id)
      
      const selectedArray = Array.from(newSelection.values())
      onSelectionChanged?.(selectedArray)
      
      return newSelection
    })
  }, [onSelectionChanged])

  const selectAll = useCallback((items: BulkActionItem[]) => {
    const newSelection = new Map(items.map(item => [item.id, item]))
    setSelectedItems(newSelection)
    onSelectionChanged?.(items)
  }, [onSelectionChanged])

  const deselectAll = useCallback(() => {
    setSelectedItems(new Map())
    onSelectionChanged?.([])
  }, [onSelectionChanged])

  const toggleItem = useCallback((item: BulkActionItem) => {
    if (selectedItems.has(item.id)) {
      deselectItem(item.id)
    } else {
      selectItem(item)
    }
  }, [selectedItems, selectItem, deselectItem])

  const toggleSelectAll = useCallback((items: BulkActionItem[]) => {
    if (selectedItems.size === items.length) {
      deselectAll()
    } else {
      selectAll(items)
    }
  }, [selectedItems.size, selectAll, deselectAll])

  // Bulk action execution
  const executeBulkAction = useCallback(async (actionId: string) => {
    const action = availableActions.find(a => a.id === actionId)
    if (!action) {
      throw new Error(`Bulk action '${actionId}' not found`)
    }

    const items = Array.from(selectedItems.values())
    if (items.length === 0) {
      throw new Error('No items selected for bulk action')
    }

    try {
      await action.handler(items)
      onActionExecuted?.(actionId, items)
      
      // Clear selection after successful action
      deselectAll()
    } catch (error) {
      // Re-throw to let calling component handle error display
      throw error
    }
  }, [availableActions, selectedItems, onActionExecuted, deselectAll])

  // Helper functions
  const getSelectedItems = useCallback(() => {
    return Array.from(selectedItems.values())
  }, [selectedItems])

  const getSelectedIds = useCallback(() => {
    return Array.from(selectedItems.keys())
  }, [selectedItems])

  const isItemSelected = useCallback((id: string) => {
    return selectedItems.has(id)
  }, [selectedItems])

  const getSelectionCount = useCallback(() => {
    return selectedItems.size
  }, [selectedItems.size])

  const canExecuteAction = useCallback((actionId: string) => {
    const action = availableActions.find(a => a.id === actionId)
    if (!action || action.disabled) return false
    return selectedItems.size > 0
  }, [availableActions, selectedItems.size])

  // Context value
  const contextValue: BulkActionsState = useMemo(() => ({
    // Selection state
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    
    // Actions
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    toggleItem,
    toggleSelectAll,
    
    // Bulk operations
    availableActions,
    setAvailableActions,
    executeBulkAction,
    
    // State helpers
    getSelectedItems,
    getSelectedIds,
    isItemSelected,
    getSelectionCount,
    canExecuteAction,
  }), [
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    toggleItem,
    toggleSelectAll,
    availableActions,
    executeBulkAction,
    getSelectedItems,
    getSelectedIds,
    isItemSelected,
    getSelectionCount,
    canExecuteAction,
  ])

  return (
    <BulkActionsContext.Provider value={contextValue}>
      {children}
    </BulkActionsContext.Provider>
  )
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook for table components to easily integrate bulk selection
 */
export function useBulkSelection<T extends { id: string }>(
  items: T[],
  entityType: BulkActionItem['type'],
  transform?: (item: T) => Record<string, unknown>
) {
  const { 
    selectItem, 
    deselectItem, 
    selectAll, 
    deselectAll, 
    toggleItem, 
    toggleSelectAll,
    isItemSelected, 
    getSelectionCount,
    selectedItems,
  } = useBulkActions()

  const bulkActionItems = useMemo(() => 
    items.map(item => ({
      id: item.id,
      type: entityType,
      data: transform ? transform(item) : item as Record<string, unknown>,
    })), 
    [items, entityType, transform]
  )

  const isAllSelected = useMemo(() => 
    items.length > 0 && items.every(item => isItemSelected(item.id)),
    [items, isItemSelected]
  )

  const isPartiallySelected = useMemo(() => 
    items.some(item => isItemSelected(item.id)) && !isAllSelected,
    [items, isItemSelected, isAllSelected]
  )

  const handleSelectAll = useCallback(() => {
    toggleSelectAll(bulkActionItems)
  }, [toggleSelectAll, bulkActionItems])

  const handleToggleItem = useCallback((item: T) => {
    const bulkItem = {
      id: item.id,
      type: entityType,
      data: transform ? transform(item) : item as Record<string, unknown>,
    }
    toggleItem(bulkItem)
  }, [toggleItem, entityType, transform])

  return {
    isAllSelected,
    isPartiallySelected,
    isItemSelected,
    getSelectionCount,
    selectedItems,
    handleSelectAll,
    handleToggleItem,
    bulkActionItems,
  }
}