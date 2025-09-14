import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { BulkActionsProvider } from '@/components/shared/BulkActions/BulkActionsProvider'
import { BulkActionsToolbar } from '@/components/shared/BulkActions/BulkActionsToolbar'
import { OpportunityExpandedContent } from './table/OpportunityExpandedContent'
import { useOpportunityColumns } from './table/OpportunityRow'
import { useOpportunityTableData } from '../hooks/useOpportunityTableData'
import { useOpportunityActions } from '../hooks/useOpportunityActions'
import { semanticSpacing } from '@/styles/tokens'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableProps {
  filters?: any
  opportunities?: OpportunityWithLastActivity[]
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
}

function OpportunitiesTableContainer({ filters, onEdit, onDelete }: OpportunitiesTableProps) {
  // Data management
  const {
    sortedOpportunities,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  } = useOpportunityTableData({ filters })

  // Actions
  const {
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    handleEditOpportunity,
    handleDeleteOpportunity,
  } = useOpportunityActions()

  // Use passed props if available, otherwise use local handlers
  const handleEdit = onEdit || handleEditOpportunity
  const handleDelete = onDelete || handleDeleteOpportunity

  // Column definitions with actions
  const columns = useOpportunityColumns({
    selectedItems,
    onSelectAll: handleSelectAll,
    onSelectItem: handleSelectItem,
    onToggleExpansion: toggleRowExpansion,
    isRowExpanded,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  return (
    <div className={semanticSpacing.layoutContainer}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar entityType="opportunity" entityTypePlural="opportunities" />

      {/* Data Table */}
      <Card>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<OpportunityWithLastActivity>
            data={sortedOpportunities}
            columns={columns}
            rowKey={(row) => row.id}
            loading={isLoading}
            empty={{
              title: emptyMessage,
              description: emptySubtext,
            }}
            features={{ virtualization: 'auto' }}
            expandableContent={(opportunity) => (
              <OpportunityExpandedContent opportunity={opportunity} />
            )}
            expandedRows={sortedOpportunities
              .filter((opportunity) => isRowExpanded(opportunity.id))
              .map((opportunity) => opportunity.id)}
            onToggleRow={toggleRowExpansion}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function OpportunitiesTable({
  filters,
  opportunities,
  onEdit,
  onDelete,
}: OpportunitiesTableProps) {
  return (
    <BulkActionsProvider<OpportunityWithLastActivity>
      items={opportunities || []}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name || 'Unnamed Opportunity'}
      entityType="opportunity"
      entityTypePlural="opportunities"
    >
      <OpportunitiesTableContainer filters={filters} onEdit={onEdit} onDelete={onDelete} />
    </BulkActionsProvider>
  )
}

