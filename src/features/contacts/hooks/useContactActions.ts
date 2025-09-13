import { useCallback } from 'react'
import { useContactsSelection } from './useContactsSelection'
import { useDeleteContact, useUpdateContact } from './useContacts'
import { toast } from 'sonner'
import { useBulkActionsContext } from '@/components/shared/BulkActions/BulkActionsProvider'
import type { Contact } from '@/types/entities'

// Extended contact interface with weekly context and decision authority tracking
interface ContactWithWeeklyContext extends Contact {
  decision_authority?: string
  decision_authority_level?: 'high' | 'medium' | 'low'
  purchase_influence?: string
  purchase_influence_score?: number
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean
  high_value_contact?: boolean
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean
  is_primary_contact?: boolean
  organization?: {
    name: string
    type: string
    segment?: string
  }
}

export function useContactActions() {
  // Try to use BulkActionsContext when available
  let bulkActionsContext: ReturnType<
    typeof useBulkActionsContext<ContactWithWeeklyContext>
  > | null = null
  try {
    bulkActionsContext = useBulkActionsContext<ContactWithWeeklyContext>()
  } catch {
    // Context not available, will use legacy selection
  }

  // Fallback to legacy selection hook when not in BulkActionsProvider
  const legacySelection = useContactsSelection()

  // Use bulk actions context if available, otherwise use legacy
  const selectedItems =
    bulkActionsContext?.selection?.selectedItems ||
    legacySelection?.selectedItems ||
    new Set<string>()
  const handleSelectAll =
    bulkActionsContext?.selection?.handleSelectAll || legacySelection?.handleSelectAll || (() => {})
  const handleSelectItem =
    bulkActionsContext?.selection?.handleSelectItem ||
    legacySelection?.handleSelectItem ||
    (() => {})
  const clearSelection =
    bulkActionsContext?.selection?.clearSelection || legacySelection?.clearSelection || (() => {})

  // Mutation hooks
  const deleteContactsMutation = useDeleteContact()
  const updateContactsMutation = useUpdateContact()

  const handleEditContact = useCallback((contact: ContactWithWeeklyContext) => {
    // TODO: Open edit contact modal/form
    toast('Edit Contact', {
      description: `Editing contact: ${contact.first_name} ${contact.last_name}`,
    })
  }, [])

  const handleDeleteContact = useCallback(
    async (contact: ContactWithWeeklyContext) => {
      try {
        await deleteContactsMutation.mutateAsync(contact.id)
        toast('Contact Deleted', {
          description: `${contact.first_name} ${contact.last_name} has been deleted successfully.`,
        })
      } catch (error) {
        toast.error('Delete Failed', {
          description: 'Failed to delete contact. Please try again.',
        })
        console.error('Delete contact error:', error)
      }
    },
    [deleteContactsMutation]
  )

  const handleBulkDelete = useCallback(
    async (contacts: ContactWithWeeklyContext[]) => {
      try {
        // Delete contacts one by one
        for (const contact of contacts) {
          await deleteContactsMutation.mutateAsync(contact.id)
        }
        clearSelection()
        toast('Contacts Deleted', {
          description: `${contacts.length} contact(s) deleted successfully.`,
        })
      } catch (error) {
        toast.error('Bulk Delete Failed', {
          description: 'Failed to delete selected contacts. Please try again.',
        })
        console.error('Bulk delete error:', error)
      }
    },
    [deleteContactsMutation, clearSelection]
  )

  const handleBulkUpdate = useCallback(
    async (contacts: ContactWithWeeklyContext[], updates: Partial<ContactWithWeeklyContext>) => {
      try {
        // Update contacts one by one
        for (const contact of contacts) {
          await updateContactsMutation.mutateAsync({ id: contact.id, ...updates })
        }
        clearSelection()
        toast('Contacts Updated', {
          description: `${contacts.length} contact(s) updated successfully.`,
        })
      } catch (error) {
        toast.error('Bulk Update Failed', {
          description: 'Failed to update selected contacts. Please try again.',
        })
        console.error('Bulk update error:', error)
      }
    },
    [updateContactsMutation, clearSelection]
  )

  return {
    // Selection state
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,

    // Individual actions
    handleEditContact,
    handleDeleteContact,

    // Bulk actions
    handleBulkDelete,
    handleBulkUpdate,

    // Loading states
    isDeleting: deleteContactsMutation.isPending,
    isUpdating: updateContactsMutation.isPending,
  }
}
