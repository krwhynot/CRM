import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ActivityItemComponent } from '../activity-enhanced/ActivityItemComponent'
import { formatActivityTimestamp } from '@/lib/date-utils'
import type { InteractionWithRelations } from '@/types/entities'
import type { ActivityItem as ActivityItemType } from '@/features/dashboard/hooks/useEnhancedActivityData'

interface ActivityGroupProps {
  groupKey: string
  activities: ActivityItemType[]
  onActivityClick?: (activity: InteractionWithRelations) => void
}

export const ActivityGroup: React.FC<ActivityGroupProps> = ({ groupKey, activities }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-between p-2 text-left font-medium">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{groupKey}</span>
            <Badge variant="secondary" className="text-xs">
              {activities.length}
            </Badge>
          </div>
          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2">
        {activities.map((activity) => (
          <ActivityItemComponent
            key={activity.id}
            item={activity}
            useNewStyle={false}
            formatTimestamp={formatActivityTimestamp}
            getPriorityColor={(priority) => (priority === 'high' ? 'red' : 'blue')}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
