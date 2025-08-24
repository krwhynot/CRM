// Type Definitions - Main Exports
// Centralized access to all type definitions in the CRM system

// Core Entity Types
export * from './entities'

// Database & Infrastructure Types
export * from './database.types'
export * from './supabase'

// Feature-Specific Entity Types
export * from './contact.types'
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
export type { Database } from './database.types'
export type { 
  Organization, 
  Contact, 
  Product, 
  Opportunity, 
  Interaction 
} from './entities'