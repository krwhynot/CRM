import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ProductBadges } from '../ProductBadges'
import { ProductActions } from '../ProductActions'
import { formatPrice } from '@/lib/product-formatters'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/entities'
import type { ProductDisplayData } from '@/types/product-extensions'

interface ProductRowMainProps {
  product: ProductDisplayData
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
  isSelected?: boolean
  onSelect?: () => void
}

const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

export const ProductRowMain: React.FC<ProductRowMainProps> = ({
  product,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContactSupplier,
  isSelected = false,
  onSelect,
}) => {
  return (
    <TableRow
      className={cn(
        'hover:bg-gray-50 transition-colors duration-200 group',
        isSelected && 'bg-blue-50 hover:bg-blue-100'
      )}
    >
      <TableCell className="py-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${product.name}`}
        />
      </TableCell>
      <TableCell className="py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpansion}
          className="h-auto p-0 hover:bg-transparent"
        >
          {isExpanded ? (
            <ChevronDown className="size-4 text-gray-500" />
          ) : (
            <ChevronRight className="size-4 text-gray-500" />
          )}
        </Button>
      </TableCell>
      <TableCell className="py-4 font-medium">
        <div className="space-y-2">
          <div className="text-base font-semibold text-gray-900">
            {product.name || <EmptyCell />}
          </div>
          {product.sku && <div className="font-mono text-xs text-gray-500">SKU: {product.sku}</div>}
          <ProductBadges
            category={product.category}
            price={product.list_price}
            shelfLifeDays={product.shelf_life_days}
            inStock={product.in_stock ?? true}
            lowStock={product.low_stock ?? false}
          />
        </div>
      </TableCell>
      <TableCell className="py-4 text-right">
        <div className="text-base font-semibold text-gray-900">
          {formatPrice(product.list_price)}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-700">{product.principal_name || <EmptyCell />}</div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-700">{product.brand || <EmptyCell />}</div>
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
