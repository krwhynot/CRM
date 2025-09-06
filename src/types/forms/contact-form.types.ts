/**
 * Contact Form Types and Default Values
 *
 * Provides type-safe default values that align with the contact schema expectations.
 * This ensures React Hook Form defaults match Yup schema validation rules.
 */

import type { ContactFormData } from '../contact.types'

/**
 * Default values for contact form that align with schema expectations
 * All nullable fields default to null instead of empty strings
 * Required fields have appropriate default values
 */
export const defaultContactFormValues: ContactFormData = {
  // Required fields
  first_name: '',
  last_name: '',
  organization_id: '',
  purchase_influence: 'Unknown',
  decision_authority: 'Gatekeeper',
  
  // Organization mode - defaults to existing
  organization_mode: 'existing',

  // Optional role field
  role: null,

  // Optional fields - using null for nullable schema fields
  email: null,
  title: null,
  department: null,
  phone: null,
  mobile_phone: null,
  linkedin_url: null,
  is_primary_contact: false,
  notes: null,

  // Virtual fields
  preferred_principals: [],
  
  // Organization creation fields (for new organization mode)
  organization_name: null,
  organization_type: null,
  organization_phone: null,
  organization_email: null,
  organization_website: null,
  organization_notes: null,
}

/**
 * Creates default values with optional overrides
 * Ensures type safety while allowing partial customization
 */
export const createContactFormDefaults = (
  overrides: Partial<ContactFormData> = {}
): ContactFormData => {
  return {
    ...defaultContactFormValues,
    ...overrides,
  }
}

/**
 * Helper to create defaults with preselected organization
 */
export const createContactFormDefaultsWithOrganization = (
  organizationId: string,
  overrides: Partial<ContactFormData> = {}
): ContactFormData => {
  return createContactFormDefaults({
    organization_id: organizationId,
    ...overrides,
  })
}

/**
 * Type guard to validate contact form data shape
 */
export const isContactFormData = (data: unknown): data is ContactFormData => {
  return Boolean(
    data &&
      typeof data === 'object' &&
      data !== null &&
      'first_name' in data &&
      'last_name' in data &&
      'organization_id' in data &&
      typeof (data as Record<string, unknown>).first_name === 'string' &&
      typeof (data as Record<string, unknown>).last_name === 'string' &&
      typeof (data as Record<string, unknown>).organization_id === 'string' &&
      ('role' in data
        ? (data as Record<string, unknown>).role === null ||
          typeof (data as Record<string, unknown>).role === 'string'
        : true)
  )
}

export type { ContactFormData }
