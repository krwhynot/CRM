import React, { useEffect } from 'react'
import { 
  useOrganizations, 
  useRefreshOrganizations,
  useOrganizationsPageState,
  useOrganizationsPageActions,
  useOrganizationFormData,
  useOrganizationsPageStyle,
  OrganizationsPageHeader,
  OrganizationsDataDisplay,
  OrganizationDialogs
} from '@/features/organizations'
import { OrganizationsErrorBoundary } from '@/components/shared/feedback/error-boundaries/QueryErrorBoundary'
import { cn } from '@/lib/utils'

function OrganizationsPage() {
  const { data: organizations = [], isLoading, error, isError } = useOrganizations()
  const refreshOrganizations = useRefreshOrganizations()
  const { USE_NEW_STYLE } = useOrganizationsPageStyle()
  
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
      <div className={cn("min-h-screen", USE_NEW_STYLE && "bg-[var(--mfb-cream)]")}>
        <div className={cn("max-w-7xl mx-auto p-6", USE_NEW_STYLE && "space-y-8")}>
          <OrganizationsPageHeader
            organizationsCount={organizations.length}
            onAddClick={openCreateDialog}
            useNewStyle={USE_NEW_STYLE}
          />
          
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
        </div>
      </div>
    </OrganizationsErrorBoundary>
  )
}

export default OrganizationsPage
