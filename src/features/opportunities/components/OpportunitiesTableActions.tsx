import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableActionsProps {
  opportunity: OpportunityWithLastActivity
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
}

export const OpportunitiesTableActions: React.FC<OpportunitiesTableActionsProps> = ({
  opportunity,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-6 rounded p-0 hover:bg-gray-100">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(opportunity)}>
            <ExternalLink className="mr-2 size-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(opportunity)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={() => onDelete(opportunity)} className="text-destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
