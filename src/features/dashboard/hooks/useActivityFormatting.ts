import { useCallback } from 'react'
import { formatActivityTimestamp } from '@/lib/date-utils'

interface UseActivityFormattingReturn {
  formatTimestamp: (timestamp: Date) => string
  getPriorityColor: (priority: string) => string
}

export const useActivityFormatting = (): UseActivityFormattingReturn => {
  const formatTimestamp = useCallback((timestamp: Date): string => {
    return formatActivityTimestamp(timestamp)
  }, [])

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'low':
        return 'bg-success/10 text-success border-success/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }, [])

  return {
    formatTimestamp,
    getPriorityColor,
  }
}
