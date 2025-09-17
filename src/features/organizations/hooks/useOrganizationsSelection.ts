import { useEntitySelection } from '@/hooks/useEntitySelection'
import type { Organization } from '@/types/entities'

/**
 * Organizations multi-selection hook
 *
 * Provides consistent multi-selection capabilities for organizations
 * using the generic useEntitySelection pattern. Supports bulk operations
 * like export, delete, and modify.
 *
 * @returns Multi-selection state and handlers for organizations
 */
export const useOrganizationsSelection = () => {
  return useEntitySelection<Organization>()
}
