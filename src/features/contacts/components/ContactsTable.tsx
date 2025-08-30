import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { ContactsFilters } from './ContactsFilters'
import { ContactBadges } from './ContactBadges'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
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

  // Helper component for empty cell display  
  const EmptyCell = () => (
    <span className="text-sm italic text-muted-foreground">—</span>
  )

  // Column definitions for DataTable
  const contactColumns: DataTableColumn<ContactWithOrganization>[] = [
    {
      key: 'expansion',
      header: '',
      cell: (contact) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(contact.id)}
          className="size-8 p-0 hover:bg-muted"
        >
          {isRowExpanded(contact.id) ? 
            <ChevronDown className="size-4 text-muted-foreground" /> : 
            <ChevronRight className="size-4 text-muted-foreground" />
          }
        </Button>
      ),
      className: "w-8"
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (contact) => (
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold text-foreground">
            {contact.first_name} {contact.last_name}
          </div>
          {contact.is_primary_contact && (
            <span className="fill-current text-yellow-500">⭐</span>
          )}
        </div>
      ),
      className: "font-semibold"
    },
    ...(showOrganization ? [{
      key: 'organization' as keyof ContactWithOrganization,
      header: 'Organization',
      cell: (contact: ContactWithOrganization) => (
        <span className="text-foreground">
          {contact.organization?.name || <EmptyCell />}
        </span>
      ),
      hidden: { sm: true }
    }] : []),
    {
      key: 'position',
      header: 'Position',
      cell: (contact) => (
        <span className="text-foreground">
          {contact.title || <EmptyCell />}
        </span>
      ),
      hidden: { sm: true }
    },
    {
      key: 'primary_contact',
      header: 'Primary Contact',
      cell: (contact) => {
        // Extract primary contact info directly instead of using hook
        const primaryContactInfo = contact.phone || contact.email || null
        return (
          <div className="flex items-center gap-2">
            {primaryContactInfo ? (
              <>
                <span className="text-muted-foreground">📞</span>
                <span className="font-mono text-sm text-muted-foreground">
                  {primaryContactInfo}
                </span>
              </>
            ) : (
              <EmptyCell />
            )}
          </div>
        )
      },
      hidden: { sm: true, md: true }
    },
    {
      key: 'status',
      header: 'Status',
      cell: (contact) => (
        <div className="flex justify-center">
          <ContactBadges 
            contact={contact}
            showPriority={true}
            showInfluence={false}
            showAuthority={false}
            className="justify-center"
          />
        </div>
      ),
      className: "text-center",
      hidden: { sm: true }
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      cell: (contact) => (
        <div className="flex items-center justify-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact)}
              className="size-8 p-0 hover:bg-blue-100 hover:text-blue-700"
              title="Edit Contact"
            >
              ✏️
            </Button>
          )}
          
          {onContact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onContact(contact)}
              className="size-8 p-0 hover:bg-green-100 hover:text-green-700"
              title="Contact Person"
            >
              📞
            </Button>
          )}
          
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(contact)}
              className="size-8 p-0 hover:bg-muted hover:text-muted-foreground"
              title="View Details"
            >
              👁️
            </Button>
          )}
        </div>
      ),
      className: "w-32"
    }
  ]

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

      {/* Table Container with Row Expansion */}
      <div className="space-y-0">
        <DataTable<ContactWithOrganization>
          data={filteredContacts}
          columns={contactColumns}
          loading={loading}
          rowKey={(contact) => contact.id}
          empty={{
            title: activeFilter !== 'all' ? 'No contacts match your criteria' : 'No contacts found',
            description: activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first contact'
          }}
        />
        
        {/* Expanded Row Details */}
        {filteredContacts
          .filter((contact) => isRowExpanded(contact.id))
          .map((contact) => (
            <div 
              key={`${contact.id}-details`} 
              className="-mt-px border-x border-b bg-muted/50 p-6"
              style={{ marginTop: '-1px' }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Contact Information */}
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Contact Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {contact.email && <div>Email: {contact.email}</div>}
                    {contact.phone && <div>Phone: {contact.phone}</div>}
                    {contact.department && <div>Department: {contact.department}</div>}
                  </div>
                </div>

                {/* Organization Details */}
                {contact.organization && (
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">Organization</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Name: {contact.organization.name}</div>
                      <div>Type: {contact.organization.type}</div>
                      {contact.organization.segment && <div>Segment: {contact.organization.segment}</div>}
                    </div>
                  </div>
                )}

                {/* Authority & Influence */}
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Role Details</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {contact.purchase_influence && <div>Influence: {contact.purchase_influence}</div>}
                    {contact.decision_authority && <div>Authority: {contact.decision_authority}</div>}
                    <div>Primary Contact: {contact.is_primary_contact ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default ContactsTable
