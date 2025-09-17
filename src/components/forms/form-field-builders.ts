/**
 * Form Field Builders - Utility functions for creating common form fields
 *
 * These utilities help quickly create common field configurations
 * for use with SimpleForm and other form components.
 */

import type { SimpleFormField } from './SimpleForm'

/**
 * Quick field builders for common use cases
 */
export const createTextField = (
  name: string,
  label: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'text',
  required,
})

export const createEmailField = (
  name: string,
  label: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'email',
  required,
})

export const createSelectField = (
  name: string,
  label: string,
  options: { value: string; label: string; description?: string }[],
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'select',
  options,
  required,
})

export const createTextareaField = (
  name: string,
  label: string,
  rows = 3,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'textarea',
  rows,
  required,
})

export const createNumberField = (
  name: string,
  label: string,
  min?: number,
  max?: number,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'number',
  min,
  max,
  required,
})

export const createDateField = (
  name: string,
  label: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'date',
  required,
})

export const createSwitchField = (
  name: string,
  label: string,
  switchLabel?: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'switch',
  switchLabel,
  required,
})
