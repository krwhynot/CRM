import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { semanticSpacing } from '@/styles/tokens'

// Interface following error prevention rules
export interface InteractionTimelineSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  itemCount?: number
  className?: string
}

export const InteractionTimelineSkeleton = forwardRef<
  HTMLDivElement,
  InteractionTimelineSkeletonProps
>(({ itemCount = 4, className, ...props }, ref) => {
  return (
    <Card ref={ref} className={cn(semanticSpacing.topGap.lg, className)} {...props}>
      <CardHeader
        className={`flex flex-row items-center justify-between space-y-0 ${semanticSpacing.bottomPadding.lg}`}
      >
        <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
          <Skeleton className="h-6 w-32" />
          <Skeleton className={cn(semanticRadius.full, 'h-5 w-8')} />
        </div>
        <Skeleton className="h-9 w-24" />
      </CardHeader>

      <CardContent
        className={`${semanticSpacing.cardContainer} md:${semanticSpacing.cardContainer}`}
      >
        <div className={semanticSpacing.stackContainer}>
          <div className="relative">
            {/* Timeline line skeleton */}
            <div className="absolute inset-y-0 left-4 w-0.5 bg-gray-200" />

            {/* Timeline items skeletons */}
            <div className={semanticSpacing.stackContainer}>
              {Array.from({ length: itemCount }).map((_, index) => (
                <div key={index} className={`relative flex ${semanticSpacing.gap.lg}`}>
                  {/* Timeline dot skeleton */}
                  <div className="relative z-10 shrink-0">
                    <Skeleton className={cn(semanticRadius.full, 'size-8')} />
                  </div>

                  {/* Content skeleton */}
                  <div className={`min-w-0 flex-1 ${semanticSpacing.stack.xs}`}>
                    {/* Header skeleton */}
                    <div className={`flex items-start justify-between ${semanticSpacing.gap.xs}`}>
                      <div className={`min-w-0 flex-1 ${semanticSpacing.stack.xs}`}>
                        <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className={cn(semanticRadius.full, 'h-5 w-16')} />
                          {/* Sometimes show follow-up badge */}
                          {index % 3 === 0 && (
                            <Skeleton className={cn(semanticRadius.full, 'h-5 w-20')} />
                          )}
                        </div>

                        {/* Date/time skeleton */}
                        <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className={cn(semanticRadius.full, 'h-3 w-1')} />
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className={cn(semanticRadius.full, 'h-3 w-1')} />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>

                      {/* Actions skeleton */}
                      <div className={`flex shrink-0 items-center ${semanticSpacing.gap.xs}`}>
                        <Skeleton className={cn(semanticRadius.small, 'size-6')} />
                        <Skeleton className={cn(semanticRadius.small, 'size-6')} />
                      </div>
                    </div>

                    {/* Preview content skeleton */}
                    <div className={semanticSpacing.stack.xxs}>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Show more button skeleton */}
          <div className={`border-t ${semanticSpacing.topPadding.lg} text-center`}>
            <Skeleton className="mx-auto h-9 w-32 md:mx-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

InteractionTimelineSkeleton.displayName = 'InteractionTimelineSkeleton'
