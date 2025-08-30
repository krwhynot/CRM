import { useMemo } from 'react'

interface BadgeStyle {
  className: string
  label: string
}

interface UseOrganizationsBadgesReturn {
  getPriorityBadge: (priority: string | null) => BadgeStyle
  getTypeBadge: (type: string | null) => BadgeStyle
  getSegmentBadge: (segment: string | null) => BadgeStyle | null
  getStatusBadge: (priority: string | null, type: string | null) => BadgeStyle | null
}

export const useOrganizationsBadges = (): UseOrganizationsBadgesReturn => {
  const getPriorityBadge = useMemo(() => {
    return (priority: string | null): BadgeStyle => {
      switch (priority) {
        case 'A+':
          return {
            className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300',
            label: 'A+ Priority'
          }
        case 'A':
          return {
            className: 'bg-red-100 text-red-800 border-red-200',
            label: 'A Priority'
          }
        case 'B':
          return {
            className: 'bg-orange-100 text-orange-800 border-orange-200',
            label: 'B Priority'
          }
        case 'C':
          return {
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            label: 'C Priority'
          }
        case 'D':
          return {
            className: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'D Priority'
          }
        default:
          return {
            className: 'bg-gray-100 text-gray-600 border-gray-200',
            label: 'Unassigned'
          }
      }
    }
  })

  const getTypeBadge = useMemo(() => {
    return (type: string | null): BadgeStyle => {
      switch (type) {
        case 'customer':
          return {
            className: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Customer'
          }
        case 'distributor':
          return {
            className: 'bg-green-100 text-green-800 border-green-200',
            label: 'Distributor'
          }
        case 'principal':
          return {
            className: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Principal'
          }
        case 'supplier':
          return {
            className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            label: 'Supplier'
          }
        default:
          return {
            className: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'Unknown Type'
          }
      }
    }
  })

  const getSegmentBadge = useMemo(() => {
    return (segment: string | null): BadgeStyle | null => {
      if (!segment) return null
      
      // Common segment color mappings
      const segmentColors: Record<string, string> = {
        'Restaurant': 'bg-amber-100 text-amber-800 border-amber-200',
        'Fine Dining': 'bg-rose-100 text-rose-800 border-rose-200',
        'Fast Food': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Distribution': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Healthcare': 'bg-cyan-100 text-cyan-800 border-cyan-200',
        'Education': 'bg-violet-100 text-violet-800 border-violet-200',
        'Hospitality': 'bg-pink-100 text-pink-800 border-pink-200',
        'Retail': 'bg-orange-100 text-orange-800 border-orange-200'
      }

      return {
        className: segmentColors[segment] || 'bg-slate-100 text-slate-800 border-slate-200',
        label: segment
      }
    }
  })

  const getStatusBadge = useMemo(() => {
    return (priority: string | null, type: string | null): BadgeStyle | null => {
      // High-value customer with A+ priority
      if (priority === 'A+' && type === 'customer') {
        return {
          className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300',
          label: 'VIP Customer'
        }
      }
      
      // High-priority distributor
      if ((priority === 'A+' || priority === 'A') && type === 'distributor') {
        return {
          className: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300',
          label: 'Key Partner'
        }
      }
      
      return null
    }
  })

  return {
    getPriorityBadge,
    getTypeBadge,
    getSegmentBadge,
    getStatusBadge
  }
}