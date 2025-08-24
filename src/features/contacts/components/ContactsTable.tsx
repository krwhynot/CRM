import { Table } from '@/components/ui/table'
import { ContactsFilters } from './ContactsFilters'
import { useContactsFiltering } from '@/features/contacts/hooks/useContactsFiltering'
import { useContactsDisplay } from '@/features/contacts/hooks/useContactsDisplay'
import { ContactsTableLoading } from './contacts-table/ContactsTableLoading'
import { ContactsTableHeader } from './contacts-table/ContactsTableHeader'
import { ContactsTableBody } from './contacts-table/ContactsTableBody'
import { DEFAULT_CONTACTS } from '@/data/sample-contacts'
import type { Contact, ContactWithOrganization } from '@/types/entities'

interface ContactsTableProps {
  contacts: ContactWithOrganization[]
  loading?: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  onAddNew?: () => void
  showOrganization?: boolean
}


export function ContactsTable({ 
  contacts = DEFAULT_CONTACTS, 
  loading = false, 
  onEdit, 
  onView,
  onContact,
  onAddNew,
  showOrganization = true
}: ContactsTableProps) {
  // Use custom hooks for all logic
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredContacts,
    filterPills
  } = useContactsFiltering(contacts)

  const {
    toggleRowExpansion,
    isRowExpanded
  } = useContactsDisplay(contacts.map(c => c.id))

  if (loading) {
    return <ContactsTableLoading />
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <ContactsFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterPills={filterPills}
        onAddNew={onAddNew}
        totalContacts={contacts.length}
        filteredCount={filteredContacts.length}
      />

      {/* Table Section */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <ContactsTableHeader showOrganization={showOrganization} />
            <ContactsTableBody
              filteredContacts={filteredContacts}
              showOrganization={showOrganization}
              searchTerm={searchTerm}
              activeFilter={activeFilter}
              isRowExpanded={isRowExpanded}
              toggleRowExpansion={toggleRowExpansion}
              onEdit={onEdit}
              onView={onView}
              onContact={onContact}
            />
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ContactsTable
