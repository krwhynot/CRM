import React from 'react'
import { Button } from '@/components/ui/button'
import { OpportunitiesTable } from '@/features/opportunities/components/OpportunitiesTable'
import { Target, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useInteractionsByOpportunity } from '@/features/interactions/hooks/useInteractions'
import { useOpportunitiesPageState } from '@/features/opportunities/hooks/useOpportunitiesPageState'
import { useOpportunityActions } from '@/features/opportunities/hooks/useOpportunityActions'
import { useInteractionActions } from '@/features/interactions/hooks/useInteractionActions'
import { OpportunityDetailCard } from '@/components/opportunities-page/OpportunityDetailCard'
import { OpportunityDialogs } from '@/components/opportunities-page/OpportunityDialogs'

function OpportunitiesPage() {
  const navigate = useNavigate()
  
  // Data hooks
  const { data: opportunities = [], isLoading } = useOpportunities()
  
  // Custom hooks
  const pageState = useOpportunitiesPageState()
  const opportunityActions = useOpportunityActions()
  const interactionActions = useInteractionActions()
  
  // Timeline data
  const { data: opportunityInteractions = [], isLoading: interactionsLoading } = useInteractionsByOpportunity(pageState.selectedOpportunityId || '')
  
  // Find selected opportunity
  const selectedOpportunity = pageState.selectedOpportunityId 
    ? opportunities.find(opp => opp.id === pageState.selectedOpportunityId) 
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6 flex items-center gap-2">
            <Target className="h-8 w-8 text-mfb-green" />
            Opportunities
          </h1>
          <p className="text-lg text-mfb-olive/70 font-nunito">
            Track and manage your sales pipeline and deals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/opportunities/new-multi-principal')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Multi-Principal
          </Button>
          
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
        </div>
      </div>

      {/* Opportunity Detail View with Timeline */}
      {selectedOpportunity && (
        <OpportunityDetailCard
          opportunity={selectedOpportunity}
          interactions={opportunityInteractions}
          interactionsLoading={interactionsLoading}
          onClose={pageState.handleCloseOpportunityDetail}
          onAddInteraction={pageState.handleAddInteraction}
          onEditInteraction={pageState.handleEditInteraction}
          onDeleteInteraction={interactionActions.handleDeleteInteraction}
          onInteractionItemClick={interactionActions.handleInteractionItemClick}
        />
      )}

      {/* Opportunities Table */}
      {isLoading ? (
        <div className="text-center py-8 font-nunito text-mfb-green bg-white rounded-lg border shadow-sm p-12">Loading opportunities...</div>
      ) : (
        <OpportunitiesTable 
          onEdit={pageState.handleEditOpportunity}
          onDelete={opportunityActions.handleDeleteOpportunity}
          onView={pageState.handleViewOpportunity}
          onAddNew={() => pageState.setIsCreateDialogOpen(true)}
        />
      )}
    </div>
  )
}

export default OpportunitiesPage
