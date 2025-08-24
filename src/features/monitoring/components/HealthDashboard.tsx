/**
 * Production Health Dashboard Component
 * 
 * Real-time monitoring dashboard for system health and performance metrics
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useHealthStatus } from '@/lib/monitoring'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useHealthDashboardState } from '@/hooks/useHealthDashboardState'
import { SystemStatusOverview } from './health-dashboard/SystemStatusOverview'
import { PerformanceMetrics } from './health-dashboard/PerformanceMetrics'
import { DetailedSystemInfo } from './health-dashboard/DetailedSystemInfo'

interface HealthDashboardProps {
  showDetails?: boolean
  refreshInterval?: number
}

export function HealthDashboard({ showDetails = false, refreshInterval = 60000 }: HealthDashboardProps) {
  const { status, summary, isHealthy } = useHealthStatus()
  const { lastUpdated } = useHealthDashboardState(refreshInterval)

  if (!status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading system health...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <SystemStatusOverview 
        status={status}
        summary={summary}
        isHealthy={isHealthy}
      />
      
      <PerformanceMetrics performance={status.performance} />
      
      {showDetails && (
        <DetailedSystemInfo status={status} />
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          Refresh Status
        </Button>
      </div>
    </div>
  )
}

/**
 * Compact health status indicator for header/navigation
 */
export function HealthStatusIndicator() {
  const { summary, isHealthy } = useHealthStatus()
  
  return (
    <div className="flex items-center space-x-2">
      {isHealthy ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">{summary}</span>
    </div>
  )
}

export default HealthDashboard