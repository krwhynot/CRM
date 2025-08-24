import { useState } from 'react'
import { toast } from '@/lib/toast-styles'
import { Button } from '@/components/ui/button'
import { ProductsTable } from '@/features/products/components/ProductsTable'
import { ProductForm } from '@/features/products/components/ProductForm'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/features/products/hooks/useProducts'
import { Plus } from 'lucide-react'
import type { Product, ProductInsert, ProductUpdate } from '@/types/entities'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Manage Products"
          subtitle="Catalog & Inventory"
          count={products.length}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
    </div>
  )
}

export default ProductsPage