import type { Database } from '../lib/database.types'
import * as yup from 'yup'
import { FormTransforms } from '../lib/form-transforms'

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
  name: yup
    .string()
    .required('Organization name is required')
    .max(255, 'Name must be 255 characters or less'),

  type: yup
    .string()
    .oneOf(
      ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const,
      'Invalid organization type'
    )
    .required('Organization type is required'),

  priority: yup
    .string()
    .oneOf(['A', 'B', 'C', 'D'] as const, 'Invalid priority level')
    .required('Priority is required'),

  segment: yup
    .string()
    .required('Segment is required')
    .max(100, 'Segment must be 100 characters or less'),

  // IMPORTANT FIELDS per specification (auto-derived from type)
  is_principal: yup.boolean().default(false),

  is_distributor: yup.boolean().default(false),

  // OPTIONAL FIELDS per specification with transforms
  description: yup
    .string()
    .max(500, 'Description must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  email: yup
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableEmail),

  phone: yup
    .string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  website: yup
    .string()
    .url('Invalid website URL')
    .max(255, 'Website must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableUrl),

  address_line_1: yup
    .string()
    .max(255, 'Address line 1 must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  address_line_2: yup
    .string()
    .max(255, 'Address line 2 must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  city: yup
    .string()
    .max(100, 'City must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  state_province: yup
    .string()
    .max(100, 'State/Province must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  postal_code: yup
    .string()
    .max(20, 'Postal code must be 20 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  country: yup
    .string()
    .max(100, 'Country must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  industry: yup
    .string()
    .max(100, 'Industry must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  notes: yup
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),
})

// Type inference from validation schema
export type OrganizationFormData = yup.InferType<typeof organizationSchema>

// Organization filters for queries
export interface OrganizationFilters {
  type?:
    | Database['public']['Enums']['organization_type']
    | Database['public']['Enums']['organization_type'][]
  priority?: OrganizationPriority | OrganizationPriority[]
  segment?: string | string[]
  is_principal?: boolean
  is_distributor?: boolean
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
  'Other',
] as const

export type FoodServiceSegment = (typeof FOOD_SERVICE_SEGMENTS)[number]
