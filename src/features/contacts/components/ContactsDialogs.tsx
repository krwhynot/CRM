import { StandardDialog } from '@/components/ui/StandardDialog'
import { ContactForm } from './ContactForm'
import type { Contact, ContactUpdate } from '@/types/entities'
import type { ContactWithOrganizationData } from '../hooks/useContacts'
import type { ContactFormData } from '@/types/contact.types'
import { FormDataTransformer } from '@/lib/form-data-transformer'
import { semanticTypography } from '@/styles/tokens'

interface ContactsDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  selectedContact: Contact | null
  onCreateSubmit: (data: ContactWithOrganizationData) => Promise<void>
  onEditSubmit: (selectedContact: Contact, data: ContactUpdate) => Promise<void>
  onDeleteConfirm: (selectedContact: Contact) => Promise<void>
  onCreateDialogChange: (open: boolean) => void
  onEditDialogChange: (open: boolean) => void
  onDeleteDialogChange: (open: boolean) => void
  onDeleteCancel: () => void
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

// Helper function to convert ContactFormData to ContactWithOrganizationData
const transformFormData = (data: ContactFormData): ContactWithOrganizationData => {
  const {
    preferred_principals,
    organization_mode,
    organization_name,
    organization_type,
    organization_phone,
    organization_email,
    organization_website,
    organization_notes,
    organization_id, // Extract to handle separately
    ...contactData
  } = data

  let result: ContactWithOrganizationData = {
    ...contactData,
    preferred_principals:
      preferred_principals?.filter((id): id is string => typeof id === 'string' && id.length > 0) ||
      [],
  }

  // Handle organization data based on mode
  if (organization_mode === 'existing') {
    // Existing organization - use organization_id (convert null to undefined)
    result.organization_id = organization_id || undefined
  } else if (organization_mode === 'new') {
    // New organization - use organization details
    result.organization_name = organization_name || undefined
    result.organization_type = organization_type as
      | 'customer'
      | 'principal'
      | 'distributor'
      | 'prospect'
      | 'vendor'
      | undefined
    result.organization_data = {
      phone: organization_phone || null,
      email: organization_email || null,
      website: organization_website || null,
      notes: organization_notes || null,
    }
  }

  return result
}

export const ContactsDialogs = ({
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
  isDeleting,
}: ContactsDialogsProps) => {
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
        <ContactForm
          onSubmit={(data) => onCreateSubmit(transformFormData(data))}
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
          <ContactForm
            initialData={FormDataTransformer.toFormData(selectedContact)}
            onSubmit={(data) =>
              onEditSubmit(selectedContact, transformFormData(data) as ContactUpdate)
            }
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
        <div className={`text-center ${semanticTypography.body} text-muted-foreground`}>
          All interactions and history associated with this contact will also be removed.
        </div>
      </StandardDialog>
    </>
  )
}
