import {
  useInteractions,
  InteractionsDataDisplay,
  InteractionDialogs,
} from '@/features/interactions'
import { useInteractionsPageState } from '@/features/interactions/hooks/useInteractionsPageState'
import { useInteractionsPageActions } from '@/features/interactions/hooks/useInteractionsPageActions'
import { QueryErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { EntityManagementTemplate } from '@/components/templates/EntityManagementTemplate'

function InteractionsPage() {
  const { data: interactions = [], isLoading, error, isError, refetch } = useInteractions()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedInteraction,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleViewInteraction,
  } = useInteractionsPageState()

  const { 
    handleCreate, 
    handleUpdate, 
    handleDelete, 
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useInteractionsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)


  const refreshInteractions = () => {
    refetch()
  }

  return (
    <QueryErrorBoundary>
      <EntityManagementTemplate
        entityType="INTERACTION"
        entityCount={interactions.length}
        onAddClick={openCreateDialog}
      >
        <InteractionsDataDisplay
          isLoading={isLoading}
          isError={isError}
          error={error}
          interactions={interactions}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onView={handleViewInteraction}
          onRefresh={refreshInteractions}
        />

        <InteractionDialogs
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          editingInteraction={selectedInteraction}
          onCreateSubmit={handleCreate}
          onEditSubmit={handleUpdate}
          onCreateDialogChange={closeCreateDialog}
          onEditDialogChange={closeEditDialog}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </EntityManagementTemplate>
    </QueryErrorBoundary>
  )
}

export default InteractionsPage