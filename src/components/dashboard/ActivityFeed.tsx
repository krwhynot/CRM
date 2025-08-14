import React, { useState, useMemo, useEffect } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { 
  Phone, 
  Mail, 
  Calendar, 
  Target, 
  FileText, 
  Building2, 
  Clock,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { useRecentActivity } from '@/hooks/useInteractions'
import { supabase } from '@/lib/supabase'
import { 
  groupActivitiesByTime, 
  filterActivitiesByDateRange, 
  filterActivitiesByType,
  buildActivityContext,
  sortActivityGroups,
  formatActivityDuration
} from '@/lib/activity-utils'
import type { InteractionWithRelations, InteractionType } from '@/types/entities'

// Interface definitions
export interface ActivityFeedProps {
  limit?: number
  showFilters?: boolean
  className?: string
  onActivityClick?: (activity: InteractionWithRelations) => void
  enableRealTime?: boolean
}

interface ActivityFilters {
  type?: InteractionType | 'all'
  dateRange?: 'today' | 'yesterday' | 'week' | 'month' | 'all'
}


// Activity type configuration
const ACTIVITY_CONFIG = {
  call: {
    icon: Phone,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    label: 'Call'
  },
  email: {
    icon: Mail,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    label: 'Email'
  },
  meeting: {
    icon: Calendar,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    label: 'Meeting'
  },
  demo: {
    icon: Target,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    label: 'Demo'
  },
  proposal: {
    icon: FileText,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    label: 'Proposal'
  },
  follow_up: {
    icon: Clock,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    label: 'Follow-up'
  },
  trade_show: {
    icon: Building2,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-700',
    label: 'Trade Show'
  },
  site_visit: {
    icon: Building2,
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    label: 'Site Visit'
  },
  contract_review: {
    icon: FileText,
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    label: 'Contract Review'
  }
} as const

// Helper functions moved to activity-utils.ts

// Activity Item Component
interface ActivityItemProps {
  activity: InteractionWithRelations
  onClick?: (activity: InteractionWithRelations) => void
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const config = ACTIVITY_CONFIG[activity.type]
  const Icon = config.icon
  
  const handleClick = () => {
    onClick?.(activity)
  }
  
  // Build context information
  const contextInfo = buildActivityContext(activity)
  
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={handleClick}
    >
      {/* Activity Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.lightColor} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${config.textColor}`} />
      </div>
      
      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.subject}
            </p>
            
            {/* Context Information */}
            {contextInfo.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {contextInfo.map((info, index) => (
                  <React.Fragment key={index}>
                    <span className="text-xs text-gray-500">{info}</span>
                    {index < contextInfo.length - 1 && (
                      <span className="text-xs text-gray-300">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Description */}
            {activity.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {activity.description}
              </p>
            )}
            
            {/* Activity Metadata */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {config.label}
              </Badge>
              
              {activity.duration_minutes && (
                <span className="text-xs text-gray-500">
                  {formatActivityDuration(activity.duration_minutes)}
                </span>
              )}
              
              {activity.follow_up_required && (
                <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                  Follow-up Required
                </Badge>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="flex-shrink-0 ml-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(parseISO(activity.interaction_date), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity Group Component
interface ActivityGroupProps {
  groupKey: string
  activities: InteractionWithRelations[]
  onActivityClick?: (activity: InteractionWithRelations) => void
}

const ActivityGroup: React.FC<ActivityGroupProps> = ({ groupKey, activities, onActivityClick }) => {
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

// Loading State Component
const ActivityFeedSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-start gap-3 p-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
)

// Main ActivityFeed Component
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 50,
  showFilters = true,
  className = '',
  onActivityClick,
  enableRealTime = true
}) => {
  const [filters, setFilters] = useState<ActivityFilters>({
    type: 'all',
    dateRange: 'all'
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Fetch recent activities
  const { data: activities, isLoading, error, refetch } = useRecentActivity(limit)
  
  // Real-time subscription for new interactions
  useEffect(() => {
    if (!enableRealTime) return
    
    const channel = supabase
      .channel('activity-feed-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'interactions',
          filter: 'deleted_at=is.null'
        }, 
        () => {
          // Refetch data when interactions are updated
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealTime, refetch])
  
  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }
  
  // Apply filters and grouping
  const filteredAndGroupedActivities = useMemo(() => {
    if (!activities) return {}
    
    let filtered = activities
    
    // Apply type filter
    filtered = filterActivitiesByType(filtered, filters.type || 'all')
    
    // Apply date range filter
    filtered = filterActivitiesByDateRange(filtered, filters.dateRange || 'all')
    
    // Group by time
    return groupActivitiesByTime(filtered)
  }, [activities, filters])
  
  const totalFilteredActivities = Object.values(filteredAndGroupedActivities).flat().length
  
  // Clear filters
  const clearFilters = () => {
    setFilters({ type: 'all', dateRange: 'all' })
  }
  
  const hasActiveFilters = filters.type !== 'all' || filters.dateRange !== 'all'
  
  if (error) {
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
              {!isLoading && (
                <Badge variant="secondary" className="text-xs">
                  {totalFilteredActivities}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent interactions across all entities
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {showFilters && (
              <>
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 mr-2">Filter</span>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as InteractionType | 'all' }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ACTIVITY_CONFIG).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.dateRange || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as ActivityFilters['dateRange'] }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-8 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <ActivityFeedSkeleton />
        ) : totalFilteredActivities === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No recent activities</p>
            <p className="text-sm text-gray-400 mt-1">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more activities.'
                : 'Activities will appear here as they are created.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortActivityGroups(Object.entries(filteredAndGroupedActivities))
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