import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Phone } from 'lucide-react'
import type { Product } from '@/types/entities'

interface ProductActionsProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onEdit,
  onView,
  onContactSupplier,
}) => {
  return (
    <div className="flex gap-2">
      {onView && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(product)}
          className="h-8 px-3 transition-colors duration-200"
          title="View product details"
        >
          <Eye className="size-3" />
        </Button>
      )}
      {onContactSupplier && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onContactSupplier(product)}
          className="h-8 px-3 transition-colors duration-200"
          title="Contact supplier"
        >
          <Phone className="size-3" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="h-8 px-3 transition-colors duration-200"
          title="Edit product"
        >
          <Pencil className="size-3" />
        </Button>
      )}
    </div>
  )
}
