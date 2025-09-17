import { useInteractions, InteractionDialogs, InteractionsList } from '@/features/interactions'
import { useInteractionsPageActions } from '@/features/interactions/hooks/useInteractionsPageActions'
import { useEntityPageState } from '@/hooks/useEntityPageState'
import type { InteractionWithRelations } from '@/types/interaction.types'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function InteractionsPage() {
  const { data: interactions = [], isLoading, error, isError, refetch } = useInteractions()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity: selectedInteraction,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useEntityPageState<InteractionWithRelations>()

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useInteractionsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  return (
    <FilterLayoutProvider>
      <PageLayout showBreadcrumbs={true}>
        <PageHeader
          title="Interactions"
          description={`Track ${interactions.length} interactions across your CRM`}
          action={{
            label: 'Add Interaction',
            onClick: openCreateDialog,
          }}
        />

        <ContentSection>
          <InteractionsList
            interactions={interactions}
            loading={isLoading}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
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
        </ContentSection>
      </PageLayout>
    </FilterLayoutProvider>
  )
}

export default InteractionsPage
