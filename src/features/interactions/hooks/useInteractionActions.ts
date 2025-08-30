import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { useCreateInteraction, useUpdateInteraction, useDeleteInteraction } from './useInteractions'
import type { InteractionInsert, InteractionWithRelations } from '@/types/entities'
import type { InteractionFormData } from '@/types/interaction.types'

interface UseInteractionActionsReturn {
  // Mutations
  createInteractionMutation: ReturnType<typeof useCreateInteraction>
  updateInteractionMutation: ReturnType<typeof useUpdateInteraction>
  deleteInteractionMutation: ReturnType<typeof useDeleteInteraction>
  
  // Handlers
  handleCreateInteraction: (data: InteractionFormData, selectedOpportunityId: string, onSuccess: () => void) => Promise<void>
  handleUpdateInteraction: (data: InteractionFormData, editingInteraction: InteractionWithRelations, onSuccess: () => void) => Promise<void>
  handleDeleteInteraction: (interaction: InteractionWithRelations) => Promise<void>
  handleInteractionItemClick: (interaction: InteractionWithRelations) => void
}

export const useInteractionActions = (): UseInteractionActionsReturn => {
  const createInteractionMutation = useCreateInteraction()
  const updateInteractionMutation = useUpdateInteraction()
  const deleteInteractionMutation = useDeleteInteraction()

  const handleCreateInteraction = useCallback(async (data: InteractionFormData, selectedOpportunityId: string, onSuccess: () => void) => {
    try {
      // Map form data to database format
      const interactionData: Omit<InteractionInsert, 'created_by' | 'updated_by'> = {
        opportunity_id: selectedOpportunityId,
        interaction_date: data.interaction_date,
        subject: data.subject,
        type: data.type,
        description: data.notes || null, // Map notes to description
        follow_up_required: data.follow_up_required || false,
        follow_up_date: data.follow_up_date || null
      }
      
      await createInteractionMutation.mutateAsync(interactionData)
      onSuccess()
      toast.success('Activity logged successfully!')
    } catch (error) {
      // Handle interaction creation errors
      toast.error('Failed to log activity. Please try again.')
    }
  }, [createInteractionMutation])

  const handleUpdateInteraction = useCallback(async (data: InteractionFormData, editingInteraction: InteractionWithRelations, onSuccess: () => void) => {
    try {
      const updateData = {
        interaction_date: data.interaction_date,
        subject: data.subject,
        type: data.type,
        description: data.notes || null, // Map notes to description
        follow_up_required: data.follow_up_required || false,
        follow_up_date: data.follow_up_date || null
      }
      
      await updateInteractionMutation.mutateAsync({
        id: editingInteraction.id,
        updates: updateData
      })
      onSuccess()
      toast.success('Activity updated successfully!')
    } catch (error) {
      // Handle interaction update errors
      toast.error('Failed to update activity. Please try again.')
    }
  }, [updateInteractionMutation])

  const handleDeleteInteraction = useCallback(async (interaction: InteractionWithRelations) => {
    if (window.confirm(`Are you sure you want to delete this ${interaction.type}?`)) {
      try {
        await deleteInteractionMutation.mutateAsync(interaction.id)
        toast.success('Activity deleted successfully!')
      } catch (error) {
        // Handle interaction deletion errors
        toast.error('Failed to delete activity. Please try again.')
      }
    }
  }, [deleteInteractionMutation])

  const handleInteractionItemClick = useCallback(() => {
    // For now, just handle the click - could be used for quick views in the future
  }, [])

  return {
    createInteractionMutation,
    updateInteractionMutation,
    deleteInteractionMutation,
    handleCreateInteraction,
    handleUpdateInteraction,
    handleDeleteInteraction,
    handleInteractionItemClick
  }
}