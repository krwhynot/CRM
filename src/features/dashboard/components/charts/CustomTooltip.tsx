import type { WeeklyData } from '@/lib/date-utils'
import { formatWeekRange } from '@/lib/date-utils'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: WeeklyData; value: number }>
  chartType: 'opportunities' | 'activities'
}

export const CustomTooltip = ({ active, payload, chartType }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as WeeklyData
    const weekRange = formatWeekRange(data.weekStart, data.weekEnd)
    const value = chartType === 'opportunities' ? data.opportunities : data.interactions

    return (
      <div className="rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground">{weekRange}</p>
        <p className="text-sm text-muted-foreground">
          {chartType === 'opportunities' ? 'Opportunities' : 'Activities'}:
          <span className="ml-1 font-semibold text-primary">{value}</span>
        </p>
      </div>
    )
  }
  return null
}
