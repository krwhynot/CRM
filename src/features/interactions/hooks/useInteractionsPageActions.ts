import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { 
  useCreateInteraction, 
  useUpdateInteraction, 
  useDeleteInteraction 
} from './useInteractions'
import type { InteractionWithRelations, InteractionUpdate } from '@/types/entities'

export const useInteractionsPageActions = (
  closeCreateDialog: () => void,
  closeEditDialog: () => void
) => {
  const createInteractionMutation = useCreateInteraction()
  const updateInteractionMutation = useUpdateInteraction()
  const deleteInteractionMutation = useDeleteInteraction()

  const handleCreate = useCallback(async (data: any) => {
    try {
      const interactionData = {
        ...data,
        follow_up_date: data.follow_up_date && typeof data.follow_up_date === 'string' && data.follow_up_date.trim() !== '' ? data.follow_up_date : null,
        follow_up_required: Boolean(data.follow_up_required)
      } as any
      
      console.log('Submitting interaction data:', interactionData)
      await createInteractionMutation.mutateAsync(interactionData)
      closeCreateDialog()
      toast.success('Interaction created successfully!')
    } catch (error) {
      console.error('Failed to create interaction:', error)
      
      if (error instanceof Error) {
        toast.error(`Failed to create interaction: ${error.message}`)
      } else {
        toast.error('Failed to create interaction. Please try again.')
      }
    }
  }, [createInteractionMutation, closeCreateDialog])

  const handleUpdate = useCallback(async (editingInteraction: InteractionWithRelations, data: any) => {
    try {
      await updateInteractionMutation.mutateAsync({
        id: editingInteraction.id,
        updates: data as InteractionUpdate
      })
      closeEditDialog()
      toast.success('Interaction updated successfully!')
    } catch (error) {
      console.error('Failed to update interaction:', error)
      toast.error('Failed to update interaction. Please try again.')
    }
  }, [updateInteractionMutation, closeEditDialog])

  const handleDelete = useCallback(async (interaction: InteractionWithRelations) => {
    if (window.confirm(`Are you sure you want to delete the interaction "${interaction.subject}"?`)) {
      try {
        await deleteInteractionMutation.mutateAsync(interaction.id)
        toast.success('Interaction deleted successfully!')
      } catch (error) {
        console.error('Failed to delete interaction:', error)
        toast.error('Failed to delete interaction. Please try again.')
      }
    }
  }, [deleteInteractionMutation])

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating: createInteractionMutation.isPending,
    isUpdating: updateInteractionMutation.isPending
  }
}