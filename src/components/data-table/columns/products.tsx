'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/product-formatters'
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
}

// Product action handlers interface
interface ProductActions {
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
}

// Helper component for empty cell display
const EmptyCell = () => <span className="italic text-muted-foreground">Not provided</span>

// Product badges component using enhanced semantic tokens
const ProductBadges: React.FC<{
  category?: string
  price?: number | null
  shelfLifeDays?: number | null
  inStock?: boolean
  lowStock?: boolean
}> = ({ category, price, shelfLifeDays, inStock = true, lowStock = false }) => (
  <div className="flex flex-wrap items-center gap-1">
    {category && (
      <Badge variant="outline" className="border-info bg-info/10 text-xs text-info-foreground">
        {category.replace(/_/g, ' ')}
      </Badge>
    )}
    {price && price > 20 && (
      <Badge variant="outline" className="border-success bg-success/10 text-xs text-success-foreground">
        High Value
      </Badge>
    )}
    {shelfLifeDays && shelfLifeDays < 30 && (
      <Badge variant="outline" className="border-warning bg-warning/10 text-xs text-warning-foreground">
        Perishable
      </Badge>
    )}
    {!inStock && (
      <Badge variant="outline" className="border-destructive bg-destructive/10 text-xs text-destructive-foreground">
        Out of Stock
      </Badge>
    )}
    {lowStock && inStock && (
      <Badge variant="outline" className="border-warning bg-warning/10 text-xs text-warning-foreground">
        Low Stock
      </Badge>
    )}
  </div>
)

// Product actions dropdown component
const ProductActionsDropdown: React.FC<{
  product: Product
  actions?: ProductActions
}> = ({ product, actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="size-8 p-0" onClick={(e) => e.stopPropagation()}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {actions?.onView && (
        <DropdownMenuItem onClick={() => actions.onView!(product)}>View Details</DropdownMenuItem>
      )}
      {actions?.onEdit && (
        <DropdownMenuItem onClick={() => actions.onEdit!(product)}>Edit Product</DropdownMenuItem>
      )}
      {actions?.onContactSupplier && (
        <DropdownMenuItem onClick={() => actions.onContactSupplier!(product)}>
          Contact Supplier
        </DropdownMenuItem>
      )}
      {actions?.onDelete && (
        <DropdownMenuItem onClick={() => actions.onDelete!(product)} className="text-destructive">
          Archive Product
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)

/**
 * Standard product column definitions for TanStack Table
 *
 * Maps to exact database field names from products table:
 * - id: UUID primary key
 * - name: product name (string, 255 chars max)
 * - sku: product SKU (string, 100 chars max)
 * - description: product description (text)
 * - category: product_category enum
 * - list_price: decimal price
 * - unit_of_measure: string (50 chars max)
 * - shelf_life_days: integer
 * - brand: string (100 chars max)
 * - package_size: string (100 chars max)
 * - principal_id: UUID foreign key to organizations
 */
export function createProductColumns(
  actions?: ProductActions
): ColumnDef<ProductWithWeeklyContext>[] {
  const columns: ColumnDef<ProductWithWeeklyContext>[] = []

  // Note: Selection and expansion columns are handled by the DataTable component
  // to avoid duplicate rendering.

  // Main columns
  columns.push(
    {
      id: 'product',
      header: 'Product',
      accessorFn: (row) => row.name, // Maps to 'name' field
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-foreground">
                {product.name || <EmptyCell />}
              </div>
              {product.is_promoted_this_week && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Calendar className="size-3 text-success" />
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
                        <TrendingUp className="size-3 text-info" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{product.opportunity_count} active opportunities</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {product.sku && (
              <div className="font-mono text-xs text-muted-foreground">SKU: {product.sku}</div>
            )}

            <div className="flex items-center gap-2">
              <ProductBadges
                category={product.category}
                price={product.list_price}
                shelfLifeDays={product.shelf_life_days}
                inStock={product.in_stock ?? true}
                lowStock={product.low_stock ?? false}
              />
              {(product.opportunity_count || 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="border-info bg-info/10 text-xs text-info-foreground"
                >
                  {product.opportunity_count} opp{(product.opportunity_count || 0) !== 1 ? 's' : ''}
                </Badge>
              )}
              {product.is_promoted_this_week && (
                <Badge
                  variant="secondary"
                  className="border-success bg-success/10 text-xs text-success-foreground"
                >
                  Promoted
                </Badge>
              )}
            </div>

            {/* Promotion dates */}
            {(product.promotion_start_date || product.promotion_end_date) && (
              <div className="text-xs text-muted-foreground">
                {product.promotion_start_date && product.promotion_end_date ? (
                  <span>
                    Promotion: {new Date(product.promotion_start_date).toLocaleDateString()} -{' '}
                    {new Date(product.promotion_end_date).toLocaleDateString()}
                  </span>
                ) : product.promotion_start_date ? (
                  <span>
                    Started: {new Date(product.promotion_start_date).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Ends: {new Date(product.promotion_end_date).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'price',
      header: 'Price',
      accessorKey: 'list_price', // Maps to 'list_price' field
      cell: ({ row }) => (
        <div className="text-base font-semibold text-foreground">
          {formatPrice(row.original.list_price)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'principal',
      header: 'Principal',
      accessorKey: 'principal_name', // Maps to joined field from organizations
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.principal_name || <EmptyCell />}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'brand',
      header: 'Brand',
      accessorKey: 'brand', // Maps to 'brand' field
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.brand || <EmptyCell />}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <ProductActionsDropdown product={row.original} actions={actions} />,
      enableSorting: false,
      enableHiding: false,
      size: 80,
    }
  )

  return columns
}

// Default export for convenience
export const productColumns = createProductColumns()
