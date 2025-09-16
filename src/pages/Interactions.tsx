import {
  useInteractions,
  InteractionDialogs,
} from '@/features/interactions'
import { InteractionsList } from '@/features/interactions/components/InteractionsList'
import { useInteractionsPageState } from '@/features/interactions/hooks/useInteractionsPageState'
import { useInteractionsPageActions } from '@/features/interactions/hooks/useInteractionsPageActions'
import { EntityListWrapper } from '@/components/layout/EntityListWrapper'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

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
    <FilterLayoutProvider>
      <EntityListWrapper
        title="Interactions"
        description={`Track ${interactions.length} interactions across your CRM`}
        action={{
          label: "Add Interaction",
          onClick: openCreateDialog
        }}
      >
        <InteractionsList
          interactions={interactions}
          loading={isLoading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onView={handleViewInteraction}
          onAddNew={openCreateDialog}
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
      </EntityListWrapper>
    </FilterLayoutProvider>
  )
}

export default InteractionsPage