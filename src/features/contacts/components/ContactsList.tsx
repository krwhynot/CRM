import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { createContactColumns } from '@/components/data-table/columns/contacts'
import { EntityListWrapper } from '@/components/layout/EntityListWrapper'
import { useStandardDataTable } from '@/hooks/useStandardDataTable'
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
import { Button } from '@/components/ui/button'
import { Shield, Crown, Users, Star, Mail, Phone, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContactsDisplay } from '@/features/contacts/hooks/useContactsDisplay'
import { useContactsSelection } from '@/features/contacts/hooks/useContactsSelection'
import { useDeleteContact } from '@/features/contacts/hooks/useContacts'
import { toast } from '@/lib/toast-styles'
import { DEFAULT_CONTACTS } from '@/data/sample-contacts'
import type { Contact, ContactWithOrganization } from '@/types/entities'
import type { EntityFilterState } from '@/components/data-table/filters/EntityFilters'

// Extended contact interface with weekly context and decision authority tracking
// Using the same pattern as the original ContactsTable
interface ContactWithWeeklyContext extends ContactWithOrganization {
  // Weekly context
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean
  high_value_contact?: boolean

  // Enhanced authority fields (optional extensions)
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean
}

interface ContactsListProps {
  contacts: ContactWithWeeklyContext[]
  loading?: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  onAddNew?: () => void
  showOrganization?: boolean
  principals?: Array<{ value: string; label: string }>
}

export function ContactsList({
  contacts = DEFAULT_CONTACTS as ContactWithWeeklyContext[],
  loading = false,
  onEdit,
  onView,
  onContact,
  showOrganization = true,
  principals = [],
}: ContactsListProps) {
  // Use DEFAULT_CONTACTS when empty array is passed (for testing purposes)
  const displayContacts = contacts.length === 0 ? DEFAULT_CONTACTS as ContactWithWeeklyContext[] : contacts

  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // EntityFilterState using the same conversion pattern as ContactsFilters.tsx
  const [filters, setFilters] = React.useState<EntityFilterState>({
    search: '',
    timeRange: 'this_month',
    quickView: 'none',
    principal: 'all',
    // Contact-specific filters
    organization_id: undefined,
    purchase_influence: undefined,
    decision_authority: undefined,
  })

  // Standard DataTable configuration with ResponsiveFilterWrapper
  const { dataTableProps } = useStandardDataTable<ContactWithWeeklyContext>({
    useResponsiveFilters: true,
    responsiveFilterTitle: 'Contact Filters',
    responsiveFilterDescription: 'Filter and search your contacts',
    selectable: true,
    expandable: true,
    searchKey: 'email',
    searchPlaceholder: 'Search contacts by name, email, title...',
    pageSize: 25,
  })

  // DataTable will handle filtering via ResponsiveFilterWrapper - no manual filtering needed

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
    handleSelectAll(true, displayContacts)
  }

  const handleSelectNoneFromToolbar = () => {
    handleSelectAll(false, displayContacts)
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

  // Expandable content renderer for interaction history and relationship data
  const renderExpandableContent = (contact: ContactWithWeeklyContext) => (
    <div className="space-y-6">
      {/* Decision Authority & Purchase Influence Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-foreground">Decision Authority</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {contact.decision_authority === 'Decision Maker' || contact.budget_authority ? (
                <Crown className="size-4 text-yellow-500" />
              ) : contact.decision_authority === 'Influencer' || contact.technical_authority ? (
                <Shield className="size-4 text-blue-500" />
              ) : (
                <Users className="size-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {contact.decision_authority === 'Decision Maker' || contact.budget_authority ? 'High Authority' :
                 contact.decision_authority === 'Influencer' || contact.technical_authority ? 'Medium Authority' :
                 'Limited Authority'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {contact.budget_authority && (
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-green-500"></span>
                  Budget Authority
                </div>
              )}
              {contact.technical_authority && (
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-blue-500"></span>
                  Technical Authority
                </div>
              )}
              {contact.user_authority && (
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-purple-500"></span>
                  User Authority
                </div>
              )}
              {contact.decision_authority && (
                <div>Authority Level: {contact.decision_authority}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Purchase Influence</h4>
          <div className="space-y-2">
            {contact.purchase_influence ? (
              <div className="text-sm text-muted-foreground">
                Influence Level: {contact.purchase_influence}
              </div>
            ) : (
              <div className="text-sm italic text-muted-foreground">
                Not assessed
              </div>
            )}

            {contact.high_value_contact && (
              <div className="flex items-center gap-1 text-green-600">
                <Star className="size-3" />
                <span className="text-xs">High Value Contact</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Weekly Context</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Recent Interactions:</span>
              <span className="font-medium">{contact.recent_interactions_count || 0}</span>
            </div>
            {contact.last_interaction_date && (
              <div className="flex justify-between">
                <span>Last Contact:</span>
                <span className="font-medium">
                  {new Date(contact.last_interaction_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {contact.needs_follow_up && (
              <div className="flex items-center gap-1 text-red-600">
                <span className="text-xs">⚠️ Follow-up needed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Original contact details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information */}
        <div>
          <h4 className="mb-2 font-medium text-foreground">Contact Information</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-3" />
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-3" />
                <span>{contact.phone}</span>
              </div>
            )}
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

        {/* Role & Status Details */}
        <div>
          <h4 className="mb-2 font-medium text-foreground">Role Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {contact.title && <div>Title: {contact.title}</div>}
            <div>Primary Contact: {contact.is_primary_contact ? 'Yes' : 'No'}</div>
            {contact.purchase_influence && (
              <div>Purchase Influence: {contact.purchase_influence}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Create columns with actions (selection and expansion handled by DataTable)
  const columns = createContactColumns({
    onEdit,
    onView,
    onDelete: onEdit, // Use edit dialog for deletion workflow
  })

  return (
    <EntityListWrapper
      title="Contacts"
      description="Manage your contact relationships and communication history"
      action={{
        label: "Add Contact",
        onClick: () => onEdit?.({} as Contact),
        icon: <Plus className="size-4" />
      }}
    >
      <div className="space-y-4">
        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedItems.size}
          totalCount={displayContacts.length}
          onBulkDelete={handleBulkDelete}
          onClearSelection={clearSelection}
          onSelectAll={handleSelectAllFromToolbar}
          onSelectNone={handleSelectNoneFromToolbar}
          entityType="contact"
          entityTypePlural="contacts"
        />

        {/* DataTable with integrated ResponsiveFilterWrapper */}
        <DataTable<ContactWithWeeklyContext, unknown>
          data={displayContacts}
          columns={columns}
          loading={loading}
          {...dataTableProps}
          entityFilters={filters}
          onEntityFiltersChange={setFilters}
          principals={principals}
          totalCount={displayContacts.length}
          expandedContent={renderExpandableContent}
          onSelectionChange={(ids) => {
            // Sync selection state with the contacts selection hook
            ids.forEach(id => {
              const isSelected = selectedItems.has(id)
              if (!isSelected) {
                handleSelectItem(id, true)
              }
            })
            // Remove unselected items
            selectedItems.forEach(id => {
              if (!ids.includes(id)) {
                handleSelectItem(id, false)
              }
            })
          }}
          emptyState={{
            title: filters.search || filters.quickView !== 'none'
              ? 'No contacts match your criteria'
              : 'No contacts found',
            description: filters.search || filters.quickView !== 'none'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact',
            action: onEdit && (
              <Button onClick={() => onEdit({} as Contact)} variant="default">
                Add Contact
              </Button>
            )
          }}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          entities={selectedContactsForDialog}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          entityType="contact"
          entityTypePlural="contacts"
        />
      </div>
    </EntityListWrapper>
  )
}

export default ContactsList