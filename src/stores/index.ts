/**
 * Stores Index - Zustand Store Exports
 *
 * Centralized exports for client-side state management stores.
 * Server-side data is handled via TanStack Query hooks in the features/ directory.
 *
 * Architecture:
 * - Zustand stores: Client-side UI state, preferences, and form state
 * - TanStack Query hooks: Server data fetching, caching, and mutations
 */

// Contact Advocacy Store - Client-side UI state only
export {
  useContactAdvocacyStore,
  useAdvocacySelection,
  useAdvocacyFilters,
  useAdvocacyView,
  useAdvocacyForm,
  useAdvocacyPreferences,
  type ContactAdvocacyUIState,
  type AdvocacyViewMode,
  type AdvocacySortBy,
  type AdvocacySortOrder,
} from './contactAdvocacyStore'

// Opportunity Auto-Naming Store - Client-side UI state only
export {
  useOpportunityAutoNamingStore,
  useNamingTemplates,
  useNamingConfiguration,
  useNamingPreview,
  useNamingUtilities,
  useNamingUI,
  type OpportunityNamingUIState,
  type NamingTemplate,
  type NamingConfiguration,
  type NameValidationResult,
  type NamePreview,
} from './opportunityAutoNamingStore'

// Dashboard Chart Visibility Store - Client-side UI state only
export {
  useDashboardChartVisibilityStore,
  useChartVisibility,
  useChartVisibilityBulk,
  useChartVisibilityPreferences,
  getVisibleCharts,
  type DashboardChartVisibilityUIState,
  type ChartId,
  type ChartVisibilityState,
  type ChartMetadata,
  CHART_METADATA,
} from './dashboardChartVisibilityStore'

// Store utilities and types
export type StoreActions<T> = T extends { actions: infer A } ? A : never
export type StoreState<T> = Omit<T, 'actions'>

// Future stores can be exported here as the system expands
// Example:
// export { useAnalyticsStore } from './analyticsStore'
// export { useNotificationStore } from './notificationStore'
