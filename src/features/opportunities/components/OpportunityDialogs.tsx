import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
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
      <StandardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Add Opportunity"
        description="Create a new opportunity to track sales progress and potential revenue."
        size="xl"
        scroll="content"
      >
        <OpportunityForm 
          onSubmit={onCreateOpportunity}
          loading={createLoading}
        />
      </StandardDialog>

      {/* Edit Opportunity Dialog */}
      <StandardDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Opportunity"
        description="Update opportunity details and track progress changes."
        size="xl"
        scroll="content"
      >
        {editingOpportunity && (
          <OpportunityForm 
            initialData={FormDataTransformer.toFormData(editingOpportunity)}
            onSubmit={onUpdateOpportunity}
            loading={updateLoading}
          />
        )}
      </StandardDialog>

      {/* Add/Edit Interaction Dialog */}
      <StandardDialog
        open={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        title={editingInteraction ? COPY.DIALOGS.EDIT_ACTIVITY : COPY.DIALOGS.LOG_ACTIVITY}
        description="Track customer interactions and communication history."
        size="md"
        scroll="content"
      >
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
      </StandardDialog>
    </>
  )
}