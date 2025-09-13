import type { Database } from '../lib/database.types'
import { z } from 'zod'
import { FormTransforms } from '../lib/form-transforms'

// Principal CRM Business Logic Types
export type PurchaseInfluenceLevel = 'High' | 'Medium' | 'Low' | 'Unknown'
export type DecisionAuthorityRole = 'Decision Maker' | 'Influencer' | 'End User' | 'Gatekeeper'

// Contact role types from database enum
export type ContactRole =
  | 'decision_maker'
  | 'influencer'
  | 'buyer'
  | 'end_user'
  | 'gatekeeper'
  | 'champion'

// Predefined role options for dropdown
export const CONTACT_ROLES: { value: ContactRole; label: string }[] = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'end_user', label: 'End User' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'champion', label: 'Champion' },
] as const

// Base contact types from database
export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

// Contact with organization relationship
export type ContactWithOrganization = Contact & {
  organization?: Database['public']['Tables']['organizations']['Row']
}

// Contact with preferred principals
export type ContactWithPreferredPrincipals = Contact & {
  preferred_principals?: Database['public']['Tables']['contact_preferred_principals']['Row'][]
}

// Complete contact with all relationships
export type ContactWithRelations = Contact & {
  organization?: Database['public']['Tables']['organizations']['Row']
  preferred_principals?: Database['public']['Tables']['contact_preferred_principals']['Row'][]
}

// Base contact schema for common fields
const baseContactSchema = z.object({
  // REQUIRED FIELDS
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less'),

  organization_id: z
    .string()
    .uuid('Invalid organization ID')
    .nullable()
    .transform(FormTransforms.nullableString),

  purchase_influence: z
    .enum(['High', 'Medium', 'Low', 'Unknown'], {
      errorMap: () => ({ message: 'Invalid purchase influence level' })
    })
    .default('Unknown'),

  decision_authority: z
    .enum(['Decision Maker', 'Influencer', 'End User', 'Gatekeeper'], {
      errorMap: () => ({ message: 'Invalid decision authority role' })
    })
    .default('Gatekeeper'),

  // Database field is 'role' with enum values
  role: z
    .enum(['decision_maker', 'influencer', 'buyer', 'end_user', 'gatekeeper', 'champion'], {
      errorMap: () => ({ message: 'Invalid role' })
    })
    .nullable()
    .transform(FormTransforms.nullableString),

  // OPTIONAL FIELDS - Database schema aligned with transforms
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableEmail),

  title: z
    .string()
    .max(100, 'Title must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  department: z
    .string()
    .max(100, 'Department must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  phone: z
    .string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  mobile_phone: z
    .string()
    .max(50, 'Mobile phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  linkedin_url: z
    .string()
    .url('Invalid LinkedIn URL')
    .max(500, 'LinkedIn URL must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableUrl),

  is_primary_contact: z.boolean().nullable().default(false),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  // VIRTUAL FIELDS for form handling (not persisted to database)
  preferred_principals: z
    .array(z.string().uuid('Invalid principal organization ID'))
    .default([])
    .transform(FormTransforms.optionalArray),

  // Organization contact fields (always optional)
  organization_phone: z
    .string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  organization_email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableEmail),

  organization_website: z
    .string()
    .url('Invalid website URL')
    .max(500, 'Website must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableUrl),

  organization_notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),
});

// Contact validation schema with discriminated union for organization mode
export const contactSchema = z.discriminatedUnion('organization_mode', [
  // Existing organization mode
  baseContactSchema.extend({
    organization_mode: z.literal('existing'),
    organization_name: z
      .string()
      .max(255, 'Organization name must be 255 characters or less')
      .nullable()
      .transform(FormTransforms.nullableString)
      .optional(),
    organization_type: z
      .enum(['customer', 'principal', 'distributor', 'prospect', 'vendor'], {
        errorMap: () => ({ message: 'Invalid organization type' })
      })
      .nullable()
      .transform(FormTransforms.nullableString)
      .optional(),
  }),
  // New organization mode
  baseContactSchema.extend({
    organization_mode: z.literal('new'),
    organization_name: z
      .string()
      .min(1, 'Organization name is required when creating a new organization')
      .max(255, 'Organization name must be 255 characters or less')
      .transform(FormTransforms.nullableString),
    organization_type: z
      .enum(['customer', 'principal', 'distributor', 'prospect', 'vendor'], {
        errorMap: () => ({ message: 'Invalid organization type' })
      })
      .transform(FormTransforms.nullableString),
  }),
]).default({ organization_mode: 'existing' })

// Type inference from validation schema
export type ContactFormData = z.infer<typeof contactSchema>

// Contact filters for queries
export interface ContactFilters {
  organization_id?: string
  purchase_influence?: PurchaseInfluenceLevel | PurchaseInfluenceLevel[]
  decision_authority?: DecisionAuthorityRole | DecisionAuthorityRole[]
  role?: ContactRole | ContactRole[]
  is_primary_contact?: boolean
  search?: string
}

// Utility functions for role handling
export const getDisplayRole = (contact: Contact): string => {
  // Get the role display label from the contact
  if (contact.role) {
    const roleOption = CONTACT_ROLES.find((r) => r.value === contact.role)
    return roleOption?.label || contact.role
  }
  // Fall back to title field for backward compatibility
  return contact.title || 'Unknown'
}

export const getRoleLabel = (role: ContactRole): string => {
  const roleOption = CONTACT_ROLES.find((r) => r.value === role)
  return roleOption?.label || role
}

export const getRoleValue = (label: string): ContactRole | undefined => {
  const roleOption = CONTACT_ROLES.find((r) => r.label === label)
  return roleOption?.value
}
