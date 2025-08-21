/**
 * Form Transform Utilities
 * 
 * Reusable transform functions for Yup schemas to handle common type conversion
 * patterns and prevent TypeScript type mismatches between forms and validation.
 */

/**
 * Transforms empty strings to null values
 * Essential for nullable fields where HTML inputs produce empty strings
 * but database/validation expects null for "empty" values
 */
export const emptyStringToNull = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  return typeof value === 'string' ? value : null
}

/**
 * Transforms empty strings to null for number fields
 * Handles cases where number inputs can be empty strings
 */
export const emptyStringToNullNumber = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const num = Number(value)
  return isNaN(num) ? null : num
}

/**
 * Transforms empty strings to null for URL fields
 * Ensures proper URL validation while handling empty inputs
 */
export const emptyStringToNullUrl = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  return typeof value === 'string' ? value : null
}

/**
 * Transforms empty arrays to null
 * Useful for optional array fields that should be null when empty
 */
export const emptyArrayToNull = <T>(value: T[]): T[] | null => {
  if (Array.isArray(value) && value.length === 0) {
    return null
  }
  return value
}

/**
 * Transforms empty arrays to empty array (preserves array type)
 * Useful for required array fields that should never be null
 */
export const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : []
}

/**
 * Transforms boolean strings to actual booleans
 * Handles form inputs that might send boolean values as strings
 */
export const stringToBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return Boolean(value)
}

/**
 * Trims whitespace from strings and converts empty to null
 * Comprehensive string cleaning for form inputs
 */
export const trimAndNullify = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Phone number normalizer - removes non-digits and formats
 * Handles various phone input formats
 */
export const normalizePhone = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')
  return digits === '' ? null : digits
}

/**
 * Email normalizer - converts to lowercase and trims
 */
export const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  return value.trim().toLowerCase()
}

/**
 * UUID validator transform - ensures proper UUID format or null
 */
export const normalizeUuid = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const trimmed = value.trim()
  // Basic UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(trimmed) ? trimmed : null
}

/**
 * Transform factory for conditional required fields
 * Returns a transform that makes field required when condition is met
 */
export const conditionalTransform = <T, TValues = Record<string, unknown>>(
  condition: (allValues: TValues) => boolean,
  requiredTransform: (value: unknown) => T,
  optionalTransform: (value: unknown) => T | null = ((value: unknown) => emptyStringToNull(value) as T | null)
) => {
  return function(this: { parent: TValues }, value: unknown) {
    const isRequired = condition(this.parent)
    return isRequired ? requiredTransform(value) : optionalTransform(value)
  }
}

/**
 * Common transform combinations for typical form fields
 */
export const FormTransforms = {
  // Standard nullable string field (most common)
  nullableString: emptyStringToNull,
  
  // Required string field that trims whitespace
  requiredString: (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('Value is required')
    }
    return value.trim()
  },
  
  // Nullable number field
  nullableNumber: emptyStringToNullNumber,
  
  // Nullable email field with normalization
  nullableEmail: normalizeEmail,
  
  // Nullable phone field with normalization
  nullablePhone: normalizePhone,
  
  // Nullable URL field
  nullableUrl: emptyStringToNullUrl,
  
  // Array field that preserves empty arrays
  optionalArray: ensureArray,
  
  // Array field that becomes null when empty
  nullableArray: emptyArrayToNull,
  
  // Boolean field with string conversion
  booleanField: stringToBoolean,
  
  // UUID field with validation
  uuidField: normalizeUuid
}

/**
 * Type guard to check if a value is a valid transform function
 */
export const isTransformFunction = (value: unknown): value is Function => {
  return typeof value === 'function'
}

/**
 * Development helper to log transform operations
 * Only active in development mode
 */
export const debugTransform = (transformName: string, originalValue: unknown, transformedValue: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Transform [${transformName}]:`, {
      original: originalValue,
      transformed: transformedValue,
      changed: originalValue !== transformedValue
    })
  }
}

export default FormTransforms