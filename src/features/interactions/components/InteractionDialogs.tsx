import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { InteractionForm } from './InteractionForm'
import { FormDataTransformer } from '@/lib/form-data-transformer'
import type { InteractionWithRelations } from '@/types/entities'
import type { InteractionFormData } from '@/types/interaction.types'

interface InteractionDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  editingInteraction: InteractionWithRelations | null
  onCreateSubmit: (data: InteractionFormData) => void
  onEditSubmit: (editingInteraction: InteractionWithRelations, data: InteractionFormData) => void
  onCreateDialogChange: (open: boolean) => void
  onEditDialogChange: (open: boolean) => void
  isCreating: boolean
  isUpdating: boolean
}

export const InteractionDialogs: React.FC<InteractionDialogsProps> = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  editingInteraction,
  onCreateSubmit,
  onEditSubmit,
  onCreateDialogChange,
  onEditDialogChange,
  isCreating,
  isUpdating,
}) => {
  return (
    <>
      {/* Create Interaction Dialog */}
      <StandardDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogChange}
        title="Log Activity"
        description="Record a new interaction with contacts or opportunities to track engagement history."
        size="xl"
        scroll="content"
      >
        <InteractionForm onSubmit={onCreateSubmit} loading={isCreating} />
      </StandardDialog>

      {/* Edit Interaction Dialog */}
      <StandardDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogChange}
        title="Edit Interaction"
        description="Update interaction details and modify engagement history."
        size="xl"
        scroll="content"
      >
        {editingInteraction && (
          <InteractionForm
            initialData={FormDataTransformer.toFormData(editingInteraction)}
            onSubmit={(data) => onEditSubmit(editingInteraction, data)}
            loading={isUpdating}
          />
        )}
      </StandardDialog>
    </>
  )
}
