import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from './DashboardSkeleton'
import { ChartEmptyState } from './EmptyState'
import { ChartDataPoint } from '@/types/dashboard'

interface ChartCardProps {
  title: string
  colorClass: string
  data: ChartDataPoint[]
  isLoading: boolean
  emptyTitle: string
  emptyDescription: string
  children: React.ReactNode
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  colorClass,
  data,
  isLoading,
  emptyTitle,
  emptyDescription,
  children
}) => {
  const hasData = data.some(d => d.count > 0)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : hasData ? (
          children
        ) : (
          <ChartEmptyState 
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </CardContent>
    </Card>
  )
}