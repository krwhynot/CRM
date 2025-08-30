import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { InteractionActionsDropdown } from './InteractionActionsDropdown'
import { useInteractionFormatting } from '../../hooks/useInteractionFormatting'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionTableRowProps {
  interaction: InteractionWithRelations
  showOrganization: boolean
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
  isSelected?: boolean
  onToggleSelection?: () => void
  showSelection?: boolean
}

export const InteractionTableRow: React.FC<InteractionTableRowProps> = ({
  interaction,
  showOrganization,
  onEdit,
  onDelete,
  onView,
  isSelected = false,
  onToggleSelection,
  showSelection = false
}) => {
  const { getTypeColor, formatType, formatDate, formatDuration, isFollowUpOverdue } = useInteractionFormatting()

  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      {showSelection && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            aria-label={`Select interaction ${interaction.subject}`}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        <div>
          <div className="flex items-center font-semibold">
            <span>{interaction.subject}</span>
          </div>
          {interaction.contact && (
            <div className="text-sm text-gray-500">
              Contact: {interaction.contact.first_name} {interaction.contact.last_name}
            </div>
          )}
          {interaction.opportunity && (
            <div className="text-sm text-gray-500">
              Opportunity: {interaction.opportunity.name}
            </div>
          )}
        </div>
      </TableCell>
      {showOrganization && (
        <TableCell>
          {interaction.organization?.name || 'N/A'}
        </TableCell>
      )}
      <TableCell>
        <Badge className={getTypeColor(interaction.type)}>
          {formatType(interaction.type)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="mr-1 size-4 text-gray-400" />
          <span className="text-sm">
            {formatDate(interaction.interaction_date)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Clock className="mr-1 size-4 text-gray-400" />
          <span className="text-sm">
            {formatDuration(interaction.duration_minutes)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className="bg-green-100 text-green-800">
          Completed
        </Badge>
      </TableCell>
      <TableCell>
        {interaction.follow_up_required ? (
          <div className="flex items-center">
            {isFollowUpOverdue(interaction.follow_up_date) ? (
              <AlertCircle className="mr-1 size-4 text-red-500" />
            ) : (
              <Calendar className="mr-1 size-4 text-yellow-500" />
            )}
            <span className={`text-sm ${isFollowUpOverdue(interaction.follow_up_date) ? 'font-medium text-red-600' : ''}`}>
              {interaction.follow_up_date ? formatDate(interaction.follow_up_date) : 'Pending'}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">None</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <InteractionActionsDropdown
          interaction={interaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      </TableCell>
    </TableRow>
  )
}