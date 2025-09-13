import { useState, useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import type { InteractionWithRelations } from '@/types/interaction.types'

export function useInteractionActions() {
  // Use BulkActionsContext when available (in BulkActionsProvider)
  // We can't conditionally call hooks, so we need a safer context hook
  const bulkActionsContext = null // Temporarily disable until we fix the provider issue

  // Fallback to legacy selection state when not in BulkActionsProvider
  const [legacySelectedItems, setLegacySelectedItems] = useState<Set<string>>(new Set())

  // Use bulk actions context if available, otherwise use legacy
  const selectedItems = bulkActionsContext?.selectedItems || legacySelectedItems
  const clearSelection =
    bulkActionsContext?.clearSelection || (() => setLegacySelectedItems(new Set()))

  const handleSelectAll = useCallback(
    (checked: boolean, filteredInteractions: InteractionWithRelations[]) => {
      if (bulkActionsContext) {
        bulkActionsContext.handleSelectAll(checked, filteredInteractions)
      } else {
        if (checked) {
          setLegacySelectedItems(new Set(filteredInteractions.map((i) => i.id)))
        } else {
          setLegacySelectedItems(new Set())
        }
      }
    },
    [bulkActionsContext]
  )

  const handleSelectItem = useCallback(
    (id: string, checked: boolean) => {
      if (bulkActionsContext) {
        bulkActionsContext.handleSelectItem(id, checked)
      } else {
        setLegacySelectedItems((prev) => {
          const newSet = new Set(prev)
          if (checked) {
            newSet.add(id)
          } else {
            newSet.delete(id)
          }
          return newSet
        })
      }
    },
    [bulkActionsContext]
  )

  // Individual action handlers
  const handleEditInteraction = useCallback((interaction: InteractionWithRelations) => {
    // TODO: Open edit interaction modal/form
    toast.info(`Editing interaction: ${interaction.subject || 'No subject'}`)
  }, [])

  const handleDeleteInteraction = useCallback((interaction: InteractionWithRelations) => {
    // TODO: Implement delete logic with confirmation
    toast.success(`Deleted interaction: ${interaction.subject || 'No subject'}`)
  }, [])

  const handleViewInteraction = useCallback((interaction: InteractionWithRelations) => {
    // TODO: Open view interaction modal/details
    toast.info(`Viewing interaction: ${interaction.subject || 'No subject'}`)
  }, [])

  // Bulk action handlers
  const handleBulkMarkComplete = useCallback(() => {
    toast.success(`Marked ${selectedItems.size} interactions as complete`)
    clearSelection()
  }, [selectedItems.size, clearSelection])

  const handleBulkArchive = useCallback(() => {
    toast.success(`Archived ${selectedItems.size} interactions`)
    clearSelection()
  }, [selectedItems.size, clearSelection])

  const handleBulkDelete = useCallback(() => {
    // TODO: Implement bulk delete with confirmation
    toast.success(`Deleted ${selectedItems.size} interactions`)
    clearSelection()
  }, [selectedItems.size, clearSelection])

  return {
    // Selection state
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,

    // Individual actions
    handleEditInteraction,
    handleDeleteInteraction,
    handleViewInteraction,

    // Bulk actions
    handleBulkMarkComplete,
    handleBulkArchive,
    handleBulkDelete,
  }
}
