import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionActionsDropdownProps {
  interaction: InteractionWithRelations
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
}

export const InteractionActionsDropdown: React.FC<InteractionActionsDropdownProps> = ({
  interaction,
  onEdit,
  onDelete,
  onView
}) => {
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
            <ExternalLink className="mr-2 size-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(interaction)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(interaction)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}