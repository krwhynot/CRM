import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { InteractionTimeline } from '@/features/interactions/components/InteractionTimeline'
import type { Opportunity, InteractionWithRelations } from '@/types/entities'

interface OpportunityDetailCardProps {
  opportunity: Opportunity
  interactions: InteractionWithRelations[]
  interactionsLoading: boolean
  onClose: () => void
  onAddInteraction: () => void
  onEditInteraction: (interaction: InteractionWithRelations) => void
  onDeleteInteraction: (interaction: InteractionWithRelations) => void
  onInteractionItemClick: (interaction: InteractionWithRelations) => void
}

export const OpportunityDetailCard: React.FC<OpportunityDetailCardProps> = ({
  opportunity,
  interactions,
  interactionsLoading,
  onClose,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-nunito">{opportunity.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {opportunity.organization?.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Opportunity Info Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Stage</label>
            <p className="text-sm text-gray-900 mt-1">{opportunity.stage}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Value</label>
            <p className="text-sm text-gray-900 mt-1">
              {opportunity.estimated_value 
                ? `$${opportunity.estimated_value.toLocaleString()}` 
                : 'N/A'
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Probability</label>
            <p className="text-sm text-gray-900 mt-1">
              {opportunity.probability ? `${opportunity.probability}%` : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Close Date</label>
            <p className="text-sm text-gray-900 mt-1">
              {opportunity.estimated_close_date 
                ? new Date(opportunity.estimated_close_date).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Contact Information */}
        {opportunity.contact && (
          <div className="pt-2 border-t">
            <label className="text-sm font-medium text-gray-700">Primary Contact</label>
            <p className="text-sm text-gray-900 mt-1">
              {opportunity.contact.first_name} {opportunity.contact.last_name}
              {opportunity.contact.title && (
                <span className="text-gray-500"> • {opportunity.contact.title}</span>
              )}
            </p>
          </div>
        )}

        {/* Timeline Integration */}
        <InteractionTimeline
          interactions={interactions}
          onAddNew={onAddInteraction}
          onItemClick={onInteractionItemClick}
          onEditInteraction={onEditInteraction}
          onDeleteInteraction={onDeleteInteraction}
          opportunityId={opportunity.id}
          loading={interactionsLoading}
        />
      </CardContent>
    </Card>
  )
}