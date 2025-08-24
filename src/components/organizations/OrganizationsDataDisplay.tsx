import React from 'react'
import { Button } from '@/components/ui/button'
import { OrganizationsTable } from '@/components/organizations/OrganizationsTable'
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
  onRefresh
}) => {
  if (isError) {
    return (
      <div className="text-center py-8 space-y-4 bg-white rounded-lg border shadow-sm p-12">
        <div className="text-red-600 font-medium">Failed to load organizations</div>
        <div className="text-gray-500 text-sm">
          {error?.message || 'An unexpected error occurred while fetching organizations.'}
        </div>
        <Button 
          onClick={onRefresh} 
          variant="outline"
          className="mt-2"
        >
          Refresh Data
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 space-y-2 bg-white rounded-lg border shadow-sm p-12">
        <div className="font-nunito text-mfb-green">Loading organizations...</div>
        <div className="text-sm text-mfb-olive/60 font-nunito">
          This should only take a few seconds
        </div>
      </div>
    )
  }

  return (
    <OrganizationsTable 
      organizations={organizations}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}