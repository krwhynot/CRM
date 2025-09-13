import React from 'react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { semanticSpacing, semanticRadius } from '@/styles/tokens'
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
        <Button
          variant="ghost"
          className={cn(semanticRadius.small, 'size-6', semanticSpacing.zero, 'hover:bg-gray-100')}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(opportunity)}>
            <ExternalLink className={`${semanticSpacing.rightGap.xs} size-4`} />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(opportunity)}>
            <Pencil className={`${semanticSpacing.rightGap.xs} size-4`} />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={() => onDelete(opportunity)} className="text-destructive">
            <Trash2 className={`${semanticSpacing.rightGap.xs} size-4`} />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
