/**
 * Production Monitoring & Health Checks
 *
 * Comprehensive monitoring system for KitchenPantry CRM production environment
 */

import { isProduction } from '@/config/environment'

interface HealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  timestamp: string
  details?: string
}

interface SystemMetrics {
  database: HealthCheck
  api: HealthCheck
  auth: HealthCheck
  performance: {
    averageQueryTime: number
    pageLoadTime: number
    errorRate: number
  }
}

class ProductionMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map()
  private metrics: SystemMetrics | null = null

  /**
   * Database health check
   */
  async checkDatabaseHealth(): Promise<HealthCheck> {
    const startTime = Date.now()

    try {
      // Simple query to test database connectivity
      const response = await fetch('/api/health/database', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const healthCheck: HealthCheck = {
          service: 'database',
          status: responseTime < 100 ? 'healthy' : 'degraded',
          responseTime,
          timestamp: new Date().toISOString(),
          details: responseTime > 100 ? 'Database response time elevated' : undefined,
        }

        this.healthChecks.set('database', healthCheck)
        return healthCheck
      } else {
        throw new Error(`Database health check failed: ${response.status}`)
      }
    } catch (error) {
      const healthCheck: HealthCheck = {
        service: 'database',
        status: 'down',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      }

      this.healthChecks.set('database', healthCheck)
      return healthCheck
    }
  }

  /**
   * Authentication service health check
   */
  async checkAuthHealth(): Promise<HealthCheck> {
    const startTime = Date.now()

    try {
      // Test Supabase auth availability
      const response = await fetch('/api/health/auth', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const responseTime = Date.now() - startTime

      const healthCheck: HealthCheck = {
        service: 'auth',
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        timestamp: new Date().toISOString(),
        details: response.ok ? undefined : 'Authentication service issues detected',
      }

      this.healthChecks.set('auth', healthCheck)
      return healthCheck
    } catch (error) {
      const healthCheck: HealthCheck = {
        service: 'auth',
        status: 'down',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Auth service unavailable',
      }

      this.healthChecks.set('auth', healthCheck)
      return healthCheck
    }
  }

  /**
   * API endpoints health check
   */
  async checkApiHealth(): Promise<HealthCheck> {
    const startTime = Date.now()

    try {
      // Test critical API endpoints
      const endpoints = ['/api/organizations', '/api/contacts', '/api/opportunities']

      const checks = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint, { method: 'HEAD' })
            .then((res) => ({ endpoint, ok: res.ok, status: res.status }))
            .catch((err) => ({ endpoint, ok: false, status: 0, error: err.message }))
        )
      )

      const responseTime = Date.now() - startTime
      const failedChecks = checks.filter((check) => !check.ok)

      const healthCheck: HealthCheck = {
        service: 'api',
        status:
          failedChecks.length === 0
            ? 'healthy'
            : failedChecks.length < checks.length
              ? 'degraded'
              : 'down',
        responseTime,
        timestamp: new Date().toISOString(),
        details:
          failedChecks.length > 0
            ? `${failedChecks.length}/${checks.length} endpoints failing`
            : undefined,
      }

      this.healthChecks.set('api', healthCheck)
      return healthCheck
    } catch (error) {
      const healthCheck: HealthCheck = {
        service: 'api',
        status: 'down',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'API health check failed',
      }

      this.healthChecks.set('api', healthCheck)
      return healthCheck
    }
  }

  /**
   * Comprehensive system health check
   */
  async performHealthCheck(): Promise<SystemMetrics> {
    console.log('🔍 Performing comprehensive health check...')

    const [database, auth, api] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkAuthHealth(),
      this.checkApiHealth(),
    ])

    // Calculate performance metrics
    const performance = {
      averageQueryTime: database.responseTime,
      pageLoadTime: this.calculatePageLoadTime(),
      errorRate: this.calculateErrorRate(),
    }

    this.metrics = {
      database,
      auth,
      api,
      performance,
    }

    // Log health status
    this.logHealthStatus()

    return this.metrics
  }

  /**
   * Calculate average page load time from performance API
   */
  private calculatePageLoadTime(): number {
    if (typeof window === 'undefined') return 0

    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return Math.round(navigation.loadEventEnd - navigation.fetchStart)
    } catch {
      return 0
    }
  }

  /**
   * Calculate error rate based on recent health checks
   */
  private calculateErrorRate(): number {
    const checks = Array.from(this.healthChecks.values())
    if (checks.length === 0) return 0

    const errors = checks.filter((check) => check.status === 'down').length
    return (errors / checks.length) * 100
  }

  /**
   * Log comprehensive health status
   */
  private logHealthStatus(): void {
    if (!this.metrics) return

    const { database, auth, api, performance } = this.metrics

    console.log('📊 System Health Status:')
    console.log(`  Database: ${database.status} (${database.responseTime}ms)`)
    console.log(`  Auth: ${auth.status} (${auth.responseTime}ms)`)
    console.log(`  API: ${api.status} (${api.responseTime}ms)`)
    console.log(`  Performance:`)
    console.log(`    Query Time: ${performance.averageQueryTime}ms`)
    console.log(`    Page Load: ${performance.pageLoadTime}ms`)
    console.log(`    Error Rate: ${performance.errorRate}%`)

    // Alert if any service is down
    const downServices = [database, auth, api].filter((service) => service.status === 'down')
    if (downServices.length > 0) {
      console.error('🚨 ALERT: Services down:', downServices.map((s) => s.service).join(', '))
    }
  }

  /**
   * Get current system status summary
   */
  getStatusSummary(): string {
    if (!this.metrics) return 'Unknown'

    const { database, auth, api } = this.metrics
    const services = [database, auth, api]

    const healthyCount = services.filter((s) => s.status === 'healthy').length
    const degradedCount = services.filter((s) => s.status === 'degraded').length
    const downCount = services.filter((s) => s.status === 'down').length

    if (downCount > 0) return '🔴 System Issues Detected'
    if (degradedCount > 0) return '🟡 Performance Degraded'
    if (healthyCount === services.length) return '✅ All Systems Operational'

    return '🟡 System Status Unknown'
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): SystemMetrics | null {
    return this.metrics
  }
}

// Singleton instance
export const productionMonitor = new ProductionMonitor()

/**
 * Initialize production monitoring on app start
 */
export async function initializeMonitoring(): Promise<void> {
  if (!isProduction) return

  console.log('🚀 Initializing production monitoring...')

  try {
    await productionMonitor.performHealthCheck()

    // Set up periodic health checks (every 5 minutes)
    setInterval(
      async () => {
        await productionMonitor.performHealthCheck()
      },
      5 * 60 * 1000
    )

    console.log('✅ Production monitoring initialized')
  } catch (error) {
    console.error('❌ Failed to initialize monitoring:', error)
  }
}

/**
 * React hook for health status
 */
export function useHealthStatus() {
  const [status, setStatus] = React.useState<SystemMetrics | null>(null)

  React.useEffect(() => {
    const checkHealth = async () => {
      const metrics = await productionMonitor.performHealthCheck()
      setStatus(metrics)
    }

    checkHealth()

    const interval = setInterval(checkHealth, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  return {
    status,
    summary: productionMonitor.getStatusSummary(),
    isHealthy:
      status?.database.status === 'healthy' &&
      status?.auth.status === 'healthy' &&
      status?.api.status === 'healthy',
  }
}

// For React import
import React from 'react'

export default productionMonitor
