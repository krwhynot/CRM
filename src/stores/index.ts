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

// Store utilities and types
export type StoreActions<T> = T extends { actions: infer A } ? A : never
export type StoreState<T> = Omit<T, 'actions'>
