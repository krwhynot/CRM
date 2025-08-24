import React from 'react'
import { Clock, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useActivityFiltering } from '@/hooks/useActivityFiltering'
import { useActivityRealTime } from '@/hooks/useActivityRealTime'
import { ActivityGroup } from '@/components/activity/ActivityGroup'
import { ActivityFeedSkeleton } from '@/components/activity/ActivityFeedSkeleton'
import { ActivityFiltersComponent } from '@/components/activity/ActivityFilters'
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

// Re-export types for backward compatibility
export type { ActivityFilters } from '@/hooks/useActivityFiltering'

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 50,
  showFilters = true,
  className = '',
  onActivityClick,
  enableRealTime = true
}) => {
  // Use extracted hooks for state management
  const realTimeData = useActivityRealTime({ limit, enableRealTime })
  const filtering = useActivityFiltering({ activities: realTimeData.activities })
  
  if (realTimeData.error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Activities</CardTitle>
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
                  {filtering.totalFilteredActivities}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent interactions across all entities
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <ActivityFiltersComponent
              filters={filtering.filters}
              setFilters={filtering.setFilters}
              hasActiveFilters={filtering.hasActiveFilters}
              clearFilters={filtering.clearFilters}
              showFilters={showFilters}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={realTimeData.handleRefresh}
              disabled={realTimeData.isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${realTimeData.isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {realTimeData.isLoading ? (
          <ActivityFeedSkeleton />
        ) : filtering.totalFilteredActivities === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No recent activities</p>
            <p className="text-sm text-gray-400 mt-1">
              {filtering.hasActiveFilters 
                ? 'Try adjusting your filters to see more activities.'
                : 'Activities will appear here as they are created.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortActivityGroups(Object.entries(filtering.filteredAndGroupedActivities))
              .map(([groupKey, groupActivities]) => (
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