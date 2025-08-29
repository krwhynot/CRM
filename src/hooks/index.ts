// Global Hooks - Main Exports
// These hooks are truly generic and reusable across all features

// Form & Data Hooks
export { useCoreFormSetup } from './useCoreFormSetup'
export { useEntitySelectSearch } from './useEntitySelectSearch'
export { useEntitySelectState } from './useEntitySelectState'
export { useFormLayout } from './useFormLayout'
export { useProgressiveDetails } from './useProgressiveDetails'

// File & Upload Hooks
export { useFileUpload } from './useFileUpload'

// UI & Navigation Hooks
export { useMobile } from './use-mobile'
export { useSidebar } from './useSidebar'
export { useNavigationCounts } from './useNavigationCounts'

// Utility Hooks
// useDebounce moved to @/lib/performance-optimizations

// Dashboard & Health Hooks
export { useHealthDashboardState } from './useHealthDashboardState'