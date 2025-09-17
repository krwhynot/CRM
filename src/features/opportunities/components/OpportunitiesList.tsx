import React, { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { createOpportunityColumns } from '@/components/data-table/columns/opportunities'
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
import { useStandardDataTable } from '@/hooks/useStandardDataTable'
import { useOpportunitiesWithLastActivity, useDeleteOpportunity } from '../hooks/useOpportunities'
import { useOpportunitiesSelection } from '../hooks/useOpportunitiesSelection'
import { useOpportunitiesDisplay } from '../hooks/useOpportunitiesDisplay'
import { InteractionTimelineEmbed } from '@/features/interactions/components/InteractionTimelineEmbed'
import { QuickInteractionBar } from '@/features/interactions/components/QuickInteractionBar'
import { toast } from '@/lib/toast-styles'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile, useIsIPad } from '@/hooks/useMediaQuery'
import type { OpportunityFilters } from '@/types/opportunity.types'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import { useQueryClient } from '@tanstack/react-query'
import { interactionKeys } from '@/features/interactions/hooks/useInteractions'

interface OpportunitiesListProps {
  initialFilters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
}

export function OpportunitiesList({
  initialFilters,
  onEdit,
  onDelete,
}: OpportunitiesListProps) {
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Tab state for expanded rows
  const [activeTabs, setActiveTabs] = useState<Record<string, 'interactions' | 'details'>>({})
  const [showQuickAdd, setShowQuickAdd] = useState<Record<string, boolean>>({})

  // Filter state using OpportunityFilters (which extends EntityFilterState)
  const [filters, setFilters] = useState<OpportunityFilters>({
    timeRange: 'this_month',
    quickView: 'none',
    search: '',
    principal: 'all',
    // Merge any initial filters passed as props
    ...initialFilters,
  })

  // Hooks - DataTable will handle filtering via ResponsiveFilterWrapper
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity(filters)
  const deleteOpportunity = useDeleteOpportunity()
  const queryClient = useQueryClient()

  // Mobile detection
  const isMobile = useIsMobile()
  const isIPad = useIsIPad()

  const { selectedItems, handleSelectAll, clearSelection } = useOpportunitiesSelection()

  // Use opportunities directly - DataTable will handle filtering and sorting via ResponsiveFilterWrapper
  const displayOpportunities = opportunities

  const { toggleRowExpansion, isRowExpanded } = useOpportunitiesDisplay(
    displayOpportunities.map((opp) => opp.id)
  )

  // Convert Set to Array for easier manipulation
  const selectedIds = Array.from(selectedItems)
  const selectedOpportunities = opportunities.filter((opp) => selectedItems.has(opp.id))

  // Bulk action handlers
  const handleSelectAllFromToolbar = () => {
    handleSelectAll(true, displayOpportunities)
  }

  const handleSelectNoneFromToolbar = () => {
    handleSelectAll(false, displayOpportunities)
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

  // Expandable content renderer
  const renderExpandableContent = (opportunity: OpportunityWithLastActivity) => {
    const activeTab = activeTabs[opportunity.id] || 'interactions'
    const isQuickAddOpen = showQuickAdd[opportunity.id] || false
    const isExpanded = isRowExpanded(opportunity.id)

    const setActiveTab = (tab: 'interactions' | 'details') => {
      setActiveTabs((prev) => ({ ...prev, [opportunity.id]: tab }))
    }

    const toggleQuickAdd = () => {
      setShowQuickAdd((prev) => ({ ...prev, [opportunity.id]: !prev[opportunity.id] }))
    }

    const handleQuickAddSuccess = () => {
      setShowQuickAdd((prev) => ({ ...prev, [opportunity.id]: false }))
      // Invalidate the specific opportunity interactions
      queryClient.invalidateQueries({
        queryKey: interactionKeys.byOpportunity(opportunity.id),
      })
    }

    const handleQuickAddCancel = () => {
      setShowQuickAdd((prev) => ({ ...prev, [opportunity.id]: false }))
    }

    return (
      <div
        className={cn('bg-gray-50/50 border-l-4 border-primary/20', isMobile ? 'ml-4' : 'ml-10')}
      >
        {/* Tab Header - mobile optimized */}
        <div
          className={cn(
            'flex items-center justify-between border-b bg-white',
            isMobile ? 'px-4 py-3 flex-col gap-3' : 'px-6 py-2 flex-row'
          )}
        >
          <div className={cn('flex gap-1', isMobile ? 'w-full justify-center' : '')}>
            <Button
              variant={activeTab === 'interactions' ? 'default' : 'ghost'}
              size={isMobile ? 'default' : 'sm'}
              onClick={() => setActiveTab('interactions')}
              className={cn(isMobile ? 'flex-1 h-12 touch-manipulation' : '')}
            >
              <MessageSquare className={cn(isMobile ? 'h-4 w-4 mr-2' : 'h-3 w-3 mr-1')} />
              {isMobile
                ? `Activity (${opportunity.interaction_count || 0})`
                : `Activity (${opportunity.interaction_count || 0})`}
            </Button>
            <Button
              variant={activeTab === 'details' ? 'default' : 'ghost'}
              size={isMobile ? 'default' : 'sm'}
              onClick={() => setActiveTab('details')}
              className={cn(isMobile ? 'flex-1 h-12 touch-manipulation' : '')}
            >
              <FileText className={cn(isMobile ? 'h-4 w-4 mr-2' : 'h-3 w-3 mr-1')} />
              Details
            </Button>
          </div>

          {activeTab === 'interactions' && (
            <Button
              size={isMobile ? 'default' : 'sm'}
              variant={isQuickAddOpen ? 'default' : 'outline'}
              onClick={toggleQuickAdd}
              className={cn(isMobile ? 'w-full h-12 touch-manipulation' : '')}
            >
              <Plus className={cn(isMobile ? 'h-4 w-4 mr-2' : 'h-3 w-3 mr-1')} />
              Quick Add
            </Button>
          )}
        </div>

        {/* Quick Add Bar */}
        {isQuickAddOpen && activeTab === 'interactions' && (
          <QuickInteractionBar
            opportunityId={opportunity.id}
            contactId={opportunity.contact_id}
            organizationId={opportunity.organization_id}
            onSuccess={handleQuickAddSuccess}
            onCancel={handleQuickAddCancel}
          />
        )}

        {/* Tab Content */}
        <div className={cn(isMobile ? 'p-4' : 'p-6')}>
          {activeTab === 'interactions' ? (
            <InteractionTimelineEmbed
              opportunityId={opportunity.id}
              maxHeight={isMobile ? '300px' : isIPad ? '450px' : '400px'}
              showEmptyState={true}
              variant="compact"
              onAddNew={toggleQuickAdd}
              enabled={isExpanded} // Lazy loading - only fetch when expanded
            />
          ) : (
            // Pipeline stages and value tracking details - migrated from old table
            <div
              className={cn(
                'gap-6',
                isMobile
                  ? 'grid grid-cols-1 space-y-4'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}
            >
              <div>
                <h4 className={cn('mb-2 font-medium text-gray-900', isMobile ? 'text-base' : '')}>
                  Pipeline Details
                </h4>
                <div className={cn('space-y-1 text-gray-600', isMobile ? 'text-base' : 'text-sm')}>
                  {opportunity.stage && <div>Stage: {opportunity.stage}</div>}
                  {opportunity.status && <div>Status: {opportunity.status}</div>}
                  {opportunity.estimated_close_date && (
                    <div>
                      Expected Close:{' '}
                      {new Date(opportunity.estimated_close_date).toLocaleDateString()}
                    </div>
                  )}
                  {opportunity.created_at && (
                    <div>Created: {new Date(opportunity.created_at).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className={cn('mb-2 font-medium text-gray-900', isMobile ? 'text-base' : '')}>
                  Value Tracking
                </h4>
                <div className={cn('space-y-1 text-gray-600', isMobile ? 'text-base' : 'text-sm')}>
                  {opportunity.estimated_value && (
                    <div>Estimated Value: ${opportunity.estimated_value}</div>
                  )}
                  {opportunity.probability && <div>Probability: {opportunity.probability}%</div>}
                  {opportunity.deal_owner && <div>Deal Owner: {opportunity.deal_owner}</div>}
                </div>
              </div>

              <div>
                <h4 className={cn('mb-2 font-medium text-gray-900', isMobile ? 'text-base' : '')}>
                  Additional Information
                </h4>
                <div className={cn('space-y-1 text-gray-600', isMobile ? 'text-base' : 'text-sm')}>
                  {opportunity.description && <div>Description: {opportunity.description}</div>}
                  {opportunity.notes ? (
                    <div>Notes: {opportunity.notes}</div>
                  ) : (
                    <span className="italic text-gray-400">No notes available</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Create column configuration with actions (selection and expansion handled by DataTable)
  const columns = createOpportunityColumns({
    onEdit,
    onDelete,
    onView: (opportunity) => toggleRowExpansion(opportunity.id),
  })

  // Standard DataTable configuration with ResponsiveFilterWrapper
  const { dataTableProps } = useStandardDataTable({
    useResponsiveFilters: true,
    responsiveFilterTitle: 'Opportunity Filters',
    responsiveFilterDescription: 'Filter and search your opportunities',
    selectable: true,
    expandable: true,
    pageSize: 25,
    searchPlaceholder: 'Search opportunities by name, organization, stage, or value...',
  })

  const emptyMessage = filters.search
    ? 'No opportunities match your search.'
    : 'No opportunities yet'
  const emptySubtext = filters.search
    ? 'Try adjusting your search terms'
    : 'Get started by adding your first opportunity'

  // Define filter options for opportunities
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Closed - Won', label: 'Closed - Won' },
    { value: 'Closed - Lost', label: 'Closed - Lost' },
    { value: 'Nurturing', label: 'Nurturing' },
    { value: 'Qualified', label: 'Qualified' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]

  return (
    <>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedItems.size}
        totalCount={displayOpportunities.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
        entityType="opportunity"
        entityTypePlural="opportunities"
      />

      {/* DataTable with integrated ResponsiveFilterWrapper */}
      <DataTable<OpportunityWithLastActivity, unknown>
        {...dataTableProps}
        columns={columns}
        data={displayOpportunities}
        loading={isLoading}
        entityFilters={filters}
        onEntityFiltersChange={setFilters}
        statuses={statusOptions}
        priorities={priorityOptions}
        totalCount={opportunities.length}
        filteredCount={displayOpportunities.length}
        expandedContent={renderExpandableContent}
        rowKey={(opportunity) => opportunity.id}
        emptyState={{
          title: emptyMessage,
          description: emptySubtext,
        }}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entities={selectedOpportunities}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        entityType="opportunity"
        entityTypePlural="opportunities"
      />
    </>
  )
}
