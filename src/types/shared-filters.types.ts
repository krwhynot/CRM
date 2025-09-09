// Shared filter types for weekly dashboard pattern extension across all features

export type WeeklyTimeRangeType = 
  | 'this_week'
  | 'last_week' 
  | 'last_2_weeks'
  | 'last_4_weeks'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'custom'

// Base weekly filter state that can be extended by any feature
export interface BaseWeeklyFilterState {
  // Weekly time filtering - core to dashboard pattern
  timeRange?: WeeklyTimeRangeType
  
  // Principal filtering - consistent across all features
  principal?: string
  
  // Quick view context - feature-specific but consistent pattern
  quickView?: string | 'none'
  
  // Search functionality - present in all features
  search?: string
  
  // Custom date range for 'custom' timeRange option
  dateFrom?: Date
  dateTo?: Date
}

// Extended filter state with computed properties
export interface EnhancedWeeklyFilterState extends BaseWeeklyFilterState {
  // Loading state
  isLoading?: boolean
  
  // Filter context
  hasActiveFilters?: boolean
  activeFilterCount?: number
}

// Generic filter props interface for consistency across components
export interface WeeklyFilterComponentProps<T extends BaseWeeklyFilterState> {
  filters: T
  onFiltersChange: (filters: T) => void
  principals?: Array<{ id: string; name: string; company?: string }>
  isLoading?: boolean
  className?: string
}

// Quick view option interface for feature-specific customization
export interface FeatureQuickViewOption {
  value: string
  label: string
  shortLabel?: string
  description?: string
  icon?: string
  badge?: string | number
  filterPreset?: Record<string, string | number | boolean | null>
}

// Hook return interface for consistent filter management
export interface UseWeeklyFiltersReturn<T extends BaseWeeklyFilterState> {
  filters: T
  debouncedFilters: T
  isLoading: boolean
  
  // Filter manipulation
  handleFiltersChange: (newFilters: T) => void
  resetFilters: () => void
  
  // Specific filter updates
  updateTimeRange: (range: WeeklyTimeRangeType) => void
  updatePrincipal: (principalId: string) => void
  updateQuickView: (quickView: string | 'none') => void
  updateSearch: (search: string) => void
  
  // Computed properties
  computed: {
    hasActiveFilters: boolean
    activeFilterCount: number
    filterSummary: string
    dateRangeText: string
    effectiveTimeRange: { start: Date; end: Date }
  }
}

// Weekly context indicators for table enhancements
export interface WeeklyContextIndicators {
  movedThisWeek?: boolean
  stageChanges?: number
  weeklyActivity?: 'high' | 'medium' | 'low'
  lastActivity?: Date
  principalContext?: string
  weeklyEngagementScore?: number
}

// Feature-specific filter extensions - to be used as examples
export interface OpportunityWeeklyFilters extends BaseWeeklyFilterState {
  stage?: string | string[]
  organization_id?: string
  principal_organization_id?: string
  quickView?: 'pipeline_movers' | 'stalled_opportunities' | 'closing_soon' | 'needs_follow_up' | 'none'
}

export interface InteractionWeeklyFilters extends BaseWeeklyFilterState {
  type?: string | string[]
  organization_id?: string
  contact_id?: string
  opportunity_id?: string
  quickView?: 'follow_ups_due' | 'overdue_actions' | 'this_week_activity' | 'high_value_interactions' | 'none'
}

export interface ProductWeeklyFilters extends BaseWeeklyFilterState {
  category?: string | string[]
  principal_id?: string
  quickView?: 'promoted_this_week' | 'products_with_opportunities' | 'high_margin_products' | 'needs_attention' | 'none'
}

export interface OrganizationWeeklyFilters extends BaseWeeklyFilterState {
  type?: string | string[]
  priority?: string | string[]
  segment?: string | string[]
  quickView?: 'high_engagement' | 'multiple_opportunities' | 'inactive_orgs' | 'none'
}

export interface ContactWeeklyFilters extends BaseWeeklyFilterState {
  organization_id?: string
  purchase_influence?: string | string[]
  decision_authority?: string | string[]
  quickView?: 'decision_makers' | 'recent_interactions' | 'needs_follow_up' | 'none'
}

// Default filter values for consistency
export const DEFAULT_WEEKLY_FILTERS: BaseWeeklyFilterState = {
  timeRange: 'this_month',
  principal: 'all',
  quickView: 'none',
  search: '',
}

// Week options for consistent time range filtering
export const WEEKLY_TIME_RANGE_OPTIONS = [
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'last_2_weeks', label: 'Last 2 Weeks' },
  { value: 'last_4_weeks', label: 'Last 4 Weeks' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'custom', label: 'Custom Range' },
] as const