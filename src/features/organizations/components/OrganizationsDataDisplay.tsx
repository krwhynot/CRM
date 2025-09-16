import React from 'react'
import { OrganizationsList } from './OrganizationsList'
import { LoadingState, ErrorState } from '@/components/ui/data-state'
import type { Organization } from '@/types/entities'

interface OrganizationsDataDisplayProps {
  isLoading: boolean
  isError: boolean
  error: Error | null
  organizations: Organization[]
  onEdit: (organization: Organization) => void
  onDelete: (organization: Organization) => void
  onRefresh: () => void
}

export const OrganizationsDataDisplay: React.FC<OrganizationsDataDisplayProps> = ({
  isLoading,
  isError,
  error,
  organizations,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <LoadingState
        message="Loading organizations..."
        subtext="Fetching organization data from the database"
        variant="table"
      />
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load organizations"
        message={error?.message || 'An unexpected error occurred while fetching organizations.'}
        onRetry={onRefresh}
        retryLabel="Refresh Organizations"
        variant="destructive"
      />
    )
  }

  return <OrganizationsList organizations={organizations} onEdit={onEdit} onDelete={onDelete} />
}
