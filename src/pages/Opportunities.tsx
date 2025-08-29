import { OpportunitiesTable } from '@/features/opportunities/components/OpportunitiesTable'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useOpportunitiesPageState } from '@/features/opportunities/hooks/useOpportunitiesPageState'
import { useOpportunityActions } from '@/features/opportunities/hooks/useOpportunityActions'
import { useInteractionActions } from '@/features/interactions/hooks/useInteractionActions'
import { OpportunityDialogs } from '@/features/opportunities/components/OpportunityDialogs'
import { OpportunitiesPageHeader } from '@/features/opportunities/components/OpportunitiesPageHeader'
import { useOpportunitiesPageStyle } from '@/features/opportunities/hooks/useOpportunitiesPageStyle'
import { OpportunitiesErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { cn } from '@/lib/utils'

function OpportunitiesPage() {
  const { data: opportunities = [] } = useOpportunities()
  const { USE_NEW_STYLE } = useOpportunitiesPageStyle()
  
  // Custom hooks
  const pageState = useOpportunitiesPageState()
  const opportunityActions = useOpportunityActions()
  const interactionActions = useInteractionActions()

  return (
    <OpportunitiesErrorBoundary>
      <div className={cn("min-h-screen", USE_NEW_STYLE && "bg-[var(--mfb-cream)]")}>
        <div className={cn("max-w-7xl mx-auto p-6", USE_NEW_STYLE ? "space-y-8" : "space-y-6")}>
          <OpportunitiesPageHeader
            opportunitiesCount={opportunities.length}
            onAddClick={() => pageState.setIsCreateDialogOpen(true)}
            useNewStyle={USE_NEW_STYLE}
          />
          
          <OpportunityDialogs
            isCreateDialogOpen={pageState.isCreateDialogOpen}
            setIsCreateDialogOpen={pageState.setIsCreateDialogOpen}
            onCreateOpportunity={(data) => opportunityActions.handleCreateOpportunity(data, () => pageState.setIsCreateDialogOpen(false))}
            createLoading={opportunityActions.createOpportunityMutation.isPending}
            
            isEditDialogOpen={pageState.isEditDialogOpen}
            setIsEditDialogOpen={pageState.setIsEditDialogOpen}
            editingOpportunity={pageState.editingOpportunity}
            onUpdateOpportunity={(data) => opportunityActions.handleUpdateOpportunity(data, pageState.editingOpportunity!, () => {
              pageState.setIsEditDialogOpen(false)
              pageState.setEditingOpportunity(null)
            })}
            updateLoading={opportunityActions.updateOpportunityMutation.isPending}
            
            isInteractionDialogOpen={pageState.isInteractionDialogOpen}
            setIsInteractionDialogOpen={pageState.setIsInteractionDialogOpen}
            editingInteraction={pageState.editingInteraction}
            selectedOpportunityId={pageState.selectedOpportunityId}
            onCreateInteraction={(data) => interactionActions.handleCreateInteraction(data, pageState.selectedOpportunityId!, () => {
              pageState.setIsInteractionDialogOpen(false)
            })}
            onUpdateInteraction={(data) => interactionActions.handleUpdateInteraction(data, pageState.editingInteraction!, () => {
              pageState.setIsInteractionDialogOpen(false)
              pageState.setEditingInteraction(null)
            })}
            createInteractionLoading={interactionActions.createInteractionMutation.isPending}
            updateInteractionLoading={interactionActions.updateInteractionMutation.isPending}
          />

          {/* Opportunities Table with Inline Details */}
          <OpportunitiesTable 
            onEdit={pageState.handleEditOpportunity}
            onDelete={opportunityActions.handleDeleteOpportunity}
            onAddNew={() => pageState.setIsCreateDialogOpen(true)}
            onAddInteraction={(opportunityId) => {
              pageState.setSelectedOpportunityId(opportunityId)
              pageState.handleAddInteraction()
            }}
            onEditInteraction={pageState.handleEditInteraction}
            onDeleteInteraction={interactionActions.handleDeleteInteraction}
            onInteractionItemClick={interactionActions.handleInteractionItemClick}
          />
        </div>
      </div>
    </OpportunitiesErrorBoundary>
  )
}

export default OpportunitiesPage
