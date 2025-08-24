import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Package, Scale, Calendar, Building2, FileText } from 'lucide-react'
import { ProductBadges } from './ProductBadges'
import { ProductActions } from './ProductActions'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductRowProps {
  product: ProductWithPrincipal
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

const formatPrice = (price: number | null): string => {
  if (!price || price <= 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const formatShelfLife = (days: number | null): string => {
  if (!days || days <= 0) return 'N/A'
  if (days === 1) return '1 day'
  if (days < 30) return `${days} days`
  if (days < 365) {
    const months = Math.round(days / 30)
    return months === 1 ? '1 month' : `${months} months`
  }
  const years = Math.round(days / 365)
  return years === 1 ? '1 year' : `${years} years`
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContactSupplier
}) => {
  return (
    <>
      {/* Main Row */}
      <TableRow className="hover:bg-gray-50 transition-colors duration-200 group">
        <TableCell className="py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpansion}
            className="p-0 h-auto hover:bg-transparent"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium py-4">
          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900">
              {product.name || <EmptyCell />}
            </div>
            {product.sku && (
              <div className="text-xs text-gray-500 font-mono">
                SKU: {product.sku}
              </div>
            )}
            <ProductBadges
              category={product.category}
              price={product.list_price}
              shelfLifeDays={product.shelf_life_days}
              inStock={product.in_stock}
              lowStock={product.low_stock}
            />
          </div>
        </TableCell>
        <TableCell className="py-4 text-right">
          <div className="text-base font-semibold text-gray-900">
            {formatPrice(product.list_price)}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="text-sm text-gray-700">
            {product.principal_name || <EmptyCell />}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="text-sm text-gray-700">
            {product.brand || <EmptyCell />}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <ProductActions
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onContactSupplier={onContactSupplier}
          />
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
              {/* Product Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {product.description || <EmptyCell />}
                  </div>
                </div>

                {/* Shelf Life */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Shelf Life
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {formatShelfLife(product.shelf_life_days)}
                  </div>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Package Size */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Package className="h-4 w-4" />
                    Package Size
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {product.package_size || <EmptyCell />}
                  </div>
                </div>

                {/* Unit of Measure */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Scale className="h-4 w-4" />
                    Unit of Measure
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {product.unit_of_measure || <EmptyCell />}
                  </div>
                </div>

                {/* Origin Country */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Building2 className="h-4 w-4" />
                    Origin
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {product.origin_country || <EmptyCell />}
                  </div>
                </div>
              </div>

              {/* Storage Requirements - Full Width (only if present) */}
              {product.storage_requirements && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Package className="h-4 w-4" />
                    Storage Requirements
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {product.storage_requirements}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}