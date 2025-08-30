import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { 
  useCreateContactWithOrganization, 
  useUpdateContact, 
  useDeleteContact 
} from './useContacts'
import type { Contact, ContactUpdate } from '@/types/entities'

export const useContactsPageActions = (
  closeCreateDialog: () => void,
  closeEditDialog: () => void,
  closeDeleteDialog: () => void
) => {
  const createContactMutation = useCreateContactWithOrganization()
  const updateContactMutation = useUpdateContact()
  const deleteContactMutation = useDeleteContact()

  const handleCreate = useCallback(async (data: any) => {
    try {
      
      await createContactMutation.mutateAsync(data)
      closeCreateDialog()
      toast.success('Contact created successfully!')
    } catch (error) {
      console.error('Failed to create contact:', error)
      // Use the enhanced error message from our error utils
      const errorMessage = error instanceof Error ? error.message : 'Failed to create contact. Please try again.'
      toast.error(errorMessage)
    }
  }, [createContactMutation, closeCreateDialog])

  const handleUpdate = useCallback(async (selectedContact: Contact, data: ContactUpdate) => {
    try {
      await updateContactMutation.mutateAsync({
        id: selectedContact.id,
        updates: data
      })
      closeEditDialog()
      toast.success('Contact updated successfully!')
    } catch (error) {
      console.error('Failed to update contact:', error)
      toast.error('Failed to update contact. Please try again.')
    }
  }, [updateContactMutation, closeEditDialog])

  const handleDelete = useCallback(async (selectedContact: Contact) => {
    if (!selectedContact) return

    try {
      await deleteContactMutation.mutateAsync(selectedContact.id)
      closeDeleteDialog()
      toast.success('Contact deleted successfully!')
    } catch (error) {
      console.error('Failed to delete contact:', error)
      toast.error('Failed to delete contact. Please try again.')
    }
  }, [deleteContactMutation, closeDeleteDialog])

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending
  }
}