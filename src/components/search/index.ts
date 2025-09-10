/**
 * Search Components
 * 
 * Comprehensive search system for CRM entities with quick search
 * and advanced search capabilities.
 */

// Advanced search panel
export {
  AdvancedSearchPanel,
  type SearchFilter,
  type SavedSearch,
  type SearchResult,
} from './AdvancedSearchPanel'

// Quick search component
export {
  QuickSearch,
  QuickSearchTrigger,
  formatSearchResult,
  type QuickSearchResult,
} from './QuickSearch'