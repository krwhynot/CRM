import React from 'react'
import { 
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { ActivityChartData } from '@/types/dashboard'

interface ActivityChartProps {
  data: ActivityChartData[]
  loading?: boolean
  className?: string
}

interface TooltipPayloadItem {
  color: string
  dataKey: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-52 rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium text-foreground mb-2">
        {label ? format(parseISO(label), 'MMM dd, yyyy') : ''}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="size-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.dataKey}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
      <div className="border-t mt-2 pt-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="size-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold text-foreground">
            {payload.reduce((sum, entry) => sum + (entry.value || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

const formatXAxisLabel = (tickItem: string) => {
  try {
    return format(parseISO(tickItem), 'MM/dd')
  } catch {
    return tickItem
  }
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="w-full h-48 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center text-center ${className}`}>
        <div>
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Activity Data
          </h3>
          <p className="text-sm text-muted-foreground">
            Activity data will appear here once there are interactions and opportunities.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="interactionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="opportunitiesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="opacity-30"
            stroke="hsl(var(--border))"
          />
          
          <XAxis 
            dataKey="date"
            tickFormatter={formatXAxisLabel}
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickMargin={8}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickMargin={8}
            width={40}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          />
          
          {/* Opportunities Area */}
          <Area
            type="monotone"
            dataKey="opportunities"
            stackId="1"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fill="url(#opportunitiesGradient)"
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ 
              r: 6, 
              strokeWidth: 2,
              stroke: "hsl(var(--chart-2))",
              fill: "hsl(var(--background))"
            }}
          />
          
          {/* Interactions Area */}
          <Area
            type="monotone"
            dataKey="interactions"
            stackId="2"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#interactionsGradient)"
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ 
              r: 6, 
              strokeWidth: 2,
              stroke: "hsl(var(--chart-1))",
              fill: "hsl(var(--background))"
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ActivityChart