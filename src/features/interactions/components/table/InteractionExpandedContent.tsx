import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import type { InteractionWithRelations } from '@/types/interaction.types'

interface InteractionExpandedContentProps {
  interaction: InteractionWithRelations
}

export function InteractionExpandedContent({ interaction }: InteractionExpandedContentProps) {
  return (
    <div className={cn('border-l-4 border-primary/20 bg-muted/30', semanticSpacing.cardContainer)}>
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', semanticSpacing.gap.xl)}>
        {/* Full Description */}
        <div className="md:col-span-2 lg:col-span-2">
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} font-medium text-foreground`,
              semanticTypography.label
            )}
          >
            Full Details
          </h4>
          <div className={semanticSpacing.stack.sm}>
            {interaction.subject && (
              <div>
                <span className={cn('font-medium', semanticTypography.body)}>Subject:</span>
                <span className={cn('text-muted-foreground', semanticTypography.body)}>
                  {interaction.subject}
                </span>
              </div>
            )}
            {interaction.description && (
              <div>
                <span className={cn('font-medium', semanticTypography.body)}>Description:</span>
                <p
                  className={cn(
                    `${semanticSpacing.topGap.xs} whitespace-pre-wrap text-muted-foreground`,
                    semanticTypography.body
                  )}
                >
                  {interaction.description}
                </p>
              </div>
            )}
            {interaction.notes && (
              <div>
                <span className={cn('font-medium', semanticTypography.body)}>Notes:</span>
                <p
                  className={cn(
                    `${semanticSpacing.topGap.xs} whitespace-pre-wrap text-muted-foreground`,
                    semanticTypography.body
                  )}
                >
                  {interaction.notes}
                </p>
              </div>
            )}
            {interaction.outcome && (
              <div>
                <span className={cn('font-medium', semanticTypography.body)}>Outcome:</span>
                <Badge variant="outline" className="capitalize">
                  {interaction.outcome.replace('_', ' ')}
                </Badge>
              </div>
            )}
            {interaction.location && (
              <div>
                <span className={cn('font-medium', semanticTypography.body)}>Location:</span>
                <span className={cn('text-muted-foreground', semanticTypography.body)}>
                  {interaction.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Information */}
        <div>
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} font-medium text-foreground`,
              semanticTypography.label
            )}
          >
            Follow-up
          </h4>
          <div className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
            {interaction.follow_up_required ? (
              <>
                <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                  <AlertCircle className="size-4 text-destructive" />
                  <span className={cn(semanticTypography.label, 'text-destructive')}>
                    Follow-up Required
                  </span>
                </div>
                {interaction.follow_up_date && (
                  <div>
                    <span className={`${semanticTypography.label}`}>Due: </span>
                    <span>{format(parseISO(interaction.follow_up_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {interaction.follow_up_notes && (
                  <div
                    className={cn(
                      `${semanticSpacing.topGap.xs} bg-muted text-muted-foreground`,
                      semanticSpacing.compact,
                      semanticRadius.md
                    )}
                  >
                    {interaction.follow_up_notes}
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">No follow-up needed</div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="lg:col-span-1">
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} font-medium text-foreground`,
              semanticTypography.label
            )}
          >
            Information
          </h4>
          <div
            className={cn(
              `${semanticSpacing.stack.xs} text-muted-foreground`,
              semanticTypography.body
            )}
          >
            {interaction.duration_minutes && (
              <div>
                <span className={`${semanticTypography.label}`}>Duration: </span>
                {interaction.duration_minutes} minutes
              </div>
            )}
            <div>
              <span className={`${semanticTypography.label}`}>Created: </span>
              {format(parseISO(interaction.created_at), 'MMM d, yyyy h:mm a')}
            </div>
            {interaction.updated_at && interaction.updated_at !== interaction.created_at && (
              <div>
                <span className={`${semanticTypography.label}`}>Updated: </span>
                {format(parseISO(interaction.updated_at), 'MMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
