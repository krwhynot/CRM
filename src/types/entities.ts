// Principal CRM Entity Types
// This file re-exports entity types from individual type files

// Import database types for supporting entities
import type { Database } from '../lib/database.types'

// Re-export main entity types from individual files
export type {
  Contact,
  ContactInsert,
  ContactUpdate,
  ContactWithOrganization,
  ContactWithPreferredPrincipals,
  ContactWithRelations,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole,
} from './contact.types'

export type {
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  OrganizationWithContacts,
  OrganizationPriority,
  FoodServiceSegment,
} from './organization.types'

export type {
  Opportunity,
  OpportunityInsert,
  OpportunityUpdate,
  OpportunityWithRelations,
  OpportunityContext,
  OpportunityStage,
} from './opportunity.types'

export type {
  Interaction,
  InteractionInsert,
  InteractionUpdate,
  InteractionWithRelations,
  InteractionType,
} from './interaction.types'

// Product entity types (unchanged in Principal CRM transformation)
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// Supporting junction table types
export type OpportunityProduct = Database['public']['Tables']['opportunity_products']['Row']
export type OpportunityProductInsert =
  Database['public']['Tables']['opportunity_products']['Insert']
export type OpportunityProductUpdate =
  Database['public']['Tables']['opportunity_products']['Update']

// Contact preferred principals junction table types
export type ContactPreferredPrincipal =
  Database['public']['Tables']['contact_preferred_principals']['Row']
export type ContactPreferredPrincipalInsert =
  Database['public']['Tables']['contact_preferred_principals']['Insert']
export type ContactPreferredPrincipalUpdate =
  Database['public']['Tables']['contact_preferred_principals']['Update']

// Enum types
export type ContactRole = Database['public']['Enums']['contact_role']
export type OrganizationType = Database['public']['Enums']['organization_type']
export type PriorityLevel = Database['public']['Enums']['priority_level']
export type ProductCategory = Database['public']['Enums']['product_category']

// Extended types moved to product-extensions.ts for better organization

// Re-export filter types from individual entity files
export type { ContactFilters } from './contact.types'
export type { OrganizationFilters } from './organization.types'
export type { OpportunityFilters } from './opportunity.types'
export type { InteractionFilters } from './interaction.types'

// Product filters (unchanged)
export interface ProductFilters {
  principal_id?: string
  category?: ProductCategory | ProductCategory[]
  search?: string
}

// Re-export form data types from validation schemas
export type {
  ContactFormData,
  OrganizationFormData,
  OpportunityFormData,
  MultiPrincipalOpportunityFormData,
  InteractionFormData,
  InteractionWithOpportunityFormData,
  ProductFormData,
  OpportunityProductFormData,
  ContactPreferredPrincipalFormData,
} from './validation'

// Re-export helper functions from individual type files
export {
  generateOpportunityName,
  getNextStage,
  getPreviousStage,
  OPPORTUNITY_STAGE_ORDER,
} from './opportunity.types'
export { MOBILE_INTERACTION_TEMPLATES } from './interaction.types'
export { FOOD_SERVICE_SEGMENTS } from './organization.types'
