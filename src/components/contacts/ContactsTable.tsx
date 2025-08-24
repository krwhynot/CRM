import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { ContactsFilters } from './ContactsFilters'
import { ContactRow } from './ContactRow'
import { useContactsFiltering } from '@/hooks/useContactsFiltering'
import { useContactsDisplay } from '@/hooks/useContactsDisplay'
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

// Sample data matching CRM requirements (moved to separate constant for clarity)
const DEFAULT_CONTACTS: ContactWithOrganization[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    title: 'Head Chef',
    email: 'john.smith@040kitchen.com',
    phone: '(555) 123-4567',
    mobile_phone: '(555) 123-4568',
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    is_primary_contact: true,
    organization_id: '1',
    organization: {
      id: '1',
      name: '040 KITCHEN INC',
      type: 'customer' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    department: 'Kitchen Operations',
    linkedin_url: 'https://linkedin.com/in/johnsmith-chef',
    notes: 'Key decision maker for all kitchen equipment purchases',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    title: 'General Manager',
    email: 'sarah.j@2drestaurant.com',
    phone: '(555) 234-5678',
    purchase_influence: 'Medium',
    decision_authority: 'Influencer',
    is_primary_contact: true,
    organization_id: '2',
    organization: {
      id: '2',
      name: '2D RESTAURANT GROUP',
      type: 'customer' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    department: 'Operations',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    first_name: 'David',
    last_name: 'Wilson',
    title: 'Purchasing Manager',
    email: 'dwilson@acmefood.com',
    phone: '(555) 345-6789',
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    is_primary_contact: false,
    organization_id: '3',
    organization: {
      id: '3',
      name: 'ACME FOOD DISTRIBUTORS',
      type: 'distributor' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    department: 'Procurement',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function ContactsTable({ 
  contacts = DEFAULT_CONTACTS, 
  loading = false, 
  onEdit, 
  onDelete, 
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

  // Loading state (simplified)
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 animate-pulse rounded" />
        <div className="h-96 bg-gray-100 animate-pulse rounded" />
      </div>
    )
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
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12" />
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Contact</TableHead>
                {showOrganization && (
                  <TableHead className="font-semibold text-gray-700 min-w-[150px]">Organization</TableHead>
                )}
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">Position</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">Primary Contact</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[150px]">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showOrganization ? 7 : 6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-gray-500">
                        {searchTerm || activeFilter !== 'all' 
                          ? 'No contacts match your criteria' 
                          : 'No contacts found'
                        }
                      </div>
                      <div className="text-sm text-gray-400">
                        {searchTerm || activeFilter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'Get started by adding your first contact'
                        }
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
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
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ContactsTable