import { SimpleTable } from '@/components/ui/simple-table'
import { ContactsFilters } from './ContactsFilters'
import { ContactRow } from './ContactRow'
import { useContactsFiltering } from '@/features/contacts/hooks/useContactsFiltering'
import { useContactsDisplay } from '@/features/contacts/hooks/useContactsDisplay'
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

  // Generate dynamic headers based on showOrganization - flexible responsive layout
  const headers = showOrganization 
    ? ['', 'Contact', 'Organization', 'Position', 'Primary Contact', 'Status', 'Quick Actions']
    : ['', 'Contact', 'Position', 'Primary Contact', 'Status', 'Quick Actions']

  const renderContactRow = (contact: ContactWithOrganization, isExpanded: boolean, onToggle: () => void) => (
    <ContactRow
      key={contact.id}
      contact={contact}
      index={0} // Not used in display logic
      isExpanded={isRowExpanded(contact.id)}
      onToggleExpansion={() => toggleRowExpansion(contact.id)}
      onEdit={onEdit}
      onView={onView}
      onContact={onContact}
      showOrganization={showOrganization}
    />
  )

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <ContactsFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterPills={filterPills}
        totalContacts={contacts.length}
        filteredCount={filteredContacts.length}
      />

      {/* Table Section */}
      <SimpleTable
        data={filteredContacts}
        loading={loading}
        headers={headers}
        renderRow={renderContactRow}
        emptyMessage={activeFilter !== 'all' ? 'No contacts match your criteria' : 'No contacts found'}
        emptySubtext={activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first contact'}
        colSpan={showOrganization ? 7 : 6}
      />
    </div>
  )
}

export default ContactsTable
