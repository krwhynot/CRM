import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { BulkActionsProvider } from '@/components/shared/BulkActions/BulkActionsProvider'
import { BulkActionsToolbar } from '@/components/shared/BulkActions/BulkActionsToolbar'
import { ContactExpandedContent, useContactColumns } from './table'
import { useContactTableData } from '../hooks/useContactTableData'
import { useContactActions } from '../hooks/useContactActions'
// Removed unused: import { cn } from '@/lib/utils'
import { semanticSpacing } from '@/styles/tokens'
import type { Contact } from '@/types/entities'

// Extended contact interface with weekly context and decision authority tracking
interface ContactWithWeeklyContext extends Contact {
  decision_authority?: string
  decision_authority_level?: 'high' | 'medium' | 'low'
  purchase_influence?: string
  purchase_influence_score?: number
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean
  high_value_contact?: boolean
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean
  is_primary_contact?: boolean
  organization?: {
    name: string
    type: string
    segment?: string
  }
}

interface ContactsTableProps {
  filters?: any
  contacts?: ContactWithWeeklyContext[]
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
}

function ContactsTableContainer({ filters, onEdit, onDelete }: ContactsTableProps) {
  // Data management
  const {
    sortedContacts,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  } = useContactTableData({ filters })

  // Actions
  const { selectedItems, handleSelectItem, handleEditContact, handleDeleteContact } =
    useContactActions()

  // Use passed props if available, otherwise use local handlers
  const handleEdit = onEdit || handleEditContact
  const handleDelete = onDelete || handleDeleteContact

  // Column definitions with actions
  const columns = useContactColumns({
    selectedItems,
    handleSelectItem,
    toggleRowExpansion,
    isRowExpanded,
    onEditContact: handleEdit,
    onDeleteContact: handleDelete,
  })

  return (
    <div className={semanticSpacing.layoutContainer}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar entityType="contact" entityTypePlural="contacts" />

      {/* Data Table */}
      <Card>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<ContactWithWeeklyContext>
            data={sortedContacts}
            columns={columns}
            rowKey={(row) => row.id}
            loading={isLoading}
            empty={{
              title: emptyMessage,
              description: emptySubtext,
            }}
            features={{ virtualization: 'auto' }}
            expandableContent={(contact) => <ContactExpandedContent contact={contact} />}
            expandedRows={sortedContacts
              .filter((contact) => isRowExpanded(contact.id))
              .map((contact) => contact.id)}
            onToggleRow={toggleRowExpansion}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function ContactsTable({ filters, contacts, onEdit, onDelete }: ContactsTableProps) {
  return (
    <BulkActionsProvider<ContactWithWeeklyContext>
      items={contacts || []} // Will be populated by the data hook inside the provider
      getItemId={(item) => item.id}
      getItemName={(item) => `${item.first_name || ''} ${item.last_name || ''}`.trim()}
      entityType="contact"
      entityTypePlural="contacts"
    >
      <ContactsTableContainer filters={filters} onEdit={onEdit} onDelete={onDelete} />
    </BulkActionsProvider>
  )
}
