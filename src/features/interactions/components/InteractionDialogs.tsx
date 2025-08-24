import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InteractionForm } from './InteractionForm'
import { FormDataTransformer } from '@/lib/form-resolver'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  editingInteraction: InteractionWithRelations | null
  onCreateSubmit: (data: any) => void
  onEditSubmit: (editingInteraction: InteractionWithRelations, data: any) => void
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
  isUpdating
}) => {
  return (
    <>
      {/* Create Interaction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogChange}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Interaction</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <InteractionForm 
              onSubmit={onCreateSubmit}
              loading={isCreating}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Interaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Interaction</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {editingInteraction && (
              <InteractionForm 
                initialData={FormDataTransformer.toFormData(editingInteraction)}
                onSubmit={(data) => onEditSubmit(editingInteraction, data)}
                loading={isUpdating}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}