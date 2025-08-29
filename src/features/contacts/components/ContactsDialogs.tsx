import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogScrollableContent
} from '@/components/ui/StandardDialog'
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your CRM system. Fill in the contact details below.
            </DialogDescription>
          </DialogHeader>
          <DialogScrollableContent>
            <EnhancedContactForm 
              onSubmit={onCreateSubmit}
              loading={isCreating}
            />
          </DialogScrollableContent>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the contact information below.
            </DialogDescription>
          </DialogHeader>
          <DialogScrollableContent>
            {selectedContact && (
              <EnhancedContactForm
                initialData={FormDataTransformer.toFormData(selectedContact)}
                onSubmit={(data) => onEditSubmit(selectedContact, data as ContactUpdate)}
                loading={isUpdating}
              />
            )}
          </DialogScrollableContent>
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
              className="bg-destructive hover:bg-destructive-hover text-destructive-foreground"
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