/**
 * Quick View Preset Configurations
 * Defines preset filter combinations for common dashboard views
 */

import type { QuickViewType, QuickViewPresetConfig, UniversalFilterState } from '@/types/filters.types'

export const QUICK_VIEW_PRESETS: Record<QuickViewType, QuickViewPresetConfig> = {
  action_items_due: {
    id: 'action_items_due',
    name: 'Action Items Due',
    description: 'Tasks and actions due today or overdue',
    icon: 'AlertCircle',
    filters: {
      timeRange: 'this_week',
      focus: 'my_tasks',
      quickView: 'action_items_due'
    },
    badge: async () => {
      // This would connect to actual data source
      // For now, return mock data
      return Math.floor(Math.random() * 10) + 1
    }
  },

  pipeline_movers: {
    id: 'pipeline_movers',
    name: 'Pipeline Movers',
    description: 'Opportunities progressing through pipeline',
    icon: 'Target',
    filters: {
      timeRange: 'last_week',
      focus: 'all_activity',
      quickView: 'pipeline_movers'
    },
    badge: async () => {
      return Math.floor(Math.random() * 15) + 5
    }
  },

  recent_wins: {
    id: 'recent_wins',
    name: 'Recent Wins',
    description: 'Recently closed successful opportunities',
    icon: 'Trophy',
    filters: {
      timeRange: 'this_month',
      focus: 'team_activity',
      quickView: 'recent_wins'
    },
    badge: async () => {
      return Math.floor(Math.random() * 8) + 1
    }
  },

  needs_attention: {
    id: 'needs_attention',
    name: 'Needs Attention',
    description: 'Items requiring immediate attention',
    icon: 'AlertCircle',
    filters: {
      timeRange: 'this_week',
      focus: 'high_priority',
      quickView: 'needs_attention'
    },
    badge: async () => {
      return Math.floor(Math.random() * 6) + 2
    }
  },

  upcoming_meetings: {
    id: 'upcoming_meetings',
    name: 'Upcoming Meetings',
    description: 'Scheduled meetings and calls',
    icon: 'Calendar',
    filters: {
      timeRange: 'this_week',
      focus: 'my_tasks',
      quickView: 'upcoming_meetings'
    },
    badge: async () => {
      return Math.floor(Math.random() * 12) + 3
    }
  },

  new_opportunities: {
    id: 'new_opportunities',
    name: 'New Opportunities',
    description: 'Recently created opportunities',
    icon: 'Plus',
    filters: {
      timeRange: 'this_month',
      focus: 'all_activity',
      quickView: 'new_opportunities'
    },
    badge: async () => {
      return Math.floor(Math.random() * 20) + 5
    }
  },

  follow_up_required: {
    id: 'follow_up_required',
    name: 'Follow-up Required',
    description: 'Contacts and opportunities needing follow-up',
    icon: 'ArrowRight',
    filters: {
      timeRange: 'this_week',
      focus: 'my_tasks',
      quickView: 'follow_up_required'
    },
    badge: async () => {
      return Math.floor(Math.random() * 18) + 4
    }
  }
}

/**
 * Apply a quick view preset to current filters
 */
export function applyQuickViewPreset(
  preset: QuickViewType,
  currentFilters: UniversalFilterState
): UniversalFilterState {
  const presetConfig = QUICK_VIEW_PRESETS[preset]
  
  if (!presetConfig) {
    console.warn(`Unknown quick view preset: ${preset}`)
    return currentFilters
  }

  return {
    ...currentFilters,
    ...presetConfig.filters,
    quickView: preset
  }
}

/**
 * Get all available quick view presets
 */
export function getQuickViewPresets(): QuickViewPresetConfig[] {
  return Object.values(QUICK_VIEW_PRESETS)
}

/**
 * Get a specific preset configuration
 */
export function getQuickViewPreset(preset: QuickViewType): QuickViewPresetConfig | null {
  return QUICK_VIEW_PRESETS[preset] || null
}

/**
 * Check if a filter state matches a specific preset
 */
export function isPresetActive(
  preset: QuickViewType,
  currentFilters: UniversalFilterState
): boolean {
  const presetConfig = QUICK_VIEW_PRESETS[preset]
  
  if (!presetConfig) return false

  // Check if current filters match the preset
  const presetFilters = presetConfig.filters
  
  return Object.keys(presetFilters).every(key => {
    const filterKey = key as keyof UniversalFilterState
    return currentFilters[filterKey] === presetFilters[filterKey]
  })
}

/**
 * Get preset badges with caching
 */
const badgeCache = new Map<QuickViewType, { count: number; timestamp: number }>()
const BADGE_CACHE_DURATION = 60000 // 1 minute

export async function getPresetBadgeCount(preset: QuickViewType): Promise<number> {
  const cached = badgeCache.get(preset)
  
  // Return cached count if still valid
  if (cached && Date.now() - cached.timestamp < BADGE_CACHE_DURATION) {
    return cached.count
  }

  const presetConfig = QUICK_VIEW_PRESETS[preset]
  
  if (!presetConfig.badge) {
    return 0
  }

  try {
    const count = await presetConfig.badge()
    badgeCache.set(preset, { count, timestamp: Date.now() })
    return count
  } catch (error) {
    console.error(`Error getting badge count for preset ${preset}:`, error)
    return 0
  }
}

/**
 * Clear badge cache for a specific preset or all presets
 */
export function clearBadgeCache(preset?: QuickViewType): void {
  if (preset) {
    badgeCache.delete(preset)
  } else {
    badgeCache.clear()
  }
}

/**
 * Specialized preset combinations for common workflows
 */
export const WORKFLOW_PRESETS = {
  // Monday morning workflow
  weekly_review: {
    name: 'Weekly Review',
    description: 'Start the week with overdue tasks and new opportunities',
    presets: ['action_items_due', 'new_opportunities'] as QuickViewType[]
  },

  // End of day workflow
  daily_wrap_up: {
    name: 'Daily Wrap-up',
    description: 'Review pipeline progress and plan follow-ups',
    presets: ['pipeline_movers', 'follow_up_required'] as QuickViewType[]
  },

  // Manager review workflow
  team_oversight: {
    name: 'Team Oversight',
    description: 'Monitor team activity and celebrate wins',
    presets: ['recent_wins', 'needs_attention'] as QuickViewType[]
  }
}

/**
 * Get suggested presets based on current time/context
 */
export function getSuggestedPresets(): QuickViewType[] {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  // Monday morning (9-11 AM)
  if (dayOfWeek === 1 && hour >= 9 && hour <= 11) {
    return ['action_items_due', 'new_opportunities']
  }

  // End of day (4-6 PM)
  if (hour >= 16 && hour <= 18) {
    return ['pipeline_movers', 'follow_up_required']
  }

  // Friday afternoon (focus on wins)
  if (dayOfWeek === 5 && hour >= 14) {
    return ['recent_wins', 'upcoming_meetings']
  }

  // Default suggestions
  return ['action_items_due', 'pipeline_movers']
}