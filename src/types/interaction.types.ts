import type { Database } from '../lib/database.types'
import { z } from 'zod'
import type { InteractionWeeklyFilters } from './shared-filters.types'
import { ZodTransforms } from '../lib/form-transforms'

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

// Zod Interaction validation schema - Enhanced with user's spreadsheet fields

// Interaction business logic types
export const InteractionTypeEnum = z.enum([
  'call',
  'email',
  'meeting',
  'demo',
  'proposal',
  'follow_up',
  'trade_show',
  'site_visit',
  'contract_review',
  'in_person',
  'quoted',
  'distribution',
] as const, {
  errorMap: () => ({ message: 'Invalid interaction type' })
})

export const InteractionPriorityEnum = z.enum(['A+', 'A', 'B', 'C', 'D'] as const, {
  errorMap: () => ({ message: 'Invalid priority level' })
})

export const InteractionOutcomeEnum = z.enum([
  'successful',
  'follow_up_needed',
  'not_interested',
  'postponed',
  'no_response'
] as const, {
  errorMap: () => ({ message: 'Invalid outcome' })
})

export const OpportunityStageEnum = z.enum([
  'New Lead',
  'Initial Outreach',
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won',
] as const, {
  errorMap: () => ({ message: 'Invalid opportunity stage' })
})

export const OpportunityContextEnum = z.enum([
  'Site Visit',
  'Food Show',
  'New Product Interest',
  'Follow-up',
  'Demo Request',
  'Sampling',
  'Custom',
] as const, {
  errorMap: () => ({ message: 'Invalid opportunity context' })
})

export const AccountManagerEnum = z.enum(['Sue', 'Gary', 'Dale'] as const)
  .or(z.string().max(100, 'Account manager name must be 100 characters or less'))

// Validation constants for interaction fields
export const INTERACTION_VALIDATION_CONSTANTS = {
  subject: { max: 255 },
  location: { max: 255 },
  notes: { max: 500 },
  description: { max: 1000 },
  follow_up_notes: { max: 500 },
  account_manager: { max: 100 },
  import_notes: { max: 1000 },
  opportunity_name: { max: 255 },
  duration_minutes: { min: 1 },
} as const

/**
 * Principal Information Schema
 * Supports up to 4 principals per interaction as seen in user data
 */
export const principalInfoSchema = z.object({
  id: z.string().uuid('Invalid principal ID'),
  name: z.string().min(1, 'Principal name is required'),
  principal2: ZodTransforms.nullableString,
  principal3: ZodTransforms.nullableString,
  principal4: ZodTransforms.nullableString,
})

/**
 * Core Interaction Fields Schema (without refinements)
 * Base fields that are common to all interaction variations
 */
const interactionCoreFields = z.object({
  // REQUIRED FIELDS per specification
  type: InteractionTypeEnum,
  interaction_date: z.string().min(1, 'Interaction date is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(INTERACTION_VALIDATION_CONSTANTS.subject.max, 'Subject must be 255 characters or less'),
  opportunity_id: z.string().uuid('Invalid opportunity ID'),

  // OPTIONAL CORE FIELDS with ZodTransforms
  location: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.location.max, {
      message: 'Location must be 255 characters or less'
    }),

  notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.notes.max, {
      message: 'Notes must be 500 characters or less'
    }),

  follow_up_required: z.boolean().default(false),

  follow_up_date: ZodTransforms.nullableString,

  // Additional database fields
  duration_minutes: ZodTransforms.nullableNumber
    .refine((val) => !val || val >= INTERACTION_VALIDATION_CONSTANTS.duration_minutes.min, {
      message: 'Duration must be at least 1 minute'
    }),

  contact_id: ZodTransforms.uuidField,
  organization_id: ZodTransforms.uuidField,

  description: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.description.max, {
      message: 'Description must be 1000 characters or less'
    }),

  outcome: InteractionOutcomeEnum.nullable(),

  follow_up_notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.follow_up_notes.max, {
      message: 'Follow-up notes must be 500 characters or less'
    }),

  // Enhanced fields matching user's spreadsheet
  priority: InteractionPriorityEnum.nullable(),

  account_manager: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.account_manager.max, {
      message: 'Account manager name must be 100 characters or less'
    }),

  principals: z.array(principalInfoSchema).nullable(),

  import_notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.import_notes.max, {
      message: 'Import notes must be 1000 characters or less'
    }),
})

/**
 * Base Interaction Schema with follow-up validation
 * Core fields with cross-field validation applied
 */
export const interactionBaseSchema = interactionCoreFields.refine(
  (data) => {
    // Follow-up logic validation: if follow_up_required is true, follow_up_date must be provided
    if (data.follow_up_required && !data.follow_up_date) {
      return false
    }
    return true
  },
  {
    message: 'Follow-up date is required when follow-up is needed',
    path: ['follow_up_date']
  }
)

/**
 * Standard Interaction Schema
 * For interactions with existing opportunities
 */
export const interactionSchema = interactionBaseSchema

/**
 * Existing Opportunity Interaction Schema
 * For interactions linking to existing opportunities
 */
const existingOpportunityInteractionSchema = z.object({
  create_opportunity: z.literal(false).default(false),

  // All core interaction fields
  ...interactionCoreFields.shape,

  // Opportunity creation fields should be null/optional in existing mode
  opportunity_name: z.string().nullable().default(null),
  opportunity_stage: OpportunityStageEnum.nullable().default(null),
  principal_organization_id: ZodTransforms.uuidField.default(null),
  opportunity_context: OpportunityContextEnum.nullable().default(null),
}).refine(
  (data) => {
    // Follow-up logic validation: if follow_up_required is true, follow_up_date must be provided
    if (data.follow_up_required && !data.follow_up_date) {
      return false
    }
    return true
  },
  {
    message: 'Follow-up date is required when follow-up is needed',
    path: ['follow_up_date']
  }
)

/**
 * New Opportunity Interaction Schema
 * For interactions that create new opportunities during interaction creation
 */
const newOpportunityInteractionSchema = z.object({
  create_opportunity: z.literal(true),

  // Override organization_id to be required when creating opportunities
  organization_id: z.string().uuid('Invalid organization ID'),

  // Override opportunity_id to be nullable since we're creating it
  opportunity_id: ZodTransforms.uuidField.default(null),

  // All other core interaction fields
  type: InteractionTypeEnum,
  interaction_date: z.string().min(1, 'Interaction date is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(INTERACTION_VALIDATION_CONSTANTS.subject.max, 'Subject must be 255 characters or less'),

  location: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.location.max, {
      message: 'Location must be 255 characters or less'
    }),

  notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.notes.max, {
      message: 'Notes must be 500 characters or less'
    }),

  follow_up_required: z.boolean().default(false),
  follow_up_date: ZodTransforms.nullableString,

  duration_minutes: ZodTransforms.nullableNumber
    .refine((val) => !val || val >= INTERACTION_VALIDATION_CONSTANTS.duration_minutes.min, {
      message: 'Duration must be at least 1 minute'
    }),

  contact_id: ZodTransforms.uuidField,

  description: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.description.max, {
      message: 'Description must be 1000 characters or less'
    }),

  outcome: InteractionOutcomeEnum.nullable(),

  follow_up_notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.follow_up_notes.max, {
      message: 'Follow-up notes must be 500 characters or less'
    }),

  priority: InteractionPriorityEnum.nullable(),

  account_manager: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.account_manager.max, {
      message: 'Account manager name must be 100 characters or less'
    }),

  principals: z.array(principalInfoSchema).nullable(),

  import_notes: ZodTransforms.nullableString
    .refine((val) => !val || val.length <= INTERACTION_VALIDATION_CONSTANTS.import_notes.max, {
      message: 'Import notes must be 1000 characters or less'
    }),

  // Opportunity creation fields are required in new mode
  opportunity_name: z
    .string()
    .min(1, 'Opportunity name is required when creating opportunity')
    .max(INTERACTION_VALIDATION_CONSTANTS.opportunity_name.max, 'Opportunity name must be 255 characters or less'),

  opportunity_stage: OpportunityStageEnum,

  // Optional opportunity fields for new mode
  principal_organization_id: ZodTransforms.uuidField,

  opportunity_context: OpportunityContextEnum.nullable(),
}).refine(
  (data) => {
    // Follow-up logic validation: if follow_up_required is true, follow_up_date must be provided
    if (data.follow_up_required && !data.follow_up_date) {
      return false
    }
    return true
  },
  {
    message: 'Follow-up date is required when follow-up is needed',
    path: ['follow_up_date']
  }
)

/**
 * Interaction with Opportunity Creation Schema using Discriminated Union
 * Handles complex conditional validation based on create_opportunity flag
 * This represents the highest complexity validation pattern in the entire CRM system
 */
export const interactionWithOpportunitySchema = z.union([
  existingOpportunityInteractionSchema,
  newOpportunityInteractionSchema,
]).refine(
  (data) => {
    // Additional cross-validation can be added here if needed
    return true
  },
  {
    message: 'Invalid interaction with opportunity data'
  }
)

/**
 * Interaction Create Schema
 * For creating new interactions (excludes auto-generated fields)
 */
export const interactionCreateSchema = interactionSchema

/**
 * Interaction Update Schema
 * For updating existing interactions (all fields optional except core identifiers)
 */
export const interactionUpdateSchema = interactionCoreFields.partial()

/**
 * Interaction with Multi-Principal Schema
 * Specialized schema for handling multi-principal relationships
 */
export const interactionWithMultiPrincipalSchema = interactionCoreFields.extend({
  principals: z.array(principalInfoSchema)
    .min(1, 'At least one principal is required')
    .max(4, 'Maximum 4 principals allowed per interaction')
    .transform((arr) => arr.filter(principal => principal.id !== undefined)),
}).refine(
  (data) => {
    // Follow-up logic validation: if follow_up_required is true, follow_up_date must be provided
    if (data.follow_up_required && !data.follow_up_date) {
      return false
    }
    return true
  },
  {
    message: 'Follow-up date is required when follow-up is needed',
    path: ['follow_up_date']
  }
)

/**
 * TypeScript Type Inference from Zod Schemas
 * Equivalent to z.infer<typeof interactionSchema>
 */
export type InteractionFormData = z.infer<typeof interactionSchema>
export type InteractionWithOpportunityFormData = z.infer<typeof interactionWithOpportunitySchema>
export type InteractionCreateFormData = z.infer<typeof interactionCreateSchema>
export type InteractionUpdateFormData = z.infer<typeof interactionUpdateSchema>
export type InteractionWithMultiPrincipalFormData = z.infer<typeof interactionWithMultiPrincipalSchema>

// Specific type exports for discriminated union cases
export type ExistingOpportunityInteractionFormData = z.infer<typeof existingOpportunityInteractionSchema>
export type NewOpportunityInteractionFormData = z.infer<typeof newOpportunityInteractionSchema>

// Principal-related types
export type PrincipalInfoFormData = z.infer<typeof principalInfoSchema>

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
    bg: 'bg-warning/10', 
    text: 'text-warning',
    border: 'border-warning/20',
    badge: 'bg-warning text-warning-foreground',
  },
  'B': {
    bg: 'bg-warning/5',
    text: 'text-warning/80', 
    border: 'border-warning/10',
    badge: 'bg-warning/80 text-warning-foreground',
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

/**
 * Interaction Validation Class
 * Static methods for interaction validation following established patterns
 */
export class InteractionValidation {
  /**
   * Validate interaction data against main schema
   */
  static validate(data: unknown): InteractionFormData {
    const result = interactionSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Interaction validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate interaction with opportunity creation data
   */
  static validateWithOpportunity(data: unknown): InteractionWithOpportunityFormData {
    const result = interactionWithOpportunitySchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Interaction with opportunity validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate interaction create data
   */
  static validateCreate(data: unknown): InteractionCreateFormData {
    const result = interactionCreateSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Interaction create validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Validate interaction update data
   */
  static validateUpdate(data: unknown): InteractionUpdateFormData {
    const result = interactionUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Interaction update validation failed: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Safe validation with detailed error information
   */
  static safeParse(data: unknown) {
    return interactionSchema.safeParse(data)
  }

  /**
   * Safe validation for opportunity creation schema
   */
  static safeParseWithOpportunity(data: unknown) {
    return interactionWithOpportunitySchema.safeParse(data)
  }

  /**
   * Get validation errors in user-friendly format
   */
  static getValidationErrors(data: unknown): string[] {
    const result = interactionSchema.safeParse(data)
    if (result.success) return []

    return result.error.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    )
  }

  /**
   * Validate partial data (for update operations)
   */
  static validatePartial(data: unknown) {
    return interactionUpdateSchema.safeParse(data)
  }

  /**
   * Validate opportunity creation mode logic
   * Ensures proper field requirements based on create_opportunity flag
   */
  static validateOpportunityMode(
    createOpportunity: boolean,
    opportunityId?: string | null,
    opportunityName?: string | null,
    organizationId?: string | null
  ): boolean {
    if (createOpportunity) {
      // When creating opportunity: must have organization_id and opportunity_name
      return !!(organizationId && opportunityName)
    } else {
      // When using existing opportunity: must have opportunity_id
      return !!opportunityId
    }
  }

  /**
   * Validate follow-up logic
   * Ensures follow_up_date is provided when follow_up_required is true
   */
  static validateFollowUpLogic(followUpRequired: boolean, followUpDate?: string | null): boolean {
    if (followUpRequired) {
      return !!(followUpDate && followUpDate.trim())
    }
    return true // Not required, so always valid
  }

  /**
   * Validate priority level
   * Ensures priority is one of the valid enum values
   */
  static validatePriority(priority?: string | null): boolean {
    if (!priority) return true // Priority is nullable
    return ['A+', 'A', 'B', 'C', 'D'].includes(priority)
  }

  /**
   * Validate principals array
   * Ensures all principals have valid UUIDs and required fields
   */
  static validatePrincipals(principals: unknown[]): boolean {
    if (!Array.isArray(principals)) return false
    if (principals.length > 4) return false

    return principals.every(principal => {
      if (typeof principal !== 'object' || !principal) return false
      const p = principal as Record<string, unknown>

      // Check required fields
      if (!p.id || typeof p.id !== 'string') return false
      if (!p.name || typeof p.name !== 'string') return false

      // Check UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return uuidRegex.test(p.id as string)
    })
  }

  /**
   * Validate cross-entity relationships
   * Ensures UUIDs exist and are properly formatted for related entities
   */
  static validateCrossEntityRelationships(data: {
    organization_id?: string | null
    contact_id?: string | null
    opportunity_id?: string | null
    principal_organization_id?: string | null
  }): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    // Check each UUID if present
    if (data.organization_id && !uuidRegex.test(data.organization_id)) return false
    if (data.contact_id && !uuidRegex.test(data.contact_id)) return false
    if (data.opportunity_id && !uuidRegex.test(data.opportunity_id)) return false
    if (data.principal_organization_id && !uuidRegex.test(data.principal_organization_id)) return false

    return true
  }

  /**
   * Transform for handling form data to database format
   * Removes virtual fields and prepares for database insertion
   */
  static transformForDatabase(formData: InteractionFormData): Omit<InteractionFormData, 'principals'> {
    const { principals, ...interactionData } = formData
    return interactionData
  }

  /**
   * Extract opportunity data from new opportunity interaction
   * For creating opportunity records when create_opportunity is true
   */
  static extractOpportunityData(formData: NewOpportunityInteractionFormData) {
    return {
      name: formData.opportunity_name,
      stage: formData.opportunity_stage,
      organization_id: formData.organization_id,
      contact_id: formData.contact_id,
      principal_organization_id: formData.principal_organization_id,
      context: formData.opportunity_context,
      // Set defaults for required fields
      priority: 'C' as const,
      probability: 25, // Default probability for new leads
      estimated_value: null,
      close_date: null,
      source: 'interaction_created' as const,
    }
  }

  /**
   * Validate business rules for interaction creation
   * Comprehensive business logic validation beyond schema validation
   */
  static validateBusinessRules(data: InteractionFormData | InteractionWithOpportunityFormData): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Priority system business rules
    if (data.type === 'in_person' || data.type === 'quoted') {
      if (!data.priority || (data.priority !== 'A+' && data.priority !== 'A')) {
        errors.push('High-value interactions (in-person, quoted) should have A+ or A priority')
      }
    }

    // Follow-up business rules
    if (data.outcome === 'follow_up_needed' && !data.follow_up_required) {
      errors.push('Follow-up should be marked as required when outcome is "follow_up_needed"')
    }

    // Duration validation for specific types
    if ((data.type === 'meeting' || data.type === 'demo') && !data.duration_minutes) {
      errors.push('Meeting and demo interactions should specify duration')
    }

    // Account manager assignment rules
    if (data.priority === 'A+' && !data.account_manager) {
      errors.push('A+ priority interactions should have an assigned account manager')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get priority color configuration for UI integration
   * Maintains compatibility with existing PRIORITY_COLORS system
   */
  static getPriorityColors(priority: string) {
    const colors = {
      'A+': {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
        badge: 'bg-destructive text-destructive-foreground',
      },
      'A': {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning/20',
        badge: 'bg-warning text-warning-foreground',
      },
      'B': {
        bg: 'bg-warning/5',
        text: 'text-warning/80',
        border: 'border-warning/10',
        badge: 'bg-warning/80 text-warning-foreground',
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

    return colors[priority as keyof typeof colors] || colors.C
  }
}
