import React from 'react'
import { FileText, Calendar } from 'lucide-react'
import { formatShelfLife } from '@/lib/product-formatters'
import type { ProductWithPrincipal } from '@/types/entities'

interface ProductDescriptionSectionProps {
  product: ProductWithPrincipal
}

const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

export const ProductDescriptionSection: React.FC<ProductDescriptionSectionProps> = ({
  product,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Description */}
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <FileText className="size-4" />
          Description
        </div>
        <div className="pl-6 text-sm text-gray-600">{product.description || <EmptyCell />}</div>
      </div>

      {/* Shelf Life */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Calendar className="size-4" />
          Shelf Life
        </div>
        <div className="pl-6 text-sm text-gray-600">{formatShelfLife(product.shelf_life_days)}</div>
      </div>
    </div>
  )
}
