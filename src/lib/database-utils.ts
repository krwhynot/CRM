/**
 * Database Utilities
 *
 * Production-ready utilities for handling Supabase database responses,
 * null safety, and consistent error handling across the CRM system.
 */

import type { PostgrestError } from '@supabase/supabase-js'
import { debugWarn } from '@/utils/debug'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Standard Supabase result type
 */
export interface DatabaseResult<T> {
  data: T | null
  error: PostgrestError | null
}

/**
 * Database operation error with enhanced context
 */
export class DatabaseError extends Error {
  public readonly operation: string
  public readonly originalError: PostgrestError | null
  public readonly code?: string

  constructor(operation: string, originalError: PostgrestError | null, customMessage?: string) {
    const message =
      customMessage ||
      (originalError
        ? `Database error in ${operation}: ${originalError.message}`
        : `No data returned from ${operation}`)

    super(message)
    this.name = 'DatabaseError'
    this.operation = operation
    this.originalError = originalError
    this.code = originalError?.code
  }
}

// ============================================================================
// CORE UTILITIES
// ============================================================================

/**
 * Check database result for errors and null data
 * Enhanced version of the test utility for production use
 */
export function checkResult<T>(
  result: DatabaseResult<T>,
  operation: string,
  options: {
    allowNull?: boolean
    customErrorMessage?: string
  } = {}
): T {
  const { allowNull = false, customErrorMessage } = options

  // Check for database errors first
  if (result.error) {
    throw new DatabaseError(operation, result.error, customErrorMessage)
  }

  // Check for null data (unless explicitly allowed)
  if (!allowNull && result.data === null) {
    throw new DatabaseError(
      operation,
      null,
      customErrorMessage || `No data returned from ${operation}`
    )
  }

  return result.data as T
}

/**
 * Safe data access with null checking
 * Prevents direct access to potentially null result.data
 */
export function safeDataAccess<T, R>(
  result: DatabaseResult<T>,
  accessor: (data: T) => R,
  operation: string,
  fallback?: R
): R {
  if (result.error) {
    throw new DatabaseError(operation, result.error)
  }

  if (result.data === null) {
    if (fallback !== undefined) {
      return fallback
    }
    throw new DatabaseError(operation, null, `Cannot access data: ${operation} returned null`)
  }

  return accessor(result.data)
}

/**
 * Type guard to check if result has valid data
 */
export function hasValidData<T>(
  result: DatabaseResult<T>
): result is DatabaseResult<T> & { data: T } {
  return result.error === null && result.data !== null
}

/**
 * Safe array access with null/undefined protection
 */
export function safeArrayAccess<T>(
  data: T[] | null | undefined,
  operation: string = 'array access'
): T[] {
  if (data === null || data === undefined) {
    debugWarn(`Safe array access: ${operation} returned null/undefined, returning empty array`)
    return []
  }

  if (!Array.isArray(data)) {
    debugWarn(`Safe array access: ${operation} did not return an array, returning empty array`)
    return []
  }

  return data
}

/**
 * Safe find operation with null protection
 */
export function safeFindInArray<T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean,
  operation: string = 'find operation'
): T | undefined {
  const safeArray = safeArrayAccess(data, operation)
  return safeArray.find(predicate)
}

/**
 * Safe filter operation with null protection
 */
export function safeFilterArray<T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean,
  operation: string = 'filter operation'
): T[] {
  const safeArray = safeArrayAccess(data, operation)
  return safeArray.filter(predicate)
}

// ============================================================================
// SUPABASE-SPECIFIC UTILITIES
// ============================================================================

/**
 * Handle single record queries with null checks
 */
export function handleSingleRecord<T>(
  result: DatabaseResult<T>,
  operation: string,
  options: {
    allowNotFound?: boolean
    notFoundMessage?: string
  } = {}
): T | null {
  const { allowNotFound = false, notFoundMessage } = options

  if (result.error) {
    // Handle "no rows returned" as not found rather than error
    if (result.error.code === 'PGRST116' && allowNotFound) {
      return null
    }
    throw new DatabaseError(operation, result.error)
  }

  if (result.data === null && !allowNotFound) {
    const message = notFoundMessage || `Record not found: ${operation}`
    throw new DatabaseError(operation, null, message)
  }

  return result.data
}

/**
 * Handle array queries with empty result protection
 */
export function handleArrayResult<T>(
  result: DatabaseResult<T[]>,
  operation: string,
  options: {
    allowEmpty?: boolean
    emptyMessage?: string
  } = {}
): T[] {
  const { allowEmpty = true, emptyMessage } = options

  if (result.error) {
    throw new DatabaseError(operation, result.error)
  }

  const data = safeArrayAccess(result.data, operation)

  if (!allowEmpty && data.length === 0) {
    const message = emptyMessage || `No records found: ${operation}`
    throw new DatabaseError(operation, null, message)
  }

  return data
}

/**
 * Validate and transform data with error context
 */
export function validateAndTransform<T, R>(
  result: DatabaseResult<T>,
  transformer: (data: T) => R,
  operation: string
): R {
  const validData = checkResult(result, operation)

  try {
    return transformer(validData)
  } catch (error) {
    const message = `Data transformation failed for ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`
    throw new DatabaseError(operation, null, message)
  }
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Wrap async database operations with consistent error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<DatabaseResult<T>>,
  operationName: string,
  options: { retries?: number } = {}
): Promise<T> {
  const { retries = 0 } = options
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await operation()
      return checkResult(result, operationName)
    } catch (error) {
      lastError = error as Error

      // Don't retry certain types of errors
      if (
        error instanceof DatabaseError &&
        error.code &&
        ['23505', '23503', '42501'].includes(error.code)
      ) {
        throw error
      }

      if (attempt < retries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)))
        continue
      }
    }
  }

  throw lastError || new DatabaseError(operationName, null, 'Operation failed after retries')
}

// ============================================================================
// LOGGING AND DEBUGGING
// ============================================================================

/**
 * Log database operation results for debugging
 */
export function logDatabaseOperation<T>(
  result: DatabaseResult<T>,
  operation: string,
  level: 'info' | 'warn' | 'error' = 'info'
): DatabaseResult<T> {
  if (isDevelopment) {
    const logData = {
      operation,
      hasError: !!result.error,
      hasData: !!result.data,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      dataType: result.data ? typeof result.data : null,
      isArray: Array.isArray(result.data),
      arrayLength: Array.isArray(result.data) ? result.data.length : null,
    }

    // eslint-disable-next-line no-console
    console[level](`[DB] ${operation}:`, logData)
  }

  return result
}

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Extract data type from DatabaseResult
 */
export type ExtractData<T> = T extends DatabaseResult<infer U> ? U : never

/**
 * Make database result data non-nullable
 */
export type RequiredData<T> =
  T extends DatabaseResult<infer U> ? DatabaseResult<NonNullable<U>> : never
