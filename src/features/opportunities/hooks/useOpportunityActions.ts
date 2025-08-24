import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from './useOpportunities'
import type { Opportunity, OpportunityInsert, OpportunityUpdate } from '@/types/entities'

interface UseOpportunityActionsReturn {
  // Mutations
  createOpportunityMutation: ReturnType<typeof useCreateOpportunity>
  updateOpportunityMutation: ReturnType<typeof useUpdateOpportunity>
  deleteOpportunityMutation: ReturnType<typeof useDeleteOpportunity>
  
  // Handlers
  handleCreateOpportunity: (data: any, onSuccess: () => void) => Promise<void>
  handleUpdateOpportunity: (data: any, opportunity: Opportunity, onSuccess: () => void) => Promise<void>
  handleDeleteOpportunity: (opportunity: Opportunity) => Promise<void>
}

export const useOpportunityActions = (): UseOpportunityActionsReturn => {
  const createOpportunityMutation = useCreateOpportunity()
  const updateOpportunityMutation = useUpdateOpportunity()
  const deleteOpportunityMutation = useDeleteOpportunity()

  const handleCreateOpportunity = useCallback(async (data: OpportunityInsert, onSuccess: () => void) => {
    try {
      await createOpportunityMutation.mutateAsync(data)
      onSuccess()
      toast.success('Opportunity created successfully!')
    } catch (error) {
      console.error('Failed to create opportunity:', error)
      toast.error('Failed to create opportunity. Please try again.')
    }
  }, [createOpportunityMutation])

  const handleUpdateOpportunity = useCallback(async (data: any, opportunity: Opportunity, onSuccess: () => void) => {
    try {
      // Transform form data to OpportunityUpdate by removing non-database fields
      const { principals: _principals, auto_generated_name: _auto_generated_name, ...updateData } = data
      
      await updateOpportunityMutation.mutateAsync({
        id: opportunity.id,
        updates: updateData as unknown as OpportunityUpdate
      })
      onSuccess()
      toast.success('Opportunity updated successfully!')
    } catch (error) {
      console.error('Failed to update opportunity:', error)
      toast.error('Failed to update opportunity. Please try again.')
    }
  }, [updateOpportunityMutation])

  const handleDeleteOpportunity = useCallback(async (opportunity: Opportunity) => {
    if (window.confirm(`Are you sure you want to delete the opportunity "${opportunity.name}"?`)) {
      try {
        await deleteOpportunityMutation.mutateAsync(opportunity.id)
        toast.success('Opportunity deleted successfully!')
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        toast.error('Failed to delete opportunity. Please try again.')
      }
    }
  }, [deleteOpportunityMutation])

  return {
    createOpportunityMutation,
    updateOpportunityMutation,
    deleteOpportunityMutation,
    handleCreateOpportunity,
    handleUpdateOpportunity,
    handleDeleteOpportunity
  }
}