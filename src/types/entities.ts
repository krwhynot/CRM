/**
 * Feature-specific type definitions for the KitchenPantry CRM system
 * 
 * This file provides clean, feature-focused interfaces that extend the base
 * database types with additional functionality for forms, API services, and
 * business logic implementation.
 */

import type { Tables, TablesInsert, TablesUpdate, Enums } from './database.types'
// Re-export Database type for use in services
export type { Database } from './database.types'

// =============================================================================
// BASE ENTITY TYPE UTILITIES
// =============================================================================

/**
 * Generic base entity interface with common audit fields
 */
export interface BaseEntity {
  id: string
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
}

/**
 * Generic insert interface for base entity fields
 */
export interface BaseEntityInsert {
  id?: string
  created_at?: string | null
  updated_at?: string | null
  created_by?: string | null
  updated_by?: string | null
  deleted_at?: string | null
}

/**
 * Generic update interface for base entity fields
 */
export interface BaseEntityUpdate {
  updated_at?: string | null
  updated_by?: string | null
  deleted_at?: string | null
}

// =============================================================================
// ENUM TYPE EXPORTS
// =============================================================================

export type OrganizationType = Enums<'organization_type'>
export type ContactRole = Enums<'contact_role'>
export type ProductCategory = Enums<'product_category'>
export type OpportunityStage = Enums<'opportunity_stage'>
export type PriorityLevel = Enums<'priority_level'>
export type InteractionType = Enums<'interaction_type'>

// =============================================================================
// ORGANIZATION TYPES
// =============================================================================

/**
 * Organization entity - companies in the food service supply chain
 */
export interface Organization extends Tables<'organizations'> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrganizationInsert extends TablesInsert<'organizations'> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrganizationUpdate extends TablesUpdate<'organizations'> {}

/**
 * Extended organization interface for UI components
 */
export interface OrganizationWithRelations extends Organization {
  parent_organization?: Organization | null
  child_organizations?: Organization[]
  contacts?: Contact[]
  primary_contact?: Contact | null
  products?: Product[]
  opportunities?: Opportunity[]
  principal_relationships?: PrincipalDistributorRelationship[]
  distributor_relationships?: PrincipalDistributorRelationship[]
  // Calculated fields for UI display
  contact_count?: number
  opportunity_count?: number
  total_opportunity_value?: number
}

/**
 * Organization form data interface for validation
 */
export interface OrganizationFormData extends Omit<OrganizationInsert, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at'> {
  name: string
  type: OrganizationType
}

/**
 * Organization list item interface for display
 */
export interface OrganizationListItem {
  id: string
  name: string
  type: OrganizationType
  city: string | null
  state_province: string | null
  primary_contact_name: string | null
  primary_contact_email: string | null
  contact_count: number
  opportunity_count: number
  total_opportunity_value: number
  created_at: string
}

// =============================================================================
// CONTACT TYPES
// =============================================================================

/**
 * Contact entity - people within organizations
 */
export interface Contact extends Tables<'contacts'> {}

export interface ContactInsert extends TablesInsert<'contacts'> {}

export interface ContactUpdate extends TablesUpdate<'contacts'> {}

/**
 * Extended contact interface for UI components
 */
export interface ContactWithRelations extends Contact {
  organization?: Organization | null
  opportunities?: Opportunity[]
  interactions?: Interaction[]
}

/**
 * Contact form data interface for validation
 */
export interface ContactFormData extends Omit<ContactInsert, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at'> {
  organization_id: string
  first_name: string
  last_name: string
}

/**
 * Contact list item interface for display
 */
export interface ContactListItem {
  id: string
  first_name: string
  last_name: string
  full_name: string
  title: string | null
  role: ContactRole | null
  email: string | null
  phone_work: string | null
  organization_name: string
  organization_type: OrganizationType
  is_primary_contact: boolean
  last_interaction_date: string | null
  created_at: string
}

// =============================================================================
// PRODUCT TYPES
// =============================================================================

/**
 * Product entity - items owned by principals
 */
export interface Product extends Tables<'products'> {}

export interface ProductInsert extends TablesInsert<'products'> {}

export interface ProductUpdate extends TablesUpdate<'products'> {}

/**
 * Extended product interface for UI components
 */
export interface ProductWithRelations extends Product {
  principal?: Organization | null
  opportunities?: Opportunity[]
  opportunity_products?: OpportunityProduct[]
}

/**
 * Product form data interface for validation
 */
export interface ProductFormData extends Omit<ProductInsert, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at'> {
  principal_id: string
  name: string
  category: ProductCategory
}

/**
 * Product list item interface for display
 */
export interface ProductListItem {
  id: string
  name: string
  category: ProductCategory
  sku: string | null
  brand: string | null
  unit_price: number | null
  unit_of_measure: string | null
  is_active: boolean
  is_seasonal: boolean
  principal_name: string
  opportunity_count: number
  total_opportunity_value: number
  created_at: string
}

// =============================================================================
// OPPORTUNITY TYPES
// =============================================================================

/**
 * Opportunity entity - sales pipeline tracking
 */
export interface Opportunity extends Tables<'opportunities'> {}

export interface OpportunityInsert extends TablesInsert<'opportunities'> {}

export interface OpportunityUpdate extends TablesUpdate<'opportunities'> {}

/**
 * Extended opportunity interface for UI components
 */
export interface OpportunityWithRelations extends Opportunity {
  organization?: Organization | null
  primary_contact?: Contact | null
  principal?: Organization | null
  distributor?: Organization | null
  products?: Product[]
  opportunity_products?: OpportunityProduct[]
  interactions?: Interaction[]
}

/**
 * Opportunity form data interface for validation
 */
export interface OpportunityFormData extends Omit<OpportunityInsert, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at'> {
  organization_id: string
  name: string
  stage?: OpportunityStage
  priority?: PriorityLevel
}

/**
 * Opportunity list item interface for display
 */
export interface OpportunityListItem {
  id: string
  name: string
  stage: OpportunityStage
  priority: PriorityLevel
  estimated_value: number | null
  probability: number
  expected_close_date: string | null
  organization_name: string
  primary_contact_name: string | null
  principal_name: string | null
  distributor_name: string | null
  days_in_stage: number
  weighted_value: number
  product_count: number
  interaction_count: number
  last_interaction_date: string | null
  created_at: string
}

// =============================================================================
// INTERACTION TYPES
// =============================================================================

/**
 * Interaction entity - follow-up activities and communication tracking
 */
export interface Interaction extends Tables<'interactions'> {}

export interface InteractionInsert extends TablesInsert<'interactions'> {}

export interface InteractionUpdate extends TablesUpdate<'interactions'> {}

/**
 * Extended interaction interface for UI components
 */
export interface InteractionWithRelations extends Interaction {
  organization?: Organization | null
  opportunity?: Opportunity | null
  contact?: Contact | null
}

/**
 * Interaction form data interface for validation
 */
export interface InteractionFormData extends Omit<InteractionInsert, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at'> {
  organization_id: string
  type: InteractionType
  subject: string
}

/**
 * Interaction list item interface for display
 */
export interface InteractionListItem {
  id: string
  type: InteractionType
  subject: string
  priority: PriorityLevel
  scheduled_at: string | null
  completed_at: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  organization_name: string
  opportunity_name: string | null
  contact_name: string | null
  is_overdue: boolean
  days_since_scheduled: number | null
  created_at: string
}

// =============================================================================
// RELATIONSHIP TYPES
// =============================================================================

/**
 * Opportunity-Product relationship entity
 */
export interface OpportunityProduct extends Tables<'opportunity_products'> {}

export interface OpportunityProductInsert extends TablesInsert<'opportunity_products'> {}

export interface OpportunityProductUpdate extends TablesUpdate<'opportunity_products'> {}

/**
 * Extended opportunity product interface for UI components
 */
export interface OpportunityProductWithRelations extends OpportunityProduct {
  opportunity?: Opportunity | null
  product?: Product | null
}

/**
 * Principal-Distributor relationship entity
 */
export interface PrincipalDistributorRelationship extends Tables<'principal_distributor_relationships'> {}

export interface PrincipalDistributorRelationshipInsert extends TablesInsert<'principal_distributor_relationships'> {}

export interface PrincipalDistributorRelationshipUpdate extends TablesUpdate<'principal_distributor_relationships'> {}

/**
 * Extended principal distributor relationship interface for UI components
 */
export interface PrincipalDistributorRelationshipWithRelations extends PrincipalDistributorRelationship {
  principal?: Organization | null
  distributor?: Organization | null
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  total_count: number
  page: number
  page_size: number
  total_pages: number
  has_next_page: boolean
  has_previous_page: boolean
}

/**
 * Error response details
 */
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
  field?: string
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Form validation error structure
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// =============================================================================
// FILTER AND QUERY TYPES
// =============================================================================

/**
 * Base filter interface
 */
export interface BaseFilter {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  created_after?: string
  created_before?: string
  updated_after?: string
  updated_before?: string
  include_deleted?: boolean
}

/**
 * Organization-specific filters
 */
export interface OrganizationFilter extends BaseFilter {
  type?: OrganizationType | OrganizationType[]
  city?: string
  state_province?: string
  country?: string
  has_parent?: boolean
  parent_id?: string
}

/**
 * Contact-specific filters
 */
export interface ContactFilter extends BaseFilter {
  organization_id?: string | string[]
  role?: ContactRole | ContactRole[]
  is_primary_contact?: boolean
  has_email?: boolean
  has_phone?: boolean
}

/**
 * Product-specific filters
 */
export interface ProductFilter extends BaseFilter {
  principal_id?: string | string[]
  category?: ProductCategory | ProductCategory[]
  is_active?: boolean
  is_seasonal?: boolean
  brand?: string
  price_min?: number
  price_max?: number
}

/**
 * Opportunity-specific filters
 */
export interface OpportunityFilter extends BaseFilter {
  organization_id?: string | string[]
  stage?: OpportunityStage | OpportunityStage[]
  priority?: PriorityLevel | PriorityLevel[]
  principal_id?: string | string[]
  distributor_id?: string | string[]
  value_min?: number
  value_max?: number
  close_date_after?: string
  close_date_before?: string
  probability_min?: number
  probability_max?: number
}

/**
 * Interaction-specific filters
 */
export interface InteractionFilter extends BaseFilter {
  organization_id?: string | string[]
  opportunity_id?: string | string[]
  contact_id?: string | string[]
  type?: InteractionType | InteractionType[]
  priority?: PriorityLevel | PriorityLevel[]
  completed?: boolean
  follow_up_required?: boolean
  scheduled_after?: string
  scheduled_before?: string
  overdue_only?: boolean
}