/**
 * Production Health Dashboard Component
 * 
 * Real-time monitoring dashboard for system health and performance metrics
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useHealthStatus } from '@/lib/monitoring'
import { AlertCircle, CheckCircle, Clock, Database, Shield, Zap } from 'lucide-react'

interface HealthDashboardProps {
  showDetails?: boolean
  refreshInterval?: number
}

export function HealthDashboard({ showDetails = false, refreshInterval = 60000 }: HealthDashboardProps) {
  const { status, summary, isHealthy } = useHealthStatus()
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

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

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'down':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'down':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Health Status</span>
            <Badge 
              variant={isHealthy ? "default" : "destructive"}
              className={isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            >
              {summary}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Database Status */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="h-6 w-6 text-blue-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Database</span>
                  {getStatusIcon(status.database.status)}
                </div>
                <div className="text-sm text-gray-600">
                  {status.database.responseTime}ms response
                </div>
                <Badge 
                  variant="outline"
                  className={`text-xs ${getStatusColor(status.database.status)}`}
                >
                  {status.database.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Authentication Status */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Shield className="h-6 w-6 text-green-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Authentication</span>
                  {getStatusIcon(status.auth.status)}
                </div>
                <div className="text-sm text-gray-600">
                  {status.auth.responseTime}ms response
                </div>
                <Badge 
                  variant="outline"
                  className={`text-xs ${getStatusColor(status.auth.status)}`}
                >
                  {status.auth.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* API Status */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Zap className="h-6 w-6 text-purple-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">API Endpoints</span>
                  {getStatusIcon(status.api.status)}
                </div>
                <div className="text-sm text-gray-600">
                  {status.api.responseTime}ms response
                </div>
                <Badge 
                  variant="outline"
                  className={`text-xs ${getStatusColor(status.api.status)}`}
                >
                  {status.api.status.toUpperCase()}
                </Badge>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {status.performance.averageQueryTime}ms
              </div>
              <div className="text-sm text-gray-600">Average Query Time</div>
              <div className="text-xs text-gray-500">Target: &lt;25ms</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {status.performance.pageLoadTime}ms
              </div>
              <div className="text-sm text-gray-600">Page Load Time</div>
              <div className="text-xs text-gray-500">Target: &lt;3000ms</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {status.performance.errorRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
              <div className="text-xs text-gray-500">Target: &lt;1%</div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
              {/* Database Details */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Database Service</span>
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Status: {status.database.status}</div>
                  <div>Response Time: {status.database.responseTime}ms</div>
                  <div>Last Check: {new Date(status.database.timestamp).toLocaleTimeString()}</div>
                  {status.database.details && (
                    <div className="text-yellow-600">Details: {status.database.details}</div>
                  )}
                </div>
              </div>

              {/* Auth Details */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Authentication Service</span>
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Status: {status.auth.status}</div>
                  <div>Response Time: {status.auth.responseTime}ms</div>
                  <div>Last Check: {new Date(status.auth.timestamp).toLocaleTimeString()}</div>
                  {status.auth.details && (
                    <div className="text-yellow-600">Details: {status.auth.details}</div>
                  )}
                </div>
              </div>

              {/* API Details */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>API Service</span>
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Status: {status.api.status}</div>
                  <div>Response Time: {status.api.responseTime}ms</div>
                  <div>Last Check: {new Date(status.api.timestamp).toLocaleTimeString()}</div>
                  {status.api.details && (
                    <div className="text-yellow-600">Details: {status.api.details}</div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
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