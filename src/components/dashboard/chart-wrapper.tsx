import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
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
          <div className={`${semanticSpacing.stack.xs}`}>
            <CardTitle
              className={cn(semanticTypography.h4, semanticTypography.h4, 'text-foreground')}
            >
              {title}
            </CardTitle>
            {subtitle && (
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', height)}>
        {isLoading ? (
          <div className={cn(semanticSpacing.stack.md, 'h-full')}>
            <Skeleton className={cn(semanticRadius.large, 'size-full')} />
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
        <CardTitle
          className={cn(semanticTypography.body, semanticTypography.label, 'text-foreground')}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        {isLoading ? <Skeleton className={cn(semanticRadius.large, 'size-full')} /> : children}
      </CardContent>
    </Card>
  )
}
