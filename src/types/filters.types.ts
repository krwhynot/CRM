import type { ReactNode } from 'react'
import type { FilterState } from './dashboard'

// Time range options for universal filtering
export type TimeRangeType =
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom'

// Focus type for activity and task filtering
export type FocusType =
  | 'all_activity'
  | 'my_tasks'
  | 'team_activity'
  | 'high_priority'
  | 'overdue'
  | 'pending_approval'

// Quick view shortcuts for dashboard
export type QuickViewType =
  | 'action_items_due'
  | 'pipeline_movers'
  | 'recent_wins'
  | 'needs_attention'
  | 'upcoming_meetings'
  | 'new_opportunities'
  | 'follow_up_required'

// Extended filter state that includes universal filters
export interface UniversalFilterState extends FilterState {
  timeRange: TimeRangeType
  focus: FocusType
  quickView: QuickViewType | 'none'
  dateFrom?: Date
  dateTo?: Date
}

// Organization data for filters
export interface FilterOrganizationData {
  id: string
  name: string
  type: string
}

// Props for universal filters component
export interface UniversalFiltersProps {
  filters: UniversalFilterState
  onFiltersChange: (filters: UniversalFilterState) => void
  isLoading?: boolean
  showTimeRange?: boolean
  showFocus?: boolean
  showQuickView?: boolean
  compact?: boolean
}

// Enhanced props for Phase 3 component
export interface EnhancedUniversalFiltersProps extends UniversalFiltersProps {
  // Responsive options
  maxColumns?: 1 | 2 | 3 | 4 | 5
  compactMode?: 'minimal' | 'standard' | 'full'

  // Organization integration
  principals?: FilterOrganizationData[]
  managers?: string[]
  availableFocusOptions?: FocusType[]
  availableQuickViews?: QuickViewType[]

  // Context-aware features
  showPrincipalSelector?: boolean
  showManagerSelector?: boolean
  showQuickViews?: boolean
  enableActiveFilterManagement?: boolean

  // UI customization
  variant?: 'card' | 'inline' | 'minimal'
  headerActions?: ReactNode

  // Callback enhancements
  onPrincipalChange?: (principalId: string) => void
  onManagerChange?: (managerName: string) => void
  onClearFilter?: (filterKey: keyof UniversalFilterState) => void
  onClearAllFilters?: () => void
  onSavePreset?: (preset: Partial<UniversalFilterState>) => void
}

// Time range option configuration
export interface TimeRangeOption {
  value: TimeRangeType
  label: string
  shortLabel?: string
  description?: string
}

// Focus option configuration
export interface FocusOption {
  value: FocusType
  label: string
  shortLabel?: string
  description?: string
  icon?: string
}

// Quick view option configuration
export interface QuickViewOption {
  value: QuickViewType
  label: string
  shortLabel?: string
  description?: string
  icon?: string
  badge?: string | number
}

// Default filter values
export const DEFAULT_UNIVERSAL_FILTERS: UniversalFilterState = {
  // Existing dashboard filter defaults
  principal: 'all',
  product: 'all',
  weeks: 'Last 4 Weeks',

  // Universal filter defaults
  timeRange: 'this_month',
  focus: 'all_activity',
  quickView: 'none',
}

// Computed filter properties for enhanced UX
export interface ComputedFilterProperties {
  isMyTasksView: boolean
  hasActiveFilters: boolean
  activeFilterCount: number
  filterSummary: string
  dateRangeText: string
  effectiveTimeRange: { start: Date; end: Date }
}

// Quick view preset configuration
export interface QuickViewPresetConfig {
  id: QuickViewType
  name: string
  description: string
  icon: string
  filters: Partial<UniversalFilterState>
  badge?: () => Promise<number>
}

// Enhanced filter state with additional properties
export interface EnhancedUniversalFilterState extends UniversalFilterState {
  selectedPrincipal?: string
  selectedManager?: string
  principalFilters?: {
    includeInactive: boolean
    priorityFilter: 'high' | 'medium' | 'low' | 'all'
  }
}

// Hook return type for useUniversalFilters
export interface UseUniversalFiltersReturn {
  filters: UniversalFilterState
  debouncedFilters: UniversalFilterState
  isLoading: boolean

  // Basic filter functions
  handleFiltersChange: (newFilters: UniversalFilterState) => void
  resetFilters: () => void
  resetUniversalFilters: () => void
  resetDashboardFilters: () => void

  // Enhanced individual update functions
  updateFilter: <K extends keyof UniversalFilterState>(
    field: K,
    value: UniversalFilterState[K]
  ) => void
  updateTimeRange: (range: TimeRangeType, customDates?: { start: Date; end: Date }) => void
  updateFocus: (focus: FocusType) => void
  updateQuickView: (preset: QuickViewType | 'none') => void

  // Quick view presets
  applyQuickView: (preset: QuickViewType) => void
  clearQuickView: () => void

  // Computed properties
  computed: ComputedFilterProperties
}

// Filter change event types
export type FilterChangeEvent<T = UniversalFilterState> = {
  filters: T
  changedField: keyof T
  previousValue: T[keyof T]
  newValue: T[keyof T]
}

// Filter validation result
export interface FilterValidationResult {
  isValid: boolean
  errors: Array<{
    field: keyof UniversalFilterState
    message: string
  }>
}
