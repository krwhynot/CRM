import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { ProductForm } from './ProductForm'
import type { Product, ProductInsert, ProductUpdate } from '@/types/entities'

interface ProductDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  selectedProduct: Product | null
  onCreateSubmit: (data: ProductInsert) => void
  onEditSubmit: (data: ProductUpdate) => void
  onDeleteConfirm: (product: Product) => void
  onCreateDialogChange: (open: boolean) => void
  onEditDialogChange: (open: boolean) => void
  onDeleteDialogChange: (open: boolean) => void
  onDeleteCancel: () => void
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export const ProductDialogs: React.FC<ProductDialogsProps> = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedProduct,
  onCreateSubmit,
  onEditSubmit,
  onDeleteConfirm,
  onCreateDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onDeleteCancel,
  isCreating,
  isUpdating,
  isDeleting,
}) => {
  return (
    <>
      {/* Create Dialog */}
      <StandardDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogChange}
        title="Add Product"
        description="Add a product to your catalog with specifications and pricing information."
        size="xl"
        scroll="content"
      >
        <ProductForm onSubmit={onCreateSubmit as any} loading={isCreating} />
      </StandardDialog>

      {/* Edit Dialog */}
      <StandardDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogChange}
        title="Edit Product"
        description="Update product information, specifications, and pricing details."
        size="xl"
        scroll="content"
      >
        {selectedProduct && (
          <ProductForm
            initialData={selectedProduct}
            onSubmit={onEditSubmit as any}
            loading={isUpdating}
          />
        )}
      </StandardDialog>

      {/* Delete Dialog */}
      <StandardDialog
        variant="alert"
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        onConfirm={() => selectedProduct && onDeleteConfirm(selectedProduct)}
        onCancel={onDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isDeleting}
      >
        <div className="text-center text-sm text-muted-foreground">
          This will permanently remove the product from your catalog and all associated data.
        </div>
      </StandardDialog>
    </>
  )
}
