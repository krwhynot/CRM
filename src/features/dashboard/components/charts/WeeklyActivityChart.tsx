import React from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { DashboardChartDataPoint } from '@/types/dashboard'

interface WeeklyActivityChartProps {
  data: DashboardChartDataPoint[]
  loading?: boolean
}

// Chart configuration following existing patterns
const chartConfig = {
  interactions: {
    label: 'Interactions',
    color: 'hsl(var(--chart-1))',
  },
  opportunities: {
    label: 'Opportunities',
    color: 'hsl(var(--chart-2))',
  },
}

export const WeeklyActivityChart = React.memo(({ data, loading }: WeeklyActivityChartProps) => {
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
          <div className="text-sm">No activity data available</div>
          <div className="mt-1 text-xs">Select filters to view weekly activity</div>
        </div>
      </div>
    )
  }

  // Transform data to include both interactions and opportunities
  const chartData = data.map((item) => ({
    ...item,
    interactions: Math.floor(item.count * 0.7), // Mock interaction data (70% of opportunities)
    opportunities: item.count,
  }))

  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      color: string
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
          <p className="mb-1 text-sm font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="h-chart w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={['dataMin', 'dataMax']}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={['dataMin', 'dataMax']}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="interactions"
            fill={chartConfig.interactions.color}
            opacity={0.8}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="opportunities"
            stroke={chartConfig.opportunities.color}
            strokeWidth={3}
            dot={{
              fill: chartConfig.opportunities.color,
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              stroke: chartConfig.opportunities.color,
              strokeWidth: 2,
              fill: 'hsl(var(--background))',
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
})

WeeklyActivityChart.displayName = 'WeeklyActivityChart'
