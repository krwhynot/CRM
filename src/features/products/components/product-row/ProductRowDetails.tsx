import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { ProductDescriptionSection } from './sections/ProductDescriptionSection'
import { ProductSpecsSection } from './sections/ProductSpecsSection'
import { ProductStorageSection } from './sections/ProductStorageSection'
import type { ProductWithPrincipal } from '@/types/entities'

interface ProductRowDetailsProps {
  product: ProductWithPrincipal
}

export const ProductRowDetails: React.FC<ProductRowDetailsProps> = ({ product }) => {
  return (
    <TableRow className="border-b-2 border-gray-100">
      <TableCell 
        colSpan={6} 
        className="bg-mfb-sage-tint border-l-4 border-mfb-green p-6 transition-all duration-300 ease-out"
      >
        <div className="space-y-6">
          <ProductDescriptionSection product={product} />
          
          <ProductSpecsSection product={product} />
          
          <ProductStorageSection product={product} />
        </div>
      </TableCell>
    </TableRow>
  )
}