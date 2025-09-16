import {
  useOrganizations,
  useRefreshOrganizations,
  useOrganizationsPageState,
  useOrganizationsPageActions,
  useOrganizationFormData,
  OrganizationsDataDisplay,
  OrganizationDialogs,
} from '@/features/organizations'
// TODO: Re-implement error boundary after component consolidation
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function OrganizationsPage() {
  const { data: organizations = [], isLoading, error, isError } = useOrganizations()
  const refreshOrganizations = useRefreshOrganizations()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedOrganization,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useOrganizationsPageState()

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useOrganizationsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  const { initialData: editFormInitialData } = useOrganizationFormData(selectedOrganization)

  return (
    <FilterLayoutProvider>
      <PageLayout>
          <PageHeader
            title="Organizations"
            description={`Manage ${organizations.length} organizations in your CRM`}
            action={{
              label: "Add Organization",
              onClick: openCreateDialog
            }}
          />

          <ContentSection>
            <OrganizationsDataDisplay
              isLoading={isLoading}
              isError={isError}
              error={error}
              organizations={organizations}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onRefresh={refreshOrganizations}
            />
          </ContentSection>

          <OrganizationDialogs
            isCreateDialogOpen={isCreateDialogOpen}
            isEditDialogOpen={isEditDialogOpen}
            isDeleteDialogOpen={isDeleteDialogOpen}
            selectedOrganization={selectedOrganization}
            editFormInitialData={editFormInitialData}
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

export default OrganizationsPage
