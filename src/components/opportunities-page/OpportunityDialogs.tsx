import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OpportunityForm } from '@/components/opportunities/OpportunityForm'
import { InteractionForm } from '@/components/interactions/InteractionForm'
import { FormDataTransformer } from '@/lib/form-resolver'
import type { Opportunity, InteractionWithRelations } from '@/types/entities'
import type { InteractionFormData } from '@/types/interaction.types'

interface OpportunityDialogsProps {
  // Create dialog
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  onCreateOpportunity: (data: any) => Promise<void>
  createLoading: boolean
  
  // Edit dialog
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  editingOpportunity: Opportunity | null
  onUpdateOpportunity: (data: any) => Promise<void>
  updateLoading: boolean
  
  // Interaction dialog
  isInteractionDialogOpen: boolean
  setIsInteractionDialogOpen: (open: boolean) => void
  editingInteraction: InteractionWithRelations | null
  selectedOpportunityId: string | null
  onCreateInteraction: (data: InteractionFormData) => Promise<void>
  onUpdateInteraction: (data: InteractionFormData) => Promise<void>
  createInteractionLoading: boolean
  updateInteractionLoading: boolean
}

export const OpportunityDialogs: React.FC<OpportunityDialogsProps> = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  onCreateOpportunity,
  createLoading,
  
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingOpportunity,
  onUpdateOpportunity,
  updateLoading,
  
  isInteractionDialogOpen,
  setIsInteractionDialogOpen,
  editingInteraction,
  selectedOpportunityId,
  onCreateInteraction,
  onUpdateInteraction,
  createInteractionLoading,
  updateInteractionLoading
}) => {
  return (
    <>
      {/* Create Opportunity Dialog */}
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
              onSubmit={onCreateOpportunity}
              loading={createLoading}
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
                onSubmit={onUpdateOpportunity}
                loading={updateLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
              onSubmit={editingInteraction ? onUpdateInteraction : onCreateInteraction}
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
              loading={editingInteraction ? updateInteractionLoading : createInteractionLoading}
              submitLabel={editingInteraction ? 'Update Activity' : 'Log Activity'}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}