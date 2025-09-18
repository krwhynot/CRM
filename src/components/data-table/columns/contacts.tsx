'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Mail, Phone, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Contact } from '@/types/entities'
import { formatTimeAgo } from '@/lib/utils'

// Extended contact interface with computed fields
interface ContactWithComputedFields extends Contact {
  // Organization relationship
  organization?: {
    id: string
    name: string
    type: string
  }

  // Computed authority levels
  decision_authority_level?: string
  purchase_influence_score?: number
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean

  // Activity tracking
  recent_interactions_count?: number
  last_interaction_date?: string | Date

  // Status indicators
  high_value_contact?: boolean
  needs_follow_up?: boolean
}

// Contact action handlers interface
interface ContactActions {
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onCreateOpportunity?: (contact: Contact) => void
}

// Helper component for empty cell display
const EmptyCell = () => <span className="italic text-muted-foreground">Not provided</span>

// Contact authority badges component using enhanced semantic tokens
const AuthorityBadges: React.FC<{
  purchaseInfluence: string
  decisionAuthority: string
}> = ({ purchaseInfluence, decisionAuthority }) => (
  <div className="flex flex-wrap items-center gap-1">
    <Badge
      variant="outline"
      className={cn(
        purchaseInfluence === 'High'
          ? 'bg-success/10 text-success-foreground border-success'
          : purchaseInfluence === 'Medium'
            ? 'bg-warning/10 text-warning-foreground border-warning'
            : purchaseInfluence === 'Low'
              ? 'bg-destructive/10 text-destructive-foreground border-destructive'
              : 'bg-muted text-muted-foreground border-border'
      )}
    >
      {purchaseInfluence} Influence
    </Badge>
    <Badge
      variant="outline"
      className={cn(
        decisionAuthority === 'Decision Maker'
          ? 'bg-org-principal/10 text-org-principal-foreground border-org-principal'
          : decisionAuthority === 'Influencer'
            ? 'bg-org-customer/10 text-org-customer-foreground border-org-customer'
            : decisionAuthority === 'End User'
              ? 'bg-org-supplier/10 text-org-supplier-foreground border-org-supplier'
              : 'bg-muted text-muted-foreground border-border'
      )}
    >
      {decisionAuthority}
    </Badge>
  </div>
)

// Contact actions dropdown component
const ContactActionsDropdown: React.FC<{
  contact: Contact
  actions?: ContactActions
}> = ({ contact, actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="size-8 p-0" onClick={(e) => e.stopPropagation()}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {actions?.onView && (
        <DropdownMenuItem onClick={() => actions.onView!(contact)}>View Details</DropdownMenuItem>
      )}
      {actions?.onEdit && (
        <DropdownMenuItem onClick={() => actions.onEdit!(contact)}>Edit Contact</DropdownMenuItem>
      )}
      {actions?.onCreateOpportunity && (
        <DropdownMenuItem onClick={() => actions.onCreateOpportunity!(contact)}>
          Create Opportunity
        </DropdownMenuItem>
      )}
      {actions?.onDelete && (
        <DropdownMenuItem onClick={() => actions.onDelete!(contact)} className="text-destructive">
          Archive Contact
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)

/**
 * Standard contact column definitions for TanStack Table
 *
 * Maps to exact database field names from contacts table:
 * - id: UUID primary key
 * - first_name: first name (string, 100 chars max)
 * - last_name: last name (string, 100 chars max)
 * - email: email address (string, 255 chars max)
 * - phone: phone number (string, 50 chars max)
 * - mobile_phone: mobile phone (string, 50 chars max)
 * - title: job title (string, 100 chars max)
 * - department: department (string, 100 chars max)
 * - purchase_influence: High, Medium, Low, Unknown
 * - decision_authority: Decision Maker, Influencer, End User, Gatekeeper
 * - role: contact_role enum
 * - is_primary_contact: boolean
 * - organization_id: UUID foreign key
 */
export function createContactColumns(
  actions?: ContactActions
): ColumnDef<ContactWithComputedFields>[] {
  const columns: ColumnDef<ContactWithComputedFields>[] = []

  // Note: Selection and expansion columns are handled by the DataTable component
  // to avoid duplicate rendering.

  // Main columns
  columns.push(
    {
      id: 'contact',
      header: 'Contact',
      accessorFn: (row) => `${row.first_name} ${row.last_name}`, // Maps to 'first_name' and 'last_name' fields
      cell: ({ row }) => {
        const contact = row.original
        const fullName = `${contact.first_name} ${contact.last_name}`

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-foreground">
                {fullName || <EmptyCell />}
              </div>
              {contact.is_primary_contact && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Star className="size-3 fill-current text-warning" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Primary Contact</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {contact.high_value_contact && (
                <Badge
                  variant="secondary"
                  className="border-success bg-success/10 text-xs text-success-foreground"
                >
                  High Value
                </Badge>
              )}
              {contact.needs_follow_up && (
                <Badge
                  variant="secondary"
                  className="border-warning bg-warning/10 text-xs text-warning-foreground"
                >
                  Follow-up
                </Badge>
              )}
            </div>

            {contact.title && (
              <div className="text-sm text-muted-foreground">
                {contact.title}
                {contact.department && ` • ${contact.department}`}
              </div>
            )}

            {contact.organization && (
              <div className="text-xs text-muted-foreground">{contact.organization.name}</div>
            )}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'primary_contact',
      header: 'Contact Info',
      accessorFn: (row) => row.email || row.phone, // Maps to 'email' and 'phone' fields
      cell: ({ row }) => {
        const { email, phone, mobile_phone } = row.original
        return (
          <div className="space-y-1">
            {email && (
              <div className="flex items-center gap-1 text-sm">
                <Mail className="size-3 text-muted-foreground" />
                <a
                  href={`mailto:${email}`}
                  className="text-info hover:text-info-hover"
                  onClick={(e) => e.stopPropagation()}
                >
                  {email}
                </a>
              </div>
            )}
            {(phone || mobile_phone) && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="size-3 text-muted-foreground" />
                <span className="text-foreground">
                  {phone || mobile_phone}
                  {phone && mobile_phone && phone !== mobile_phone && (
                    <span className="ml-1 text-xs text-muted-foreground">(Mobile: {mobile_phone})</span>
                  )}
                </span>
              </div>
            )}
            {!email && !phone && !mobile_phone && <EmptyCell />}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'title', // Maps to 'title' field
      cell: ({ row }) => {
        const { title, department } = row.original
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">{title || <EmptyCell />}</div>
            {department && <div className="text-xs text-muted-foreground">{department}</div>}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'authority',
      header: 'Authority',
      accessorFn: (row) => `${row.purchase_influence} ${row.decision_authority}`, // Maps to 'purchase_influence' and 'decision_authority' fields
      cell: ({ row }) => {
        const { purchase_influence, decision_authority } = row.original
        return (
          <div className="space-y-2">
            <AuthorityBadges
              purchaseInfluence={purchase_influence}
              decisionAuthority={decision_authority}
            />
            {/* Authority indicators */}
            <div className="flex gap-1">
              {row.original.budget_authority && (
                <Badge
                  variant="outline"
                  className="border-success bg-success/10 text-xs text-success-foreground"
                >
                  Budget
                </Badge>
              )}
              {row.original.technical_authority && (
                <Badge
                  variant="outline"
                  className="border-info bg-info/10 text-xs text-info-foreground"
                >
                  Technical
                </Badge>
              )}
              {row.original.user_authority && (
                <Badge
                  variant="outline"
                  className="border-org-principal bg-org-principal/10 text-xs text-org-principal-foreground"
                >
                  User
                </Badge>
              )}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'activity',
      header: 'Recent Activity',
      accessorFn: (row) => row.last_interaction_date, // Maps to computed field
      cell: ({ row }) => {
        const { recent_interactions_count, last_interaction_date } = row.original
        return (
          <div className="space-y-1">
            {recent_interactions_count !== undefined && (
              <div className="text-sm font-medium text-foreground">
                {recent_interactions_count} interaction{recent_interactions_count !== 1 ? 's' : ''}
              </div>
            )}
            {last_interaction_date && (
              <div className="text-xs text-muted-foreground">
                {formatTimeAgo(new Date(last_interaction_date))}
              </div>
            )}
            {!recent_interactions_count && !last_interaction_date && <EmptyCell />}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <ContactActionsDropdown contact={row.original} actions={actions} />,
      enableSorting: false,
      enableHiding: false,
      size: 80,
    }
  )

  return columns
}

// Default export for convenience
export const contactColumns = createContactColumns()
