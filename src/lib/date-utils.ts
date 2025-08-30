import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval, parseISO, isToday, isYesterday, subDays } from 'date-fns'

export interface WeeklyData {
  weekStart: Date
  weekEnd: Date
  weekLabel: string
  weekNumber: number
  opportunities: number
  interactions: number
  principalBreakdown?: Record<string, number>
  productBreakdown?: Record<string, number>
}

/**
 * Get the Monday of the week for a given date
 */
export function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

/**
 * Get the Sunday of the week for a given date
 */
export function getSundayOfWeek(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

/**
 * Generate an array of week ranges starting from Monday
 * @param weeksCount Number of weeks to include
 * @param endDate End date (defaults to current date)
 */
export function generateWeekRanges(weeksCount: number, endDate: Date = new Date()): WeeklyData[] {
  const weeks: WeeklyData[] = []
  
  // Start from the Monday of the current week
  let currentWeekStart = getMondayOfWeek(endDate)
  
  // Generate weeks going backwards
  for (let i = 0; i < weeksCount; i++) {
    const weekStart = subWeeks(currentWeekStart, weeksCount - 1 - i)
    const weekEnd = getSundayOfWeek(weekStart)
    
    weeks.push({
      weekStart,
      weekEnd,
      weekLabel: format(weekStart, 'MMM d'),
      weekNumber: i + 1,
      opportunities: 0,
      interactions: 0
    })
  }
  
  return weeks
}

/**
 * Check if a date string falls within a specific week
 */
export function isDateInWeek(dateString: string, weekStart: Date, weekEnd: Date): boolean {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return isWithinInterval(date, { start: weekStart, end: weekEnd })
  } catch {
    return false
  }
}

/**
 * Aggregate opportunities data by week
 */
export function aggregateOpportunitiesByWeek(
  opportunities: Array<{
    id: string
    created_at: string
    stage?: string | null
    principal_id?: string | null
    product_id?: string | null
  }>,
  weekRanges: WeeklyData[],
  filters?: {
    principal?: string
    product?: string
  }
): WeeklyData[] {
  return weekRanges.map(week => {
    const weekOpportunities = opportunities.filter(opp => {
      // Check if opportunity falls within this week
      if (!isDateInWeek(opp.created_at, week.weekStart, week.weekEnd)) {
        return false
      }
      
      // Apply filters
      if (filters?.principal && filters.principal !== 'all' && opp.principal_id !== filters.principal) {
        return false
      }
      
      if (filters?.product && filters.product !== 'all' && opp.product_id !== filters.product) {
        return false
      }
      
      return true
    })
    
    return {
      ...week,
      opportunities: weekOpportunities.length,
      principalBreakdown: filters?.principal === 'all' ? undefined : 
        weekOpportunities.reduce((acc, opp) => {
          const key = opp.principal_id || 'unknown'
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      productBreakdown: filters?.product === 'all' ? undefined :
        weekOpportunities.reduce((acc, opp) => {
          const key = opp.product_id || 'unknown'
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as Record<string, number>)
    }
  })
}

/**
 * Aggregate interactions data by week
 */
export function aggregateInteractionsByWeek(
  interactions: Array<{
    id: string
    created_at: string
    type?: string | null
    contact_id?: string | null
    opportunity_id?: string | null
  }>,
  weekRanges: WeeklyData[],
  _filters?: {
    principal?: string
    product?: string
  }
): WeeklyData[] {
  return weekRanges.map(week => {
    const weekInteractions = interactions.filter(interaction => {
      // Check if interaction falls within this week
      if (!isDateInWeek(interaction.created_at, week.weekStart, week.weekEnd)) {
        return false
      }
      
      // Note: For interactions, we might need to join with opportunities/contacts
      // to apply principal/product filters. For now, we'll include all interactions.
      // This can be enhanced based on your data relationships.
      
      return true
    })
    
    return {
      ...week,
      interactions: weekInteractions.length
    }
  })
}

/**
 * Format week label for display (e.g., "Jan 8 - Jan 14")
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const startMonth = format(weekStart, 'MMM')
  const endMonth = format(weekEnd, 'MMM')
  const startDay = format(weekStart, 'd')
  const endDay = format(weekEnd, 'd')
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`
  }
}

/**
 * Get week number relative to current week (0 = current week, -1 = last week, etc.)
 */
export function getWeekOffset(date: Date, referenceDate: Date = new Date()): number {
  const refWeekStart = getMondayOfWeek(referenceDate)
  const dateWeekStart = getMondayOfWeek(date)
  
  const diffInMs = dateWeekStart.getTime() - refWeekStart.getTime()
  const diffInWeeks = Math.round(diffInMs / (7 * 24 * 60 * 60 * 1000))
  
  return diffInWeeks
}

/**
 * Format timestamp for activity feeds with relative time
 */
export function formatActivityTimestamp(timestamp: Date): string {
  if (isToday(timestamp)) {
    return `Today, ${format(timestamp, 'h:mm a')}`
  } else if (isYesterday(timestamp)) {
    return `Yesterday, ${format(timestamp, 'h:mm a')}`
  } else if (timestamp > subDays(new Date(), 7)) {
    return format(timestamp, 'EEE, MMM d, h:mm a')
  } else {
    return format(timestamp, 'MMM d, yyyy, h:mm a')
  }
}