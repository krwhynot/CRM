import { Card, CardContent } from '@/components/ui/card'
import { Target, Activity } from 'lucide-react'
import { useChartStyling } from '../../hooks/useChartStyling'

interface DualChartsEmptyProps {
  className?: string
}

export function DualChartsEmpty({ className }: DualChartsEmptyProps) {
  const { cardClassName, contentClassName } = useChartStyling()
  
  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 ${className}`}>
      <Card className={cardClassName}>
        <CardContent className={`${contentClassName} flex h-chart-lg flex-col items-center justify-center`}>
          <Target className="mb-4 size-12 text-muted-foreground/30" />
          <h3 className="mb-2 text-lg font-semibold">No Opportunity Data</h3>
          <p className="text-center text-sm text-muted-foreground">
            No opportunities found for the selected time period and filters.
          </p>
        </CardContent>
      </Card>
      
      <Card className={cardClassName}>
        <CardContent className={`${contentClassName} flex h-chart-lg flex-col items-center justify-center`}>
          <Activity className="mb-4 size-12 text-muted-foreground/30" />
          <h3 className="mb-2 text-lg font-semibold">No Activity Data</h3>
          <p className="text-center text-sm text-muted-foreground">
            No activities found for the selected time period and filters.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}