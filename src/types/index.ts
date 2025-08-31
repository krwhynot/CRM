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
} from './contact.types'

export { contactSchema, CONTACT_ROLES, getRoleLabel, getRoleValue } from './contact.types'
export * from './organization.types'
export * from './opportunity.types'
export * from './interaction.types'

// UI & Component Types
export * from './components'
export * from './dashboard'

// Chart Types
export * from './charts'

// Monitoring Types
export * from './monitoring'

// Product Extensions - Using specific exports to avoid conflicts
export type {
  ProductWithStatus,
  ProductWithSpecs,
  ProductComplete,
  ProductDisplayData,
  ProductAvailabilityStatus,
  ProductRowProps,
  ProductTableProps as ExtendedProductTableProps, // Renamed to avoid conflict
  ProductWithPrincipal as ExtendedProductWithPrincipal, // Renamed to avoid conflict
} from './product-extensions'

export {
  hasInventoryStatus,
  hasPrincipalInfo,
  hasSpecifications,
  isCompleteProduct,
  createSafeProductDisplay,
} from './product-extensions'

// Form Types - Using specific exports to avoid conflicts
export type {
  ContactFormData,
  OrganizationFormData,
  OpportunityFormData,
  ProductFormData,
  OpportunityProductFormData,
  ContactPreferredPrincipalFormData,
  AnyFormData,
  BaseFormProps as FormBaseProps, // Renamed to avoid conflict
  FormPropsWithPreselection,
} from './forms'

export {
  defaultContactFormValues,
  createContactFormDefaults,
  createContactFormDefaultsWithOrganization,
  defaultOrganizationFormValues,
  createOrganizationFormDefaults,
  createPrincipalOrganizationDefaults,
  createDistributorOrganizationDefaults,
  createCustomerOrganizationDefaults,
  defaultOpportunityFormValues,
  createOpportunityFormDefaults,
  createOpportunityFormDefaultsWithOrganization,
  createOpportunityFormDefaultsWithContact,
  createDiscoveryOpportunityDefaults,
  createProposalOpportunityDefaults,
  createNegotiationOpportunityDefaults,
  isContactFormData,
  isOrganizationFormData,
  isOpportunityFormData,
  isFormData,
  FormValidationPatterns,
  FormFieldRequirements,
  createTypedYupResolver,
} from './forms'

// Form handler types with specific naming
export type {
  FormSubmitHandler,
  FormValidationError,
  TypedYupResolver,
  EnhancedFormProps,
  FormStateManager,
  FormValidationConfig,
  FormValidationFeedbackReturn,
  FieldValidationIndicatorProps,
  FormDataWithComputed,
  FormSubmissionResult,
  AsyncFormHandler,
  FormComponentRef,
  TypedFormConfig,
  FormFieldRenderProps,
  FormFieldProps as FormHandlerFieldProps, // Renamed to avoid conflict
  FormSection,
  ProgressiveFormConfig,
} from './forms/form-handlers'

// Validation Types
export * from './validation'

// Import/Export Types
export * from './import-export'

// Re-export commonly used types for convenience
// Using the namespaced imports to prevent conflicts
export type { Database as DatabaseType } from './database.types'
export type { Database as SupabaseDatabase } from './supabase'
export type { Tables as DatabaseTables, Enums as DatabaseEnums } from './database.types'
export type { Tables as SupabaseTables, Enums as SupabaseEnums } from './supabase'

// Keep core CRM entity types directly exported for convenience
export type { Organization, Contact, Product, Opportunity, Interaction } from './entities'
