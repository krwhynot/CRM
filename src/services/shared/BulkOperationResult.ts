import type { ServiceResponse } from './ServiceResponse'

/**
 * Result of a single operation in a bulk operation
 */
export interface BulkOperationItem<T = unknown> {
  /** Unique identifier for this item */
  id: string
  /** Operation status */
  status: 'success' | 'error' | 'skipped'
  /** Result data if successful */
  data?: T
  /** Error information if failed */
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  /** Additional metadata for this item */
  metadata?: Record<string, unknown>
}

/**
 * Complete result of a bulk operation
 */
export interface BulkOperationResult<T = unknown> {
  /** Overall operation summary */
  summary: {
    total: number
    successful: number
    failed: number
    skipped: number
    processingTime?: number
  }
  /** Individual item results */
  items: BulkOperationItem<T>[]
  /** Overall operation status */
  overallStatus: 'complete_success' | 'partial_success' | 'complete_failure'
  /** Additional operation metadata */
  metadata?: {
    operationType: string
    timestamp: string
    batchSize?: number
    processingStrategy?: 'sequential' | 'parallel' | 'batched'
  }
}

/**
 * Input for bulk operations
 */
export interface BulkOperationInput<T = unknown> {
  /** Items to process */
  items: Array<{
    id: string
    data: T
    metadata?: Record<string, unknown>
  }>
  /** Operation options */
  options?: {
    /** Processing strategy */
    strategy?: 'sequential' | 'parallel' | 'batched'
    /** Batch size for batched processing */
    batchSize?: number
    /** Continue processing even if some items fail */
    continueOnError?: boolean
    /** Maximum concurrent operations for parallel processing */
    maxConcurrency?: number
    /** Timeout per item in milliseconds */
    itemTimeout?: number
  }
}

/**
 * Builder class for creating bulk operation results
 */
export class BulkOperationResultBuilder<T = unknown> {
  private items: BulkOperationItem<T>[] = []
  private operationType: string
  private startTime: number
  private processingStrategy: 'sequential' | 'parallel' | 'batched'

  constructor(
    operationType: string,
    processingStrategy: 'sequential' | 'parallel' | 'batched' = 'sequential'
  ) {
    this.operationType = operationType
    this.processingStrategy = processingStrategy
    this.startTime = performance.now()
  }

  /**
   * Add a successful operation result
   */
  addSuccess(id: string, data: T, metadata?: Record<string, unknown>): this {
    this.items.push({
      id,
      status: 'success',
      data,
      metadata,
    })
    return this
  }

  /**
   * Add a failed operation result
   */
  addError(
    id: string,
    error: { code: string; message: string; details?: Record<string, unknown> },
    metadata?: Record<string, unknown>
  ): this {
    this.items.push({
      id,
      status: 'error',
      error,
      metadata,
    })
    return this
  }

  /**
   * Add a skipped operation result
   */
  addSkipped(id: string, reason: string, metadata?: Record<string, unknown>): this {
    this.items.push({
      id,
      status: 'skipped',
      error: {
        code: 'SKIPPED',
        message: reason,
      },
      metadata,
    })
    return this
  }

  /**
   * Add multiple results from individual service responses
   */
  addFromServiceResponses(
    responses: Array<{
      id: string
      response: ServiceResponse<T>
      metadata?: Record<string, unknown>
    }>
  ): this {
    responses.forEach(({ id, response, metadata }) => {
      if (response.success && response.data !== undefined) {
        this.addSuccess(id, response.data, metadata)
      } else {
        this.addError(
          id,
          {
            code: response.error?.code || 'UNKNOWN_ERROR',
            message: response.error?.message || 'Unknown error occurred',
            details: response.error?.details,
          },
          metadata
        )
      }
    })
    return this
  }

  /**
   * Build the final bulk operation result
   */
  build(): BulkOperationResult<T> {
    const processingTime = performance.now() - this.startTime

    const summary = {
      total: this.items.length,
      successful: this.items.filter((item) => item.status === 'success').length,
      failed: this.items.filter((item) => item.status === 'error').length,
      skipped: this.items.filter((item) => item.status === 'skipped').length,
      processingTime,
    }

    let overallStatus: BulkOperationResult<T>['overallStatus']
    if (summary.failed === 0 && summary.skipped === 0) {
      overallStatus = 'complete_success'
    } else if (summary.successful > 0) {
      overallStatus = 'partial_success'
    } else {
      overallStatus = 'complete_failure'
    }

    return {
      summary,
      items: this.items,
      overallStatus,
      metadata: {
        operationType: this.operationType,
        timestamp: new Date().toISOString(),
        processingStrategy: this.processingStrategy,
      },
    }
  }

  /**
   * Convert to ServiceResponse format
   */
  toServiceResponse(): ServiceResponse<BulkOperationResult<T>> {
    const result = this.build()

    return {
      success: result.overallStatus !== 'complete_failure',
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        operationId: this.operationType,
        processingTime: result.summary.processingTime,
      },
      ...(result.overallStatus === 'complete_failure' && {
        error: {
          code: 'BULK_OPERATION_FAILED',
          message: `Bulk ${this.operationType} failed: ${result.summary.failed} of ${result.summary.total} operations failed`,
          details: {
            summary: result.summary,
            failedItems: result.items.filter((item) => item.status === 'error'),
          },
        },
      }),
    }
  }
}

/**
 * Utility functions for bulk operations
 */
export class BulkOperationUtils {
  /**
   * Process items in batches
   */
  static async processBatches<TInput, TOutput>(
    items: TInput[],
    processor: (item: TInput, index: number) => Promise<TOutput>,
    options: {
      batchSize?: number
      maxConcurrency?: number
      continueOnError?: boolean
    } = {}
  ): Promise<Array<{ success: boolean; data?: TOutput; error?: Error; index: number }>> {
    const { batchSize = 10, maxConcurrency = 3, continueOnError = true } = options
    const results: Array<{ success: boolean; data?: TOutput; error?: Error; index: number }> = []

    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchPromises = batch.map(async (item, batchIndex) => {
        const originalIndex = i + batchIndex
        try {
          const data = await processor(item, originalIndex)
          return { success: true, data, index: originalIndex }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown error')
          return { success: false, error: err, index: originalIndex }
        }
      })

      // Wait for batch to complete with concurrency limit
      const batchResults = await this.limitConcurrency(batchPromises, maxConcurrency)
      results.push(...batchResults)

      // Check if we should continue processing
      if (!continueOnError && batchResults.some((result) => !result.success)) {
        break
      }
    }

    return results
  }

  /**
   * Limit concurrent promises
   */
  private static async limitConcurrency<T>(
    promises: Promise<T>[],
    maxConcurrency: number
  ): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<void>[] = []

    for (const promise of promises) {
      const wrappedPromise = promise.then((result) => {
        results.push(result)
      })

      executing.push(wrappedPromise)

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
        executing.splice(
          executing.findIndex((p) => p === wrappedPromise),
          1
        )
      }
    }

    await Promise.all(executing)
    return results
  }

  /**
   * Validate bulk operation input
   */
  static validateBulkInput<T>(input: BulkOperationInput<T>): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!input.items || !Array.isArray(input.items)) {
      errors.push('Items must be an array')
    } else {
      if (input.items.length === 0) {
        errors.push('Items array cannot be empty')
      }

      // Validate individual items
      input.items.forEach((item, index) => {
        if (!item.id) {
          errors.push(`Item at index ${index} is missing required 'id' field`)
        }
        if (item.data === undefined) {
          errors.push(`Item at index ${index} is missing required 'data' field`)
        }
      })

      // Check for duplicate IDs
      const ids = input.items.map((item) => item.id).filter(Boolean)
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`)
      }
    }

    // Validate options
    if (input.options) {
      const { batchSize, maxConcurrency, itemTimeout } = input.options

      if (batchSize !== undefined && (batchSize < 1 || batchSize > 1000)) {
        errors.push('Batch size must be between 1 and 1000')
      }

      if (maxConcurrency !== undefined && (maxConcurrency < 1 || maxConcurrency > 50)) {
        errors.push('Max concurrency must be between 1 and 50')
      }

      if (itemTimeout !== undefined && (itemTimeout < 1000 || itemTimeout > 300000)) {
        errors.push('Item timeout must be between 1 second and 5 minutes')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

/**
 * Type guards for bulk operation results
 */
export function isCompleteSuccess<T>(result: BulkOperationResult<T>): boolean {
  return result.overallStatus === 'complete_success'
}

export function isPartialSuccess<T>(result: BulkOperationResult<T>): boolean {
  return result.overallStatus === 'partial_success'
}

export function isCompleteFailure<T>(result: BulkOperationResult<T>): boolean {
  return result.overallStatus === 'complete_failure'
}
