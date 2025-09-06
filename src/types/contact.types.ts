import type { Database } from '../lib/database.types'
import * as yup from 'yup'
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

// Contact validation schema - aligned with database schema
export const contactSchema = yup.object({
  // REQUIRED FIELDS
  first_name: yup
    .string()
    .required('First name is required')
    .max(100, 'First name must be 100 characters or less'),

  last_name: yup
    .string()
    .required('Last name is required')
    .max(100, 'Last name must be 100 characters or less'),

  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .nullable()
    .transform(FormTransforms.nullableString),

  purchase_influence: yup
    .string()
    .oneOf(['High', 'Medium', 'Low', 'Unknown'] as const, 'Invalid purchase influence level')
    .required('Purchase influence is required')
    .default('Unknown'),

  decision_authority: yup
    .string()
    .oneOf(
      ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper'] as const,
      'Invalid decision authority role'
    )
    .required('Decision authority is required')
    .default('Gatekeeper'),

  // Database field is 'role' with enum values
  role: yup
    .string()
    .oneOf(
      ['decision_maker', 'influencer', 'buyer', 'end_user', 'gatekeeper', 'champion'] as const,
      'Invalid role'
    )
    .nullable()
    .transform(FormTransforms.nullableString),

  // OPTIONAL FIELDS - Database schema aligned with transforms
  email: yup
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableEmail),

  title: yup
    .string()
    .max(100, 'Title must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  department: yup
    .string()
    .max(100, 'Department must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  phone: yup
    .string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  mobile_phone: yup
    .string()
    .max(50, 'Mobile phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  linkedin_url: yup
    .string()
    .url('Invalid LinkedIn URL')
    .max(500, 'LinkedIn URL must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableUrl),

  is_primary_contact: yup.boolean().nullable().default(false),

  notes: yup
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  // VIRTUAL FIELDS for form handling (not persisted to database)
  preferred_principals: yup
    .array()
    .of(yup.string().uuid('Invalid principal organization ID'))
    .default([])
    .transform(FormTransforms.optionalArray),

  // ORGANIZATION MODE FIELDS for new organization creation
  organization_mode: yup
    .string()
    .oneOf(['existing', 'new'] as const, 'Invalid organization mode')
    .default('existing'),

  organization_name: yup
    .string()
    .max(255, 'Organization name must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString)
    .when('organization_mode', {
      is: 'new',
      then: (schema) => schema.required('Organization name is required when creating a new organization'),
    }),

  organization_type: yup
    .string()
    .oneOf(
      ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const,
      'Invalid organization type'
    )
    .nullable()
    .transform(FormTransforms.nullableString)
    .when('organization_mode', {
      is: 'new',
      then: (schema) => schema.required('Organization type is required when creating a new organization'),
    }),

  organization_phone: yup
    .string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable()
    .transform(FormTransforms.nullablePhone),

  organization_email: yup
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .nullable()
    .transform(FormTransforms.nullableEmail),

  organization_website: yup
    .string()
    .url('Invalid website URL')
    .max(500, 'Website must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableUrl),

  organization_notes: yup
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),
})

// Type inference from validation schema
export type ContactFormData = yup.InferType<typeof contactSchema>

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
