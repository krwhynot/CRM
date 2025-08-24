import { useMemo } from 'react'
import type { Organization } from '@/types/entities'

interface UsePrincipalPriorityReturn {
  priority: string
  priorityColor: string
}

/**
 * Maps organization size to priority level for business intelligence
 */
const getPriorityFromSize = (size: string | null): string => {
  switch (size) {
    case 'enterprise':
      return 'A+'
    case 'large':
      return 'A'
    case 'medium':
      return 'B'
    case 'small':
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
    const priority = getPriorityFromSize(principal.size)
    const priorityColor = getPriorityColor(priority)
    
    return { priority, priorityColor }
  }, [principal.size])

  return {
    priority,
    priorityColor
  }
}