import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { ProductsFilters } from './ProductsFilters'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { ProductBadges } from './ProductBadges'
import { ProductActions } from './ProductActions'
import { useProductsDisplay } from '../hooks/useProductsDisplay'
import { useDeleteProduct } from '../hooks/useProducts'
import { toast } from '@/lib/toast-styles'
import { formatPrice } from '@/lib/product-formatters'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Calendar, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatTimeAgo } from '@/lib/utils'
import type { Product, Organization } from '@/types/entities'
import type { ProductWithPrincipal } from '@/types/product-extensions'
import type { ProductWeeklyFilters } from '@/types/shared-filters.types'

// Extended product interface with weekly promotion tracking
interface ProductWithWeeklyContext extends ProductWithPrincipal {
  // Promotion tracking
  promotion_start_date?: string | Date
  promotion_end_date?: string | Date
  is_promoted_this_week?: boolean
  
  // Opportunity tracking
  opportunity_count?: number
  recent_opportunity_count?: number
  
  // Weekly context
  weekly_sales_velocity?: number
  was_promoted_recently?: boolean
}

interface ProductsTableProps {
  products?: ProductWithWeeklyContext[]
  loading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  onAddNew?: () => void
  filters?: ProductWeeklyFilters
  onFiltersChange?: (filters: ProductWeeklyFilters) => void
}

const DEFAULT_PRODUCTS: ProductWithWeeklyContext[] = []

export function ProductsTable({
  products = DEFAULT_PRODUCTS,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onContactSupplier,
  onAddNew,
  filters,
  onFiltersChange,
}: ProductsTableProps) {
  // Selection state management
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Enhanced filtering state
  const [productFilters, setProductFilters] = useState<ProductWeeklyFilters>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...filters // merge any filters passed as props
  })

  // Hooks
  const deleteProduct = useDeleteProduct()

  // Simple filtering logic (since we're using the new weekly pattern)
  const filteredProducts = products.filter(product => {
    // Apply search filter
    if (productFilters.search) {
      const searchTerm = productFilters.search.toLowerCase()
      const matchesSearch = (
        product.name?.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.principal_name?.toLowerCase().includes(searchTerm)
      )
      if (!matchesSearch) return false
    }

    // Apply quick view filters
    if (productFilters.quickView && productFilters.quickView !== 'none') {
      switch (productFilters.quickView) {
        case 'promoted_this_week':
          return product.is_promoted_this_week
        case 'products_with_opportunities':
          return (product.opportunity_count || 0) > 0
        case 'high_margin_products':
          return (product.list_price || 0) > 20 // Simple high-value filter
        case 'needs_attention':
          return product.low_stock || !product.in_stock
        default:
          break
      }
    }

    return true
  })

  // Handle filter changes
  const handleFiltersChange = (newFilters: ProductWeeklyFilters) => {
    setProductFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

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

  // Expandable content renderer
  const renderExpandableContent = (product: ProductWithWeeklyContext) => (
    <div className="space-y-6">
      {/* Promotion & Opportunity Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Promotion Status</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.is_promoted_this_week && (
              <div className="flex items-center gap-1 text-green-600">
                <Calendar className="size-3" />
                Active promotion this week
              </div>
            )}
            {product.promotion_start_date && (
              <div>Start: {new Date(product.promotion_start_date).toLocaleDateString()}</div>
            )}
            {product.promotion_end_date && (
              <div>End: {new Date(product.promotion_end_date).toLocaleDateString()}</div>
            )}
            {!product.is_promoted_this_week && !product.promotion_start_date && (
              <span className="italic text-gray-400">No active promotions</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Opportunities</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Total: {product.opportunity_count || 0} opportunities</div>
            {product.recent_opportunity_count && (
              <div>Recent: {product.recent_opportunity_count} this month</div>
            )}
            {product.weekly_sales_velocity && (
              <div>Weekly velocity: {product.weekly_sales_velocity}%</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Performance</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.was_promoted_recently && (
              <div className="flex items-center gap-1 text-blue-600">
                <TrendingUp className="size-3" />
                Recently promoted
              </div>
            )}
            {(product.opportunity_count || 0) > 0 && (
              <div className="text-green-600">
                Active in {product.opportunity_count} deal{(product.opportunity_count || 0) !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div>
        <h4 className="mb-2 font-medium text-gray-900">Description</h4>
        <p className="text-sm text-gray-600">
          {product.description || 'No description available'}
        </p>
      </div>

      {/* Product Specifications */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Specifications</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.unit_of_measure && <div>Unit: {product.unit_of_measure}</div>}
            {product.category && <div>Category: {product.category}</div>}
            {product.brand && <div>Brand: {product.brand}</div>}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Storage & Handling</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.shelf_life_days && (
              <div>Shelf Life: {product.shelf_life_days} days</div>
            )}
            {product.package_size && (
              <div>Package Size: {product.package_size}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Column definitions for DataTable
  const productColumns: DataTableColumn<ProductWithWeeklyContext>[] = [
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
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-gray-900">
              {product.name || <EmptyCell />}
            </div>
            {product.is_promoted_this_week && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Calendar className="size-3 text-green-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Active promotion this week</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {(product.opportunity_count || 0) > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <TrendingUp className="size-3 text-blue-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{product.opportunity_count} active opportunities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {product.sku && <div className="font-mono text-xs text-gray-500">SKU: {product.sku}</div>}
          
          <div className="flex items-center gap-2">
            <ProductBadges
              category={product.category}
              price={product.list_price}
              shelfLifeDays={product.shelf_life_days}
              inStock={product.in_stock ?? true}
              lowStock={product.low_stock ?? false}
            />
            {(product.opportunity_count || 0) > 0 && (
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                {product.opportunity_count} opp{(product.opportunity_count || 0) !== 1 ? 's' : ''}
              </Badge>
            )}
            {product.is_promoted_this_week && (
              <Badge variant="secondary" className="border-green-200 bg-green-50 text-xs text-green-700">
                Promoted
              </Badge>
            )}
          </div>
          
          {/* Promotion dates */}
          {(product.promotion_start_date || product.promotion_end_date) && (
            <div className="text-xs text-gray-500">
              {product.promotion_start_date && product.promotion_end_date ? (
                <span>
                  Promotion: {new Date(product.promotion_start_date).toLocaleDateString()} - {new Date(product.promotion_end_date).toLocaleDateString()}
                </span>
              ) : product.promotion_start_date ? (
                <span>
                  Started: {new Date(product.promotion_start_date).toLocaleDateString()}
                </span>
              ) : (
                <span>
                  Ends: {new Date(product.promotion_end_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
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
        <div className="text-sm text-gray-700">{product.principal_name || <EmptyCell />}</div>
      ),
      className: 'min-w-28',
      hidden: { sm: true, md: true },
    },
    {
      key: 'brand',
      header: 'Brand',
      cell: (product) => (
        <div className="text-sm text-gray-700">{product.brand || <EmptyCell />}</div>
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
        filters={productFilters}
        onFiltersChange={handleFiltersChange}
        principals={[]} // TODO: Add principals data from hook
        isLoading={loading}
        totalProducts={products.length}
        filteredCount={filteredProducts.length}
        showBadges={true}
        onAddNew={onAddNew}
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

      {/* Table Container with Integrated Row Expansion */}
      <DataTable<ProductWithPrincipal>
        data={filteredProducts}
        columns={productColumns}
        loading={loading}
        rowKey={(product) => product.id}
        expandableContent={renderExpandableContent}
        expandedRows={filteredProducts
          .filter((product) => isRowExpanded(product.id))
          .map((product) => product.id)}
        onToggleRow={toggleRowExpansion}
        empty={{
          title: productFilters.search || productFilters.quickView !== 'none' ? 'No products match your criteria' : 'No products found',
          description:
            productFilters.search || productFilters.quickView !== 'none'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first product',
        }}
      />

      {/* Results Summary */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-gray-500">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <span>
            {productFilters.quickView !== 'none' &&
              `Quick View: ${productFilters.quickView?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
          </span>
        </div>
      )}

      {/* Bulk Delete Dialog - Reused for products with type assertion for shared interface */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedProducts as unknown as Organization[]}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
