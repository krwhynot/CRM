import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
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
      <StandardDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogChange}
        title="Add Contact"
        description="Add a contact to your CRM system. Fill in the contact details below."
        size="lg"
        scroll="content"
      >
        <EnhancedContactForm 
          onSubmit={onCreateSubmit}
          loading={isCreating}
        />
      </StandardDialog>

      {/* Edit Dialog */}
      <StandardDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogChange}
        title="Edit Contact"
        description="Update the contact information below."
        size="lg"
        scroll="content"
      >
        {selectedContact && (
          <EnhancedContactForm
            initialData={FormDataTransformer.toFormData(selectedContact)}
            onSubmit={(data) => onEditSubmit(selectedContact, data as ContactUpdate)}
            loading={isUpdating}
          />
        )}
      </StandardDialog>

      {/* Delete Confirmation Dialog */}
      <StandardDialog
        variant="alert"
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        title="Are you sure?"
        description={`This action will permanently delete "${selectedContact?.first_name} ${selectedContact?.last_name}". This action cannot be undone and will remove all associated data.`}
        onConfirm={() => selectedContact && onDeleteConfirm(selectedContact)}
        onCancel={onDeleteCancel}
        confirmText="Delete Contact"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isDeleting}
      >
        <div className="text-center text-sm text-muted-foreground">
          All interactions and history associated with this contact will also be removed.
        </div>
      </StandardDialog>
    </>
  )
}