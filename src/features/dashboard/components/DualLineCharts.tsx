import { useChartData } from '@/hooks/useChartData'
import { ChartLoadingSkeleton } from './charts/ChartLoadingSkeleton'
import { OpportunitiesChart } from './charts/OpportunitiesChart'
import { InteractionsChart } from './charts/InteractionsChart'
import type { WeeklyData } from '@/lib/date-utils'

interface DualLineChartsProps {
  data: WeeklyData[]
  isLoading?: boolean
  className?: string
}


export function DualLineCharts({ data, isLoading = false, className }: DualLineChartsProps) {
  const { chartData, maxOpportunities, maxInteractions } = useChartData(data)

  if (isLoading) {
    return <ChartLoadingSkeleton className={className} />
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      <OpportunitiesChart data={chartData} maxValue={maxOpportunities} />
      <InteractionsChart data={chartData} maxValue={maxInteractions} />
    </div>
  )
}

export { DualChartsEmpty as DualLineChartsEmpty } from './charts/DualChartsEmpty'