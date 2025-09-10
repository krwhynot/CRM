import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { WeeklyActivityChart } from './charts/WeeklyActivityChart'
import { useWeeklyKPIData } from '../hooks/useWeeklyKPIData'
import { useDashboardDensity } from '../hooks/useDashboardDensity'
import { cn } from '@/lib/utils'
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
  const { density } = useDashboardDensity()

  // Density-specific configurations
  const densityConfig = {
    compact: {
      chartHeight: 180,
      showToggle: false,
      showSubtext: false,
      titleClass: 'text-lg font-semibold',
      numberClass: 'text-2xl font-bold'
    },
    comfortable: {
      chartHeight: 250,
      showToggle: true,
      showSubtext: true,
      titleClass: 'text-xl font-semibold',
      numberClass: 'text-3xl font-bold'
    },
    spacious: {
      chartHeight: 300,
      showToggle: true,
      showSubtext: true,
      titleClass: 'text-2xl font-semibold',
      numberClass: 'text-4xl font-bold'
    }
  }

  const config = densityConfig[density]

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
    <Card className="density-aware-card dashboard-card density-transition">
      <CardHeader className={cn('pb-4 density-aware-card', 
        density === 'compact' ? 'pb-2' : density === 'spacious' ? 'pb-6' : 'pb-4')}>
        <div className={cn('flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0',
          density === 'compact' ? 'space-y-2' : 'space-y-4')}>
          <div className={cn('flex flex-col sm:flex-row sm:items-center sm:space-x-6',
            density === 'compact' ? 'sm:space-x-4' : density === 'spacious' ? 'sm:space-x-8' : 'sm:space-x-6')}>
            <div>
              <h3 className={cn(config.titleClass)}>{getChartTitle()}</h3>
              {config.showSubtext && (
                <p className={cn('text-muted-foreground',
                  density === 'compact' ? 'text-xs' : 
                  density === 'spacious' ? 'text-base' : 'text-sm'
                )}>
                  Track interactions and opportunities over time
                </p>
              )}
            </div>

            {/* Big Number Display */}
            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <div className={cn('font-bold text-primary', config.numberClass)}>
                {isLoading ? '--' : getBigNumber()}
              </div>
              <div className={cn('font-medium text-muted-foreground',
                density === 'compact' ? 'text-xs' : 
                density === 'spacious' ? 'text-base' : 'text-sm'
              )}>this week</div>
            </div>
          </div>

          {/* View Selector - Only show in comfortable/spacious modes */}
          {config.showToggle && (
            <ToggleGroup
              type="single"
              value={chartView}
              onValueChange={(value: ChartView) => value && setChartView(value)}
              variant="outline"
              size={density === 'spacious' ? 'default' : 'sm'}
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
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="density-aware-chart density-transition" style={{ height: `${config.chartHeight}px` }}>
          <WeeklyActivityChart data={getChartData()} loading={isLoading} />
        </div>
      </CardContent>
    </Card>
  )
}
