import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, Package, DollarSign } from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'
import { formatPrice } from '@/lib/product-formatters'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { Product } from '@/types/entities'
import type { ProductWithPrincipal } from '@/types/product-extensions'
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

interface ProductExpandedContentProps {
  product: ProductWithWeeklyContext
  isExpanded: boolean
}

export function ProductExpandedContent({ product, isExpanded }: ProductExpandedContentProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        `${semanticColors.backgrounds.subtle}/50 border-l-4 border-primary/20`,
        isMobile ? semanticSpacing.leftGap.lg : semanticSpacing.leftGap.xxl,
        `${semanticSpacing.stackContainer} ${semanticSpacing.layoutPadding.xxl}`
      )}
    >
      {/* Product Details Grid */}
      <div className={`grid grid-cols-1 ${semanticSpacing.gap.xxl} md:grid-cols-2 lg:grid-cols-3`}>
        {/* Product Information */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Product Information
          </h4>
          <div
            className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
              <Package className="size-3" />
              <span>SKU: {product.sku || 'Not assigned'}</span>
            </div>
            {product.category && <div>Category: {product.category}</div>}
            {product.brand && <div>Brand: {product.brand}</div>}
            {product.unit_size && <div>Unit Size: {product.unit_size}</div>}
            {product.units_per_case && <div>Units per Case: {product.units_per_case}</div>}
          </div>
        </div>

        {/* Pricing Information */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Pricing
          </h4>
          <div
            className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            {product.list_price && (
              <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                <DollarSign className="size-3" />
                <span>List Price: {formatPrice(product.list_price)}</span>
              </div>
            )}
            {product.cost && <div>Cost: {formatPrice(product.cost)}</div>}
            {product.margin_percentage && <div>Margin: {product.margin_percentage}%</div>}
          </div>
        </div>

        {/* Principal Information */}
        {product.principal && (
          <div>
            <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
              Principal
            </h4>
            <div
              className={`${semanticSpacing.stack.xxs} ${semanticTypography.body} text-muted-foreground`}
            >
              <div className={`${fontWeight.medium} text-foreground`}>{product.principal.name}</div>
              {product.principal.contact_email && (
                <div>Contact: {product.principal.contact_email}</div>
              )}
              {product.principal.territory && <div>Territory: {product.principal.territory}</div>}
            </div>
          </div>
        )}

        {/* Promotion Information */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Promotions
          </h4>
          <div className={semanticSpacing.stack.xs}>
            {product.is_promoted_this_week ? (
              <Badge
                variant="secondary"
                className={`border-green-200 bg-green-50 ${semanticTypography.caption} text-green-700`}
              >
                <Calendar className={`size-3 ${semanticSpacing.rightGap.xxs}`} />
                Promoted This Week
              </Badge>
            ) : product.was_promoted_recently ? (
              <Badge
                variant="secondary"
                className={`border-blue-200 bg-blue-50 ${semanticTypography.caption} text-blue-700`}
              >
                Recently Promoted
              </Badge>
            ) : (
              <span className={`${semanticTypography.body} italic text-muted-foreground`}>
                No active promotions
              </span>
            )}

            {product.promotion_start_date && product.promotion_end_date && (
              <div className={`${semanticTypography.caption} text-muted-foreground`}>
                {new Date(product.promotion_start_date).toLocaleDateString()} -{' '}
                {new Date(product.promotion_end_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Sales Information */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Sales Metrics
          </h4>
          <div
            className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            <div className="flex justify-between">
              <span>Total Opportunities:</span>
              <span className={fontWeight.medium}>{product.opportunity_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Recent Opportunities:</span>
              <span className={`${fontWeight.medium} text-primary`}>
                {product.recent_opportunity_count || 0}
              </span>
            </div>
            {product.weekly_sales_velocity && (
              <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                <TrendingUp className="size-3" />
                <span>Weekly Velocity: {product.weekly_sales_velocity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Additional Details
          </h4>
          <div
            className={`${semanticSpacing.stack.xxs} ${semanticTypography.body} text-muted-foreground`}
          >
            {product.is_active !== undefined && (
              <div>
                Status:{' '}
                <span
                  className={cn(
                    fontWeight.medium,
                    product.is_active ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
            {product.created_at && <div>Created: {formatTimeAgo(product.created_at)}</div>}
            {product.description && (
              <div className={semanticSpacing.topGap.xs}>
                <span className={fontWeight.medium}>Description:</span>
                <p className={semanticSpacing.topGap.xxs}>{product.description}</p>
              </div>
            )}
            {product.notes && (
              <div className={semanticSpacing.topGap.xs}>
                <span className={fontWeight.medium}>Notes:</span>
                <p className={semanticSpacing.topGap.xxs}>{product.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
