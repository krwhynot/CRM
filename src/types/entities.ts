import type { Database } from './database.types'

// Organization entity types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

// Contact entity types
export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

// Product entity types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// Opportunity entity types
export type Opportunity = Database['public']['Tables']['opportunities']['Row']
export type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert']
export type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update']

// Interaction entity types
export type Interaction = Database['public']['Tables']['interactions']['Row']
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert']
export type InteractionUpdate = Database['public']['Tables']['interactions']['Update']

// Opportunity Products junction table types
export type OpportunityProduct = Database['public']['Tables']['opportunity_products']['Row']
export type OpportunityProductInsert = Database['public']['Tables']['opportunity_products']['Insert']
export type OpportunityProductUpdate = Database['public']['Tables']['opportunity_products']['Update']

// Principal-Distributor Relationships types
export type PrincipalDistributorRelationship = Database['public']['Tables']['principal_distributor_relationships']['Row']
export type PrincipalDistributorRelationshipInsert = Database['public']['Tables']['principal_distributor_relationships']['Insert']
export type PrincipalDistributorRelationshipUpdate = Database['public']['Tables']['principal_distributor_relationships']['Update']

// Enum types for easy access
export type ContactRole = Database['public']['Enums']['contact_role']
export type InteractionType = Database['public']['Enums']['interaction_type']
export type OpportunityStage = Database['public']['Enums']['opportunity_stage']
export type OrganizationType = Database['public']['Enums']['organization_type']
export type OrganizationSize = Database['public']['Enums']['organization_size']
export type PriorityLevel = Database['public']['Enums']['priority_level']
export type ProductCategory = Database['public']['Enums']['product_category']

// Extended types with relationships (for joins)
export type OrganizationWithContacts = Organization & {
  contacts?: Contact[]
}

export type ContactWithOrganization = Contact & {
  organization?: Organization
}

export type OpportunityWithRelations = Opportunity & {
  organization?: Organization
  contact?: Contact
  principal_organization?: Organization
  distributor_organization?: Organization
  opportunity_products?: (OpportunityProduct & { product?: Product })[]
  interactions?: Interaction[]
}

export type ProductWithPrincipal = Product & {
  principal?: Organization
}

export type InteractionWithRelations = Interaction & {
  contact?: Contact
  organization?: Organization
  opportunity?: Opportunity
}

// Filter types for common queries
export interface OrganizationFilters {
  type?: OrganizationType | OrganizationType[]
  size?: OrganizationSize | OrganizationSize[]
  industry?: string
  is_active?: boolean
  search?: string
}

export interface OpportunityFilters {
  stage?: OpportunityStage | OpportunityStage[]
  priority?: PriorityLevel | PriorityLevel[]
  organization_id?: string
  principal_organization_id?: string
  distributor_organization_id?: string
  contact_id?: string
  estimated_value_min?: number
  estimated_value_max?: number
  probability_min?: number
  probability_max?: number
}

export interface ContactFilters {
  organization_id?: string
  role?: ContactRole | ContactRole[]
  is_primary_contact?: boolean
  search?: string
}

export interface ProductFilters {
  principal_id?: string
  category?: ProductCategory | ProductCategory[]
  search?: string
}

export interface InteractionFilters {
  type?: InteractionType | InteractionType[]
  organization_id?: string
  contact_id?: string
  opportunity_id?: string
  interaction_date_from?: string
  interaction_date_to?: string
  follow_up_required?: boolean
}

// Form validation schemas types (to be used with form libraries)
export interface OrganizationFormData {
  name: string
  type: OrganizationType
  description?: string
  phone?: string
  email?: string
  website?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  industry?: string
  size?: OrganizationSize
  annual_revenue?: number
  employee_count?: number
  notes?: string
}

export interface ContactFormData {
  first_name: string
  last_name: string
  organization_id: string
  title?: string
  role?: ContactRole
  email?: string
  phone?: string
  mobile_phone?: string
  department?: string
  linkedin_url?: string
  is_primary_contact?: boolean
  notes?: string
}

export interface OpportunityFormData {
  name: string
  organization_id: string
  contact_id: string
  principal_organization_id?: string
  distributor_organization_id?: string
  stage?: OpportunityStage
  priority?: PriorityLevel
  estimated_value?: number
  estimated_close_date?: string
  probability?: number
  description?: string
  next_action?: string
  next_action_date?: string
  competition?: string
  decision_criteria?: string
  notes?: string
}

export interface ProductFormData {
  name: string
  principal_id: string
  category: ProductCategory
  description?: string
  sku?: string
  unit_of_measure?: string
  unit_cost?: number
  list_price?: number
  min_order_quantity?: number
  season_start?: number
  season_end?: number
  shelf_life_days?: number
  storage_requirements?: string
  specifications?: string
}

export interface InteractionFormData {
  type: InteractionType
  subject: string
  description?: string
  interaction_date?: string
  duration_minutes?: number
  contact_id?: string
  organization_id?: string
  opportunity_id?: string
  follow_up_required?: boolean
  follow_up_date?: string
  follow_up_notes?: string
  outcome?: string
}