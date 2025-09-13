/**
 * Generic Entity Actions Hook
 *
 * Provides comprehensive CRUD operations for any entity type with optimistic updates,
 * bulk operations, and error handling.
 */

import { useCallback, useState } from 'react'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { handleSingleRecord } from '@/lib/database-utils'
import { validateAuthentication } from '@/lib/error-utils'
import { useEntitySelection } from './useEntitySelection'
import type {
  BaseEntity,
  BaseInsert,
  BaseUpdate,
  UseEntityActionsReturn,
  CrudOperations,
  EntityMutationOptions,
  QueryKeyFactory,
} from './types'

export interface EntityActionsConfig<
  T extends BaseEntity,
  TInsert = BaseInsert<T>,
  TUpdate = BaseUpdate<T>,
> {
  tableName: string
  queryKeyFactory: QueryKeyFactory<string>
  entityName: string // For user-friendly messages (e.g., "contact", "organization")
  crudOperations?: Partial<CrudOperations<T, TInsert, TUpdate>>
  softDelete?: boolean
  optimisticUpdates?: boolean
  bulkOperations?: boolean
  onSuccess?: {
    create?: (entity: T) => void
    update?: (entity: T) => void
    delete?: (id: string) => void
  }
  onError?: {
    create?: (error: Error, data: TInsert) => void
    update?: (error: Error, id: string, data: TUpdate) => void
    delete?: (error: Error, id: string) => void
  }
}

/**
 * Generic entity actions hook providing CRUD operations with selection management
 */
export function useEntityActions<
  T extends BaseEntity,
  TInsert = BaseInsert<T>,
  TUpdate = BaseUpdate<T>,
>(
  entities: T[],
  config: EntityActionsConfig<T, TInsert, TUpdate>
): UseEntityActionsReturn<T, TInsert, TUpdate> {
  const queryClient = useQueryClient()
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  // Selection management
  const selection = useEntitySelection(entities, {
    onSelectionChange: (selectedIds, selectedEntities) => {
      // Can add additional logic when selection changes
    },
  })

  // Create entity mutation
  const createMutation = useMutation({
    mutationFn: async (data: TInsert): Promise<T> => {
      if (config.crudOperations?.create) {
        return config.crudOperations.create(data)
      }

      // Default create implementation
      const { user } = await validateAuthentication(supabase)
      if (!user) throw new Error('Authentication required')

      const createData = {
        ...data,
        created_by: user.id,
        updated_by: user.id,
      }

      const result = await supabase.from(config.tableName).insert(createData).select().single()

      return handleSingleRecord(result, `create ${config.entityName}`) as T
    },
    onSuccess: (newEntity) => {
      // Invalidate and update queries
      queryClient.invalidateQueries({ queryKey: config.queryKeyFactory.lists() })

      // Add to cache optimistically
      if (config.optimisticUpdates) {
        queryClient.setQueryData<T[]>(config.queryKeyFactory.list(), (old) => {
          return old ? [newEntity, ...old] : [newEntity]
        })
      }

      config.onSuccess?.create?.(newEntity)

      toast({
        title: `${config.entityName} Created`,
        description: `${config.entityName} has been created successfully.`,
      })
    },
    onError: (error, data) => {
      config.onError?.create?.(error as Error, data)
      toast({
        title: 'Creation Failed',
        description: `Failed to create ${config.entityName}. Please try again.`,
        variant: 'destructive',
      })
    },
  })

  // Update entity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TUpdate }): Promise<T> => {
      if (config.crudOperations?.update) {
        return config.crudOperations.update(id, updates)
      }

      // Default update implementation
      const { user } = await validateAuthentication(supabase)
      if (!user) throw new Error('Authentication required')

      const updateData = {
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }

      const result = await supabase
        .from(config.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      return handleSingleRecord(result, `update ${config.entityName}`) as T
    },
    onSuccess: (updatedEntity) => {
      // Update cache optimistically
      if (config.optimisticUpdates) {
        queryClient.setQueryData<T[]>(config.queryKeyFactory.list(), (old) => {
          return old?.map((item) => (item.id === updatedEntity.id ? updatedEntity : item)) || []
        })
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: config.queryKeyFactory.lists() })
      queryClient.setQueryData(config.queryKeyFactory.detail(updatedEntity.id), updatedEntity)

      config.onSuccess?.update?.(updatedEntity)

      toast({
        title: `${config.entityName} Updated`,
        description: `${config.entityName} has been updated successfully.`,
      })
    },
    onError: (error, variables) => {
      config.onError?.update?.(error as Error, variables.id, variables.updates)
      toast({
        title: 'Update Failed',
        description: `Failed to update ${config.entityName}. Please try again.`,
        variant: 'destructive',
      })
    },
  })

  // Delete entity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (config.crudOperations?.delete) {
        return config.crudOperations.delete(id)
      }

      // Default delete implementation
      if (config.softDelete) {
        const { user } = await validateAuthentication(supabase)
        if (!user) throw new Error('Authentication required')

        await supabase
          .from(config.tableName)
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
      } else {
        await supabase.from(config.tableName).delete().eq('id', id)
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache optimistically
      if (config.optimisticUpdates) {
        queryClient.setQueryData<T[]>(config.queryKeyFactory.list(), (old) => {
          return old?.filter((item) => item.id !== id) || []
        })
      }

      // Invalidate and remove from cache
      queryClient.invalidateQueries({ queryKey: config.queryKeyFactory.lists() })
      queryClient.removeQueries({ queryKey: config.queryKeyFactory.detail(id) })

      config.onSuccess?.delete?.(id)

      toast({
        title: `${config.entityName} Deleted`,
        description: `${config.entityName} has been deleted successfully.`,
      })
    },
    onError: (error, id) => {
      config.onError?.delete?.(error as Error, id)
      toast({
        title: 'Delete Failed',
        description: `Failed to delete ${config.entityName}. Please try again.`,
        variant: 'destructive',
      })
    },
  })

  // Restore entity mutation (for soft delete)
  const restoreMutation = useMutation({
    mutationFn: async (id: string): Promise<T> => {
      if (config.crudOperations?.restore) {
        return config.crudOperations.restore(id)
      }

      // Default restore implementation
      const { user } = await validateAuthentication(supabase)
      if (!user) throw new Error('Authentication required')

      const result = await supabase
        .from(config.tableName)
        .update({
          deleted_at: null,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      return handleSingleRecord(result, `restore ${config.entityName}`) as T
    },
    onSuccess: (restoredEntity) => {
      queryClient.invalidateQueries({ queryKey: config.queryKeyFactory.lists() })
      queryClient.setQueryData(config.queryKeyFactory.detail(restoredEntity.id), restoredEntity)

      toast({
        title: `${config.entityName} Restored`,
        description: `${config.entityName} has been restored successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Restore Failed',
        description: `Failed to restore ${config.entityName}. Please try again.`,
        variant: 'destructive',
      })
    },
  })

  // Individual action handlers
  const create = useCallback(
    async (data: TInsert): Promise<T> => {
      return createMutation.mutateAsync(data)
    },
    [createMutation]
  )

  const update = useCallback(
    async (id: string, updates: TUpdate): Promise<T> => {
      return updateMutation.mutateAsync({ id, updates })
    },
    [updateMutation]
  )

  const deleteEntity = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id)
    },
    [deleteMutation]
  )

  const restore = useCallback(
    async (id: string): Promise<T> => {
      return restoreMutation.mutateAsync(id)
    },
    [restoreMutation]
  )

  // Bulk delete operation
  const bulkDelete = useCallback(
    async (entitiesToDelete: T[]): Promise<void> => {
      if (!config.bulkOperations) {
        throw new Error('Bulk operations are not enabled for this entity')
      }

      setIsBulkProcessing(true)
      const results: Array<{ id: string; success: boolean; error?: string }> = []

      try {
        // Process deletions sequentially for data integrity
        for (const entity of entitiesToDelete) {
          try {
            await deleteEntity(entity.id)
            results.push({ id: entity.id, success: true })
          } catch (error) {
            results.push({
              id: entity.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }

        // Show results
        const successCount = results.filter((r) => r.success).length
        const errorCount = results.filter((r) => !r.success).length

        if (successCount > 0 && errorCount === 0) {
          toast({
            title: 'Bulk Delete Successful',
            description: `Successfully deleted ${successCount} ${config.entityName}(s).`,
          })
        } else if (successCount > 0 && errorCount > 0) {
          toast({
            title: 'Partial Success',
            description: `Deleted ${successCount} ${config.entityName}(s), but ${errorCount} failed.`,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Bulk Delete Failed',
            description: `Failed to delete ${errorCount} ${config.entityName}(s).`,
            variant: 'destructive',
          })
        }

        // Clear selection if any succeeded
        if (successCount > 0) {
          selection.clearSelection()
        }
      } finally {
        setIsBulkProcessing(false)
      }
    },
    [config.bulkOperations, config.entityName, deleteEntity, selection]
  )

  // Bulk update operation
  const bulkUpdate = useCallback(
    async (entitiesToUpdate: T[], updates: TUpdate): Promise<T[]> => {
      if (!config.bulkOperations) {
        throw new Error('Bulk operations are not enabled for this entity')
      }

      setIsBulkProcessing(true)
      const updatedEntities: T[] = []
      const results: Array<{ id: string; success: boolean; error?: string }> = []

      try {
        // Process updates sequentially for data integrity
        for (const entity of entitiesToUpdate) {
          try {
            const updated = await update(entity.id, updates)
            updatedEntities.push(updated)
            results.push({ id: entity.id, success: true })
          } catch (error) {
            results.push({
              id: entity.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }

        // Show results
        const successCount = results.filter((r) => r.success).length
        const errorCount = results.filter((r) => !r.success).length

        if (successCount > 0) {
          toast({
            title: 'Bulk Update Successful',
            description: `Successfully updated ${successCount} ${config.entityName}(s).`,
          })
          selection.clearSelection()
        }

        if (errorCount > 0) {
          toast({
            title: 'Some Updates Failed',
            description: `${errorCount} ${config.entityName}(s) failed to update.`,
            variant: 'destructive',
          })
        }

        return updatedEntities
      } finally {
        setIsBulkProcessing(false)
      }
    },
    [config.bulkOperations, config.entityName, update, selection]
  )

  return {
    // Selection state and actions
    selection,

    // Individual actions
    create,
    update,
    delete: deleteEntity,
    restore: config.softDelete ? restore : undefined,

    // Bulk actions
    bulkDelete,
    bulkUpdate,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkProcessing,
  }
}

/**
 * Helper function to create entity actions configuration
 */
export function createEntityActionsConfig<
  T extends BaseEntity,
  TInsert = BaseInsert<T>,
  TUpdate = BaseUpdate<T>,
>(
  tableName: string,
  entityName: string,
  queryKeyFactory: QueryKeyFactory<string>,
  options?: Partial<EntityActionsConfig<T, TInsert, TUpdate>>
): EntityActionsConfig<T, TInsert, TUpdate> {
  return {
    tableName,
    entityName,
    queryKeyFactory,
    softDelete: true,
    optimisticUpdates: true,
    bulkOperations: true,
    ...options,
  }
}
