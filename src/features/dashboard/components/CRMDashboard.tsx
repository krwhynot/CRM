import React from 'react'
import { DashboardFilters } from './DashboardFilters'
import { DashboardCharts } from './DashboardCharts'
import { SimpleActivityFeed } from './SimpleActivityFeed'
import { OpportunityKanban } from './OpportunityKanban'
import { DashboardSkeleton } from './DashboardSkeleton'
import { EmptyState } from './EmptyState'
import { useDashboardFilters } from '../hooks/useDashboardFilters'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDashboardLoading } from '../hooks/useDashboardLoading'

export const CRMDashboard: React.FC = () => {
  // Use custom hooks for all logic
  const { filters, debouncedFilters, isLoading, handleFiltersChange } = useDashboardFilters()
  const {
    principals,
    products,
    filteredOpportunities,
    opportunityChartData,
    interactionChartData,
    activityItems
  } = useDashboardData(debouncedFilters)
  const { isInitialLoad, showEmptyState } = useDashboardLoading(debouncedFilters, activityItems)
  
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
        
        {/* Charts - Side by side on desktop, stacked on mobile */}
        <DashboardCharts
          opportunityChartData={opportunityChartData}
          interactionChartData={interactionChartData}
          isLoading={isLoading}
        />
        
        {/* Opportunity Kanban - Sales Pipeline */}
        <OpportunityKanban
          opportunities={filteredOpportunities}
          principals={principals}
          loading={isLoading}
        />
        
        {/* Activity Feed - Full width, paginated */}
        <SimpleActivityFeed
          activities={activityItems}
          loading={isLoading}
          className="w-full"
        />
    </div>
  )
}

export default CRMDashboard