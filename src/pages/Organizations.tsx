import { useEffect } from 'react'
import { 
  useOrganizations, 
  useRefreshOrganizations,
  useOrganizationsPageState,
  useOrganizationsPageActions,
  useOrganizationFormData,
  OrganizationsDataDisplay,
  OrganizationDialogs
} from '@/features/organizations'
import { OrganizationsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { OrganizationManagementTemplate } from '@/components/templates/EntityManagementTemplate'

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
    closeDeleteDialog
  } = useOrganizationsPageState()
  
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting
  } = useOrganizationsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)
  
  const { initialData: editFormInitialData } = useOrganizationFormData(selectedOrganization)

  // Debug: Track Organizations page data state
  useEffect(() => {
    console.log('📄 [OrganizationsPage] Data state:', {
      isLoading,
      isError,
      organizationsCount: organizations.length,
      error: error?.message
    })
  }, [isLoading, isError, organizations.length, error])

  return (
    <OrganizationsErrorBoundary>
      <OrganizationManagementTemplate
        entityCount={organizations.length}
        onAddClick={openCreateDialog}
      >
        <OrganizationsDataDisplay
          isLoading={isLoading}
          isError={isError}
          error={error}
          organizations={organizations}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onRefresh={refreshOrganizations}
        />
        
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
      </OrganizationManagementTemplate>
    </OrganizationsErrorBoundary>
  )
}

export default OrganizationsPage
