import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { BulkActionsProvider, BulkActionsToolbar, useBulkActionsContext } from '@/components/shared/BulkActions'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { OpportunitiesFilters } from './OpportunitiesFilters'
import { OpportunityExpandedContent } from './table/OpportunityExpandedContent'
import { useOpportunityColumns } from './table/OpportunityRow'
import { useOpportunitiesWithLastActivity, useDeleteOpportunity } from '../hooks/useOpportunities'
import { useOpportunitiesSorting } from '../hooks/useOpportunitiesSorting'
import { useOpportunitiesDisplay } from '../hooks/useOpportunitiesDisplay'
import { useTableFiltersWithData } from '@/hooks/table'
import type { OpportunityFilters } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
}

// Separated container component that uses the BulkActionsProvider
function OpportunitiesTableContainer({
  filters,
  onEdit,
  onDelete,
}: OpportunitiesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Enhanced filtering state
  const [opportunityFilters, setOpportunityFilters] = useState<OpportunityFilters>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...filters
  })

  // Data fetching
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity({
    ...opportunityFilters,
    ...filters
  })
  
  const deleteOpportunity = useDeleteOpportunity()

  // Filtering and sorting
  const filterFunction = (items: OpportunityWithLastActivity[], filters: OpportunityFilters) => {
    // Apply your existing filtering logic here
    return items // simplified for now
  }

  const { filteredData: filteredOpportunities } = useTableFiltersWithData(
    opportunities,
    {
      initialFilters: opportunityFilters,
      filterFunction,
      onFiltersChange: setOpportunityFilters,
    }
  )

  const { sortedOpportunities } = useOpportunitiesSorting(filteredOpportunities)
  const { toggleRowExpansion, isRowExpanded } = useOpportunitiesDisplay(
    sortedOpportunities.map((opp) => opp.id)
  )

  // Access bulk actions context
  const { selection, bulkActions, selectedItems } = useBulkActionsContext<OpportunityWithLastActivity>()

  // Column definitions using the extracted hook
  const columns = useOpportunityColumns({
    selectedItems: selection.selectedItems,
    onSelectAll: selection.handleSelectAll,
    onSelectItem: selection.handleSelectItem,
    onToggleExpansion: toggleRowExpansion,
    isRowExpanded,
    onEdit,
    onDelete,
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
        await deleteOpportunity.mutateAsync(id)
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
  const renderExpandableContent = (opportunity: OpportunityWithLastActivity) => (
    <OpportunityExpandedContent
      opportunity={opportunity}
      isExpanded={isRowExpanded(opportunity.id)}
    />
  )

  const emptyMessage = opportunityFilters.search ? 'No opportunities match your search.' : 'No opportunities yet'
  const emptySubtext = opportunityFilters.search
    ? 'Try adjusting your search terms'
    : 'Get started by adding your first opportunity'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <OpportunitiesFilters
        filters={opportunityFilters}
        onFiltersChange={setOpportunityFilters}
        principals={[]}
        isLoading={isLoading}
        totalOpportunities={opportunities.length}
        filteredCount={sortedOpportunities.length}
        showBadges={true}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selection.getSelectedCount()}
        totalCount={sortedOpportunities.length}
        onDelete={handleBulkDelete}
        onClearSelection={selection.clearSelection}
        onSelectAll={() => selection.handleSelectAll(true, sortedOpportunities)}
        onSelectNone={() => selection.handleSelectAll(false, sortedOpportunities)}
        entityType="opportunities"
        isLoading={bulkActions.progress.isRunning}
      />

      {/* Table */}
      <DataTable<OpportunityWithLastActivity>
        data={sortedOpportunities}
        columns={columns}
        loading={isLoading}
        rowKey={(opportunity) => opportunity.id}
        expandableContent={renderExpandableContent}
        expandedRows={sortedOpportunities
          .filter((opportunity) => isRowExpanded(opportunity.id))
          .map((opportunity) => opportunity.id)}
        onToggleRow={toggleRowExpansion}
        empty={{
          title: emptyMessage,
          description: emptySubtext,
        }}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedItems}
        onConfirm={handleConfirmDelete}
        isDeleting={bulkActions.progress.isRunning}
        entityType="opportunity"
        entityTypePlural="opportunities"
      />
    </div>
  )
}

// Main exported component with BulkActionsProvider
export function OpportunitiesTable(props: OpportunitiesTableProps) {
  const { data: opportunities = [] } = useOpportunitiesWithLastActivity({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...props.filters
  })

  return (
    <BulkActionsProvider<OpportunityWithLastActivity>
      items={opportunities}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name || 'Unnamed Opportunity'}
      entityType="opportunity"
      entityTypePlural="opportunities"
    >
      <OpportunitiesTableContainer {...props} />
    </BulkActionsProvider>
  )
}