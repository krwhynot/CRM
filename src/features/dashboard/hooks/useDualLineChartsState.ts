import { useMemo } from 'react'
import { WeeklyData, formatWeekRange } from '@/lib/date-utils'

interface UseDualLineChartsStateProps {
  data: WeeklyData[]
}

interface UseDualLineChartsStateReturn {
  chartData: (WeeklyData & { weekLabel: string })[]
  maxOpportunities: number
  maxInteractions: number
}

export const useDualLineChartsState = ({ data }: UseDualLineChartsStateProps): UseDualLineChartsStateReturn => {
  
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