import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ActivityItem } from '@/types/dashboard'
import { getRelativeTime } from '@/utils/dateUtils'

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

    const getActivityIcon = (type: 'opportunity' | 'activity' | 'interaction') => {
      switch (type) {
        case 'opportunity':
          return '🔵' // Blue circle for opportunities
        case 'activity':
          return '🟢' // Green circle for activities
        case 'interaction':
          return '🟡' // Yellow circle for interactions
        default:
          return '⚪'
      }
    }

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
        <Card className={className}>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              <div className="text-sm">No activities to display</div>
              <div className="mt-1 text-xs">Select a principal to view their activity</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Activity Feed
            <span className="text-sm font-normal text-muted-foreground">
              {visibleActivities.length} of {sortedActivities.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-activity-feed w-full">
            <div className="space-y-4">
              {visibleActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
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
    )
  }
)

SimpleActivityFeed.displayName = 'SimpleActivityFeed'
