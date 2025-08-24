import { useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'

interface UseInteractionTimelineItemFormattingProps {
  interactionDate: string
  interactionType: string
}

interface UseInteractionTimelineItemFormattingReturn {
  formattedDate: string
  relativeTime: string
  formattedType: string
}

export const useInteractionTimelineItemFormatting = ({
  interactionDate,
  interactionType
}: UseInteractionTimelineItemFormattingProps): UseInteractionTimelineItemFormattingReturn => {
  
  const { formattedDate, relativeTime, formattedType } = useMemo(() => {
    const date = new Date(interactionDate)
    
    return {
      formattedDate: format(date, 'MMM d, yyyy'),
      relativeTime: formatDistanceToNow(date, { addSuffix: true }),
      formattedType: interactionType.charAt(0).toUpperCase() + interactionType.slice(1).replace('_', ' ')
    }
  }, [interactionDate, interactionType])

  return {
    formattedDate,
    relativeTime,
    formattedType
  }
}