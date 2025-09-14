import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { InteractionTimeline } from '@/features/interactions/components/InteractionTimeline' /* ui-audit: allow */
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'
import { cn } from '@/lib/utils'
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
      <CardHeader
        className={`flex flex-row items-center justify-between space-y-0 ${semanticSpacing.bottomPadding.lg}`}
      >
        <div>
          <CardTitle className={cn(semanticTypography.h4, 'font-nunito')}>
            {opportunity.name}
          </CardTitle>
          <p
            className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            {opportunity.organization?.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className={`size-8 ${semanticSpacing.zero}`}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className={semanticSpacing.layoutContainer}>
        {/* Opportunity Info Grid */}
        <div className={`grid ${semanticSpacing.gap.lg} md:grid-cols-2 lg:grid-cols-4`}>
          <div>
            <label
              className={cn(semanticTypography.label, semanticTypography.body, 'text-muted-foreground')}
            >
              Stage
            </label>
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-foreground`}>
              {opportunity.stage}
            </p>
          </div>
          <div>
            <label
              className={cn(semanticTypography.label, semanticTypography.body, 'text-muted-foreground')}
            >
              Value
            </label>
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-foreground`}>
              {opportunity.estimated_value
                ? `$${opportunity.estimated_value.toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <label
              className={cn(semanticTypography.body, semanticTypography.label, 'text-muted-foreground')}
            >
              Probability
            </label>
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-foreground`}>
              {opportunity.probability ? `${opportunity.probability}%` : 'N/A'}
            </p>
          </div>
          <div>
            <label
              className={cn(semanticTypography.body, semanticTypography.label, 'text-muted-foreground')}
            >
              Close Date
            </label>
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-foreground`}>
              {opportunity.estimated_close_date
                ? new Date(opportunity.estimated_close_date).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        {opportunity.contact && (
          <div className={`border-t ${semanticSpacing.topPadding.xs}`}>
            <label
              className={cn(semanticTypography.label, semanticTypography.body, 'text-muted-foreground')}
            >
              Primary Contact
            </label>
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-foreground`}>
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
