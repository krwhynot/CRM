import type { Database } from '../lib/database.types'
import { z } from 'zod'
import { ZodTransforms } from '../lib/form-transforms'
import { DB_STAGES, DEFAULT_OPPORTUNITY_STAGE } from '../lib/opportunity-stage-mapping'
import type { OpportunityWeeklyFilters } from './shared-filters.types'

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
} & import('./shared-filters.types').WeeklyContextIndicators

// Opportunity validation schema - updated for form compatibility
export const opportunitySchema = z.object({
  // REQUIRED FIELDS per specification
  name: z
    .string()
    .min(1, 'Opportunity name is required')
    .max(255, 'Name must be 255 characters or less'),

  organization_id: z
    .string()
    .uuid('Invalid organization ID')
    .min(1, 'Organization is required'),

  estimated_value: z
    .number()
    .min(0, 'Estimated value must be positive')
    .transform(ZodTransforms.emptyStringToNullNumber),

  stage: z
    .enum([...DB_STAGES] as [string, ...string[]], {
      required_error: 'Stage is required',
      invalid_type_error: 'Invalid opportunity stage',
    })
    .default(DEFAULT_OPPORTUNITY_STAGE),

  status: z
    .enum(
      ['Active', 'On Hold', 'Closed - Won', 'Closed - Lost', 'Nurturing', 'Qualified'],
      {
        required_error: 'Status is required',
        invalid_type_error: 'Invalid opportunity status',
      }
    )
    .default('Active'),

  // OPTIONAL FIELDS with transforms
  contact_id: z
    .string()
    .uuid('Invalid contact ID')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.normalizeUuid),

  estimated_close_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  // FIELDS for Principal CRM (optional for form compatibility)
  principals: z
    .array(z.string().uuid('Invalid principal organization ID'))
    .default([])
    .transform(ZodTransforms.ensureArray),

  product_id: z
    .string()
    .uuid('Invalid product ID')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.normalizeUuid),

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
      ] as const,
      {
        invalid_type_error: 'Invalid opportunity context',
      }
    )
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),

  auto_generated_name: z.boolean().default(false),

  principal_id: z
    .string()
    .uuid('Invalid principal organization ID')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.normalizeUuid),

  probability: z
    .number()
    .min(0, 'Probability must be between 0-100')
    .max(100, 'Probability must be between 0-100')
    .optional()
    .transform(ZodTransforms.emptyStringToNullNumber),

  deal_owner: z
    .string()
    .max(100, 'Deal owner must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),
})

// Multiple Principal Opportunity Creation Schema
export const multiPrincipalOpportunitySchema = z
  .object({
    // Organization and context info
    organization_id: z
      .string()
      .uuid('Invalid organization ID')
      .min(1, 'Organization is required'),

    contact_id: z
      .string()
      .uuid('Invalid contact ID')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.normalizeUuid),

    // Multiple principals selection
    principals: z
      .array(z.string().uuid('Invalid principal organization ID'))
      .min(1, 'At least one principal must be selected'),

    // Auto-naming configuration
    auto_generated_name: z.boolean().default(true),

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
        ] as const,
        {
          required_error: 'Opportunity context is required for auto-naming',
          invalid_type_error: 'Invalid opportunity context',
        }
      ),

    custom_context: z
      .string()
      .max(50, 'Custom context must be 50 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),

    // Opportunity details
    stage: z
      .enum(
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
        {
          invalid_type_error: 'Invalid opportunity stage',
        }
      )
      .default('lead'),

    status: z
      .enum(
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
        {
          invalid_type_error: 'Invalid opportunity status',
        }
      )
      .default('active'),

    probability: z
      .number()
      .min(0, 'Probability must be between 0-100')
      .max(100, 'Probability must be between 0-100')
      .optional()
      .transform(ZodTransforms.emptyStringToNullNumber),

    estimated_close_date: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),

    notes: z
      .string()
      .max(500, 'Notes must be 500 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
  })
  .refine(
    (data) => {
      // Custom context is required when opportunity_context is 'Custom'
      if (data.opportunity_context === 'Custom') {
        return data.custom_context && data.custom_context.trim().length > 0
      }
      return true
    },
    {
      message: 'Custom context is required when selecting Custom',
      path: ['custom_context'],
    }
  )

// Type inference from validation schemas
export type OpportunityFormData = z.infer<typeof opportunitySchema>
export type MultiPrincipalOpportunityFormData = z.infer<typeof multiPrincipalOpportunitySchema>

// Opportunity filters for queries - enhanced with weekly pattern
export interface OpportunityFilters extends OpportunityWeeklyFilters {
  // Keep existing filter fields
  organization_id?: string
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
  // Original stages
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
const STAGE_PROGRESSION: Record<string, string | null> = {
  lead: 'qualified',
  qualified: 'proposal',
  proposal: 'negotiation',
  negotiation: null, // Terminal - can go to closed_won or closed_lost manually
  closed_won: null, // Terminal
  closed_lost: null, // Terminal
}

export const getNextStage = (currentStage: OpportunityStage): OpportunityStage | null => {
  if (currentStage in STAGE_PROGRESSION) {
    return STAGE_PROGRESSION[currentStage] as OpportunityStage | null
  }

  return null
}

export const getPreviousStage = (currentStage: OpportunityStage): OpportunityStage | null => {
  // Find the stage that has currentStage as its next stage
  for (const [stage, nextStage] of Object.entries(STAGE_PROGRESSION)) {
    if (nextStage === currentStage) {
      return stage as OpportunityStage
    }
  }

  return null
}
