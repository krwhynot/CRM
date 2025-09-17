import React, { useState, useMemo } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { createProductColumns } from '@/components/data-table/columns/products'
import { type EntityFilterState } from '@/components/data-table/filters/EntityFilters'
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
import { useUnifiedBulkOperations } from '@/hooks/useUnifiedBulkOperations'
import { useStandardDataTable } from '@/hooks/useStandardDataTable'
import { useProductsDisplay } from '../hooks/useProductsDisplay'
import { useDeleteProduct } from '../hooks/useProducts'
import { toast } from '@/lib/toast-styles'
import { Calendar, TrendingUp, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/metrics-utils'
import type { Product } from '@/types/entities'
import type { ProductWithPrincipal } from '@/types/product-extensions'

// Extended product interface with weekly promotion tracking (matches ProductsTable.tsx)
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
  low_stock?: boolean
  in_stock?: boolean
}

interface ProductsListProps {
  products?: ProductWithWeeklyContext[]
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  principals?: Array<{ value: string; label: string }>
  onBulkDelete?: (products: ProductWithWeeklyContext[]) => Promise<void>
}

const DEFAULT_PRODUCTS: ProductWithWeeklyContext[] = []

export function ProductsList({
  products = DEFAULT_PRODUCTS,
  onEdit,
  onDelete,
  onView,
  onContactSupplier,
  principals = [],
  onBulkDelete,
}: ProductsListProps) {

  // Filter state for EntityFilters
  const [filters, setFilters] = useState<EntityFilterState>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
  })

  // Hooks
  const deleteProduct = useDeleteProduct()
  const { toggleRowExpansion, isRowExpanded } = useProductsDisplay(
    products.map((product) => product.id)
  )

  // Standard DataTable configuration with ResponsiveFilterWrapper
  const { dataTableProps } = useStandardDataTable({
    selectable: true,
    expandable: true,
    useResponsiveFilters: true,
    responsiveFilterTitle: 'Product Filters',
    responsiveFilterDescription: 'Filter and search your products',
  })

  // Use products directly - DataTable will handle filtering via ResponsiveFilterWrapper
  const displayProducts = products

  // Unified bulk operations
  const bulkOperations = useUnifiedBulkOperations({
    entities: displayProducts,
    onBulkDelete,
    deleteEntity: (id: string) => deleteProduct.mutateAsync(id),
    entityType: 'product',
    entityTypePlural: 'products',
  })

  // Expandable content renderer with enhanced layout
  const renderExpandableContent = (product: ProductWithWeeklyContext) => (
    <div className="space-y-6 rounded-lg bg-gray-50 p-4">
      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_promoted_this_week && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Calendar className="mr-1 size-3" />
            Active Promotion
          </Badge>
        )}
        {(product.opportunity_count || 0) > 0 && (
          <Badge variant="secondary">
            <TrendingUp className="mr-1 size-3" />
            {product.opportunity_count} Opportunities
          </Badge>
        )}
        {product.low_stock && (
          <Badge variant="destructive">
            <Package className="mr-1 size-3" />
            Low Stock
          </Badge>
        )}
      </div>

      {/* Promotion & Opportunity Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Promotion Status</h4>
          <div className="space-y-1 text-sm text-gray-600">
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
          <h4 className="mb-2 font-medium text-gray-900">Sales Performance</h4>
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
          <h4 className="mb-2 font-medium text-gray-900">Pricing</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.list_price && <div>List Price: {formatCurrency(product.list_price)}</div>}
            {product.unit_cost && <div>Unit Cost: {formatCurrency(product.unit_cost)}</div>}
            {product.min_order_quantity && <div>Min Order: {product.min_order_quantity}</div>}
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div>
        <h4 className="mb-2 font-medium text-gray-900">Description</h4>
        <p className="text-sm text-gray-600">{product.description || 'No description available'}</p>
      </div>

      {/* Product Specifications */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Specifications</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.unit_of_measure && <div>Unit: {product.unit_of_measure}</div>}
            {product.category && <div>Category: {product.category}</div>}
            {product.sku && <div>SKU: {product.sku}</div>}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Storage & Handling</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {product.shelf_life_days && <div>Shelf Life: {product.shelf_life_days} days</div>}
            {product.storage_requirements && <div>Storage: {product.storage_requirements}</div>}
          </div>
        </div>
      </div>
    </div>
  )

  // Create columns with actions
  const columns = createProductColumns({
    onEdit,
    onDelete,
    onView,
    onContactSupplier,
  })

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {bulkOperations.showBulkActions && (
        <BulkActionsToolbar
          selectedCount={bulkOperations.selectedCount}
          totalCount={displayProducts.length}
          onBulkDelete={() => bulkOperations.setIsDeleteDialogOpen(true)}
          onClearSelection={bulkOperations.clearSelection}
          onSelectAll={() => bulkOperations.handleSelectAll(true, displayProducts)}
          onSelectNone={() => bulkOperations.handleSelectAll(false, displayProducts)}
          entityType="product"
          entityTypePlural="products"
        />
      )}

      {/* Data Table with integrated ResponsiveFilterWrapper */}
      <DataTable
        {...dataTableProps}
        columns={columns}
        data={displayProducts}
        entityFilters={filters}
        onEntityFiltersChange={setFilters}
        principals={principals}
        totalCount={products.length}
        filteredCount={displayProducts.length}
        onSelectionChange={bulkOperations.handleSelectionChange}
        expandedContent={renderExpandableContent}
        emptyState={{
          title: 'No products found',
          description: 'Get started by adding your first product',
        }}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkOperations.isDeleteDialogOpen}
        onOpenChange={bulkOperations.setIsDeleteDialogOpen}
        entities={bulkOperations.selectedEntities}
        onConfirm={bulkOperations.handleBulkDelete}
        isDeleting={bulkOperations.isDeleting}
        entityType="product"
        entityTypePlural="products"
      />
    </div>
  )
}
