import { useMemo } from 'react'

interface UseInteractionFormattingReturn {
  getTypeColor: (type: string) => string
  formatType: (type: string) => string
  formatDate: (dateString: string) => string
  formatDuration: (minutes: number | null) => string
  isFollowUpOverdue: (followUpDate: string | null) => boolean
}

export const useInteractionFormatting = (): UseInteractionFormattingReturn => {
  const formatters = useMemo(
    () => ({
      getTypeColor: (type: string) => {
        switch (type) {
          case 'email':
            return 'bg-blue-100 text-blue-800'
          case 'phone':
            return 'bg-green-100 text-green-800'
          case 'meeting':
            return 'bg-purple-100 text-purple-800'
          case 'demo':
            return 'bg-orange-100 text-orange-800'
          case 'proposal':
            return 'bg-yellow-100 text-yellow-800'
          case 'follow_up':
            return 'bg-cyan-100 text-cyan-800'
          case 'other':
            return 'bg-gray-100 text-gray-800'
          default:
            return 'bg-gray-100 text-gray-800'
        }
      },

      formatType: (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      },

      formatDate: (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      },

      formatDuration: (minutes: number | null) => {
        if (!minutes) return 'N/A'
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
      },

      isFollowUpOverdue: (followUpDate: string | null) => {
        if (!followUpDate) return false
        const date = new Date(followUpDate)
        const today = new Date()
        today.setHours(23, 59, 59, 999) // End of today
        return date < today
      },
    }),
    []
  )

  return formatters
}
