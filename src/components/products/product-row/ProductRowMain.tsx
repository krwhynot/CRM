import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ProductBadges } from '../ProductBadges'
import { ProductActions } from '../ProductActions'
import { formatPrice } from '@/lib/product-formatters'
import type { Product, ProductWithPrincipal } from '@/types/entities'

interface ProductRowMainProps {
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

export const ProductRowMain: React.FC<ProductRowMainProps> = ({
  product,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContactSupplier
}) => {
  return (
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
  )
}