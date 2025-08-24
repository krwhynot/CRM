import React from 'react'
import { Package, Scale, Building2 } from 'lucide-react'
import type { ProductWithPrincipal } from '@/types/entities'

interface ProductSpecsSectionProps {
  product: ProductWithPrincipal
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

export const ProductSpecsSection: React.FC<ProductSpecsSectionProps> = ({ product }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Package Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Package className="h-4 w-4" />
          Package Size
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {product.package_size || <EmptyCell />}
        </div>
      </div>

      {/* Unit of Measure */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Scale className="h-4 w-4" />
          Unit of Measure
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {product.unit_of_measure || <EmptyCell />}
        </div>
      </div>

      {/* Origin Country */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Building2 className="h-4 w-4" />
          Origin
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {product.origin_country || <EmptyCell />}
        </div>
      </div>
    </div>
  )
}