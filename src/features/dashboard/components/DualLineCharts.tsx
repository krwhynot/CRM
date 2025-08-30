import { useChartData } from '../hooks/useChartData'
import { 
  ChartLoadingSkeleton,
  OpportunitiesChart,
  ActivityChart 
} from './charts'
import type { WeeklyData } from '@/lib/date-utils'

interface DualLineChartsProps {
  data: WeeklyData[]
  isLoading?: boolean
  className?: string
}


export function DualLineCharts({ data, isLoading = false, className }: DualLineChartsProps) {
  const { chartData, maxOpportunities, maxActivities } = useChartData(data)

  if (isLoading) {
    return <ChartLoadingSkeleton className={className} />
  }

  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 ${className}`}>
      <OpportunitiesChart data={chartData} maxValue={maxOpportunities} />
      <ActivityChart data={chartData} maxValue={maxActivities} />
    </div>
  )
}

export { DualChartsEmpty as DualLineChartsEmpty } from './charts/DualChartsEmpty'