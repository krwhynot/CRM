import React from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

interface PrincipalData {
  name: string
  interactions: number
  performance: 'high' | 'medium' | 'low'
}

interface PrincipalPerformanceChartProps {
  data: PrincipalData[]
  loading?: boolean
  onPrincipalClick?: (principal: string) => void
}

// Chart configuration with performance-based colors
const chartConfig = {
  interactions: {
    label: 'Interactions',
    color: 'hsl(var(--chart-1))',
  },
}

const performanceColors = {
  high: 'hsl(142, 76%, 36%)', // Green
  medium: 'hsl(45, 93%, 47%)', // Yellow
  low: 'hsl(0, 84%, 60%)', // Red
}

export const PrincipalPerformanceChart = React.memo(({ 
  data, 
  loading, 
  onPrincipalClick 
}: PrincipalPerformanceChartProps) => {
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
          <div className="text-sm">No principal data available</div>
          <div className="mt-1 text-xs">Select filters to view performance</div>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ payload: PrincipalData, value: number }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const performance = data.payload.performance as 'high' | 'medium' | 'low'
      
      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">
            Interactions: {data.value}
          </p>
          <p className="text-sm">
            Performance: 
            <span 
              className="ml-1 font-medium"
              style={{ color: performanceColors[performance] }}
            >
              {performance}
            </span>
          </p>
          {onPrincipalClick && (
            <p className="mt-1 text-xs text-muted-foreground">
              Click to view details
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const handleBarClick = (data: unknown) => {
    if (onPrincipalClick && data && typeof data === 'object' && data !== null && 'payload' in data) {
      const payload = (data as { payload: PrincipalData }).payload
      onPrincipalClick(payload.name)
    }
  }

  return (
    <ChartContainer config={chartConfig} className="h-chart w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="horizontal"
          margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={[0, 'dataMax']}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="interactions" 
            radius={[0, 4, 4, 0]}
            cursor={onPrincipalClick ? 'pointer' : 'default'}
            onClick={handleBarClick}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={performanceColors[entry.performance]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
})

PrincipalPerformanceChart.displayName = 'PrincipalPerformanceChart'