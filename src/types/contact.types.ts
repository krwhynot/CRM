import type { Database } from '../lib/database.types'
import * as yup from 'yup'

// Principal CRM Business Logic Types
export type PurchaseInfluenceLevel = 'High' | 'Medium' | 'Low' | 'Unknown'
export type DecisionAuthorityRole = 'Decision Maker' | 'Influencer' | 'End User' | 'Gatekeeper'

// Position types for food service industry contacts
export type ContactPosition = 
  | 'Executive Chef'
  | 'Manager' 
  | 'Buyer'
  | 'Owner'
  | 'Custom'

// Predefined position options for dropdown
export const CONTACT_POSITIONS: ContactPosition[] = [
  'Executive Chef',
  'Manager',
  'Buyer', 
  'Owner'
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
  first_name: yup.string()
    .required('First name is required')
    .max(100, 'First name must be 100 characters or less'),
  
  last_name: yup.string()
    .required('Last name is required')
    .max(100, 'Last name must be 100 characters or less'),
  
  organization_id: yup.string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),
  
  purchase_influence: yup.string()
    .oneOf(['High', 'Medium', 'Low', 'Unknown'] as const, 'Invalid purchase influence level')
    .required('Purchase influence is required')
    .default('Unknown'),
  
  decision_authority: yup.string()
    .oneOf(['Decision Maker', 'Influencer', 'End User', 'Gatekeeper'] as const, 'Invalid decision authority role')
    .required('Decision authority is required')
    .default('Gatekeeper'),

  position: yup.string()
    .required('Position is required')
    .max(100, 'Position must be 100 characters or less'),

  // For custom positions when "Custom" is selected
  custom_position: yup.string()
    .max(100, 'Custom position must be 100 characters or less')
    .nullable()
    .when('position', {
      is: 'Custom',
      then: (schema) => schema.required('Custom position is required when "Custom" is selected'),
      otherwise: (schema) => schema.nullable()
    }),

  // OPTIONAL FIELDS - Database schema aligned
  email: yup.string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .nullable(),
  
  title: yup.string()
    .max(100, 'Title must be 100 characters or less')
    .nullable(),
  
  department: yup.string()
    .max(100, 'Department must be 100 characters or less')
    .nullable(),
  
  phone: yup.string()
    .max(50, 'Phone must be 50 characters or less')
    .nullable(),
  
  mobile_phone: yup.string()
    .max(50, 'Mobile phone must be 50 characters or less')
    .nullable(),
  
  linkedin_url: yup.string()
    .url('Invalid LinkedIn URL')
    .max(500, 'LinkedIn URL must be 500 characters or less')
    .nullable(),
  
  is_primary_contact: yup.boolean()
    .nullable(),
  
  notes: yup.string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable(),

  // VIRTUAL FIELDS for form handling (not persisted to database)
  preferred_principals: yup.array()
    .of(yup.string().uuid('Invalid principal organization ID'))
    .nullable()
})

// Type inference from validation schema
export type ContactFormData = yup.InferType<typeof contactSchema>

// Contact filters for queries
export interface ContactFilters {
  organization_id?: string
  purchase_influence?: PurchaseInfluenceLevel | PurchaseInfluenceLevel[]
  decision_authority?: DecisionAuthorityRole | DecisionAuthorityRole[]
  position?: string | string[]
  search?: string
}

// Utility functions for position handling
export const getDisplayPosition = (contact: Contact): string => {
  // If the contact has a position field in the database, use it
  // Otherwise, fall back to the title field for backward compatibility
  return contact.position || contact.title || 'Unknown'
}

export const isCustomPosition = (position: string): boolean => {
  return !CONTACT_POSITIONS.includes(position as ContactPosition)
}

export const getPositionValue = (formData: ContactFormData): string => {
  return formData.position === 'Custom' ? formData.custom_position || '' : formData.position
}