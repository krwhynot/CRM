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

// Organization type enum matching database constraints
export const OrganizationTypeEnum = z.enum([
  'customer',
  'principal',
  'distributor',
  'prospect',
  'vendor',
  'unknown'
] as const)

// Priority enum with CRM business logic
export const OrganizationPriorityEnum = z.enum(['A', 'B', 'C', 'D'] as const)

// Validation constants for organization fields
export const ORGANIZATION_VALIDATION_CONSTANTS = {
  name: { max: 255 },
  description: { max: 500 },
  email: { max: 255 },
  phone: { max: 50 },
  website: { max: 255 },
  address_line_1: { max: 255 },
  address_line_2: { max: 255 },
  city: { max: 100 },
  state_province: { max: 100 },
  postal_code: { max: 20 },
  country: { max: 100 },
  industry: { max: 100 },
  segment: { max: 100 },
  notes: { max: 500 },
} as const

/**
 * Base Organization Schema
 * Core validation rules matching database constraints and business requirements
 */
export const organizationBaseSchema = z.object({
  // REQUIRED FIELDS per specification
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(ORGANIZATION_VALIDATION_CONSTANTS.name.max, 'Name must be 255 characters or less'),

  type: OrganizationTypeEnum.describe('Organization type is required'),

  priority: OrganizationPriorityEnum.describe('Priority is required'),

  segment: z
    .string()
    .min(1, 'Segment is required')
    .max(ORGANIZATION_VALIDATION_CONSTANTS.segment.max, 'Segment must be 100 characters or less'),

  // IMPORTANT FIELDS per specification (auto-derived from type)
  is_principal: z.boolean().default(false),
  is_distributor: z.boolean().default(false),

  // OPTIONAL FIELDS per specification with ZodTransforms
  description: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.description.max, {
      message: 'Description must be 500 characters or less'
    }),

  email: ZodTransforms.nullableEmail
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.email.max, {
      message: 'Email must be 255 characters or less'
    }),

  phone: ZodTransforms.nullablePhone
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.phone.max, {
      message: 'Phone must be 50 characters or less'
    }),

  website: ZodTransforms.nullableUrl
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.website.max, {
      message: 'Website must be 255 characters or less'
    }),

  // ADDRESS FIELDS with proper validation
  address_line_1: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.address_line_1.max, {
      message: 'Address line 1 must be 255 characters or less'
    }),

  address_line_2: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.address_line_2.max, {
      message: 'Address line 2 must be 255 characters or less'
    }),

  city: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.city.max, {
      message: 'City must be 100 characters or less'
    }),

  state_province: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.state_province.max, {
      message: 'State/Province must be 100 characters or less'
    }),

  postal_code: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.postal_code.max, {
      message: 'Postal code must be 20 characters or less'
    }),

  country: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.country.max, {
      message: 'Country must be 100 characters or less'
    }),

  industry: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.industry.max, {
      message: 'Industry must be 100 characters or less'
    }),

  notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= ORGANIZATION_VALIDATION_CONSTANTS.notes.max, {
      message: 'Notes must be 500 characters or less'
    }),
})

/**
 * Main Organization Schema
 * Primary schema for organization validation
 */
export const organizationZodSchema = organizationBaseSchema.refine(
  (data) => {
    // Business logic validation: is_principal should align with type
    if (data.type === 'principal' && !data.is_principal) {
      return false
    }
    if (data.type === 'distributor' && !data.is_distributor) {
      return false
    }
    return true
  },
  {
    message: 'Organization type flags must align with selected type',
    path: ['type'],
  }
)

/**
 * Organization Create Schema
 * For creating new organizations (excludes auto-generated fields)
 */
export const organizationCreateSchema = organizationBaseSchema

/**
 * Organization Update Schema
 * For updating existing organizations (all fields optional except core identifiers)
 */
export const organizationUpdateSchema = organizationBaseSchema.partial().extend({
  // Keep certain fields as required for updates if needed
  // All fields are optional for updates by default
})

/**
 * Discriminated Union Schema for Organization Types
 * Demonstrates advanced Zod patterns equivalent to Yup .when() conditional validation
 */
export const organizationDiscriminatedSchema = z.discriminatedUnion('type', [
  // Principal organizations - additional validation for principals
  organizationBaseSchema.extend({
    type: z.literal('principal'),
    is_principal: z.literal(true),
    // Could add principal-specific required fields here
  }),

  // Distributor organizations - additional validation for distributors
  organizationBaseSchema.extend({
    type: z.literal('distributor'),
    is_distributor: z.literal(true),
    // Could add distributor-specific required fields here
  }),

  // Customer organizations
  organizationBaseSchema.extend({
    type: z.literal('customer'),
    is_principal: z.literal(false),
    is_distributor: z.literal(false),
  }),

  // Prospect organizations
  organizationBaseSchema.extend({
    type: z.literal('prospect'),
    is_principal: z.literal(false),
    is_distributor: z.literal(false),
  }),

  // Vendor organizations
  organizationBaseSchema.extend({
    type: z.literal('vendor'),
    is_principal: z.literal(false),
    is_distributor: z.literal(false),
  }),

  // Unknown organizations
  organizationBaseSchema.extend({
    type: z.literal('unknown'),
    is_principal: z.literal(false),
    is_distributor: z.literal(false),
  }),
])

/**
 * Self-Referencing Organization Schema
 * For organizations with parent-child relationships
 */
export const organizationWithParentSchema = organizationBaseSchema.extend({
  parent_organization_id: ZodTransforms.uuidField.optional(),
  // Self-referencing validation could be added here if needed
})

/**
 * TypeScript Type Inference from Zod Schemas
 */
export type OrganizationZodFormData = z.infer<typeof organizationZodSchema>
export type OrganizationCreateFormData = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdateFormData = z.infer<typeof organizationUpdateSchema>
export type OrganizationDiscriminatedFormData = z.infer<typeof organizationDiscriminatedSchema>
export type OrganizationWithParentFormData = z.infer<typeof organizationWithParentSchema>
export type OrganizationFormData = OrganizationZodFormData

/**
 * Organization Validation Class
 * Static methods for organization validation following LayoutValidator pattern
 */
export class OrganizationZodValidation {
  /**
   * Validate organization data against base schema
   */
  static validate(data: unknown): OrganizationZodFormData {
    const result = organizationZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Organization validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate organization create data
   */
  static validateCreate(data: unknown): OrganizationCreateFormData {
    const result = organizationCreateSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Organization create validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate organization update data
   */
  static validateUpdate(data: unknown): OrganizationUpdateFormData {
    const result = organizationUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Organization update validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Safe validation with detailed error information
   */
  static safeParse(data: unknown) {
    return organizationZodSchema.safeParse(data)
  }

  /**
   * Get validation errors in user-friendly format
   */
  static getValidationErrors(data: unknown): string[] {
    const result = organizationZodSchema.safeParse(data)
    if (result.success) return []

    return result.error.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    )
  }

  /**
   * Validate partial data (for update operations)
   */
  static validatePartial(data: unknown) {
    return organizationUpdateSchema.safeParse(data)
  }

  /**
   * Check if organization type requires specific flags
   */
  static validateTypeAlignment(type: string, is_principal: boolean, is_distributor: boolean): boolean {
    switch (type) {
      case 'principal':
        return is_principal === true
      case 'distributor':
        return is_distributor === true
      case 'customer':
      case 'prospect':
      case 'vendor':
      case 'unknown':
        return is_principal === false && is_distributor === false
      default:
        return false
    }
  }
}

// Main schema export (Zod schema as primary)
export const organizationSchema = organizationZodSchema

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
