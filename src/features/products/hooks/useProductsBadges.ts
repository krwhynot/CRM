import { useMemo } from 'react'
import type { BadgeProps } from '@/components/ui/badge.variants'

interface BadgeStyle extends BadgeProps {
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
            variant: 'outline',
            orgType: 'customer',
            label: 'Dairy',
          }
        case 'fresh-produce':
          return {
            variant: 'outline',
            status: 'active',
            label: 'Fresh Produce',
          }
        case 'meat':
          return {
            variant: 'outline',
            status: 'inactive',
            label: 'Meat',
          }
        case 'seafood':
          return {
            variant: 'outline',
            orgType: 'distributor',
            label: 'Seafood',
          }
        case 'bakery':
          return {
            variant: 'outline',
            status: 'pending',
            label: 'Bakery',
          }
        case 'frozen':
          return {
            variant: 'secondary',
            label: 'Frozen',
          }
        case 'beverages':
          return {
            variant: 'secondary',
            label: 'Beverages',
          }
        case 'pantry':
          return {
            variant: 'outline',
            status: 'pending',
            label: 'Pantry',
          }
        case 'snacks':
          return {
            variant: 'outline',
            label: 'Snacks',
          }
        default:
          return {
            variant: 'secondary',
            label: category || 'Uncategorized',
          }
      }
    }
  }, [])

  const getValueBadge = useMemo(() => {
    return (price: number | null): BadgeStyle | null => {
      if (!price || price <= 0) return null

      if (price > 50) {
        return {
          variant: 'default',
          orgType: 'principal',
          label: 'Premium',
        }
      }

      if (price > 20) {
        return {
          variant: 'outline',
          status: 'pending',
          label: 'High Value',
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
          variant: 'outline',
          status: 'active',
          label: 'Ultra Fresh',
        }
      }

      if (shelfLifeDays <= 7) {
        return {
          variant: 'outline',
          status: 'pending',
          label: 'Fresh',
        }
      }

      if (shelfLifeDays <= 30) {
        return {
          variant: 'outline',
          status: 'active',
          label: 'Short Term',
        }
      }

      return null // No badge for long shelf life items
    }
  }, [])

  const getAvailabilityBadge = useMemo(() => {
    return (inStock: boolean | null, lowStock: boolean | null): BadgeStyle => {
      if (inStock === false) {
        return {
          variant: 'outline',
          status: 'inactive',
          label: 'Out of Stock',
        }
      }

      if (lowStock === true) {
        return {
          variant: 'outline',
          status: 'pending',
          label: 'Low Stock',
        }
      }

      return {
        variant: 'outline',
        status: 'active',
        label: 'In Stock',
      }
    }
  }, [])

  return {
    getCategoryBadge,
    getValueBadge,
    getFreshnessBadge,
    getAvailabilityBadge,
  }
}
