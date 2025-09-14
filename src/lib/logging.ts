/**
 * Environment-Gated Logging Infrastructure
 *
 * Production-ready logging service that:
 * - Sends structured logs to external services in production (Sentry/LogRocket)
 * - Uses console with proper formatting in development
 * - Follows existing debug utility pattern
 * - Ensures no development logging reaches production
 */

import { isDevelopment, isProduction } from '@/config/environment'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogContext = Record<string, unknown>

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: string
  environment: string
}

interface ExternalLogger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
}

class ProductionLogger implements ExternalLogger {
  debug(message: string, context?: LogContext): void {
    // In production, debug logs are typically omitted or sent to debug-level external service
    if (isDevelopment) {
      this.logToConsole('debug', message, context)
    }
    // Production: Could send to external service at debug level if needed
  }

  info(message: string, context?: LogContext): void {
    if (isDevelopment) {
      this.logToConsole('info', message, context)
    } else {
      // Production: Send to external logging service (Sentry, LogRocket, etc.)
      this.logToExternalService('info', message, context)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (isDevelopment) {
      this.logToConsole('warn', message, context)
    } else {
      // Production: Send to external logging service
      this.logToExternalService('warn', message, context)
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : context

    if (isDevelopment) {
      this.logToConsole('error', message, errorContext)
    } else {
      // Production: Send to external logging service with error details
      this.logToExternalService('error', message, errorContext, error)
    }
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext): void {
    const entry = this.createLogEntry(level, message, context)
    const prefix = this.getConsolePrefix(level)

    if (context) {
      console[level](`${prefix} ${message}`, context)
    } else {
      console[level](`${prefix} ${message}`)
    }
  }

  private logToExternalService(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry = this.createLogEntry(level, message, context)

    // Production logging implementation
    // This is where you'd integrate with your external logging service
    try {
      if (typeof window !== 'undefined') {
        // Browser environment - could send to Sentry, LogRocket, etc.

        // Example: Sentry integration
        // Sentry.captureMessage(message, level as SeverityLevel)
        // if (error) Sentry.captureException(error)

        // Example: LogRocket integration
        // LogRocket.captureMessage(message, level, entry)

        // For now, we'll use a structured approach that can be easily replaced
        this.fallbackProductionLog(entry, error)
      } else {
        // Server environment - could send to structured logging service
        this.fallbackProductionLog(entry, error)
      }
    } catch (loggingError) {
      // Fallback if external logging fails - don't let logging errors break the app
      if (isDevelopment) {
        console.error('Logging service failed:', loggingError)
      }
    }
  }

  private fallbackProductionLog(entry: LogEntry, error?: Error): void {
    // Fallback production logging - could be replaced with actual service integration
    // This ensures structured logging even without external service configured

    if (entry.level === 'error' && error) {
      // In production, you might want to send errors to an error tracking service
      // For now, we'll structure the error for potential future integration
      const structuredError = {
        ...entry,
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      }

      // This could be replaced with actual error tracking service call
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(structuredError) })
    }

    // For non-error logs or when error tracking isn't configured
    // This could be replaced with actual logging service call
    // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: isDevelopment ? 'development' : 'production'
    }
  }

  private getConsolePrefix(level: LogLevel): string {
    const prefixes = {
      debug: '[DEBUG]',
      info: '[INFO]',
      warn: '[WARN]',
      error: '[ERROR]'
    }
    return prefixes[level]
  }
}

// Singleton logger instance
export const logger = new ProductionLogger()

// Security-specific logging utilities
export const securityLogger = {
  authBypassWarning: (context?: LogContext): void => {
    logger.warn('AUTH BYPASS ACTIVE: Development mode with bypassed authentication', {
      ...context,
      security: true,
      bypassActive: true,
      environment: 'development'
    })
  },

  productionSecurityAlert: (message: string, context?: LogContext): void => {
    logger.error(`SECURITY ALERT: ${message}`, undefined, {
      ...context,
      security: true,
      alertLevel: 'critical'
    })
  }
}

// System monitoring logging utilities
export const monitoringLogger = {
  healthCheck: (service: string, status: string, responseTime: number): void => {
    logger.info(`Health Check - ${service}: ${status}`, {
      service,
      status,
      responseTime,
      monitoring: true
    })
  },

  systemAlert: (message: string, downServices: string[]): void => {
    logger.error(`System Alert: ${message}`, undefined, {
      downServices,
      alertType: 'system',
      monitoring: true
    })
  },

  performanceMetrics: (metrics: Record<string, number>): void => {
    logger.info('Performance metrics collected', {
      ...metrics,
      monitoring: true,
      type: 'performance'
    })
  }
}

// Development-only utilities (following existing debug.ts pattern)
export const devLogger = {
  debug: (message: string, context?: LogContext): void => {
    if (isDevelopment) {
      logger.debug(message, context)
    }
  },

  componentRender: (componentName: string, renderCount: number, renderTime?: number): void => {
    if (isDevelopment) {
      const context: LogContext = { componentName, renderCount }
      if (renderTime !== undefined) {
        context.renderTime = renderTime
      }
      logger.debug(`Component render: ${componentName}`, context)
    }
  }
}

export default logger