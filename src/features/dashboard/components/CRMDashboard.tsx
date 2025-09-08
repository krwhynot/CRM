import React from 'react'
import { DashboardFilters } from './DashboardFilters'
import { ChartsGrid } from './ChartsGrid'
import { WeeklyKPIHeader } from './WeeklyKPIHeader'
import { SimpleActivityFeed } from './SimpleActivityFeed'
import { OpportunityKanban } from './OpportunityKanban'
import { DashboardSkeleton } from './DashboardSkeleton'
import { EmptyState } from './EmptyState'
import { useDashboardFilters } from '../hooks/useDashboardFilters'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDashboardLoading } from '../hooks/useDashboardLoading'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useChartVisibility, CHART_METADATA, type ChartId } from '@/stores'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export const CRMDashboard: React.FC = () => {
  // Use custom hooks for all logic
  const { filters, debouncedFilters, isLoading, handleFiltersChange } = useDashboardFilters()
  const {
    principals,
    products,
    filteredOpportunities,
    opportunityChartData,
    interactionChartData,
    activityItems,
    weeklyActivityData,
    principalPerformanceData,
    teamPerformanceData,
    pipelineFlowData,
    pipelineValueFunnelData,
  } = useDashboardData(debouncedFilters)
  const { isInitialLoad, showEmptyState } = useDashboardLoading(debouncedFilters, activityItems)
  
  // Chart visibility controls
  const {
    visibleCharts,
    toggleChartVisibility,
    showAllCharts,
    resetToDefaults,
  } = useChartVisibility()

  // Get array of visible chart IDs for filtering
  const visibleChartIds = Object.entries(visibleCharts)
    .filter(([_, visible]) => visible)
    .map(([chartId, _]) => chartId as ChartId)

  // Chart metadata in display order (matching ChartsGrid order)
  const chartOrder: ChartId[] = [
    'weekly-activity',
    'principal-performance',
    'team-performance',
    'opportunities',
    'activities',
    'pipeline-flow',
    'pipeline-funnel'
  ]

  // Show initial loading skeleton
  if (isInitialLoad) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-6">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // Show empty state if no principal selected and no data would be visible
  if (showEmptyState) {
    return (
      <div className="flex flex-1 flex-col">
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          principals={principals}
          products={products}
          isLoading={isLoading}
        />
        <div className="mt-6">
          <EmptyState
            type="dashboard"
            title="Select a principal to view their activity"
            description="Choose a principal from the filters above to see their opportunities, interactions, and activity trends over time."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Filters - Sticky top bar */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        principals={principals}
        products={products}
        isLoading={isLoading}
      />

      {/* KPI Header - Weekly performance metrics */}
      <div className="p-6 pb-3">
        <WeeklyKPIHeader filters={debouncedFilters} />
      </div>

      {/* Chart Visibility Controls - Toggle which charts are displayed */}
      <div className="px-6 pb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              {/* Header and bulk actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Charts ({visibleChartIds.length}/{chartOrder.length})
                  </span>
                </div>
                <div className="flex space-x-2 md:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showAllCharts}
                    className="text-xs"
                  >
                    Show All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Desktop chart toggles */}
              <div className="flex flex-wrap gap-2 md:flex-nowrap">
                <ToggleGroup
                  type="multiple"
                  value={visibleChartIds}
                  onValueChange={(value: string[]) => {
                    // Handle toggle group value change
                    chartOrder.forEach((chartId) => {
                      const shouldBeVisible = value.includes(chartId)
                      if (visibleCharts[chartId] !== shouldBeVisible) {
                        toggleChartVisibility(chartId)
                      }
                    })
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-wrap justify-start"
                >
                  {chartOrder.map((chartId) => {
                    const metadata = CHART_METADATA[chartId]
                    return (
                      <ToggleGroupItem
                        key={chartId}
                        value={chartId}
                        aria-label={`Toggle ${metadata.title} chart`}
                        className="whitespace-nowrap text-xs"
                      >
                        {metadata.title}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>

                {/* Desktop bulk actions */}
                <div className="hidden space-x-2 md:flex">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showAllCharts}
                    className="whitespace-nowrap"
                  >
                    <Eye className="mr-1 size-3" />
                    Show All
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={resetToDefaults}
                    className="whitespace-nowrap"
                  >
                    <EyeOff className="mr-1 size-3" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Responsive grid layout with filtered charts */}
      <div className="p-6 pt-0">
        <ChartsGrid
          data={[]} // Legacy WeeklyData - now using specific chart data props
          opportunityChartData={opportunityChartData}
          interactionChartData={interactionChartData}
          weeklyActivityData={weeklyActivityData}
          principalPerformanceData={principalPerformanceData}
          teamPerformanceData={teamPerformanceData}
          pipelineFlowData={pipelineFlowData}
          pipelineValueFunnelData={pipelineValueFunnelData}
          isLoading={isLoading}
          enableMobileCarousel={true}
          visibleChartIds={visibleChartIds} // Pass visible chart IDs for filtering
        />
      </div>

      {/* Opportunity Kanban - Sales Pipeline */}
      <OpportunityKanban
        opportunities={filteredOpportunities}
        principals={principals}
        loading={isLoading}
      />

      {/* Activity Feed - Full width, paginated */}
      <SimpleActivityFeed activities={activityItems} loading={isLoading} className="w-full" />
    </div>
  )
}

export default CRMDashboard
