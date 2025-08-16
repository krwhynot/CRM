import type { Database } from '../lib/database.types'
import * as yup from 'yup'

// Principal CRM Business Logic Types
export type OrganizationPriority = 'A' | 'B' | 'C' | 'D'

// Base organization types from database
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

// Organization with contacts relationship
export type OrganizationWithContacts = Organization & {
  contacts?: Database['public']['Tables']['contacts']['Row'][]
  contact_count?: number
  primary_contact?: Database['public']['Tables']['contacts']['Row']
}

// Organization validation schema - ONLY specification fields
export const organizationSchema = yup.object({
  // REQUIRED FIELDS per specification
  name: yup.string()
    .required('Organization name is required')
    .max(255, 'Name must be 255 characters or less'),
  
  priority: yup.string()
    .oneOf(['A', 'B', 'C', 'D'] as const, 'Invalid priority level')
    .required('Priority is required'),
  
  segment: yup.string()
    .required('Segment is required')
    .max(100, 'Segment must be 100 characters or less'),

  // REQUIRED type field - matches database enum exactly
  type: yup.string()
    .oneOf(['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const, 'Invalid organization type')
    .required('Organization type is required'),

  // IMPORTANT FIELDS per specification
  is_principal: yup.boolean()
    .default(false),
  
  is_distributor: yup.boolean()
    .default(false),

  // OPTIONAL FIELDS per specification
  address: yup.string()
    .max(255, 'Address must be 255 characters or less')
    .nullable(),
  
  city: yup.string()
    .max(100, 'City must be 100 characters or less')
    .nullable(),
  
  state: yup.string()
    .max(100, 'State must be 100 characters or less')
    .nullable(),
  
  zip: yup.string()
    .max(20, 'ZIP code must be 20 characters or less')
    .nullable(),
  
  phone: yup.string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable(),
  
  website: yup.string()
    .url('Invalid website URL')
    .max(255, 'Website must be 255 characters or less')
    .nullable(),
  
  
  notes: yup.string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
})

// Type inference from validation schema
export type OrganizationFormData = yup.InferType<typeof organizationSchema>

// Organization filters for queries
export interface OrganizationFilters {
  type?: Database['public']['Enums']['organization_type'] | Database['public']['Enums']['organization_type'][]
  priority?: OrganizationPriority | OrganizationPriority[]
  segment?: string | string[]
  is_principal?: boolean
  is_distributor?: boolean
  size?: Database['public']['Enums']['organization_size'] | Database['public']['Enums']['organization_size'][]
  is_active?: boolean
  search?: string
}

// Common segment options for food service industry
export const FOOD_SERVICE_SEGMENTS = [
  'Fine Dining',
  'Fast Food',
  'Fast Casual',
  'Healthcare',
  'Education',
  'Corporate Catering',
  'Hotel & Resort',
  'Entertainment Venue',
  'Retail Food Service',
  'Government',
  'Senior Living',
  'Other'
] as const

export type FoodServiceSegment = typeof FOOD_SERVICE_SEGMENTS[number]

// Organization types - must match database enum exactly
export const ORGANIZATION_TYPES = ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const
export type OrganizationType = typeof ORGANIZATION_TYPES[number]

// Business rule for type derivation from boolean flags
export const deriveOrganizationType = (isPrincipal: boolean, isDistributor: boolean): OrganizationType => {
  if (isPrincipal && isDistributor) return "principal" // Principal takes precedence 
  if (isPrincipal) return "principal"
  if (isDistributor) return "distributor"
  return "customer" // Default for new prospects
}