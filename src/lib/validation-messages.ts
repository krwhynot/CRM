/**
 * Centralized validation messages for the CRM system
 * 
 * This file provides consistent validation error messages across all forms
 * following the New-Forms-Checklist Phase 4.2 requirements.
 */

export interface ValidationMessages {
  required: (field: string) => string
  email: string
  phone: string
  url: string
  min: (field: string, min: number) => string
  max: (field: string, max: number) => string
  pattern: (field: string) => string
}

/**
 * Standard validation messages used throughout the CRM
 * 
 * @example
 * ```typescript
 * import { VALIDATION } from '@/lib/validation-messages'
 * 
 * // In a Yup schema
 * .required(VALIDATION.required('Email'))
 * .email(VALIDATION.email)
 * ```
 */
export const VALIDATION: ValidationMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number', 
  url: 'Please enter a valid URL',
  min: (field: string, min: number) => `${field} must be at least ${min} characters`,
  max: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  pattern: (field: string) => `Please enter a valid ${field.toLowerCase()}`,
}

// Legacy export for backward compatibility
export const validationMessages = VALIDATION

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[()]?[\d\s\-()]{10,}$/,
  url: /^https?:\/\/[^\s]+$/,
  // Common business patterns for CRM
  zipCode: /^\d{5}(-\d{4})?$/,
  sku: /^[A-Z0-9\-_]{3,20}$/i,
} as const

/**
 * Field-specific validation message builders
 */
export const buildValidation = {
  /**
   * Creates a required field message with proper capitalization
   */
  required: (fieldName: string): string => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
    return VALIDATION.required(formatted)
  },

  /**
   * Creates a minimum length message
   */
  minLength: (fieldName: string, min: number): string => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()  
    return VALIDATION.min(formatted, min)
  },

  /**
   * Creates a maximum length message
   */
  maxLength: (fieldName: string, max: number): string => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
    return VALIDATION.max(formatted, max)
  },

  /**
   * Creates a pattern validation message
   */
  pattern: (fieldName: string): string => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
    return VALIDATION.pattern(formatted)
  },
}