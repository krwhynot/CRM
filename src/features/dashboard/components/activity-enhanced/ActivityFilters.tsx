import React from 'react'
import { Button } from '@/components/ui/button'

interface ActivityFiltersProps {
  selectedType: string
  onTypeChange: (type: string) => void
  showFilters: boolean
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  selectedType,
  onTypeChange,
  showFilters
}) => {
  if (!showFilters) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <Button
        variant={selectedType === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeChange('all')}
        className="h-7 px-3 text-xs"
      >
        All
      </Button>
      <Button
        variant={selectedType === 'opportunity' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeChange('opportunity')}
        className="h-7 px-3 text-xs"
      >
        Opportunities
      </Button>
      <Button
        variant={selectedType === 'interaction' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeChange('interaction')}
        className="h-7 px-3 text-xs"
      >
        Activities
      </Button>
      <Button
        variant={selectedType === 'contact' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeChange('contact')}
        className="h-7 px-3 text-xs"
      >
        Contacts
      </Button>
    </div>
  )
}