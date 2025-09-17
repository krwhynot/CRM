/**
 * Form Transform Utilities
 *
 * Zod-based transform utilities for form validation and data processing.
 * Provides consistent patterns for handling form data transformations.
 */

import { z } from 'zod'

/**
 * Zod transform utilities using preprocessing and transform methods
 * These provide comprehensive form data transformation patterns
 */
// Export with both names for compatibility
export const ZodTransforms = {
  // Standard nullable string field (most common pattern)
  nullableString: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return null
    return typeof val === 'string' ? val : null
  }, z.string().nullable()),

  // Required string field that trims whitespace
  requiredString: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') {
      throw new Error('Value is required')
    }
    return val.trim()
  }, z.string()),

  // Nullable number field with empty string handling
  nullableNumber: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }, z.number().nullable()),

  // Nullable email field with normalization
  nullableEmail: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return null
    return val.trim().toLowerCase()
  }, z.string().email().nullable()),

  // Nullable phone field with normalization
  nullablePhone: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return null
    // Remove all non-digit characters
    const digits = val.replace(/\D/g, '')
    return digits === '' ? null : digits
  }, z.string().nullable()),

  // Nullable URL field
  nullableUrl: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return null
    return typeof val === 'string' ? val : null
  }, z.string().url().nullable()),

  // Array field that preserves empty arrays
  optionalArray: <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.preprocess((val) => {
      if (val === null || val === undefined) return []
      if (Array.isArray(val)) {
        return val.filter((item) => item !== undefined)
      }
      return []
    }, z.array(itemSchema)),

  // Array field that becomes null when empty
  nullableArray: <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.preprocess((val) => {
      if (Array.isArray(val) && val.length === 0) return null
      return val
    }, z.array(itemSchema).nullable()),

  // Boolean field with string conversion
  booleanField: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.toLowerCase() === 'true'
    }
    return Boolean(val)
  }, z.boolean()),

  // UUID field with validation
  uuidField: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return null
    const trimmed = val.trim()
    // Basic UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(trimmed) ? trimmed : null
  }, z.string().uuid().nullable()),

  // Alias for normalizeUuid (matches Yup transform naming)
  normalizeUuid: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return null
    const trimmed = val.trim()
    // Basic UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(trimmed) ? trimmed : null
  }, z.string().uuid().nullable()),

  // String trimming and nullification
  trimAndNullify: z.preprocess((val) => {
    if (typeof val !== 'string') return null
    const trimmed = val.trim()
    return trimmed === '' ? null : trimmed
  }, z.string().nullable()),

  // Conditional validation for Zod schemas
  // Returns a function that can be used in .refine() with the parent data context
  // Usage: .refine(ZodTransforms.conditionalRequired(data, 'mode', 'create'), { message: 'Required when creating' })
  conditionalRequired: <TData extends Record<string, any>>(
    parentData: TData,
    conditionField: keyof TData,
    conditionValue: any
  ) => {
    return (val: any) => {
      const shouldBeRequired = parentData[conditionField] === conditionValue
      if (shouldBeRequired) {
        return val !== null && val !== undefined && val !== ''
      }
      return true // Not required, so always valid
    }
  },

  // Alternative approach using discriminated union factory
  // This is the preferred Zod pattern for complex conditional validation
  createConditionalSchema: <TBase extends z.ZodRawShape>(
    baseFields: TBase,
    discriminator: keyof TBase,
    conditionalCases: Record<string, Partial<TBase>>
  ) => {
    const cases = Object.entries(conditionalCases).map(([value, additionalFields]) => {
      return z.object({
        ...baseFields,
        ...additionalFields,
        [discriminator]: z.literal(value),
      })
    })
    return z.discriminatedUnion(discriminator as any, cases as any)
  },

  // Empty string to null transform for optional fields
  emptyToNull: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return null
    return val
  }, z.string().nullable()),

  // Positive number with null handling
  positiveNumber: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }, z.number().positive().nullable()),

  // Integer with null handling
  nullableInt: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    const num = Number(val)
    return isNaN(num) ? null : Math.floor(num)
  }, z.number().int().nullable()),
}

/**
 * Schema factory functions for common patterns
 * These help create Zod schemas with consistent transform behavior
 */
export const SchemaFactories = {
  // Creates a nullable string schema with empty string → null transform
  nullableString: (constraints?: {
    min?: number
    max?: number
    regex?: RegExp
    message?: string
  }) =>
    FormTransforms.nullableString.refine(
      (val) => {
        if (val === null) return true
        if (constraints?.min && val.length < constraints.min) return false
        if (constraints?.max && val.length > constraints.max) return false
        if (constraints?.regex && !constraints.regex.test(val)) return false
        return true
      },
      { message: constraints?.message || 'Invalid input' }
    ),

  // Creates a nullable email schema with normalization
  nullableEmail: (required = false) => {
    const schema = FormTransforms.nullableEmail
    return required
      ? schema.refine((val) => val !== null, { message: 'Email is required' })
      : schema
  },

  // Creates a nullable phone schema with normalization
  nullablePhone: (required = false) => {
    const schema = FormTransforms.nullablePhone
    return required
      ? schema.refine((val) => val !== null, { message: 'Phone number is required' })
      : schema
  },

  // Creates a UUID schema with null handling
  nullableUuid: (required = false) => {
    const schema = FormTransforms.uuidField
    return required ? schema.refine((val) => val !== null, { message: 'ID is required' }) : schema
  },

  // Creates a discriminated union for conditional validation
  conditionalSchema: <T extends Record<string, any>>(
    discriminator: keyof T,
    cases: Record<string | number, z.ZodObject<any>>
  ) => {
    const schemas = Object.entries(cases).map(([value, schema]) =>
      schema.extend({ [discriminator]: z.literal(value) })
    )
    return z.discriminatedUnion(discriminator as any, schemas as any)
  },
}

// Export with both names for backward compatibility
export const FormTransforms = ZodTransforms

export default ZodTransforms
