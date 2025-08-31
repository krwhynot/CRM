/**
 * Form Types Index
 *
 * Centralized exports for all form types and default value factories.
 * This provides a single import location for form-related utilities.
 */

// Contact form types and defaults
export type { ContactFormData } from './contact-form.types'
export {
  defaultContactFormValues,
  createContactFormDefaults,
  createContactFormDefaultsWithOrganization,
  isContactFormData,
} from './contact-form.types'

// Organization form types and defaults
export type { OrganizationFormData } from './organization-form.types'
export {
  defaultOrganizationFormValues,
  createOrganizationFormDefaults,
  createPrincipalOrganizationDefaults,
  createDistributorOrganizationDefaults,
  createCustomerOrganizationDefaults,
  isOrganizationFormData,
} from './organization-form.types'

// Opportunity form types and defaults
export type { OpportunityFormData } from './opportunity-form.types'
export {
  defaultOpportunityFormValues,
  createOpportunityFormDefaults,
  createOpportunityFormDefaultsWithOrganization,
  createOpportunityFormDefaultsWithContact,
  createDiscoveryOpportunityDefaults,
  createProposalOpportunityDefaults,
  createNegotiationOpportunityDefaults,
  isOpportunityFormData,
} from './opportunity-form.types'

// Re-export additional form data types from validation.ts for convenience
export type {
  ProductFormData,
  OpportunityProductFormData,
  ContactPreferredPrincipalFormData,
} from '../validation'

// Export form handler types and utilities
export type {
  FormSubmitHandler,
  FormValidationError,
  TypedYupResolver,
  EnhancedFormProps,
  FormStateManager,
  FormValidationConfig,
  FormValidationFeedbackReturn,
  FieldValidationIndicatorProps,
  FormDataWithComputed,
  FormSubmissionResult,
  AsyncFormHandler,
  FormComponentRef,
  TypedFormConfig,
  FormFieldRenderProps,
  FormFieldProps,
  FormSection,
  ProgressiveFormConfig,
} from './form-handlers'

export { createTypedYupResolver } from './form-handlers'

// Re-export individual form data types for direct access
import type { ContactFormData as ContactFormDataType } from './contact-form.types'
import type { OrganizationFormData as OrganizationFormDataType } from './organization-form.types'
import type { OpportunityFormData as OpportunityFormDataType } from './opportunity-form.types'

/**
 * Union type of all form data types
 * Useful for generic form handling utilities
 */
export type AnyFormData = ContactFormDataType | OrganizationFormDataType | OpportunityFormDataType

// Re-export individual form data types for direct access
import { isContactFormData } from './contact-form.types'
import { isOrganizationFormData } from './organization-form.types'
import { isOpportunityFormData } from './opportunity-form.types'

/**
 * Type guard to check if data is any form data type
 */
export const isFormData = (data: unknown): data is AnyFormData => {
  return isContactFormData(data) || isOrganizationFormData(data) || isOpportunityFormData(data)
}

/**
 * Common form field types for reuse
 */
export interface BaseFormProps<T> {
  onSubmit: (data: T) => void | Promise<void>
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string
}

/**
 * Form props with preselection support
 */
export interface FormPropsWithPreselection<T> extends BaseFormProps<T> {
  preselectedOrganization?: string
  preselectedContact?: string
}

/**
 * Common form field validation patterns
 */
export const FormValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-().]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  url: /^https?:\/\/.+/,
}

/**
 * Form field requirements by entity type
 */
export const FormFieldRequirements = {
  contact: {
    required: [
      'first_name',
      'last_name',
      'organization_id',
      'purchase_influence',
      'decision_authority',
    ],
    nullable: [
      'email',
      'title',
      'department',
      'phone',
      'mobile_phone',
      'linkedin_url',
      'notes',
      'role',
    ],
    boolean: ['is_primary_contact'],
    array: ['preferred_principals'],
  },
  organization: {
    required: ['name', 'type', 'priority', 'segment'],
    nullable: ['city', 'state_province', 'phone', 'website', 'account_manager', 'notes'],
    boolean: ['is_principal', 'is_distributor'],
    array: [],
  },
  opportunity: {
    required: ['name', 'organization_id', 'estimated_value', 'stage', 'status'],
    nullable: [
      'contact_id',
      'estimated_close_date',
      'description',
      'notes',
      'product_id',
      'opportunity_context',
      'principal_id',
      'probability',
      'deal_owner',
    ],
    boolean: ['auto_generated_name'],
    array: ['principals'],
  },
} as const
