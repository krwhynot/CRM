/**
 * KitchenPantry CRM Type System
 * 
 * Centralized type exports for the entire CRM application.
 * This file provides a single entry point for importing all type definitions.
 */

// =============================================================================
// DATABASE AND BASE TYPES
// =============================================================================

export * from './database.types'
export * from './entities'

// =============================================================================
// ENTITY-SPECIFIC TYPES
// =============================================================================

export * from './organizations.types'
export * from './contacts.types'
export * from './products.types'
export * from './opportunities.types'
export * from './interactions.types'
export * from './relationshipProgression.types'

// =============================================================================
// CONVENIENCE TYPE COLLECTIONS
// =============================================================================

/**
 * All form data types for easy importing
 */
export type {
  CreateOrganizationSchema,
  UpdateOrganizationSchema
} from './organizations.types'

export type {
  CreateContactSchema,
  UpdateContactSchema
} from './contacts.types'

export type {
  CreateProductSchema,
  UpdateProductSchema
} from './products.types'

export type {
  CreateOpportunitySchema,
  UpdateOpportunitySchema
} from './opportunities.types'

export type {
  CreateInteractionSchema,
  UpdateInteractionSchema
} from './interactions.types'

export type {
  MilestoneFormData,
  TrustActivityFormData,
  HealthAssessmentFormData
} from './relationshipProgression.types'

/**
 * All service interface types
 */
export type {
  OrganizationService
} from './organizations.types'

export type {
  ContactService
} from './contacts.types'

export type {
  ProductService
} from './products.types'

export type {
  OpportunityService
} from './opportunities.types'

export type {
  InteractionService
} from './interactions.types'

/**
 * All display utility interfaces
 */
export type {
  OrganizationDisplayUtils
} from './organizations.types'

export type {
  ContactDisplayUtils
} from './contacts.types'

export type {
  ProductDisplayUtils
} from './products.types'

export type {
  OpportunityDisplayUtils
} from './opportunities.types'

export type {
  InteractionDisplayUtils
} from './interactions.types'

/**
 * All analytics and metrics types
 */
export type {
  OrganizationMetrics
} from './organizations.types'

export type {
  ContactMetrics
} from './contacts.types'

export type {
  ProductMetrics
} from './products.types'

export type {
  OpportunityMetrics,
  SalesPipeline,
  SalesForecast
} from './opportunities.types'

export type {
  InteractionMetrics
} from './interactions.types'

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/**
 * All validation constants for easy importing
 */
export {
  ORGANIZATION_TYPES,
  REQUIRED_ORGANIZATION_FIELDS,
  EMAIL_VALIDATION_PATTERN,
  PHONE_VALIDATION_PATTERN,
  WEBSITE_VALIDATION_PATTERN
} from './organizations.types'

export {
  CONTACT_ROLES,
  REQUIRED_CONTACT_FIELDS,
  PHONE_PATTERNS,
  LINKEDIN_URL_PATTERN
} from './contacts.types'

export {
  PRODUCT_CATEGORIES,
  REQUIRED_PRODUCT_FIELDS,
  UNIT_OF_MEASURE_OPTIONS,
  SKU_VALIDATION_PATTERN,
  UPC_VALIDATION_PATTERN
} from './products.types'

export {
  OPPORTUNITY_STAGES,
  PRIORITY_LEVELS,
  REQUIRED_OPPORTUNITY_FIELDS,
  STAGE_PROGRESSION_RULES,
  DEFAULT_STAGE_PROBABILITY
} from './opportunities.types'

export {
  INTERACTION_TYPES,
  REQUIRED_INTERACTION_FIELDS,
  DEFAULT_INTERACTION_DURATION,
  INTERACTION_TYPE_CATEGORIES
} from './interactions.types'

export {
  RELATIONSHIP_STAGES,
  PROGRESSION_MILESTONES,
  TRUST_ACTIVITIES,
  COMMUNICATION_QUALITIES,
  getHealthScoreLevel,
  getMaturityLevel
} from './relationshipProgression.types'

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * All type guard functions
 */
export {
  isOrganizationType
} from './organizations.types'

export {
  isContactRole
} from './contacts.types'

export {
  isProductCategory
} from './products.types'

export {
  isOpportunityStage,
  isPriorityLevel
} from './opportunities.types'

export {
  isInteractionType
} from './interactions.types'

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * UI component prop types
 */
export type {
  OrganizationCardProps,
  OrganizationTableColumn
} from './organizations.types'

export type {
  ContactCardProps,
  ContactTableColumn
} from './contacts.types'

export type {
  ProductCardProps,
  ProductTableColumn
} from './products.types'

export type {
  OpportunityCardProps,
  OpportunityTableColumn
} from './opportunities.types'

export type {
  InteractionCardProps,
  InteractionTableColumn
} from './interactions.types'

// =============================================================================
// FORM STATE MANAGEMENT
// =============================================================================

/**
 * Form state management types
 */
export type {
  OrganizationFormState,
  OrganizationFormAction
} from './organizations.types'

export type {
  ContactFormState,
  ContactFormAction
} from './contacts.types'

export type {
  ProductFormState,
  ProductFormAction
} from './products.types'

export type {
  OpportunityFormState,
  OpportunityFormAction
} from './opportunities.types'

export type {
  InteractionFormState,
  InteractionFormAction
} from './interactions.types'

// =============================================================================
// UTILITY TYPE HELPERS
// =============================================================================

/**
 * Utility types for common patterns
 */
export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & { 
  created_at: string
  updated_at: string 
}
export type WithSoftDelete<T> = T & { deleted_at: string | null }
export type WithAudit<T> = T & {
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
}

/**
 * Form field types
 */
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'url' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'date' 
  | 'datetime-local' 
  | 'number' 
  | 'currency'
  | 'checkbox' 
  | 'radio'

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Modal states
 */
export type ModalState = 'closed' | 'opening' | 'open' | 'closing'

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'auto'

/**
 * Responsive breakpoints
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// =============================================================================
// GLOBAL CONFIGURATION TYPES
// =============================================================================

/**
 * Application configuration
 */
export interface AppConfig {
  apiUrl: string
  supabaseUrl: string
  supabaseKey: string
  environment: 'development' | 'staging' | 'production'
  version: string
  features: {
    enableAdvancedAnalytics: boolean
    enableBulkOperations: boolean
    enableWorkflowAutomation: boolean
    enableIntegrations: boolean
  }
}

/**
 * User permissions
 */
export type Permission = 
  | 'read_organizations' 
  | 'write_organizations'
  | 'read_contacts' 
  | 'write_contacts'
  | 'read_products' 
  | 'write_products'
  | 'read_opportunities' 
  | 'write_opportunities'
  | 'read_interactions' 
  | 'write_interactions'
  | 'admin_access'

/**
 * User role types
 */
export type UserRole = 'admin' | 'sales_manager' | 'sales_rep' | 'viewer'

/**
 * Navigation item type
 */
export interface NavigationItem {
  id: string
  label: string
  icon?: string
  href?: string
  children?: NavigationItem[]
  permissions?: Permission[]
  badge?: string | number
}