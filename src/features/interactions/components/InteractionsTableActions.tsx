import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, Edit, Trash, Eye, Copy, 
  CheckCircle, Clock, AlertCircle 
} from 'lucide-react'
import type { InteractionWithRelations } from '@/types/interaction.types'

interface InteractionsTableActionsProps {
  interaction: InteractionWithRelations
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
}

export function InteractionsTableActions({
  interaction,
  onEdit,
  onDelete,
  onView,
}: InteractionsTableActionsProps) {
  const handleCopyDetails = () => {
    const details = [
      `Type: ${interaction.type.replace('_', ' ')}`,
      `Date: ${interaction.interaction_date}`,
      interaction.subject && `Subject: ${interaction.subject}`,
      interaction.description && `Description: ${interaction.description}`,
      interaction.contact && `Contact: ${interaction.contact.first_name} ${interaction.contact.last_name}`,
      interaction.organization && `Organization: ${interaction.organization.name}`,
      interaction.opportunity && `Opportunity: ${interaction.opportunity.name}`,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(details)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
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
        <DropdownMenuItem onClick={handleCopyDetails}>
          <Copy className="mr-2 size-4" />
          Copy Details
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {!interaction.follow_up_required && (
          <DropdownMenuItem>
            <AlertCircle className="mr-2 size-4" />
            Add Follow-up
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem>
          <CheckCircle className="mr-2 size-4" />
          Mark Complete
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Clock className="mr-2 size-4" />
          Snooze
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(interaction)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}