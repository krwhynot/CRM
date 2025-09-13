/**
 * Generic Entity Hooks
 *
 * Unified, type-safe entity management hooks for CRM architecture.
 * These hooks provide consistent patterns for data fetching, mutations,
 * selections, filtering, and form handling across all entity types.
 */

// Core types and interfaces
export type * from './types'

// Core hooks
export { useEntityList, useVirtualizedEntityList, createEntityListConfig } from './useEntityList'
export {
  useEntitySelection,
  useAdvancedEntitySelection,
  useBulkSelectionWithConfirmation,
} from './useEntitySelection'
export {
  useEntityFilters,
  useAdvancedEntityFilters,
  useFacetedEntityFilters,
} from './useEntityFilters'
export { useEntityForm, useMultiStepEntityForm } from './useEntityForm'
export { useEntityActions, createEntityActionsConfig } from './useEntityActions'

// Re-export commonly used types for convenience
export type {
  BaseEntity,
  BaseInsert,
  BaseUpdate,
  BaseFilters,
  SelectionState,
  SelectionActions,
  FormState,
  FormActions,
  CrudOperations,
  UseEntityListReturn,
  UseEntityActionsReturn,
  UseEntityFormReturn,
  UseEntityFiltersReturn,
  QueryKeyFactory,
} from './types'
