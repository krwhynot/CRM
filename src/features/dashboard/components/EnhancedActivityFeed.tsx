import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, RefreshCw } from 'lucide-react'
import { useEnhancedActivityData } from '../hooks/useEnhancedActivityData'
import { useActivityFiltering } from '../hooks/useActivityFiltering'
import { useActivityFormatting } from '../hooks/useActivityFormatting'
import { ActivitySkeleton } from './activity-enhanced/ActivitySkeleton'
import { ActivityFilters } from './activity-enhanced/ActivityFilters'
import { ActivityItemComponent } from './activity-enhanced/ActivityItemComponent'
import { safeGetString } from '@/lib/secure-storage'

// Re-export ActivityItem type for consumers
export type { ActivityItem } from '../hooks/useEnhancedActivityData'

interface EnhancedActivityFeedProps {
  limit?: number
  className?: string
  showFilters?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function EnhancedActivityFeed({ 
  limit = 20, 
  className,
  showFilters = true
}: EnhancedActivityFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  // Feature flag for new MFB compact styling
  const USE_NEW_STYLE = safeGetString('useNewStyle', 'true') !== 'false'

  // Custom hooks
  const { activityItems, isLoading } = useEnhancedActivityData(refreshKey)
  const { selectedType, setSelectedType, filteredItems } = useActivityFiltering(activityItems, limit)
  const { formatTimestamp, getPriorityColor } = useActivityFormatting()

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading) {
    return <ActivitySkeleton className={className} useNewStyle={USE_NEW_STYLE} />
  }

  return (
    <Card className={`${USE_NEW_STYLE ? "border-primary/10 shadow-sm" : "shadow-md"} ${className}`}>
      <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${USE_NEW_STYLE ? "text-base font-bold text-foreground" : "text-lg font-semibold"}`}>
            <Activity className="size-5 text-primary" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="size-8 p-0"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
        
        <ActivityFilters
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          showFilters={showFilters}
        />
      </CardHeader>

      <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="mx-auto mb-3 size-12 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              No activities match your current filters.
            </p>
          </div>
        ) : (
          <div className={`max-h-activity-feed space-y-3 overflow-y-auto ${USE_NEW_STYLE ? "pr-2" : "pr-3"}`}>
            {filteredItems.map((item) => (
              <ActivityItemComponent
                key={item.id}
                item={item}
                useNewStyle={USE_NEW_STYLE}
                formatTimestamp={formatTimestamp}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        )}

        {filteredItems.length > 0 && filteredItems.length === limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" className="text-xs">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}