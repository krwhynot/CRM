import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface PrincipalMetrics {
  opportunityCount: number
  interactionCount: number
  lastActivity: Date | null
  totalValue: number
  activeOpportunities: number
}

interface PrincipalMetricsGridProps {
  metrics: PrincipalMetrics
  isLoading: boolean
}

export const PrincipalMetricsGrid: React.FC<PrincipalMetricsGridProps> = ({
  metrics,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Total Opportunities:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-8" />
          ) : (
            <p className="text-lg font-medium">{metrics.opportunityCount}</p>
          )}
        </div>
        
        <div className="space-y-1">
          <span className="text-muted-foreground">Active:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-8" />
          ) : (
            <p className="text-lg font-medium text-green-600">
              {metrics.activeOpportunities}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Activities:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-8" />
          ) : (
            <p className="font-medium">{metrics.interactionCount}</p>
          )}
        </div>
        
        <div className="space-y-1">
          <span className="text-muted-foreground">Est. Value:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <p className="font-medium">
              ${metrics.totalValue.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Last Activity */}
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Last Activity:</span>
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : metrics.lastActivity ? (
          <p className="text-sm font-medium">
            {format(metrics.lastActivity, 'MMM d, yyyy')}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  )
}