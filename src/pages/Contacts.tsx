import { useEffect } from 'react'
import { 
  useContacts, 
  useRefreshContacts,
  useContactsPageState,
  useContactsPageActions,
  useContactFormData,
  useContactsPageStyle,
  ContactsPageHeader,
  ContactsDataDisplay,
  ContactsDialogs
} from '@/features/contacts'
import { ContactsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { cn } from '@/lib/utils'

function ContactsPage() {
  const { data: contacts = [], isLoading, error, isError } = useContacts()
  const refreshContacts = useRefreshContacts()
  const { USE_NEW_STYLE } = useContactsPageStyle()
  
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
      <div className={cn("min-h-screen", USE_NEW_STYLE && "bg-[var(--mfb-cream)]")}>
        <div className={cn("max-w-7xl mx-auto p-6", USE_NEW_STYLE && "space-y-8")}>
          <ContactsPageHeader
            contactsCount={contacts.length}
            onAddClick={openCreateDialog}
            useNewStyle={USE_NEW_STYLE}
          />
          
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
        </div>
      </div>
    </ContactsErrorBoundary>
  )
}

export default ContactsPage
