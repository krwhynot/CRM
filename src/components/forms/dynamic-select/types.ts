import * as React from "react"
import { Control, FieldValues, Path } from "react-hook-form"

export interface SelectOption {
  value: string
  label: string
  description?: string
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  metadata?: Record<string, any>
}

export interface DynamicSelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label: string
  placeholder?: string
  description?: string
  searchPlaceholder?: string
  noResultsText?: string
  loadingText?: string
  createNewText?: string
  disabled?: boolean
  required?: boolean
  className?: string
  
  // Multi-select capability
  multiple?: boolean
  maxSelections?: number
  
  // Async search function
  onSearch: (query: string) => Promise<SelectOption[]>
  
  // Quick create functionality
  onCreateNew?: () => void | Promise<void>
  showCreateWhenEmpty?: boolean
  showCreateAlways?: boolean
  
  // Debounce settings
  debounceMs?: number
  minSearchLength?: number
  
  // Preload options (optional)
  preloadOptions?: SelectOption[]
  
  // Custom rendering
  renderOption?: (option: SelectOption) => React.ReactNode
  renderSelected?: (option: SelectOption) => React.ReactNode
  
  // Grouping
  groupBy?: (option: SelectOption) => string
  
  // Selection behavior
  clearable?: boolean
  onClear?: () => void
  
  // Optimistic updates
  onSearchResultsUpdate?: (setter: (updateFn: (results: SelectOption[]) => SelectOption[]) => void) => void
  
  // Search query tracking
  onSearchQueryChange?: (query: string) => void
}

// Design tokens for consistent sizing
export const DYNAMIC_SELECT_TOKENS = {
  // Virtualization thresholds
  VIRTUALIZATION_THRESHOLD: 50,
  OPTION_HEIGHT: 'var(--dynamic-select-option-height, 40px)',
  MAX_HEIGHT: 'var(--dynamic-select-max-height, 300px)',
  
  // Bundle size thresholds
  MAX_BUNDLE_INCREASE_KB: 5,
  
  // Performance thresholds
  DEBOUNCE_MS: 500,
  MIN_SEARCH_LENGTH: 1,
} as const

export interface OptionListProps {
  options: SelectOption[]
  groupedOptions: Record<string, SelectOption[]>
  selectedOption: SelectOption | null
  selectedOptions: SelectOption[]
  searchQuery: string
  isLoading: boolean
  multiple: boolean
  
  // Error handling
  searchError?: string | null
  onRetrySearch?: () => void
  
  // Event handlers
  onSelect: (value: string) => void
  onCreateNew?: () => void
  
  // Configuration
  loadingText: string
  noResultsText: string
  createNewText: string
  showCreateWhenEmpty: boolean
  showCreateAlways: boolean
  isCreateOpen: boolean
  
  // Custom rendering
  renderOption?: (option: SelectOption) => React.ReactNode
  
  // Performance optimization
  virtualized?: boolean
}

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent) => void
  placeholder: string
  disabled: boolean
  isLoading: boolean
  name: string
  label: string
  hasError?: boolean
}