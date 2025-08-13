/**
 * Centralized Error Handling System for KitchenPantry CRM
 * 
 * Provides consistent error handling, logging, and user feedback across the application
 */

import { ApiError } from './api'

// =============================================================================
// ERROR TYPES AND INTERFACES
// =============================================================================

export interface CRMError {
  code: string
  message: string
  userMessage: string
  details?: Record<string, unknown>
  timestamp: string
  context?: string
  stack?: string
}

export interface ErrorReportingConfig {
  enableConsoleLogging: boolean
  enableRemoteReporting: boolean
  enableUserNotifications: boolean
}

export interface UserFeedback {
  showProgress: (message: string) => void
  showSuccess: (message: string) => void
  showError: (message: string, options?: { retry?: () => void; details?: string }) => void
  hideProgress: () => void
}

// =============================================================================
// ERROR CODE CONSTANTS
// =============================================================================

export const ERROR_CODES = {
  // Authentication errors
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_CONSTRAINT_VIOLATION: 'VALIDATION_CONSTRAINT_VIOLATION',
  
  // Data errors
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_DUPLICATE: 'DATA_DUPLICATE',
  DATA_INTEGRITY_ERROR: 'DATA_INTEGRITY_ERROR',
  
  // Network errors
  NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_RATE_LIMITED: 'NETWORK_RATE_LIMITED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// =============================================================================
// USER-FRIENDLY ERROR MESSAGES
// =============================================================================

const ERROR_MESSAGES: Record<string, { message: string; userMessage: string }> = {
  [ERROR_CODES.AUTH_UNAUTHORIZED]: {
    message: 'User is not authorized to perform this action',
    userMessage: 'You do not have permission to perform this action. Please contact your administrator.'
  },
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: {
    message: 'User session has expired',
    userMessage: 'Your session has expired. Please sign in again to continue.'
  },
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    message: 'Invalid login credentials provided',
    userMessage: 'Invalid email or password. Please check your credentials and try again.'
  },
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: {
    message: 'Required field is missing or empty',
    userMessage: 'Please fill in all required fields and try again.'
  },
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: {
    message: 'Field format is invalid',
    userMessage: 'Please check the format of your input and try again.'
  },
  [ERROR_CODES.DATA_NOT_FOUND]: {
    message: 'Requested data was not found',
    userMessage: 'The requested item could not be found. It may have been deleted or moved.'
  },
  [ERROR_CODES.DATA_DUPLICATE]: {
    message: 'Duplicate data entry detected',
    userMessage: 'This item already exists. Please check your input and try again.'
  },
  [ERROR_CODES.NETWORK_CONNECTION_ERROR]: {
    message: 'Network connection failed',
    userMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
  },
  [ERROR_CODES.NETWORK_TIMEOUT]: {
    message: 'Request timed out',
    userMessage: 'The request is taking longer than expected. Please try again.'
  },
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: {
    message: 'Business rule constraint violated',
    userMessage: 'This action violates business rules. Please review your input and try again.'
  },
  [ERROR_CODES.PERMISSION_DENIED]: {
    message: 'Permission denied for this operation',
    userMessage: 'You do not have sufficient permissions to perform this action.'
  },
  [ERROR_CODES.SYSTEM_ERROR]: {
    message: 'Internal system error occurred',
    userMessage: 'A system error occurred. Please try again or contact support if the problem persists.'
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    message: 'An unexpected error occurred',
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }
}

// =============================================================================
// ERROR HANDLER CLASS
// =============================================================================

export class CRMErrorHandler {
  private static config: ErrorReportingConfig = {
    enableConsoleLogging: import.meta.env.DEV || false,
    enableRemoteReporting: import.meta.env.PROD || false,
    enableUserNotifications: true
  }

  /**
   * Configure error handling behavior
   */
  static configure(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Handle any error and convert to standardized CRM error
   */
  static handle(error: unknown, context?: string): CRMError {
    const crmError = this.createCRMError(error, context)
    
    // Log error if enabled
    if (this.config.enableConsoleLogging) {
      this.logError(crmError)
    }
    
    // Report to monitoring service if enabled
    if (this.config.enableRemoteReporting) {
      this.reportError(crmError)
    }
    
    return crmError
  }

  /**
   * Handle error with user feedback
   */
  static handleWithFeedback(
    error: unknown, 
    context: string,
    userFeedback: UserFeedback,
    showUserMessage = true
  ): CRMError {
    const crmError = this.handle(error, context)
    
    if (showUserMessage && this.config.enableUserNotifications) {
      userFeedback.showError(crmError.userMessage, {
        details: crmError.message
      })
    }
    
    return crmError
  }

  /**
   * Create a standardized CRM error from any error type
   */
  private static createCRMError(error: unknown, context?: string): CRMError {
    const timestamp = new Date().toISOString()
    
    // Handle ApiError
    if (error instanceof ApiError) {
      const errorInfo = this.getErrorInfo(error.code || ERROR_CODES.SYSTEM_ERROR)
      return {
        code: error.code || ERROR_CODES.SYSTEM_ERROR,
        message: error.message,
        userMessage: errorInfo.userMessage,
        details: { statusCode: error.statusCode, originalError: error.originalError },
        timestamp,
        context,
        stack: error.stack
      }
    }
    
    // Handle standard Error
    if (error instanceof Error) {
      const code = this.inferErrorCode(error.message)
      const errorInfo = this.getErrorInfo(code)
      return {
        code,
        message: error.message,
        userMessage: errorInfo.userMessage,
        timestamp,
        context,
        stack: error.stack
      }
    }
    
    // Handle Supabase errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorObj = error as { message: string; code?: string; details?: string }
      const code = errorObj.code ? this.mapSupabaseErrorCode(errorObj.code) : ERROR_CODES.SYSTEM_ERROR
      const errorInfo = this.getErrorInfo(code)
      
      return {
        code,
        message: errorObj.message,
        userMessage: errorInfo.userMessage,
        details: { originalCode: errorObj.code, details: errorObj.details },
        timestamp,
        context
      }
    }
    
    // Handle unknown errors
    const errorInfo = this.getErrorInfo(ERROR_CODES.UNKNOWN_ERROR)
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: String(error) || 'Unknown error',
      userMessage: errorInfo.userMessage,
      timestamp,
      context
    }
  }

  /**
   * Get error message information for a given error code
   */
  private static getErrorInfo(code: string): { message: string; userMessage: string } {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  }

  /**
   * Infer error code from error message patterns
   */
  private static inferErrorCode(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('permission')) {
      return ERROR_CODES.AUTH_UNAUTHORIZED
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
      return ERROR_CODES.DATA_NOT_FOUND
    }
    if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
      return ERROR_CODES.DATA_DUPLICATE
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return ERROR_CODES.NETWORK_CONNECTION_ERROR
    }
    if (lowerMessage.includes('timeout')) {
      return ERROR_CODES.NETWORK_TIMEOUT
    }
    if (lowerMessage.includes('required') || lowerMessage.includes('missing')) {
      return ERROR_CODES.VALIDATION_REQUIRED_FIELD
    }
    if (lowerMessage.includes('format') || lowerMessage.includes('invalid')) {
      return ERROR_CODES.VALIDATION_INVALID_FORMAT
    }
    
    return ERROR_CODES.SYSTEM_ERROR
  }

  /**
   * Map Supabase error codes to CRM error codes
   */
  private static mapSupabaseErrorCode(supabaseCode: string): string {
    const mapping: Record<string, string> = {
      '23505': ERROR_CODES.DATA_DUPLICATE, // unique_violation
      '23503': ERROR_CODES.DATA_INTEGRITY_ERROR, // foreign_key_violation
      '23502': ERROR_CODES.VALIDATION_REQUIRED_FIELD, // not_null_violation
      '42P01': ERROR_CODES.SYSTEM_ERROR, // undefined_table
      '08006': ERROR_CODES.NETWORK_CONNECTION_ERROR, // connection_failure
      'PGRST116': ERROR_CODES.DATA_NOT_FOUND, // No rows found
      'PGRST301': ERROR_CODES.AUTH_UNAUTHORIZED // JWT expired
    }
    
    return mapping[supabaseCode] || ERROR_CODES.SYSTEM_ERROR
  }

  /**
   * Log error to console (development only)
   */
  private static logError(error: CRMError): void {
    const logGroup = `🚨 CRM Error [${error.code}]`
    
    console.group(logGroup)
    console.error('Message:', error.message)
    console.error('User Message:', error.userMessage)
    console.error('Context:', error.context || 'Unknown')
    console.error('Timestamp:', error.timestamp)
    
    if (error.details) {
      console.error('Details:', error.details)
    }
    
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    
    console.groupEnd()
  }

  /**
   * Report error to monitoring service
   */
  private static reportError(error: CRMError): void {
    // In a real application, this would integrate with services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom error reporting API
    
    // For now, we'll use a placeholder
    if (import.meta.env.PROD) {
      // Example integration:
      // Sentry.captureException(new Error(error.message), {
      //   tags: { code: error.code, context: error.context },
      //   extra: error.details
      // })
    }
  }

  /**
   * Create a retry handler for failed operations
   */
  static createRetryHandler<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries = 3,
    baseDelay = 1000
  ): () => Promise<T> {
    return async () => {
      let lastError: unknown
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation()
        } catch (error) {
          lastError = error
          
          if (attempt === maxRetries) {
            throw this.handle(error, `${context} (attempt ${attempt}/${maxRetries})`)
          }
          
          // Exponential backoff delay
          const delay = baseDelay * Math.pow(2, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      
      throw this.handle(lastError, context)
    }
  }
}

// =============================================================================
// ERROR BOUNDARY HELPER
// =============================================================================

/**
 * Wrap async operations with error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  userFeedback?: UserFeedback
): Promise<T | null> => {
  try {
    return await operation()
  } catch (error) {
    if (userFeedback) {
      CRMErrorHandler.handleWithFeedback(error, context, userFeedback)
    } else {
      CRMErrorHandler.handle(error, context)
    }
    return null
  }
}

/**
 * Wrap sync operations with error handling
 */
export const withSyncErrorHandling = <T>(
  operation: () => T,
  context: string,
  userFeedback?: UserFeedback
): T | null => {
  try {
    return operation()
  } catch (error) {
    if (userFeedback) {
      CRMErrorHandler.handleWithFeedback(error, context, userFeedback)
    } else {
      CRMErrorHandler.handle(error, context)
    }
    return null
  }
}