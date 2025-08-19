/**
 * Organization utility functions for the CRM system
 */

/**
 * Derives the is_principal and is_distributor boolean flags from the organization type.
 * This function ensures consistency between the type field and the legacy boolean fields.
 * 
 * @param type - The organization type from the dropdown selection
 * @returns Object with derived boolean flags
 */
export function deriveOrganizationFlags(type: string) {
  return {
    is_principal: type === 'principal',
    is_distributor: type === 'distributor'
  }
}

/**
 * Validates that an organization's type field is consistent with its boolean flags.
 * Used for data integrity checks and debugging.
 * 
 * @param type - The organization type
 * @param is_principal - The is_principal boolean flag
 * @param is_distributor - The is_distributor boolean flag
 * @returns true if consistent, false otherwise
 */
export function validateOrganizationTypeConsistency(
  type: string, 
  is_principal: boolean, 
  is_distributor: boolean
): boolean {
  const derived = deriveOrganizationFlags(type)
  return derived.is_principal === is_principal && derived.is_distributor === is_distributor
}

/**
 * Type guard to check if an organization type is valid
 */
export function isValidOrganizationType(type: string): type is 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor' {
  return ['customer', 'principal', 'distributor', 'prospect', 'vendor'].includes(type)
}