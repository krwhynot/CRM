/**
 * Dashboard Components Index
 *
 * Centralized exports for all dashboard-related components
 * to maintain clean import statements and better organization.
 */

// Existing dashboard components
export { PrincipalCard } from './PrincipalCard'
export { PrincipalCardsGrid } from './PrincipalCardsGrid'
export { QuickActions } from './QuickActions'
export { StatsCards } from './StatsCards'

// Note: ChartCard moved to ./charts/ subdirectory

// Chart Components (organized in subdirectory)
export * from './charts'

// Export types for TypeScript usage  
export type {
  DashboardPriority,
  PrincipalMetrics,
  PrincipalWithMetrics,
  DashboardStats,
  PrincipalCardProps,
  PrincipalCardsGridProps,
  PriorityConfig,
  LoadingState,
  ErrorState,
  DashboardFilters,
  PrincipalSortOption,
  DashboardView,
  ExportFormat,
  TimeRange,
  PredefinedTimeRange,
} from './types'
