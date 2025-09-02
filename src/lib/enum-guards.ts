import type { PriorityLevel } from '@/types/entities'

// Organization size enum (from metrics-utils.ts)
export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise'

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid PriorityLevel
 */
export function isPriorityLevel(value: unknown): value is PriorityLevel {
  return typeof value === 'string' && ['low', 'medium', 'high', 'critical'].includes(value)
}

/**
 * Type guard to check if a value is a valid OrganizationSize
 */
export function isOrganizationSize(value: unknown): value is OrganizationSize {
  return typeof value === 'string' && ['small', 'medium', 'large', 'enterprise'].includes(value)
}

// ============================================================================
// SAFE CONVERSION FUNCTIONS
// ============================================================================

/**
 * Safely convert a string to PriorityLevel with fallback
 */
export function toPriorityLevel(
  value: string | null | undefined,
  fallback: PriorityLevel | null = 'low'
): PriorityLevel | null {
  if (!value) return fallback
  return isPriorityLevel(value) ? value : fallback
}

/**
 * Safely convert a string to OrganizationSize with fallback
 */
export function toOrganizationSize(
  value: string | null | undefined,
  fallback: OrganizationSize = 'medium'
): OrganizationSize {
  if (!value) return fallback
  return isOrganizationSize(value) ? value : fallback
}

/**
 * Map organization size to priority level for business logic
 * (Moved from metrics-utils.ts for better organization)
 */
export function mapSizeToPriority(size: OrganizationSize | null | undefined): PriorityLevel {
  switch (size) {
    case 'enterprise':
      return 'critical'
    case 'large':
      return 'high'
    case 'medium':
      return 'medium'
    case 'small':
    default:
      return 'low'
  }
}

/**
 * Safely map a string size to priority level with proper type validation
 */
export function mapStringSizeToPriority(sizeString: string | null | undefined): PriorityLevel {
  const size = toOrganizationSize(sizeString, 'medium')
  return mapSizeToPriority(size)
}
