import React from 'react'
import { ChartCard } from './ChartCard'
import { OpportunityChart } from './OpportunityChart'
import { InteractionChart } from './InteractionChart'
import { ChartDataPoint } from '@/types/dashboard'

interface DashboardChartsProps {
  opportunityChartData: ChartDataPoint[]
  interactionChartData: ChartDataPoint[]
  isLoading: boolean
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  opportunityChartData,
  interactionChartData,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Opportunity Chart */}
      <ChartCard
        title="Opportunities"
        colorClass="bg-blue-500"
        data={opportunityChartData}
        isLoading={isLoading}
        emptyTitle="No opportunities found"
        emptyDescription="No opportunities match the selected filters"
      >
        <OpportunityChart data={opportunityChartData} loading={false} />
      </ChartCard>
      
      {/* Interaction Chart */}
      <ChartCard
        title="Interactions"
        colorClass="bg-green-500"
        data={interactionChartData}
        isLoading={isLoading}
        emptyTitle="No interactions found"
        emptyDescription="No interactions match the selected filters"
      >
        <InteractionChart data={interactionChartData} loading={false} />
      </ChartCard>
    </div>
  )
}