/**
 * Generic Entity Hook Types
 *
 * Provides base types and interfaces for generic entity management hooks.
 * These types enable type-safe, reusable hooks that work with any CRM entity.
 */

import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import type { FormEvent } from 'react'

// Base entity interface that all entities must extend
export interface BaseEntity {
  id: string
  created_at?: string | Date
  updated_at?: string | Date
  deleted_at?: string | null
  created_by?: string
  updated_by?: string
}

// Base insert/update types
export type BaseInsert<T extends BaseEntity> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
>
export type BaseUpdate<T extends BaseEntity> = Partial<Omit<T, 'id' | 'created_at' | 'created_by'>>

// Generic filters interface
export interface BaseFilters {
  search?: string
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// Generic selection state interface
export interface SelectionState<T extends BaseEntity> {
  selectedItems: Set<string>
  selectedEntities: T[]
  isAllSelected: boolean
  hasSelection: boolean
  selectionCount: number
}

// Generic selection actions interface
export interface SelectionActions<T extends BaseEntity> {
  handleSelectAll: (checked: boolean, entities: T[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
  selectMultiple: (ids: string[]) => void
  deselectMultiple: (ids: string[]) => void
  toggleSelection: (id: string) => void
}

// Generic form state interface
export interface FormState<T extends BaseEntity> {
  data: Partial<T>
  originalData?: T
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
  touchedFields: Set<string>
}

// Generic form actions interface
export interface FormActions<T extends BaseEntity> {
  updateField: (field: keyof T, value: any) => void
  updateFields: (fields: Partial<T>) => void
  resetForm: () => void
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
  validateForm: () => boolean
  markFieldTouched: (field: keyof T) => void
}

// Generic CRUD operations interface
export interface CrudOperations<
  T extends BaseEntity,
  TInsert = BaseInsert<T>,
  TUpdate = BaseUpdate<T>,
> {
  create: (data: TInsert) => Promise<T>
  update: (id: string, data: TUpdate) => Promise<T>
  delete: (id: string) => Promise<void>
  restore?: (id: string) => Promise<T>
  bulkCreate?: (data: TInsert[]) => Promise<T[]>
  bulkUpdate?: (updates: Array<{ id: string; data: TUpdate }>) => Promise<T[]>
  bulkDelete?: (ids: string[]) => Promise<void>
}

// Generic query options
export interface EntityQueryOptions<T extends BaseEntity>
  extends Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'> {
  filters?: BaseFilters
  select?: string
  includeDeleted?: boolean
}

// Generic mutation options
export interface EntityMutationOptions<TData, TVariables, TError = Error>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  optimisticUpdate?: boolean
  invalidateQueries?: QueryKey[]
}

// Generic list hook return type
export interface UseEntityListReturn<
  T extends BaseEntity,
  TFilters extends BaseFilters = BaseFilters,
> {
  data: T[]
  filteredData: T[]
  filters: TFilters
  setFilters: (filters: TFilters | ((prev: TFilters) => TFilters)) => void
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<any>
  hasNextPage?: boolean
  fetchNextPage?: () => void
  isFetchingNextPage?: boolean
}

// Generic actions hook return type
export interface UseEntityActionsReturn<
  T extends BaseEntity,
  TInsert = BaseInsert<T>,
  TUpdate = BaseUpdate<T>,
> {
  // Selection state
  selection: SelectionState<T> & SelectionActions<T>

  // Individual actions
  create: (data: TInsert) => Promise<T>
  update: (id: string, data: TUpdate) => Promise<T>
  delete: (id: string) => Promise<void>
  restore?: (id: string) => Promise<T>

  // Bulk actions
  bulkDelete: (entities: T[]) => Promise<void>
  bulkUpdate: (entities: T[], updates: TUpdate) => Promise<T[]>

  // Loading states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isBulkProcessing: boolean
}

// Generic form hook return type
export interface UseEntityFormReturn<T extends BaseEntity, TInsert = BaseInsert<T>> {
  formState: FormState<T>
  formActions: FormActions<T>
  handleSubmit: (onSubmit: (data: TInsert) => Promise<void>) => (e?: FormEvent) => Promise<void>
  reset: () => void
  isSubmitting: boolean
}

// Generic filters hook return type
export interface UseEntityFiltersReturn<
  TFilters extends BaseFilters,
  T extends BaseEntity = BaseEntity,
> {
  filters: TFilters
  setFilters: (filters: TFilters | ((prev: TFilters) => TFilters)) => void
  filteredData: T[]
  applyFilters: (data: T[]) => T[]
  clearFilters: () => void
  hasActiveFilters: boolean
}

// Query key factory type
export type QueryKeyFactory<T extends string> = {
  all: readonly [T]
  lists: () => readonly [T, 'list']
  list: (filters?: BaseFilters) => readonly [T, 'list', { filters?: BaseFilters }]
  details: () => readonly [T, 'detail']
  detail: (id: string) => readonly [T, 'detail', string]
}
