/**
 * Monitoring & Health Types
 * 
 * Type definitions for system monitoring, health checks, and status reporting.
 */

/**
 * Service health status levels
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

/**
 * Service types in the CRM system
 */
export type ServiceType = 'database' | 'auth' | 'api' | 'storage' | 'realtime'

/**
 * Individual service status
 */
export interface ServiceStatus {
  status: HealthStatus
  lastChecked: Date | string
  responseTime?: number
  message?: string
  details?: Record<string, unknown>
}

/**
 * System-wide status overview
 */
export interface SystemStatus {
  database: ServiceStatus
  auth: ServiceStatus
  api: ServiceStatus
  storage?: ServiceStatus
  realtime?: ServiceStatus
  overall: HealthStatus
  lastUpdated: Date | string
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  service: ServiceType
  status: ServiceStatus
  timestamp: Date | string
}

/**
 * System health summary
 */
export interface HealthSummary {
  totalServices: number
  healthyServices: number
  degradedServices: number
  unhealthyServices: number
  overallHealth: HealthStatus
  uptime: {
    hours: number
    minutes: number
    seconds: number
  }
  lastIncident?: {
    service: ServiceType
    status: HealthStatus
    timestamp: Date | string
    resolved?: Date | string
  }
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  responseTime: {
    average: number
    min: number
    max: number
    p95: number
    p99: number
  }
  throughput: {
    requestsPerSecond: number
    requestsPerMinute: number
    requestsPerHour: number
  }
  errorRate: {
    percentage: number
    count: number
    total: number
  }
  resources: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkUsage: number
  }
}

/**
 * Monitoring dashboard data
 */
export interface MonitoringDashboardData {
  status: SystemStatus
  summary: HealthSummary
  performance: PerformanceMetrics
  isHealthy: boolean
  alerts?: HealthAlert[]
}

/**
 * Health alert levels
 */
export type AlertLevel = 'info' | 'warning' | 'critical'

/**
 * Health alert interface
 */
export interface HealthAlert {
  id: string
  service: ServiceType
  level: AlertLevel
  title: string
  message: string
  timestamp: Date | string
  resolved?: Date | string
  acknowledgedBy?: string
  acknowledgedAt?: Date | string
}

/**
 * System info details
 */
export interface SystemInfo {
  version: string
  environment: 'development' | 'staging' | 'production'
  region: string
  deployment: {
    id: string
    timestamp: Date | string
    commit: string
    branch: string
  }
  dependencies: {
    name: string
    version: string
    status: HealthStatus
  }[]
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  refreshInterval: number // in milliseconds
  alertThresholds: {
    responseTime: number
    errorRate: number
    uptime: number
  }
  enableRealTimeUpdates: boolean
  enableNotifications: boolean
}

/**
 * Health check function type
 */
export type HealthChecker = () => Promise<HealthCheckResult>

/**
 * Service status props for UI components
 */
export interface ServiceStatusProps {
  service: ServiceType
  status: ServiceStatus
  compact?: boolean
  showDetails?: boolean
  onStatusClick?: (service: ServiceType, status: ServiceStatus) => void
}

/**
 * Health dashboard props
 */
export interface HealthDashboardProps {
  data?: MonitoringDashboardData
  config?: MonitoringConfig
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onAlertAcknowledge?: (alertId: string) => void
}

/**
 * System status overview props
 */
export interface SystemStatusOverviewProps {
  status: SystemStatus
  summary: HealthSummary
  isHealthy: boolean
  compact?: boolean
}

/**
 * Performance metrics props
 */
export interface PerformanceMetricsProps {
  metrics: PerformanceMetrics
  timeRange?: '1h' | '6h' | '24h' | '7d'
  showCharts?: boolean
}

/**
 * Status indicator props
 */
export interface StatusIndicatorProps {
  status: HealthStatus
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  animated?: boolean
}

/**
 * Health status color mapping
 */
export const HealthStatusColors: Record<HealthStatus, string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  unhealthy: 'bg-red-500',
  unknown: 'bg-gray-500',
}

/**
 * Health status text mapping
 */
export const HealthStatusText: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unhealthy: 'Unhealthy',
  unknown: 'Unknown',
}

/**
 * Service type display names
 */
export const ServiceDisplayNames: Record<ServiceType, string> = {
  database: 'Database',
  auth: 'Authentication',
  api: 'API Gateway',
  storage: 'Storage',
  realtime: 'Real-time',
}

/**
 * Type guard to check if status is SystemStatus
 */
export function isSystemStatus(status: unknown): status is SystemStatus {
  return (
    typeof status === 'object' &&
    status !== null &&
    'database' in status &&
    'auth' in status &&
    'api' in status &&
    'overall' in status &&
    'lastUpdated' in status
  )
}

/**
 * Type guard to check if status is ServiceStatus
 */
export function isServiceStatus(status: unknown): status is ServiceStatus {
  return (
    typeof status === 'object' &&
    status !== null &&
    'status' in status &&
    'lastChecked' in status &&
    typeof (status as any).status === 'string'
  )
}

/**
 * Create default system status
 */
export function createDefaultSystemStatus(): SystemStatus {
  const defaultServiceStatus: ServiceStatus = {
    status: 'unknown',
    lastChecked: new Date().toISOString(),
    message: 'Status not available',
  }

  return {
    database: { ...defaultServiceStatus },
    auth: { ...defaultServiceStatus },
    api: { ...defaultServiceStatus },
    overall: 'unknown',
    lastUpdated: new Date().toISOString(),
  }
}