/**
 * Organization-specific type definitions and utilities
 * 
 * This file provides specialized types for organization-related functionality
 * including validation schemas, form types, and business logic interfaces.
 */

import type { 
  Organization, 
  OrganizationWithRelations,
  OrganizationListItem,
  OrganizationFilter,
  OrganizationType,
  Contact,
  PrincipalDistributorRelationship
} from './entities'

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Organization creation form validation schema type
 */
export interface CreateOrganizationSchema {
  name: string
  type: OrganizationType
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  annual_revenue?: number | null
  employee_count?: number | null
  industry?: string | null
  parent_organization_id?: string | null
}

/**
 * Organization update form validation schema type
 */
export interface UpdateOrganizationSchema {
  name?: string
  type?: OrganizationType
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  annual_revenue?: number | null
  employee_count?: number | null
  industry?: string | null
  parent_organization_id?: string | null
}

// =============================================================================
// BUSINESS LOGIC TYPES
// =============================================================================

/**
 * Organization summary for dashboard views
 */
export interface OrganizationSummary {
  id: string
  name: string
  type: OrganizationType
  contact_count: number
  opportunity_count: number
  total_opportunity_value: number
  active_opportunities: number
  last_activity_date: string | null
  primary_contact: Contact | null
}

/**
 * Organization relationship tree structure
 */
export interface OrganizationTree {
  organization: OrganizationWithRelations
  children: OrganizationTree[]
  level: number
  has_children: boolean
}

/**
 * Organization metrics for analytics
 */
export interface OrganizationMetrics {
  total_organizations: number
  by_type: Record<OrganizationType, number>
  with_opportunities: number
  total_opportunity_value: number
  average_deal_size: number
  conversion_rate: number
  growth_rate: number
  recent_additions: number
}

/**
 * Principal-specific organization data
 */
export interface PrincipalOrganization extends Organization {
  type: 'principal'
  product_count: number
  distributor_count: number
  total_distributor_volume: number
  active_opportunities: number
  distributor_relationships?: PrincipalDistributorRelationship[]
}

/**
 * Distributor-specific organization data
 */
export interface DistributorOrganization extends Organization {
  type: 'distributor'
  principal_count: number
  territory_coverage: string[]
  volume_commitment: number
  performance_tier: string | null
  principal_relationships?: PrincipalDistributorRelationship[]
}

/**
 * Customer-specific organization data
 */
export interface CustomerOrganization extends Organization {
  type: 'customer'
  lifetime_value: number
  avg_order_value: number
  order_frequency: number
  preferred_products: string[]
  account_status: 'active' | 'inactive' | 'prospect'
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

/**
 * Organization card display props
 */
export interface OrganizationCardProps {
  organization: OrganizationListItem
  showActions?: boolean
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * Organization table column configuration
 */
export interface OrganizationTableColumn {
  key: keyof OrganizationListItem | 'actions'
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: OrganizationListItem) => string | number
}

/**
 * Organization form step configuration
 */
export interface OrganizationFormStep {
  id: string
  title: string
  description: string
  fields: Array<keyof CreateOrganizationSchema>
  validation?: (data: Partial<CreateOrganizationSchema>) => string[]
  optional?: boolean
}

// =============================================================================
// API SERVICE TYPES
// =============================================================================

/**
 * Organization service method signatures
 */
export interface OrganizationService {
  // CRUD operations
  getAll: (filter?: OrganizationFilter) => Promise<OrganizationListItem[]>
  getById: (id: string) => Promise<OrganizationWithRelations | null>
  create: (data: CreateOrganizationSchema) => Promise<Organization>
  update: (id: string, data: UpdateOrganizationSchema) => Promise<Organization>
  delete: (id: string) => Promise<void>
  
  // Relationship operations
  getChildren: (parentId: string) => Promise<Organization[]>
  getTree: (rootId?: string) => Promise<OrganizationTree[]>
  setParent: (childId: string, parentId: string | null) => Promise<void>
  
  // Search and filter
  search: (query: string, type?: OrganizationType) => Promise<OrganizationListItem[]>
  filter: (filter: OrganizationFilter) => Promise<OrganizationListItem[]>
  
  // Business operations
  getMetrics: () => Promise<OrganizationMetrics>
  getSummary: (id: string) => Promise<OrganizationSummary>
  
  // Type-specific operations
  getPrincipals: () => Promise<PrincipalOrganization[]>
  getDistributors: () => Promise<DistributorOrganization[]>
  getCustomers: () => Promise<CustomerOrganization[]>
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Organization type validation
 */
export const ORGANIZATION_TYPES: OrganizationType[] = [
  'customer',
  'principal', 
  'distributor',
  'prospect',
  'vendor'
] as const

/**
 * Required fields for organization creation
 */
export const REQUIRED_ORGANIZATION_FIELDS: Array<keyof CreateOrganizationSchema> = [
  'name',
  'type'
]

/**
 * Email validation pattern
 */
export const EMAIL_VALIDATION_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/**
 * Phone validation pattern (flexible international format)
 */
export const PHONE_VALIDATION_PATTERN = /^\+?[\d\s\-\(\)]+$/

/**
 * Website URL validation pattern
 */
export const WEBSITE_VALIDATION_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Organization type guard functions
 */
export const isOrganizationType = (value: string): value is OrganizationType => {
  return ORGANIZATION_TYPES.includes(value as OrganizationType)
}

/**
 * Organization display utilities
 */
export interface OrganizationDisplayUtils {
  formatAddress: (org: Organization) => string
  formatPhone: (phone: string | null) => string
  formatRevenue: (revenue: number | null) => string
  getTypeIcon: (type: OrganizationType) => string
  getTypeColor: (type: OrganizationType) => string
  getFullAddress: (org: Organization) => string | null
}

/**
 * Organization status indicators
 */
export type OrganizationStatus = 'active' | 'inactive' | 'pending' | 'archived'

/**
 * Organization activity tracking
 */
export interface OrganizationActivity {
  id: string
  organization_id: string
  activity_type: 'created' | 'updated' | 'contact_added' | 'opportunity_created' | 'interaction_logged'
  description: string
  metadata?: Record<string, any>
  created_at: string
  created_by: string
}

/**
 * Organization import/export types
 */
export interface OrganizationImportRow extends Omit<CreateOrganizationSchema, 'type'> {
  type: string // String version for CSV import
  row_number: number
  validation_errors?: string[]
}

export interface OrganizationExportRow extends OrganizationListItem {
  full_address: string | null
  primary_contact_full_name: string | null
  primary_contact_phone: string | null
}

// =============================================================================
// FORM STATE MANAGEMENT
// =============================================================================

/**
 * Organization form state
 */
export interface OrganizationFormState {
  data: Partial<CreateOrganizationSchema>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  currentStep?: number
  totalSteps?: number
}

/**
 * Organization form actions
 */
export type OrganizationFormAction =
  | { type: 'SET_FIELD'; field: keyof CreateOrganizationSchema; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SET_STEP'; step: number }