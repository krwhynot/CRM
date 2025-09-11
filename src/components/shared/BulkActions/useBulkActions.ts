import { useState, useCallback } from 'react'
import { toast } from '@/lib/toast-styles'

export interface BulkActionResult<T> {
  item: T
  success: boolean
  error?: string
}

export interface BulkActionProgress {
  total: number
  completed: number
  successful: number
  failed: number
  isRunning: boolean
}

/**
 * Generic bulk actions hook that provides state management for bulk operations
 * Extracted from all table components to centralize bulk operation logic
 */
export interface UseBulkActionsOptions<T> {
  /** Function to get item ID for progress tracking */
  getItemId: (item: T) => string
  /** Function to get item display name for user feedback */
  getItemName: (item: T) => string
  /** Entity type name for user messages (e.g., "organization", "contact") */
  entityType: string
  /** Plural entity type name for user messages (e.g., "organizations", "contacts") */
  entityTypePlural: string
}

export interface UseBulkActionsReturn<T> {
  /** Current progress of bulk operation */
  progress: BulkActionProgress
  /** Execute bulk delete operation */
  executeBulkDelete: (
    items: T[],
    deleteFunction: (id: string) => Promise<void>
  ) => Promise<BulkActionResult<T>[]>
  /** Execute generic bulk operation */
  executeBulkOperation: (
    items: T[],
    operation: (item: T) => Promise<void>,
    operationName: string
  ) => Promise<BulkActionResult<T>[]>
  /** Reset progress state */
  resetProgress: () => void
}

export function useBulkActions<T>({
  getItemId,
  getItemName,
  entityType,
  entityTypePlural,
}: UseBulkActionsOptions<T>): UseBulkActionsReturn<T> {
  const [progress, setProgress] = useState<BulkActionProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false,
  })

  const resetProgress = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: false,
    })
  }, [])

  const executeBulkDelete = useCallback(async (
    items: T[],
    deleteFunction: (id: string) => Promise<void>
  ): Promise<BulkActionResult<T>[]> => {
    if (items.length === 0) return []

    setProgress({
      total: items.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true,
    })

    const results: BulkActionResult<T>[] = []
    let successful = 0
    let failed = 0

    try {
      // Process deletions sequentially for maximum safety
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemId = getItemId(item)
        
        try {
          await deleteFunction(itemId)
          results.push({ item, success: true })
          successful++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          results.push({ item, success: false, error: errorMessage })
          failed++
        }

        // Update progress
        setProgress(prev => ({
          ...prev,
          completed: i + 1,
          successful,
          failed,
        }))
      }

      // Show results to user
      if (successful > 0 && failed === 0) {
        toast.success(
          `Successfully archived ${successful} ${successful === 1 ? entityType : entityTypePlural}`
        )
      } else if (successful > 0 && failed > 0) {
        toast.warning(`Archived ${successful} ${entityTypePlural}, but ${failed} failed`)
      } else if (failed > 0) {
        toast.error(`Failed to archive ${failed} ${failed === 1 ? entityType : entityTypePlural}`)
      }

    } catch (error) {
      toast.error(`An unexpected error occurred during bulk deletion`)
    } finally {
      setProgress(prev => ({ ...prev, isRunning: false }))
    }

    return results
  }, [getItemId, entityType, entityTypePlural])

  const executeBulkOperation = useCallback(async (
    items: T[],
    operation: (item: T) => Promise<void>,
    operationName: string
  ): Promise<BulkActionResult<T>[]> => {
    if (items.length === 0) return []

    setProgress({
      total: items.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true,
    })

    const results: BulkActionResult<T>[] = []
    let successful = 0
    let failed = 0

    try {
      // Process operations sequentially for safety
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        try {
          await operation(item)
          results.push({ item, success: true })
          successful++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          results.push({ item, success: false, error: errorMessage })
          failed++
        }

        // Update progress
        setProgress(prev => ({
          ...prev,
          completed: i + 1,
          successful,
          failed,
        }))
      }

      // Show results to user
      if (successful > 0 && failed === 0) {
        toast.success(
          `Successfully ${operationName} ${successful} ${successful === 1 ? entityType : entityTypePlural}`
        )
      } else if (successful > 0 && failed > 0) {
        toast.warning(`${operationName} ${successful} ${entityTypePlural}, but ${failed} failed`)
      } else if (failed > 0) {
        toast.error(`Failed to ${operationName} ${failed} ${failed === 1 ? entityType : entityTypePlural}`)
      }

    } catch (error) {
      toast.error(`An unexpected error occurred during bulk ${operationName}`)
    } finally {
      setProgress(prev => ({ ...prev, isRunning: false }))
    }

    return results
  }, [entityType, entityTypePlural])

  return {
    progress,
    executeBulkDelete,
    executeBulkOperation,
    resetProgress,
  }
}