import { useState } from 'react'
import type { Product } from '@/types/entities'

export function useProductActions() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product)
    // TODO: Implement edit logic
  }

  const handleDeleteProduct = (product: Product) => {
    console.log('Delete product:', product)
    // TODO: Implement delete logic
  }

  return {
    selectedItems,
    handleSelectItem,
    handleEditProduct,
    handleDeleteProduct,
  }
}
