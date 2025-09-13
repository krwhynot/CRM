/**
 * Standardized response format for application services
 * Provides consistent error handling and result communication
 */
export interface ServiceResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ServiceError
  metadata?: ServiceMetadata
}

/**
 * Standardized error format for application services
 */
export interface ServiceError {
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string
}

/**
 * Additional metadata for service responses
 */
export interface ServiceMetadata {
  timestamp: string
  requestId?: string
  operationId?: string
  processingTime?: number
  validationErrors?: ValidationError[]
}

/**
 * Validation error format
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
  value?: unknown
}

/**
 * Service response builder utility
 */
export class ServiceResponseBuilder {
  /**
   * Create a successful response
   */
  static success<T>(data: T, metadata?: Partial<ServiceMetadata>): ServiceResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    }
  }

  /**
   * Create a failure response
   */
  static failure<T = never>(
    error: ServiceError | string,
    metadata?: Partial<ServiceMetadata>
  ): ServiceResponse<T> {
    const serviceError: ServiceError =
      typeof error === 'string'
        ? {
            code: 'GENERIC_ERROR',
            message: error,
          }
        : error

    return {
      success: false,
      error: serviceError,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    }
  }

  /**
   * Create a validation failure response
   */
  static validationFailure<T = never>(
    validationErrors: ValidationError[],
    message = 'Validation failed'
  ): ServiceResponse<T> {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        validationErrors,
      },
    }
  }

  /**
   * Transform a domain Result to ServiceResponse
   */
  static fromDomainResult<T>(
    result: { isSuccess: boolean; value?: T; error?: string },
    successMessage?: string
  ): ServiceResponse<T> {
    if (result.isSuccess) {
      return ServiceResponseBuilder.success(result.value!)
    }

    return ServiceResponseBuilder.failure({
      code: 'DOMAIN_ERROR',
      message: result.error || 'Domain operation failed',
    })
  }

  /**
   * Transform multiple domain Results to ServiceResponse
   */
  static fromDomainResults<T>(
    results: Array<{ isSuccess: boolean; value?: T; error?: string }>,
    operationType = 'bulk_operation'
  ): ServiceResponse<T[]> {
    const successful = results.filter((r) => r.isSuccess)
    const failed = results.filter((r) => !r.isSuccess)

    if (failed.length === 0) {
      return ServiceResponseBuilder.success(
        successful.map((r) => r.value!),
        {
          operationId: operationType,
          processingTime: 0, // Could be calculated if needed
        }
      )
    }

    // Partial success or complete failure
    const data = successful.length > 0 ? successful.map((r) => r.value!) : undefined

    return {
      success: failed.length === 0,
      data,
      error: {
        code: successful.length > 0 ? 'PARTIAL_FAILURE' : 'COMPLETE_FAILURE',
        message: `${failed.length} operations failed, ${successful.length} succeeded`,
        details: {
          failedCount: failed.length,
          successCount: successful.length,
          errors: failed.map((r) => r.error),
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
        operationId: operationType,
      },
    }
  }
}

/**
 * Type guards for service responses
 */
export function isServiceSuccess<T>(
  response: ServiceResponse<T>
): response is ServiceResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined
}

export function isServiceFailure<T>(
  response: ServiceResponse<T>
): response is ServiceResponse<T> & { success: false; error: ServiceError } {
  return response.success === false && response.error !== undefined
}

/**
 * Common error codes used across application services
 */
export const SERVICE_ERROR_CODES = {
  // Generic errors
  GENERIC_ERROR: 'GENERIC_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Domain errors
  DOMAIN_ERROR: 'DOMAIN_ERROR',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',

  // Operation errors
  PARTIAL_FAILURE: 'PARTIAL_FAILURE',
  COMPLETE_FAILURE: 'COMPLETE_FAILURE',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',

  // Infrastructure errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
} as const

export type ServiceErrorCode = (typeof SERVICE_ERROR_CODES)[keyof typeof SERVICE_ERROR_CODES]
