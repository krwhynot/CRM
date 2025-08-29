import { useState } from 'react'
import { toast } from '@/lib/toast-styles'
import { ProductsTable } from '@/features/products/components/ProductsTable'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/features/products/hooks/useProducts'
import { ProductManagementTemplate } from '@/components/templates/EntityManagementTemplate'
import type { Product, ProductInsert, ProductUpdate } from '@/types/entities'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogScrollableContent
} from '@/components/ui/StandardDialog'

function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { data: products = [], isLoading } = useProducts()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()



  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await deleteProductMutation.mutateAsync(product.id)
        toast.success('Product deleted successfully!')
      } catch (error) {
        console.error('Failed to delete product:', error)
        toast.error('Failed to delete product. Please try again.')
      }
    }
  }

  return (
    <ProductManagementTemplate
      entityCount={products.length}
      onAddClick={() => setIsCreateDialogOpen(true)}
    >
      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-8 font-nunito text-mfb-green bg-white rounded-lg border shadow-sm p-12">Loading products...</div>
      ) : (
        <ProductsTable 
          products={products} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <DialogScrollableContent>
            <ProductForm 
            onSubmit={async (data) => {
              try {
                await createProductMutation.mutateAsync(data as ProductInsert)
                setIsCreateDialogOpen(false)
                toast.success('Product created successfully!')
              } catch (error) {
                console.error('Failed to create product:', error)
                toast.error('Failed to create product. Please try again.')
              }
            }}
            loading={createProductMutation.isPending}
          />
          </DialogScrollableContent>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <DialogScrollableContent>
            {editingProduct && (
              <ProductForm 
              initialData={editingProduct}
              onSubmit={async (data) => {
                try {
                  await updateProductMutation.mutateAsync({
                    id: editingProduct.id,
                    updates: data as ProductUpdate
                  })
                  setIsEditDialogOpen(false)
                  setEditingProduct(null)
                  toast.success('Product updated successfully!')
                } catch (error) {
                  console.error('Failed to update product:', error)
                  toast.error('Failed to update product. Please try again.')
                }
              }}
              loading={updateProductMutation.isPending}
              />
            )}
          </DialogScrollableContent>
        </DialogContent>
      </Dialog>
    </ProductManagementTemplate>
  )
}

export default ProductsPage