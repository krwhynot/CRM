import React from 'react'
import { Package, Scale, Building2 } from 'lucide-react'
import type { ProductWithPrincipal } from '@/types/entities'

interface ProductSpecsSectionProps {
  product: ProductWithPrincipal
}

const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

export const ProductSpecsSection: React.FC<ProductSpecsSectionProps> = ({ product }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Package Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Package className="size-4" />
          Package Size
        </div>
        <div className="pl-6 text-sm text-gray-600">
          {(product as any).package_size || <EmptyCell />}
        </div>
      </div>

      {/* Unit of Measure */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Scale className="size-4" />
          Unit of Measure
        </div>
        <div className="pl-6 text-sm text-gray-600">{product.unit_of_measure || <EmptyCell />}</div>
      </div>

      {/* Origin Country */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Building2 className="size-4" />
          Origin
        </div>
        <div className="pl-6 text-sm text-gray-600">
          {(product as any).origin_country || <EmptyCell />}
        </div>
      </div>
    </div>
  )
}
