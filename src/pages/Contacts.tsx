import { useState } from 'react'
import { toast } from '@/lib/toast-styles'
import { Button } from '@/components/ui/button'
import { ContactsTable } from '@/features/contacts/components/ContactsTable'
import { EnhancedContactForm } from '@/features/contacts/components/EnhancedContactForm'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { useContacts, useCreateContactWithOrganization, useUpdateContact, useDeleteContact } from '@/features/contacts/hooks/useContacts'
import { Plus } from 'lucide-react'
import type { Contact, ContactUpdate } from '@/types/entities'
import { FormDataTransformer } from '@/lib/form-resolver'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

function ContactsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const { data: contacts = [], isLoading } = useContacts()
  const createContactMutation = useCreateContactWithOrganization()
  const updateContactMutation = useUpdateContact()
  const deleteContactMutation = useDeleteContact()



  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.first_name} ${contact.last_name}?`)) {
      try {
        await deleteContactMutation.mutateAsync(contact.id)
        toast.success('Contact deleted successfully!')
      } catch (error) {
        console.error('Failed to delete contact:', error)
        toast.error('Failed to delete contact. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Manage Contacts"
          subtitle="Professional Network & Relationships"
          count={contacts.length}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your CRM system. Fill in the contact details below.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <EnhancedContactForm 
              onSubmit={async (data) => {
                try {
                  await createContactMutation.mutateAsync(data)
                  setIsCreateDialogOpen(false)
                  toast.success('Contact created successfully!')
                } catch (error) {
                  console.error('Failed to create contact:', error)
                  // Use the enhanced error message from our error utils
                  const errorMessage = error instanceof Error ? error.message : 'Failed to create contact. Please try again.'
                  toast.error(errorMessage)
                }
              }}
              loading={createContactMutation.isPending}
            />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
                Update the contact information below.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              {editingContact && (
                <EnhancedContactForm 
                initialData={FormDataTransformer.toFormData(editingContact)}
                onSubmit={async (data) => {
                  try {
                    await updateContactMutation.mutateAsync({
                      id: editingContact.id,
                      updates: data as ContactUpdate
                    })
                    setIsEditDialogOpen(false)
                    setEditingContact(null)
                    toast.success('Contact updated successfully!')
                  } catch (error) {
                    console.error('Failed to update contact:', error)
                    toast.error('Failed to update contact. Please try again.')
                  }
                }}
                loading={updateContactMutation.isPending}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts Table */}
      {isLoading ? (
        <div className="text-center py-8 font-nunito text-mfb-green bg-white rounded-lg border shadow-sm p-12">Loading contacts...</div>
      ) : (
        <ContactsTable 
          contacts={contacts} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}


    </div>
  )
}

export default ContactsPage
