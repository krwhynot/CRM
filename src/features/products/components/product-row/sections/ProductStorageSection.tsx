import React from 'react'
import { Package } from 'lucide-react'
import type { ProductWithPrincipal } from '@/types/entities'

interface ProductStorageSectionProps {
  product: ProductWithPrincipal
}

export const ProductStorageSection: React.FC<ProductStorageSectionProps> = ({ product }) => {
  if (!product.storage_requirements) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
        <Package className="size-4" />
        Storage Requirements
      </div>
      <div className="pl-6 text-sm text-gray-600">{product.storage_requirements}</div>
    </div>
  )
}
