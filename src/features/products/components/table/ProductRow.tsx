import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ProductBadges } from '../ProductBadges'
import { ProductActions } from '../ProductActions'
import { Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/product-formatters'
import type { Product } from '@/types/entities'
import type { ProductWithPrincipal } from '@/types/product-extensions'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { semanticSpacing, semanticTypography, fontWeight, semanticColors } from '@/styles/tokens'

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

export function useProductColumns({
  selectedItems,
  onSelectAll,
  onSelectItem,
  onToggleExpansion,
  isRowExpanded,
  onEdit,
  onDelete,
  onView,
  onContactSupplier,
}: {
  selectedItems: Set<string>
  onSelectAll: (checked: boolean, items: ProductWithWeeklyContext[]) => void
  onSelectItem: (id: string, checked: boolean) => void
  onToggleExpansion: (id: string) => void
  isRowExpanded: (id: string) => boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onContactSupplier?: (product: Product) => void
}) {
  const columns: DataTableColumn<ProductWithWeeklyContext>[] = [
    {
      key: 'selection',
      header: (sortedProducts: ProductWithWeeklyContext[]) => (
        <Checkbox
          checked={selectedItems.size > 0 && selectedItems.size === sortedProducts.length}
          onCheckedChange={(checked) => onSelectAll(!!checked, sortedProducts)}
          aria-label="Select all products"
          className={semanticSpacing.interactiveElement}
        />
      ),
      cell: (product) => (
        <Checkbox
          checked={selectedItems.has(product.id)}
          onCheckedChange={(checked) => onSelectItem(product.id, !!checked)}
          aria-label={`Select ${product.name}`}
          className={semanticSpacing.interactiveElement}
        />
      ),
    },
    {
      key: 'expand',
      header: '',
      cell: (product) => (
        <Button
          variant="ghost"
          onClick={() => onToggleExpansion(product.id)}
          className={cn(
            semanticSpacing.interactiveElement,
            `transition-transform duration-200`,
            isRowExpanded(product.id) && 'rotate-90'
          )}
          aria-label={`${isRowExpanded(product.id) ? 'Collapse' : 'Expand'} product details`}
        >
          <span className="sr-only">Toggle row expansion</span>▶
        </Button>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      cell: (product) => <ProductNameCell product={product} />,
      className: `w-[35%] ${semanticSpacing.layoutPadding.xxl} ${semanticSpacing.layoutPadding.lg}`,
    },
    {
      key: 'principal',
      header: 'Principal',
      cell: (product) => (
        <div>
          <div className={`${semanticTypography.body} ${fontWeight.medium} text-foreground`}>
            {product.principal?.name || 'No Principal'}
          </div>
          {product.principal?.territory && (
            <div className={`${semanticTypography.caption} text-gray-500`}>
              {product.principal.territory}
            </div>
          )}
        </div>
      ),
      className: `w-[20%] ${semanticSpacing.layoutPadding.xxl} ${semanticSpacing.layoutPadding.lg}`,
      hidden: { sm: true },
    },
    {
      key: 'pricing',
      header: 'Pricing',
      cell: (product) => (
        <div className="text-right">
          {product.list_price && (
            <div className={cn(semanticTypography.label, semanticTypography.body)}>
              {formatPrice(product.list_price)}
            </div>
          )}
          {product.margin_percentage && (
            <div className={`${semanticTypography.caption} text-gray-500`}>
              {product.margin_percentage}% margin
            </div>
          )}
        </div>
      ),
      className: `w-[15%] ${semanticSpacing.layoutPadding.xxl} ${semanticSpacing.layoutPadding.lg} text-right`,
      hidden: { sm: true, md: true },
    },
    {
      key: 'opportunities',
      header: 'Opportunities',
      cell: (product) => (
        <div className="text-right">
          <div className={cn(semanticTypography.label, semanticTypography.body)}>
            {product.opportunity_count || 0}
          </div>
          {(product.recent_opportunity_count || 0) > 0 && (
            <div className={`${semanticTypography.caption} text-blue-600`}>
              {product.recent_opportunity_count} recent
            </div>
          )}
        </div>
      ),
      className: `w-[15%] ${semanticSpacing.layoutPadding.xxl} ${semanticSpacing.layoutPadding.lg} text-right`,
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
      className: `w-[10%] ${semanticSpacing.layoutPadding.xxl} ${semanticSpacing.layoutPadding.lg} text-right`,
    },
  ]

  return columns
}

function ProductNameCell({ product }: { product: ProductWithWeeklyContext }) {
  return (
    <div className={semanticSpacing.stack.xs}>
      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        <div className={cn(semanticTypography.label, semanticTypography.body, 'text-gray-900')}>
          {product.name}
        </div>

        {/* Promotion indicators */}
        {product.is_promoted_this_week && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Calendar className="size-3 text-green-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Promoted this week</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {product.weekly_sales_velocity && product.weekly_sales_velocity > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <TrendingUp className="size-3 text-blue-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>High sales velocity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        <ProductBadges category={product.category} isActive={product.is_active} sku={product.sku} />

        {/* Promotion badges */}
        {product.is_promoted_this_week && (
          <Badge
            variant="secondary"
            className={`border-green-200 bg-green-50 ${semanticTypography.caption} text-green-700`}
          >
            Promoted
          </Badge>
        )}

        {product.was_promoted_recently && !product.is_promoted_this_week && (
          <Badge
            variant="secondary"
            className={`border-blue-200 bg-blue-50 ${semanticTypography.caption} text-blue-700`}
          >
            Recently Promoted
          </Badge>
        )}

        {/* Opportunity badge */}
        {(product.opportunity_count || 0) > 0 && (
          <Badge
            variant="secondary"
            className={`${semanticColors.borderStyles.subtle} ${semanticColors.backgrounds.subtle} ${semanticTypography.caption} ${semanticColors.text.subtle}`}
          >
            {product.opportunity_count} opp{product.opportunity_count !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* SKU and additional info */}
      <div className={`${semanticTypography.caption} text-gray-500`}>
        {product.sku && <span>SKU: {product.sku}</span>}
        {product.sku && product.category && <span> • </span>}
        {product.category && <span>{product.category}</span>}
      </div>
    </div>
  )
}
