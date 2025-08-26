import React from 'react'
import { Button } from '@/components/ui/button'
import { ContactsTable } from './ContactsTable'
import type { Contact, ContactWithOrganization } from '@/types/entities'

interface ContactsDataDisplayProps {
  isLoading: boolean
  isError: boolean
  error: Error | null
  contacts: ContactWithOrganization[]
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
  onRefresh: () => void
}

export const ContactsDataDisplay: React.FC<ContactsDataDisplayProps> = ({
  isLoading,
  isError,
  error,
  contacts,
  onEdit,
  onDelete,
  onRefresh
}) => {
  if (isError) {
    return (
      <div className="text-center py-8 space-y-4 bg-white rounded-lg border shadow-sm p-12">
        <div className="text-red-600 font-medium">Failed to load contacts</div>
        <div className="text-gray-500 text-sm">
          {error?.message || 'An unexpected error occurred while fetching contacts.'}
        </div>
        <Button 
          onClick={onRefresh} 
          variant="outline"
          className="mt-2"
        >
          Refresh Data
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 space-y-2 bg-white rounded-lg border shadow-sm p-12">
        <div className="font-nunito text-mfb-green">Loading contacts...</div>
        <div className="text-sm text-mfb-olive/60 font-nunito">
          This should only take a few seconds
        </div>
      </div>
    )
  }

  return (
    <ContactsTable 
      contacts={contacts}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}