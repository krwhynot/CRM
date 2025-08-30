import { parseISO, isToday, isYesterday } from 'date-fns'
import type { InteractionWithRelations, InteractionType } from '@/types/entities'
import type { ActivityItem } from '@/features/dashboard/hooks/useEnhancedActivityData'

// Activity processing utilities for the ActivityFeed component

/**
 * Groups activities by time periods (Today, Yesterday, This Week, etc.)
 */
export function groupActivitiesByTime(
  activities: InteractionWithRelations[]
): Record<string, InteractionWithRelations[]> {
  return activities.reduce(
    (groups, activity) => {
      const groupKey = getTimeGroupLabel(activity.interaction_date)
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(activity)
      return groups
    },
    {} as Record<string, InteractionWithRelations[]>
  )
}

/**
 * Groups activities by time periods for ActivityItems
 */
export function groupActivityItemsByTime(
  activities: ActivityItem[]
): Record<string, ActivityItem[]> {
  return activities.reduce(
    (groups, activity) => {
      const groupKey = activity.timestamp.toDateString()
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(activity)
      return groups
    },
    {} as Record<string, ActivityItem[]>
  )
}

/**
 * Gets the appropriate time group label for an activity date
 */
export function getTimeGroupLabel(date: string): string {
  const activityDate = parseISO(date)

  if (isToday(activityDate)) return 'Today'
  if (isYesterday(activityDate)) return 'Yesterday'

  const daysDiff = Math.floor((Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff <= 7) return 'This Week'
  if (daysDiff <= 30) return 'This Month'

  return 'Earlier'
}

/**
 * Filters activities by date range
 */
export function filterActivitiesByDateRange(
  activities: InteractionWithRelations[],
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'all'
): InteractionWithRelations[] {
  if (dateRange === 'all') return activities

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return activities.filter((activity) => {
    const activityDate = parseISO(activity.interaction_date)

    switch (dateRange) {
      case 'today':
        return activityDate >= startOfToday
      case 'yesterday': {
        const startOfYesterday = new Date(startOfToday)
        startOfYesterday.setDate(startOfYesterday.getDate() - 1)
        return activityDate >= startOfYesterday && activityDate < startOfToday
      }
      case 'week': {
        const startOfWeek = new Date(startOfToday)
        startOfWeek.setDate(startOfWeek.getDate() - 7)
        return activityDate >= startOfWeek
      }
      case 'month': {
        const startOfMonth = new Date(startOfToday)
        startOfMonth.setDate(startOfMonth.getDate() - 30)
        return activityDate >= startOfMonth
      }
      default:
        return true
    }
  })
}

/**
 * Filters activities by interaction type
 */
export function filterActivitiesByType(
  activities: InteractionWithRelations[],
  type: InteractionType | 'all'
): InteractionWithRelations[] {
  if (type === 'all') return activities
  return activities.filter((activity) => activity.type === type)
}

/**
 * Builds context information for an activity (contact, organization, opportunity)
 */
export function buildActivityContext(activity: InteractionWithRelations): string[] {
  const contextInfo = []

  if (activity.contact) {
    contextInfo.push(`${activity.contact.first_name} ${activity.contact.last_name}`)
  }
  if (activity.organization) {
    contextInfo.push(activity.organization.name)
  }
  if (activity.opportunity) {
    contextInfo.push(`Opportunity: ${activity.opportunity.name}`)
  }

  return contextInfo
}

/**
 * Checks if an activity has follow-up requirements
 */
export function hasFollowUpRequired(activity: InteractionWithRelations): boolean {
  return Boolean(activity.follow_up_required)
}

/**
 * Checks if an activity's follow-up is overdue
 */
export function isFollowUpOverdue(activity: InteractionWithRelations): boolean {
  if (!activity.follow_up_required || !activity.follow_up_date) return false

  const followUpDate = parseISO(activity.follow_up_date)
  return followUpDate < new Date()
}

/**
 * Gets activity statistics for a set of activities
 */
export function getActivityStats(activities: InteractionWithRelations[]) {
  const stats = {
    total: activities.length,
    byType: {} as Record<InteractionType, number>,
    withFollowUp: 0,
    overdueFollowUp: 0,
    today: 0,
    thisWeek: 0,
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  activities.forEach((activity) => {
    // Count by type
    stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1

    // Count follow-ups
    if (activity.follow_up_required) {
      stats.withFollowUp++
      if (isFollowUpOverdue(activity)) {
        stats.overdueFollowUp++
      }
    }

    // Count by time period
    const activityDate = parseISO(activity.interaction_date)
    if (activityDate >= startOfToday) {
      stats.today++
    }
    if (activityDate >= startOfWeek) {
      stats.thisWeek++
    }
  })

  return stats
}

/**
 * Sorts activity groups by priority (Today first, then Yesterday, etc.)
 */
export function sortActivityGroups<T>(groups: [string, T[]][]): [string, T[]][] {
  const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier']
  return groups.sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
}

/**
 * Formats activity duration for display
 */
export function formatActivityDuration(durationMinutes?: number | null): string | null {
  if (!durationMinutes) return null

  if (durationMinutes < 60) {
    return `${durationMinutes}m`
  }

  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}
