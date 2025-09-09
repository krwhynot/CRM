import React from 'react'
import { DashboardFilters } from './DashboardFilters'
import { WeeklyHeroChart } from './WeeklyHeroChart'
import { DashboardTabs } from './DashboardTabs'
import { DashboardRightRail } from './DashboardRightRail'
import { SimpleActivityFeed } from './SimpleActivityFeed'
import { OpportunityKanban } from './OpportunityKanban'
import { DashboardSkeleton } from './DashboardSkeleton'
import { EmptyState } from './EmptyState'
import { useDashboardFilters } from '../hooks/useDashboardFilters'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDashboardLoading } from '../hooks/useDashboardLoading'
import { useWeeklyKPIData } from '../hooks/useWeeklyKPIData'

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
  const kpiData = useWeeklyKPIData(debouncedFilters)

  // Get array of all visible chart IDs (simplified - all charts visible)
  const visibleChartIds = [
    'weekly-activity',
    'principal-performance',
    'team-performance',
    'opportunities',
    'activities',
    'pipeline-flow',
    'pipeline-funnel',
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
      {/* Weekly Overview Header */}
      <div className="border-b">
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          principals={principals}
          products={products}
          isLoading={isLoading}
        />
      </div>

      {/* Two Column Layout */}
      {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Main Content */}
        <div className="min-w-0 space-y-6">
          {/* Hero Chart Section */}
          <WeeklyHeroChart
            weeklyActivityData={weeklyActivityData}
            interactionChartData={interactionChartData}
            isLoading={isLoading}
            filters={debouncedFilters}
          />

          {/* Tabs Section - Main Dashboard Content */}
          <DashboardTabs
            weeklyActivityData={weeklyActivityData}
            opportunityChartData={opportunityChartData}
            interactionChartData={interactionChartData}
            principalPerformanceData={principalPerformanceData}
            teamPerformanceData={teamPerformanceData}
            pipelineFlowData={pipelineFlowData}
            pipelineValueFunnelData={pipelineValueFunnelData}
            isLoading={isLoading}
            visibleChartIds={visibleChartIds}
            filters={debouncedFilters}
            // Pass additional props for migration
            filteredOpportunities={filteredOpportunities}
            activityItems={activityItems}
            principals={principals}
          />

          {/* Bottom Section - Pipeline & Activity with breathing room */}
          {/* Note: Components will be removed once fully migrated to tabs */}
          <div className="dashboard-grid grid-cols-1 lg:grid-cols-3">
            {/* Pipeline Kanban - 2 columns wide */}
            <div className="lg:col-span-2">
              <OpportunityKanban
                opportunities={filteredOpportunities}
                principals={principals}
                loading={isLoading}
              />
            </div>

            {/* Activity Feed - 1 column */}
            <div>
              <SimpleActivityFeed
                activities={activityItems}
                loading={isLoading}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Right Rail - Sticky */}
        <DashboardRightRail kpiData={kpiData} filters={filters} principals={principals} />
      </div>
    </div>
  )
}

export default CRMDashboard
