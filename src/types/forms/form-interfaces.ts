/**
 * Form Interface Definitions
 *
 * TypeScript interfaces for all CRM entity forms following the new architecture.
 * These interfaces define the shape of form data for each entity type.
 */

import type { Database } from '@/lib/database.types'

// Base form interface with common fields
interface BaseFormInterface {
  id?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

/**
 * Organization Form Interface
 */
export interface OrganizationFormInterface extends BaseFormInterface {
  name: string
  type: Database['public']['Enums']['organization_type']
  segment?: string | null
  priority: string

  // Organization Type Flags
  is_principal?: boolean | null
  is_distributor?: boolean | null
  is_active?: boolean | null

  // Contact Information
  email?: string | null
  phone?: string | null
  website?: string | null

  // Address Information
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null

  // Business Information
  annual_revenue?: number | null
  employee_count?: number | null
  industry?: string | null
  description?: string | null
  notes?: string | null
  tags?: string[] | null

  // Hierarchy
  parent_organization_id?: string | null

  // Manager Information
  primary_manager_name?: string | null
  secondary_manager_name?: string | null
}

/**
 * Contact Form Interface
 */
export interface ContactFormInterface extends BaseFormInterface {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  mobile?: string | null

  // Organization Relationship
  organization_id?: string | null
  position?: string | null
  department?: string | null

  // Contact Classification
  role: Database['public']['Enums']['contact_role']
  purchase_influence?: string | null
  decision_authority?: string | null

  // Additional Information
  linkedin_url?: string | null
  notes?: string | null
  tags?: string[] | null
  preferred_contact_method?: 'email' | 'phone' | 'mobile' | null
}

/**
 * Product Form Interface
 */
export interface ProductFormInterface extends BaseFormInterface {
  name: string
  sku?: string | null
  description?: string | null
  category?: string | null

  // Pricing Information
  unit_price?: number | null
  cost_price?: number | null
  currency?: string | null

  // Inventory Information
  stock_quantity?: number | null
  minimum_order_quantity?: number | null

  // Product Details
  brand?: string | null
  manufacturer?: string | null
  weight?: number | null
  dimensions?: string | null

  // Status and Availability
  is_active: boolean
  availability_status?: 'in_stock' | 'out_of_stock' | 'discontinued' | null

  // Additional Information
  tags?: string[] | null
  notes?: string | null
}

/**
 * Opportunity Form Interface
 */
export interface OpportunityFormInterface extends BaseFormInterface {
  name: string
  description?: string | null

  // Opportunity Value and Timing
  value?: number | null
  currency?: string | null
  probability?: number | null
  expected_close_date?: string | null
  actual_close_date?: string | null

  // Status and Stage
  status: Database['public']['Enums']['opportunity_status']
  stage: Database['public']['Enums']['opportunity_stage']
  lost_reason?: string | null

  // Relationships
  organization_id?: string | null
  primary_contact_id?: string | null

  // Products and Services
  products?: string[] | null // Array of product IDs

  // Additional Information
  source?: string | null
  competitor?: string | null
  next_action?: string | null
  next_action_date?: string | null

  notes?: string | null
  tags?: string[] | null
}

/**
 * Interaction Form Interface
 */
export interface InteractionFormInterface extends BaseFormInterface {
  type: Database['public']['Enums']['interaction_type']
  subject: string
  description?: string | null

  // Timing
  interaction_date: string
  follow_up_date?: string | null
  duration_minutes?: number | null

  // Relationships
  contact_id?: string | null
  organization_id?: string | null
  opportunity_id?: string | null

  // Outcome and Next Steps
  outcome?: string | null
  next_steps?: string | null

  // Additional Information
  location?: string | null
  attendees?: string[] | null
  notes?: string | null
  tags?: string[] | null

  // Attachments (file URLs or IDs)
  attachments?: string[] | null
}

// Export utility types
export type EntityFormInterface =
  | OrganizationFormInterface
  | ContactFormInterface
  | ProductFormInterface
  | OpportunityFormInterface
  | InteractionFormInterface

export type EntityType = 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
