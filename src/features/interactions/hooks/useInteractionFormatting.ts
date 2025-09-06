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
            return 'bg-primary/10 text-primary'
          case 'phone':
            return 'bg-success/10 text-success'
          case 'meeting':
            return 'bg-secondary/10 text-secondary'
          case 'demo':
            return 'bg-warning/10 text-warning'
          case 'proposal':
            return 'bg-warning/10 text-warning'
          case 'follow_up':
            return 'bg-info/10 text-info'
          case 'other':
            return 'bg-muted/10 text-muted-foreground'
          default:
            return 'bg-muted/10 text-muted-foreground'
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
