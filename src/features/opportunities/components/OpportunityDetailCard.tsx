import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { InteractionTimeline } from '@/features/interactions/components/InteractionTimeline' /* ui-audit: allow */
import type {
  OpportunityWithRelations,
  InteractionWithRelations,
} from '@/types/entities' /* ui-audit: allow */

interface OpportunityDetailCardProps {
  opportunity: OpportunityWithRelations
  interactions: InteractionWithRelations[] /* ui-audit: allow */
  activitiesLoading: boolean
  onClose: () => void
  onAddInteraction: () => void /* ui-audit: allow */
  onEditInteraction: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
  onDeleteInteraction: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
  onInteractionItemClick: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
}

export const OpportunityDetailCard = ({
  opportunity,
  interactions,
  activitiesLoading,
  onClose,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick,
}: OpportunityDetailCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="font-nunito text-lg">{opportunity.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{opportunity.organization?.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0">
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Opportunity Info Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Stage</label>
            <p className="mt-1 text-sm text-gray-900">{opportunity.stage}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Value</label>
            <p className="mt-1 text-sm text-gray-900">
              {opportunity.estimated_value
                ? `$${opportunity.estimated_value.toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Probability</label>
            <p className="mt-1 text-sm text-gray-900">
              {opportunity.probability ? `${opportunity.probability}%` : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Close Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {opportunity.estimated_close_date
                ? new Date(opportunity.estimated_close_date).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        {opportunity.contact && (
          <div className="border-t pt-2">
            <label className="text-sm font-medium text-gray-700">Primary Contact</label>
            <p className="mt-1 text-sm text-gray-900">
              {opportunity.contact.first_name} {opportunity.contact.last_name}
              {opportunity.contact.title && (
                <span className="text-muted-foreground"> • {opportunity.contact.title}</span>
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
          loading={activitiesLoading}
        />
      </CardContent>
    </Card>
  )
}
