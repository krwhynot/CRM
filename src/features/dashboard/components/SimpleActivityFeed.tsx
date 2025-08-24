import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActivityItem } from '@/types/dashboard'
import { getRelativeTime } from '@/utils/dateUtils'

interface SimpleActivityFeedProps {
  activities: ActivityItem[]
  loading?: boolean
  className?: string
}

const ITEMS_PER_PAGE = 10

export const SimpleActivityFeed = React.memo(({ activities, loading, className }: SimpleActivityFeedProps) => {
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
      setVisibleItems(prev => prev + ITEMS_PER_PAGE)
      setLoadingMore(false)
    }, 500)
  }

  const getActivityIcon = (type: 'opportunity' | 'interaction') => {
    switch (type) {
      case 'opportunity':
        return '🔵' // Blue circle for opportunities
      case 'interaction':
        return '🟢' // Green circle for interactions
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
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="w-6 h-6 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No activities to display</div>
            <div className="text-xs mt-1">Select a principal to view their activity</div>
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
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {visibleActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-lg mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {activity.principalName}
                        </p>
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
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {getRelativeTime(activity.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full max-w-xs"
                >
                  {loadingMore ? 'Loading...' : 'Load More Activities'}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
})

SimpleActivityFeed.displayName = 'SimpleActivityFeed'