import React from 'react'
import { OpportunitiesTableRow } from './OpportunitiesTableRow'
import { OpportunityRowDetails } from './OpportunityRowDetails'
import type { OpportunityWithLastActivity, InteractionWithRelations } from '@/types/opportunity.types'

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
  
  // Interaction props for details
  interactions?: InteractionWithRelations[]
  interactionsLoading?: boolean
  onAddInteraction?: () => void
  onEditInteraction?: (interaction: InteractionWithRelations) => void
  onDeleteInteraction?: (interaction: InteractionWithRelations) => void
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
  interactionsLoading,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick
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
          interactionsLoading={interactionsLoading}
          onAddInteraction={onAddInteraction}
          onEditInteraction={onEditInteraction}
          onDeleteInteraction={onDeleteInteraction}
          onInteractionItemClick={onInteractionItemClick}
        />
      )}
    </>
  )
}