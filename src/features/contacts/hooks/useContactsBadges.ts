import { useMemo } from 'react'

interface BadgeStyle {
  className: string
  label: string
}

interface UseContactsBadgesReturn {
  getInfluenceBadge: (influence: string | null) => BadgeStyle
  getAuthorityBadge: (authority: string | null) => BadgeStyle
  getPriorityBadge: (isPrimary: boolean, influence: string | null) => BadgeStyle | null
}

export const useContactsBadges = (): UseContactsBadgesReturn => {
  const getInfluenceBadge = useMemo(() => {
    return (influence: string | null): BadgeStyle => {
      switch (influence) {
        case 'High':
          return {
            className: 'bg-green-100 text-green-800 border-green-200',
            label: 'High Influence'
          }
        case 'Medium':
          return {
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            label: 'Medium Influence'
          }
        case 'Low':
          return {
            className: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Low Influence'
          }
        default:
          return {
            className: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'Unknown Influence'
          }
      }
    }
  }, [])

  const getAuthorityBadge = useMemo(() => {
    return (authority: string | null): BadgeStyle => {
      switch (authority) {
        case 'Decision Maker':
          return {
            className: 'bg-red-100 text-red-800 border-red-200',
            label: 'Decision Maker'
          }
        case 'Influencer':
          return {
            className: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Influencer'
          }
        case 'User':
          return {
            className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            label: 'User'
          }
        case 'Gatekeeper':
          return {
            className: 'bg-orange-100 text-orange-800 border-orange-200',
            label: 'Gatekeeper'
          }
        default:
          return {
            className: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'Unknown Authority'
          }
      }
    }
  })

  const getPriorityBadge = useMemo(() => {
    return (isPromary: boolean, influence: string | null): BadgeStyle | null => {
      if (isPromary && influence === 'High') {
        return {
          className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300',
          label: 'High Priority'
        }
      }
      if (isPromary) {
        return {
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Primary Contact'
        }
      }
      if (influence === 'High') {
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          label: 'Key Contact'
        }
      }
      return null
    }
  })

  return {
    getInfluenceBadge,
    getAuthorityBadge,
    getPriorityBadge
  }
}