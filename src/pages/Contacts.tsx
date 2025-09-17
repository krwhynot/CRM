import {
  useContacts,
  useRefreshContacts,
  useContactsPageActions,
  ContactsList,
  ContactsDialogs,
} from '@/features/contacts'
import { useEntityPageState } from '@/hooks/useEntityPageState'
import type { Contact } from '@/types/entities'
// TODO: Re-implement error boundary after component consolidation
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function ContactsPage() {
  const { data: contacts = [], isLoading, error, isError } = useContacts()
  const refreshContacts = useRefreshContacts()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity: selectedContact,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useEntityPageState<Contact>()

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useContactsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  return (
    <FilterLayoutProvider>
      <PageLayout>
        <PageHeader
          title="Contacts"
          description={`Manage ${contacts.length} contacts in your CRM`}
          action={{
            label: 'Add Contact',
            onClick: openCreateDialog,
          }}
        />

        <ContentSection>
          <ContactsList
            contacts={contacts}
            loading={isLoading}
            isError={isError}
            error={error}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onRefresh={refreshContacts}
          />
        </ContentSection>

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
    </FilterLayoutProvider>
  )
}

export default ContactsPage
