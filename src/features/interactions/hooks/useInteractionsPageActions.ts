import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-styles'
import { COPY } from '@/lib/copy'
import type {
  InteractionFormData,
  InteractionWithRelations,
  InteractionInsert,
  InteractionUpdate,
} from '@/types/interaction.types'

export function useInteractionsPageActions(
  closeCreateDialog: () => void,
  closeEditDialog: () => void,
  closeDeleteDialog: () => void
) {
  const queryClient = useQueryClient()

  // Create interaction mutation
  const createMutation = useMutation({
    mutationFn: async (data: InteractionFormData): Promise<InteractionWithRelations> => {
      const insertData: InteractionInsert = {
        type: data.type as any,
        interaction_date: data.interaction_date,
        subject: data.subject,
        description: data.description || null,
        notes: data.notes || null,
        duration_minutes: data.duration_minutes || null,
        location: data.location || null,
        outcome: (data.outcome as any) || null,
        follow_up_required: data.follow_up_required || false,
        follow_up_date: data.follow_up_date || null,
        follow_up_notes: data.follow_up_notes || null,
        opportunity_id: data.opportunity_id,
        contact_id: data.contact_id || null,
        organization_id: data.organization_id || null,
      }

      const { data: interaction, error } = await supabase
        .from('interactions')
        .insert(insertData)
        .select(
          `
          *,
          contact:contacts(*),
          organization:organizations(*),
          opportunity:opportunities(*)
        `
        )
        .single()

      if (error) throw error
      return interaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      queryClient.invalidateQueries({ queryKey: ['interaction-timeline'] })
      toast.success(COPY.SUCCESS.INTERACTION_CREATED)
      closeCreateDialog()
    },
    onError: (error) => {
      console.error('Failed to create interaction:', error)
      toast.error(COPY.ERRORS.INTERACTION_CREATE)
    },
  })

  // Update interaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: InteractionFormData
    }): Promise<InteractionWithRelations> => {
      const updateData: InteractionUpdate = {
        type: data.type as any,
        interaction_date: data.interaction_date,
        subject: data.subject,
        description: data.description || null,
        notes: data.notes || null,
        duration_minutes: data.duration_minutes || null,
        location: data.location || null,
        outcome: (data.outcome as any) || null,
        follow_up_required: data.follow_up_required || false,
        follow_up_date: data.follow_up_date || null,
        follow_up_notes: data.follow_up_notes || null,
        opportunity_id: data.opportunity_id,
        contact_id: data.contact_id || null,
        organization_id: data.organization_id || null,
        updated_at: new Date().toISOString(),
      }

      const { data: interaction, error } = await supabase
        .from('interactions')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          contact:contacts(*),
          organization:organizations(*),
          opportunity:opportunities(*)
        `
        )
        .single()

      if (error) throw error
      return interaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      queryClient.invalidateQueries({ queryKey: ['interaction-timeline'] })
      toast.success(COPY.SUCCESS.INTERACTION_UPDATED)
      closeEditDialog()
    },
    onError: (error) => {
      console.error('Failed to update interaction:', error)
      toast.error(COPY.ERRORS.INTERACTION_UPDATE)
    },
  })

  // Delete interaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('interactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      queryClient.invalidateQueries({ queryKey: ['interaction-timeline'] })
      toast.success(COPY.SUCCESS.INTERACTION_DELETED)
      closeDeleteDialog()
    },
    onError: (error) => {
      console.error('Failed to delete interaction:', error)
      toast.error(COPY.ERRORS.INTERACTION_DELETE)
    },
  })

  // Action handlers
  const handleCreate = useCallback(
    (data: InteractionFormData) => {
      createMutation.mutate(data)
    },
    [createMutation]
  )

  const handleUpdate = useCallback(
    (interaction: InteractionWithRelations, data: InteractionFormData) => {
      updateMutation.mutate({ id: interaction.id, data })
    },
    [updateMutation]
  )

  const handleDelete = useCallback(
    (interaction: InteractionWithRelations) => {
      deleteMutation.mutate(interaction.id)
    },
    [deleteMutation]
  )

  return {
    // Mutation handlers
    handleCreate,
    handleUpdate,
    handleDelete,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation objects for additional control
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
