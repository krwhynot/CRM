import { useMemo } from 'react'

interface BadgeStyle {
  className: string
  label: string
}

interface UseProductsBadgesReturn {
  getCategoryBadge: (category: string | null) => BadgeStyle
  getValueBadge: (price: number | null) => BadgeStyle | null
  getFreshnessBadge: (shelfLifeDays: number | null) => BadgeStyle | null
  getAvailabilityBadge: (inStock: boolean | null, lowStock: boolean | null) => BadgeStyle
}

export const useProductsBadges = (): UseProductsBadgesReturn => {
  const getCategoryBadge = useMemo(() => {
    return (category: string | null): BadgeStyle => {
      switch (category) {
        case 'dairy':
          return {
            className: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Dairy'
          }
        case 'fresh-produce':
          return {
            className: 'bg-green-100 text-green-800 border-green-200',
            label: 'Fresh Produce'
          }
        case 'meat':
          return {
            className: 'bg-red-100 text-red-800 border-red-200',
            label: 'Meat'
          }
        case 'seafood':
          return {
            className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
            label: 'Seafood'
          }
        case 'bakery':
          return {
            className: 'bg-amber-100 text-amber-800 border-amber-200',
            label: 'Bakery'
          }
        case 'frozen':
          return {
            className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            label: 'Frozen'
          }
        case 'beverages':
          return {
            className: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Beverages'
          }
        case 'pantry':
          return {
            className: 'bg-orange-100 text-orange-800 border-orange-200',
            label: 'Pantry'
          }
        case 'snacks':
          return {
            className: 'bg-pink-100 text-pink-800 border-pink-200',
            label: 'Snacks'
          }
        default:
          return {
            className: 'bg-gray-100 text-gray-800 border-gray-200',
            label: category || 'Uncategorized'
          }
      }
    }
  }, [])

  const getValueBadge = useMemo(() => {
    return (price: number | null): BadgeStyle | null => {
      if (!price || price <= 0) return null
      
      if (price > 50) {
        return {
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300',
          label: 'Premium'
        }
      }
      
      if (price > 20) {
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'High Value'
        }
      }
      
      return null // No badge for regular/low value items
    }
  }, [])

  const getFreshnessBadge = useMemo(() => {
    return (shelfLifeDays: number | null): BadgeStyle | null => {
      if (!shelfLifeDays || shelfLifeDays <= 0) return null
      
      if (shelfLifeDays <= 3) {
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          label: 'Ultra Fresh'
        }
      }
      
      if (shelfLifeDays <= 7) {
        return {
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'Fresh'
        }
      }
      
      if (shelfLifeDays <= 30) {
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          label: 'Short Term'
        }
      }
      
      return null // No badge for long shelf life items
    }
  }, [])

  const getAvailabilityBadge = useMemo(() => {
    return (inStock: boolean | null, lowStock: boolean | null): BadgeStyle => {
      if (inStock === false) {
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          label: 'Out of Stock'
        }
      }
      
      if (lowStock === true) {
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Low Stock'
        }
      }
      
      return {
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'In Stock'
      }
    }
  }, [])

  return {
    getCategoryBadge,
    getValueBadge,
    getFreshnessBadge,
    getAvailabilityBadge
  }
}