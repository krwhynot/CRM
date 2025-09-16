import React from 'react'
import { ContactsList } from './ContactsList'
import { LoadingState, ErrorState } from '@/components/ui/data-state'
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
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <LoadingState
        message="Loading contacts..."
        subtext="Fetching contact data from the database"
        variant="table"
      />
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load contacts"
        message={error?.message || 'An unexpected error occurred while fetching contacts.'}
        onRetry={onRefresh}
        retryLabel="Refresh Contacts"
        variant="destructive"
      />
    )
  }

  return <ContactsList contacts={contacts} onEdit={onEdit} onDelete={onDelete} />
}
