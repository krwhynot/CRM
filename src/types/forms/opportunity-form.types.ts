/**
 * Opportunity Form Types and Default Values
 *
 * Provides type-safe default values that align with the opportunity schema expectations.
 * This ensures React Hook Form defaults match Zod schema validation rules.
 */

import { DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'
import type { OpportunityFormData } from '../opportunity.types'

/**
 * Default values for opportunity form that align with schema expectations
 * All nullable fields default to null instead of empty strings
 * Required fields have appropriate default values
 */
export const defaultOpportunityFormValues: OpportunityFormData = {
  // Required fields
  name: '',
  organization_id: '',
  estimated_value: 0,
  stage: DEFAULT_OPPORTUNITY_STAGE,
  status: 'Active',

  // Optional fields - using null for nullable schema fields
  contact_id: null,
  estimated_close_date: null,
  description: null,
  notes: null,

  // Principal CRM fields (optional for compatibility)
  principals: [],
  product_id: null,
  opportunity_context: null,
  auto_generated_name: false,
  principal_id: null,
  probability: null,
  deal_owner: null,
}

/**
 * Creates default values with optional overrides
 * Ensures type safety while allowing partial customization
 */
export const createOpportunityFormDefaults = (
  overrides: Partial<OpportunityFormData> = {}
): OpportunityFormData => {
  return {
    ...defaultOpportunityFormValues,
    ...overrides,
  }
}

/**
 * Helper to create defaults with preselected organization
 */
export const createOpportunityFormDefaultsWithOrganization = (
  organizationId: string,
  overrides: Partial<OpportunityFormData> = {}
): OpportunityFormData => {
  return createOpportunityFormDefaults({
    organization_id: organizationId,
    ...overrides,
  })
}

/**
 * Helper to create defaults with preselected organization and contact
 */
export const createOpportunityFormDefaultsWithContact = (
  organizationId: string,
  contactId: string,
  overrides: Partial<OpportunityFormData> = {}
): OpportunityFormData => {
  return createOpportunityFormDefaults({
    organization_id: organizationId,
    contact_id: contactId,
    ...overrides,
  })
}

/**
 * Helper to create defaults for different opportunity stages
 */
export const createDiscoveryOpportunityDefaults = (
  overrides: Partial<OpportunityFormData> = {}
): OpportunityFormData => {
  return createOpportunityFormDefaults({
    stage: 'Initial Outreach',
    probability: null,
    ...overrides,
  })
}

export const createProposalOpportunityDefaults = (
  overrides: Partial<OpportunityFormData> = {}
): OpportunityFormData => {
  return createOpportunityFormDefaults({
    stage: 'Sample/Visit Offered',
    probability: 25,
    ...overrides,
  })
}

export const createNegotiationOpportunityDefaults = (
  overrides: Partial<OpportunityFormData> = {}
): OpportunityFormData => {
  return createOpportunityFormDefaults({
    stage: 'Demo Scheduled',
    probability: 75,
    ...overrides,
  })
}

/**
 * Type guard to validate opportunity form data shape
 */
export const isOpportunityFormData = (data: unknown): data is OpportunityFormData => {
  return Boolean(
    data &&
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      'organization_id' in data &&
      'stage' in data &&
      'status' in data &&
      typeof (data as Record<string, unknown>).name === 'string' &&
      typeof (data as Record<string, unknown>).organization_id === 'string' &&
      typeof (data as Record<string, unknown>).stage === 'string' &&
      typeof (data as Record<string, unknown>).status === 'string' &&
      ('estimated_value' in data
        ? typeof (data as Record<string, unknown>).estimated_value === 'number' ||
          (data as Record<string, unknown>).estimated_value === null
        : true)
  )
}

export type { OpportunityFormData }
