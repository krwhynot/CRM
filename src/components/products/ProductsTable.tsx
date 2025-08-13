import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Trash2, Plus, Search, ExternalLink } from 'lucide-react'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductsTableProps {
  products: ProductWithPrincipal[]
  loading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onAddNew?: () => void
}

export function ProductsTable({ 
  products, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onAddNew 
}: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )


  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800'
    
    switch (category) {
      case 'dairy':
        return 'bg-blue-100 text-blue-800'
      case 'meat':
        return 'bg-red-100 text-red-800'
      case 'produce':
        return 'bg-green-100 text-green-800'
      case 'bakery':
        return 'bg-yellow-100 text-yellow-800'
      case 'frozen':
        return 'bg-cyan-100 text-cyan-800'
      case 'pantry':
        return 'bg-orange-100 text-orange-800'
      case 'beverages':
        return 'bg-purple-100 text-purple-800'
      case 'snacks':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatCategory = (category: string | null) => {
    if (!category) return 'N/A'
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }


  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            Loading products...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Shelf Life</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No products match your search.' : 'No products found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-48">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {product.principal?.name || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(product.category)}>
                      {formatCategory(product.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {product.sku && (
                        <div className="font-medium">{product.sku}</div>
                      )}
                      {product.description && (
                        <div className="text-gray-500 line-clamp-1">{product.description}</div>
                      )}
                      {!product.sku && !product.description && 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatPrice(product.list_price)}
                  </TableCell>
                  <TableCell>
                    {product.unit_of_measure || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {product.shelf_life_days ? `${product.shelf_life_days} days` : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(product)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}