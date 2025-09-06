import { OpportunitiesTable } from '@/features/opportunities/components/OpportunitiesTable'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useOpportunitiesPageState } from '@/features/opportunities/hooks/useOpportunitiesPageState'
import { useOpportunityActions } from '@/features/opportunities/hooks/useOpportunityActions'
import { useInteractionActions } from '@/features/interactions/hooks/useInteractionActions'
import { OpportunityDialogs } from '@/features/opportunities/components/OpportunityDialogs'
import { OpportunitiesErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { OpportunityManagementTemplate } from '@/components/templates/EntityManagementTemplate'

function OpportunitiesPage() {
  const { data: opportunities = [] } = useOpportunities()

  // Custom hooks
  const pageState = useOpportunitiesPageState()
  const opportunityActions = useOpportunityActions()
  const interactionActions = useInteractionActions()

  return (
    <OpportunitiesErrorBoundary>
      <OpportunityManagementTemplate
        entityCount={opportunities.length}
        onAddClick={() => pageState.setIsCreateDialogOpen(true)}
      >
        {/* Opportunities Table with Inline Details */}
        <OpportunitiesTable
          onEdit={pageState.handleEditOpportunity}
          onDelete={opportunityActions.handleDeleteOpportunity}
        />

        <OpportunityDialogs
          isCreateDialogOpen={pageState.isCreateDialogOpen}
          setIsCreateDialogOpen={pageState.setIsCreateDialogOpen}
          onCreateOpportunity={(data) =>
            opportunityActions.handleCreateOpportunity(data, () =>
              pageState.setIsCreateDialogOpen(false)
            )
          }
          createLoading={opportunityActions.createOpportunityMutation.isPending}
          isEditDialogOpen={pageState.isEditDialogOpen}
          setIsEditDialogOpen={pageState.setIsEditDialogOpen}
          editingOpportunity={pageState.editingOpportunity}
          onUpdateOpportunity={(data) =>
            opportunityActions.handleUpdateOpportunity(data, pageState.editingOpportunity!, () => {
              pageState.setIsEditDialogOpen(false)
              pageState.setEditingOpportunity(null)
            })
          }
          updateLoading={opportunityActions.updateOpportunityMutation.isPending}
          isInteractionDialogOpen={pageState.isInteractionDialogOpen}
          setIsInteractionDialogOpen={pageState.setIsInteractionDialogOpen}
          editingInteraction={pageState.editingInteraction}
          selectedOpportunityId={pageState.selectedOpportunityId}
          onCreateInteraction={(data) =>
            interactionActions.handleCreateInteraction(
              data,
              pageState.selectedOpportunityId!,
              () => {
                pageState.setIsInteractionDialogOpen(false)
              }
            )
          }
          onUpdateInteraction={(data) =>
            interactionActions.handleUpdateInteraction(data, pageState.editingInteraction!, () => {
              pageState.setIsInteractionDialogOpen(false)
              pageState.setEditingInteraction(null)
            })
          }
          createInteractionLoading={interactionActions.createInteractionMutation.isPending}
          updateInteractionLoading={interactionActions.updateInteractionMutation.isPending}
        />
      </OpportunityManagementTemplate>
    </OpportunitiesErrorBoundary>
  )
}

export default OpportunitiesPage
