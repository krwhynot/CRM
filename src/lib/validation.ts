/**
 * Validation Utilities
 * Consolidated validation functions to avoid duplication across the codebase
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates phone number format (US format)
 * @param phone - Phone number to validate
 * @returns true if phone is valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  // Check if it's 10 or 11 digits (with or without country code)
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns true if URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates that a string is not empty after trimming
 * @param value - String to validate
 * @returns true if string has content, false otherwise
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0
}

/**
 * Validates that a value is within a numeric range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if value is within range, false otherwise
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}
