/**
 * Contact Zod Validation Schema
 *
 * Zod equivalent of contact.types.ts Yup schemas with enhanced TypeScript integration.
 * Implements discriminated union pattern for organization creation mode logic.
 *
 * Features:
 * - Discriminated union for 'existing' vs 'new' organization modes
 * - Complete type inference with z.infer<typeof schema>
 * - ZodTransforms integration for nullable field handling
 * - Preferred principal relationships with UUID array validation
 * - Cross-entity validation support for organization creation
 * - Transform parity with existing Yup FormTransforms
 */

import { z } from 'zod'
import { ZodTransforms } from '../lib/form-transforms'

// Contact business logic types
export const PurchaseInfluenceEnum = z.enum(['High', 'Medium', 'Low', 'Unknown'] as const)
export const DecisionAuthorityEnum = z.enum([
  'Decision Maker',
  'Influencer',
  'End User',
  'Gatekeeper',
] as const)
export const ContactRoleEnum = z.enum([
  'decision_maker',
  'influencer',
  'buyer',
  'end_user',
  'gatekeeper',
  'champion',
] as const)

// Organization types for organization creation mode
export const OrganizationTypeEnum = z.enum([
  'customer',
  'principal',
  'distributor',
  'prospect',
  'vendor',
] as const)

// Validation constants for contact fields
export const CONTACT_VALIDATION_CONSTANTS = {
  first_name: { max: 100 },
  last_name: { max: 100 },
  email: { max: 255 },
  title: { max: 100 },
  department: { max: 100 },
  phone: { max: 50 },
  mobile_phone: { max: 50 },
  linkedin_url: { max: 500 },
  notes: { max: 500 },
  organization_name: { max: 255 },
  organization_email: { max: 255 },
  organization_phone: { max: 50 },
  organization_website: { max: 500 },
  organization_notes: { max: 500 },
} as const

/**
 * Base Contact Schema
 * Core fields that are common to all contact variations
 */
export const contactBaseSchema = z.object({
  // REQUIRED FIELDS
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(CONTACT_VALIDATION_CONSTANTS.first_name.max, 'First name must be 100 characters or less'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(CONTACT_VALIDATION_CONSTANTS.last_name.max, 'Last name must be 100 characters or less'),

  purchase_influence: PurchaseInfluenceEnum.default('Unknown').describe(
    'Purchase influence level is required'
  ),

  decision_authority: DecisionAuthorityEnum.default('Gatekeeper').describe(
    'Decision authority role is required'
  ),

  // OPTIONAL CORE FIELDS with ZodTransforms
  role: ContactRoleEnum.nullable()
    .optional()
    .transform((val) => val || null),

  email: ZodTransforms.nullableEmail.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.email.max,
    {
      message: 'Email must be 255 characters or less',
    }
  ),

  title: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.title.max,
    {
      message: 'Title must be 100 characters or less',
    }
  ),

  department: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.department.max,
    {
      message: 'Department must be 100 characters or less',
    }
  ),

  phone: ZodTransforms.nullablePhone.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.phone.max,
    {
      message: 'Phone must be 50 characters or less',
    }
  ),

  mobile_phone: ZodTransforms.nullablePhone.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.mobile_phone.max,
    {
      message: 'Mobile phone must be 50 characters or less',
    }
  ),

  linkedin_url: ZodTransforms.nullableUrl.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.linkedin_url.max,
    {
      message: 'LinkedIn URL must be 500 characters or less',
    }
  ),

  is_primary_contact: z.boolean().nullable().default(false),

  notes: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.notes.max,
    {
      message: 'Notes must be 500 characters or less',
    }
  ),

  // VIRTUAL FIELDS for form handling (not persisted to database)
  preferred_principals: z
    .array(z.string().uuid('Invalid principal organization ID'))
    .default([])
    .transform((arr) => arr.filter((id) => id !== undefined)),
})

/**
 * Existing Organization Contact Schema
 * For contacts linking to existing organizations
 */
const existingOrganizationContactSchema = contactBaseSchema.extend({
  organization_mode: z.literal('existing').default('existing'),

  organization_id: ZodTransforms.uuidField.refine((val) => val !== null, {
    message: 'Organization is required when using existing organization',
  }),

  // Organization creation fields should be null/optional in existing mode
  organization_name: z.string().nullable().default(null),
  organization_type: OrganizationTypeEnum.nullable().default(null),
  organization_phone: z.string().nullable().default(null),
  organization_email: z.string().nullable().default(null),
  organization_website: z.string().nullable().default(null),
  organization_notes: z.string().nullable().default(null),
})

/**
 * New Organization Contact Schema
 * For contacts that create new organizations during contact creation
 */
const newOrganizationContactSchema = contactBaseSchema.extend({
  organization_mode: z.literal('new'),

  // organization_id is nullable when creating new org
  organization_id: ZodTransforms.uuidField.default(null),

  // Organization creation fields are required in new mode
  organization_name: z
    .string()
    .min(1, 'Organization name is required when creating a new organization')
    .max(
      CONTACT_VALIDATION_CONSTANTS.organization_name.max,
      'Organization name must be 255 characters or less'
    ),

  organization_type: OrganizationTypeEnum.describe(
    'Organization type is required when creating a new organization'
  ),

  // Optional organization fields for new mode
  organization_phone: ZodTransforms.nullablePhone.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.organization_phone.max,
    {
      message: 'Phone must be 50 characters or less',
    }
  ),

  organization_email: ZodTransforms.nullableEmail.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.organization_email.max,
    {
      message: 'Email must be 255 characters or less',
    }
  ),

  organization_website: ZodTransforms.nullableUrl.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.organization_website.max,
    {
      message: 'Website must be 500 characters or less',
    }
  ),

  organization_notes: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= CONTACT_VALIDATION_CONSTANTS.organization_notes.max,
    {
      message: 'Notes must be 500 characters or less',
    }
  ),
})

/**
 * Main Contact Schema using Discriminated Union
 * Handles conditional validation based on organization_mode
 */
export const contactZodSchema = z.discriminatedUnion('organization_mode', [
  existingOrganizationContactSchema,
  newOrganizationContactSchema,
])

/**
 * Contact Create Schema
 * For creating new contacts (excludes auto-generated fields)
 */
export const contactCreateSchema = contactZodSchema

/**
 * Contact Update Schema
 * For updating existing contacts (all fields optional except core identifiers)
 */
export const contactUpdateSchema = contactBaseSchema.partial()

/**
 * Contact with Preferred Principals Schema
 * Specialized schema for handling preferred principal relationships
 */
export const contactWithPreferredPrincipalsSchema = z.discriminatedUnion('organization_mode', [
  existingOrganizationContactSchema.extend({
    preferred_principals: z
      .array(z.string().uuid('Invalid principal organization ID'))
      .min(1, 'At least one preferred principal is required')
      .max(10, 'Maximum 10 preferred principals allowed')
      .transform((arr) => arr.filter((id) => id !== undefined)),
  }),
  newOrganizationContactSchema.extend({
    preferred_principals: z
      .array(z.string().uuid('Invalid principal organization ID'))
      .min(1, 'At least one preferred principal is required')
      .max(10, 'Maximum 10 preferred principals allowed')
      .transform((arr) => arr.filter((id) => id !== undefined)),
  }),
])

/**
 * TypeScript Type Inference from Zod Schemas
 * Equivalent to z.infer<typeof contactSchema>
 */
export type ContactZodFormData = z.infer<typeof contactZodSchema>
export type ContactCreateFormData = z.infer<typeof contactCreateSchema>
export type ContactUpdateFormData = z.infer<typeof contactUpdateSchema>
export type ContactWithPreferredPrincipalsFormData = z.infer<
  typeof contactWithPreferredPrincipalsSchema
>

// Specific type exports for discriminated union cases
export type ExistingOrganizationContactFormData = z.infer<typeof existingOrganizationContactSchema>
export type NewOrganizationContactFormData = z.infer<typeof newOrganizationContactSchema>

/**
 * Contact Validation Class
 * Static methods for contact validation following OrganizationZodValidation pattern
 */
export class ContactZodValidation {
  /**
   * Validate contact data against main schema
   */
  static validate(data: unknown): ContactZodFormData {
    const result = contactZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Contact validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate contact create data
   */
  static validateCreate(data: unknown): ContactCreateFormData {
    const result = contactCreateSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Contact create validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate contact update data
   */
  static validateUpdate(data: unknown): ContactUpdateFormData {
    const result = contactUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Contact update validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Safe validation with detailed error information
   */
  static safeParse(data: unknown) {
    return contactZodSchema.safeParse(data)
  }

  /**
   * Get validation errors in user-friendly format
   */
  static getValidationErrors(data: unknown): string[] {
    const result = contactZodSchema.safeParse(data)
    if (result.success) return []

    return result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
  }

  /**
   * Validate partial data (for update operations)
   */
  static validatePartial(data: unknown) {
    return contactUpdateSchema.safeParse(data)
  }

  /**
   * Validate organization mode logic
   * Ensures proper field requirements based on organization_mode
   */
  static validateOrganizationMode(
    mode: string,
    organizationId?: string | null,
    organizationName?: string | null
  ): boolean {
    switch (mode) {
      case 'existing':
        return !!organizationId // Must have organization_id
      case 'new':
        return !!organizationName // Must have organization_name
      default:
        return false
    }
  }

  /**
   * Validate preferred principals array
   * Ensures UUIDs are valid and within limits
   */
  static validatePreferredPrincipals(principals: unknown[]): boolean {
    if (!Array.isArray(principals)) return false
    if (principals.length > 10) return false

    return principals.every(
      (id) =>
        typeof id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    )
  }

  /**
   * Transform for handling form data to database format
   * Removes virtual fields and prepares for database insertion
   */
  static transformForDatabase(
    formData: ContactZodFormData
  ): Omit<
    ContactZodFormData,
    | 'preferred_principals'
    | 'organization_mode'
    | 'organization_name'
    | 'organization_type'
    | 'organization_phone'
    | 'organization_email'
    | 'organization_website'
    | 'organization_notes'
  > {
    const {
      preferred_principals,
      organization_mode,
      organization_name,
      organization_type,
      organization_phone,
      organization_email,
      organization_website,
      organization_notes,
      ...contactData
    } = formData

    return contactData
  }

  /**
   * Extract organization data from new organization contact
   * For creating organization records when mode is 'new'
   */
  static extractOrganizationData(formData: NewOrganizationContactFormData) {
    return {
      name: formData.organization_name,
      type: formData.organization_type,
      phone: formData.organization_phone,
      email: formData.organization_email,
      website: formData.organization_website,
      notes: formData.organization_notes,
      // Set defaults for required fields
      priority: 'C' as const,
      segment: 'Unknown',
      is_principal: false,
      is_distributor: false,
    }
  }
}

// Default export for main schema
export default contactZodSchema
