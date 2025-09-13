import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { BulkActionsProvider } from '@/components/shared/BulkActions/BulkActionsProvider'
import { BulkActionsToolbar } from '@/components/shared/BulkActions/BulkActionsToolbar'
import { OrganizationExpandedContent } from './table/OrganizationExpandedContent'
import { useOrganizationColumns } from './table/OrganizationRow'
import {
  useOrganizationTableData,
  type OrganizationWithWeeklyContext,
} from '../hooks/useOrganizationTableData'
import { useOrganizationActions } from '../hooks/useOrganizationActions'
import { semanticSpacing } from '@/styles/tokens'
import type { Organization } from '@/types/entities'

interface OrganizationsTableProps {
  filters?: any
  organizations?: OrganizationWithWeeklyContext[]
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
}

function OrganizationsTableContainer({ filters, onEdit, onDelete }: OrganizationsTableProps) {
  // Data management
  const {
    sortedOrganizations,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  } = useOrganizationTableData({ filters })

  // Actions
  const { selectedItems, handleSelectItem, handleEditOrganization, handleDeleteOrganization } =
    useOrganizationActions()

  // Use passed props if available, otherwise use local handlers
  const handleEdit = onEdit || handleEditOrganization
  const handleDelete = onDelete || handleDeleteOrganization

  // Column definitions with actions
  const columns = useOrganizationColumns({
    selectedItems,
    onSelectAll: (checked, items) => {
      if (checked) {
        items.forEach((item) => handleSelectItem(item.id, true))
      } else {
        items.forEach((item) => handleSelectItem(item.id, false))
      }
    },
    onSelectItem: handleSelectItem,
    onToggleExpansion: toggleRowExpansion,
    isRowExpanded,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  return (
    <div className={semanticSpacing.layoutContainer}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar entityType="organization" entityTypePlural="organizations" />

      {/* Data Table */}
      <Card>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<OrganizationWithWeeklyContext>
            data={sortedOrganizations}
            columns={columns}
            rowKey={(row) => row.id}
            loading={isLoading}
            empty={{
              title: emptyMessage,
              description: emptySubtext,
            }}
            features={{ virtualization: 'auto' }}
            expandableContent={(organization) => (
              <OrganizationExpandedContent organization={organization} />
            )}
            expandedRows={sortedOrganizations
              .filter((organization) => isRowExpanded(organization.id))
              .map((organization) => organization.id)}
            onToggleRow={toggleRowExpansion}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function OrganizationsTable({
  filters,
  organizations,
  onEdit,
  onDelete,
}: OrganizationsTableProps) {
  return (
    <BulkActionsProvider<OrganizationWithWeeklyContext>
      items={organizations || []}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name || 'Unnamed Organization'}
      entityType="organization"
      entityTypePlural="organizations"
    >
      <OrganizationsTableContainer filters={filters} onEdit={onEdit} onDelete={onDelete} />
    </BulkActionsProvider>
  )
}
