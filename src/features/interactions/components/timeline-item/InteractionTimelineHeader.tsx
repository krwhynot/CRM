import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionTimelineHeaderProps {
  interaction: InteractionWithRelations
  isExpanded: boolean
  formattedDate: string
  relativeTime: string
  formattedType: string
  getInteractionTypeColor: (type: string) => string
  onToggleExpand: () => void
  handleEdit: (e: React.MouseEvent) => void
  handleDelete: (e: React.MouseEvent) => void
  handleMarkComplete: (e: React.MouseEvent) => void
}

export const InteractionTimelineHeader: React.FC<InteractionTimelineHeaderProps> = ({
  interaction,
  isExpanded,
  formattedDate,
  relativeTime,
  formattedType,
  getInteractionTypeColor,
  onToggleExpand,
  handleEdit,
  handleDelete,
  handleMarkComplete
}) => {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm md:text-base text-gray-900 truncate">
            {interaction.subject}
          </h3>
          <Badge 
            variant="outline" 
            className={cn('text-xs flex-shrink-0', getInteractionTypeColor(interaction.type))}
          >
            {formattedType}
          </Badge>
          {interaction.follow_up_required && (
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              Follow-up
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="md:hidden">{relativeTime}</span>
          <span className="hidden md:inline">{formattedDate}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{relativeTime}</span>
          {interaction.contact && (
            <>
              <span>•</span>
              <span>{interaction.contact.first_name} {interaction.contact.last_name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {interaction.follow_up_required && (
              <DropdownMenuItem onClick={handleMarkComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}