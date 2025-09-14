import { useState, useCallback } from 'react'
import { useUpdateProduct, useDeleteProduct } from './useProducts'
import { toast } from 'sonner'
import type { Product, ProductUpdate } from '@/types/entities'

interface UseProductActionsOptions {
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
  onError?: (error: string) => void
}

export function useProductActions(options: UseProductActionsOptions = {}) {
  const {
    onEdit,
    onDelete,
    onEditSuccess,
    onDeleteSuccess,
    onError,
  } = options

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Get mutation hooks
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

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

  const handleEditProduct = useCallback((product: Product) => {
    if (onEdit) {
      // Use the provided onEdit callback (connects to dialog system)
      onEdit(product)
    } else {
      // Fallback behavior when no onEdit callback is provided
      toast('Edit Product', {
        description: `Editing product: ${product.name}`,
      })
    }
  }, [onEdit])

  const handleDeleteProduct = useCallback((product: Product) => {
    if (onDelete) {
      // Use the provided onDelete callback (connects to confirmation dialog)
      onDelete(product)
    } else {
      // Direct delete (not recommended without confirmation)
      handleDeleteConfirm(product.id)
    }
  }, [onDelete])

  // Method to handle edit form submission
  const handleEditSubmit = useCallback(async (
    productId: string,
    updates: ProductUpdate
  ) => {
    try {
      await updateProductMutation.mutateAsync({ id: productId, updates })
      toast.success('Product Updated', {
        description: 'Product information has been updated successfully.',
      })
      onEditSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
      toast.error('Update Failed', {
        description: errorMessage,
      })
      onError?.(errorMessage)
    }
  }, [updateProductMutation, onEditSuccess, onError])

  // Method to handle delete confirmation
  const handleDeleteConfirm = useCallback(async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId)
      toast.success('Product Deleted', {
        description: 'Product has been deleted successfully.',
      })
      onDeleteSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product'
      toast.error('Delete Failed', {
        description: errorMessage,
      })
      onError?.(errorMessage)
    }
  }, [deleteProductMutation, onDeleteSuccess, onError])

  return {
    selectedItems,
    handleSelectItem,
    handleEditProduct,
    handleDeleteProduct,
    handleEditSubmit,
    handleDeleteConfirm,
    isEditing: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    editError: updateProductMutation.error?.message,
    deleteError: deleteProductMutation.error?.message,
  }
}
