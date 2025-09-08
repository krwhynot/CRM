// Dashboard Feature - Main Exports
export { CRMDashboard } from './components/CRMDashboard'
export { DashboardFilters } from './components/DashboardFilters'

// Universal Filters Integration
export {
  UniversalFilters,
  CompactUniversalFilters,
  TimeRangeFilter,
  FocusFilter,
  QuickViewFilter,
  useUniversalFilters,
  useFilterChangeHandler,
  useActiveFilterCount,
  DEFAULT_UNIVERSAL_FILTERS
} from '@/components/filters'
export type {
  UniversalFilterState,
  UniversalFiltersProps,
  TimeRangeType,
  FocusType,
  QuickViewType,
  UseUniversalFiltersReturn
} from '@/components/filters'
// Legacy DualLineCharts removed - replaced by ChartsGrid with chart visibility controls
export { PrincipalCard } from './components/PrincipalCard'
export { PrincipalCardsGrid } from './components/PrincipalCardsGrid'
export { EnhancedActivityFeed } from './components/EnhancedActivityFeed'
export { SimpleActivityFeed } from './components/SimpleActivityFeed'
export { OpportunityKanban } from './components/OpportunityKanban'
export { DashboardSkeleton } from './components/DashboardSkeleton'
export { EmptyState } from './components/EmptyState'

// Hooks
export { useDashboardData } from './hooks/useDashboardData'
export { useDashboardFilters } from './hooks/useDashboardFilters'
export { useDashboardFiltersData } from './hooks/useDashboardFiltersData'
export { useDashboardFiltersState } from './hooks/useDashboardFiltersState'
export { useDashboardFiltersStyle } from './hooks/useDashboardFiltersStyle'
export { useDashboardLoading } from './hooks/useDashboardLoading'
export { useDashboardMetrics } from './hooks/useDashboardMetrics'
export { useChartData } from './hooks/useChartData'
export { useChartStyling } from './hooks/useChartStyling'
export { usePrincipalMetrics } from './hooks/usePrincipalMetrics'
export { usePrincipalPriority } from './hooks/usePrincipalPriority'
export { usePrincipalSelection } from './hooks/usePrincipalSelection'
export { useActivityFormatting } from './hooks/useActivityFormatting'
export { useActivityFiltering } from './hooks/useActivityFiltering'
export { useActivityRealTime } from './hooks/useActivityRealTime'
export { useEnhancedActivityData } from './hooks/useEnhancedActivityData'
export { useMultiPrincipalFormState } from './hooks/useMultiPrincipalFormState'
