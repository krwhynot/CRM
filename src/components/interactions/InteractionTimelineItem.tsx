import React, { forwardRef, useCallback, memo } from 'react'
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
import { format, formatDistanceToNow } from 'date-fns'
import type { InteractionWithRelations } from '@/types/entities'

// Interface following error prevention rules
export interface InteractionTimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  interaction: InteractionWithRelations
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onItemClick: () => void
  getInteractionIcon: (type: string) => React.ReactNode
  getInteractionTypeColor: (type: string) => string
  className?: string
  [key: string]: any // Migration safety
}

const InteractionTimelineItemComponent = forwardRef<HTMLDivElement, InteractionTimelineItemProps>(
  ({ 
    interaction, 
    isExpanded, 
    onToggleExpand, 
    onEdit, 
    onDelete, 
    onItemClick: _onItemClick,
    getInteractionIcon,
    getInteractionTypeColor,
    className,
    ...props 
  }, ref) => {
    
    // Handle delete with confirmation
    const handleDelete = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
      if (window.confirm(`Are you sure you want to delete this ${interaction.type}?`)) {
        onDelete()
      }
    }, [interaction.type, onDelete])

    // Handle edit action
    const handleEdit = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit()
    }, [onEdit])

    // Handle mark complete (for follow-ups)
    const handleMarkComplete = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
      // TODO: Implement mark complete functionality
      console.log('Mark complete not yet implemented')
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggleExpand()
      }
    }, [onToggleExpand])

    // Handle item click to expand/collapse
    const handleItemClick = useCallback((e: React.MouseEvent) => {
      // Don't toggle if clicking on buttons or dropdown
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('[role="menuitem"]')) {
        return
      }
      onToggleExpand()
    }, [onToggleExpand])

    // Format the interaction date
    const interactionDate = new Date(interaction.interaction_date)
    const formattedDate = format(interactionDate, 'MMM d, yyyy')
    const relativeTime = formatDistanceToNow(interactionDate, { addSuffix: true })

    return (
      <div 
        ref={ref}
        className={cn(
          'relative flex gap-4 cursor-pointer group transition-colors duration-200',
          'md:hover:bg-gray-50 rounded-lg p-3 -m-3',
          'min-h-[44px] touch-manipulation',
          className
        )}
        onClick={handleItemClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${interaction.type} interaction: ${interaction.subject}`}
        {...props}
      >
        {/* Timeline dot */}
        <div className="relative z-10 flex-shrink-0">
          <div 
            className={cn(
              'w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center',
              'shadow-sm group-hover:shadow-md transition-shadow',
              getInteractionTypeColor(interaction.type).includes('blue') && 'border-blue-200',
              getInteractionTypeColor(interaction.type).includes('green') && 'border-green-200',
              getInteractionTypeColor(interaction.type).includes('purple') && 'border-purple-200',
              getInteractionTypeColor(interaction.type).includes('orange') && 'border-orange-200',
              getInteractionTypeColor(interaction.type).includes('red') && 'border-red-200',
              getInteractionTypeColor(interaction.type).includes('yellow') && 'border-yellow-200',
              getInteractionTypeColor(interaction.type).includes('pink') && 'border-pink-200',
              getInteractionTypeColor(interaction.type).includes('indigo') && 'border-indigo-200',
              !getInteractionTypeColor(interaction.type).match(/(blue|green|purple|orange|red|yellow|pink|indigo)/) && 'border-gray-200'
            )}
          >
            {getInteractionIcon(interaction.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
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
                  {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1).replace('_', ' ')}
                </Badge>
                {interaction.follow_up_required && (
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    Follow-up
                  </Badge>
                )}
              </div>
              
              {/* Date/time info */}
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

            {/* Actions */}
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

          {/* Expandable content */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {/* Notes/Description */}
              {interaction.description && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Notes: </span>
                  <div className="text-gray-600 mt-1 whitespace-pre-wrap">
                    {interaction.description}
                  </div>
                </div>
              )}

              {/* Follow-up information */}
              {interaction.follow_up_required && interaction.follow_up_date && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Follow-up: </span>
                  <span className="text-gray-600">
                    {format(new Date(interaction.follow_up_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {/* Opportunity link */}
              {interaction.opportunity && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Opportunity: </span>
                  <span className="text-gray-600">{interaction.opportunity.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Collapsed preview */}
          {!isExpanded && interaction.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {interaction.description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

InteractionTimelineItemComponent.displayName = 'InteractionTimelineItem'

// Memoize the component for performance optimization
export const InteractionTimelineItem = memo(InteractionTimelineItemComponent)