import { useMemo } from 'react'
import type { Organization } from '@/types/entities'

interface UsePrincipalPriorityReturn {
  priority: string
  priorityColor: string
}

/**
 * Maps organization priority to display priority for business intelligence
 */
const getPriorityFromPriority = (priority: string): string => {
  // The organization already has a priority field (A, B, C, D)
  // We can enhance this with + modifiers based on business logic
  switch (priority) {
    case 'A':
      return 'A+'
    case 'B':
      return 'A'
    case 'C':
      return 'B'
    case 'D':
      return 'C'
    default:
      return 'D'
  }
}

/**
 * Returns priority-based color classes for badges
 */
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'A+':
      return 'bg-red-500 hover:bg-red-600 text-white border-red-500'
    case 'A':
      return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
    case 'B':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
    case 'C':
      return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
    case 'D':
      return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500'
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500'
  }
}

export const usePrincipalPriority = (principal: Organization): UsePrincipalPriorityReturn => {
  const { priority, priorityColor } = useMemo(() => {
    const priority = getPriorityFromPriority(principal.priority)
    const priorityColor = getPriorityColor(priority)

    return { priority, priorityColor }
  }, [principal.priority])

  return {
    priority,
    priorityColor,
  }
}
