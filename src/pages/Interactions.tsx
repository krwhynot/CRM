import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  useInteractions,
  InteractionsDataDisplay,
  InteractionDialogs,
} from '@/features/interactions'
import { useInteractionsPageState } from '@/features/interactions/hooks/useInteractionsPageState'
import { useInteractionsPageActions } from '@/features/interactions/hooks/useInteractionsPageActions'
import { QueryErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { PageLayout } from '@/components/layout'
import { usePageLayout } from '@/hooks'

function InteractionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
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

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useInteractionsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  const refreshInteractions = () => {
    refetch()
  }

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
    entityType: 'INTERACTION',
    entityCount: interactions.length,
    onAddClick: openCreateDialog,
  })

  return (
    <QueryErrorBoundary>
      <PageLayout {...pageLayoutProps}>
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
      </PageLayout>
    </QueryErrorBoundary>
  )
}

export default InteractionsPage
