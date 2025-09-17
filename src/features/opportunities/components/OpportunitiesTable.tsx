import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
import { useOpportunitiesWithLastActivity, useDeleteOpportunity } from '../hooks/useOpportunities'
import { useOpportunitiesSelection } from '../hooks/useOpportunitiesSelection'
import { useOpportunitiesSorting } from '../hooks/useOpportunitiesSorting'
import { useOpportunitiesFormatting } from '../hooks/useOpportunitiesFormatting'
import { useOpportunitiesDisplay } from '../hooks/useOpportunitiesDisplay'
import { OpportunitiesTableActions } from './OpportunitiesTableActions'
import { InteractionTimelineEmbed } from '@/features/interactions/components/InteractionTimelineEmbed'
import { QuickInteractionBar } from '@/features/interactions/components/QuickInteractionBar'
import { toast } from '@/lib/toast-styles'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MessageSquare,
  FileText,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatTimeAgo, isOpportunityStalled, getStalledDays } from '@/lib/utils'
import { useIsMobile, useIsIPad } from '@/hooks/useMediaQuery'
import type { OpportunityFilters } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import { useQueryClient } from '@tanstack/react-query'
import { interactionKeys } from '@/features/interactions/hooks/useInteractions'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
}

export function OpportunitiesTable({ filters, onEdit, onDelete }: OpportunitiesTableProps) {
  // Bulk delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Tab state for expanded rows
  const [activeTabs, setActiveTabs] = useState<Record<string, 'interactions' | 'details'>>({})
  const [showQuickAdd, setShowQuickAdd] = useState<Record<string, boolean>>({})

  // Enhanced filtering state
  const [opportunityFilters, setOpportunityFilters] = useState<OpportunityFilters>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...filters, // merge any filters passed as props
  })

  // Hooks - combine component filters with prop filters
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity({
    ...opportunityFilters,
    ...filters, // prop filters override component filters
  })
  const deleteOpportunity = useDeleteOpportunity()
  const queryClient = useQueryClient()

  // Mobile detection
  const isMobile = useIsMobile()
  const isIPad = useIsIPad()

  const { selectedItems, handleSelectAll, handleSelectItem, clearSelection } =
    useOpportunitiesSelection()

  // Use filtered data from the hook with the complete filters
  const { sortedOpportunities } = useOpportunitiesSorting(opportunities)

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
            // Existing details view - mobile optimized
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
                  Opportunity Details
                </h4>
                <div className={cn('space-y-1 text-gray-600', isMobile ? 'text-base' : 'text-sm')}>
                  {opportunity.stage && <div>Stage: {opportunity.stage}</div>}
                  {opportunity.name && <div>Name: {opportunity.name}</div>}
                  {opportunity.created_at && (
                    <div>Created: {new Date(opportunity.created_at).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className={cn('mb-2 font-medium text-gray-900', isMobile ? 'text-base' : '')}>
                  Financial
                </h4>
                <div className={cn('space-y-1 text-gray-600', isMobile ? 'text-base' : 'text-sm')}>
                  {opportunity.estimated_value && (
                    <div>Estimated Value: ${opportunity.estimated_value}</div>
                  )}
                  {opportunity.probability && <div>Probability: {opportunity.probability}%</div>}
                </div>
              </div>

              <div>
                <h4 className={cn('mb-2 font-medium text-gray-900', isMobile ? 'text-base' : '')}>
                  Notes
                </h4>
                <div className={cn('space-y-1 text-gray-600', isMobile ? 'text-base' : 'text-sm')}>
                  {opportunity.notes ? (
                    <p>{opportunity.notes}</p>
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
      cell: (opportunity) => {
        const getActivityIcon = () => {
          switch (opportunity.weeklyActivity) {
            case 'high':
              return <Zap className="size-3 text-green-500" />
            case 'medium':
              return <Target className="size-3 text-yellow-500" />
            default:
              return null
          }
        }

        const getActivityBadge = () => {
          if (opportunity.weeklyActivity === 'high') {
            return (
              <Badge
                variant="secondary"
                className="border-green-200 bg-green-50 text-xs text-green-700"
              >
                High Activity
              </Badge>
            )
          }
          if (opportunity.weeklyActivity === 'medium') {
            return (
              <Badge
                variant="secondary"
                className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700"
              >
                Active
              </Badge>
            )
          }
          return null
        }

        return (
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-900">
                {opportunity.organization?.name || 'No Organization'}
              </div>
              {opportunity.movedThisWeek && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <TrendingUp className="size-3 text-blue-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stage moved this week</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {getActivityIcon()}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {opportunity.name} • {opportunity.interaction_count || 0} activities
              </span>
              {getActivityBadge()}
            </div>
            {opportunity.weeklyEngagementScore && opportunity.weeklyEngagementScore > 50 && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-gray-400">Engagement:</span>
                <div className="flex items-center">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        opportunity.weeklyEngagementScore >= 80
                          ? 'bg-green-500'
                          : opportunity.weeklyEngagementScore >= 60
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                      )}
                      style={{ width: `${opportunity.weeklyEngagementScore}%` }}
                    />
                  </div>
                  <span className="ml-1 text-xs text-gray-400">
                    {opportunity.weeklyEngagementScore}
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      },
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

  const emptyMessage = opportunityFilters.search
    ? 'No opportunities match your search.'
    : 'No opportunities yet'
  const emptySubtext = opportunityFilters.search
    ? 'Try adjusting your search terms'
    : 'Get started by adding your first opportunity'

  return (
    <div className="space-y-4">
      {/* DEPRECATED: OpportunitiesFilters has been removed.
          Use OpportunitiesList with ResponsiveFilterWrapper instead.
          This legacy component is no longer used in the application. */}

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedItems.size}
        totalCount={sortedOpportunities.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
        entityType="opportunity"
        entityTypePlural="opportunities"
      />

      {/* Table Container with Integrated Row Expansion */}
      <DataTable<OpportunityWithLastActivity>
        data={sortedOpportunities}
        columns={opportunityColumns}
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
        entities={selectedOpportunities}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        entityType="opportunity"
        entityTypePlural="opportunities"
      />
    </div>
  )
}
