import React from 'react'
import { TableBody } from '@/components/ui/table'
import { ContactRow } from '../ContactRow'
import { ContactsTableEmpty } from './ContactsTableEmpty'
import type { Contact, ContactWithOrganization } from '@/types/entities'

interface ContactsTableBodyProps {
  filteredContacts: ContactWithOrganization[]
  showOrganization: boolean
  searchTerm: string
  activeFilter: string
  isRowExpanded: (id: string) => boolean
  toggleRowExpansion: (id: string) => void
  onEdit?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
}

export const ContactsTableBody: React.FC<ContactsTableBodyProps> = ({
  filteredContacts,
  showOrganization,
  searchTerm,
  activeFilter,
  isRowExpanded,
  toggleRowExpansion,
  onEdit,
  onView,
  onContact
}) => {
  return (
    <TableBody>
      {filteredContacts.length === 0 ? (
        <ContactsTableEmpty
          showOrganization={showOrganization}
          searchTerm={searchTerm}
          activeFilter={activeFilter}
        />
      ) : (
        filteredContacts.map((contact, index) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            index={index}
            isExpanded={isRowExpanded(contact.id)}
            onToggleExpansion={toggleRowExpansion}
            onEdit={onEdit}
            onView={onView}
            onContact={onContact}
            showOrganization={showOrganization}
          />
        ))
      )}
    </TableBody>
  )
}