import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductsTable } from '@/components/products/ProductsTable'
import { ProductForm } from '@/components/products/ProductForm'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { Package, Plus, Search, Archive, Star } from 'lucide-react'
import type { Product, ProductUpdate } from '@/types/entities'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { data: products = [], isLoading } = useProducts()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.principal?.name && product.principal.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const activeProducts = products.length // Just show total for now
  const inactiveProducts = 0 // No inactive tracking yet
  
  // Group products by category
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-purple-600" />
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  await createProductMutation.mutateAsync(data as any)
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Products</CardTitle>
            <Archive className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map(category => {
                const categoryProducts = products.filter(p => p.category === category)
                const activeCount = categoryProducts.length // All products are considered active for now
                
                return (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{category}</h3>
                      <Badge variant="secondary">{categoryProducts.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activeCount} products
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU, category, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <ProductsTable 
              products={filteredProducts} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}