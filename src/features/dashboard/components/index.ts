/**
 * Dashboard Components Index
 * 
 * Centralized exports for all dashboard-related components
 * to maintain clean import statements and better organization.
 */

export { PrincipalCard } from './PrincipalCard'
export { PrincipalCardsGrid } from './PrincipalCardsGrid'
export { PrincipalsDashboard } from './PrincipalsDashboard'
export { ActivityFeed } from './ActivityFeed'

// Dashboard-specific components (moved from shared components)
export { ChartCard } from './ChartCard'
export { QuickActions } from './QuickActions'
export { StatsCards } from './StatsCards'

// Chart Components (organized in subdirectory)
export * from './charts'

// Activity Components (organized in subdirectory)
export * from './activity'

// Export types for TypeScript usage
export type {
  DashboardPriority,
  PrincipalMetrics,
  PrincipalWithMetrics,
  DashboardStats,
  PrincipalCardProps,
  PrincipalCardsGridProps,
  PrincipalsDashboardProps,
  PriorityConfig,
  LoadingState,
  ErrorState,
  DashboardFilters,
  PrincipalSortOption,
  DashboardView,
  ExportFormat,
  TimeRange,
  PredefinedTimeRange
} from './types'

// Export ActivityFeed types
export type { ActivityFeedProps } from './ActivityFeed'