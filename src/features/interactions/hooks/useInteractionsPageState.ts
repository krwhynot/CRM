import { useState, useCallback } from 'react'
import { useEntityPageState } from '@/hooks/useEntityPageState'
import type { InteractionWithRelations } from '@/types/interaction.types'

export function useInteractionsPageState() {
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity: selectedInteraction,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useEntityPageState<InteractionWithRelations>()

  // Additional state specific to interactions (not covered by generic hook)
  const [viewingInteraction, setViewingInteraction] = useState<InteractionWithRelations | null>(null)

  const handleViewInteraction = useCallback((interaction: InteractionWithRelations) => {
    setViewingInteraction(interaction)
    // Could open a detail modal or navigate to detail page
    // For now, we'll just set the viewing state
  }, [])

  return {
    // Dialog states
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,

    // Selected interaction (standardized naming via alias)
    selectedInteraction,
    viewingInteraction,

    // Dialog actions
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,

    // View handler
    handleViewInteraction,

    // Setters for external use (maintaining backward compatibility)
    setIsCreateDialogOpen: () => {}, // Generic hook doesn't expose setters
    setIsEditDialogOpen: () => {},
    setIsDeleteDialogOpen: () => {},
    setSelectedInteraction: () => {}, // Generic hook doesn't expose setter
    setViewingInteraction,
  }
}