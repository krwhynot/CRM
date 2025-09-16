import { ProductsDataDisplay } from '@/features/products/components/ProductsDataDisplay'
import { ProductDialogs } from '@/features/products/components/ProductDialogs'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useProductsPageState } from '@/features/products/hooks/useProductsPageState'
import { useProductsPageActions } from '@/features/products/hooks/useProductsPageActions'
// TODO: Re-implement error boundary after component consolidation
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

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
    <FilterLayoutProvider>
      <PageLayout>
          <PageHeader
            title="Products"
            description={`Manage ${products.length} products in your catalog`}
            action={{
              label: "Add Product",
              onClick: openCreateDialog
            }}
          />

          <ContentSection>
            <ProductsDataDisplay
              isLoading={isLoading}
              isError={isError}
              error={error}
              products={products}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onRefresh={refetch}
            />
          </ContentSection>

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
        </PageLayout>
    </FilterLayoutProvider>
  )
}

export default ProductsPage
