import { useState } from 'react'
import { toast } from '@/lib/toast-styles'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { EnhancedContactForm } from '@/components/contacts/EnhancedContactForm'
import { useContacts, useCreateContactWithOrganization, useUpdateContact, useDeleteContact } from '@/hooks/useContacts'
import { Users, Plus, Search, Mail, Phone } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const { data: contacts = [], isLoading } = useContacts()
  const createContactMutation = useCreateContactWithOrganization()
  const updateContactMutation = useUpdateContact()
  const deleteContactMutation = useDeleteContact()

  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.organization?.name && contact.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const contactsWithEmail = contacts.filter(contact => contact.email)
  const contactsWithPhone = contacts.filter(contact => contact.phone)

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6 flex items-center gap-2">
            <Users className="h-8 w-8 text-mfb-green" />
            Contacts
          </h1>
          <p className="text-lg text-mfb-olive/70 font-nunito">
            Manage your network of contacts and relationships
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{contacts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">With Email</CardTitle>
            <Mail className="h-4 w-4 text-mfb-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{contactsWithEmail.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-nunito">With Phone</CardTitle>
            <Phone className="h-4 w-4 text-mfb-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{contactsWithPhone.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 font-nunito text-mfb-green">Loading contacts...</div>
          ) : (
            <ContactsTable 
              contacts={filteredContacts} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactsPage
