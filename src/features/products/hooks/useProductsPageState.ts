import { useState } from 'react'
import type { Product } from '@/types/entities'

export const useProductsPageState = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const openCreateDialog = () => setIsCreateDialogOpen(true)
  const closeCreateDialog = () => setIsCreateDialogOpen(false)

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedProduct(null)
  }

  return {
    // Dialog state
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedProduct,

    // Dialog actions
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
