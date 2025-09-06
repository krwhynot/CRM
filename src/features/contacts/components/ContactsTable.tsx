import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { ContactsFilters } from './ContactsFilters'
import { ContactBadges } from './ContactBadges'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useContactsFiltering } from '@/features/contacts/hooks/useContactsFiltering'
import { useContactsDisplay } from '@/features/contacts/hooks/useContactsDisplay'
import { useContactsSelection } from '@/features/contacts/hooks/useContactsSelection'
import { useDeleteContact } from '@/features/contacts/hooks/useContacts'
import { toast } from '@/lib/toast-styles'
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
  showOrganization = true,
}: ContactsTableProps) {
  // Use DEFAULT_CONTACTS when empty array is passed (for testing purposes)
  const displayContacts = contacts.length === 0 ? DEFAULT_CONTACTS : contacts
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Use custom hooks for all logic
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredContacts,
    filterPills,
  } = useContactsFiltering(displayContacts)

  const { toggleRowExpansion, isRowExpanded } = useContactsDisplay(displayContacts.map((c) => c.id))

  const { selectedItems, handleSelectAll, handleSelectItem, clearSelection } =
    useContactsSelection()

  // Hooks
  const deleteContact = useDeleteContact()

  // Convert Set to Array for easier manipulation
  const selectedIds = Array.from(selectedItems)
  const selectedContacts = displayContacts.filter((contact) => selectedItems.has(contact.id))
  
  // Transform contacts to have 'name' property for BulkDeleteDialog
  const selectedContactsForDialog = selectedContacts.map((contact) => ({
    ...contact,
    name: `${contact.first_name} ${contact.last_name}`,
  }))

  // Bulk action handlers
  const handleSelectAllFromToolbar = () => {
    handleSelectAll(true, filteredContacts)
  }

  const handleSelectNoneFromToolbar = () => {
    handleSelectAll(false, filteredContacts)
  }

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    const results = []
    let successCount = 0
    let errorCount = 0

    try {
      // Process deletions sequentially for maximum safety
      for (const contactId of selectedIds) {
        try {
          await deleteContact.mutateAsync(contactId)
          results.push({ id: contactId, status: 'success' })
          successCount++
        } catch (error) {
          // Log error to results for user feedback
          results.push({
            id: contactId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully archived ${successCount} contact${successCount !== 1 ? 's' : ''}`
        )
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} contacts, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} contact${errorCount !== 1 ? 's' : ''}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        clearSelection()
      }
    } catch (error) {
      // Handle unexpected errors during bulk delete operation
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Helper component for empty cell display
  const EmptyCell = () => <span className="text-sm italic text-muted">—</span>

  // Column definitions for DataTable
  const contactColumns: DataTableColumn<ContactWithOrganization>[] = [
    {
      key: 'selection',
      header: (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.size > 0 && selectedItems.size === filteredContacts.length}
            onCheckedChange={(checked) => handleSelectAll(!!checked, filteredContacts)}
            aria-label="Select all contacts"
          />
        </div>
      ),
      cell: (contact) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(contact.id)}
            className="h-auto p-0 text-gray-400 hover:bg-transparent hover:text-gray-600"
            aria-label={isRowExpanded(contact.id) ? 'Collapse details' : 'Expand details'}
          >
            {isRowExpanded(contact.id) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
          <Checkbox
            checked={selectedItems.has(contact.id)}
            onCheckedChange={(checked) => handleSelectItem(contact.id, !!checked)}
            aria-label={`Select ${contact.first_name} ${contact.last_name}`}
          />
        </div>
      ),
      className: 'w-[60px] px-6 py-3',
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (contact) => (
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold text-primary">
            {contact.first_name} {contact.last_name}
          </div>
          {contact.is_primary_contact && <span className="fill-current text-yellow-500">⭐</span>}
        </div>
      ),
      className: 'font-semibold',
    },
    ...(showOrganization
      ? [
          {
            key: 'organization' as keyof ContactWithOrganization,
            header: 'Organization',
            cell: (contact: ContactWithOrganization) => (
              <span className="text-body">{contact.organization?.name || <EmptyCell />}</span>
            ),
            hidden: { sm: true },
          },
        ]
      : []),
    {
      key: 'position',
      header: 'Position',
      cell: (contact) => <span className="text-body">{contact.title || <EmptyCell />}</span>,
      hidden: { sm: true },
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
                <span className="text-muted">📞</span>
                <span className="font-mono text-sm text-muted">
                  {primaryContactInfo}
                </span>
              </>
            ) : (
              <EmptyCell />
            )}
          </div>
        )
      },
      hidden: { sm: true, md: true },
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
      className: 'text-center',
      hidden: { sm: true },
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
      className: 'w-32',
    },
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
        totalContacts={displayContacts.length}
        filteredCount={filteredContacts.length}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedItems.size}
        totalCount={filteredContacts.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
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
            description:
              activeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first contact',
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
                      {contact.organization.segment && (
                        <div>Segment: {contact.organization.segment}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Authority & Influence */}
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Role Details</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {contact.purchase_influence && (
                      <div>Influence: {contact.purchase_influence}</div>
                    )}
                    {contact.decision_authority && (
                      <div>Authority: {contact.decision_authority}</div>
                    )}
                    <div>Primary Contact: {contact.is_primary_contact ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedContactsForDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        entityType="contact"
        entityTypePlural="contacts"
      />
    </div>
  )
}

export default ContactsTable
