import type { Database } from '../lib/database.types'
import { z } from 'zod'
import { ZodTransforms } from '../lib/form-transforms'
import { DB_STAGES, DEFAULT_OPPORTUNITY_STAGE, CODE_STAGES } from '../lib/opportunity-stage-mapping'
import type { OpportunityWeeklyFilters } from './shared-filters.types'
import type { EntityFilterState } from '../components/data-table/filters/EntityFilters'

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

// Opportunity business logic types and constants
export const OpportunityContextEnum = z.enum([
  'Site Visit',
  'Food Show',
  'New Product Interest',
  'Follow-up',
  'Demo Request',
  'Sampling',
  'Custom',
] as const)

export const OpportunityStatusEnum = z.enum([
  'Active',
  'On Hold',
  'Closed - Won',
  'Closed - Lost',
  'Nurturing',
  'Qualified',
] as const)

// Stage validation with dual enum support (DB display values + code values)
export const OpportunityStageEnum = z.enum([
  // Database display values (primary)
  'New Lead',
  'Initial Outreach',
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won',
  'Closed - Lost',
  // Application code values (backward compatibility)
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
] as const)

// Validation constants for opportunity fields
export const OPPORTUNITY_VALIDATION_CONSTANTS = {
  name: { max: 255 },
  description: { max: 1000 },
  notes: { max: 500 },
  custom_context: { max: 50 },
  deal_owner: { max: 100 },
  probability: { min: 0, max: 100 },
  estimated_value: { min: 0 },
} as const

/**
 * Base Opportunity Schema Components
 * Reusable schema pieces for composition
 */
export const opportunityContextSchema = OpportunityContextEnum.nullable()
export const opportunityStatusSchema = OpportunityStatusEnum.default('Active')
export const opportunityStageSchema = OpportunityStageEnum.default(DEFAULT_OPPORTUNITY_STAGE)

/**
 * Base Opportunity Schema
 * Core fields that are common to all opportunity variations
 */
export const opportunityBaseSchema = z.object({
  // REQUIRED FIELDS per specification
  name: z
    .string()
    .min(1, 'Opportunity name is required')
    .max(OPPORTUNITY_VALIDATION_CONSTANTS.name.max, 'Name must be 255 characters or less'),

  organization_id: ZodTransforms.uuidField.refine((val) => val !== null, {
    message: 'Organization is required',
  }),

  estimated_value: z.preprocess(
    ZodTransforms.nullableNumber.parse,
    z
      .number()
      .min(OPPORTUNITY_VALIDATION_CONSTANTS.estimated_value.min, 'Estimated value must be positive')
      .describe('Estimated value is required')
  ),

  stage: opportunityStageSchema,
  status: opportunityStatusSchema,

  // OPTIONAL FIELDS with transforms
  contact_id: ZodTransforms.uuidField,

  estimated_close_date: ZodTransforms.nullableString,

  description: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.description.max,
    {
      message: 'Description must be 1000 characters or less',
    }
  ),

  notes: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.notes.max,
    {
      message: 'Notes must be 500 characters or less',
    }
  ),

  // FIELDS for Principal CRM (optional for form compatibility)
  principals: z
    .array(z.string().uuid('Invalid principal organization ID'))
    .default([])
    .transform((arr) => arr.filter((id) => id !== undefined)),

  product_id: ZodTransforms.uuidField,

  opportunity_context: opportunityContextSchema,

  auto_generated_name: z.boolean().default(false),

  principal_id: ZodTransforms.uuidField,

  probability: z.preprocess(
    ZodTransforms.nullableNumber.parse,
    z
      .number()
      .min(OPPORTUNITY_VALIDATION_CONSTANTS.probability.min, 'Probability must be between 0-100')
      .max(OPPORTUNITY_VALIDATION_CONSTANTS.probability.max, 'Probability must be between 0-100')
      .nullable()
  ),

  deal_owner: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.deal_owner.max,
    {
      message: 'Deal owner must be 100 characters or less',
    }
  ),
})

/**
 * Main Opportunity Schema
 * Primary schema for opportunity validation (equivalent to opportunitySchema from Yup)
 */
export const opportunityZodSchema = opportunityBaseSchema

/**
 * Multi-Principal Opportunity Base Schema (without refinements)
 * Used for schema composition operations like .omit() and .partial()
 */
export const multiPrincipalOpportunityBaseZodSchema = z.object({
  // Organization and context info
  organization_id: ZodTransforms.uuidField.refine((val) => val !== null, {
    message: 'Organization is required',
  }),

  contact_id: ZodTransforms.uuidField,

  // Multiple principals selection with enhanced validation
  principals: z
    .array(z.string().uuid('Invalid principal organization ID'))
    .min(1, 'At least one principal must be selected')
    .max(10, 'Maximum of 10 principals allowed per opportunity')
    .transform((arr) => {
      // Remove undefined/null values and filter unique UUIDs
      const cleaned = arr.filter((id) => id !== undefined && id !== null)
      const unique = Array.from(new Set(cleaned))
      return unique
    })
    .refine(
      (arr) => {
        // Validate no duplicates after transformation
        return arr.length === new Set(arr).size
      },
      {
        message: 'Duplicate principals are not allowed',
      }
    )
    .refine(
      (arr) => {
        // Validate each principal ID format
        return arr.every(
          (id) =>
            typeof id === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
        )
      },
      {
        message: 'All principal IDs must be valid UUIDs',
      }
    ),

  // Auto-naming configuration with conditional requirements
  auto_generated_name: z.boolean().default(true),

  opportunity_context: OpportunityContextEnum.describe(
    'Opportunity context is required for auto-naming'
  ),

  custom_context: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.custom_context.max,
    {
      message: 'Custom context must be 50 characters or less',
    }
  ),

  // Optional name field for manual naming override
  name: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.name.max,
    {
      message: 'Name must be 255 characters or less',
    }
  ),

  // Enhanced estimated value with multi-principal considerations
  estimated_value: z.preprocess(
    ZodTransforms.nullableNumber.parse,
    z
      .number()
      .min(OPPORTUNITY_VALIDATION_CONSTANTS.estimated_value.min, 'Estimated value must be positive')
      .nullable()
  ),

  // Stage management with dual enum support
  stage: z.preprocess((val) => {
    // Handle legacy code values by mapping to DB values
    const legacyStageMapping: Record<string, string> = {
      lead: 'New Lead',
      qualified: 'Initial Outreach',
      proposal: 'Sample/Visit Offered',
      negotiation: 'Demo Scheduled',
      closed_won: 'Closed - Won',
      closed_lost: 'Closed - Lost',
    }

    if (typeof val === 'string' && val in legacyStageMapping) {
      return legacyStageMapping[val]
    }
    return val
  }, OpportunityStageEnum.default('New Lead')),

  status: z.preprocess((val) => {
    // Handle legacy status values by mapping to DB values
    const legacyStatusMapping: Record<string, string> = {
      active: 'Active',
      on_hold: 'On Hold',
      closed_won: 'Closed - Won',
      closed_lost: 'Closed - Lost',
      nurturing: 'Nurturing',
      qualified: 'Qualified',
    }

    if (typeof val === 'string' && val in legacyStatusMapping) {
      return legacyStatusMapping[val]
    }
    return val
  }, OpportunityStatusEnum.default('Active')),

  probability: z.preprocess(
    ZodTransforms.nullableNumber.parse,
    z
      .number()
      .min(OPPORTUNITY_VALIDATION_CONSTANTS.probability.min, 'Probability must be between 0-100')
      .max(OPPORTUNITY_VALIDATION_CONSTANTS.probability.max, 'Probability must be between 0-100')
      .nullable()
  ),

  estimated_close_date: ZodTransforms.nullableString,

  notes: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.notes.max,
    {
      message: 'Notes must be 500 characters or less',
    }
  ),

  // Optional description field for detailed multi-principal context
  description: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.description.max,
    {
      message: 'Description must be 1000 characters or less',
    }
  ),

  // Deal owner for multi-principal coordination
  deal_owner: ZodTransforms.nullableString.refine(
    (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.deal_owner.max,
    {
      message: 'Deal owner must be 100 characters or less',
    }
  ),
})

/**
 * Multi-Principal Opportunity Schema
 * Enhanced schema with sophisticated participant validation, auto-naming, and duplicate detection
 */
export const multiPrincipalOpportunityZodSchema = multiPrincipalOpportunityBaseZodSchema
  .refine(
    (data) => {
      // Conditional custom context validation using refinement
      if (data.opportunity_context === 'Custom') {
        return (
          data.custom_context !== null &&
          data.custom_context !== undefined &&
          data.custom_context.trim().length > 0
        )
      }
      return true
    },
    {
      message: 'Custom context is required when selecting Custom',
      path: ['custom_context'],
    }
  )
  .refine(
    (data) => {
      // Auto-naming validation - if auto_generated_name is true, name should be empty or null
      if (data.auto_generated_name) {
        return !data.name || data.name.trim().length === 0
      }
      // If auto_generated_name is false, manual name is required
      return data.name && data.name.trim().length > 0
    },
    {
      message: 'Manual name is required when auto-naming is disabled',
      path: ['name'],
    }
  )
  .refine(
    (data) => {
      // Business logic: principal organization cannot be the same as the target organization
      if (data.organization_id && data.principals.length > 0) {
        return !data.principals.includes(data.organization_id)
      }
      return true
    },
    {
      message: 'Target organization cannot be included as a principal',
      path: ['principals'],
    }
  )

/**
 * Multi-Principal Schema Variants for Different Use Cases
 */

/**
 * Multi-Principal Create Schema
 * For creating new multi-principal opportunities with required validation
 */
export const multiPrincipalOpportunityCreateZodSchema = multiPrincipalOpportunityBaseZodSchema
  .omit({
    name: true, // Auto-generated, so omit from create
  })
  .extend({
    // Override auto_generated_name to be required for create
    auto_generated_name: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Conditional custom context validation using refinement
      if (data.opportunity_context === 'Custom') {
        return (
          data.custom_context !== null &&
          data.custom_context !== undefined &&
          data.custom_context.trim().length > 0
        )
      }
      return true
    },
    {
      message: 'Custom context is required when selecting Custom',
      path: ['custom_context'],
    }
  )
  .refine(
    (data) => {
      // Business logic: principal organization cannot be the same as the target organization
      if (data.organization_id && data.principals.length > 0) {
        return !data.principals.includes(data.organization_id)
      }
      return true
    },
    {
      message: 'Target organization cannot be included as a principal',
      path: ['principals'],
    }
  )

/**
 * Multi-Principal Update Schema
 * For updating existing multi-principal opportunities (most fields optional)
 */
export const multiPrincipalOpportunityUpdateZodSchema = multiPrincipalOpportunityBaseZodSchema
  .partial()
  .extend({
    // Keep principals required if provided (no empty arrays)
    principals: z
      .array(z.string().uuid('Invalid principal organization ID'))
      .min(1, 'At least one principal must be selected')
      .max(10, 'Maximum of 10 principals allowed per opportunity')
      .transform((arr) => {
        const cleaned = arr.filter((id) => id !== undefined && id !== null)
        const unique = Array.from(new Set(cleaned))
        return unique
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Conditional custom context validation for updates (only if context is provided)
      if (data.opportunity_context === 'Custom') {
        return (
          data.custom_context !== null &&
          data.custom_context !== undefined &&
          data.custom_context.trim().length > 0
        )
      }
      return true
    },
    {
      message: 'Custom context is required when selecting Custom',
      path: ['custom_context'],
    }
  )
  .refine(
    (data) => {
      // Auto-naming validation for updates (only if both fields are provided)
      if (data.auto_generated_name !== undefined && data.name !== undefined) {
        if (data.auto_generated_name) {
          return !data.name || data.name.trim().length === 0
        }
        return data.name && data.name.trim().length > 0
      }
      return true
    },
    {
      message: 'Manual name is required when auto-naming is disabled',
      path: ['name'],
    }
  )
  .refine(
    (data) => {
      // Business logic: principal organization cannot be the same as the target organization
      if (data.organization_id && data.principals && data.principals.length > 0) {
        return !data.principals.includes(data.organization_id)
      }
      return true
    },
    {
      message: 'Target organization cannot be included as a principal',
      path: ['principals'],
    }
  )

/**
 * Multi-Principal Quick Create Schema
 * Simplified schema for rapid opportunity creation with minimal required fields
 */
export const multiPrincipalOpportunityQuickCreateZodSchema = z
  .object({
    organization_id: ZodTransforms.uuidField.refine((val) => val !== null, {
      message: 'Organization is required',
    }),

    principals: z
      .array(z.string().uuid('Invalid principal organization ID'))
      .min(1, 'At least one principal must be selected')
      .max(10, 'Maximum of 10 principals allowed per opportunity')
      .transform((arr) => {
        const cleaned = arr.filter((id) => id !== undefined && id !== null)
        const unique = Array.from(new Set(cleaned))
        return unique
      }),

    opportunity_context: OpportunityContextEnum,

    custom_context: ZodTransforms.nullableString.refine(
      (val) => !val || val.length <= OPPORTUNITY_VALIDATION_CONSTANTS.custom_context.max,
      {
        message: 'Custom context must be 50 characters or less',
      }
    ),

    // Optional fields with defaults
    auto_generated_name: z.boolean().default(true),
    stage: OpportunityStageEnum.default('New Lead'),
    status: OpportunityStatusEnum.default('Active'),
    contact_id: ZodTransforms.uuidField,
    estimated_value: z.preprocess(
      ZodTransforms.nullableNumber.parse,
      z.number().min(0, 'Estimated value must be positive').nullable()
    ),
  })
  .refine(
    (data) => {
      // Custom context validation
      if (data.opportunity_context === 'Custom') {
        return (
          data.custom_context !== null &&
          data.custom_context !== undefined &&
          data.custom_context.trim().length > 0
        )
      }
      return true
    },
    {
      message: 'Custom context is required when selecting Custom',
      path: ['custom_context'],
    }
  )
  .refine(
    (data) => {
      // Business logic: principal organization cannot be the same as the target organization
      if (data.organization_id && data.principals.length > 0) {
        return !data.principals.includes(data.organization_id)
      }
      return true
    },
    {
      message: 'Target organization cannot be included as a principal',
      path: ['principals'],
    }
  )

/**
 * Multi-Principal Participant Schema
 * For validating individual participant relationships
 */
export const multiPrincipalParticipantZodSchema = z.object({
  opportunity_id: ZodTransforms.uuidField.refine((val) => val !== null, {
    message: 'Opportunity ID is required',
  }),

  organization_id: ZodTransforms.uuidField.refine((val) => val !== null, {
    message: 'Organization ID is required',
  }),

  role: z.enum(['principal', 'distributor', 'stakeholder']).default('principal'),

  sequence_order: z.number().int().min(1).optional(),

  notes: ZodTransforms.nullableString.refine((val) => !val || val.length <= 500, {
    message: 'Participant notes must be 500 characters or less',
  }),

  created_by: ZodTransforms.uuidField,
  created_at: z.string().datetime().optional(),
})

/**
 * Opportunity Create Schema
 * For creating new opportunities (excludes auto-generated fields)
 */
export const opportunityCreateZodSchema = opportunityBaseSchema

/**
 * Opportunity Update Schema
 * For updating existing opportunities (all fields optional except core identifiers)
 */
export const opportunityUpdateZodSchema = opportunityBaseSchema.partial()

/**
 * TypeScript Type Inference from Zod Schemas
 * Equivalent to z.infer<typeof opportunitySchema>
 */
export type OpportunityZodFormData = z.infer<typeof opportunityZodSchema>
export type MultiPrincipalOpportunityZodFormData = z.infer<
  typeof multiPrincipalOpportunityZodSchema
>
export type OpportunityCreateZodFormData = z.infer<typeof opportunityCreateZodSchema>
export type OpportunityUpdateZodFormData = z.infer<typeof opportunityUpdateZodSchema>

// Multi-Principal Schema Type Variants
export type MultiPrincipalOpportunityCreateZodFormData = z.infer<
  typeof multiPrincipalOpportunityCreateZodSchema
>
export type MultiPrincipalOpportunityUpdateZodFormData = z.infer<
  typeof multiPrincipalOpportunityUpdateZodSchema
>
export type MultiPrincipalOpportunityQuickCreateZodFormData = z.infer<
  typeof multiPrincipalOpportunityQuickCreateZodSchema
>
export type MultiPrincipalParticipantZodFormData = z.infer<
  typeof multiPrincipalParticipantZodSchema
>

// Legacy type aliases for backward compatibility
export type OpportunityFormData = OpportunityZodFormData
export type MultiPrincipalOpportunityFormData = MultiPrincipalOpportunityZodFormData

// Utility types for multi-principal operations
export type PrincipalValidationResult = {
  isValid: boolean
  errors: string[]
  duplicates: string[]
  invalidUUIDs: string[]
}

export type MultiPrincipalNameGenerationOptions = {
  organizationName: string
  principalNames: string[]
  context: string
  customContext?: string
  maxLength?: number
  format?: 'standard' | 'abbreviated' | 'compact'
}

// Opportunity filters for queries - standardized to use EntityFilterState pattern
export interface OpportunityFilters extends EntityFilterState {
  // EntityFilterState provides: search, timeRange, quickView, principal, status, priority
  // Additional opportunity-specific filter fields
  organization_id?: string
  distributor_organization_id?: string
  contact_id?: string
  opportunity_context?: OpportunityContext | OpportunityContext[]
  probability_min?: number
  probability_max?: number
  estimated_value_min?: number
  estimated_value_max?: number
  stage?: string // Map to status in EntityFilterState for semantic consistency
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

/**
 * Opportunity Validation Class
 * Static methods for opportunity validation following established patterns
 */
export class OpportunityZodValidation {
  /**
   * Validate opportunity data against main schema
   */
  static validate(data: unknown): OpportunityZodFormData {
    const result = opportunityZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Opportunity validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate multi-principal opportunity data
   */
  static validateMultiPrincipal(data: unknown): MultiPrincipalOpportunityZodFormData {
    const result = multiPrincipalOpportunityZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Multi-principal opportunity validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate multi-principal opportunity create data
   */
  static validateMultiPrincipalCreate(data: unknown): MultiPrincipalOpportunityCreateZodFormData {
    const result = multiPrincipalOpportunityCreateZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(
        `Multi-principal opportunity create validation failed: ${result.error.message}`
      )
    }
    return result.data
  }

  /**
   * Validate multi-principal opportunity update data
   */
  static validateMultiPrincipalUpdate(data: unknown): MultiPrincipalOpportunityUpdateZodFormData {
    const result = multiPrincipalOpportunityUpdateZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(
        `Multi-principal opportunity update validation failed: ${result.error.message}`
      )
    }
    return result.data
  }

  /**
   * Validate multi-principal quick create data
   */
  static validateMultiPrincipalQuickCreate(
    data: unknown
  ): MultiPrincipalOpportunityQuickCreateZodFormData {
    const result = multiPrincipalOpportunityQuickCreateZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(
        `Multi-principal opportunity quick create validation failed: ${result.error.message}`
      )
    }
    return result.data
  }

  /**
   * Validate participant data
   */
  static validateParticipant(data: unknown): MultiPrincipalParticipantZodFormData {
    const result = multiPrincipalParticipantZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Participant validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate opportunity create data
   */
  static validateCreate(data: unknown): OpportunityCreateZodFormData {
    const result = opportunityCreateZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Opportunity create validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate opportunity update data
   */
  static validateUpdate(data: unknown): OpportunityUpdateZodFormData {
    const result = opportunityUpdateZodSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Opportunity update validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Safe validation with detailed error information
   */
  static safeParse(data: unknown) {
    return opportunityZodSchema.safeParse(data)
  }

  /**
   * Safe validation for multi-principal opportunities
   */
  static safeParseMultiPrincipal(data: unknown) {
    return multiPrincipalOpportunityZodSchema.safeParse(data)
  }

  /**
   * Safe validation for multi-principal create
   */
  static safeParseMultiPrincipalCreate(data: unknown) {
    return multiPrincipalOpportunityCreateZodSchema.safeParse(data)
  }

  /**
   * Safe validation for multi-principal update
   */
  static safeParseMultiPrincipalUpdate(data: unknown) {
    return multiPrincipalOpportunityUpdateZodSchema.safeParse(data)
  }

  /**
   * Safe validation for multi-principal quick create
   */
  static safeParseMultiPrincipalQuickCreate(data: unknown) {
    return multiPrincipalOpportunityQuickCreateZodSchema.safeParse(data)
  }

  /**
   * Safe validation for participant
   */
  static safeParseParticipant(data: unknown) {
    return multiPrincipalParticipantZodSchema.safeParse(data)
  }

  /**
   * Get validation errors in user-friendly format
   */
  static getValidationErrors(data: unknown): string[] {
    const result = opportunityZodSchema.safeParse(data)
    if (result.success) return []

    return result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
  }

  /**
   * Get multi-principal validation errors in user-friendly format
   */
  static getMultiPrincipalValidationErrors(data: unknown): string[] {
    const result = multiPrincipalOpportunityZodSchema.safeParse(data)
    if (result.success) return []

    return result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
  }

  /**
   * Validate partial data (for update operations)
   */
  static validatePartial(data: unknown) {
    return opportunityUpdateZodSchema.safeParse(data)
  }

  /**
   * Validate stage value (handles legacy values)
   */
  static validateStage(stage: string): boolean {
    return (DB_STAGES as ReadonlyArray<string>).includes(stage) || (CODE_STAGES as ReadonlyArray<string>).includes(stage)
  }

  /**
   * Validate status value (handles legacy values)
   */
  static validateStatus(status: string): boolean {
    const validStatuses = [
      // DB values
      'Active',
      'On Hold',
      'Closed - Won',
      'Closed - Lost',
      'Nurturing',
      'Qualified',
      // Legacy code values
      'active',
      'on_hold',
      'closed_won',
      'closed_lost',
      'nurturing',
      'qualified',
    ]
    return validStatuses.includes(status)
  }

  /**
   * Validate principals array with enhanced multi-principal rules
   * Ensures UUIDs are valid, no duplicates, and business logic constraints
   */
  static validatePrincipals(
    principals: unknown[],
    isMultiPrincipal = false,
    organizationId?: string
  ): boolean {
    if (!Array.isArray(principals)) return false

    if (isMultiPrincipal && principals.length < 1) return false
    if (principals.length > 10) return false // Maximum limit

    // Check for valid UUIDs
    const validUUIDs = principals.every(
      (id) =>
        typeof id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    )
    if (!validUUIDs) return false

    // Check for duplicates
    const uniquePrincipals = new Set(principals)
    if (uniquePrincipals.size !== principals.length) return false

    // Check that target organization is not included as principal
    if (organizationId && principals.includes(organizationId)) return false

    return true
  }

  /**
   * Detect duplicate principals in array
   */
  static detectDuplicatePrincipals(principals: string[]): string[] {
    const seen = new Set<string>()
    const duplicates = new Set<string>()

    for (const principal of principals) {
      if (seen.has(principal)) {
        duplicates.add(principal)
      }
      seen.add(principal)
    }

    return Array.from(duplicates)
  }

  /**
   * Validate multi-principal business rules
   */
  static validateMultiPrincipalBusinessRules(
    organizationId: string,
    principals: string[],
    autoGeneratedName: boolean,
    manualName?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check principal count
    if (principals.length < 1) {
      errors.push('At least one principal must be selected')
    }
    if (principals.length > 10) {
      errors.push('Maximum of 10 principals allowed per opportunity')
    }

    // Check for duplicates
    const duplicates = this.detectDuplicatePrincipals(principals)
    if (duplicates.length > 0) {
      errors.push('Duplicate principals are not allowed')
    }

    // Check target organization is not a principal
    if (principals.includes(organizationId)) {
      errors.push('Target organization cannot be included as a principal')
    }

    // Check naming rules
    if (!autoGeneratedName && (!manualName || manualName.trim().length === 0)) {
      errors.push('Manual name is required when auto-naming is disabled')
    }
    if (autoGeneratedName && manualName && manualName.trim().length > 0) {
      errors.push('Manual name should be empty when auto-naming is enabled')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate custom context logic
   * Ensures custom context is provided when opportunity_context is 'Custom'
   */
  static validateCustomContext(context: string | null, customContext: string | null): boolean {
    if (context === 'Custom') {
      return (
        customContext !== null && customContext !== undefined && customContext.trim().length > 0
      )
    }
    return true
  }

  /**
   * Transform for handling form data to database format
   * Removes virtual fields and prepares for database insertion
   */
  static transformForDatabase(
    formData: OpportunityZodFormData
  ): Omit<OpportunityZodFormData, 'principals'> {
    const { principals, ...opportunityData } = formData
    return opportunityData
  }

  /**
   * Extract principal relationships from multi-principal opportunity
   * For creating opportunity_participants records with enhanced metadata
   */
  static extractPrincipalRelationships(
    formData: MultiPrincipalOpportunityZodFormData,
    opportunityId: string,
    createdBy?: string
  ) {
    return formData.principals.map((principalId, index) => ({
      opportunity_id: opportunityId,
      organization_id: principalId,
      role: 'principal' as const,
      sequence_order: index + 1, // Track principal order for display purposes
      created_by: createdBy,
      created_at: new Date().toISOString(),
    }))
  }

  /**
   * Generate auto-name for multi-principal opportunity
   * Integrates with client-side naming store patterns
   */
  static generateMultiPrincipalName(
    organizationName: string,
    principalNames: string[],
    context: string,
    customContext?: string
  ): string {
    // Truncate organization name if too long
    const ORGANIZATION_MAX_DISPLAY_LENGTH = 50
    const truncatedOrg =
      organizationName.length > ORGANIZATION_MAX_DISPLAY_LENGTH
        ? organizationName.substring(0, ORGANIZATION_MAX_DISPLAY_LENGTH - 3) + '...'
        : organizationName

    // Handle principal display
    let principalDisplay: string
    if (principalNames.length === 1) {
      const PRINCIPAL_MAX_DISPLAY_LENGTH = 40
      principalDisplay =
        principalNames[0].length > PRINCIPAL_MAX_DISPLAY_LENGTH
          ? principalNames[0].substring(0, PRINCIPAL_MAX_DISPLAY_LENGTH - 3) + '...'
          : principalNames[0]
    } else {
      principalDisplay = `Multi-Principal (${principalNames.length})`
    }

    // Format context
    const contextDisplay = context === 'Custom' && customContext ? customContext : context
    const CONTEXT_MAX_DISPLAY_LENGTH = 30
    const truncatedContext =
      contextDisplay.length > CONTEXT_MAX_DISPLAY_LENGTH
        ? contextDisplay.substring(0, CONTEXT_MAX_DISPLAY_LENGTH - 3) + '...'
        : contextDisplay

    // Format date
    const date = new Date()
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    // Combine components
    const generatedName = `${truncatedOrg} - ${principalDisplay} - ${truncatedContext} - ${monthYear}`

    // Ensure final name doesn't exceed maximum length
    return generatedName.length > OPPORTUNITY_VALIDATION_CONSTANTS.name.max
      ? generatedName.substring(0, OPPORTUNITY_VALIDATION_CONSTANTS.name.max - 3) + '...'
      : generatedName
  }

  /**
   * Validate multi-principal opportunity context requirements
   */
  static validateMultiPrincipalContext(
    context: string,
    customContext?: string
  ): { isValid: boolean; error?: string } {
    const validContexts = [
      'Site Visit',
      'Food Show',
      'New Product Interest',
      'Follow-up',
      'Demo Request',
      'Sampling',
      'Custom',
    ]

    if (!validContexts.includes(context)) {
      return {
        isValid: false,
        error: 'Invalid opportunity context',
      }
    }

    if (context === 'Custom') {
      if (!customContext || customContext.trim().length === 0) {
        return {
          isValid: false,
          error: 'Custom context is required when selecting Custom',
        }
      }
      if (customContext.length > OPPORTUNITY_VALIDATION_CONSTANTS.custom_context.max) {
        return {
          isValid: false,
          error: 'Custom context must be 50 characters or less',
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Validate estimated value constraints
   */
  static validateEstimatedValue(value: number | null): boolean {
    if (value === null) return true
    return value >= OPPORTUNITY_VALIDATION_CONSTANTS.estimated_value.min
  }

  /**
   * Validate probability constraints
   */
  static validateProbability(value: number | null): boolean {
    if (value === null) return true
    return (
      value >= OPPORTUNITY_VALIDATION_CONSTANTS.probability.min &&
      value <= OPPORTUNITY_VALIDATION_CONSTANTS.probability.max
    )
  }
}

// Default export for main schema
// Backward compatibility aliases
export { opportunityZodSchema as opportunitySchema }
export type { OpportunityZodFormData as OpportunityFormData }
export type { MultiPrincipalOpportunityZodFormData as MultiPrincipalOpportunityFormData }

export default opportunityZodSchema
