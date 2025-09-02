import React from 'react'
import { ProductsTable } from './ProductsTable'
import { LoadingState, ErrorState } from '@/components/ui/data-state'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductsDataDisplayProps {
  isLoading: boolean
  isError?: boolean
  error?: Error | null
  products: ProductWithPrincipal[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onRefresh?: () => void
}

export const ProductsDataDisplay: React.FC<ProductsDataDisplayProps> = ({
  isLoading,
  isError,
  error,
  products,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <LoadingState
        message="Loading products..."
        subtext="Fetching product data from the database"
        variant="table"
      />
    )
  }

  if (isError && error) {
    return (
      <ErrorState
        title="Failed to load products"
        message={error?.message || 'An unexpected error occurred while fetching products.'}
        onRetry={onRefresh}
        retryLabel="Refresh Products"
        variant="destructive"
      />
    )
  }

  return <ProductsTable products={products} onEdit={onEdit} onDelete={onDelete} />
}
