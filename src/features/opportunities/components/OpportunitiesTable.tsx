import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { useOpportunitiesWithLastActivity, useDeleteOpportunity } from '../hooks/useOpportunities'
import { useOpportunitiesSearch } from '../hooks/useOpportunitiesSearch'
import { useOpportunitiesSelection } from '../hooks/useOpportunitiesSelection'
import { useOpportunitiesSorting } from '../hooks/useOpportunitiesSorting'
import { useOpportunitiesFormatting } from '../hooks/useOpportunitiesFormatting'
import { useOpportunitiesDisplay } from '../hooks/useOpportunitiesDisplay'
import { OpportunitiesFilters } from './OpportunitiesFilters'
import { OpportunitiesTableActions } from './OpportunitiesTableActions'
import { OpportunityRowDetails } from './OpportunityRowDetails'
import { toast } from '@/lib/toast-styles'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatTimeAgo, isOpportunityStalled, getStalledDays } from '@/lib/utils'
import type { OpportunityFilters, InteractionWithRelations } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  onAddNew?: () => void

  // Activity handlers for inline details
  onAddInteraction?: (opportunityId: string) => void
  onEditInteraction?: (interaction: InteractionWithRelations) => void
  onDeleteInteraction?: (interaction: InteractionWithRelations) => void
  onInteractionItemClick?: (interaction: InteractionWithRelations) => void
}

export function OpportunitiesTable({
  filters,
  onEdit,
  onDelete,
  onView: _onView, // eslint-disable-line @typescript-eslint/no-unused-vars
  onAddNew: _onAddNew, // eslint-disable-line @typescript-eslint/no-unused-vars
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick,
}: OpportunitiesTableProps) {
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Hooks
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity(filters)
  const deleteOpportunity = useDeleteOpportunity()

  const { searchTerm, setSearchTerm, filteredOpportunities } = useOpportunitiesSearch(opportunities)

  const { selectedItems, handleSelectAll, handleSelectItem, clearSelection } =
    useOpportunitiesSelection()

  const { sortedOpportunities } = useOpportunitiesSorting(filteredOpportunities)

  const { getStageConfig, formatCurrency, formatActivityType } = useOpportunitiesFormatting()

  const { toggleRowExpansion, isRowExpanded } = useOpportunitiesDisplay(
    sortedOpportunities.map((opp) => opp.id)
  )

  // Convert Set to Array for easier manipulation
  const selectedIds = Array.from(selectedItems)
  const selectedOpportunities = opportunities.filter((opp) => selectedItems.has(opp.id))

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
          // Log error to results for user feedback
          results.push({
            id: opportunityId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully archived ${successCount} opportunit${successCount !== 1 ? 'ies' : 'y'}`
        )
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
      // Handle unexpected errors during bulk delete operation
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Column definitions for DataTable
  const opportunityColumns: DataTableColumn<OpportunityWithLastActivity>[] = [
    {
      key: 'selection',
      header: (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.size > 0 && selectedItems.size === sortedOpportunities.length}
            onCheckedChange={(checked) => handleSelectAll(!!checked, sortedOpportunities)}
            aria-label="Select all opportunities"
          />
        </div>
      ),
      cell: (opportunity) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(opportunity.id)}
            className="h-auto p-0 text-gray-400 hover:bg-transparent hover:text-gray-600"
            aria-label={isRowExpanded(opportunity.id) ? 'Collapse details' : 'Expand details'}
          >
            {isRowExpanded(opportunity.id) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
          <Checkbox
            checked={selectedItems.has(opportunity.id)}
            onCheckedChange={(checked) => handleSelectItem(opportunity.id, !!checked)}
            aria-label={`Select ${opportunity.name}`}
          />
        </div>
      ),
      className: 'w-[60px] px-6 py-3',
    },
    {
      key: 'company',
      header: 'Company / Opportunity',
      cell: (opportunity) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {opportunity.organization?.name || 'No Organization'}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {opportunity.name} • {opportunity.interaction_count || 0} activities
          </div>
        </div>
      ),
      className: 'w-[35%] px-6 py-3',
    },
    {
      key: 'stage',
      header: 'Stage',
      cell: (opportunity) => {
        const stalled = isOpportunityStalled(
          opportunity.stage_updated_at || null,
          opportunity.created_at || ''
        )
        const stalledDays = stalled
          ? getStalledDays(opportunity.stage_updated_at || null, opportunity.created_at || '')
          : 0
        const stageConfig = getStageConfig(opportunity.stage)

        return (
          <div className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', stageConfig.dot)}></span>
            {stalled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="size-2 animate-pulse rounded-full bg-red-500"></span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stalled for {stalledDays} days</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="text-sm font-medium">{opportunity.stage}</span>
            <span className="text-xs text-gray-400">{stageConfig.position}/7</span>
          </div>
        )
      },
      className: 'w-[20%] px-6 py-3',
      hidden: { sm: true },
    },
    {
      key: 'value',
      header: 'Value / Probability',
      cell: (opportunity) => (
        <div>
          <div className="text-sm font-medium">{formatCurrency(opportunity.estimated_value)}</div>
          <div className="text-xs text-gray-500">
            {opportunity.probability ? `${opportunity.probability}% likely` : 'No probability'}
          </div>
        </div>
      ),
      className: 'w-[15%] px-6 py-3 text-right',
      hidden: { sm: true, md: true },
    },
    {
      key: 'last_activity',
      header: 'Last Activity',
      cell: (opportunity) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatTimeAgo(opportunity.last_activity_date || null)}
          </div>
          <div className="text-xs text-gray-500">
            {formatActivityType(opportunity.last_activity_type || null)}
          </div>
        </div>
      ),
      className: 'w-[20%] px-6 py-3 text-right',
      hidden: { sm: true },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (opportunity) => (
        <OpportunitiesTableActions
          opportunity={opportunity}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={() => toggleRowExpansion(opportunity.id)}
        />
      ),
      className: 'w-[10%] px-6 py-3 text-right',
    },
  ]

  const emptyMessage = searchTerm ? 'No opportunities match your search.' : 'No opportunities yet'
  const emptySubtext = searchTerm
    ? 'Try adjusting your search terms'
    : 'Get started by adding your first opportunity'

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

      {/* Table Container with Row Expansion */}
      <div className="space-y-0">
        <DataTable<OpportunityWithLastActivity>
          data={sortedOpportunities}
          columns={opportunityColumns}
          loading={isLoading}
          rowKey={(opportunity) => opportunity.id}
          empty={{
            title: emptyMessage,
            description: emptySubtext,
          }}
        />

        {/* Expanded Row Details */}
        {sortedOpportunities
          .filter((opportunity) => isRowExpanded(opportunity.id))
          .map((opportunity) => (
            <div
              key={`${opportunity.id}-details`}
              className="-mt-px border-x border-b bg-gray-50/50 p-6"
              style={{ marginTop: '-1px' }}
            >
              <OpportunityRowDetails
                opportunity={opportunity}
                interactions={[]} // For now, pass empty - will be improved later
                activitiesLoading={false}
                onAddInteraction={() => onAddInteraction?.(opportunity.id)}
                onEditInteraction={onEditInteraction}
                onDeleteInteraction={onDeleteInteraction}
                onInteractionItemClick={onInteractionItemClick}
              />
            </div>
          ))}
      </div>

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedOpportunities as any} // Future: Create generic BulkDeleteDialog
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
