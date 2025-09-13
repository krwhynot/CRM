import type { BaseEntity } from '../shared/BaseEntity'

/**
 * Domain-specific opportunity types
 * Extracted from existing opportunity.types.ts but focused on domain logic
 */

// Opportunity stages - database enum values
export const OPPORTUNITY_STAGES = [
  'New Lead',
  'Initial Outreach',
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won',
  'Closed - Lost',
] as const

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number]

// Opportunity status values
export const OPPORTUNITY_STATUSES = [
  'Active',
  'On Hold',
  'Closed - Won',
  'Closed - Lost',
  'Nurturing',
  'Qualified',
] as const

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

// Opportunity contexts
export const OPPORTUNITY_CONTEXTS = [
  'Site Visit',
  'Food Show',
  'New Product Interest',
  'Follow-up',
  'Demo Request',
  'Sampling',
  'Custom',
] as const

export type OpportunityContext = (typeof OPPORTUNITY_CONTEXTS)[number]

/**
 * Domain opportunity entity
 * Core business properties without database-specific fields
 */
export interface OpportunityDomain extends BaseEntity {
  name: string
  organization_id: string
  contact_id?: string | null
  principal_organization_id?: string | null
  stage: OpportunityStage
  status: OpportunityStatus
  estimated_value: number
  close_date?: string | null
  notes?: string | null
  context?: OpportunityContext | null
  stage_updated_at?: string | null
}

/**
 * Opportunity creation data
 */
export interface CreateOpportunityData {
  name: string
  organization_id: string
  contact_id?: string | null
  principal_organization_id?: string | null
  estimated_value: number
  close_date?: string | null
  notes?: string | null
  context?: OpportunityContext | null
  stage?: OpportunityStage // Optional, defaults to 'New Lead'
  status?: OpportunityStatus // Optional, defaults to 'Active'
}

/**
 * Opportunity update data
 */
export interface UpdateOpportunityData {
  name?: string
  contact_id?: string | null
  principal_organization_id?: string | null
  estimated_value?: number
  close_date?: string | null
  notes?: string | null
  context?: OpportunityContext | null
  status?: OpportunityStatus
}

/**
 * Pipeline calculation result
 */
export interface PipelineMetrics {
  totalValue: number
  activeValue: number
  wonValue: number
  lostValue: number
  stageBreakdown: Record<
    OpportunityStage,
    {
      count: number
      value: number
    }
  >
  averageDealSize: number
  winRate: number
}

/**
 * Stage transition validation result
 */
export interface StageTransitionResult {
  isValid: boolean
  reason?: string
  suggestedStage?: OpportunityStage
}

/**
 * Opportunity name generation context
 */
export interface OpportunityNameContext {
  organizationName: string
  context?: OpportunityContext
  principalName?: string
  existingOpportunityCount?: number
}
