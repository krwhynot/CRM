import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useChartStyling } from '../../hooks/useChartStyling'

interface ChartLoadingSkeletonProps {
  className?: string
}

export function ChartLoadingSkeleton({ className }: ChartLoadingSkeletonProps) {
  const { cardClassName, headerClassName, contentClassName } = useChartStyling()
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      <Card className={cardClassName}>
        <CardHeader className={headerClassName}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className={contentClassName}>
          <Skeleton className="h-chart w-full" />
        </CardContent>
      </Card>
      
      <Card className={cardClassName}>
        <CardHeader className={headerClassName}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className={contentClassName}>
          <Skeleton className="h-chart w-full" />
        </CardContent>
      </Card>
    </div>
  )
}