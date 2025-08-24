import { useMemo } from 'react'
import { WeeklyData, formatWeekRange } from '@/lib/date-utils'

export interface ChartDataPoint extends WeeklyData {
  weekLabel: string
}

export function useChartData(data: WeeklyData[]) {
  const chartData = useMemo(() => {
    return data.map(week => ({
      ...week,
      weekLabel: formatWeekRange(week.weekStart, week.weekEnd)
    }))
  }, [data])

  const maxOpportunities = useMemo(() => {
    return Math.max(...data.map(d => d.opportunities), 5)
  }, [data])

  const maxInteractions = useMemo(() => {
    return Math.max(...data.map(d => d.interactions), 10)
  }, [data])

  return {
    chartData,
    maxOpportunities,
    maxInteractions
  }
}