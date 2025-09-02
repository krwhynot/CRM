import { useCallback } from 'react'
import { toast } from '@/lib/toast-styles'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from './useProducts'
import type { Product, ProductInsert, ProductUpdate } from '@/types/entities'

export const useProductsPageActions = (
  closeCreateDialog: () => void,
  closeEditDialog: () => void,
  closeDeleteDialog: () => void
) => {
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  const handleCreate = useCallback(
    async (data: ProductInsert) => {
      try {
        await createProductMutation.mutateAsync(data)
        closeCreateDialog()
        toast.success('Product created successfully!')
      } catch (error) {
        // Failed to create product - error handled
        toast.error('Failed to create product. Please try again.')
      }
    },
    [createProductMutation, closeCreateDialog]
  )

  const handleUpdate = useCallback(
    async (selectedProduct: Product, data: ProductUpdate) => {
      try {
        if (!selectedProduct?.id) {
          throw new Error('Product ID is required for update')
        }

        await updateProductMutation.mutateAsync({
          id: selectedProduct.id,
          updates: data,
        })

        closeEditDialog()
        toast.success('Product updated successfully!')
      } catch (error) {
        // Failed to update product - error handled
        toast.error('Failed to update product. Please try again.')
      }
    },
    [updateProductMutation, closeEditDialog]
  )

  const handleDelete = useCallback(
    async (selectedProduct: Product) => {
      try {
        if (!selectedProduct?.id) {
          throw new Error('Product ID is required for deletion')
        }

        await deleteProductMutation.mutateAsync(selectedProduct.id)
        closeDeleteDialog()
        toast.success('Product deleted successfully!')
      } catch (error) {
        // Failed to delete product - error handled
        toast.error('Failed to delete product. Please try again.')
      }
    },
    [deleteProductMutation, closeDeleteDialog]
  )

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  }
}
