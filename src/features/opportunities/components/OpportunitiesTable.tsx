import { useState } from 'react'
import { SimpleTable } from '@/components/ui/simple-table'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { useOpportunitiesWithLastActivity, useDeleteOpportunity } from '../hooks/useOpportunities'
import { useOpportunitiesSearch } from '../hooks/useOpportunitiesSearch'
import { useOpportunitiesSelection } from '../hooks/useOpportunitiesSelection'
import { useOpportunitiesSorting } from '../hooks/useOpportunitiesSorting'
import { useOpportunitiesFormatting } from '../hooks/useOpportunitiesFormatting'
import { useOpportunitiesDisplay } from '../hooks/useOpportunitiesDisplay'
import { OpportunitiesFilters } from './OpportunitiesFilters'
import { OpportunityRow } from './OpportunityRow'
import { toast } from '@/lib/toast-styles'
import type { OpportunityFilters } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  onAddNew?: () => void
  
  // Activity handlers for inline details
  onAddInteraction?: (opportunityId: string) => void /* ui-audit: allow */
  onEditInteraction?: (interaction: any) => void /* ui-audit: allow */
  onDeleteInteraction?: (interaction: any) => void /* ui-audit: allow */
  onInteractionItemClick?: (interaction: any) => void /* ui-audit: allow */
}

export function OpportunitiesTable({ 
  filters,
  onEdit, 
  onDelete, 
  onView,
  onAddNew,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick
}: OpportunitiesTableProps) {
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Hooks
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity(filters)
  const deleteOpportunity = useDeleteOpportunity()

  const { searchTerm, setSearchTerm, filteredOpportunities } = useOpportunitiesSearch(opportunities)
  
  const { selectedItems, handleSelectAll, handleSelectItem, clearSelection } = useOpportunitiesSelection()
  
  const { sortField, sortDirection, handleSort, sortedOpportunities } = useOpportunitiesSorting(filteredOpportunities)
  
  const { getStageConfig, formatCurrency, formatActivityType } = useOpportunitiesFormatting()
  
  const { toggleRowExpansion, isRowExpanded } = useOpportunitiesDisplay(
    sortedOpportunities.map(opp => opp.id)
  )

  // Convert Set to Array for easier manipulation
  const selectedIds = Array.from(selectedItems)
  const selectedOpportunities = opportunities.filter(opp => selectedItems.has(opp.id))

  // Bulk action handlers
  const handleSelectAllFromToolbar = () => {
    handleSelectAll(true, sortedOpportunities)
  }

  const handleSelectNoneFromToolbar = () => {
    handleSelectAll(false, sortedOpportunities)
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
      for (const opportunityId of selectedIds) {
        try {
          await deleteOpportunity.mutateAsync(opportunityId)
          results.push({ id: opportunityId, status: 'success' })
          successCount++
        } catch (error) {
          console.error(`Failed to delete opportunity ${opportunityId}:`, error)
          results.push({ 
            id: opportunityId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully archived ${successCount} opportunit${successCount !== 1 ? 'ies' : 'y'}`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} opportunities, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} opportunit${errorCount !== 1 ? 'ies' : 'y'}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        clearSelection()
      }
      
    } catch (error) {
      console.error('Unexpected error during bulk delete:', error)
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Configure headers with sorting and selection support
  const headers = [
    { 
      label: '', 
      className: 'w-[40px] px-6 py-3',
      isCheckbox: true
    },
    { 
      label: 'Company / Opportunity', 
      className: 'w-[35%] px-6 py-3 text-xs',
      sortable: true,
      sortField: 'company'
    },
    { 
      label: 'Stage', 
      className: 'w-[20%] px-6 py-3 text-xs',
      sortable: true,
      sortField: 'stage'
    },
    { 
      label: 'Value / Probability', 
      className: 'w-[15%] px-6 py-3 text-xs text-right',
      sortable: true,
      sortField: 'value'
    },
    { 
      label: 'Last Activity', 
      className: 'w-[20%] px-6 py-3 text-xs text-right',
      sortable: true,
      sortField: 'last_activity'
    },
    { 
      label: 'Actions', 
      className: 'w-[10%] px-6 py-3 text-xs text-right'
    }
  ]

  const renderOpportunityRow = (opportunity: OpportunityWithLastActivity, isExpanded: boolean, onToggle: () => void) => (
    <OpportunityRow
      key={opportunity.id}
      opportunity={opportunity}
      isSelected={selectedItems.has(opportunity.id)}
      onSelect={handleSelectItem}
      onEdit={onEdit}
      onDelete={onDelete}
      getStageConfig={getStageConfig}
      formatCurrency={formatCurrency}
      formatActivityType={formatActivityType}
      isExpanded={isRowExpanded(opportunity.id)}
      onToggleExpansion={() => toggleRowExpansion(opportunity.id)}
      // For now, pass empty/loading states - will be improved later
      interactions={[]}
      activitiesLoading={false}
      onAddInteraction={() => onAddInteraction?.(opportunity.id)}
      onEditInteraction={onEditInteraction}
      onDeleteInteraction={onDeleteInteraction}
      onInteractionItemClick={onInteractionItemClick}
    />
  )

  const emptyMessage = searchTerm ? 'No opportunities match your search.' : 'No opportunities yet'
  const emptySubtext = searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first opportunity'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <OpportunitiesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalOpportunities={opportunities.length}
        filteredCount={sortedOpportunities.length}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedItems.size}
        totalCount={sortedOpportunities.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
      />

      {/* Table */}
      <SimpleTable
        data={sortedOpportunities}
        loading={isLoading}
        headers={headers}
        renderRow={renderOpportunityRow}
        emptyMessage={emptyMessage}
        emptySubtext={emptySubtext}
        colSpan={6}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectedCount={selectedItems.size}
        totalCount={sortedOpportunities.length}
        onSelectAll={(checked) => handleSelectAll(checked, sortedOpportunities)}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedOpportunities}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}