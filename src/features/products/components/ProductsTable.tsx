import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { ProductsFilters } from './ProductsFilters'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { ProductBadges } from './ProductBadges'
import { ProductActions } from './ProductActions'
import { useProductsFiltering } from '../hooks/useProductsFiltering'
import { useProductsDisplay } from '../hooks/useProductsDisplay'
import { useDeleteProduct } from '../hooks/useProducts'
import { toast } from '@/lib/toast-styles'
import { formatPrice } from '@/lib/product-formatters'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ProductRowDetails } from './product-row/ProductRowDetails'
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
  onAddNew,
}: ProductsTableProps) {
  // Selection state management
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Hooks
  const deleteProduct = useDeleteProduct()

  // Extract business logic to custom hooks
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    filterPills,
  } = useProductsFiltering(products)

  const { toggleRowExpansion, isRowExpanded } = useProductsDisplay(
    products.map((product) => product.id)
  )

  // Selection management functions
  const handleSelectAllFromToolbar = () => {
    setSelectedIds(filteredProducts.map((product) => product.id))
  }

  const handleSelectNoneFromToolbar = () => {
    setSelectedIds([])
  }

  const handleRowSelect = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true)
  }

  // Get selected products for dialog
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id))

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    const results = []
    let successCount = 0
    let errorCount = 0

    try {
      // Process deletions sequentially for maximum safety
      for (const productId of selectedIds) {
        try {
          await deleteProduct.mutateAsync(productId)
          results.push({ id: productId, status: 'success' })
          successCount++
        } catch (error) {
          // Failed to delete product - error handled
          results.push({
            id: productId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully archived ${successCount} product${successCount !== 1 ? 's' : ''}`
        )
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} products, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} product${errorCount !== 1 ? 's' : ''}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        const successfulIds = results.filter((r) => r.status === 'success').map((r) => r.id)

        setSelectedIds((prev) => prev.filter((id) => !successfulIds.includes(id)))
      }
    } catch (error) {
      // Unexpected error during bulk delete - handled
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Helper component for empty cell display
  const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

  // Column definitions for DataTable
  const productColumns: DataTableColumn<ProductWithPrincipal>[] = [
    {
      key: 'selection',
      header: (
        <Checkbox
          checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedIds(filteredProducts.map((product) => product.id))
            } else {
              setSelectedIds([])
            }
          }}
          aria-label="Select all products"
        />
      ),
      cell: (product) => (
        <Checkbox
          checked={selectedIds.includes(product.id)}
          onCheckedChange={() => handleRowSelect(product.id)}
          aria-label={`Select ${product.name}`}
        />
      ),
      className: 'w-12',
    },
    {
      key: 'expansion',
      header: '',
      cell: (product) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(product.id)}
          className="h-auto p-0 hover:bg-transparent"
        >
          {isRowExpanded(product.id) ? (
            <ChevronDown className="size-4 text-gray-500" />
          ) : (
            <ChevronRight className="size-4 text-gray-500" />
          )}
        </Button>
      ),
      className: 'w-8',
    },
    {
      key: 'product',
      header: 'Product',
      cell: (product) => (
        <div className="space-y-2">
          <div className="text-base font-semibold text-gray-900">
            {product.name || <EmptyCell />}
          </div>
          {product.sku && <div className="font-mono text-xs text-gray-500">SKU: {product.sku}</div>}
          <ProductBadges
            category={product.category}
            price={product.list_price}
            shelfLifeDays={product.shelf_life_days}
            inStock={(product as any).in_stock ?? true}
            lowStock={(product as any).low_stock ?? false}
          />
        </div>
      ),
      className: 'font-medium min-w-56',
    },
    {
      key: 'price',
      header: 'Price',
      cell: (product) => (
        <div className="text-base font-semibold text-gray-900">
          {formatPrice(product.list_price)}
        </div>
      ),
      className: 'text-right min-w-20',
      hidden: { sm: true },
    },
    {
      key: 'principal',
      header: 'Principal',
      cell: (product) => (
        <div className="text-sm text-gray-700">
          {(product as any).principal_name || <EmptyCell />}
        </div>
      ),
      className: 'min-w-28',
      hidden: { sm: true, md: true },
    },
    {
      key: 'brand',
      header: 'Brand',
      cell: (product) => (
        <div className="text-sm text-gray-700">{(product as any).brand || <EmptyCell />}</div>
      ),
      className: 'min-w-20',
      hidden: { sm: true },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (product) => (
        <ProductActions
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onContactSupplier={onContactSupplier}
        />
      ),
      className: 'text-center min-w-28',
    },
  ]

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

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        totalCount={filteredProducts.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
      />

      {/* Table Container with Row Expansion */}
      <div className="space-y-0">
        <DataTable<ProductWithPrincipal>
          data={filteredProducts}
          columns={productColumns}
          loading={loading}
          rowKey={(product) => product.id}
          empty={{
            title: activeFilter !== 'all' ? 'No products match your criteria' : 'No products found',
            description:
              activeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first product',
          }}
        />

        {/* Expanded Row Details */}
        {filteredProducts
          .filter((product) => isRowExpanded(product.id))
          .map((product) => (
            <div
              key={`${product.id}-details`}
              className="-mt-px border-x border-b border-l-4 border-l-mfb-green bg-mfb-sage-tint p-6 transition-all duration-300 ease-out"
              style={{ marginTop: '-1px' }}
            >
              <ProductRowDetails product={product} />
            </div>
          ))}
      </div>

      {/* Results Summary */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-gray-500">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <span>
            {activeFilter !== 'all' &&
              `Filter: ${filterPills.find((p) => p.key === activeFilter)?.label}`}
          </span>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedProducts as any}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
