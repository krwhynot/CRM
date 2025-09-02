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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }, [])

  return {
    formatTimestamp,
    getPriorityColor,
  }
}
