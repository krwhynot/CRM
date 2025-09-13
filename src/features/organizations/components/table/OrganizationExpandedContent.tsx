// Removed unused: import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { Organization } from '@/types/entities'
import {
  semanticSpacing,
  semanticTypography,
  fontWeight,
  semanticRadius,
  semanticColors,
} from '@/styles/tokens'

// Extended organization interface with weekly context
interface OrganizationWithWeeklyContext extends Organization {
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    list_price?: number
    opportunity_count?: number
  }>
  total_opportunities?: number
  active_opportunities?: number
  total_products?: number
  weekly_engagement_score?: number
  last_interaction_date?: string | Date
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
}

interface OrganizationExpandedContentProps {
  organization: OrganizationWithWeeklyContext
  isExpanded: boolean
}

export function OrganizationExpandedContent({
  organization,
  isExpanded,
}: OrganizationExpandedContentProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        `${semanticColors.backgrounds.subtle}/50 border-l-4 border-primary/20`,
        isMobile ? semanticSpacing.leftGap.lg : semanticSpacing.leftGap.xxl,
        `${semanticSpacing.stackContainer} ${semanticSpacing.layoutPadding.xxl}`
      )}
    >
      {/* Principal Products & Metrics Summary */}
      <div className={`grid grid-cols-1 ${semanticSpacing.gap.xxl} md:grid-cols-2 lg:grid-cols-3`}>
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Top Principal Products
          </h4>
          <div className={semanticSpacing.stack.xs}>
            {organization.top_principal_products &&
            organization.top_principal_products.length > 0 ? (
              organization.top_principal_products.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between ${semanticRadius.md} ${semanticColors.backgrounds.subtle} ${semanticSpacing.cardContainer}`}
                >
                  <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                    <Package className="size-3 text-muted-foreground" />
                    <div>
                      <div
                        className={`${semanticTypography.body} ${fontWeight.medium} text-foreground`}
                      >
                        {product.name}
                      </div>
                      {product.category && (
                        <div className={`${semanticTypography.caption} text-muted-foreground`}>
                          {product.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {product.list_price && (
                      <div
                        className={`${semanticTypography.body} ${fontWeight.medium} text-foreground`}
                      >
                        {formatCurrency(product.list_price)}
                      </div>
                    )}
                    {product.opportunity_count && product.opportunity_count > 0 && (
                      <div className={`${semanticTypography.caption} text-primary`}>
                        {product.opportunity_count} opp{product.opportunity_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <span className={`${semanticTypography.body} italic text-muted-foreground/80`}>
                No principal products
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Organization Metrics
          </h4>
          <div className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-gray-600`}>
            <div className="flex justify-between">
              <span>Total Opportunities:</span>
              <span className={`${semanticTypography.label}`}>
                {organization.total_opportunities || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Opportunities:</span>
              <span className={`${fontWeight.medium} text-success`}>
                {organization.active_opportunities || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Products:</span>
              <span className={`${semanticTypography.label}`}>
                {organization.total_products || 0}
              </span>
            </div>
            {organization.weekly_engagement_score && (
              <div className="flex items-center justify-between">
                <span>Engagement Score:</span>
                <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                  <div className={`h-1.5 w-16 overflow-hidden ${semanticRadius.full} bg-muted`}>
                    <div
                      className={cn(
                        `h-full ${semanticRadius.full}`,
                        organization.weekly_engagement_score >= 70
                          ? 'bg-success'
                          : organization.weekly_engagement_score >= 40
                            ? 'bg-warning'
                            : 'bg-destructive'
                      )}
                      style={{ width: `${organization.weekly_engagement_score}%` }}
                    />
                  </div>
                  <span className={`${semanticTypography.caption} ${fontWeight.medium}`}>
                    {organization.weekly_engagement_score}
                  </span>
                </div>
              </div>
            )}
            {organization.last_interaction_date && (
              <div className="flex justify-between">
                <span>Last Interaction:</span>
                <span className={fontWeight.medium}>
                  {new Date(organization.last_interaction_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Weekly Context
          </h4>
          <div className={semanticSpacing.stack.xs}>
            {organization.high_engagement_this_week && (
              <div className={`flex items-center ${semanticSpacing.gap.xxs} text-success`}>
                <TrendingUp className="size-3" />
                <span className={semanticTypography.body}>High engagement this week</span>
              </div>
            )}
            {organization.multiple_opportunities && (
              <div className={`flex items-center ${semanticSpacing.gap.xxs} text-primary`}>
                <Users className="size-3" />
                <span className={semanticTypography.body}>Multiple active opportunities</span>
              </div>
            )}
            {organization.inactive_status && (
              <div className={`flex items-center ${semanticSpacing.gap.xxs} text-destructive`}>
                <span className={semanticTypography.body}>⚠️ Low activity - needs attention</span>
              </div>
            )}
            {!organization.high_engagement_this_week &&
              !organization.multiple_opportunities &&
              !organization.inactive_status && (
                <span className={`${semanticTypography.body} italic text-muted-foreground/80`}>
                  Standard activity level
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Original organization details */}
      <div className={`grid grid-cols-1 ${semanticSpacing.gap.xxl} md:grid-cols-2 lg:grid-cols-3`}>
        {/* Contact Information */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Contact Information
          </h4>
          <div className={`${semanticSpacing.stack.xxs} ${semanticTypography.body} text-gray-600`}>
            {organization.phone && <div>Phone: {organization.phone}</div>}
            {organization.website && (
              <div>
                Website:{' '}
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  {organization.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Address
          </h4>
          <div className={`${semanticSpacing.stack.xxs} ${semanticTypography.body} text-gray-600`}>
            {organization.address_line_1 && <div>{organization.address_line_1}</div>}
            {organization.address_line_2 && <div>{organization.address_line_2}</div>}
            <div>
              {organization.city && organization.state_province
                ? `${organization.city}, ${organization.state_province}`
                : organization.city || organization.state_province || 'Not provided'}
            </div>
            {organization.postal_code && <div>{organization.postal_code}</div>}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h4 className={`${semanticSpacing.bottomGap.xs} ${fontWeight.medium} text-foreground`}>
            Details
          </h4>
          <div className={`${semanticSpacing.stack.xxs} ${semanticTypography.body} text-gray-600`}>
            <div>
              Priority:{' '}
              <span className={`${semanticTypography.label}`}>{organization.priority}</span>
            </div>
            <div>
              Type: <span className={`${semanticTypography.label}`}>{organization.type}</span>
            </div>
            <div>
              Segment: <span className={`${semanticTypography.label}`}>{organization.segment}</span>
            </div>
            {organization.description && (
              <div className={semanticSpacing.topGap.xs}>
                <span className={fontWeight.medium}>Description:</span>
                <p className={semanticSpacing.topGap.xxs}>{organization.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
