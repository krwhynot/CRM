/**
 * Form Handler Types
 *
 * Comprehensive type definitions for form handling that eliminate the need for `any` types.
 * Provides type-safe interfaces for form submission, validation, and component props.
 */

import * as React from 'react'
import type { Resolver, FieldValues } from 'react-hook-form'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

/**
 * Generic form submission handler types
 */
export type FormSubmitHandler<T> = (data: T) => Promise<void> | void

/**
 * Form validation error structure
 */
export interface FormValidationError {
  field: string
  message: string
  type?: 'error' | 'warning'
}

/**
 * Zod resolver type that eliminates 'as any' casting
 * Properly typed wrapper for @hookform/resolvers/zod
 */
export type TypedZodResolver<T extends FieldValues> = Resolver<T>

/**
 * Creates a properly typed Zod resolver
 */
export function createTypedZodResolver<T extends FieldValues>(
  schema: z.ZodType<T, any, any>
): TypedZodResolver<T> {
  return zodResolver(schema) as TypedZodResolver<T>
}

/**
 * Base form component props interface
 */
export interface BaseFormProps<T> {
  onSubmit: FormSubmitHandler<T>
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string
}

/**
 * Form props with preselection support for entity relationships
 */
export interface FormPropsWithPreselection<T> extends BaseFormProps<T> {
  preselectedOrganization?: string
  preselectedContact?: string
  preselectedOpportunity?: string
}

/**
 * Enhanced form props with additional configuration
 */
export interface EnhancedFormProps<T> extends FormPropsWithPreselection<T> {
  className?: string
  showValidationFeedback?: boolean
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit'
}

/**
 * Form state management interface
 */
export interface FormStateManager<T> {
  data: T
  errors: Record<string, FormValidationError>
  isLoading: boolean
  isValid: boolean
  isDirty: boolean
  reset: () => void
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
}

/**
 * Form validation feedback configuration
 */
export interface FormValidationConfig {
  requiredFields: string[]
  warningValidations?: Record<string, (value: unknown) => string | null>
  showProgress?: boolean
  showFieldCount?: boolean
}

/**
 * Typed form validation feedback hook return type
 */
export interface FormValidationFeedbackReturn {
  completedFields: number
  totalFields: number
  completionPercentage: number
  hasErrors: boolean
  hasWarnings: boolean
  isValid: boolean
  warnings: FormValidationError[]
}

/**
 * Form field validation indicator props
 */
export interface FieldValidationIndicatorProps {
  hasError: boolean
  isValid: boolean
  showIndicator?: boolean
}

/**
 * Utility type for form data with computed fields
 */
export type FormDataWithComputed<T, C = {}> = T & C

/**
 * Form submission result
 */
export interface FormSubmissionResult {
  success: boolean
  data?: unknown
  error?: string
  validationErrors?: FormValidationError[]
}

/**
 * Async form submission handler with result
 */
export type AsyncFormHandler<T> = (data: T) => Promise<FormSubmissionResult>

/**
 * Form component ref interface for external control
 */
export interface FormComponentRef<T> {
  submit: () => Promise<FormSubmissionResult>
  reset: () => void
  setValues: (values: Partial<T>) => void
  getValues: () => T
  validate: () => Promise<boolean>
}

/**
 * Type-safe form hook configuration
 */
export interface TypedFormConfig<T> {
  schema: z.ZodType<T, any, any>
  defaultValues: T
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  shouldFocusError?: boolean
}

/**
 * Form field render props
 */
export interface FormFieldRenderProps<T> {
  field: {
    name: keyof T
    value: T[keyof T]
    onChange: (value: T[keyof T]) => void
    onBlur: () => void
  }
  fieldState: {
    error?: FormValidationError
    isTouched: boolean
    isDirty: boolean
  }
  formState: {
    isSubmitting: boolean
    isValid: boolean
  }
}

/**
 * Generic form field component props
 */
export interface FormFieldProps<T> {
  name: keyof T
  label: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  render: (props: FormFieldRenderProps<T>) => React.ReactNode
}

/**
 * Form section configuration for progressive disclosure
 */
export interface FormSection {
  title: string
  fields: string[]
  collapsible?: boolean
  defaultExpanded?: boolean
  description?: string
}

/**
 * Progressive form configuration
 */
export interface ProgressiveFormConfig<T> {
  sections: FormSection[]
  data: T
  validationRules?: Record<string, (value: unknown) => boolean>
}
