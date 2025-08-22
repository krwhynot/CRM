import { useState, useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OpportunitiesTable } from '@/components/opportunities/OpportunitiesTable'
import { OpportunityForm } from '@/components/opportunities/OpportunityForm'
import { InteractionForm } from '@/components/interactions/InteractionForm'
import { InteractionTimeline } from '@/components/interactions/InteractionTimeline'
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/hooks/useOpportunities'
import { useInteractionsByOpportunity, useCreateInteraction, useUpdateInteraction, useDeleteInteraction } from '@/hooks/useInteractions'
import { Target, Plus, Search, DollarSign, TrendingUp, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Opportunity, OpportunityUpdate, InteractionWithRelations } from '@/types/entities'
import type { InteractionFormData } from '@/types/interaction.types'
import { FormDataTransformer } from '@/lib/form-resolver'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

function OpportunitiesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  
  // Timeline state management
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null)
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<InteractionWithRelations | null>(null)
  
  const { data: opportunities = [], isLoading } = useOpportunities()
  const createOpportunityMutation = useCreateOpportunity()
  const updateOpportunityMutation = useUpdateOpportunity()
  const deleteOpportunityMutation = useDeleteOpportunity()
  
  // Timeline hooks
  const { data: opportunityInteractions = [], isLoading: interactionsLoading } = useInteractionsByOpportunity(selectedOpportunityId || '')
  const createInteractionMutation = useCreateInteraction()
  const updateInteractionMutation = useUpdateInteraction()
  const deleteInteractionMutation = useDeleteInteraction()

  const filteredOpportunities = opportunities.filter(opp =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.organization?.name && opp.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const activeOpportunities = opportunities.filter(opp => 
    !['Closed - Won', 'Closed - Lost'].includes(opp.stage)
  )
  
  const wonOpportunities = opportunities.filter(opp => opp.stage === 'Closed - Won')
  
  const totalValue = opportunities
    .filter(opp => opp.estimated_value)
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)

  const activeValue = activeOpportunities
    .filter(opp => opp.estimated_value)
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (opportunity: Opportunity) => {
    if (window.confirm(`Are you sure you want to delete the opportunity "${opportunity.name}"?`)) {
      try {
        await deleteOpportunityMutation.mutateAsync(opportunity.id)
        toast.success('Opportunity deleted successfully!')
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        toast.error('Failed to delete opportunity. Please try again.')
      }
    }
  }

  // Timeline handlers
  const handleViewOpportunity = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunityId(opportunity.id)
  }, [])

  const handleCloseOpportunityDetail = useCallback(() => {
    setSelectedOpportunityId(null)
    setIsInteractionDialogOpen(false)
    setEditingInteraction(null)
  }, [])

  const handleAddInteraction = useCallback(() => {
    setEditingInteraction(null)
    setIsInteractionDialogOpen(true)
  }, [])

  const handleEditInteraction = useCallback((interaction: InteractionWithRelations) => {
    setEditingInteraction(interaction)
    setIsInteractionDialogOpen(true)
  }, [])

  const handleDeleteInteraction = useCallback(async (interaction: InteractionWithRelations) => {
    if (window.confirm(`Are you sure you want to delete this ${interaction.type}?`)) {
      try {
        await deleteInteractionMutation.mutateAsync(interaction.id)
        toast.success('Activity deleted successfully!')
      } catch (error) {
        console.error('Failed to delete interaction:', error)
        toast.error('Failed to delete activity. Please try again.')
      }
    }
  }, [deleteInteractionMutation])

  const handleCreateInteraction = useCallback(async (data: InteractionFormData) => {
    try {
      // Map form data to database format
      const interactionData = {
        opportunity_id: selectedOpportunityId!,
        interaction_date: data.interaction_date,
        subject: data.subject,
        type: data.type as any,
        description: data.notes || null, // Map notes to description
        follow_up_required: data.follow_up_required || false,
        follow_up_date: data.follow_up_date || null
      }
      
      await createInteractionMutation.mutateAsync(interactionData as any)
      setIsInteractionDialogOpen(false)
      toast.success('Activity logged successfully!')
    } catch (error) {
      console.error('Failed to create interaction:', error)
      toast.error('Failed to log activity. Please try again.')
    }
  }, [selectedOpportunityId, createInteractionMutation])

  const handleUpdateInteraction = useCallback(async (data: InteractionFormData) => {
    if (!editingInteraction) return
    
    try {
      const updateData = {
        interaction_date: data.interaction_date,
        subject: data.subject,
        type: data.type as any,
        description: data.notes || null, // Map notes to description
        follow_up_required: data.follow_up_required || false,
        follow_up_date: data.follow_up_date || null
      }
      
      await updateInteractionMutation.mutateAsync({
        id: editingInteraction.id,
        updates: updateData
      })
      setIsInteractionDialogOpen(false)
      setEditingInteraction(null)
      toast.success('Activity updated successfully!')
    } catch (error) {
      console.error('Failed to update interaction:', error)
      toast.error('Failed to update activity. Please try again.')
    }
  }, [editingInteraction, updateInteractionMutation])

  const handleInteractionItemClick = useCallback((interaction: InteractionWithRelations) => {
    // For now, just log the click - could be used for quick views
    console.log('Interaction clicked:', interaction)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6 flex items-center gap-2">
            <Target className="h-8 w-8 text-mfb-green" />
            Opportunities
          </h1>
          <p className="text-muted-foreground mt-1">
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <OpportunityForm 
              onSubmit={async (data) => {
                try {
                  await createOpportunityMutation.mutateAsync(data as any)
                  setIsCreateDialogOpen(false)
                  toast.success('Opportunity created successfully!')
                } catch (error) {
                  console.error('Failed to create opportunity:', error)
                  toast.error('Failed to create opportunity. Please try again.')
                }
              }}
              loading={createOpportunityMutation.isPending}
            />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Opportunity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              {editingOpportunity && (
                <OpportunityForm 
                initialData={FormDataTransformer.toFormData(editingOpportunity)}
                onSubmit={async (data) => {
                  try {
                    // Transform form data to OpportunityUpdate by removing non-database fields
                    const { principals: _principals, auto_generated_name: _auto_generated_name, ...updateData } = data
                    
                    await updateOpportunityMutation.mutateAsync({
                      id: editingOpportunity.id,
                      updates: updateData as unknown as OpportunityUpdate
                    })
                    setIsEditDialogOpen(false)
                    setEditingOpportunity(null)
                    toast.success('Opportunity updated successfully!')
                  } catch (error) {
                    console.error('Failed to update opportunity:', error)
                    toast.error('Failed to update opportunity. Please try again.')
                  }
                }}
                loading={updateOpportunityMutation.isPending}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">Total Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{opportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">Active Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-mfb-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{activeOpportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">Won Deals</CardTitle>
            <Target className="h-4 w-4 text-mfb-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{wonOpportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-mfb-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">
              ${activeValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {['New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Awaiting Response', 'Feedback Logged', 'Demo Scheduled', 'Closed - Won'].map(stage => {
              const stageOpportunities = opportunities.filter(opp => opp.stage === stage)
              const stageValue = stageOpportunities
                .filter(opp => opp.estimated_value)
                .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
              
              return (
                <div key={stage} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm capitalize">{stage.replace('_', ' ')}</h3>
                    <Badge variant="secondary">{stageOpportunities.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${stageValue.toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Detail View with Timeline */}
      {selectedOpportunityId && (
        (() => {
          const selectedOpportunity = opportunities.find(opp => opp.id === selectedOpportunityId)
          if (!selectedOpportunity) return null
          
          return (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg font-nunito">{selectedOpportunity.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOpportunity.organization?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseOpportunityDetail}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Opportunity Info Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Stage</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedOpportunity.stage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Value</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedOpportunity.estimated_value 
                        ? `$${selectedOpportunity.estimated_value.toLocaleString()}` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Probability</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedOpportunity.probability ? `${selectedOpportunity.probability}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Close Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedOpportunity.estimated_close_date 
                        ? new Date(selectedOpportunity.estimated_close_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                {selectedOpportunity.contact && (
                  <div className="pt-2 border-t">
                    <label className="text-sm font-medium text-gray-700">Primary Contact</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedOpportunity.contact.first_name} {selectedOpportunity.contact.last_name}
                      {selectedOpportunity.contact.title && (
                        <span className="text-gray-500"> • {selectedOpportunity.contact.title}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Timeline Integration */}
                <InteractionTimeline
                  interactions={opportunityInteractions}
                  onAddNew={handleAddInteraction}
                  onItemClick={handleInteractionItemClick}
                  onEditInteraction={handleEditInteraction}
                  onDeleteInteraction={handleDeleteInteraction}
                  opportunityId={selectedOpportunityId}
                  loading={interactionsLoading}
                />
              </CardContent>
            </Card>
          )
        })()
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities by title, stage, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 font-nunito text-mfb-green">Loading opportunities...</div>
          ) : (
            <OpportunitiesTable 
              opportunities={filteredOpportunities} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleViewOpportunity}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Interaction Dialog */}
      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingInteraction ? 'Edit Activity' : 'Log New Activity'}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <InteractionForm 
              onSubmit={editingInteraction ? handleUpdateInteraction : handleCreateInteraction}
              initialData={editingInteraction ? {
                subject: editingInteraction.subject,
                type: editingInteraction.type,
                interaction_date: editingInteraction.interaction_date,
                opportunity_id: editingInteraction.opportunity_id,
                location: null, // Location not stored in database yet
                notes: editingInteraction.description, // Map description to notes for form
                follow_up_required: editingInteraction.follow_up_required || false,
                follow_up_date: editingInteraction.follow_up_date
              } : undefined}
              defaultOpportunityId={!editingInteraction ? selectedOpportunityId || undefined : undefined}
              loading={editingInteraction 
                ? updateInteractionMutation.isPending 
                : createInteractionMutation.isPending
              }
              submitLabel={editingInteraction ? 'Update Activity' : 'Log Activity'}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OpportunitiesPage