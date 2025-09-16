"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/metrics-utils"
import type { Organization } from "@/types/entities"

// Extended organization interface with expansion data
interface OrganizationWithExpansionData extends Organization {
  // Principal products tracking
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    list_price?: number
    opportunity_count?: number
  }>

  // Organization metrics
  total_opportunities?: number
  active_opportunities?: number
  total_products?: number
  weekly_engagement_score?: number
  last_interaction_date?: string | Date

  // Weekly context
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
}

interface OrganizationExpansionProps {
  organization: OrganizationWithExpansionData
}

/**
 * Organization Expansion Component
 *
 * Renders detailed organization information in expandable table rows.
 * Displays principal products, metrics, weekly context, and contact information.
 *
 * Maps to database fields:
 * - Core organization fields from organizations table
 * - Computed fields from related tables (products, opportunities, interactions)
 * - Address fields: address_line_1, address_line_2, city, state_province, postal_code
 * - Contact fields: phone, email, website
 * - Business fields: priority, type, segment, description
 */
export function OrganizationExpansion({ organization }: OrganizationExpansionProps) {
  return (
    <div className="space-y-6">
      {/* Principal Products & Metrics Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Top Principal Products</h4>
          <div className="space-y-2">
            {organization.top_principal_products && organization.top_principal_products.length > 0 ? (
              organization.top_principal_products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                  <div className="flex items-center gap-2">
                    <Package className="size-3 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500">{product.category}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {product.list_price && (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.list_price)}
                      </div>
                    )}
                    {product.opportunity_count && product.opportunity_count > 0 && (
                      <div className="text-xs text-blue-600">
                        {product.opportunity_count} opp{product.opportunity_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm italic text-gray-400">No principal products</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Organization Metrics</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Opportunities:</span>
              <span className="font-medium">{organization.total_opportunities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Opportunities:</span>
              <span className="font-medium text-green-600">{organization.active_opportunities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Products:</span>
              <span className="font-medium">{organization.total_products || 0}</span>
            </div>
            {organization.weekly_engagement_score && (
              <div className="flex items-center justify-between">
                <span>Engagement Score:</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        organization.weekly_engagement_score >= 70 ? "bg-green-500" :
                        organization.weekly_engagement_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${organization.weekly_engagement_score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{organization.weekly_engagement_score}</span>
                </div>
              </div>
            )}
            {organization.last_interaction_date && (
              <div className="flex justify-between">
                <span>Last Interaction:</span>
                <span className="font-medium">
                  {new Date(organization.last_interaction_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Weekly Context</h4>
          <div className="space-y-2">
            {organization.high_engagement_this_week && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="size-3" />
                <span className="text-sm">High engagement this week</span>
              </div>
            )}
            {organization.multiple_opportunities && (
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="size-3" />
                <span className="text-sm">Multiple active opportunities</span>
              </div>
            )}
            {organization.inactive_status && (
              <div className="flex items-center gap-1 text-red-600">
                <span className="text-sm">⚠️ Low activity - needs attention</span>
              </div>
            )}
            {!organization.high_engagement_this_week && !organization.multiple_opportunities && !organization.inactive_status && (
              <span className="text-sm italic text-gray-400">Standard activity level</span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed organization information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Contact Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {organization.phone && <div>Phone: {organization.phone}</div>}
            {organization.email && (
              <div>
                Email:{' '}
                <a
                  href={`mailto:${organization.email}`}
                  className="text-primary hover:text-primary/80"
                >
                  {organization.email}
                </a>
              </div>
            )}
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
            {!organization.phone && !organization.email && !organization.website && (
              <span className="italic text-gray-400">No contact information</span>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Address</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {organization.address_line_1 && <div>{organization.address_line_1}</div>}
            {organization.address_line_2 && <div>{organization.address_line_2}</div>}
            <div>
              {organization.city && organization.state_province
                ? `${organization.city}, ${organization.state_province}`
                : organization.city || organization.state_province || 'Not provided'}
            </div>
            {organization.postal_code && <div>{organization.postal_code}</div>}
            {organization.country && <div>{organization.country}</div>}
          </div>
        </div>

        {/* Business Details */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Business Details</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Priority:</span>
              <Badge variant="outline" className={cn(
                organization.priority === 'A' ? 'bg-red-100 text-red-800 border-red-300' :
                organization.priority === 'B' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                organization.priority === 'C' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-gray-100 text-gray-700 border-gray-300'
              )}>
                {organization.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <Badge variant="outline" className={cn(
                organization.type === 'customer' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                organization.type === 'distributor' ? 'bg-green-100 text-green-800 border-green-300' :
                organization.type === 'principal' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                'bg-indigo-100 text-indigo-800 border-indigo-300'
              )}>
                {organization.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Segment:</span>
              <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                {organization.segment}
              </Badge>
            </div>
            {organization.industry && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Industry:</span> {organization.industry}
              </div>
            )}
            {organization.description && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <p className="mt-1 text-sm text-gray-600">{organization.description}</p>
              </div>
            )}
            {organization.notes && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-600">Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{organization.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationExpansion