import type { Database } from '../lib/database.types'
import * as yup from 'yup'
import type { InteractionWeeklyFilters } from './shared-filters.types'

// Interaction type enum from database - enhanced to match user's spreadsheet data
export type InteractionType = Database['public']['Enums']['interaction_type']

// Priority levels for interactions (A+ highest priority to D lowest)
export type InteractionPriority = 'A+' | 'A' | 'B' | 'C' | 'D'

// Account manager names (based on user's spreadsheet)
export type AccountManager = 'Sue' | 'Gary' | 'Dale' | string

// Principal information structure
export interface PrincipalInfo {
  id: string
  name: string
  // Support for multiple principals as seen in user's data
  principal2?: string
  principal3?: string
  principal4?: string
}

// Base interaction types from database
export type Interaction = Database['public']['Tables']['interactions']['Row']
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert']
export type InteractionUpdate = Database['public']['Tables']['interactions']['Update']

// Enhanced interaction with comprehensive relationships and new fields
export type InteractionWithRelations = Interaction & {
  contact?: Database['public']['Tables']['contacts']['Row'] & {
    dropdown?: string // Additional field from user's spreadsheet
  }
  organization?: Database['public']['Tables']['organizations']['Row'] & {
    formula?: string // Formula field like "Sysco Chicago"
  }
  opportunity: Database['public']['Tables']['opportunities']['Row'] // Required relationship
  
  // New enhanced fields matching user's spreadsheet
  priority?: InteractionPriority
  account_manager?: AccountManager | string
  principals?: PrincipalInfo[]
  import_notes?: string // For data migration notes
}

// Interaction validation schema - Enhanced with user's spreadsheet fields
export const interactionSchema = yup.object({
  // REQUIRED FIELDS per specification
  type: yup
    .string()
    .oneOf(
      [
        'call',
        'email',
        'meeting',
        'demo', 
        'proposal',
        'follow_up',
        'trade_show',
        'site_visit',
        'contract_review',
        // New types matching user's spreadsheet
        'in_person',
        'quoted',
        'distribution',
      ] as const,
      'Invalid interaction type'
    )
    .required('Interaction type is required'),

  interaction_date: yup.string().required('Interaction date is required'),

  subject: yup
    .string()
    .required('Subject is required')
    .max(255, 'Subject must be 255 characters or less'),

  opportunity_id: yup.string().uuid('Invalid opportunity ID').required('Opportunity is required'),

  // OPTIONAL FIELDS per specification
  location: yup.string().max(255, 'Location must be 255 characters or less').nullable(),

  notes: yup.string().max(500, 'Notes must be 500 characters or less').nullable(),

  follow_up_required: yup.boolean().default(false),

  follow_up_date: yup
    .string()
    .nullable()
    .when('follow_up_required', {
      is: true,
      then: (schema) => schema.required('Follow-up date is required when follow-up is needed'),
      otherwise: (schema) => schema.nullable(),
    }),

  // Additional database fields
  duration_minutes: yup.number().min(1, 'Duration must be at least 1 minute').nullable(),

  contact_id: yup.string().uuid('Invalid contact ID').nullable(),

  organization_id: yup.string().uuid('Invalid organization ID').nullable(),

  description: yup.string().max(1000, 'Description must be 1000 characters or less').nullable(),

  outcome: yup
    .string()
    .oneOf(['successful', 'follow_up_needed', 'not_interested', 'postponed', 'no_response'])
    .nullable(),

  follow_up_notes: yup
    .string()
    .max(500, 'Follow-up notes must be 500 characters or less')
    .nullable(),

  // Enhanced fields matching user's spreadsheet
  priority: yup
    .string()
    .oneOf(['A+', 'A', 'B', 'C', 'D'], 'Invalid priority level')
    .nullable(),

  account_manager: yup
    .string()
    .max(100, 'Account manager name must be 100 characters or less')
    .nullable(),

  principals: yup
    .array()
    .of(yup.object({
      id: yup.string().uuid('Invalid principal ID').required(),
      name: yup.string().required('Principal name is required'),
      principal2: yup.string().nullable(),
      principal3: yup.string().nullable(),
      principal4: yup.string().nullable(),
    }))
    .nullable(),

  import_notes: yup
    .string()
    .max(1000, 'Import notes must be 1000 characters or less')
    .nullable(),
})

// Interaction with opportunity creation schema
export const interactionWithOpportunitySchema = yup.object({
  ...interactionSchema.fields,

  // Remove opportunity_id requirement since we're creating it
  opportunity_id: yup.string().uuid('Invalid opportunity ID').nullable(),

  // Opportunity creation fields
  create_opportunity: yup.boolean().default(false),

  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),

  contact_id: yup.string().uuid('Invalid contact ID').nullable(),

  opportunity_name: yup
    .string()
    .max(255, 'Opportunity name must be 255 characters or less')
    .when('create_opportunity', {
      is: true,
      then: (schema) => schema.required('Opportunity name is required when creating opportunity'),
      otherwise: (schema) => schema.nullable(),
    }),

  opportunity_stage: yup
    .string()
    .oneOf(
      [
        'New Lead',
        'Initial Outreach',
        'Sample/Visit Offered',
        'Awaiting Response',
        'Feedback Logged',
        'Demo Scheduled',
        'Closed - Won',
      ] as const,
      'Invalid opportunity stage'
    )
    .when('create_opportunity', {
      is: true,
      then: (schema) => schema.required('Opportunity stage is required when creating opportunity'),
      otherwise: (schema) => schema.nullable(),
    }),

  principal_organization_id: yup.string().uuid('Invalid principal organization ID').nullable(),

  opportunity_context: yup
    .string()
    .oneOf(
      [
        'Site Visit',
        'Food Show',
        'New Product Interest',
        'Follow-up',
        'Demo Request',
        'Sampling',
        'Custom',
      ] as const,
      'Invalid opportunity context'
    )
    .nullable(),
})

// Type inference from validation schemas
export type InteractionFormData = yup.InferType<typeof interactionSchema>
export type InteractionWithOpportunityFormData = yup.InferType<
  typeof interactionWithOpportunitySchema
>

// Interaction filters for queries - enhanced with weekly pattern
export interface InteractionFilters extends InteractionWeeklyFilters {
  // Keep existing filter fields
  organization_id?: string
  contact_id?: string
  opportunity_id?: string
  interaction_date_from?: string
  interaction_date_to?: string
  follow_up_required?: boolean
}

// Enhanced mobile quick templates matching user's spreadsheet data
export const MOBILE_INTERACTION_TEMPLATES = [
  {
    type: 'in_person' as InteractionType,
    subject: 'In-person meeting',
    defaultNotes: 'Met with key decision makers to discuss opportunities',
    priority: 'A' as InteractionPriority,
  },
  {
    type: 'call' as InteractionType,
    subject: 'Follow-up call',
    defaultNotes: 'Discussed product interest and next steps',
    priority: 'B' as InteractionPriority,
  },
  {
    type: 'email' as InteractionType,
    subject: 'Email correspondence',
    defaultNotes: 'Sent product specifications and pricing information',
    priority: 'C' as InteractionPriority,
  },
  {
    type: 'quoted' as InteractionType,
    subject: 'Quote provided',
    defaultNotes: 'Provided pricing quote for requested products',
    priority: 'A' as InteractionPriority,
  },
  {
    type: 'demo' as InteractionType,
    subject: 'Product demonstration',
    defaultNotes: 'Demonstrated product features and benefits',
    priority: 'A' as InteractionPriority,
  },
  {
    type: 'distribution' as InteractionType,
    subject: 'Distribution discussion',
    defaultNotes: 'Discussed distribution strategy and logistics',
    priority: 'B' as InteractionPriority,
  },
  {
    type: 'meeting' as InteractionType,
    subject: 'Meeting scheduled',
    defaultNotes: 'Scheduled follow-up meeting to advance opportunity',
    priority: 'B' as InteractionPriority,
  },
] as const

export type MobileInteractionTemplate = (typeof MOBILE_INTERACTION_TEMPLATES)[number]

// Priority color mapping for UI components using semantic tokens
export const PRIORITY_COLORS = {
  'A+': {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    badge: 'bg-destructive text-destructive-foreground',
  },
  'A': {
    bg: 'bg-orange-50', 
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-500 text-white',
  },
  'B': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700', 
    border: 'border-yellow-200',
    badge: 'bg-yellow-500 text-white',
  },
  'C': {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20', 
    badge: 'bg-primary text-primary-foreground',
  },
  'D': {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-muted-foreground/20',
    badge: 'bg-muted text-muted-foreground',
  },
} as const

// Account manager list (can be expanded as needed)
export const ACCOUNT_MANAGERS = [
  'Sue',
  'Gary', 
  'Dale',
] as const
