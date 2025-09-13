import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InteractionTimelineEmbed } from '@/features/interactions/components/InteractionTimelineEmbed'
import { QuickInteractionBar } from '@/features/interactions/components/QuickInteractionBar'
import { MessageSquare, FileText, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import { useIsMobile, useIsIPad } from '@/hooks/useMediaQuery'
import { useQueryClient } from '@tanstack/react-query'
import { interactionKeys } from '@/features/interactions/hooks/useInteractions'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunityExpandedContentProps {
  opportunity: OpportunityWithLastActivity
  isExpanded: boolean
}

export function OpportunityExpandedContent({
  opportunity,
  isExpanded,
}: OpportunityExpandedContentProps) {
  const [activeTab, setActiveTab] = useState<'interactions' | 'details'>('interactions')
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const isMobile = useIsMobile()
  const isIPad = useIsIPad()
  const queryClient = useQueryClient()

  const handleQuickAddSuccess = () => {
    setShowQuickAdd(false)
    queryClient.invalidateQueries({
      queryKey: interactionKeys.byOpportunity(opportunity.id),
    })
  }

  const handleQuickAddCancel = () => {
    setShowQuickAdd(false)
  }

  const toggleQuickAdd = () => {
    setShowQuickAdd(!showQuickAdd)
  }

  return (
    <div
      className={cn(
        'bg-gray-50/50 border-l-4 border-primary/20',
        isMobile ? semanticSpacing.leftGap.lg : semanticSpacing.leftGap.xl
      )}
    >
      {/* Tab Header */}
      <div
        className={cn(
          'flex items-center justify-between border-b bg-white',
          isMobile
            ? `${semanticSpacing.cardContainer} ${semanticSpacing.verticalContainer} flex-col ${semanticSpacing.gap.md}`
            : `${semanticSpacing.layoutContainer} ${semanticSpacing.compactY} flex-row`
        )}
      >
        <div
          className={cn(`flex ${semanticSpacing.gap.xs}`, isMobile ? 'w-full justify-center' : '')}
        >
          <Button
            variant={activeTab === 'interactions' ? 'default' : 'ghost'}
            size={isMobile ? 'default' : 'sm'}
            onClick={() => setActiveTab('interactions')}
            className={cn(isMobile ? 'flex-1 h-12 touch-manipulation' : '')}
          >
            <MessageSquare
              className={cn(
                isMobile
                  ? `h-4 w-4 ${semanticSpacing.rightGap.sm}`
                  : `h-3 w-3 ${semanticSpacing.rightGap.xs}`
              )}
            />
            {isMobile
              ? `Activity (${opportunity.interaction_count || 0})`
              : `Activity (${opportunity.interaction_count || 0})`}
          </Button>
          <Button
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            size={isMobile ? 'default' : 'sm'}
            onClick={() => setActiveTab('details')}
            className={cn(isMobile ? 'flex-1 h-12 touch-manipulation' : '')}
          >
            <FileText
              className={cn(
                isMobile
                  ? `h-4 w-4 ${semanticSpacing.rightGap.sm}`
                  : `h-3 w-3 ${semanticSpacing.rightGap.xs}`
              )}
            />
            Details
          </Button>
        </div>

        {activeTab === 'interactions' && (
          <Button
            size={isMobile ? 'default' : 'sm'}
            variant={showQuickAdd ? 'default' : 'outline'}
            onClick={toggleQuickAdd}
            className={cn(isMobile ? 'w-full h-12 touch-manipulation' : '')}
          >
            <Plus
              className={cn(
                isMobile
                  ? `h-4 w-4 ${semanticSpacing.rightGap.sm}`
                  : `h-3 w-3 ${semanticSpacing.rightGap.xs}`
              )}
            />
            Quick Add
          </Button>
        )}
      </div>

      {/* Quick Add Bar */}
      {showQuickAdd && activeTab === 'interactions' && (
        <QuickInteractionBar
          opportunityId={opportunity.id}
          contactId={opportunity.contact_id}
          organizationId={opportunity.organization_id}
          onSuccess={handleQuickAddSuccess}
          onCancel={handleQuickAddCancel}
        />
      )}

      {/* Tab Content */}
      <div
        className={cn(isMobile ? semanticSpacing.cardContainer : semanticSpacing.layoutContainer)}
      >
        {activeTab === 'interactions' ? (
          <InteractionTimelineEmbed
            opportunityId={opportunity.id}
            maxHeight={isMobile ? '300px' : isIPad ? '450px' : '400px'}
            showEmptyState={true}
            variant="compact"
            onAddNew={toggleQuickAdd}
            enabled={isExpanded}
          />
        ) : (
          <OpportunityDetails opportunity={opportunity} />
        )}
      </div>
    </div>
  )
}

function OpportunityDetails({ opportunity }: { opportunity: OpportunityWithLastActivity }) {
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        semanticSpacing.gap.xl,
        isMobile
          ? `grid grid-cols-1 ${semanticSpacing.stack.lg}`
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}
    >
      <div>
        <h4
          className={cn(
            `${semanticSpacing.bottomGap.sm} font-medium text-gray-900`,
            isMobile ? semanticTypography.h4 : semanticTypography.label
          )}
        >
          Opportunity Details
        </h4>
        <div
          className={cn(
            `${semanticSpacing.stack.xs} text-gray-600`,
            isMobile ? semanticTypography.cardTitle : semanticTypography.body
          )}
        >
          {opportunity.stage && <div>Stage: {opportunity.stage}</div>}
          {opportunity.name && <div>Name: {opportunity.name}</div>}
          {opportunity.created_at && (
            <div>Created: {new Date(opportunity.created_at).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      <div>
        <h4
          className={cn(
            `${semanticSpacing.bottomGap.sm} font-medium text-gray-900`,
            isMobile ? semanticTypography.h4 : semanticTypography.label
          )}
        >
          Financial
        </h4>
        <div
          className={cn(
            `${semanticSpacing.stack.xs} text-gray-600`,
            isMobile ? semanticTypography.cardTitle : semanticTypography.body
          )}
        >
          {opportunity.estimated_value && (
            <div>Estimated Value: ${opportunity.estimated_value}</div>
          )}
          {opportunity.probability && <div>Probability: {opportunity.probability}%</div>}
        </div>
      </div>

      <div>
        <h4
          className={cn(
            `${semanticSpacing.bottomGap.sm} font-medium text-gray-900`,
            isMobile ? semanticTypography.h4 : semanticTypography.label
          )}
        >
          Notes
        </h4>
        <div
          className={cn(
            `${semanticSpacing.stack.xs} text-gray-600`,
            isMobile ? semanticTypography.cardTitle : semanticTypography.body
          )}
        >
          {opportunity.notes ? (
            <p>{opportunity.notes}</p>
          ) : (
            <span className="italic text-gray-400">No notes available</span>
          )}
        </div>
      </div>
    </div>
  )
}
