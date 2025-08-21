/**
 * Stores Index - Zustand Store Exports
 * 
 * Centralized exports for all Zustand stores in the Principal CRM system.
 * Provides clean imports and consistent store access patterns.
 */

// Contact Advocacy Store (Currently unused - available for future development)
// export {
//   useContactAdvocacyStore,
//   useAdvocacyRelationships,
//   useAdvocacyActions,
//   useAdvocacyMetrics,
//   useAdvocacyFilters,
//   type ContactAdvocacyState,
//   type ContactAdvocacyRelationship,
//   type AdvocacyFilters,
//   type AdvocacyMetrics
// } from './contactAdvocacyStore'

// Opportunity Auto-Naming Store (Currently unused - available for future development)
// export {
//   useOpportunityAutoNamingStore,
//   useOpportunityNaming,
//   useNamingTemplates,
//   useNamingConfiguration,
//   useNamingSuggestions,
//   useNamingValidation,
//   type OpportunityAutoNamingState,
//   type NamingTemplate,
//   type NamingConfiguration,
//   type NameValidationResult,
//   type NamePreview
// } from './opportunityAutoNamingStore'

// Store utilities and types
export type StoreActions<T> = T extends { actions: infer A } ? A : never
export type StoreState<T> = Omit<T, 'actions'>

// Future stores can be exported here as the system expands
// Example:
// export { useAnalyticsStore } from './analyticsStore'
// export { useNotificationStore } from './notificationStore'