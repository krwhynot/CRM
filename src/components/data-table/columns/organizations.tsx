"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Organization } from "@/types/entities"

// Extended organization interface with weekly context (matches OrganizationsTable.tsx)
interface OrganizationWithWeeklyContext extends Organization {
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

// Organization action handlers interface
interface OrganizationActions {
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
}

// Helper component for empty cell display
const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

// Organization badges component
const OrganizationBadges: React.FC<{
  priority: string
  type: string
  segment: string
}> = ({ priority, type, segment }) => (
  <div className="flex flex-wrap items-center gap-1">
    <Badge variant="outline" className={cn(
      priority === 'A' ? 'bg-red-100 text-red-800 border-red-300' :
      priority === 'B' ? 'bg-orange-100 text-orange-800 border-orange-300' :
      priority === 'C' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
      'bg-gray-100 text-gray-700 border-gray-300'
    )}>
      {priority}
    </Badge>
    <Badge variant="outline" className={cn(
      type === 'customer' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      type === 'distributor' ? 'bg-green-100 text-green-800 border-green-300' :
      type === 'principal' ? 'bg-purple-100 text-purple-800 border-purple-300' :
      'bg-indigo-100 text-indigo-800 border-indigo-300'
    )}>
      {type}
    </Badge>
    <Badge variant="outline" className="border-gray-200 bg-gray-50 text-xs text-gray-700">
      {segment}
    </Badge>
  </div>
)

// Organization actions dropdown component
const OrganizationActionsDropdown: React.FC<{
  organization: Organization
  actions?: OrganizationActions
}> = ({ organization, actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="size-8 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {actions?.onView && (
        <DropdownMenuItem onClick={() => actions.onView!(organization)}>
          View Details
        </DropdownMenuItem>
      )}
      {actions?.onEdit && (
        <DropdownMenuItem onClick={() => actions.onEdit!(organization)}>
          Edit Organization
        </DropdownMenuItem>
      )}
      {actions?.onContact && (
        <DropdownMenuItem onClick={() => actions.onContact!(organization)}>
          Add Contact
        </DropdownMenuItem>
      )}
      {actions?.onDelete && (
        <DropdownMenuItem
          onClick={() => actions.onDelete!(organization)}
          className="text-red-600"
        >
          Archive Organization
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)

/**
 * Standard organization column definitions for TanStack Table
 *
 * Maps to exact database field names from organizations table:
 * - id: UUID primary key
 * - name: organization name (string, 255 chars max)
 * - type: organization_type enum (customer, distributor, principal, supplier)
 * - priority: A, B, C, D priority levels
 * - segment: business segment (string, 100 chars max)
 * - phone: phone number (string, 50 chars max)
 * - city: city location (string, 100 chars max)
 * - state_province: state/province (string, 100 chars max)
 * - primary_manager_name: display field (not stored in organizations table)
 * - secondary_manager_name: display field (not stored in organizations table)
 */
export function createOrganizationColumns(
  actions?: OrganizationActions
): ColumnDef<OrganizationWithWeeklyContext>[] {
  const columns: ColumnDef<OrganizationWithWeeklyContext>[] = []

  // Note: Selection and expansion columns are handled by the DataTable component
  // to avoid duplicate rendering.

  // Main columns
  columns.push(
    {
      id: "organization",
      header: "Organization",
      accessorFn: (row) => row.name, // Maps to 'name' field
      cell: ({ row }) => {
        const organization = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-gray-900">
                {organization.name || <EmptyCell />}
              </div>
              {organization.high_engagement_this_week && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <TrendingUp className="size-3 text-green-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>High engagement this week</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {organization.multiple_opportunities && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Users className="size-3 text-blue-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Multiple active opportunities</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {organization.inactive_status && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <span className="size-2 animate-pulse rounded-full bg-red-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Low activity - needs attention</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center gap-2">
              <OrganizationBadges
                priority={organization.priority}
                type={organization.type}
                segment={organization.segment}
              />
              {(organization.active_opportunities || 0) > 0 && (
                <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                  {organization.active_opportunities} active opp{(organization.active_opportunities || 0) !== 1 ? 's' : ''}
                </Badge>
              )}
              {(organization.total_products || 0) > 0 && (
                <Badge variant="secondary" className="border-gray-200 bg-gray-50 text-xs text-gray-700">
                  {organization.total_products} product{(organization.total_products || 0) !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Weekly engagement score */}
            {organization.weekly_engagement_score && organization.weekly_engagement_score > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Engagement:</span>
                <div className="flex items-center">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        organization.weekly_engagement_score >= 70 ? "bg-green-500" :
                        organization.weekly_engagement_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${organization.weekly_engagement_score}%` }}
                    />
                  </div>
                  <span className="ml-1 text-xs text-gray-400">{organization.weekly_engagement_score}</span>
                </div>
              </div>
            )}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phone", // Maps to 'phone' field
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.phone || <EmptyCell />}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "managers",
      header: "Managers",
      accessorFn: (row) => row.primary_manager_name, // Maps to display field
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {row.original.primary_manager_name || <EmptyCell />}
          </div>
          {row.original.secondary_manager_name && (
            <div className="text-xs text-gray-600">+ {row.original.secondary_manager_name}</div>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "location",
      header: "Location",
      accessorFn: (row) => `${row.city || ''} ${row.state_province || ''}`.trim(), // Maps to 'city' and 'state_province' fields
      cell: ({ row }) => {
        const { city, state_province } = row.original
        if (city && state_province) {
          return `${city}, ${state_province}`
        }
        if (city) {
          return city
        }
        if (state_province) {
          return state_province
        }
        return <EmptyCell />
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <OrganizationActionsDropdown
          organization={row.original}
          actions={actions}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 80,
    }
  )

  return columns
}

// Default export for convenience
export const organizationColumns = createOrganizationColumns()