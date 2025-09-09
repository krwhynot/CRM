import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { WeeklyActivityChart } from './charts/WeeklyActivityChart'
import { useWeeklyKPIData } from '../hooks/useWeeklyKPIData'
import type { DashboardChartDataPoint, FilterState } from '@/types/dashboard'

interface WeeklyHeroChartProps {
  weeklyActivityData: DashboardChartDataPoint[]
  interactionChartData: DashboardChartDataPoint[]
  isLoading?: boolean
  filters?: FilterState
}

type ChartView = 'interactions' | 'opportunities' | 'combined'

export const WeeklyHeroChart: React.FC<WeeklyHeroChartProps> = ({
  weeklyActivityData,
  interactionChartData,
  isLoading = false,
  filters,
}) => {
  const [chartView, setChartView] = useState<ChartView>('combined')
  const kpiData = useWeeklyKPIData(filters)

  // Determine which data to display based on selected view
  const getChartData = () => {
    switch (chartView) {
      case 'interactions':
        return interactionChartData
      case 'opportunities':
        return weeklyActivityData
      case 'combined':
      default:
        return weeklyActivityData // WeeklyActivityChart already shows both
    }
  }

  const getChartTitle = () => {
    switch (chartView) {
      case 'interactions':
        return 'Weekly Interactions'
      case 'opportunities':
        return 'Weekly Opportunities'
      case 'combined':
      default:
        return 'Weekly Activity Overview'
    }
  }

  const getBigNumber = () => {
    switch (chartView) {
      case 'interactions':
        return kpiData.interactionsLogged.thisWeek
      case 'opportunities':
        return kpiData.opportunitiesMoved.count
      case 'combined':
      default:
        return kpiData.interactionsLogged.thisWeek
    }
  }

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <div>
              <h3 className="text-lg font-semibold">{getChartTitle()}</h3>
              <p className="text-sm text-muted-foreground">
                Track interactions and opportunities over time
              </p>
            </div>

            {/* Big Number Display */}
            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <div className="text-4xl font-bold text-primary">
                {isLoading ? '--' : getBigNumber()}
              </div>
              <div className="text-sm font-medium text-muted-foreground">this week</div>
            </div>
          </div>

          {/* View Selector */}
          <ToggleGroup
            type="single"
            value={chartView}
            onValueChange={(value: ChartView) => value && setChartView(value)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <ToggleGroupItem
              value="combined"
              aria-label="Combined view"
              className="flex-1 sm:flex-initial"
            >
              Combined
            </ToggleGroupItem>
            <ToggleGroupItem
              value="interactions"
              aria-label="Interactions only"
              className="flex-1 sm:flex-initial"
            >
              Interactions
            </ToggleGroupItem>
            <ToggleGroupItem
              value="opportunities"
              aria-label="Opportunities only"
              className="flex-1 sm:flex-initial"
            >
              Opportunities
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-96">
          <WeeklyActivityChart data={getChartData()} loading={isLoading} />
        </div>
      </CardContent>
    </Card>
  )
}
