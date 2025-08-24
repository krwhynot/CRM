import React from 'react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

interface TimelineHeaderProps {
  interactionCount: number
  onAddNew: () => void
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  interactionCount,
  onAddNew
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div className="flex items-center gap-2">
        <CardTitle className="text-lg font-nunito">Activity Timeline</CardTitle>
        {interactionCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {interactionCount}
          </Badge>
        )}
      </div>
      <Button 
        onClick={onAddNew}
        size="sm"
        className="flex items-center gap-2 md:h-9 h-11"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Log Activity</span>
        <span className="sm:hidden">Log</span>
      </Button>
    </CardHeader>
  )
}