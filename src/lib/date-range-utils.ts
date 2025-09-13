/**
 * Date Range Calculation Utilities
 * Provides optimized date calculations for universal filters
 */

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  addDays,
  isWeekend,
  format,
} from 'date-fns'
import type { TimeRangeType } from '@/types/filters.types'

export interface DateRange {
  start: Date
  end: Date
}

export interface DateRangeCalculationOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday
  includeTime?: boolean
  timezone?: string
}

// Default options - CRM business logic (Monday start, no time)
const DEFAULT_OPTIONS: DateRangeCalculationOptions = {
  weekStartsOn: 1, // Monday
  includeTime: false,
}

/**
 * Calculate date range for a given time range type
 */
export function calculateDateRange(
  timeRange: TimeRangeType,
  customRange?: { start: Date; end: Date },
  options: DateRangeCalculationOptions = {}
): DateRange {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const now = new Date()

  switch (timeRange) {
    case 'this_week':
      return {
        start: startOfWeek(now, { weekStartsOn: opts.weekStartsOn }),
        end: endOfWeek(now, { weekStartsOn: opts.weekStartsOn }),
      }

    case 'last_week':
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: opts.weekStartsOn })
      return {
        start: lastWeekStart,
        end: endOfWeek(lastWeekStart, { weekStartsOn: opts.weekStartsOn }),
      }

    case 'this_month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      }

    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      }

    case 'this_quarter':
      return {
        start: startOfQuarter(now),
        end: endOfQuarter(now),
      }

    case 'last_quarter':
      const lastQuarter = subQuarters(now, 1)
      return {
        start: startOfQuarter(lastQuarter),
        end: endOfQuarter(lastQuarter),
      }

    case 'this_year':
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      }

    case 'last_year':
      const lastYear = subYears(now, 1)
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear),
      }

    case 'custom':
      if (!customRange) {
        throw new Error('Custom date range requires start and end dates')
      }
      return {
        start: customRange.start,
        end: customRange.end,
      }

    default:
      // Fallback to current month
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      }
  }
}

/**
 * Get human-readable description of date range
 */
export function getDateRangeDescription(
  timeRange: TimeRangeType,
  customRange?: { start: Date; end: Date }
): string {
  const range = calculateDateRange(timeRange, customRange)

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  switch (timeRange) {
    case 'this_week':
      return 'This Week'
    case 'last_week':
      return 'Last Week'
    case 'this_month':
      return 'This Month'
    case 'last_month':
      return 'Last Month'
    case 'this_quarter':
      return 'This Quarter'
    case 'last_quarter':
      return 'Last Quarter'
    case 'this_year':
      return 'This Year'
    case 'last_year':
      return 'Last Year'
    case 'custom':
      return `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d, yyyy')}`
    default:
      return 'This Month'
  }
}

/**
 * Calculate business days within a date range
 */
export function getBusinessDaysInRange(start: Date, end: Date): number {
  let count = 0
  let current = new Date(start)

  while (current <= end) {
    if (!isWeekend(current)) {
      count++
    }
    current = addDays(current, 1)
  }

  return count
}

/**
 * Get the next business day from a given date
 */
export function getNextBusinessDay(date: Date): Date {
  let nextDay = addDays(date, 1)

  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1)
  }

  return nextDay
}

/**
 * Check if a date falls within a date range
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end
}

/**
 * Get relative date ranges (last N days, next N days)
 */
export function getRelativeDateRange(
  type: 'last' | 'next',
  days: number,
  from: Date = new Date()
): DateRange {
  if (type === 'last') {
    return {
      start: addDays(from, -days),
      end: from,
    }
  } else {
    return {
      start: from,
      end: addDays(from, days),
    }
  }
}

/**
 * Memoization cache for expensive date calculations
 */
const dateRangeCache = new Map<string, { result: DateRange; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

/**
 * Memoized date range calculation for performance
 */
export function getMemoizedDateRange(
  timeRange: TimeRangeType,
  customRange?: { start: Date; end: Date },
  options: DateRangeCalculationOptions = {}
): DateRange {
  const cacheKey = `${timeRange}-${JSON.stringify(customRange)}-${JSON.stringify(options)}`
  const cached = dateRangeCache.get(cacheKey)

  // Return cached result if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result
  }

  // Calculate new result and cache it
  const result = calculateDateRange(timeRange, customRange, options)
  dateRangeCache.set(cacheKey, { result, timestamp: Date.now() })

  // Clean up old cache entries periodically
  if (dateRangeCache.size > 100) {
    const now = Date.now()
    for (const [key, value] of dateRangeCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION * 2) {
        dateRangeCache.delete(key)
      }
    }
  }

  return result
}

/**
 * Validate that a date range is logical
 */
export function validateDateRange(
  start: Date,
  end: Date
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (start > end) {
    errors.push('Start date must be before end date')
  }

  const diffInDays = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (diffInDays > 365 * 2) {
    errors.push('Date range cannot exceed 2 years')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get quarter information for a given date
 */
export function getQuarterInfo(date: Date = new Date()): {
  quarter: 1 | 2 | 3 | 4
  year: number
  start: Date
  end: Date
} {
  const quarter = (Math.floor(date.getMonth() / 3) + 1) as 1 | 2 | 3 | 4
  const year = date.getFullYear()

  return {
    quarter,
    year,
    start: startOfQuarter(date),
    end: endOfQuarter(date),
  }
}
