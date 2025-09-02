/**
 * Dashboard Component Types
 *
 * Type definitions for dashboard-specific components and interfaces
 * that extend the base entity types with dashboard-specific functionality.
 */

import type { Organization } from '@/types/entities'

/**
 * Priority levels used in the dashboard component
 */
export type DashboardPriority = 'A+' | 'A' | 'B' | 'C' | 'D'

/**
 * Comprehensive metrics calculated for a principal organization
 */
export interface PrincipalMetrics {
  /** Total number of opportunities for this principal */
  opportunityCount: number

  /** Total number of activities related to this principal */
  activityCount: number

  /** Date of the most recent interaction, null if none */
  lastActivity: Date | null

  /** Total estimated value of all opportunities */
  totalValue: number

  /** Number of active (not closed) opportunities */
  activeOpportunities: number

  /** Number of closed won opportunities */
  closedWonOpportunities?: number

  /** Win rate percentage */
  winRate?: number

  /** Average opportunity value */
  averageOpportunityValue?: number
}

/**
 * Enhanced principal organization with calculated metrics
 */
export interface PrincipalWithMetrics extends Organization {
  /** Calculated metrics for this principal */
  metrics: PrincipalMetrics

  /** Dashboard priority derived from organization size */
  dashboardPriority: DashboardPriority
}

/**
 * Dashboard-wide statistics and KPIs
 */
export interface DashboardStats {
  /** Total number of principal organizations */
  totalPrincipals: number

  /** Number of active principal organizations */
  activePrincipals: number

  /** Total number of opportunities across all principals */
  totalOpportunities: number

  /** Total number of activities across all principals */
  totalActivities: number

  /** Total estimated value across all opportunities */
  totalEstimatedValue: number

  /** Number of active opportunities */
  activeOpportunities?: number

  /** Total closed won value */
  totalClosedWonValue?: number

  /** Overall win rate percentage */
  overallWinRate?: number
}

/**
 * Props for PrincipalCard component
 */
export interface PrincipalCardProps {
  /** The principal organization to display */
  principal: Organization

  /** Optional CSS classes for styling */
  className?: string

  /** Optional click handler for navigation */
  onClick?: (principal: Organization) => void

  /** Whether to show detailed metrics (default: true) */
  showDetailedMetrics?: boolean

  /** Whether to show contact information (default: true) */
  showContactInfo?: boolean
}

/**
 * Props for PrincipalCardsGrid component
 */
export interface PrincipalCardsGridProps {
  /** Optional CSS classes for styling */
  className?: string

  /** Optional limit on number of cards displayed */
  maxItems?: number

  /** Optional filter function for principals */
  filter?: (principal: Organization) => boolean

  /** Optional sort function for principals */
  sort?: (a: Organization, b: Organization) => number

  /** Optional click handler for card selection */
  onPrincipalClick?: (principal: Organization) => void

  /** Whether to show the item count footer */
  showItemCount?: boolean
}

/**
 * Props for PrincipalsDashboard component
 */
export interface PrincipalsDashboardProps {
  /** Optional CSS classes for styling */
  className?: string

  /** Optional title override */
  title?: string

  /** Optional description override */
  description?: string

  /** Whether to show the add principal button */
  showAddButton?: boolean

  /** Optional handler for add principal action */
  onAddPrincipal?: () => void

  /** Optional handler for principal card clicks */
  onPrincipalClick?: (principal: Organization) => void
}

/**
 * Priority mapping configuration
 */
export interface PriorityConfig {
  level: DashboardPriority
  color: string
  bgColor: string
  borderColor: string
  hoverColor: string
  organizationSize: string | null
  description: string
}

/**
 * Loading state types for dashboard components
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Error state information
 */
export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string
  retryable?: boolean
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  /** Filter by priority levels */
  priorities?: DashboardPriority[]

  /** Filter by active/inactive status */
  activeOnly?: boolean

  /** Filter by organization size */
  sizes?: string[]

  /** Filter by industry */
  industries?: string[]

  /** Filter by minimum opportunity count */
  minOpportunities?: number

  /** Filter by minimum estimated value */
  minEstimatedValue?: number

  /** Search term for name/description */
  searchTerm?: string
}

/**
 * Sort options for principals
 */
export type PrincipalSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'priority-desc'
  | 'priority-asc'
  | 'opportunities-desc'
  | 'opportunities-asc'
  | 'value-desc'
  | 'value-asc'
  | 'activity-desc'
  | 'activity-asc'

/**
 * View options for dashboard layout
 */
export type DashboardView = 'grid' | 'list' | 'table'

/**
 * Export data format options
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

/**
 * Time range options for analytics
 */
export interface TimeRange {
  /** Start date */
  from: Date

  /** End date */
  to: Date

  /** Predefined range label */
  label?: string
}

/**
 * Predefined time range options
 */
export type PredefinedTimeRange =
  | 'today'
  | 'yesterday'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'last-year'
  | 'all-time'
