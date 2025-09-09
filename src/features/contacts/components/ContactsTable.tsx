import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { ContactsFilters } from './ContactsFilters'
import { ContactBadges } from './ContactBadges'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronRight, Shield, Crown, Users, Star } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useContactsDisplay } from '@/features/contacts/hooks/useContactsDisplay'
import { useContactsSelection } from '@/features/contacts/hooks/useContactsSelection'
import { useDeleteContact } from '@/features/contacts/hooks/useContacts'
import { toast } from '@/lib/toast-styles'
import { DEFAULT_CONTACTS } from '@/data/sample-contacts'
import type { Contact, ContactWithOrganization } from '@/types/entities'
import type { ContactWeeklyFilters } from '@/types/shared-filters.types'

// Extended contact interface with weekly context and decision authority tracking
interface ContactWithWeeklyContext extends ContactWithOrganization {
  // Decision authority tracking
  decision_authority_level?: 'high' | 'medium' | 'low'
  purchase_influence_score?: number
  
  // Weekly context
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean
  high_value_contact?: boolean
  
  // Enhanced authority fields
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean
}

interface ContactsTableProps {
  contacts: ContactWithWeeklyContext[]
  loading?: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  onAddNew?: () => void
  showOrganization?: boolean
  filters?: ContactWeeklyFilters
  onFiltersChange?: (filters: ContactWeeklyFilters) => void
}

export function ContactsTable({
  contacts = DEFAULT_CONTACTS as ContactWithWeeklyContext[],
  loading = false,
  onEdit,
  onView,
  onContact,
  showOrganization = true,
  filters,
  onFiltersChange,
}: ContactsTableProps) {
  // Use DEFAULT_CONTACTS when empty array is passed (for testing purposes)
  const displayContacts = contacts.length === 0 ? DEFAULT_CONTACTS as ContactWithWeeklyContext[] : contacts
  
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Enhanced filtering state
  const [contactFilters, setContactFilters] = useState<ContactWeeklyFilters>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...filters // merge any filters passed as props
  })

  // Simple filtering logic (using the new weekly pattern)
  const filteredContacts = displayContacts.filter(contact => {
    // Apply search filter
    if (contactFilters.search) {
      const searchTerm = contactFilters.search.toLowerCase()
      const matchesSearch = (
        contact.first_name?.toLowerCase().includes(searchTerm) ||
        contact.last_name?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.title?.toLowerCase().includes(searchTerm) ||
        contact.organization?.name?.toLowerCase().includes(searchTerm)
      )
      if (!matchesSearch) return false
    }

    // Apply quick view filters
    if (contactFilters.quickView && contactFilters.quickView !== 'none') {
      switch (contactFilters.quickView) {
        case 'decision_makers':
          return contact.decision_authority_level === 'high' || contact.decision_authority === 'high' || contact.budget_authority
        case 'recent_interactions':
          return (contact.recent_interactions_count || 0) > 0 || contact.last_interaction_date
        case 'needs_follow_up':
          return contact.needs_follow_up || (contact.recent_interactions_count || 0) === 0
        default:
          break
      }
    }

    return true
  })

  // Handle filter changes
  const handleFiltersChange = (newFilters: ContactWeeklyFilters) => {
    setContactFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

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

  // Expandable content renderer
  const renderExpandableContent = (contact: ContactWithWeeklyContext) => (
    <div className="space-y-6">
      {/* Decision Authority & Purchase Influence Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-foreground">Decision Authority</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {contact.decision_authority_level === 'high' || contact.budget_authority ? (
                <Crown className="size-4 text-yellow-500" />
              ) : contact.decision_authority_level === 'medium' || contact.technical_authority ? (
                <Shield className="size-4 text-blue-500" />
              ) : (
                <Users className="size-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {contact.decision_authority_level === 'high' || contact.budget_authority ? 'High Authority' :
                 contact.decision_authority_level === 'medium' || contact.technical_authority ? 'Medium Authority' :
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
                <div>Legacy Authority: {contact.decision_authority}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Purchase Influence</h4>
          <div className="space-y-2">
            {contact.purchase_influence_score ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      contact.purchase_influence_score >= 80 ? "bg-success" :
                      contact.purchase_influence_score >= 60 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ width: `${contact.purchase_influence_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{contact.purchase_influence_score}</span>
              </div>
            ) : contact.purchase_influence ? (
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

        {/* Role & Status Details */}
        <div>
          <h4 className="mb-2 font-medium text-foreground">Role Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {contact.title && <div>Title: {contact.title}</div>}
            <div>Primary Contact: {contact.is_primary_contact ? 'Yes' : 'No'}</div>
            {contact.purchase_influence && (
              <div>Legacy Influence: {contact.purchase_influence}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Column definitions for DataTable
  const contactColumns: DataTableColumn<ContactWithWeeklyContext>[] = [
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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-primary">
              {contact.first_name} {contact.last_name}
            </div>
            
            {/* Decision Authority Icons */}
            {contact.decision_authority_level === 'high' || contact.budget_authority ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Crown className="size-3 text-yellow-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>High Decision Authority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : contact.decision_authority_level === 'medium' || contact.technical_authority ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Shield className="size-3 text-blue-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Medium Decision Authority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            
            {contact.high_value_contact && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Star className="size-3 text-green-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>High Value Contact</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {contact.is_primary_contact && <span className="fill-current text-yellow-500">⭐</span>}
            
            {contact.needs_follow_up && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <span className="size-2 animate-pulse rounded-full bg-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Needs follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {/* Authority Type Badges */}
            {contact.budget_authority && (
              <Badge variant="secondary" className="border-green-200 bg-green-50 text-xs text-green-700">
                Budget
              </Badge>
            )}
            {contact.technical_authority && (
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                Technical
              </Badge>
            )}
            {contact.user_authority && (
              <Badge variant="secondary" className="border-purple-200 bg-purple-50 text-xs text-purple-700">
                User
              </Badge>
            )}
            
            {/* Purchase Influence Badge */}
            {contact.purchase_influence_score && contact.purchase_influence_score > 60 && (
              <Badge variant="secondary" className="border-orange-200 bg-orange-50 text-xs text-orange-700">
                {contact.purchase_influence_score}% influence
              </Badge>
            )}
            
            {/* Recent Activity Badge */}
            {(contact.recent_interactions_count || 0) > 0 && (
              <Badge variant="secondary" className="border-gray-200 bg-gray-50 text-xs text-gray-700">
                {contact.recent_interactions_count} recent
              </Badge>
            )}
          </div>

          {/* Title */}
          {contact.title && (
            <div className="text-xs text-muted-foreground">
              {contact.title}
            </div>
          )}
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
        filters={contactFilters}
        onFiltersChange={handleFiltersChange}
        principals={[]} // TODO: Add principals data from hook
        isLoading={loading}
        totalContacts={displayContacts.length}
        filteredCount={filteredContacts.length}
        showBadges={true}
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

      {/* Table Container with Integrated Row Expansion */}
      <DataTable<ContactWithWeeklyContext>
        data={filteredContacts}
        columns={contactColumns}
        loading={loading}
        rowKey={(contact) => contact.id}
        expandableContent={renderExpandableContent}
        expandedRows={filteredContacts
          .filter((contact) => isRowExpanded(contact.id))
          .map((contact) => contact.id)}
        onToggleRow={toggleRowExpansion}
        empty={{
          title: contactFilters.search || contactFilters.quickView !== 'none' 
            ? 'No contacts match your criteria' 
            : 'No contacts found',
          description: contactFilters.search || contactFilters.quickView !== 'none'
            ? 'Try adjusting your filters'
            : 'Get started by adding your first contact',
        }}
      />

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
