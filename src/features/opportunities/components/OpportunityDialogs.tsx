import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OpportunityForm } from './OpportunityForm'
import { InteractionForm } from '@/features/interactions/components/InteractionForm'
import { FormDataTransformer } from '@/lib/form-data-transformer'
import { COPY } from '@/lib/copy'
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
        <DialogContent className="max-w-4xl w-full max-h-screen overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
            <OpportunityForm 
              onSubmit={onCreateOpportunity}
              loading={createLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Opportunity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-screen overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
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
        <DialogContent className="max-w-md w-full max-h-screen overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingInteraction ? COPY.DIALOGS.EDIT_ACTIVITY : COPY.DIALOGS.LOG_ACTIVITY}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
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
              submitLabel={editingInteraction ? COPY.BUTTONS.UPDATE : COPY.BUTTONS.LOG_ACTIVITY}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}