import { useEffect } from 'react'
import { 
  useContacts, 
  useRefreshContacts,
  useContactsPageState,
  useContactsPageActions,
  useContactFormData,
  ContactsDataDisplay,
  ContactsDialogs
} from '@/features/contacts'
import { ContactsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { ContactManagementTemplate } from '@/components/templates/EntityManagementTemplate'

function ContactsPage() {
  const { data: contacts = [], isLoading, error, isError } = useContacts()
  const refreshContacts = useRefreshContacts()
  
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedContact,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog
  } = useContactsPageState()
  
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting
  } = useContactsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)
  
  const { initialData: editFormInitialData } = useContactFormData(selectedContact)

  // Debug: Track Contacts page data state
  useEffect(() => {
    console.log('📄 [ContactsPage] Data state:', {
      isLoading,
      isError,
      contactsCount: contacts.length,
      error: error?.message
    })
  }, [isLoading, isError, contacts.length, error])

  return (
    <ContactsErrorBoundary>
      <ContactManagementTemplate
        entityCount={contacts.length}
        onAddClick={openCreateDialog}
      >
        <ContactsDataDisplay
          isLoading={isLoading}
          isError={isError}
          error={error}
          contacts={contacts}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onRefresh={refreshContacts}
        />
        
        <ContactsDialogs
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          selectedContact={selectedContact}
          onCreateSubmit={handleCreate}
          onEditSubmit={handleUpdate}
          onDeleteConfirm={handleDelete}
          onCreateDialogChange={closeCreateDialog}
          onEditDialogChange={closeEditDialog}
          onDeleteDialogChange={closeDeleteDialog}
          onDeleteCancel={closeDeleteDialog}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </ContactManagementTemplate>
    </ContactsErrorBoundary>
  )
}

export default ContactsPage
