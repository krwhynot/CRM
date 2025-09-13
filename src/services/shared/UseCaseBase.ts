import { QueryClient } from '@tanstack/react-query'
import type { ServiceResponse, ServiceError } from './ServiceResponse'
import { ServiceResponseBuilder, SERVICE_ERROR_CODES } from './ServiceResponse'

/**
 * Base interface for all use cases
 * Defines common structure and behavior for application service operations
 */
export interface UseCase<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): Promise<ServiceResponse<TOutput>>
}

/**
 * Context passed to all use cases
 * Contains shared dependencies and utilities
 */
export interface UseCaseContext {
  queryClient: QueryClient
  userId?: string
  transactionId?: string
  metadata?: Record<string, unknown>
}

/**
 * Base class for use cases with common functionality
 * Provides transaction support, error handling, and cache invalidation
 */
export abstract class UseCaseBase<TInput = unknown, TOutput = unknown>
  implements UseCase<TInput, TOutput>
{
  constructor(protected readonly context: UseCaseContext) {}

  /**
   * Main execution method - to be implemented by concrete use cases
   */
  abstract execute(input: TInput): Promise<ServiceResponse<TOutput>>

  /**
   * Protected helper methods for common operations
   */

  /**
   * Execute with automatic error handling and response wrapping
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    errorCode: string = SERVICE_ERROR_CODES.GENERIC_ERROR
  ): Promise<ServiceResponse<T>> {
    const startTime = performance.now()

    try {
      const result = await operation()
      const processingTime = performance.now() - startTime

      return ServiceResponseBuilder.success(result, {
        processingTime,
        requestId: this.context.transactionId,
      })
    } catch (error) {
      const processingTime = performance.now() - startTime
      const serviceError: ServiceError = {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: {
          originalError: error,
          stack: error instanceof Error ? error.stack : undefined,
        },
      }

      return ServiceResponseBuilder.failure(serviceError, {
        processingTime,
        requestId: this.context.transactionId,
      })
    }
  }

  /**
   * Execute within a transaction context
   */
  protected async executeInTransaction<T>(
    operation: () => Promise<T>,
    errorCode: string = SERVICE_ERROR_CODES.DATABASE_ERROR
  ): Promise<ServiceResponse<T>> {
    // For now, this is a placeholder for future transaction support
    // When Supabase transactions are implemented, this would wrap the operation
    return this.executeWithErrorHandling(operation, errorCode)
  }

  /**
   * Invalidate related cache entries
   */
  protected async invalidateCache(queryKeys: unknown[][]): Promise<void> {
    try {
      await Promise.all(
        queryKeys.map((key) => this.context.queryClient.invalidateQueries({ queryKey: key }))
      )
    } catch (error) {
      // Log cache invalidation errors but don't fail the operation
      console.warn('Cache invalidation failed:', error)
    }
  }

  /**
   * Invalidate and refetch cache entries
   */
  protected async refetchCache(queryKeys: unknown[][]): Promise<void> {
    try {
      await Promise.all(
        queryKeys.map((key) => this.context.queryClient.refetchQueries({ queryKey: key }))
      )
    } catch (error) {
      // Log cache refetch errors but don't fail the operation
      console.warn('Cache refetch failed:', error)
    }
  }

  /**
   * Update cache data optimistically
   */
  protected updateCacheData<TCacheData>(
    queryKey: unknown[],
    updater: (old: TCacheData | undefined) => TCacheData
  ): void {
    try {
      this.context.queryClient.setQueryData(queryKey, updater)
    } catch (error) {
      console.warn('Optimistic cache update failed:', error)
    }
  }

  /**
   * Validate input data using a validator function
   */
  protected validateInput<T>(
    input: T,
    validator: (input: T) => { isValid: boolean; errors?: string[] }
  ): ServiceResponse<never> | null {
    const validation = validator(input)

    if (!validation.isValid) {
      const validationErrors =
        validation.errors?.map((message) => ({
          field: 'input',
          message,
        })) || []

      return ServiceResponseBuilder.validationFailure(validationErrors, 'Input validation failed')
    }

    return null
  }

  /**
   * Create operation metadata
   */
  protected createMetadata(additionalMetadata?: Record<string, unknown>) {
    return {
      timestamp: new Date().toISOString(),
      userId: this.context.userId,
      transactionId: this.context.transactionId,
      ...this.context.metadata,
      ...additionalMetadata,
    }
  }
}

/**
 * Base class for query use cases (read operations)
 * Optimized for data fetching with caching support
 */
export abstract class QueryUseCaseBase<TInput = unknown, TOutput = unknown> extends UseCaseBase<
  TInput,
  TOutput
> {
  /**
   * Get cache key for this query
   */
  abstract getCacheKey(input: TInput): unknown[]

  /**
   * Execute query with caching support
   */
  protected async executeQuery<T>(
    input: TInput,
    queryFn: () => Promise<T>,
    options?: {
      skipCache?: boolean
      cacheTime?: number
    }
  ): Promise<ServiceResponse<T>> {
    const cacheKey = this.getCacheKey(input)

    if (!options?.skipCache) {
      // Try to get from cache first
      const cachedData = this.context.queryClient.getQueryData<T>(cacheKey)
      if (cachedData !== undefined) {
        return ServiceResponseBuilder.success(cachedData, {
          requestId: this.context.transactionId,
          operationId: 'cache_hit',
        })
      }
    }

    // Execute query and update cache
    return this.executeWithErrorHandling(async () => {
      const result = await queryFn()

      // Update cache with result
      this.context.queryClient.setQueryData(cacheKey, result, {
        updatedAt: Date.now(),
      })

      return result
    })
  }
}

/**
 * Base class for command use cases (write operations)
 * Includes transaction support and cache invalidation
 */
export abstract class CommandUseCaseBase<TInput = unknown, TOutput = unknown> extends UseCaseBase<
  TInput,
  TOutput
> {
  /**
   * Get cache keys that should be invalidated after this command
   */
  abstract getInvalidationKeys(input: TInput, result?: unknown): unknown[][]

  /**
   * Execute command with automatic cache invalidation
   */
  protected async executeCommand<T>(
    input: TInput,
    commandFn: () => Promise<T>,
    options?: {
      skipInvalidation?: boolean
      optimisticUpdate?: (old: unknown) => unknown
      optimisticKeys?: unknown[][]
    }
  ): Promise<ServiceResponse<T>> {
    // Apply optimistic updates if provided
    if (options?.optimisticUpdate && options?.optimisticKeys) {
      options.optimisticKeys.forEach((key) => {
        this.updateCacheData(key, options.optimisticUpdate!)
      })
    }

    // Execute the command
    const response = await this.executeInTransaction(commandFn)

    // If successful, invalidate cache
    if (response.success && !options?.skipInvalidation) {
      const invalidationKeys = this.getInvalidationKeys(input, response.data)
      await this.invalidateCache(invalidationKeys)
    }

    // If failed and we had optimistic updates, revert them
    if (!response.success && options?.optimisticKeys) {
      await this.refetchCache(options.optimisticKeys)
    }

    return response
  }
}

/**
 * Factory for creating use case contexts
 */
export class UseCaseContextFactory {
  static create(
    queryClient: QueryClient,
    options?: {
      userId?: string
      transactionId?: string
      metadata?: Record<string, unknown>
    }
  ): UseCaseContext {
    return {
      queryClient,
      userId: options?.userId,
      transactionId: options?.transactionId || crypto.randomUUID(),
      metadata: options?.metadata,
    }
  }
}
