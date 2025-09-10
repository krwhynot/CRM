import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ActivityItem } from '@/types/dashboard'
import { getRelativeTime } from '@/utils/dateUtils'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { useDashboardDensity } from '@/features/dashboard/hooks/useDashboardDensity'

interface SimpleActivityFeedProps {
  activities: ActivityItem[]
  loading?: boolean
  className?: string
}

const ITEMS_PER_PAGE = 10

export const SimpleActivityFeed = React.memo(
  ({ activities, loading, className }: SimpleActivityFeedProps) => {
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE)
    const [loadingMore, setLoadingMore] = useState(false)
    const { density } = useDashboardDensity()
    
    // Density-aware priority: low in compact mode, medium otherwise
    const getPriority = (): 'low' | 'medium' => {
      return density === 'compact' ? 'low' : 'medium'
    }

    // Sort activities by date (newest first)
    const sortedActivities = useMemo(() => {
      return [...activities].sort((a, b) => b.date.getTime() - a.date.getTime())
    }, [activities])

    const visibleActivities = sortedActivities.slice(0, visibleItems)
    const hasMore = visibleItems < sortedActivities.length

    const handleLoadMore = () => {
      setLoadingMore(true)
      // Simulate loading delay
      setTimeout(() => {
        setVisibleItems((prev) => prev + ITEMS_PER_PAGE)
        setLoadingMore(false)
      }, 500)
    }

    // Create collapsed preview showing last 3 activities
    const previewActivities = sortedActivities.slice(0, 3)
    const newActivityCount = Math.max(0, sortedActivities.length - 7) // Simulate "new" activities

    const getActivityIcon = (type: 'opportunity' | 'activity' | 'interaction') => {
      switch (type) {
        case 'opportunity':
          return '🔵' // Professional blue for opportunities
        case 'activity':
          return '🟢' // Professional green for activities (muted)
        case 'interaction':
          return '🟠' // Professional amber for interactions
        default:
          return '⚪'
      }
    }

    // Create collapsed preview
    const collapsedPreview = (
      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
        {previewActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-2 text-xs">
            <div>{getActivityIcon(activity.type)}</div>
            <div className="min-w-0 flex-1 truncate text-muted-foreground">
              {activity.title} - {activity.principalName}
            </div>
            <div className="whitespace-nowrap text-muted-foreground">
              {getRelativeTime(activity.date)}
            </div>
          </div>
        ))}
        {sortedActivities.length > 3 && (
          <div className="pt-1 text-center text-xs text-muted-foreground">
            +{sortedActivities.length - 3} more activities
          </div>
        )}
      </div>
    )

    if (loading) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent role="status" aria-live="polite" aria-label="Loading activity feed">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex animate-pulse items-center space-x-3">
                  <div className="size-6 rounded-full bg-muted" aria-hidden="true"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-3/4 rounded bg-muted" aria-hidden="true"></div>
                    <div className="h-3 w-1/2 rounded bg-muted" aria-hidden="true"></div>
                  </div>
                </div>
              ))}
            </div>
            <span className="sr-only">Loading activities, please wait</span>
          </CardContent>
        </Card>
      )
    }

    if (sortedActivities.length === 0) {
      return (
        <CollapsibleSection
          sectionId="activity-feed"
          title="Activity Feed"
          priority={getPriority()}
          className={className}
        >
          <Card className="dashboard-card">
            <CardContent className="pt-4">
              <div className="py-8 text-center text-muted-foreground">
                <div className="text-sm">No activities to display</div>
                <div className="mt-1 text-xs">Select a principal to view their activity</div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleSection>
      )
    }

    return (
      <CollapsibleSection
        sectionId="activity-feed"
        title="Activity Feed"
        badge={`${sortedActivities.length} activities${newActivityCount > 0 ? ` (${newActivityCount} new)` : ''}`}
        priority={getPriority()}
        className={className}
        collapsedPreview={collapsedPreview}
      >
        <Card className="dashboard-card">
          <CardContent className="pt-4">
          <ScrollArea className="h-activity-feed w-full">
            <div className="space-y-2">
              {visibleActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="activity-feed-item flex items-start space-x-3 rounded-lg"
                >
                  <div className="mt-0.5 text-lg">{getActivityIcon(activity.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground">{activity.principalName}</p>
                          {activity.productName && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {activity.productName}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
                        {getRelativeTime(activity.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4" aria-busy={loadingMore}>
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full max-w-xs"
                    aria-live="polite"
                  >
                    <span role="status">{loadingMore ? 'Loading...' : 'Load More Activities'}</span>
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </CollapsibleSection>
    )
  }
)

SimpleActivityFeed.displayName = 'SimpleActivityFeed'
