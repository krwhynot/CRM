import { useState } from 'react'
import type { InteractionWithRelations } from '@/types/entities'

export const useInteractionsPageState = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<InteractionWithRelations | null>(null)

  const openCreateDialog = () => setIsCreateDialogOpen(true)
  const closeCreateDialog = () => setIsCreateDialogOpen(false)
  
  const openEditDialog = (interaction: InteractionWithRelations) => {
    setEditingInteraction(interaction)
    setIsEditDialogOpen(true)
  }
  
  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingInteraction(null)
  }

  return {
    searchTerm,
    setSearchTerm,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingInteraction,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog
  }
}