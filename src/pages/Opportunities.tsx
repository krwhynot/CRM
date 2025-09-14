import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { OpportunitiesTable } from '@/features/opportunities/components/OpportunitiesTable'
import {
  useOpportunities,
  useCreateOpportunity,
  useUpdateOpportunity,
} from '@/features/opportunities/hooks/useOpportunities'
import { useOpportunitiesPageState } from '@/features/opportunities/hooks/useOpportunitiesPageState'
import { useOpportunityActions } from '@/features/opportunities/hooks/useOpportunityActions'
import { useInteractionActions } from '@/features/interactions/hooks/useInteractionActions'
import {
  useCreateInteraction,
  useUpdateInteraction,
} from '@/features/interactions/hooks/useInteractions'
import { OpportunityDialogs } from '@/features/opportunities/components/OpportunityDialogs'
import { OpportunitiesErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { PageLayout } from '@/components/layout'
import { usePageLayout } from '@/hooks'

function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: opportunities = [] } = useOpportunities()

  // Custom hooks
  const pageState = useOpportunitiesPageState()
  const opportunityActions = useOpportunityActions({ opportunities })
  const createOpportunityMutation = useCreateOpportunity()
  const updateOpportunityMutation = useUpdateOpportunity()
  const interactionActions = useInteractionActions()
  const createInteractionMutation = useCreateInteraction()
  const updateInteractionMutation = useUpdateInteraction()

  // Create/Update handlers
  const handleCreateOpportunity = async (data: any, onSuccess: () => void) => {
    try {
      await createOpportunityMutation.mutateAsync(data)
      onSuccess()
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const handleUpdateOpportunity = async (data: any, opportunity: any, onSuccess: () => void) => {
    try {
      await updateOpportunityMutation.mutateAsync({ id: opportunity.id, updates: data })
      onSuccess()
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  // Handle URL action parameters (e.g., ?action=create)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      pageState.openCreateDialog()
      // Remove the action parameter from URL to clean up
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('action')
        return newParams
      })
    }
  }, [searchParams, setSearchParams, pageState.openCreateDialog])

  // Use the page layout hook for slot composition
  const { pageLayoutProps } = usePageLayout({
    entityType: 'OPPORTUNITY',
    entityCount: opportunities.length,
    onAddClick: () => pageState.setIsCreateDialogOpen(true),
  })

  return (
    <OpportunitiesErrorBoundary>
      <PageLayout {...pageLayoutProps}>
        {/* Opportunities Table with Inline Details */}
        <OpportunitiesTable
          onEdit={pageState.handleEditOpportunity}
          onDelete={opportunityActions.handleDeleteOpportunity}
        />

        <OpportunityDialogs
          isCreateDialogOpen={pageState.isCreateDialogOpen}
          setIsCreateDialogOpen={pageState.setIsCreateDialogOpen}
          onCreateOpportunity={(data) =>
            handleCreateOpportunity(data, () => pageState.setIsCreateDialogOpen(false))
          }
          createLoading={createOpportunityMutation.isPending}
          isEditDialogOpen={pageState.isEditDialogOpen}
          setIsEditDialogOpen={pageState.setIsEditDialogOpen}
          editingOpportunity={pageState.editingOpportunity}
          onUpdateOpportunity={(data) =>
            handleUpdateOpportunity(data, pageState.editingOpportunity!, () => {
              pageState.setIsEditDialogOpen(false)
              pageState.setEditingOpportunity(null)
            })
          }
          updateLoading={updateOpportunityMutation.isPending}
          isInteractionDialogOpen={pageState.isInteractionDialogOpen}
          setIsInteractionDialogOpen={pageState.setIsInteractionDialogOpen}
          editingInteraction={pageState.editingInteraction}
          selectedOpportunityId={pageState.selectedOpportunityId}
          onCreateInteraction={async (data) => {
            try {
              await createInteractionMutation.mutateAsync(data)
              pageState.setIsInteractionDialogOpen(false)
            } catch (error) {
              // Error handling is done in the mutation
            }
          }}
          onUpdateInteraction={async (data) => {
            try {
              await updateInteractionMutation.mutateAsync({
                id: pageState.editingInteraction!.id,
                updates: data,
              })
              pageState.setIsInteractionDialogOpen(false)
              pageState.setEditingInteraction(null)
            } catch (error) {
              // Error handling is done in the mutation
            }
          }}
          createInteractionLoading={createInteractionMutation.isPending}
          updateInteractionLoading={updateInteractionMutation.isPending}
        />
      </PageLayout>
    </OpportunitiesErrorBoundary>
  )
}

export default OpportunitiesPage
