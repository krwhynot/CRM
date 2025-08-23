import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, Activity } from 'lucide-react'
import { WeeklyData, formatWeekRange } from '@/lib/date-utils'

interface DualLineChartsProps {
  data: WeeklyData[]
  isLoading?: boolean
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: WeeklyData; value: number }>
  chartType: 'opportunities' | 'interactions'
}

const CustomTooltip = ({ active, payload, chartType }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as WeeklyData
    const weekRange = formatWeekRange(data.weekStart, data.weekEnd)
    const value = chartType === 'opportunities' ? data.opportunities : data.interactions
    
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground">{weekRange}</p>
        <p className="text-sm text-muted-foreground">
          {chartType === 'opportunities' ? 'Opportunities' : 'Interactions'}: 
          <span className="font-semibold text-primary ml-1">{value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function DualLineCharts({ data, isLoading = false, className }: DualLineChartsProps) {
  // Feature flag for new MFB compact styling
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false'

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

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
        <Card className={USE_NEW_STYLE ? "shadow-sm" : "shadow-md"}>
          <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        
        <Card className={USE_NEW_STYLE ? "shadow-sm" : "shadow-md"}>
          <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      {/* Opportunities Chart */}
      <Card className={`${USE_NEW_STYLE ? "shadow-sm border-primary/10" : "shadow-md"} hover:shadow-lg transition-shadow`}>
        <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
          <CardTitle className={`flex items-center gap-2 ${USE_NEW_STYLE ? "text-base font-bold text-[hsl(var(--foreground))]" : "text-lg font-semibold"}`}>
            <Target className="h-5 w-5 text-primary" />
            Opportunities per Week
          </CardTitle>
          <p className={`text-sm text-muted-foreground ${USE_NEW_STYLE ? "text-xs" : ""}`}>
            Weekly opportunity creation trends
          </p>
        </CardHeader>
        <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="weekLabel"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[0, maxOpportunities + 1]}
                />
                <Tooltip content={<CustomTooltip chartType="opportunities" />} />
                <Line
                  type="monotone"
                  dataKey="opportunities"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 2, 
                    stroke: "hsl(var(--background))",
                    r: 4
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Interactions Chart */}
      <Card className={`${USE_NEW_STYLE ? "shadow-sm border-primary/10" : "shadow-md"} hover:shadow-lg transition-shadow`}>
        <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
          <CardTitle className={`flex items-center gap-2 ${USE_NEW_STYLE ? "text-base font-bold text-[hsl(var(--foreground))]" : "text-lg font-semibold"}`}>
            <Activity className="h-5 w-5" style={{color: "#EA580C"}} />
            Interactions per Week
          </CardTitle>
          <p className={`text-sm text-muted-foreground ${USE_NEW_STYLE ? "text-xs" : ""}`}>
            Weekly interaction activity trends
          </p>
        </CardHeader>
        <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="weekLabel"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[0, maxInteractions + 2]}
                />
                <Tooltip content={<CustomTooltip chartType="interactions" />} />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  stroke="#EA580C"
                  strokeWidth={3}
                  dot={{ 
                    fill: "#EA580C", 
                    strokeWidth: 2, 
                    stroke: "hsl(var(--background))",
                    r: 4
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: "#EA580C",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Empty state component
export function DualLineChartsEmpty({ className }: { className?: string }) {
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false'
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      <Card className={USE_NEW_STYLE ? "shadow-sm" : "shadow-md"}>
        <CardContent className={`${USE_NEW_STYLE ? "p-4" : "p-6"} flex flex-col items-center justify-center h-[380px]`}>
          <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Opportunity Data</h3>
          <p className="text-sm text-muted-foreground text-center">
            No opportunities found for the selected time period and filters.
          </p>
        </CardContent>
      </Card>
      
      <Card className={USE_NEW_STYLE ? "shadow-sm" : "shadow-md"}>
        <CardContent className={`${USE_NEW_STYLE ? "p-4" : "p-6"} flex flex-col items-center justify-center h-[380px]`}>
          <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Interaction Data</h3>
          <p className="text-sm text-muted-foreground text-center">
            No interactions found for the selected time period and filters.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}