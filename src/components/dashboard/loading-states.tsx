import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// KPI Card Loading Skeleton
export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('dashboard-card h-[180px]', className)}>
      <CardHeader className="pb-2">
        <div className="animate-pulse">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="size-5 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className="animate-pulse space-y-2">
          <div className="flex items-baseline space-x-2">
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

// Chart Loading Skeleton
export function ChartSkeleton({
  className,
  height = 'h-[400px]',
}: {
  className?: string
  height?: string
}) {
  return (
    <Card className={cn('dashboard-card', className)}>
      <CardHeader className="pb-4">
        <div className="animate-pulse space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', height)}>
        <div className="size-full animate-pulse space-y-4">
          {/* Simulated chart bars/lines */}
          <div className="flex h-full items-end justify-between space-x-2">
            <Skeleton className="h-3/4 w-full rounded-t" />
            <Skeleton className="size-full rounded-t" />
            <Skeleton className="h-1/2 w-full rounded-t" />
            <Skeleton className="h-5/6 w-full rounded-t" />
            <Skeleton className="h-2/3 w-full rounded-t" />
            <Skeleton className="h-4/5 w-full rounded-t" />
          </div>
          {/* Simulated x-axis labels */}
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8 rounded" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// KPI Grid Loading State
export function KpiGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('dashboard-grid dashboard-grid-kpi', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <KpiCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Charts Grid Loading State
export function ChartsGridSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('dashboard-grid dashboard-grid-charts', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ChartSkeleton key={index} />
      ))}
    </div>
  )
}

// Activity Feed Loading State
export function ActivityFeedSkeleton({
  count = 5,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <Card className={cn('dashboard-card', className)}>
      <CardHeader className="pb-4">
        <div className="animate-pulse">
          <Skeleton className="h-5 w-32 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex animate-pulse items-start space-x-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Comprehensive Dashboard Loading State
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="animate-pulse space-y-4">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* KPI Grid */}
      <KpiGridSkeleton />

      {/* Charts Grid */}
      <ChartsGridSkeleton />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ActivityFeedSkeleton />
      </div>
    </div>
  )
}

// Pulse Animation Variants
export function PulseCard({
  children,
  isLoading,
  className,
}: {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}) {
  return (
    <Card
      className={cn(
        'dashboard-card transition-all duration-200',
        isLoading && 'animate-pulse bg-muted/5',
        className
      )}
    >
      {children}
    </Card>
  )
}
