import { useMemo } from 'react'
import type { InteractionWithRelations } from '@/types/entities'

const INITIAL_DISPLAY_COUNT = 5

interface UseInteractionTimelineDataProps {
  interactions: InteractionWithRelations[]
  showAllInteractions: boolean
}

interface UseInteractionTimelineDataReturn {
  displayedInteractions: InteractionWithRelations[]
  hasMore: boolean
  remaining: number
}

export const useInteractionTimelineData = ({
  interactions,
  showAllInteractions,
}: UseInteractionTimelineDataProps): UseInteractionTimelineDataReturn => {
  const displayedInteractions = useMemo(() => {
    return showAllInteractions ? interactions : interactions.slice(0, INITIAL_DISPLAY_COUNT)
  }, [interactions, showAllInteractions])

  const hasMore = useMemo(() => interactions.length > INITIAL_DISPLAY_COUNT, [interactions.length])

  const remaining = useMemo(
    () => interactions.length - INITIAL_DISPLAY_COUNT,
    [interactions.length]
  )

  return {
    displayedInteractions,
    hasMore,
    remaining,
  }
}
