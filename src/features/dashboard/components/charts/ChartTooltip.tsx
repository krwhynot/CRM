import { WeeklyData, formatWeekRange } from '@/lib/date-utils'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: WeeklyData; value: number }>
  chartType: 'opportunities' | 'activities'
}

export function ChartTooltip({ active, payload, chartType }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as WeeklyData
    const weekRange = formatWeekRange(data.weekStart, data.weekEnd)
    const value = chartType === 'opportunities' ? data.opportunities : data.activities
    
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground">{weekRange}</p>
        <p className="text-sm text-muted-foreground">
          {chartType === 'opportunities' ? 'Opportunities' : 'Activities'}: 
          <span className="font-semibold text-primary ml-1">{value}</span>
        </p>
      </div>
    )
  }
  return null
}