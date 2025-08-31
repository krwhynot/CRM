import React, { Suspense, lazy } from 'react'
import { ChartCard } from './ChartCard'
import type { DashboardChartDataPoint } from '@/types/dashboard'
import { ChartSkeleton } from './DashboardSkeleton'

// Lazy load chart components to reduce initial bundle size
const OpportunityChart = lazy(() =>
  import('./OpportunityChart').then((module) => ({ default: module.OpportunityChart }))
)
const InteractionChart = lazy(() =>
  import('./InteractionChart').then((module) => ({ default: module.InteractionChart }))
)

interface DashboardChartsProps {
  opportunityChartData: DashboardChartDataPoint[]
  interactionChartData: DashboardChartDataPoint[]
  isLoading: boolean
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  opportunityChartData,
  interactionChartData,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Opportunity Chart */}
      <ChartCard
        title="Opportunities"
        colorClass="bg-primary"
        data={opportunityChartData}
        isLoading={isLoading}
        emptyTitle="No opportunities found"
        emptyDescription="No opportunities match the selected filters"
      >
        <Suspense fallback={<ChartSkeleton />}>
          <OpportunityChart data={opportunityChartData} loading={false} />
        </Suspense>
      </ChartCard>

      {/* Activity Chart */}
      <ChartCard
        title="Activities"
        colorClass="bg-success"
        data={interactionChartData}
        isLoading={isLoading}
        emptyTitle="No activities found"
        emptyDescription="No activities match the selected filters"
      >
        <Suspense fallback={<ChartSkeleton />}>
          <InteractionChart data={interactionChartData} loading={false} />
        </Suspense>
      </ChartCard>
    </div>
  )
}
