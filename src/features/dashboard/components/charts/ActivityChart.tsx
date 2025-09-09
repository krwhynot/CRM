import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { ChartTooltip } from './ChartTooltip'
import { useChartStyling } from '../../hooks/useChartStyling'
import { chartColors } from '@/components/dashboard'
import type { ChartDataPoint } from '../../hooks/useChartData'

interface ActivityChartProps {
  data: ChartDataPoint[]
  maxValue: number
}

export function ActivityChart({ data, maxValue }: ActivityChartProps) {
  const { cardClassName, headerClassName, contentClassName, titleClassName, subtitleClassName } =
    useChartStyling()

  return (
    <Card className={`${cardClassName} transition-shadow hover:shadow-lg`}>
      <CardHeader className={headerClassName}>
        <CardTitle className={`flex items-center gap-2 ${titleClassName}`}>
          <Activity className="size-5 text-primary" />
          Activity per Week
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${subtitleClassName}`}>
          Weekly activity trends
        </p>
      </CardHeader>
      <CardContent className={contentClassName}>
        <div className="h-chart w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
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
                domain={[0, maxValue + 2]}
              />
              <Tooltip content={<ChartTooltip chartType="activities" />} />
              <Line
                type="monotone"
                dataKey="activities"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{
                  fill: chartColors.primary,
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: chartColors.primary,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
