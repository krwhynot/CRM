import { useCallback } from 'react'
import type { InteractionWithRelations } from '@/types/entities'

interface UseInteractionTimelineActionsProps {
  onEditInteraction: (interaction: InteractionWithRelations) => void
  onDeleteInteraction: (interaction: InteractionWithRelations) => void
}

interface UseInteractionTimelineActionsReturn {
  handleEditInteraction: (interaction: InteractionWithRelations) => void
  handleDeleteInteraction: (interaction: InteractionWithRelations) => void
}

export const useInteractionTimelineActions = ({
  onEditInteraction,
  onDeleteInteraction
}: UseInteractionTimelineActionsProps): UseInteractionTimelineActionsReturn => {
  
  const handleEditInteraction = useCallback((interaction: InteractionWithRelations) => {
    onEditInteraction(interaction)
  }, [onEditInteraction])

  const handleDeleteInteraction = useCallback((interaction: InteractionWithRelations) => {
    onDeleteInteraction(interaction)
  }, [onDeleteInteraction])

  return {
    handleEditInteraction,
    handleDeleteInteraction
  }
}