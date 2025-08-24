import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ActivitySkeletonProps {
  className?: string
  useNewStyle?: boolean
}

export const ActivitySkeleton: React.FC<ActivitySkeletonProps> = ({ 
  className, 
  useNewStyle = false 
}) => {
  return (
    <Card className={`${useNewStyle ? "shadow-sm" : "shadow-md"} ${className}`}>
      <CardHeader className={useNewStyle ? "p-4 pb-3" : "p-6 pb-4"}>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className={useNewStyle ? "p-4 pt-0" : "p-6 pt-0"}>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}