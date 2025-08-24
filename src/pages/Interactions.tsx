import { useInteractions, useInteractionStats } from '@/features/interactions/hooks/useInteractions'
import { useInteractionsPageState } from '@/features/interactions/hooks/useInteractionsPageState'
import { useInteractionsPageActions } from '@/features/interactions/hooks/useInteractionsPageActions'
import { useInteractionsFiltering } from '@/features/interactions/hooks/useInteractionsFiltering'
import { InteractionsPageHeader } from '@/features/interactions/components/InteractionsPageHeader'
import { InteractionsStatsCards } from '@/features/interactions/components/InteractionsStatsCards'
import { InteractionTypesBreakdown } from '@/features/interactions/components/InteractionTypesBreakdown'
import { InteractionsSearchAndTable } from '@/features/interactions/components/InteractionsSearchAndTable'
import { InteractionDialogs } from '@/features/interactions/components/InteractionDialogs'

function InteractionsPage() {
  const { data: interactions = [], isLoading } = useInteractions()
  const { data: stats } = useInteractionStats()
  
  const {
    searchTerm,
    setSearchTerm,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingInteraction,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog
  } = useInteractionsPageState()
  
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating
  } = useInteractionsPageActions(closeCreateDialog, closeEditDialog)
  
  const { filteredInteractions } = useInteractionsFiltering(interactions, searchTerm)


  return (
    <div className="space-y-6">
      <InteractionsPageHeader onAddClick={openCreateDialog} />
      
      <InteractionsStatsCards stats={stats} />
      
      <InteractionTypesBreakdown stats={stats} />
      
      <InteractionsSearchAndTable
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
        interactions={filteredInteractions}
        onEdit={openEditDialog}
        onDelete={handleDelete}
      />
      
      <InteractionDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        editingInteraction={editingInteraction}
        onCreateSubmit={handleCreate}
        onEditSubmit={handleUpdate}
        onCreateDialogChange={closeCreateDialog}
        onEditDialogChange={closeEditDialog}
        isCreating={isCreating}
        isUpdating={isUpdating}
      />
    </div>
  )
}

export default InteractionsPage
