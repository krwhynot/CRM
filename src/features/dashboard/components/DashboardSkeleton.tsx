import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-9 w-44" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-9 w-44" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-9 w-36" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Opportunity Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-chart space-y-4">
              <div className="flex h-full items-end justify-between">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <Skeleton 
                      className="w-8 animate-pulse"
                      style={{ height: `${Math.random() * 150 + 50}px` }}
                    />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interaction Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-chart space-y-4">
              <div className="flex h-full items-end justify-between">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <Skeleton 
                      className="w-8 animate-pulse"
                      style={{ height: `${Math.random() * 150 + 50}px` }}
                    />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3">
                <Skeleton className="size-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="size-3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
            <div className="flex justify-center pt-4">
              <Skeleton className="h-9 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="h-chart animate-pulse space-y-4">
      <div className="flex h-full items-end justify-between">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <Skeleton 
              className="w-8 bg-muted/60"
              style={{ height: `${Math.random() * 150 + 50}px` }}
            />
            <Skeleton className="h-3 w-12 bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const ActivityFeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-start space-x-3 p-3">
          <Skeleton className="size-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}