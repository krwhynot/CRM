import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ActivityItem } from './ActivityItem'
import type { InteractionWithRelations } from '@/types/entities'

interface ActivityGroupProps {
  groupKey: string
  activities: InteractionWithRelations[]
  onActivityClick?: (activity: InteractionWithRelations) => void
}

export const ActivityGroup: React.FC<ActivityGroupProps> = ({ 
  groupKey, 
  activities, 
  onActivityClick 
}) => {
  const [isOpen, setIsOpen] = useState(true)
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-2 h-auto font-medium text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{groupKey}</span>
            <Badge variant="secondary" className="text-xs">
              {activities.length}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onClick={onActivityClick}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}