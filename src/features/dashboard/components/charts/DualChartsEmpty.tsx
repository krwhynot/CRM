import { Card, CardContent } from '@/components/ui/card'
import { Target, Activity } from 'lucide-react'
import { useChartStyling } from '../../hooks/useChartStyling'

interface DualChartsEmptyProps {
  className?: string
}

export function DualChartsEmpty({ className }: DualChartsEmptyProps) {
  const { cardClassName, contentClassName } = useChartStyling()
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      <Card className={cardClassName}>
        <CardContent className={`${contentClassName} flex flex-col items-center justify-center h-[380px]`}>
          <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Opportunity Data</h3>
          <p className="text-sm text-muted-foreground text-center">
            No opportunities found for the selected time period and filters.
          </p>
        </CardContent>
      </Card>
      
      <Card className={cardClassName}>
        <CardContent className={`${contentClassName} flex flex-col items-center justify-center h-[380px]`}>
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