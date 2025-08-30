import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { 
  useCreateOrganization, 
  useUpdateOrganization, 
  useDeleteOrganization 
} from './useOrganizations'
import type { Organization } from '@/types/entities'
import type { OrganizationFormInterface } from '@/types/forms/form-interfaces'

export const useOrganizationsPageActions = (
  closeCreateDialog: () => void,
  closeEditDialog: () => void,
  closeDeleteDialog: () => void
) => {
  const createOrganizationMutation = useCreateOrganization()
  const updateOrganizationMutation = useUpdateOrganization()
  const deleteOrganizationMutation = useDeleteOrganization()

  const handleCreate = useCallback(async (data: OrganizationFormInterface) => {
    try {
      const dbData = data
      
      if (!data.type) {
        throw new Error('Organization type is required but missing from form data')
      }
      
      await createOrganizationMutation.mutateAsync(dbData)
      closeCreateDialog()
      toast.success('Organization created successfully!')
    } catch (error) {
      console.error('Failed to create organization:', error)
      toast.error('Failed to create organization. Please try again.')
    }
  }, [createOrganizationMutation, closeCreateDialog])

  const handleUpdate = useCallback(async (selectedOrganization: Organization, data: OrganizationFormInterface) => {
    try {
      await updateOrganizationMutation.mutateAsync({
        id: selectedOrganization.id,
        updates: data
      })
      closeEditDialog()
      toast.success('Organization updated successfully!')
    } catch (error) {
      console.error('Failed to update organization:', error)
      toast.error('Failed to update organization. Please try again.')
    }
  }, [updateOrganizationMutation, closeEditDialog])

  const handleDelete = useCallback(async (selectedOrganization: Organization) => {
    if (!selectedOrganization) return

    try {
      await deleteOrganizationMutation.mutateAsync(selectedOrganization.id)
      closeDeleteDialog()
      toast.success('Organization deleted successfully!')
    } catch (error) {
      console.error('Failed to delete organization:', error)
      toast.error('Failed to delete organization. Please try again.')
    }
  }, [deleteOrganizationMutation, closeDeleteDialog])

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating: createOrganizationMutation.isPending,
    isUpdating: updateOrganizationMutation.isPending,
    isDeleting: deleteOrganizationMutation.isPending
  }
}