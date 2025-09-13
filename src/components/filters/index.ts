// Enhanced Universal Filters - Phase 3 Implementation
export {
  EnhancedUniversalFilters,
  UniversalFilters,
  CompactUniversalFilters,
  InlineUniversalFilters,
  MinimalUniversalFilters,
  FullFeaturedUniversalFilters,
} from './UniversalFilters'

// Individual Filter Components
export { TimeRangeFilter } from './TimeRangeFilter'
export { FocusFilter } from './FocusFilter'
export { QuickViewFilter } from './QuickViewFilter'
export { PrincipalSelector } from './PrincipalSelector'
export { ManagerSelector } from './ManagerSelector'

// Enhanced Section Components
export { QuickViewsSection } from './QuickViewsSection'
export { ActiveFiltersDisplay } from './ActiveFiltersDisplay'

// Filter Sidebar Components
export { FilterSidebar } from './FilterSidebar'
export type { FilterSidebarProps, FilterSection, FilterSidebarState } from './FilterSidebar.types'

// Vertical Filter Components
export { VerticalFilterSection, VerticalFiltersAdapter, createFilterSections } from './vertical'

// Types and Hooks
export type {
  UniversalFilterState,
  UniversalFiltersProps,
  EnhancedUniversalFiltersProps,
  TimeRangeType,
  FocusType,
  QuickViewType,
  TimeRangeOption,
  FocusOption,
  QuickViewOption,
  UseUniversalFiltersReturn,
  FilterChangeEvent,
  FilterValidationResult,
  ComputedFilterProperties,
  QuickViewPresetConfig,
  EnhancedUniversalFilterState,
  FilterOrganizationData,
} from '@/types/filters.types'

export {
  useUniversalFilters,
  useFilterChangeHandler,
  useActiveFilterCount,
} from '@/hooks/useUniversalFilters'

export {
  useUniversalFiltersWithOrganizations,
  usePrincipalFilterSuggestions,
  useManagerFiltering,
} from '@/hooks/useUniversalFiltersWithOrganizations'

// Utility Functions
export {
  calculateDateRange,
  getDateRangeDescription,
  getMemoizedDateRange,
  getBusinessDaysInRange,
  getNextBusinessDay,
  isDateInRange,
  getRelativeDateRange,
  validateDateRange,
  getQuarterInfo,
} from '@/lib/date-range-utils'

export {
  QUICK_VIEW_PRESETS,
  applyQuickViewPreset,
  getQuickViewPresets,
  getQuickViewPreset,
  isPresetActive,
  getPresetBadgeCount,
  clearBadgeCache,
  WORKFLOW_PRESETS,
  getSuggestedPresets,
} from '@/lib/quick-view-presets'

export { DEFAULT_UNIVERSAL_FILTERS } from '@/types/filters.types'
