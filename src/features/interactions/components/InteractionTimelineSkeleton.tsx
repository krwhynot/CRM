import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// Interface following error prevention rules
export interface InteractionTimelineSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  itemCount?: number
  className?: string
  [key: string]: any // Migration safety
}

export const InteractionTimelineSkeleton = forwardRef<HTMLDivElement, InteractionTimelineSkeletonProps>(
  ({ itemCount = 4, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('mt-4', className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        
        <CardContent className="p-3 md:p-6">
          <div className="space-y-6">
            <div className="relative">
              {/* Timeline line skeleton */}
              <div className="absolute inset-y-0 left-4 w-0.5 bg-gray-200" />
              
              {/* Timeline items skeletons */}
              <div className="space-y-6">
                {Array.from({ length: itemCount }).map((_, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline dot skeleton */}
                    <div className="relative z-10 shrink-0">
                      <Skeleton className="size-8 rounded-full" />
                    </div>

                    {/* Content skeleton */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Header skeleton */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            {/* Sometimes show follow-up badge */}
                            {index % 3 === 0 && (
                              <Skeleton className="h-5 w-20 rounded-full" />
                            )}
                          </div>
                          
                          {/* Date/time skeleton */}
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-1 rounded-full" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-1 rounded-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>

                        {/* Actions skeleton */}
                        <div className="flex shrink-0 items-center gap-1">
                          <Skeleton className="size-6 rounded" />
                          <Skeleton className="size-6 rounded" />
                        </div>
                      </div>

                      {/* Preview content skeleton */}
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show more button skeleton */}
            <div className="border-t pt-4 text-center">
              <Skeleton className="mx-auto h-9 w-32 md:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

InteractionTimelineSkeleton.displayName = 'InteractionTimelineSkeleton'