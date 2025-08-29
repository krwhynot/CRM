import React from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Plus } from 'lucide-react'

interface OrganizationsPageHeaderProps {
  organizationsCount: number
  onAddClick: () => void
}

export const OrganizationsPageHeader: React.FC<OrganizationsPageHeaderProps> = ({
  organizationsCount,
  onAddClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <PageHeader 
        title="Manage Organizations"
        subtitle="Principals, Retailers & Partners"
        count={organizationsCount}
      />
      <Button 
        onClick={onAddClick}
        className="ml-6"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Organization
      </Button>
    </div>
  )
}