import { ProductsList } from '@/features/products/components/ProductsList'
import { ProductDialogs } from '@/features/products/components/ProductDialogs'
import { useProducts, useCreateProductWithPrincipal, useUpdateProduct, useDeleteProduct } from '@/features/products/hooks/useProducts'
import { useEntityPageState } from '@/hooks/useEntityPageState'
import type { Product } from '@/types/entities'
import type { ProductWithPrincipalData } from '@/features/products/components/ProductDialogs'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'
import { toast } from '@/lib/toast-styles'

function ProductsPage() {
  const { data: products = [], isLoading, isError, error, refetch } = useProducts()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity: selectedProduct,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useEntityPageState<Product>()

  const createProductMutation = useCreateProductWithPrincipal()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  const handleCreateProduct = async (data: ProductWithPrincipalData) => {
    try {
      await createProductMutation.mutateAsync(data)
      toast.success('Product created successfully')
      closeCreateDialog()
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error('Failed to create product')
    }
  }

  const handleUpdateProduct = async (product: Product, data: Partial<Product>) => {
    try {
      await updateProductMutation.mutateAsync({ id: product.id, updates: data })
      toast.success('Product updated successfully')
      closeEditDialog()
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error('Failed to update product')
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProductMutation.mutateAsync(product.id)
      toast.success('Product deleted successfully')
      closeDeleteDialog()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleBulkDelete = async (products: Product[]) => {
    try {
      await Promise.all(products.map(product => deleteProductMutation.mutateAsync(product.id)))
      toast.success(`${products.length} products deleted successfully`)
    } catch (error) {
      console.error('Failed to bulk delete products:', error)
      toast.error('Failed to delete products')
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <FilterLayoutProvider>
        <PageLayout>
          <PageHeader title="Products" description="Loading products..." />
          <ContentSection>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          </ContentSection>
        </PageLayout>
      </FilterLayoutProvider>
    )
  }

  // Handle error state
  if (isError && error) {
    return (
      <FilterLayoutProvider>
        <PageLayout>
          <PageHeader title="Products" description="Error loading products" />
          <ContentSection>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-destructive mb-4">Failed to load products</div>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </ContentSection>
        </PageLayout>
      </FilterLayoutProvider>
    )
  }

  return (
    <FilterLayoutProvider>
      <PageLayout>
        <PageHeader
          title="Products"
          description={`Manage ${products.length} products in your catalog`}
          action={{
            label: 'Add Product',
            onClick: openCreateDialog,
          }}
        />

        <ContentSection>
          <ProductsList
            products={products}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onBulkDelete={handleBulkDelete}
          />
        </ContentSection>

        <ProductDialogs
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          selectedProduct={selectedProduct}
          onCreateSubmit={handleCreateProduct}
          onEditSubmit={(data) => selectedProduct && handleUpdateProduct(selectedProduct, data)}
          onDeleteConfirm={(product) => handleDeleteProduct(product)}
          onCreateDialogChange={closeCreateDialog}
          onEditDialogChange={closeEditDialog}
          onDeleteDialogChange={closeDeleteDialog}
          onDeleteCancel={closeDeleteDialog}
          isCreating={createProductMutation.isPending}
          isUpdating={updateProductMutation.isPending}
          isDeleting={deleteProductMutation.isPending}
        />
      </PageLayout>
    </FilterLayoutProvider>
  )
}

export default ProductsPage
