import React from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrganizationsPageHeaderProps {
  organizationsCount: number
  onAddClick: () => void
  useNewStyle: boolean
}

export const OrganizationsPageHeader: React.FC<OrganizationsPageHeaderProps> = ({
  organizationsCount,
  onAddClick,
  useNewStyle
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
        className={cn(
          "btn-primary ml-6",
          useNewStyle && "shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        )}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Organization
      </Button>
    </div>
  )
}