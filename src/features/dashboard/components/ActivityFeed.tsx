import React from 'react'
import { Clock, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useActivityFiltering } from '@/features/dashboard/hooks/useActivityFiltering'
import { useActivityRealTime } from '@/features/dashboard/hooks/useActivityRealTime'
import { ActivityGroup } from '@/features/dashboard/components/activity/ActivityGroup'
import { ActivityFeedSkeleton } from '@/features/dashboard/components/activity/ActivityFeedSkeleton'
import { ActivityFiltersComponent } from '@/features/dashboard/components/activity/ActivityFilters'
import { sortActivityGroups } from '@/lib/activity-utils'
import type { InteractionWithRelations } from '@/types/entities'

// Interface definitions
export interface ActivityFeedProps {
  limit?: number
  showFilters?: boolean
  className?: string
  onActivityClick?: (activity: InteractionWithRelations) => void
  enableRealTime?: boolean
}

import type { ActivityItem } from '@/features/dashboard/hooks/useEnhancedActivityData'

// Re-export types for backward compatibility
export type { UseActivityFilteringReturn } from '@/features/dashboard/hooks/useActivityFiltering'

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 50,
  showFilters = true,
  className = '',
  onActivityClick,
  enableRealTime = true
}) => {
  // Use extracted hooks for state management
  const realTimeData = useActivityRealTime({ limit, enableRealTime })
  const {
    selectedType,
    selectedPriority,
    setSelectedType,
    setSelectedPriority,
    filteredItems
  } = useActivityFiltering(realTimeData.activities || [], limit)
  
  if (realTimeData.error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Activities</CardTitle>
          <CardDescription>
            Failed to load recent activities. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Activity Feed
              {!realTimeData.isLoading && (
                <Badge variant="secondary" className="text-xs">
                  {filteredItems.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent interactions across all entities
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <ActivityFiltersComponent
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              showFilters={showFilters}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={realTimeData.handleRefresh}
              disabled={realTimeData.isRefreshing}
              className="size-8 p-0"
            >
              <RefreshCw className={`size-4 ${realTimeData.isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {realTimeData.isLoading ? (
          <ActivityFeedSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-4 size-12 text-gray-300" />
            <p className="font-medium text-gray-500">No recent activities</p>
            <p className="mt-1 text-sm text-gray-400">
              {selectedType !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your filters to see more activities.'
                : 'Activities will appear here as they are created.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortActivityGroups(Object.entries(
              filteredItems.reduce((acc, item) => {
                const group = new Date(item.timestamp).toDateString();
                if (!acc[group]) {
                  acc[group] = [];
                }
                acc[group].push(item);
                return acc;
              }, {} as Record<string, ActivityItem[]>),
            )).map(([groupKey, groupActivities]) => (
                <div key={groupKey}>
                  <ActivityGroup
                    groupKey={groupKey}
                    activities={groupActivities}
                    onActivityClick={onActivityClick}
                  />
                  <Separator className="mt-4" />
                </div>
              ))
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
