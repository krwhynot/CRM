import React from 'react'
import { Button } from '@/components/ui/button'
import { Activity, Plus } from 'lucide-react'

interface TimelineEmptyStateProps {
  onAddNew: () => void
}

export const TimelineEmptyState: React.FC<TimelineEmptyStateProps> = ({
  onAddNew
}) => {
  return (
    <div className="space-y-3 py-8 text-center">
      <Activity className="mx-auto size-12 text-gray-400" />
      <h3 className="text-sm font-medium text-gray-900">No activities logged yet</h3>
      <p className="text-sm text-gray-500">
        Start tracking interactions and activities for this opportunity
      </p>
      <Button 
        onClick={onAddNew}
        variant="outline"
        className="mt-4"
      >
        <Plus className="mr-2 size-4" />
        Log First Activity
      </Button>
    </div>
  )
}