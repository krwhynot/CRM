import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { BulkActionsProvider } from '@/components/shared/BulkActions/BulkActionsProvider'
import { BulkActionsToolbar } from '@/components/shared/BulkActions/BulkActionsToolbar'
import { InteractionExpandedContent, useInteractionColumns } from './table'
import { useInteractionTableData } from '../hooks/useInteractionTableData'
import { useInteractionActions } from '../hooks/useInteractionActions'
import { semanticSpacing } from '@/styles/tokens'
import type { InteractionWithRelations } from '@/types/interaction.types'

interface InteractionsTableProps {
  filters?: any
  interactions?: InteractionWithRelations[]
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
}

function InteractionsTableContainer({ filters, onEdit, onDelete }: InteractionsTableProps) {
  // Data management
  const {
    sortedInteractions,
    filteredInteractions,
    isLoading,
    expandedRows,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  } = useInteractionTableData({ filters })

  // Actions
  const {
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    handleEditInteraction,
    handleDeleteInteraction,
    handleViewInteraction,
  } = useInteractionActions()

  // Use passed props if available, otherwise use local handlers
  const handleEdit = onEdit || handleEditInteraction
  const handleDelete = onDelete || handleDeleteInteraction

  // Column definitions with actions
  const columns = useInteractionColumns({
    selectedItems,
    expandedRows,
    filteredInteractions: filteredInteractions || sortedInteractions,
    handleSelectAll,
    handleSelectItem,
    toggleRowExpansion,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleViewInteraction,
  })

  return (
    <div className={semanticSpacing.layoutContainer}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar entityType="interaction" entityTypePlural="interactions" />

      {/* Data Table */}
      <Card>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<InteractionWithRelations>
            data={sortedInteractions}
            columns={columns}
            rowKey={(row) => row.id}
            loading={isLoading}
            empty={{
              title: emptyMessage,
              description: emptySubtext,
            }}
            features={{ virtualization: 'auto' }}
            expandableContent={(interaction) => (
              <InteractionExpandedContent interaction={interaction} />
            )}
            expandedRows={sortedInteractions
              .filter((interaction) => isRowExpanded(interaction.id))
              .map((interaction) => interaction.id)}
            onToggleRow={toggleRowExpansion}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function InteractionsTable({
  filters,
  interactions,
  onEdit,
  onDelete,
}: InteractionsTableProps) {
  return (
    <BulkActionsProvider<InteractionWithRelations>
      items={interactions || []}
      getItemId={(item) => item.id}
      getItemName={(item) => item.subject || 'No subject'}
      entityType="interaction"
      entityTypePlural="interactions"
    >
      <InteractionsTableContainer filters={filters} onEdit={onEdit} onDelete={onDelete} />
    </BulkActionsProvider>
  )
}
