import React from 'react'
import { useInteractions, useInteractionStats } from '@/hooks/useInteractions'
import { useInteractionsPageState } from '@/hooks/useInteractionsPageState'
import { useInteractionsPageActions } from '@/hooks/useInteractionsPageActions'
import { useInteractionsFiltering } from '@/hooks/useInteractionsFiltering'
import { InteractionsPageHeader } from '@/components/interactions/InteractionsPageHeader'
import { InteractionsStatsCards } from '@/components/interactions/InteractionsStatsCards'
import { InteractionTypesBreakdown } from '@/components/interactions/InteractionTypesBreakdown'
import { InteractionsSearchAndTable } from '@/components/interactions/InteractionsSearchAndTable'
import { InteractionDialogs } from '@/components/interactions/InteractionDialogs'

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
