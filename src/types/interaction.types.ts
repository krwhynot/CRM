import type { Database } from '../lib/database.types'
import { z } from 'zod'
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

// Base interaction schema without refinements - for extending
const baseInteractionSchema = z.object({
  // REQUIRED FIELDS per specification
  type: z.enum(
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
    ],
    {
      required_error: 'Interaction type is required',
      invalid_type_error: 'Invalid interaction type',
    }
  ),

  interaction_date: z.string().min(1, 'Interaction date is required'),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(255, 'Subject must be 255 characters or less'),

  opportunity_id: z.string().uuid('Invalid opportunity ID'),

  // OPTIONAL FIELDS per specification
  location: z
    .string()
    .max(255, 'Location must be 255 characters or less')
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .optional(),

  follow_up_required: z.boolean().default(false),

  follow_up_date: z
    .string()
    .nullable()
    .optional(),

  // Additional database fields
  duration_minutes: z
    .number()
    .min(1, 'Duration must be at least 1 minute')
    .nullable()
    .optional(),

  contact_id: z.string().uuid('Invalid contact ID').nullable().optional(),

  organization_id: z.string().uuid('Invalid organization ID').nullable().optional(),

  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .nullable()
    .optional(),

  outcome: z
    .enum(['successful', 'follow_up_needed', 'not_interested', 'postponed', 'no_response'])
    .nullable()
    .optional(),

  follow_up_notes: z
    .string()
    .max(500, 'Follow-up notes must be 500 characters or less')
    .nullable()
    .optional(),

  // Enhanced fields matching user's spreadsheet
  priority: z
    .enum(['A+', 'A', 'B', 'C', 'D'], {
      invalid_type_error: 'Invalid priority level',
    })
    .nullable()
    .optional(),

  account_manager: z
    .string()
    .max(100, 'Account manager name must be 100 characters or less')
    .nullable()
    .optional(),

  principals: z
    .array(
      z.object({
        id: z.string().uuid('Invalid principal ID'),
        name: z.string().min(1, 'Principal name is required'),
        principal2: z.string().nullable().optional(),
        principal3: z.string().nullable().optional(),
        principal4: z.string().nullable().optional(),
      })
    )
    .nullable()
    .optional(),

  import_notes: z
    .string()
    .max(1000, 'Import notes must be 1000 characters or less')
    .nullable()
    .optional(),
})

// Interaction validation schema - Enhanced with user's spreadsheet fields
export const interactionSchema = baseInteractionSchema.refine((data) => {
  // Follow-up conditional validation: if follow_up_required is true, follow_up_date is required
  if (data.follow_up_required && (!data.follow_up_date || data.follow_up_date === null)) {
    return false
  }
  return true
}, {
  message: 'Follow-up date is required when follow-up is needed',
  path: ['follow_up_date'],
})

// Interaction with opportunity creation schema
export const interactionWithOpportunitySchema = baseInteractionSchema.extend({
  // Remove opportunity_id requirement since we're creating it
  opportunity_id: z.string().uuid('Invalid opportunity ID').nullable().optional(),

  // Opportunity creation fields
  create_opportunity: z.boolean().default(false),

  organization_id: z.string().uuid('Invalid organization ID'),

  contact_id: z.string().uuid('Invalid contact ID').nullable().optional(),

  opportunity_name: z
    .string()
    .max(255, 'Opportunity name must be 255 characters or less')
    .nullable()
    .optional(),

  opportunity_stage: z
    .enum(
      [
        'New Lead',
        'Initial Outreach',
        'Sample/Visit Offered',
        'Awaiting Response',
        'Feedback Logged',
        'Demo Scheduled',
        'Closed - Won',
      ],
      {
        invalid_type_error: 'Invalid opportunity stage',
      }
    )
    .nullable()
    .optional(),

  principal_organization_id: z.string().uuid('Invalid principal organization ID').nullable().optional(),

  opportunity_context: z
    .enum(
      [
        'Site Visit',
        'Food Show',
        'New Product Interest',
        'Follow-up',
        'Demo Request',
        'Sampling',
        'Custom',
      ],
      {
        invalid_type_error: 'Invalid opportunity context',
      }
    )
    .nullable()
    .optional(),
}).refine((data) => {
  // Follow-up conditional validation: if follow_up_required is true, follow_up_date is required
  if (data.follow_up_required && (!data.follow_up_date || data.follow_up_date === null)) {
    return false
  }
  return true
}, {
  message: 'Follow-up date is required when follow-up is needed',
  path: ['follow_up_date'],
}).refine((data) => {
  // Opportunity creation validation: if create_opportunity is true, opportunity_name is required
  if (data.create_opportunity && (!data.opportunity_name || data.opportunity_name === null)) {
    return false
  }
  return true
}, {
  message: 'Opportunity name is required when creating opportunity',
  path: ['opportunity_name'],
}).refine((data) => {
  // Opportunity creation validation: if create_opportunity is true, opportunity_stage is required
  if (data.create_opportunity && (!data.opportunity_stage || data.opportunity_stage === null)) {
    return false
  }
  return true
}, {
  message: 'Opportunity stage is required when creating opportunity',
  path: ['opportunity_stage'],
})

// Type inference from validation schemas
export type InteractionFormData = z.infer<typeof interactionSchema>
export type InteractionWithOpportunityFormData = z.infer<typeof interactionWithOpportunitySchema>

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
  A: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    badge: 'bg-warning text-warning-foreground',
  },
  B: {
    bg: 'bg-warning/5',
    text: 'text-warning/80',
    border: 'border-warning/10',
    badge: 'bg-warning/80 text-warning-foreground',
  },
  C: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    badge: 'bg-primary text-primary-foreground',
  },
  D: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-muted-foreground/20',
    badge: 'bg-muted text-muted-foreground',
  },
} as const

// Account manager list (can be expanded as needed)
export const ACCOUNT_MANAGERS = ['Sue', 'Gary', 'Dale'] as const
