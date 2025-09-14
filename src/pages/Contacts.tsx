import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  useContacts,
  useRefreshContacts,
  useContactsPageState,
  useContactsPageActions,
  ContactsDataDisplay,
  ContactsDialogs,
} from '@/features/contacts'
import { ContactsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { PageLayout } from '@/components/layout'
import { usePageLayout } from '@/hooks'

function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
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
    closeDeleteDialog,
  } = useContactsPageState()

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useContactsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  // Handle URL action parameters (e.g., ?action=create)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      openCreateDialog()
      // Remove the action parameter from URL to clean up
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('action')
        return newParams
      })
    }
  }, [searchParams, setSearchParams, openCreateDialog])

  // Use the page layout hook for slot composition
  const { pageLayoutProps } = usePageLayout({
    entityType: 'CONTACT',
    entityCount: contacts.length,
    onAddClick: openCreateDialog,
  })

  return (
    <ContactsErrorBoundary>
      <PageLayout {...pageLayoutProps}>
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
      </PageLayout>
    </ContactsErrorBoundary>
  )
}

export default ContactsPage
