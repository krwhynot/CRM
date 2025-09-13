import { useCallback } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'

interface UseInteractionTimelineItemActionsProps {
  interactionType: string
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
}

interface UseInteractionTimelineItemActionsReturn {
  handleDelete: (e: MouseEvent) => void
  handleEdit: (e: MouseEvent) => void
  handleMarkComplete: (e: MouseEvent) => void
  handleKeyDown: (e: KeyboardEvent) => void
  handleItemClick: (e: MouseEvent) => void
}

export const useInteractionTimelineItemActions = ({
  interactionType,
  onToggleExpand,
  onEdit,
  onDelete,
}: UseInteractionTimelineItemActionsProps): UseInteractionTimelineItemActionsReturn => {
  const handleDelete = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      if (window.confirm(`Are you sure you want to delete this ${interactionType}?`)) {
        onDelete()
      }
    },
    [interactionType, onDelete]
  )

  const handleEdit = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      onEdit()
    },
    [onEdit]
  )

  const handleMarkComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    // Future: Implement mark complete functionality
    // Mark complete feature not yet implemented
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggleExpand()
      }
    },
    [onToggleExpand]
  )

  const handleItemClick = useCallback(
    (e: MouseEvent) => {
      // Don't toggle if clicking on buttons or dropdown
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('[role="menuitem"]')) {
        return
      }
      onToggleExpand()
    },
    [onToggleExpand]
  )

  return {
    handleDelete,
    handleEdit,
    handleMarkComplete,
    handleKeyDown,
    handleItemClick,
  }
}
