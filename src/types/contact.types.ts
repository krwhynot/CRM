import type { Database } from '../lib/database.types'
import * as yup from 'yup'

// Principal CRM Business Logic Types
export type PurchaseInfluenceLevel = 'High' | 'Medium' | 'Low' | 'Unknown'
export type DecisionAuthorityRole = 'Decision Maker' | 'Influencer' | 'End User' | 'Gatekeeper'

// Database enum type
export type ContactRole = Database['public']['Enums']['contact_role']

// Mapping between business logic and database enum
export const DECISION_AUTHORITY_TO_ROLE_MAPPING: Record<DecisionAuthorityRole, ContactRole> = {
  'Decision Maker': 'decision_maker',
  'Influencer': 'influencer', 
  'End User': 'end_user',
  'Gatekeeper': 'gatekeeper'
}

// Helper function to map decision authority to database role
export function mapDecisionAuthorityToRole(decisionAuthority: DecisionAuthorityRole): ContactRole {
  return DECISION_AUTHORITY_TO_ROLE_MAPPING[decisionAuthority]
}

// Database constraint validation helpers
export const VALID_PURCHASE_INFLUENCE_VALUES: PurchaseInfluenceLevel[] = ['High', 'Medium', 'Low', 'Unknown']
export const VALID_DECISION_AUTHORITY_VALUES: DecisionAuthorityRole[] = ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper']

// Runtime validation functions
export function isValidPurchaseInfluence(value: string): value is PurchaseInfluenceLevel {
  return VALID_PURCHASE_INFLUENCE_VALUES.includes(value as PurchaseInfluenceLevel)
}

export function isValidDecisionAuthority(value: string): value is DecisionAuthorityRole {
  return VALID_DECISION_AUTHORITY_VALUES.includes(value as DecisionAuthorityRole)
}

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
    .default('End User'),

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
  role?: Database['public']['Enums']['contact_role'] | Database['public']['Enums']['contact_role'][]
  is_primary_contact?: boolean
  search?: string
}