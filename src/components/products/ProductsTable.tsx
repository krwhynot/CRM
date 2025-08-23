import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Pencil, 
  Phone, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Package,
  Calendar,
  Building2,
  Scale,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductsTableProps {
  products: ProductWithPrincipal[]
  loading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  onAddNew?: () => void
}

type FilterType = 'all' | 'high-value' | 'dairy' | 'fresh-products' | 'recently-added'

// Sample data matching CRM requirements
const sampleProducts: ProductWithPrincipal[] = [
  {
    id: '1',
    name: 'Premium Aged Cheddar',
    sku: 'CHD-001-AGE',
    description: 'Artisan aged cheddar cheese, 24-month maturation',
    category: 'dairy',
    list_price: 45.99,
    unit_of_measure: 'lb',
    shelf_life_days: 180,
    principal_id: '3',
    principal: {
      id: '3',
      name: 'ACME FOOD DISTRIBUTORS',
      type: 'distributor' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Organic Free-Range Chicken Breast',
    sku: 'CHK-002-ORG',
    description: 'USDA Organic certified, free-range chicken breast',
    category: 'meat_poultry',
    list_price: 12.99,
    unit_of_measure: 'lb',
    shelf_life_days: 7,
    principal_id: '3',
    principal: {
      id: '3',
      name: 'ACME FOOD DISTRIBUTORS',
      type: 'distributor' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Fresh Basil Leaves',
    sku: 'HRB-003-BSL',
    description: 'Farm-fresh basil, locally sourced',
    category: 'fresh_produce',
    list_price: 3.99,
    unit_of_measure: 'bunch',
    shelf_life_days: 3,
    principal_id: '3',
    principal: {
      id: '3',
      name: 'ACME FOOD DISTRIBUTORS',
      type: 'distributor' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function ProductsTable({ 
  products = sampleProducts, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onContactSupplier,
  onAddNew 
}: ProductsTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filter pills configuration
  const filterPills = [
    { key: 'all' as FilterType, label: 'All', count: products.length },
    { key: 'high-value' as FilterType, label: 'High Value', count: 0 },
    { key: 'dairy' as FilterType, label: 'Dairy Products', count: 0 },
    { key: 'fresh-products' as FilterType, label: 'Fresh Products', count: 0 },
    { key: 'recently-added' as FilterType, label: 'Recently Added', count: 0 }
  ]

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Apply filter
    switch (activeFilter) {
      case 'high-value':
        filtered = filtered.filter(product => (product.list_price || 0) > 20)
        break
      case 'dairy':
        filtered = filtered.filter(product => product.category === 'dairy')
        break
      case 'fresh-products':
        filtered = filtered.filter(product => (product.shelf_life_days || 0) <= 7)
        break
      case 'recently-added':
        // TODO: Implement based on created_at date
        break
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.principal?.name?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [products, activeFilter, searchTerm])

  // Update filter counts
  const updatedFilterPills = useMemo(() => {
    return filterPills.map(pill => ({
      ...pill,
      count: pill.key === 'all' ? products.length :
             pill.key === 'high-value' ? products.filter(p => (p.list_price || 0) > 20).length :
             pill.key === 'dairy' ? products.filter(p => p.category === 'dairy').length :
             pill.key === 'fresh-products' ? products.filter(p => (p.shelf_life_days || 0) <= 7).length :
             pill.key === 'recently-added' ? 0 : 0
    }))
  }, [products])

  const toggleRowExpansion = (productId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedRows(newExpanded)
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'dairy':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'meat_poultry':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'fresh_produce':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'bakery':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'frozen':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'pantry':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'beverages':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'snacks':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatCategory = (category: string | null) => {
    if (!category) return null
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const EmptyCell = () => <span className="text-gray-400">—</span>

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder=""
            className="pl-10 h-12 text-lg"
            disabled
          />
        </div>
        
        <div className="border rounded-lg bg-white">
          <div className="p-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="text-lg font-semibold text-gray-700">Loading products...</div>
            <div className="text-gray-500">Please wait while we fetch your data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-2 focus:border-blue-500"
          />
        </div>
        
        {onAddNew && (
          <Button 
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Sticky Filter Pills */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {updatedFilterPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setActiveFilter(pill.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border-2 flex items-center gap-2",
                activeFilter === pill.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {pill.label}
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                activeFilter === pill.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              )}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Product</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[150px]">Principal</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Category</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[100px]">Price</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[150px]">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-gray-500">
                        {searchTerm || activeFilter !== 'all' ? 'No products match your criteria' : 'No products found'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {searchTerm || activeFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first product'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => {
                  const isExpanded = expandedRows.has(product.id)
                  
                  return (
                    <React.Fragment key={product.id}>
                      {/* Main Row */}
                      <TableRow 
                        className={cn(
                          "hover:bg-gray-50/80 transition-colors border-b",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        )}
                      >
                        {/* Expand Toggle */}
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(product.id)}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </TableCell>

                        {/* Product Name */}
                        <TableCell className="font-semibold">
                          <div className="font-semibold text-gray-900 text-base">
                            {product.name}
                          </div>
                          {product.sku && (
                            <div className="text-sm text-gray-500 font-mono">
                              {product.sku}
                            </div>
                          )}
                        </TableCell>

                        {/* Principal */}
                        <TableCell>
                          <span className="text-gray-900">
                            {product.principal?.name || <EmptyCell />}
                          </span>
                        </TableCell>

                        {/* Category Badge */}
                        <TableCell className="text-center">
                          {product.category ? (
                            <Badge className={cn("font-medium border", getCategoryColor(product.category))}>
                              {formatCategory(product.category)}
                            </Badge>
                          ) : (
                            <EmptyCell />
                          )}
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(product.list_price) || <EmptyCell />}
                          </span>
                        </TableCell>

                        {/* Quick Actions */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(product)}
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                title="Edit Product"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {onContactSupplier && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onContactSupplier(product)}
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                title="Contact Supplier"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(product)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Row Details */}
                      {isExpanded && (
                        <TableRow className="border-b-2 border-gray-100">
                          <TableCell 
                            colSpan={6} 
                            className="bg-[--mfb-sage-tint] border-l-4 border-[--mfb-green] p-6 transition-all duration-300 ease-out"
                          >
                            <div className="space-y-6">
                              {/* Compact Info Row 1: Product Details + Unit & Pricing */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Package className="h-4 w-4" />
                                    Product Details
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6 space-y-1">
                                    {product.sku && (
                                      <div>
                                        <span className="font-medium">SKU:</span> {product.sku}
                                      </div>
                                    )}
                                    {product.description ? (
                                      <div>
                                        <span className="font-medium">Description:</span> {product.description}
                                      </div>
                                    ) : (
                                      product.sku && <EmptyCell />
                                    )}
                                    {!product.sku && !product.description && <EmptyCell />}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Scale className="h-4 w-4" />
                                    Unit & Pricing
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6 space-y-1">
                                    <div>
                                      <span className="font-medium">Unit:</span> {product.unit_of_measure || <EmptyCell />}
                                    </div>
                                    <div>
                                      <span className="font-medium">Price:</span> {formatPrice(product.list_price) || <EmptyCell />}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Compact Info Row 2: Shelf Life + Supplier */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Calendar className="h-4 w-4" />
                                    Shelf Life
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {product.shelf_life_days ? (
                                      <>
                                        <div className="font-medium text-lg">{product.shelf_life_days}</div>
                                        <div className="text-xs text-gray-500">days</div>
                                      </>
                                    ) : (
                                      <EmptyCell />
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Building2 className="h-4 w-4" />
                                    Supplier
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {product.principal?.name ? (
                                      <>
                                        <div className="font-medium">{product.principal.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">
                                          {product.principal.type}
                                        </div>
                                      </>
                                    ) : (
                                      <EmptyCell />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Compact Info Row 3: Category + Notes (only if needed) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Package className="h-4 w-4" />
                                    Category
                                  </div>
                                  <div className="pl-6">
                                    {product.category ? (
                                      <Badge className={cn("font-medium border", getCategoryColor(product.category))}>
                                        {formatCategory(product.category)}
                                      </Badge>
                                    ) : (
                                      <EmptyCell />
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <FileText className="h-4 w-4" />
                                    Notes
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    <EmptyCell />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-1">
        <span>
          Showing {filteredProducts.length} of {products.length} products
        </span>
        <span>
          {searchTerm && `Filtered by: "${searchTerm}"`}
          {activeFilter !== 'all' && (searchTerm ? ' • ' : '') + `Filter: ${updatedFilterPills.find(p => p.key === activeFilter)?.label}`}
        </span>
      </div>
    </div>
  )
}