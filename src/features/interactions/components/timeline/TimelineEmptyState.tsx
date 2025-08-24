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
    <div className="text-center py-8 space-y-3">
      <Activity className="h-12 w-12 text-gray-400 mx-auto" />
      <h3 className="text-sm font-medium text-gray-900">No activities logged yet</h3>
      <p className="text-sm text-gray-500">
        Start tracking interactions and activities for this opportunity
      </p>
      <Button 
        onClick={onAddNew}
        variant="outline"
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Log First Activity
      </Button>
    </div>
  )
}