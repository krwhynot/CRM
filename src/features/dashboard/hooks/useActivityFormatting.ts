import { useCallback } from 'react'
import { format, isToday, isYesterday, subDays } from 'date-fns'

interface UseActivityFormattingReturn {
  formatTimestamp: (timestamp: Date) => string
  getPriorityColor: (priority: string) => string
}

export const useActivityFormatting = (): UseActivityFormattingReturn => {
  const formatTimestamp = useCallback((timestamp: Date): string => {
    if (isToday(timestamp)) {
      return `Today, ${format(timestamp, 'h:mm a')}`
    } else if (isYesterday(timestamp)) {
      return `Yesterday, ${format(timestamp, 'h:mm a')}`
    } else if (timestamp > subDays(new Date(), 7)) {
      return format(timestamp, 'EEE, MMM d, h:mm a')
    } else {
      return format(timestamp, 'MMM d, yyyy, h:mm a')
    }
  }, [])

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])

  return {
    formatTimestamp,
    getPriorityColor
  }
}