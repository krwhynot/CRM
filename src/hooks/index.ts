// Global Hooks - Main Exports
// These hooks are truly generic and reusable across all features

// Form & Data Hooks
export { useCoreFormSetup } from './useCoreFormSetup'
export { useEntitySelectSearch } from './useEntitySelectSearch'
export { useEntitySelectState } from './useEntitySelectState'
export { useFormLayout } from './useFormLayout'
export { useProgressiveDetails } from './useProgressiveDetails'

// Generic Entity Hooks
export { useEntitySelection, type UseEntitySelectionReturn } from './useEntitySelection'
export { useEntityPageState, type UseEntityPageStateReturn } from './useEntityPageState'

// Data Table Hooks
export {
  useStandardDataTable,
  type StandardDataTableConfig,
  type StandardDataTableReturn,
} from './useStandardDataTable'

export {
  useEntityDataState,
  type EntityDataStateConfig,
  type EntityDataStateReturn,
  type EntityDataState,
  type QueryDataState,
  type CompatibleQueryResult,
  createEntityDataState,
  isCompatibleQueryResult,
} from './useEntityDataState'

// File & Upload Hooks
export { useFileUpload } from './useFileUpload'

// UI & Navigation Hooks
export { useIsMobile } from './use-mobile'
export { useSidebar } from './useSidebar'
export { useNavigationCounts } from './useNavigationCounts'

// Utility Hooks
// useDebounce moved to @/lib/performance-optimizations

// Dashboard & Health Hooks
export { useHealthDashboardState } from './useHealthDashboardState'

// Filter Layout Hooks
export {
  useFilterLayout,
  useFilterLayoutExtended,
  useFilterTrigger,
  useFilterContainer,
  useFilterModeSelector,
  type FilterLayoutContextValue,
  type FilterLayoutMode,
  type FilterLayoutPreference,
  type FilterLayoutState,
  type FilterLayoutActions,
  FilterLayoutUtils,
} from './useFilterLayout'
