import { SimpleTable } from '@/components/ui/simple-table'
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

  const headers = [
    { label: '', className: 'w-12' },
    { label: 'Product', className: 'min-w-[220px]' },
    { label: 'Price', className: 'min-w-[90px] text-right' },
    { label: 'Principal', className: 'min-w-[110px]' },
    { label: 'Brand', className: 'min-w-[90px]' },
    { label: 'Actions', className: 'text-center min-w-[110px]' }
  ]

  const renderProductRow = (product: ProductWithPrincipal, isExpanded: boolean, onToggle: () => void) => (
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
  )

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
      <SimpleTable
        data={filteredProducts}
        loading={loading}
        headers={headers}
        renderRow={renderProductRow}
        emptyMessage={activeFilter !== 'all' ? 'No products match your criteria' : 'No products found'}
        emptySubtext={activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first product'}
        colSpan={6}
      />

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
