import type { Database } from '../lib/database.types'
import * as yup from 'yup'

// Interaction type enum from database
export type InteractionType = Database['public']['Enums']['interaction_type']

// Base interaction types from database
export type Interaction = Database['public']['Tables']['interactions']['Row']
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert']
export type InteractionUpdate = Database['public']['Tables']['interactions']['Update']

// Interaction with relationships
export type InteractionWithRelations = Interaction & {
  contact?: Database['public']['Tables']['contacts']['Row']
  organization?: Database['public']['Tables']['organizations']['Row']
  opportunity: Database['public']['Tables']['opportunities']['Row'] // Required relationship
}

// Interaction validation schema - ONLY specification fields
export const interactionSchema = yup.object({
  // REQUIRED FIELDS per specification
  type: yup.string()
    .oneOf([
      'call',
      'email',
      'meeting',
      'demo',
      'proposal',
      'follow_up',
      'trade_show',
      'site_visit',
      'contract_review'
    ] as const, 'Invalid interaction type')
    .required('Interaction type is required'),
  
  interaction_date: yup.string()
    .required('Interaction date is required'),
  
  subject: yup.string()
    .required('Subject is required')
    .max(255, 'Subject must be 255 characters or less'),
  
  opportunity_id: yup.string()
    .uuid('Invalid opportunity ID')
    .required('Opportunity is required'),

  // OPTIONAL FIELDS per specification
  location: yup.string()
    .max(255, 'Location must be 255 characters or less')
    .nullable(),
  
  description: yup.string()
    .max(500, 'Description must be 500 characters or less')
    .nullable(),
  
  follow_up_required: yup.boolean()
    .default(false),
  
  follow_up_date: yup.string()
    .nullable()
    .when('follow_up_required', {
      is: true,
      then: (schema) => schema.required('Follow-up date is required when follow-up is needed'),
      otherwise: (schema) => schema.nullable()
    })
})

// Interaction with opportunity creation schema - rebuilt to avoid field conflicts
export const interactionWithOpportunitySchema = yup.object({
  // Base interaction fields
  type: yup.string()
    .oneOf([
      'call',
      'email',
      'meeting',
      'demo',
      'proposal',
      'follow_up',
      'trade_show',
      'site_visit',
      'contract_review'
    ] as const, 'Invalid interaction type')
    .required('Interaction type is required'),
  
  interaction_date: yup.string()
    .required('Interaction date is required'),
  
  subject: yup.string()
    .required('Subject is required')
    .max(255, 'Subject must be 255 characters or less'),
  
  location: yup.string()
    .max(255, 'Location must be 255 characters or less')
    .nullable(),
  
  description: yup.string()
    .max(500, 'Description must be 500 characters or less')
    .nullable(),
  
  follow_up_required: yup.boolean()
    .default(false),
  
  follow_up_date: yup.string()
    .nullable()
    .when('follow_up_required', {
      is: true,
      then: (schema) => schema.required('Follow-up date is required when follow-up is needed'),
      otherwise: (schema) => schema.nullable()
    }),
  
  // Opportunity ID is nullable since we're creating the opportunity
  opportunity_id: yup.string()
    .uuid('Invalid opportunity ID')
    .nullable(),
  
  // Opportunity creation fields
  create_opportunity: yup.boolean()
    .default(false),
  
  organization_id: yup.string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),
  
  contact_id: yup.string()
    .uuid('Invalid contact ID')
    .nullable(),
  
  opportunity_name: yup.string()
    .max(255, 'Opportunity name must be 255 characters or less')
    .when('create_opportunity', {
      is: true,
      then: (schema) => schema.required('Opportunity name is required when creating opportunity'),
      otherwise: (schema) => schema.nullable()
    }),
  
  opportunity_stage: yup.string()
    .oneOf([
      'New Lead',
      'Initial Outreach', 
      'Sample/Visit Offered',
      'Awaiting Response',
      'Feedback Logged',
      'Demo Scheduled',
      'Closed - Won',
      'Closed - Lost'
    ] as const, 'Invalid opportunity stage')
    .when('create_opportunity', {
      is: true,
      then: (schema) => schema.required('Opportunity stage is required when creating opportunity'),
      otherwise: (schema) => schema.nullable()
    }),
  
  principal_organization_id: yup.string()
    .uuid('Invalid principal organization ID')
    .nullable(),
  
  opportunity_context: yup.string()
    .oneOf([
      'Site Visit',
      'Food Show', 
      'New Product Interest',
      'Follow-up',
      'Demo Request',
      'Sampling',
      'Custom'
    ] as const, 'Invalid opportunity context')
    .nullable()
})

// Type inference from validation schemas
export type InteractionFormData = yup.InferType<typeof interactionSchema>
export type InteractionWithOpportunityFormData = yup.InferType<typeof interactionWithOpportunitySchema>

// Interaction filters for queries
export interface InteractionFilters {
  type?: InteractionType | InteractionType[]
  organization_id?: string
  contact_id?: string
  opportunity_id?: string
  interaction_date_from?: string
  interaction_date_to?: string
  follow_up_required?: boolean
}

// Mobile quick templates for efficient field entry
export const MOBILE_INTERACTION_TEMPLATES = [
  {
    type: 'call' as InteractionType,
    subject: 'Follow-up call',
    defaultNotes: 'Discussed product interest and next steps'
  },
  {
    type: 'email' as InteractionType,
    subject: 'Product information sent',
    defaultNotes: 'Sent product specifications and pricing'
  },
  {
    type: 'site_visit' as InteractionType,
    subject: 'Site visit completed',
    defaultNotes: 'Toured facility and met with decision makers'
  },
  {
    type: 'demo' as InteractionType,
    subject: 'Product demonstration',
    defaultNotes: 'Demonstrated product features and benefits'
  },
  {
    type: 'follow_up' as InteractionType,
    subject: 'Follow-up contact',
    defaultNotes: 'Checked on progress and answered questions'
  }
] as const

export type MobileInteractionTemplate = typeof MOBILE_INTERACTION_TEMPLATES[number]