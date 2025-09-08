/**
 * Organization Constants
 *
 * Extracted constants to prevent react-refresh violations and improve maintainability
 */

export const ORGANIZATION_TYPES = [
  'customer',
  'principal',
  'distributor',
  'prospect',
  'vendor',
  'unknown',
] as const

export const PRIORITY_VALUES = ['A', 'B', 'C', 'D'] as const

export const VALID_ORGANIZATION_TYPES = [
  'customer',
  'principal',
  'distributor',
  'prospect',
  'vendor',
  'unknown',
] as const

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]
export type PriorityValue = (typeof PRIORITY_VALUES)[number]
