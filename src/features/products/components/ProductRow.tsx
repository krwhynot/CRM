import React from 'react'
import { ProductRowMain, ProductRowDetails } from './product-row'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductRowProps {
  product: ProductWithPrincipal
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  isSelected?: boolean
  onSelect?: () => void
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContactSupplier,
  isSelected,
  onSelect,
}) => {
  return (
    <>
      <ProductRowMain
        product={product}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onContactSupplier={onContactSupplier}
        isSelected={isSelected}
        onSelect={onSelect}
      />

      {isExpanded && <ProductRowDetails product={product} />}
    </>
  )
}
