import { DataTable, DataTableColumn, commonActions } from './data-table'
import { Badge } from './badge'
import type { ContactWithOrganization } from '@/types/entities'

// Example usage of the DataTable component with Contacts
interface ContactsDataTableProps {
  contacts: ContactWithOrganization[]
  loading?: boolean
  onEdit?: (contact: ContactWithOrganization) => void
  onDelete?: (contact: ContactWithOrganization) => void
  onView?: (contact: ContactWithOrganization) => void
  onAddNew?: () => void
}

export function ContactsDataTable({
  contacts,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAddNew
}: ContactsDataTableProps) {
  const columns: DataTableColumn<ContactWithOrganization>[] = [
    {
      id: 'name',
      header: 'Name',
      searchable: true,
      cell: (contact) => (
        <div>
          <div className="font-semibold">
            {contact.first_name} {contact.last_name}
          </div>
          {contact.title && (
            <div className="text-sm text-gray-500">{contact.title}</div>
          )}
        </div>
      )
    },
    {
      id: 'organization',
      header: 'Organization',
      searchable: true,
      cell: (contact) => contact.organization?.name || 'N/A'
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      searchable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone'
    },
    {
      id: 'role',
      header: 'Role',
      cell: (contact) => contact.role ? (
        <Badge variant="outline">
          {contact.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      ) : 'N/A'
    }
  ]

  const actions = [
    ...(onView ? [commonActions.view(onView)] : []),
    ...(onEdit ? [commonActions.edit(onEdit)] : []),
    ...(onDelete ? [commonActions.delete(onDelete)] : [])
  ]

  return (
    <DataTable
      data={contacts}
      columns={columns}
      actions={actions}
      loading={loading}
      searchPlaceholder="Search contacts..."
      onAddNew={onAddNew}
      addNewLabel="Add Contact"
      emptyStateMessage="No contacts found."
      searchableFields={['first_name', 'last_name', 'email']}
    />
  )
}

// Example with Opportunities
import type { OpportunityWithRelations } from '@/types/entities'

interface OpportunitiesDataTableProps {
  opportunities: OpportunityWithRelations[]
  loading?: boolean
  onEdit?: (opportunity: OpportunityWithRelations) => void
  onDelete?: (opportunity: OpportunityWithRelations) => void
  onView?: (opportunity: OpportunityWithRelations) => void
  onAddNew?: () => void
}

export function OpportunitiesDataTable({
  opportunities,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAddNew
}: OpportunitiesDataTableProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-gray-100 text-gray-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-yellow-100 text-yellow-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed_won': return 'bg-green-100 text-green-800'
      case 'closed_lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: DataTableColumn<OpportunityWithRelations>[] = [
    {
      id: 'name',
      header: 'Opportunity',
      searchable: true,
      cell: (opportunity) => (
        <div>
          <div className="font-semibold">{opportunity.name}</div>
          {opportunity.contact && (
            <div className="text-sm text-gray-500">
              Contact: {opportunity.contact.first_name} {opportunity.contact.last_name}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'organization',
      header: 'Organization',
      searchable: true,
      cell: (opportunity) => opportunity.organization?.name || 'N/A'
    },
    {
      id: 'stage',
      header: 'Stage',
      cell: (opportunity) => (
        <Badge className={getStageColor(opportunity.stage)}>
          {opportunity.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      )
    },
    {
      id: 'value',
      header: 'Value',
      cell: (opportunity) => formatCurrency(opportunity.estimated_value)
    },
    {
      id: 'probability',
      header: 'Probability',
      cell: (opportunity) => opportunity.probability ? `${opportunity.probability}%` : 'N/A'
    }
  ]

  const actions = [
    ...(onView ? [commonActions.view(onView)] : []),
    ...(onEdit ? [commonActions.edit(onEdit)] : []),
    ...(onDelete ? [commonActions.delete(onDelete)] : [])
  ]

  return (
    <DataTable
      data={opportunities}
      columns={columns}
      actions={actions}
      loading={loading}
      searchPlaceholder="Search opportunities..."
      onAddNew={onAddNew}
      addNewLabel="Add Opportunity"
      emptyStateMessage="No opportunities found."
      searchableFields={['name']}
    />
  )
}