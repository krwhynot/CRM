import { useEntitySelection } from '@/hooks/useEntitySelection'
import type { InteractionWithRelations } from '@/types/interaction.types'

/**
 * Interactions multi-selection hook
 *
 * Provides consistent multi-selection capabilities for interactions
 * using the generic useEntitySelection pattern. Supports bulk operations
 * like export, delete, and modify.
 *
 * @returns Multi-selection state and handlers for interactions
 */
export const useInteractionsSelection = () => {
  return useEntitySelection<InteractionWithRelations>()
}