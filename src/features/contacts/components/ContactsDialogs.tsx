import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EnhancedContactForm } from './EnhancedContactForm'
import type { Contact, ContactUpdate } from '@/types/entities'
import { FormDataTransformer } from '@/lib/form-data-transformer'

interface ContactsDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  selectedContact: Contact | null
  onCreateSubmit: (data: any) => void
  onEditSubmit: (selectedContact: Contact, data: ContactUpdate) => void
  onDeleteConfirm: (selectedContact: Contact) => void
  onCreateDialogChange: (open: boolean) => void
  onEditDialogChange: (open: boolean) => void
  onDeleteDialogChange: (open: boolean) => void
  onDeleteCancel: () => void
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export const ContactsDialogs: React.FC<ContactsDialogsProps> = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedContact,
  onCreateSubmit,
  onEditSubmit,
  onDeleteConfirm,
  onCreateDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onDeleteCancel,
  isCreating,
  isUpdating,
  isDeleting
}) => {
  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogChange}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your CRM system. Fill in the contact details below.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <EnhancedContactForm 
              onSubmit={onCreateSubmit}
              loading={isCreating}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the contact information below.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {selectedContact && (
              <EnhancedContactForm
                initialData={FormDataTransformer.toFormData(selectedContact)}
                onSubmit={(data) => onEditSubmit(selectedContact, data as ContactUpdate)}
                loading={isUpdating}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete "{selectedContact?.first_name} {selectedContact?.last_name}". 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedContact && onDeleteConfirm(selectedContact)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Contact'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}