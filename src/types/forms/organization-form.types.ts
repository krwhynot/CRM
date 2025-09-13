/**
 * Organization Form Types and Default Values
 *
 * Provides type-safe default values that align with the organization schema expectations.
 * This ensures React Hook Form defaults match Zod schema validation rules.
 */

import type { OrganizationFormData } from '../organization.types'

/**
 * Default values for organization form that align with schema expectations
 * All nullable fields default to null instead of empty strings
 * Required fields have appropriate default values
 */
export const defaultOrganizationFormValues: OrganizationFormData = {
  // Required fields
  name: '',
  type: 'customer', // Default to a valid type instead of empty string
  priority: 'C',
  segment: '',

  // Boolean fields with defaults
  is_principal: false,
  is_distributor: false,

  // Optional fields - using null for nullable schema fields
  description: null,
  email: null,
  phone: null,
  website: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  state_province: null,
  postal_code: null,
  country: null,
  industry: null,
  notes: null,
}

/**
 * Creates default values with optional overrides
 * Ensures type safety while allowing partial customization
 */
export const createOrganizationFormDefaults = (
  overrides: Partial<OrganizationFormData> = {}
): OrganizationFormData => {
  return {
    ...defaultOrganizationFormValues,
    ...overrides,
  }
}

/**
 * Helper to create defaults for specific organization types
 */
export const createPrincipalOrganizationDefaults = (
  overrides: Partial<OrganizationFormData> = {}
): OrganizationFormData => {
  return createOrganizationFormDefaults({
    type: 'principal',
    is_principal: true,
    priority: 'A',
    ...overrides,
  })
}

export const createDistributorOrganizationDefaults = (
  overrides: Partial<OrganizationFormData> = {}
): OrganizationFormData => {
  return createOrganizationFormDefaults({
    type: 'distributor',
    is_distributor: true,
    priority: 'B',
    ...overrides,
  })
}

export const createCustomerOrganizationDefaults = (
  overrides: Partial<OrganizationFormData> = {}
): OrganizationFormData => {
  return createOrganizationFormDefaults({
    type: 'customer',
    priority: 'C',
    ...overrides,
  })
}

/**
 * Type guard to validate organization form data shape
 */
export const isOrganizationFormData = (data: unknown): data is OrganizationFormData => {
  return Boolean(
    data &&
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      'type' in data &&
      'priority' in data &&
      'segment' in data &&
      typeof (data as Record<string, unknown>).name === 'string' &&
      typeof (data as Record<string, unknown>).type === 'string' &&
      typeof (data as Record<string, unknown>).priority === 'string' &&
      typeof (data as Record<string, unknown>).segment === 'string'
  )
}

export type { OrganizationFormData }
