import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format time ago with specific logic for CRM table display
 */
export function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return 'Never'
  
  const date = parseISO(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  // < 1 hour: "X minutes ago"
  if (diffInMinutes < 60) {
    return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes} minutes ago`
  }
  
  // < 24 hours: "X hours ago"
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  // < 7 days: "X days ago"
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  // >= 7 days: "Mar 15" format
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Check if opportunity is stalled (>30 days in current stage)
 */
export function isOpportunityStalled(stageUpdatedAt: string | null, createdAt: string): boolean {
  if (!stageUpdatedAt) {
    // If no stage update timestamp, use created_at
    const created = parseISO(createdAt)
    const daysSinceCreated = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceCreated > 30
  }
  
  const stageDate = parseISO(stageUpdatedAt)
  const daysSinceStageChange = Math.floor((Date.now() - stageDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysSinceStageChange > 30
}

/**
 * Get number of days an opportunity has been stalled
 */
export function getStalledDays(stageUpdatedAt: string | null, createdAt: string): number {
  const referenceDate = stageUpdatedAt ? parseISO(stageUpdatedAt) : parseISO(createdAt)
  return Math.floor((Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
}