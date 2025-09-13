/**
 * Production Health Dashboard Component
 *
 * Real-time monitoring dashboard for system health and performance metrics
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useHealthStatus } from '@/lib/monitoring'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useHealthDashboardState } from '@/hooks/useHealthDashboardState'
import { SystemStatusOverview } from './health-dashboard/SystemStatusOverview'
import { PerformanceMetrics } from './health-dashboard/PerformanceMetrics'
import { DetailedSystemInfo } from './health-dashboard/DetailedSystemInfo'

interface HealthDashboardProps {
  showDetails?: boolean
  refreshInterval?: number
}

export function HealthDashboard({
  showDetails = false,
  refreshInterval = 60000,
}: HealthDashboardProps) {
  const { status, isHealthy } = useHealthStatus()
  const { lastUpdated } = useHealthDashboardState(refreshInterval)

  if (!status) {
    return (
      <Card>
        <CardContent
          className={`flex items-center justify-center ${semanticSpacing.verticalPadding.xxl}`}
        >
          <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
            <Clock className="size-4 animate-spin" />
            <span>Loading system health...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Convert SystemMetrics to expected SystemStatus format
  const systemStatus = {
    database: {
      status: status.database.status as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
      lastChecked: status.database.timestamp,
      responseTime: status.database.responseTime,
      message: status.database.details,
    },
    auth: {
      status: status.auth.status as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
      lastChecked: status.auth.timestamp,
      responseTime: status.auth.responseTime,
      message: status.auth.details,
    },
    api: {
      status: status.api.status as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
      lastChecked: status.api.timestamp,
      responseTime: status.api.responseTime,
      message: status.api.details,
    },
    overall: (isHealthy
      ? 'healthy'
      : status.database.status === 'down' ||
          status.auth.status === 'down' ||
          status.api.status === 'down'
        ? 'unhealthy'
        : 'degraded') as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
    lastUpdated: new Date().toISOString(),
  }

  // For DetailedSystemInfo component - needs ServiceDetail format
  const detailedSystemStatus = {
    database: {
      status: status.database.status,
      responseTime: status.database.responseTime,
      timestamp: status.database.timestamp,
      details: status.database.details,
    },
    auth: {
      status: status.auth.status,
      responseTime: status.auth.responseTime,
      timestamp: status.auth.timestamp,
      details: status.auth.details,
    },
    api: {
      status: status.api.status,
      responseTime: status.api.responseTime,
      timestamp: status.api.timestamp,
      details: status.api.details,
    },
  }

  // Convert string summary to expected HealthSummary format
  const healthSummary = {
    totalServices: 3,
    healthyServices: [status.database, status.auth, status.api].filter(
      (s) => s.status === 'healthy'
    ).length,
    degradedServices: [status.database, status.auth, status.api].filter(
      (s) => s.status === 'degraded'
    ).length,
    unhealthyServices: [status.database, status.auth, status.api].filter((s) => s.status === 'down')
      .length,
    overallHealth: isHealthy
      ? ('healthy' as const)
      : status.database.status === 'down' ||
          status.auth.status === 'down' ||
          status.api.status === 'down'
        ? ('unhealthy' as const)
        : ('degraded' as const),
    uptime: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  }

  return (
    <div className={semanticSpacing.layoutContainer}>
      <SystemStatusOverview status={systemStatus} summary={healthSummary} isHealthy={isHealthy} />

      <PerformanceMetrics performance={status.performance} />

      {showDetails && <DetailedSystemInfo status={detailedSystemStatus} />}

      <div
        className={`flex items-center justify-between ${semanticTypography.body} text-muted-foreground`}
      >
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
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
    <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
      {isHealthy ? (
        <CheckCircle className="size-4 text-success" />
      ) : (
        <AlertCircle className="size-4 text-destructive" />
      )}
      <span className={semanticTypography.caption}>{summary}</span>
    </div>
  )
}

export default HealthDashboard
