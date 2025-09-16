import { OpportunitiesList } from '@/features/opportunities/components/OpportunitiesList'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useOpportunitiesPageState } from '@/features/opportunities/hooks/useOpportunitiesPageState'
import { useOpportunityActions } from '@/features/opportunities/hooks/useOpportunityActions'
import { useInteractionActions } from '@/features/interactions/hooks/useInteractionActions'
import { OpportunityDialogs } from '@/features/opportunities/components/OpportunityDialogs'
// TODO: Re-implement error boundary after component consolidation
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function OpportunitiesPage() {
  const { data: opportunities = [] } = useOpportunities()

  // Custom hooks
  const pageState = useOpportunitiesPageState()
  const opportunityActions = useOpportunityActions()
  const interactionActions = useInteractionActions()

  return (
    <FilterLayoutProvider>
      <PageLayout>
          <PageHeader
            title="Opportunities"
            description={`Manage ${opportunities.length} sales opportunities in your pipeline`}
            action={{
              label: "Add Opportunity",
              onClick: () => pageState.setIsCreateDialogOpen(true)
            }}
          />

          <ContentSection>
            {/* Opportunities List with Enhanced DataTable */}
            <OpportunitiesList
              onEdit={pageState.handleEditOpportunity}
              onDelete={opportunityActions.handleDeleteOpportunity}
            />
          </ContentSection>

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
        </PageLayout>
    </FilterLayoutProvider>
  )
}

export default OpportunitiesPage
