import { useState, useCallback } from 'react'

interface UseInteractionTimelineStateReturn {
  showAllInteractions: boolean
  expandedItems: Set<string>
  handleToggleExpand: (interactionId: string) => void
  handleToggleShowAll: () => void
  setShowAllInteractions: (show: boolean) => void
}

export const useInteractionTimelineState = (ref?: React.RefObject<HTMLDivElement>): UseInteractionTimelineStateReturn => {
  const [showAllInteractions, setShowAllInteractions] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const handleToggleExpand = useCallback((interactionId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(interactionId)) {
        newSet.delete(interactionId)
      } else {
        newSet.add(interactionId)
      }
      return newSet
    })
  }, [])

  const handleToggleShowAll = useCallback(() => {
    setShowAllInteractions(prev => {
      const newValue = !prev
      // Scroll to top of timeline when collapsing
      if (prev && ref && 'current' in ref && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth' })
      }
      return newValue
    })
  }, [ref])

  return {
    showAllInteractions,
    expandedItems,
    handleToggleExpand,
    handleToggleShowAll,
    setShowAllInteractions
  }
}