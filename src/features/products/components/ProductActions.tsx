import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Phone } from 'lucide-react'
import { semanticSpacing, semanticColors } from '@/styles/tokens'
import type { Product } from '@/types/entities'

interface ProductActionsProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onEdit,
  onView,
  onContactSupplier,
  size = 'sm',
  variant = 'ghost',
}) => {
  return (
    <div className={`flex items-center justify-center ${semanticSpacing.gap.xs}`}>
      {onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onEdit(product)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.primarySubtle}`}
          title="Edit Product"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {onContactSupplier && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onContactSupplier(product)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.successSubtle}`}
          title="Contact Supplier"
        >
          <Phone className="size-4" />
        </Button>
      )}

      {onView && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onView(product)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hoverStates.subtle}`}
          title="View Details"
        >
          <Eye className="size-4" />
        </Button>
      )}
    </div>
  )
}
