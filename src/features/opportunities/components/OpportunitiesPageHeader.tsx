import React from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Plus, Users, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface OpportunitiesPageHeaderProps {
  opportunitiesCount: number
  onAddClick: () => void
}

export const OpportunitiesPageHeader: React.FC<OpportunitiesPageHeaderProps> = ({
  opportunitiesCount,
  onAddClick
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Target className="h-8 w-8 text-mfb-green" />
        <PageHeader 
          title="Opportunities"
          subtitle="Track and manage your sales pipeline and deals"
          count={opportunitiesCount}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/opportunities/new-multi-principal')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Multi-Principal
        </Button>
        
        <Button 
          onClick={onAddClick}
          className="ml-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>
    </div>
  )
}