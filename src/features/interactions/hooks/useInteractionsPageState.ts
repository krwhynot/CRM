import { useState, useCallback } from 'react'
import type { InteractionWithRelations } from '@/types/interaction.types'

export function useInteractionsPageState() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInteraction, setSelectedInteraction] = useState<InteractionWithRelations | null>(null)
  const [viewingInteraction, setViewingInteraction] = useState<InteractionWithRelations | null>(null)

  const openCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  const closeCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false)
  }, [])

  const openEditDialog = useCallback((interaction: InteractionWithRelations) => {
    setSelectedInteraction(interaction)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false)
    setSelectedInteraction(null)
  }, [])

  const openDeleteDialog = useCallback((interaction: InteractionWithRelations) => {
    setSelectedInteraction(interaction)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setSelectedInteraction(null)
  }, [])

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
    
    // Selected interaction
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
    
    // Setters for external use
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setSelectedInteraction,
    setViewingInteraction,
  }
}