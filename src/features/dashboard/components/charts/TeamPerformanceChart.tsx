import React from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'

interface TeamData {
  name: string
  interactions: number
  opportunities: number
  movements: number
  rank: number
  isCurrentUser?: boolean
}

interface TeamPerformanceChartProps {
  data: TeamData[]
  loading?: boolean
}

// Chart configuration for stacked bars
const chartConfig = {
  interactions: {
    label: 'Interactions',
    color: 'hsl(var(--chart-1))',
  },
  opportunities: {
    label: 'Opportunities',
    color: 'hsl(var(--chart-2))',
  },
  movements: {
    label: 'Pipeline Movements',
    color: 'hsl(var(--chart-3))',
  },
}

export const TeamPerformanceChart = React.memo(({ 
  data, 
  loading
}: TeamPerformanceChartProps) => {
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
          <div className="text-sm">No team data available</div>
          <div className="mt-1 text-xs">Select filters to view performance</div>
        </div>
      </div>
    )
  }

  // Sort by rank for display
  const sortedData = [...data].sort((a, b) => a.rank - b.rank)

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ payload: TeamData, value: number, dataKey: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      const teamMember = payload[0].payload
      const total = payload.reduce((sum: number, entry) => sum + entry.value, 0)
      
      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-sm font-medium">{label}</p>
            {teamMember.rank === 1 && <Crown className="size-3 text-yellow-500" />}
            <Badge variant="outline" className="text-xs">
              #{teamMember.rank}
            </Badge>
            {teamMember.isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
          </div>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: (entry as { color?: string }).color || '#666' }}>
              {(entry as { dataKey?: string }).dataKey || 'Value'}: {entry.value}
            </p>
          ))}
          <p className="mt-1 border-t pt-1 text-sm font-medium">
            Total Score: {total}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = (props: { payload?: Array<{ value: string, color: string }> }) => {
    const { payload } = props
    return (
      <div className="mt-2 flex justify-center gap-4">
        {payload?.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="size-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }


  return (
    <ChartContainer config={chartConfig} className="h-chart w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={sortedData} 
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={[0, 'dataMax']}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar 
            dataKey="interactions" 
            stackId="a"
            fill={chartConfig.interactions.color}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="opportunities" 
            stackId="a"
            fill={chartConfig.opportunities.color}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="movements" 
            stackId="a"
            fill={chartConfig.movements.color}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
})

TeamPerformanceChart.displayName = 'TeamPerformanceChart'