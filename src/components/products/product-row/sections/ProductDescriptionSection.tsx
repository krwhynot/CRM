import React from 'react'
import { FileText, Calendar } from 'lucide-react'
import { formatShelfLife } from '@/lib/product-formatters'
import type { ProductWithPrincipal } from '@/types/entities'

interface ProductDescriptionSectionProps {
  product: ProductWithPrincipal
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

export const ProductDescriptionSection: React.FC<ProductDescriptionSectionProps> = ({ product }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Description */}
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <FileText className="h-4 w-4" />
          Description
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {product.description || <EmptyCell />}
        </div>
      </div>

      {/* Shelf Life */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Calendar className="h-4 w-4" />
          Shelf Life
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {formatShelfLife(product.shelf_life_days)}
        </div>
      </div>
    </div>
  )
}