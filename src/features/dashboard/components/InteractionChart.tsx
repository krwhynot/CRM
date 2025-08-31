import React from 'react'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint } from '@/types/dashboard'

interface InteractionChartProps {
  /* ui-audit: allow */ data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  interactions: {
    label: 'Interactions' /* ui-audit: allow */,
    color: 'hsl(var(--chart-1))',
  },
}

export const InteractionChart = React.memo(({ data, loading }: InteractionChartProps) => {
  /* ui-audit: allow */
  if (loading) {
    return (
      <div className="flex h-chart w-full animate-pulse items-center justify-center rounded-lg bg-muted">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-chart w-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center text-muted-foreground">
          <div className="text-sm">No interaction data available</div> {/* ui-audit: allow */}
          <div className="mt-1 text-xs">Select filters to view interactions</div>{' '}
          {/* ui-audit: allow */}
        </div>
      </div>
    )
  }

  interface InteractionTooltipProps {
    active?: boolean
    payload?: Array<{ payload: ChartDataPoint; value: number }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: InteractionTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">
            {label}: {data.value} {data.value === 1 ? 'interaction' : 'interactions'}{' '}
            {/* ui-audit: allow */}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="h-chart w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={['dataMin', 'dataMax']}
            allowDecimals={false}
          />
          <ChartTooltip content={CustomTooltip as any} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={chartConfig.interactions.color} /* ui-audit: allow */
            strokeWidth={3}
            dot={{
              fill: chartConfig.interactions.color /* ui-audit: allow */,
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              stroke: chartConfig.interactions.color /* ui-audit: allow */,
              strokeWidth: 2,
              fill: 'hsl(var(--background))',
            }}
            // Smooth curves as specified
            strokeDasharray={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
})

InteractionChart.displayName = 'InteractionChart' /* ui-audit: allow */
