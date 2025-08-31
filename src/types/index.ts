// Type Definitions - Main Exports
// Centralized access to all type definitions in the CRM system

// Core Entity Types
export * from './entities'

// Database & Infrastructure Types - Using namespace imports to prevent naming collisions
export * as Database from './database.types'
export * as Supabase from './supabase'

// Feature-Specific Entity Types - Avoid re-exporting ContactRole to prevent conflicts
export type {
  ContactInsert,
  ContactUpdate,
  ContactWithOrganization,
  ContactWithPreferredPrincipals,
  ContactWithRelations,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole,
  ContactFilters,
  ContactFormData,
} from './contact.types'

export { contactSchema, CONTACT_ROLES, getRoleLabel, getRoleValue } from './contact.types'
export * from './organization.types'
export * from './opportunity.types'
export * from './interaction.types'

// UI & Component Types
export * from './components'
export * from './dashboard'

// Form Types (comprehensive barrel export)
export * from './forms'

// Validation Types
export * from './validation'

// Re-export commonly used types for convenience
// Using the namespaced imports to prevent conflicts
export type { Database as DatabaseType } from './database.types'
export type { Database as SupabaseDatabase } from './supabase'
export type { Tables as DatabaseTables, Enums as DatabaseEnums } from './database.types'
export type { Tables as SupabaseTables, Enums as SupabaseEnums } from './supabase'

// Keep core CRM entity types directly exported for convenience
export type { Organization, Contact, Product, Opportunity, Interaction } from './entities'
