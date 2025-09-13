import React from 'react'
import { InteractionsTable } from './InteractionsTable'
import { LoadingState, ErrorState } from '@/components/ui/data-state'
import type { InteractionWithRelations, InteractionFilters } from '@/types/interaction.types'

interface InteractionsDataDisplayProps {
  isLoading: boolean
  isError: boolean
  error: Error | null
  interactions: InteractionWithRelations[]
  filters?: InteractionFilters
  onEdit: (interaction: InteractionWithRelations) => void
  onDelete: (interaction: InteractionWithRelations) => void
  onView: (interaction: InteractionWithRelations) => void
  onRefresh: () => void
}

export const InteractionsDataDisplay: React.FC<InteractionsDataDisplayProps> = ({
  isLoading,
  isError,
  error,
  interactions,
  filters,
  onEdit,
  onDelete,
  onView,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <LoadingState
        message="Loading interactions..."
        subtext="Fetching interaction history and timeline data"
        variant="table"
      />
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load interactions"
        message={error?.message || 'An unexpected error occurred while fetching interactions.'}
        onRetry={onRefresh}
        retryLabel="Refresh Interactions"
        variant="destructive"
      />
    )
  }

  return (
    <InteractionsTable
      interactions={interactions}
      filters={filters}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
    />
  )
}
