import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductsFilters } from './ProductsFilters'
import { ProductRow } from './ProductRow'
import { useProductsFiltering } from '../hooks/useProductsFiltering'
import { useProductsDisplay } from '../hooks/useProductsDisplay'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductsTableProps {
  products?: ProductWithPrincipal[]
  loading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  onAddNew?: () => void
}

const DEFAULT_PRODUCTS: ProductWithPrincipal[] = []

export function ProductsTable({ 
  products = DEFAULT_PRODUCTS, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onContactSupplier,
  onAddNew 
}: ProductsTableProps) {
  // Extract business logic to custom hooks
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    filterPills
  } = useProductsFiltering(products)

  const { toggleRowExpansion, isRowExpanded } = useProductsDisplay(
    products.map(product => product.id)
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Component */}
      <ProductsFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterPills={filterPills}
        onAddNew={onAddNew}
        totalProducts={products.length}
        filteredCount={filteredProducts.length}
      />

      {/* Table Container */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[250px]">Product</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[100px] text-right">Price</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">Principal</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[100px]">Brand</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-gray-500">
                        {activeFilter !== 'all' ? 'No products match your criteria' : 'No products found'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first product'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isExpanded={isRowExpanded(product.id)}
                    onToggleExpansion={() => toggleRowExpansion(product.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onContactSupplier={onContactSupplier}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 px-1">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <span>
            {activeFilter !== 'all' && `Filter: ${filterPills.find(p => p.key === activeFilter)?.label}`}
          </span>
        </div>
      )}
    </div>
  )
}
