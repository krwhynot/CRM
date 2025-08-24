import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useProductsBadges } from '@/features/products/hooks/useProductsBadges'

interface ProductBadgesProps {
  category: string | null
  price: number | null
  shelfLifeDays: number | null
  inStock?: boolean | null
  lowStock?: boolean | null
  className?: string
}

export const ProductBadges: React.FC<ProductBadgesProps> = ({
  category,
  price,
  shelfLifeDays,
  inStock,
  lowStock,
  className = ""
}) => {
  const { getCategoryBadge, getValueBadge, getFreshnessBadge, getAvailabilityBadge } = useProductsBadges()

  const categoryBadge = getCategoryBadge(category)
  const valueBadge = getValueBadge(price)
  const freshnessBadge = getFreshnessBadge(shelfLifeDays)
  const availabilityBadge = getAvailabilityBadge(inStock, lowStock)

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <Badge className={categoryBadge.className}>
        {categoryBadge.label}
      </Badge>
      {valueBadge && (
        <Badge className={valueBadge.className}>
          {valueBadge.label}
        </Badge>
      )}
      {freshnessBadge && (
        <Badge className={freshnessBadge.className}>
          {freshnessBadge.label}
        </Badge>
      )}
      <Badge className={availabilityBadge.className}>
        {availabilityBadge.label}
      </Badge>
    </div>
  )
}