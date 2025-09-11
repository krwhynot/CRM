import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { BulkActionsProvider, BulkActionsToolbar, useBulkActionsContext } from '@/components/shared/BulkActions'
import { BulkDeleteDialog } from './BulkDeleteDialog'
import { OrganizationsFilters } from './OrganizationsFilters'
import { OrganizationExpandedContent } from './table/OrganizationExpandedContent'
import { useOrganizationColumns } from './table/OrganizationRow'
import { useOrganizationsDisplay } from '@/features/organizations/hooks/useOrganizationsDisplay'
import { useDeleteOrganization } from '@/features/organizations/hooks/useOrganizations'
import { useTableFiltersWithData } from '@/hooks/table'
import { DEFAULT_ORGANIZATIONS } from '../data/defaultOrganizations'
import type { Organization } from '@/types/entities'
import type { OrganizationWeeklyFilters } from '@/types/shared-filters.types'

// Extended organization interface with weekly context
interface OrganizationWithWeeklyContext extends Organization {
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    list_price?: number
    opportunity_count?: number
  }>
  total_opportunities?: number
  active_opportunities?: number
  total_products?: number
  weekly_engagement_score?: number
  last_interaction_date?: string | Date
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
}

interface OrganizationsTableProps {
  organizations?: OrganizationWithWeeklyContext[]
  loading?: boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  onAddNew?: () => void
  filters?: OrganizationWeeklyFilters
  onFiltersChange?: (filters: OrganizationWeeklyFilters) => void
}

// Separated container component that uses the BulkActionsProvider
function OrganizationsTableContainer({
  organizations = DEFAULT_ORGANIZATIONS as OrganizationWithWeeklyContext[],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onContact,
  onAddNew,
  filters,
  onFiltersChange,
}: OrganizationsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Enhanced filtering state
  const [organizationFilters, setOrganizationFilters] = useState<OrganizationWeeklyFilters>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...filters
  })

  const deleteOrganization = useDeleteOrganization()

  // Filtering logic
  const filterFunction = (items: OrganizationWithWeeklyContext[], filters: OrganizationWeeklyFilters) => {
    return items.filter(organization => {
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = (
          organization.name?.toLowerCase().includes(searchTerm) ||
          organization.primary_manager_name?.toLowerCase().includes(searchTerm) ||
          organization.phone?.toLowerCase().includes(searchTerm) ||
          organization.segment?.toLowerCase().includes(searchTerm) ||
          organization.city?.toLowerCase().includes(searchTerm)
        )
        if (!matchesSearch) return false
      }

      // Apply quick view filters
      if (filters.quickView && filters.quickView !== 'none') {
        switch (filters.quickView) {
          case 'high_engagement':
            return organization.high_engagement_this_week || (organization.weekly_engagement_score || 0) > 70
          case 'multiple_opportunities':
            return (organization.active_opportunities || 0) > 1
          case 'inactive_orgs':
            return organization.inactive_status || (organization.weekly_engagement_score || 0) < 30
          default:
            break
        }
      }

      return true
    })
  }

  const { filteredData: filteredOrganizations } = useTableFiltersWithData(
    organizations,
    {
      initialFilters: organizationFilters,
      filterFunction,
      onFiltersChange: (newFilters) => {
        setOrganizationFilters(newFilters)
        onFiltersChange?.(newFilters)
      },
    }
  )

  const { toggleRowExpansion, isRowExpanded } = useOrganizationsDisplay(
    organizations.map((org) => org.id)
  )

  // Access bulk actions context
  const { selection, bulkActions, selectedItems } = useBulkActionsContext<OrganizationWithWeeklyContext>()

  // Column definitions using the extracted hook
  const columns = useOrganizationColumns({
    selectedItems: selection.selectedItems,
    onSelectAll: selection.handleSelectAll,
    onSelectItem: selection.handleSelectItem,
    onToggleExpansion: toggleRowExpansion,
    isRowExpanded,
    onEdit,
    onDelete,
    onView,
    onContact,
  })

  // Bulk delete handler
  const handleBulkDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    const selectedIds = selection.getSelectedIds()
    if (selectedIds.length === 0) return

    try {
      await bulkActions.executeBulkDelete(selectedItems, async (id) => {
        await deleteOrganization.mutateAsync(id)
      })
      
      // Clear selection on success
      selection.clearSelection()
    } catch (error) {
      // Error handling is done in the bulk actions hook
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  // Expandable content renderer
  const renderExpandableContent = (organization: OrganizationWithWeeklyContext) => (
    <OrganizationExpandedContent
      organization={organization}
      isExpanded={isRowExpanded(organization.id)}
    />
  )

  const emptyMessage = organizationFilters.search || organizationFilters.quickView !== 'none' 
    ? 'No organizations match your criteria'
    : 'No organizations found'
  const emptySubtext = organizationFilters.search || organizationFilters.quickView !== 'none'
    ? 'Try adjusting your filters'
    : 'Get started by adding your first organization'

  return (
    <div className="space-y-4">
      {/* Filters Component */}
      <OrganizationsFilters
        filters={organizationFilters}
        onFiltersChange={setOrganizationFilters}
        principals={[]}
        isLoading={loading}
        totalOrganizations={organizations.length}
        filteredCount={filteredOrganizations.length}
        showBadges={true}
        onAddNew={onAddNew}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selection.getSelectedCount()}
        totalCount={filteredOrganizations.length}
        onDelete={handleBulkDelete}
        onClearSelection={selection.clearSelection}
        onSelectAll={() => selection.handleSelectAll(true, filteredOrganizations)}
        onSelectNone={() => selection.handleSelectAll(false, filteredOrganizations)}
        entityType="organizations"
        isLoading={bulkActions.progress.isRunning}
      />

      {/* Table Container with Integrated Row Expansion */}
      <DataTable<OrganizationWithWeeklyContext>
        data={filteredOrganizations}
        columns={columns}
        loading={loading}
        rowKey={(organization) => organization.id}
        expandableContent={renderExpandableContent}
        expandedRows={filteredOrganizations
          .filter((organization) => isRowExpanded(organization.id))
          .map((organization) => organization.id)}
        onToggleRow={toggleRowExpansion}
        empty={{
          title: emptyMessage,
          description: emptySubtext,
        }}
      />

      {/* Results Summary */}
      {filteredOrganizations.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-gray-500">
          <span>
            Showing {filteredOrganizations.length} of {organizations.length} organizations
          </span>
          <span>
            {organizationFilters.quickView !== 'none' &&
              `Quick View: ${organizationFilters.quickView?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
          </span>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedItems}
        onConfirm={handleConfirmDelete}
        isDeleting={bulkActions.progress.isRunning}
      />
    </div>
  )
}

// Main exported component with BulkActionsProvider
export function OrganizationsTable(props: OrganizationsTableProps) {
  const displayOrganizations = props.organizations || DEFAULT_ORGANIZATIONS as OrganizationWithWeeklyContext[]

  return (
    <BulkActionsProvider<OrganizationWithWeeklyContext>
      items={displayOrganizations}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name || 'Unnamed Organization'}
      entityType="organization"
      entityTypePlural="organizations"
    >
      <OrganizationsTableContainer {...props} />
    </BulkActionsProvider>
  )
}