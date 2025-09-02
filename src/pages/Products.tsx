import { ProductsDataDisplay } from '@/features/products/components/ProductsDataDisplay'
import { ProductDialogs } from '@/features/products/components/ProductDialogs'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useProductsPageState } from '@/features/products/hooks/useProductsPageState'
import { useProductsPageActions } from '@/features/products/hooks/useProductsPageActions'
import { ProductsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { ProductManagementTemplate } from '@/components/templates/EntityManagementTemplate'

function ProductsPage() {
  const { data: products = [], isLoading, isError, error, refetch } = useProducts()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedProduct,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useProductsPageState()

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useProductsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  return (
    <ProductsErrorBoundary>
      <ProductManagementTemplate entityCount={products.length} onAddClick={openCreateDialog}>
        <ProductsDataDisplay
          isLoading={isLoading}
          isError={isError}
          error={error}
          products={products}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onRefresh={refetch}
        />

        <ProductDialogs
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          selectedProduct={selectedProduct}
          onCreateSubmit={handleCreate}
          onEditSubmit={(data) => selectedProduct && handleUpdate(selectedProduct, data)}
          onDeleteConfirm={(product) => handleDelete(product)}
          onCreateDialogChange={closeCreateDialog}
          onEditDialogChange={closeEditDialog}
          onDeleteDialogChange={closeDeleteDialog}
          onDeleteCancel={closeDeleteDialog}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </ProductManagementTemplate>
    </ProductsErrorBoundary>
  )
}

export default ProductsPage
