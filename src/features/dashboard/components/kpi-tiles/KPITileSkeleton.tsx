import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface KPITileSkeletonProps {
  className?: string
}

export function KPITileSkeleton({ className }: KPITileSkeletonProps) {
  return (
    <Card className={cn('h-24 border-border bg-background', className)}>
      <CardContent className="h-full p-4">
        <div className="animate-pulse">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-4" />
          </div>
          
          {/* Value */}
          <Skeleton className="mb-1 h-6 w-16" />
          
          {/* Subtitle/Trend */}
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// Grid of skeleton tiles for loading states
interface KPITileSkeletonGridProps {
  count?: number
  className?: string
}

export function KPITileSkeletonGrid({ count = 6, className }: KPITileSkeletonGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <KPITileSkeleton key={index} />
      ))}
    </div>
  )
}