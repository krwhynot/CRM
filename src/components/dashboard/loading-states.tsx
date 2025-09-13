import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// KPI Card Loading Skeleton
import { semanticSpacing, semanticRadius } from '@/styles/tokens'
export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('dashboard-card h-[180px]', className)}>
      <CardHeader className="pb-2">
        <div className="animate-pulse">
          <div className={cn(semanticSpacing.bottomGap.xs, 'flex items-center justify-between')}>
            <Skeleton className={cn(semanticRadius.small, 'h-4 w-24')} />
            <Skeleton className={cn(semanticRadius.small, 'size-5')} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className={cn(semanticSpacing.stack.xs, 'animate-pulse')}>
          <div className={cn(semanticSpacing.inline.xs, 'flex items-baseline')}>
            <Skeleton className={cn(semanticRadius.small, 'h-8 w-20')} />
            <Skeleton className={cn(semanticRadius.small, 'h-4 w-12')} />
          </div>
          <Skeleton className={cn(semanticRadius.small, 'h-3 w-32')} />
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
        <div className={cn(semanticSpacing.stack.xs, 'animate-pulse')}>
          <Skeleton className={cn(semanticRadius.small, 'h-5 w-32')} />
          <Skeleton className={cn(semanticRadius.small, 'h-3 w-48')} />
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', height)}>
        <div className={cn(semanticSpacing.stack.md, 'size-full animate-pulse')}>
          {/* Simulated chart bars/lines */}
          <div className={cn(semanticSpacing.inline.xs, 'flex h-full items-end justify-between')}>
            <Skeleton className="h-3/4 w-full ${semanticRadius.default}-t" />
            <Skeleton className="size-full ${semanticRadius.default}-t" />
            <Skeleton className="h-1/2 w-full ${semanticRadius.default}-t" />
            <Skeleton className="h-5/6 w-full ${semanticRadius.default}-t" />
            <Skeleton className="h-2/3 w-full ${semanticRadius.default}-t" />
            <Skeleton className="h-4/5 w-full ${semanticRadius.default}-t" />
          </div>
          {/* Simulated x-axis labels */}
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={cn(semanticRadius.small, 'h-3 w-8')} />
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
          <Skeleton className={cn(semanticRadius.small, 'h-5 w-32')} />
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(semanticSpacing.inline.sm, 'flex animate-pulse items-start')}
          >
            <Skeleton className={cn(semanticRadius.full, 'size-8')} />
            <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Skeleton className={cn(semanticRadius.small, 'h-4 w-24')} />
                <Skeleton className={cn(semanticRadius.small, 'h-3 w-16')} />
              </div>
              <Skeleton className={cn(semanticRadius.small, 'h-3 w-full')} />
              <Skeleton className={cn(semanticRadius.small, 'h-3 w-3/4')} />
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
      <div className={cn(semanticSpacing.stack.md, 'animate-pulse')}>
        <Skeleton className={cn(semanticRadius.small, 'h-8 w-48')} />
        <Skeleton className={cn(semanticRadius.small, 'h-4 w-72')} />
      </div>

      {/* KPI Grid */}
      <KpiGridSkeleton />

      {/* Charts Grid */}
      <ChartsGridSkeleton />

      {/* Bottom Section */}
      <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 lg:grid-cols-3')}>
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
