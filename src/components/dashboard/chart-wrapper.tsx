import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChartWrapperProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  isLoading?: boolean
  height?: string
  className?: string
  headerAction?: React.ReactNode
}

export function ChartWrapper({
  title,
  subtitle,
  children,
  isLoading = false,
  height = 'h-[400px]',
  className,
  headerAction,
}: ChartWrapperProps) {
  return (
    <Card className={cn('dashboard-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', height)}>
        {isLoading ? (
          <div className="h-full space-y-4">
            <Skeleton className="size-full rounded-lg" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

// Pre-configured chart wrappers for common chart types
interface AnalyticsChartWrapperProps extends Omit<ChartWrapperProps, 'title'> {
  title?: string
}

export function OpportunityChartWrapper({
  title = 'Opportunities Overview',
  ...props
}: AnalyticsChartWrapperProps) {
  return (
    <ChartWrapper title={title} subtitle="Pipeline activity and conversion trends" {...props} />
  )
}

export function ActivityChartWrapper({
  title = 'Activity Trends',
  ...props
}: AnalyticsChartWrapperProps) {
  return <ChartWrapper title={title} subtitle="Interaction and engagement metrics" {...props} />
}

export function PerformanceChartWrapper({
  title = 'Performance Metrics',
  ...props
}: AnalyticsChartWrapperProps) {
  return <ChartWrapper title={title} subtitle="Team and individual performance data" {...props} />
}

// Specialized chart wrapper for compact layouts
export function CompactChartWrapper({
  title,
  children,
  isLoading = false,
  className,
}: {
  title: string
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}) {
  return (
    <Card className={cn('dashboard-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        {isLoading ? <Skeleton className="size-full rounded-lg" /> : children}
      </CardContent>
    </Card>
  )
}
