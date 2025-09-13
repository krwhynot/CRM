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
  CheckCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { InteractionWithRelations } from '@/types/entities'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

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
  handleMarkComplete,
}) => {
  return (
    <div className={`flex items-start justify-between ${semanticSpacing.gap.xs}`}>
      <div className="min-w-0 flex-1">
        <div
          className={`${semanticSpacing.bottomGap.xxs} flex items-center ${semanticSpacing.gap.xs}`}
        >
          <h3
            className={cn(
              semanticTypography.label,
              'truncate',
              semanticTypography.body,
              'text-gray-900 md:text-base'
            )}
          >
            {interaction.subject}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              `${semanticTypography.caption} flex-shrink-0`,
              getInteractionTypeColor(interaction.type)
            )}
          >
            {formattedType}
          </Badge>
          {interaction.follow_up_required && (
            <Badge
              variant="outline"
              className={`border-yellow-200 bg-yellow-50 ${semanticTypography.caption} text-yellow-700`}
            >
              Follow-up
            </Badge>
          )}
        </div>

        <div
          className={`flex items-center ${semanticSpacing.gap.xs} ${semanticTypography.caption} text-gray-500`}
        >
          <span className="md:hidden">{relativeTime}</span>
          <span className="hidden md:inline">{formattedDate}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{relativeTime}</span>
          {interaction.contact && (
            <>
              <span>•</span>
              <span>
                {interaction.contact.first_name} {interaction.contact.last_name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={`flex shrink-0 items-center ${semanticSpacing.gap.xxs}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          className={`size-6 ${semanticSpacing.zero} text-gray-400 hover:text-gray-600`}
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`size-6 ${semanticSpacing.zero} text-gray-400 hover:text-gray-600`}
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className={`${semanticSpacing.rightGap.xs} size-4`} />
              Edit
            </DropdownMenuItem>
            {interaction.follow_up_required && (
              <DropdownMenuItem onClick={handleMarkComplete}>
                <CheckCircle className={`${semanticSpacing.rightGap.xs} size-4`} />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className={`${semanticSpacing.rightGap.xs} size-4`} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
