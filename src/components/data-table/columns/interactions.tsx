"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  Mail,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  Building,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import type { InteractionWithRelations } from "@/types/interaction.types"

// Extended interaction interface with additional context
interface InteractionWithContext extends InteractionWithRelations {
  interaction_priority?: 'A+' | 'A' | 'B' | 'C' | 'D'
  weekly_interaction_count?: number
  last_follow_up_date?: string | Date
  engagement_score?: number
}

// Interaction action handlers interface
interface InteractionActions {
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
  onContact?: (interaction: InteractionWithRelations) => void
}

// Interaction type colors mapping
const INTERACTION_COLORS = {
  call: 'bg-blue-50 text-blue-700 border-blue-200',
  email: 'bg-green-50 text-green-700 border-green-200',
  meeting: 'bg-purple-50 text-purple-700 border-purple-200',
  demo: 'bg-orange-50 text-orange-700 border-orange-200',
  proposal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  follow_up: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  trade_show: 'bg-pink-50 text-pink-700 border-pink-200',
  site_visit: 'bg-teal-50 text-teal-700 border-teal-200',
  contract_review: 'bg-red-50 text-red-700 border-red-200',
  in_person: 'bg-blue-100 text-blue-800 border-blue-300',
  quoted: 'bg-green-100 text-green-800 border-green-300',
  distribution: 'bg-gray-50 text-gray-700 border-gray-200',
} as const

// Get icon for interaction type
function getInteractionIcon(type: string) {
  const iconMap = {
    call: <Phone className="size-4" />,
    email: <Mail className="size-4" />,
    meeting: <Users className="size-4" />,
    demo: <Calendar className="size-4" />,
    proposal: <Calendar className="size-4" />,
    follow_up: <AlertCircle className="size-4" />,
    trade_show: <Users className="size-4" />,
    site_visit: <Building className="size-4" />,
    contract_review: <Calendar className="size-4" />,
    in_person: <Users className="size-4" />,
    quoted: <Calendar className="size-4" />,
    distribution: <Building className="size-4" />,
  }
  return iconMap[type as keyof typeof iconMap] || <Calendar className="size-4" />
}

// Actions column component
function InteractionActionsCell({
  interaction,
  onEdit,
  onDelete,
  onView,
  onContact
}: {
  interaction: InteractionWithContext
} & InteractionActions) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(interaction)}>
            <Eye className="mr-2 size-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(interaction)}>
            <Edit className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onContact && interaction.contact && (
          <DropdownMenuItem onClick={() => onContact(interaction)}>
            <User className="mr-2 size-4" />
            Contact Person
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(interaction)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Creates interaction table columns with proper typing and action handlers
 * Note: Selection and expansion columns are NOT included here - they are handled by DataTable component
 */
export function createInteractionColumns(actions: InteractionActions = {}): ColumnDef<InteractionWithContext>[] {
  return [
    // Type Column with Icon and Duration
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const interaction = row.original
        const icon = getInteractionIcon(interaction.type)
        const colorClass = INTERACTION_COLORS[interaction.type] || 'bg-gray-50 text-gray-700 border-gray-200'

        return (
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg border', colorClass)}>
              {icon}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium capitalize">
                {interaction.type.replace('_', ' ')}
              </div>
              {interaction.duration_minutes && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {interaction.duration_minutes}m
                </div>
              )}
            </div>
          </div>
        )
      },
      size: 150,
    },

    // Subject and Details Column
    {
      accessorKey: "subject",
      header: "Subject & Details",
      cell: ({ row }) => {
        const interaction = row.original

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {interaction.subject || 'No subject'}
            </div>
            {interaction.description && (
              <div className="line-clamp-2 max-w-[300px] text-xs text-muted-foreground">
                {interaction.description}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {interaction.follow_up_required && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="mr-1 size-3" />
                  Follow-up needed
                </Badge>
              )}
              {interaction.outcome && (
                <Badge variant="outline" className="text-xs capitalize">
                  {interaction.outcome.replace('_', ' ')}
                </Badge>
              )}
              {interaction.interaction_priority && (
                <Badge
                  variant={interaction.interaction_priority === 'A+' || interaction.interaction_priority === 'A' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {interaction.interaction_priority}
                </Badge>
              )}
            </div>
          </div>
        )
      },
      size: 300,
    },

    // Related Entities Column
    {
      accessorKey: "relationships",
      header: "Related To",
      cell: ({ row }) => {
        const interaction = row.original

        return (
          <div className="space-y-1 text-sm">
            {interaction.opportunity && (
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="max-w-[200px] truncate text-xs">
                  {interaction.opportunity.name}
                </Badge>
              </div>
            )}
            {interaction.organization && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building className="size-3 shrink-0" />
                <span className="max-w-[180px] truncate">{interaction.organization.name}</span>
              </div>
            )}
            {interaction.contact && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="size-3 shrink-0" />
                <span className="max-w-[180px] truncate">
                  {interaction.contact.first_name} {interaction.contact.last_name}
                </span>
              </div>
            )}
          </div>
        )
      },
      size: 250,
    },

    // Date and Follow-up Column
    {
      accessorKey: "interaction_date",
      header: "Date & Follow-up",
      cell: ({ row }) => {
        const interaction = row.original

        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground" />
              <span className="font-medium">
                {format(parseISO(interaction.interaction_date), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(parseISO(interaction.interaction_date), { addSuffix: true })}
            </div>
            {interaction.follow_up_date && (
              <div className="text-xs font-medium text-orange-600">
                Follow-up: {format(parseISO(interaction.follow_up_date), 'MMM d')}
              </div>
            )}
          </div>
        )
      },
      size: 150,
    },

    // Actions Column
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <InteractionActionsCell
          interaction={row.original}
          {...actions}
        />
      ),
      size: 100,
    },
  ]
}

// Re-export types for external use
export type { InteractionWithContext, InteractionActions }