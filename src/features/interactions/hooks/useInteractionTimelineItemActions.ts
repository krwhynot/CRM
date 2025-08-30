import React, { useCallback } from 'react'

interface UseInteractionTimelineItemActionsProps {
  interactionType: string
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
}

interface UseInteractionTimelineItemActionsReturn {
  handleDelete: (e: React.MouseEvent) => void
  handleEdit: (e: React.MouseEvent) => void
  handleMarkComplete: (e: React.MouseEvent) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleItemClick: (e: React.MouseEvent) => void
}

export const useInteractionTimelineItemActions = ({
  interactionType,
  onToggleExpand,
  onEdit,
  onDelete,
}: UseInteractionTimelineItemActionsProps): UseInteractionTimelineItemActionsReturn => {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (window.confirm(`Are you sure you want to delete this ${interactionType}?`)) {
        onDelete()
      }
    },
    [interactionType, onDelete]
  )

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
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
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggleExpand()
      }
    },
    [onToggleExpand]
  )

  const handleItemClick = useCallback(
    (e: React.MouseEvent) => {
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
