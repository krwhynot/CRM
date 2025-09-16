import { z } from 'zod'
import { ZodTransforms } from '@/lib/form-transforms'
import type { Database } from '../lib/database.types'

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

// Contact form data types - now use Zod schemas from contact.zod.ts

// Gradual migration: Import and re-export Zod schemas for new implementations
export {
  contactZodSchema,
  contactCreateSchema,
  contactUpdateSchema,
  contactWithPreferredPrincipalsSchema,
  ContactZodValidation,
  CONTACT_VALIDATION_CONSTANTS,
  PurchaseInfluenceEnum,
  DecisionAuthorityEnum,
  ContactRoleEnum,
  OrganizationTypeEnum,
} from './contact.zod'
export type {
  ContactZodFormData,
  ContactCreateFormData,
  ContactUpdateFormData,
  ContactWithPreferredPrincipalsFormData,
  ExistingOrganizationContactFormData,
  NewOrganizationContactFormData,
} from './contact.zod'

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

// Contact Preferred Principal Schema
export const contactPreferredPrincipalZodSchema = z.object({
  contact_id: z.string().uuid('Invalid contact ID'),
  principal_organization_id: z.string().uuid('Invalid principal organization ID'),
  advocacy_strength: ZodTransforms.nullableNumber.refine(
    (val) => val === null || (val >= 1 && val <= 10),
    { message: 'Advocacy strength must be between 1-10' }
  ),
  relationship_type: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= 100,
    { message: 'Relationship type must be 100 characters or less' }
  ),
  advocacy_notes: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= 500,
    { message: 'Advocacy notes must be 500 characters or less' }
  ),
})

export type ContactPreferredPrincipalFormData = z.infer<typeof contactPreferredPrincipalZodSchema>
