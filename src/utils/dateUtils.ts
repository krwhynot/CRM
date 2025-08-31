import { startOfWeek, format, subWeeks, isSameWeek } from 'date-fns'
import type { DashboardChartDataPoint } from '@/types/dashboard'

/**
 * Get the start of week (Monday) for a given date
 */
export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday = 1
}

/**
 * Format week label as "Week of Jan 6"
 */
export const formatWeekLabel = (date: Date): string => {
  const weekStart = getWeekStart(date)
  return `Week of ${format(weekStart, 'MMM d')}`
}

/**
 * Get relative time string for activity feed
 * Returns "X min ago", "X hour ago", then "Monday 3:45 PM"
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? '1 min ago' : `${diffInMinutes} min ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }

  // Format as "Monday 3:45 PM"
  return format(date, 'EEEE h:mm a')
}

/**
 * Generate weeks data for the specified period
 */
export const generateWeeksData = (weeksBack: number): DashboardChartDataPoint[] => {
  const weeks: DashboardChartDataPoint[] = []
  const today = new Date()

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekDate = subWeeks(today, i)
    const weekStart = getWeekStart(weekDate)

    weeks.push({
      week: formatWeekLabel(weekStart),
      count: 0,
      weekStart,
    })
  }

  return weeks
}

/**
 * Check if two dates are in the same week (Monday-Sunday)
 */
export const isSameWeekMonday = (date1: Date, date2: Date): boolean => {
  return isSameWeek(date1, date2, { weekStartsOn: 1 })
}

/**
 * Get the number of weeks to look back based on filter
 */
export const getWeeksBack = (filter: string): number => {
  switch (filter) {
    case 'Last Week':
      return 1
    case 'Last 4 Weeks':
      return 4
    case 'Last 12 Weeks':
      return 12
    default:
      return 4
  }
}
