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
      return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive'
    case 'A':
      return 'bg-warning hover:bg-warning/90 text-warning-foreground border-warning'
    case 'B':
      return 'bg-warning hover:bg-warning/90 text-warning-foreground border-warning'
    case 'C':
      return 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
    case 'D':
      return 'bg-muted hover:bg-muted/90 text-muted-foreground border-muted'
    default:
      return 'bg-muted hover:bg-muted/90 text-muted-foreground border-muted'
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
