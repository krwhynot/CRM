import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { BulkActionsProvider } from '@/components/shared/BulkActions/BulkActionsProvider'
import { BulkActionsToolbar } from '@/components/shared/BulkActions/BulkActionsToolbar'
import { ProductExpandedContent } from './table/ProductExpandedContent'
import { useProductColumns } from './table/ProductRow'
import { useProductTableData } from '../hooks/useProductTableData'
import { useProductActions } from '../hooks/useProductActions'
import { semanticSpacing } from '@/styles/tokens'
import type { Product } from '@/types/entities'
import type { ProductWithPrincipal } from '@/types/product-extensions'

// Extended product interface with weekly promotion tracking
interface ProductWithWeeklyContext extends ProductWithPrincipal {
  promotion_start_date?: string | Date
  promotion_end_date?: string | Date
  is_promoted_this_week?: boolean
  opportunity_count?: number
  recent_opportunity_count?: number
  weekly_sales_velocity?: number
  was_promoted_recently?: boolean
}

interface ProductsTableProps {
  filters?: any
  products?: ProductWithWeeklyContext[]
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

function ProductsTableContainer({ filters, onEdit, onDelete }: ProductsTableProps) {
  // Data management
  const {
    sortedProducts,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  } = useProductTableData({ filters })

  // Actions
  const { selectedItems, handleSelectItem, handleEditProduct, handleDeleteProduct } =
    useProductActions()

  // Use passed props if available, otherwise use local handlers
  const handleEdit = onEdit || handleEditProduct
  const handleDelete = onDelete || handleDeleteProduct

  // Column definitions with actions
  const columns = useProductColumns({
    selectedItems,
    onSelectAll: (checked, items) => {
      if (checked) {
        items.forEach((item) => handleSelectItem(item.id, true))
      } else {
        items.forEach((item) => handleSelectItem(item.id, false))
      }
    },
    onSelectItem: handleSelectItem,
    onToggleExpansion: toggleRowExpansion,
    isRowExpanded,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  return (
    <div className={semanticSpacing.layoutContainer}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar entityType="product" entityTypePlural="products" />

      {/* Data Table */}
      <Card>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<ProductWithWeeklyContext>
            data={sortedProducts}
            columns={columns}
            rowKey={(row) => row.id}
            loading={isLoading}
            empty={{
              title: emptyMessage,
              description: emptySubtext,
            }}
            features={{ virtualization: 'auto' }}
            expandableContent={(product) => <ProductExpandedContent product={product} />}
            expandedRows={sortedProducts
              .filter((product) => isRowExpanded(product.id))
              .map((product) => product.id)}
            onToggleRow={toggleRowExpansion}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function ProductsTable({ filters, products, onEdit, onDelete }: ProductsTableProps) {
  return (
    <BulkActionsProvider<ProductWithWeeklyContext>
      items={products || []}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name || 'Unnamed Product'}
      entityType="product"
      entityTypePlural="products"
    >
      <ProductsTableContainer filters={filters} onEdit={onEdit} onDelete={onDelete} />
    </BulkActionsProvider>
  )
}
