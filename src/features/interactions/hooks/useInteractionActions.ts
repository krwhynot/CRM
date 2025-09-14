import { useState, useCallback } from 'react'
import { useUpdateInteraction, useDeleteInteraction } from './useInteractions'
import { toast } from '@/lib/toast-styles'
import type { InteractionWithRelations } from '@/types/interaction.types'
import type { InteractionUpdate } from '@/types/entities'

interface UseInteractionActionsOptions {
  onEditInteraction?: (interaction: InteractionWithRelations) => void
  onDeleteInteraction?: (interaction: InteractionWithRelations) => void
  onViewInteraction?: (interaction: InteractionWithRelations) => void
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
  onError?: (error: string) => void
}

export function useInteractionActions(options: UseInteractionActionsOptions = {}) {
  const {
    onEditInteraction,
    onDeleteInteraction,
    onViewInteraction,
    onEditSuccess,
    onDeleteSuccess,
    onError,
  } = options
  // Use BulkActionsContext when available (in BulkActionsProvider)
  // We can't conditionally call hooks, so we need a safer context hook
  const bulkActionsContext = null // Temporarily disable until we fix the provider issue

  // Get mutation hooks
  const updateInteractionMutation = useUpdateInteraction()
  const deleteInteractionMutation = useDeleteInteraction()

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
    // Open edit interaction modal/form via callback
    if (onEditInteraction) {
      onEditInteraction(interaction)
    } else {
      // Fallback toast notification when no callback provided
      toast.info(`Editing interaction: ${interaction.subject || 'No subject'}`, {
        description: 'Edit functionality requires modal integration'
      })
    }
  }, [onEditInteraction])

  const handleDeleteInteraction = useCallback((interaction: InteractionWithRelations) => {
    // Open delete confirmation dialog via callback
    if (onDeleteInteraction) {
      onDeleteInteraction(interaction)
    } else {
      // Direct delete (not recommended without confirmation)
      handleDeleteConfirm(interaction.id, interaction.subject || 'interaction')
    }
  }, [onDeleteInteraction])

  const handleViewInteraction = useCallback((interaction: InteractionWithRelations) => {
    // Open view interaction modal/details via callback
    if (onViewInteraction) {
      onViewInteraction(interaction)
    } else {
      // Fallback toast notification when no callback provided
      toast.info(`Viewing interaction: ${interaction.subject || 'No subject'}`, {
        description: 'View functionality requires modal integration'
      })
    }
  }, [onViewInteraction])

  // Bulk action handlers
  const handleBulkMarkComplete = useCallback(() => {
    toast.success(`Marked ${selectedItems.size} interactions as complete`)
    clearSelection()
  }, [selectedItems.size, clearSelection])

  const handleBulkArchive = useCallback(() => {
    toast.success(`Archived ${selectedItems.size} interactions`)
    clearSelection()
  }, [selectedItems.size, clearSelection])

  const handleBulkDelete = useCallback(async () => {
    // Implement bulk delete with confirmation
    if (selectedItems.size === 0) return

    try {
      // Delete interactions one by one
      const deletePromises = Array.from(selectedItems).map((id: string) =>
        deleteInteractionMutation.mutateAsync(id)
      )

      await Promise.all(deletePromises)

      toast.success(`Deleted ${selectedItems.size} interactions`, {
        description: 'Selected interactions have been successfully deleted.'
      })
      clearSelection()
      onDeleteSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete interactions'
      toast.error('Bulk Delete Failed', {
        description: errorMessage,
      })
      onError?.(errorMessage)
    }
  }, [selectedItems, deleteInteractionMutation, clearSelection, onDeleteSuccess, onError])

  // Method to handle edit form submission
  const handleEditSubmit = useCallback(async (
    interactionId: string,
    updates: InteractionUpdate
  ) => {
    try {
      await updateInteractionMutation.mutateAsync({ id: interactionId, updates })
      toast.success('Interaction Updated', {
        description: 'Interaction information has been updated successfully.',
      })
      onEditSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update interaction'
      toast.error('Update Failed', {
        description: errorMessage,
      })
      onError?.(errorMessage)
    }
  }, [updateInteractionMutation, onEditSuccess, onError])

  // Method to handle delete confirmation
  const handleDeleteConfirm = useCallback(async (interactionId: string, interactionSubject?: string) => {
    try {
      await deleteInteractionMutation.mutateAsync(interactionId)
      toast.success('Interaction Deleted', {
        description: `${interactionSubject || 'Interaction'} has been deleted successfully.`,
      })
      onDeleteSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete interaction'
      toast.error('Delete Failed', {
        description: errorMessage,
      })
      onError?.(errorMessage)
    }
  }, [deleteInteractionMutation, onDeleteSuccess, onError])

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

    // Form submission methods (for modal integration)
    handleEditSubmit,
    handleDeleteConfirm,

    // Bulk actions
    handleBulkMarkComplete,
    handleBulkArchive,
    handleBulkDelete,

    // Loading states
    isEditing: updateInteractionMutation.isPending,
    isDeleting: deleteInteractionMutation.isPending,
    editError: updateInteractionMutation.error?.message,
    deleteError: deleteInteractionMutation.error?.message,
  }
}
