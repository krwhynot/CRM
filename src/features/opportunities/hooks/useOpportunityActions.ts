import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from './useOpportunities'
import type { Opportunity, OpportunityInsert, OpportunityUpdate, OpportunityFormData } from '@/types/entities'

interface UseOpportunityActionsReturn {
  // Mutations
  createOpportunityMutation: ReturnType<typeof useCreateOpportunity>
  updateOpportunityMutation: ReturnType<typeof useUpdateOpportunity>
  deleteOpportunityMutation: ReturnType<typeof useDeleteOpportunity>
  
  // Handlers
  handleCreateOpportunity: (data: OpportunityFormData, onSuccess: () => void) => Promise<void>
  handleUpdateOpportunity: (data: OpportunityFormData, opportunity: Opportunity, onSuccess: () => void) => Promise<void>
  handleDeleteOpportunity: (opportunity: Opportunity) => Promise<void>
}

export const useOpportunityActions = (): UseOpportunityActionsReturn => {
  const createOpportunityMutation = useCreateOpportunity()
  const updateOpportunityMutation = useUpdateOpportunity()
  const deleteOpportunityMutation = useDeleteOpportunity()

  const handleCreateOpportunity = useCallback(async (data: OpportunityFormData, onSuccess: () => void) => {
    try {
      // Transform form data to database format (following interaction pattern)
      const opportunityData: Omit<OpportunityInsert, 'created_by' | 'updated_by'> = {
        name: data.name,
        organization_id: data.organization_id,
        estimated_value: data.estimated_value || null,
        stage: data.stage,
        status: 'Active', // Add missing required field with default
        contact_id: data.contact_id || null,
        estimated_close_date: data.estimated_close_date || null,
        description: data.description || null,
        notes: data.notes || null,
        // Optional fields with proper null handling
        priority: data.priority || null,
        probability: data.probability || null,
        opportunity_context: data.opportunity_context || null,
        principal_organization_id: data.principal_id || null,
        // Remove non-database fields: principals, auto_generated_name
      }
      
      await createOpportunityMutation.mutateAsync(opportunityData)
      onSuccess()
      toast.success('Opportunity created successfully!')
    } catch (error: unknown) {
      // Handle opportunity creation errors
      
      // Handle specific constraint violation errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : null
      
      if (errorCode === '23505' && errorMessage.includes('uq_opp_org_name_active')) {
        toast.error('An opportunity with this name already exists for the selected organization. Please choose a different name.')
      } else {
        toast.error('Failed to create opportunity. Please try again.')
      }
    }
  }, [createOpportunityMutation])

  const handleUpdateOpportunity = useCallback(async (data: OpportunityFormData, opportunity: Opportunity, onSuccess: () => void) => {
    try {
      // Transform form data to OpportunityUpdate by removing non-database fields
      const { principals: _, auto_generated_name: __, ...updateData } = data
      
      // Remove form fields that shouldn't be included in update
      
      await updateOpportunityMutation.mutateAsync({
        id: opportunity.id,
        updates: updateData as unknown as OpportunityUpdate
      })
      onSuccess()
      toast.success('Opportunity updated successfully!')
    } catch (error: unknown) {
      // Handle opportunity update errors
      
      // Handle specific constraint violation errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : null
      
      if (errorCode === '23505' && errorMessage.includes('uq_opp_org_name_active')) {
        toast.error('An opportunity with this name already exists for the selected organization. Please choose a different name.')
      } else {
        toast.error('Failed to update opportunity. Please try again.')
      }
    }
  }, [updateOpportunityMutation])

  const handleDeleteOpportunity = useCallback(async (opportunity: Opportunity) => {
    if (window.confirm(`Are you sure you want to delete the opportunity "${opportunity.name}"?`)) {
      try {
        await deleteOpportunityMutation.mutateAsync(opportunity.id)
        toast.success('Opportunity deleted successfully!')
      } catch (error) {
        // Handle opportunity deletion errors
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