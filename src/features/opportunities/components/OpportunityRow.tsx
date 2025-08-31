import React from 'react'
import { OpportunitiesTableRow } from './OpportunitiesTableRow'
import { OpportunityRowDetails } from './OpportunityRowDetails'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import type { InteractionWithRelations } from '@/types/entities' /* ui-audit: allow */

interface OpportunityRowProps {
  opportunity: OpportunityWithLastActivity
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  getStageConfig: (stage: string) => { dot: string; position: number }
  formatCurrency: (value: number | null) => string
  formatActivityType: (type: string | null) => string

  // Expansion props
  isExpanded: boolean
  onToggleExpansion: () => void

  // Activity props for details
  interactions?: InteractionWithRelations[] /* ui-audit: allow */
  activitiesLoading?: boolean
  onAddInteraction?: () => void /* ui-audit: allow */
  onEditInteraction?: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
  onDeleteInteraction?: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
  onInteractionItemClick?: (interaction: InteractionWithRelations) => void
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({
  opportunity,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  getStageConfig,
  formatCurrency,
  formatActivityType,
  isExpanded,
  onToggleExpansion,
  interactions,
  activitiesLoading,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick,
}) => {
  return (
    <>
      <OpportunitiesTableRow
        opportunity={opportunity}
        isSelected={isSelected}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onToggleExpansion} // Change onView to toggle expansion instead
        getStageConfig={getStageConfig}
        formatCurrency={formatCurrency}
        formatActivityType={formatActivityType}
        isExpanded={isExpanded}
      />

      {isExpanded && (
        <OpportunityRowDetails
          opportunity={opportunity}
          interactions={interactions}
          activitiesLoading={activitiesLoading}
          onAddInteraction={onAddInteraction}
          onEditInteraction={onEditInteraction}
          onDeleteInteraction={onDeleteInteraction}
          onInteractionItemClick={onInteractionItemClick}
        />
      )}
    </>
  )
}
