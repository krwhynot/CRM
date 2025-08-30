import { useState } from 'react'
import { SimpleTable } from '@/components/ui/simple-table'
import { ProductsFilters } from './ProductsFilters'
import { ProductRow } from './ProductRow'
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
import { useProductsFiltering } from '../hooks/useProductsFiltering'
import { useProductsDisplay } from '../hooks/useProductsDisplay'
import { useDeleteProduct } from '../hooks/useProducts'
import { toast } from '@/lib/toast-styles'
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
    filterPills
  } = useProductsFiltering(products)

  const { toggleRowExpansion, isRowExpanded } = useProductsDisplay(
    products.map(product => product.id)
  )

  // Selection management functions
  const handleSelectAllFromToolbar = () => {
    setSelectedIds(filteredProducts.map(product => product.id))
  }

  const handleSelectNoneFromToolbar = () => {
    setSelectedIds([])
  }

  const handleRowSelect = (productId: string) => {
    setSelectedIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true)
  }

  // Get selected products for dialog
  const selectedProducts = products.filter(product => selectedIds.includes(product.id))

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
          console.error(`Failed to delete product ${productId}:`, error)
          results.push({ 
            id: productId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully archived ${successCount} product${successCount !== 1 ? 's' : ''}`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} products, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} product${errorCount !== 1 ? 's' : ''}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        const successfulIds = results
          .filter(r => r.status === 'success')
          .map(r => r.id)
        
        setSelectedIds(prev => prev.filter(id => !successfulIds.includes(id)))
      }
      
    } catch (error) {
      console.error('Unexpected error during bulk delete:', error)
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Headers configuration for SimpleTable
  const headers = [
    { label: '', isCheckbox: true },
    { label: 'Product', className: 'min-w-56' },
    { label: 'Price', className: 'min-w-20 text-right' },
    { label: 'Principal', className: 'min-w-28' },
    { label: 'Brand', className: 'min-w-20' },
    { label: 'Actions', className: 'text-center min-w-28' }
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
      isSelected={selectedIds.includes(product.id)}
      onSelect={() => handleRowSelect(product.id)}
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

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        totalCount={filteredProducts.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
      />

      {/* Table Container */}
      <SimpleTable
        data={filteredProducts}
        loading={loading}
        headers={headers}
        renderRow={renderProductRow}
        emptyMessage={activeFilter !== 'all' ? 'No products match your criteria' : 'No products found'}
        emptySubtext={activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first product'}
        colSpan={7}
        selectedCount={selectedIds.length}
        totalCount={filteredProducts.length}
        onSelectAll={(checked) => {
          if (checked) {
            setSelectedIds(filteredProducts.map(product => product.id))
          } else {
            setSelectedIds([])
          }
        }}
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

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedProducts}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
