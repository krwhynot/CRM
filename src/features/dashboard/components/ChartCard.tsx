import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from './DashboardSkeleton'
import { ChartEmptyState } from './EmptyState'

// Generic type that works with both dashboard and chart data
interface ChartData {
  count?: number
  value?: number
}

interface ChartCardProps<TData extends ChartData = ChartData> {
  title: string
  colorClass: string
  data: TData[]
  isLoading: boolean
  emptyTitle: string
  emptyDescription: string
  children: React.ReactNode
}

export const ChartCard = <TData extends ChartData = ChartData>({
  title,
  colorClass,
  data,
  isLoading,
  emptyTitle,
  emptyDescription,
  children,
}: ChartCardProps<TData>) => {
  const hasData = data.some((d) => (d.count || d.value || 0) > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`size-3 rounded-full ${colorClass}`}></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : hasData ? (
          children
        ) : (
          <ChartEmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  )
}
