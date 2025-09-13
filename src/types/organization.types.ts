import type { Database } from '../lib/database.types'
import { z } from 'zod'
import { ZodTransforms } from '../lib/form-transforms'

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
export const organizationSchema = z.object({
  // REQUIRED FIELDS per specification
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(255, 'Name must be 255 characters or less'),

  type: z
    .enum(
      ['customer', 'principal', 'distributor', 'prospect', 'vendor'],
      {
        required_error: 'Organization type is required',
        invalid_type_error: 'Invalid organization type'
      }
    ),

  priority: z
    .enum(['A', 'B', 'C', 'D'], {
      required_error: 'Priority is required',
      invalid_type_error: 'Invalid priority level'
    }),

  segment: z
    .string()
    .min(1, 'Segment is required')
    .max(100, 'Segment must be 100 characters or less'),

  // IMPORTANT FIELDS per specification (auto-derived from type)
  is_principal: z.boolean().default(false),

  is_distributor: z.boolean().default(false),

  // OPTIONAL FIELDS per specification with transforms
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.normalizeEmail),

  phone: z
    .string()
    .max(50, 'Phone must be 50 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.normalizePhone),

  website: z
    .string()
    .url('Invalid website URL')
    .max(255, 'Website must be 255 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  address_line_1: z
    .string()
    .max(255, 'Address line 1 must be 255 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  address_line_2: z
    .string()
    .max(255, 'Address line 2 must be 255 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  city: z
    .string()
    .max(100, 'City must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  state_province: z
    .string()
    .max(100, 'State/Province must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  postal_code: z
    .string()
    .max(20, 'Postal code must be 20 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  country: z
    .string()
    .max(100, 'Country must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  industry: z
    .string()
    .max(100, 'Industry must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),
})

// Type inference from validation schema
export type OrganizationFormData = z.infer<typeof organizationSchema>

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
