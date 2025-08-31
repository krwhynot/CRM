import type { Database } from '../lib/database.types'
import * as yup from 'yup'
import { FormTransforms } from '../lib/form-transforms'
import { DB_STAGES, DEFAULT_OPPORTUNITY_STAGE } from '../lib/opportunity-stage-mapping'

// Principal CRM Business Logic Types
export type OpportunityContext =
  | 'Site Visit'
  | 'Food Show'
  | 'New Product Interest'
  | 'Follow-up'
  | 'Demo Request'
  | 'Sampling'
  | 'Custom'

// Database-aligned Sales Funnel Stages
export type OpportunityStage = Database['public']['Enums']['opportunity_stage']

// Base opportunity types from database
export type Opportunity = Database['public']['Tables']['opportunities']['Row']
export type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert']
export type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update']

// Opportunity with relationships
export type OpportunityWithRelations = Opportunity & {
  organization?: Database['public']['Tables']['organizations']['Row']
  contact?: Database['public']['Tables']['contacts']['Row']
  principal_organization?: Database['public']['Tables']['organizations']['Row']
  interactions?: Database['public']['Tables']['interactions']['Row'][]
}

// Opportunity with last activity for table display
export type OpportunityWithLastActivity = OpportunityWithRelations & {
  last_activity_date?: string | null
  last_activity_type?: string | null
  interaction_count?: number
  stage_updated_at?: string | null
}

// Opportunity validation schema - updated for form compatibility
export const opportunitySchema = yup.object({
  // REQUIRED FIELDS per specification
  name: yup
    .string()
    .required('Opportunity name is required')
    .max(255, 'Name must be 255 characters or less'),

  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),

  estimated_value: yup
    .number()
    .min(0, 'Estimated value must be positive')
    .required('Estimated value is required')
    .transform(FormTransforms.nullableNumber),

  stage: yup
    .string()
    .oneOf(DB_STAGES, 'Invalid opportunity stage')
    .required('Stage is required')
    .default(DEFAULT_OPPORTUNITY_STAGE),

  status: yup
    .string()
    .oneOf(
      ['Active', 'On Hold', 'Closed - Won', 'Closed - Lost', 'Nurturing', 'Qualified'],
      'Invalid opportunity status'
    )
    .default('Active'),

  // OPTIONAL FIELDS with transforms
  contact_id: yup
    .string()
    .uuid('Invalid contact ID')
    .nullable()
    .transform(FormTransforms.uuidField),

  estimated_close_date: yup.string().nullable().transform(FormTransforms.nullableString),

  description: yup
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  notes: yup
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),

  // FIELDS for Principal CRM (optional for form compatibility)
  principals: yup
    .array()
    .of(yup.string().uuid('Invalid principal organization ID'))
    .default([])
    .transform(FormTransforms.optionalArray),

  product_id: yup
    .string()
    .uuid('Invalid product ID')
    .nullable()
    .transform(FormTransforms.uuidField),

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
    .nullable()
    .transform(FormTransforms.nullableString),

  auto_generated_name: yup.boolean().default(false),

  principal_id: yup
    .string()
    .uuid('Invalid principal organization ID')
    .nullable()
    .transform(FormTransforms.uuidField),

  probability: yup
    .number()
    .min(0, 'Probability must be between 0-100')
    .max(100, 'Probability must be between 0-100')
    .nullable()
    .transform(FormTransforms.nullableNumber),

  deal_owner: yup
    .string()
    .max(100, 'Deal owner must be 100 characters or less')
    .nullable()
    .transform(FormTransforms.nullableString),
})

// Multiple Principal Opportunity Creation Schema
export const multiPrincipalOpportunitySchema = yup.object({
  // Organization and context info
  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),

  contact_id: yup.string().uuid('Invalid contact ID').nullable(),

  // Multiple principals selection
  principals: yup
    .array()
    .of(yup.string().uuid('Invalid principal organization ID'))
    .min(1, 'At least one principal must be selected')
    .required('Principals are required'),

  // Auto-naming configuration
  auto_generated_name: yup.boolean().default(true),

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
    .required('Opportunity context is required for auto-naming'),

  custom_context: yup
    .string()
    .max(50, 'Custom context must be 50 characters or less')
    .when('opportunity_context', {
      is: 'Custom',
      then: (schema) => schema.required('Custom context is required when selecting Custom'),
      otherwise: (schema) => schema.nullable(),
    }),

  // Opportunity details
  stage: yup
    .string()
    .oneOf(
      [
        // New TypeScript-aligned values (preferred)
        'lead',
        'qualified',
        'proposal',
        'negotiation',
        'closed_won',
        'closed_lost',
        // Legacy database values (backward compatibility)
        'New Lead',
        'Initial Outreach',
        'Sample/Visit Offered',
        'Awaiting Response',
        'Feedback Logged',
        'Demo Scheduled',
        'Closed - Won',
        'Closed - Lost',
      ] as const,
      'Invalid opportunity stage'
    )
    .default('lead'),

  status: yup
    .string()
    .oneOf(
      [
        // New TypeScript-aligned values (preferred)
        'active',
        'on_hold',
        'closed_won',
        'closed_lost',
        'nurturing',
        'qualified',
        // Legacy database values (backward compatibility)
        'Active',
        'On Hold',
        'Closed - Won',
        'Closed - Lost',
        'Nurturing',
        'Qualified',
      ] as const,
      'Invalid opportunity status'
    )
    .default('active'),

  probability: yup
    .number()
    .min(0, 'Probability must be between 0-100')
    .max(100, 'Probability must be between 0-100')
    .nullable(),

  estimated_close_date: yup.string().nullable(),

  notes: yup.string().max(500, 'Notes must be 500 characters or less').nullable(),
})

// Type inference from validation schemas
export type OpportunityFormData = yup.InferType<typeof opportunitySchema>
export type MultiPrincipalOpportunityFormData = yup.InferType<
  typeof multiPrincipalOpportunitySchema
>

// Opportunity filters for queries
export interface OpportunityFilters {
  stage?: OpportunityStage | OpportunityStage[]
  organization_id?: string
  principal_organization_id?: string
  distributor_organization_id?: string
  contact_id?: string
  opportunity_context?: OpportunityContext | OpportunityContext[]
  probability_min?: number
  probability_max?: number
  estimated_value_min?: number
  estimated_value_max?: number
  priority?: 'low' | 'medium' | 'high' | 'critical' | ('low' | 'medium' | 'high' | 'critical')[]
}

// Auto-naming utility functions
export const generateOpportunityName = (
  organizationName: string,
  principalName: string,
  context: OpportunityContext | string,
  customContext?: string
): string => {
  const contextName = context === 'Custom' && customContext ? customContext : context
  const date = new Date()
  const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return `${organizationName} - ${principalName} - ${contextName} - ${monthYear}`
}

// Stage progression helpers
export const OPPORTUNITY_STAGE_ORDER: Record<OpportunityStage, number> = {
  // Legacy stages (original progression)
  'New Lead': 1,
  'Initial Outreach': 2,
  'Sample/Visit Offered': 3,
  'Awaiting Response': 4,
  'Feedback Logged': 5,
  'Demo Scheduled': 6,
  'Closed - Won': 7,
  'Closed - Lost': 8,

  // New TypeScript-aligned stages (logical sales funnel progression)
  lead: 10, // Initial lead stage
  qualified: 11, // Lead has been qualified
  proposal: 12, // Proposal submitted
  negotiation: 13, // In active negotiation
  closed_won: 20, // Successfully closed (terminal stage)
  closed_lost: 21, // Lost opportunity (terminal stage)
}

// Define progression paths for each stage family
const LEGACY_STAGE_PROGRESSION: Record<string, string | null> = {
  'New Lead': 'Initial Outreach',
  'Initial Outreach': 'Sample/Visit Offered',
  'Sample/Visit Offered': 'Awaiting Response',
  'Awaiting Response': 'Feedback Logged',
  'Feedback Logged': 'Demo Scheduled',
  'Demo Scheduled': null, // Terminal - can go to Closed - Won or Closed - Lost manually
  'Closed - Won': null, // Terminal
  'Closed - Lost': null, // Terminal
}

const NEW_STAGE_PROGRESSION: Record<string, string | null> = {
  lead: 'qualified',
  qualified: 'proposal',
  proposal: 'negotiation',
  negotiation: null, // Terminal - can go to closed_won or closed_lost manually
  closed_won: null, // Terminal
  closed_lost: null, // Terminal
}

export const getNextStage = (currentStage: OpportunityStage): OpportunityStage | null => {
  // Check legacy progression
  if (currentStage in LEGACY_STAGE_PROGRESSION) {
    return LEGACY_STAGE_PROGRESSION[currentStage] as OpportunityStage | null
  }

  // Check new progression
  if (currentStage in NEW_STAGE_PROGRESSION) {
    return NEW_STAGE_PROGRESSION[currentStage] as OpportunityStage | null
  }

  return null
}

export const getPreviousStage = (currentStage: OpportunityStage): OpportunityStage | null => {
  // Find the stage that has currentStage as its next stage

  // Check legacy progression
  for (const [stage, nextStage] of Object.entries(LEGACY_STAGE_PROGRESSION)) {
    if (nextStage === currentStage) {
      return stage as OpportunityStage
    }
  }

  // Check new progression
  for (const [stage, nextStage] of Object.entries(NEW_STAGE_PROGRESSION)) {
    if (nextStage === currentStage) {
      return stage as OpportunityStage
    }
  }

  return null
}
