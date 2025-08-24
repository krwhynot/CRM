import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { InteractionActionsDropdown } from './InteractionActionsDropdown'
import { useInteractionFormatting } from '@/hooks/useInteractionFormatting'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionTableRowProps {
  interaction: InteractionWithRelations
  showOrganization: boolean
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
}

export const InteractionTableRow: React.FC<InteractionTableRowProps> = ({
  interaction,
  showOrganization,
  onEdit,
  onDelete,
  onView
}) => {
  const { getTypeColor, formatType, formatDate, formatDuration, isFollowUpOverdue } = useInteractionFormatting()

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold flex items-center">
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
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-sm">
            {formatDate(interaction.interaction_date)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
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
              <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
            ) : (
              <Calendar className="h-4 w-4 mr-1 text-yellow-500" />
            )}
            <span className={`text-sm ${isFollowUpOverdue(interaction.follow_up_date) ? 'text-red-600 font-medium' : ''}`}>
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