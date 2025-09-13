import { useState, useCallback } from 'react'
import { useDeleteOpportunity } from './useOpportunities'
import { useOpportunitiesSelection } from './useOpportunitiesSelection'
import { toast } from '@/lib/toast-styles'
import { useBulkActionsContext } from '@/components/shared/BulkActions/BulkActionsProvider'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

export function useOpportunityActions() {
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Try to use BulkActionsContext when available
  let bulkActionsContext: ReturnType<
    typeof useBulkActionsContext<OpportunityWithLastActivity>
  > | null = null
  try {
    bulkActionsContext = useBulkActionsContext<OpportunityWithLastActivity>()
  } catch {
    // Context not available, will use legacy selection
  }

  // Fallback to legacy selection hook when not in BulkActionsProvider
  const legacySelection = useOpportunitiesSelection()

  // Use bulk actions context if available, otherwise use legacy
  const selectedItems =
    bulkActionsContext?.selection?.selectedItems ||
    legacySelection?.selectedItems ||
    new Set<string>()
  const handleSelectAll =
    bulkActionsContext?.selection?.handleSelectAll || legacySelection?.handleSelectAll || (() => {})
  const handleSelectItem =
    bulkActionsContext?.selection?.handleSelectItem ||
    legacySelection?.handleSelectItem ||
    (() => {})
  const clearSelection =
    bulkActionsContext?.selection?.clearSelection || legacySelection?.clearSelection || (() => {})

  // Mutations
  const deleteOpportunity = useDeleteOpportunity()

  // Convert Set to Array for easier manipulation
  const selectedIds = Array.from(selectedItems)

  // Individual action handlers
  const handleEditOpportunity = useCallback((opportunity: OpportunityWithLastActivity) => {
    // TODO: Open edit opportunity modal/form
    toast('Edit Opportunity', {
      description: `Editing opportunity: ${opportunity.name}`,
    })
  }, [])

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    const results = []
    let successCount = 0
    let errorCount = 0

    try {
      // Process deletions sequentially for maximum safety
      for (const opportunityId of selectedIds) {
        try {
          await deleteOpportunity.mutateAsync(opportunityId)
          results.push({ id: opportunityId, status: 'success' })
          successCount++
        } catch (error) {
          // Log error to results for user feedback
          results.push({
            id: opportunityId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully archived ${successCount} opportunit${successCount !== 1 ? 'ies' : 'y'}`
        )
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} opportunities, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} opportunit${errorCount !== 1 ? 'ies' : 'y'}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        clearSelection()
      }
    } catch (error) {
      // Handle unexpected errors during bulk delete operation
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Single opportunity delete handler
  const handleDeleteOpportunity = async (opportunity: OpportunityWithLastActivity) => {
    try {
      await deleteOpportunity.mutateAsync(opportunity.id)
      toast.success('Opportunity archived successfully')
    } catch (error) {
      toast.error('Failed to archive opportunity')
    }
  }

  return {
    // Selection state
    selectedItems,
    selectedIds,

    // Selection handlers
    handleSelectAll,
    handleSelectItem,
    clearSelection,

    // Individual actions
    handleEditOpportunity,
    handleDeleteOpportunity,

    // Bulk delete state
    deleteDialogOpen,
    setDeleteDialogOpen,
    // Bulk delete handlers
    handleBulkDelete,
    handleConfirmDelete,

    // Loading states
    isDeleting: deleteOpportunity.isPending,
  }
}
