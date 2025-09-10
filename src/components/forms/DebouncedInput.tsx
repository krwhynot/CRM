/**
 * Debounced Input Components
 * 
 * Input components with built-in debouncing to reduce unnecessary API calls
 * and improve performance for search and filter operations.
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/performance/memoization-utils'
import { Search, X, Loader2 } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  onDebouncedChange?: (value: string) => void
  loading?: boolean
  clearable?: boolean
  className?: string
}

interface DebouncedSearchInputProps extends DebouncedInputProps {
  onSearch?: (query: string) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  showSearchIcon?: boolean
  showLoadingIndicator?: boolean
}

// =============================================================================
// BASIC DEBOUNCED INPUT
// =============================================================================

export const DebouncedInput = React.memo<DebouncedInputProps>(({
  value,
  onChange,
  debounceMs = 300,
  onDebouncedChange,
  loading = false,
  clearable = false,
  className,
  ...props
}) => {
  // Internal state for immediate updates
  const [internalValue, setInternalValue] = React.useState(value)
  
  // Debounced value for external updates
  const debouncedValue = useDebounce(internalValue, debounceMs)

  // Sync external value changes
  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Call external onChange when debounced value changes
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
      onDebouncedChange?.(debouncedValue)
    }
  }, [debouncedValue, value, onChange, onDebouncedChange])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }, [])

  const handleClear = React.useCallback(() => {
    setInternalValue('')
    onChange('')
  }, [onChange])

  return (
    <div className="relative">
      <Input
        {...props}
        value={internalValue}
        onChange={handleChange}
        className={cn('pr-8', className)}
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {/* Clear button */}
      {clearable && internalValue && !loading && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear input"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})

DebouncedInput.displayName = 'DebouncedInput'

// =============================================================================
// DEBOUNCED SEARCH INPUT
// =============================================================================

export const DebouncedSearchInput = React.memo<DebouncedSearchInputProps>(({
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  placeholder = 'Search...',
  size = 'md',
  showSearchIcon = true,
  showLoadingIndicator = true,
  loading = false,
  className,
  ...props
}) => {
  const debouncedValue = useDebounce(value, debounceMs)

  // Trigger search when debounced value changes
  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onSearch])

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm', 
    lg: 'h-10 text-base',
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const paddingClasses = showSearchIcon ? 'pl-9' : 'pl-3'

  return (
    <div className="relative">
      {/* Search icon */}
      {showSearchIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className={cn('text-muted-foreground', iconSizeClasses[size])} />
        </div>
      )}
      
      {/* Input */}
      <Input
        {...props}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          sizeClasses[size],
          paddingClasses,
          'pr-8',
          className
        )}
      />
      
      {/* Loading indicator */}
      {showLoadingIndicator && loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className={cn('animate-spin text-muted-foreground', iconSizeClasses[size])} />
        </div>
      )}
      
      {/* Clear button */}
      {value && !loading && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className={iconSizeClasses[size]} />
        </button>
      )}
    </div>
  )
})

DebouncedSearchInput.displayName = 'DebouncedSearchInput'

// =============================================================================
// FILTER INPUT WITH MULTIPLE VALUES
// =============================================================================

interface DebouncedFilterInputProps {
  values: string[]
  onChange: (values: string[]) => void
  debounceMs?: number
  placeholder?: string
  separator?: string
  maxTags?: number
  className?: string
}

export const DebouncedFilterInput = React.memo<DebouncedFilterInputProps>(({
  values,
  onChange,
  debounceMs = 300,
  placeholder = 'Add filters...',
  separator = ',',
  maxTags = 10,
  className,
}) => {
  const [inputValue, setInputValue] = React.useState('')
  const debouncedInputValue = useDebounce(inputValue, debounceMs)

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === separator) {
      e.preventDefault()
      
      const newValue = inputValue.trim()
      if (newValue && !values.includes(newValue) && values.length < maxTags) {
        onChange([...values, newValue])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      // Remove last tag when backspacing on empty input
      onChange(values.slice(0, -1))
    }
  }, [inputValue, values, onChange, separator, maxTags])

  const removeValue = React.useCallback((valueToRemove: string) => {
    onChange(values.filter(v => v !== valueToRemove))
  }, [values, onChange])

  return (
    <div className={cn('flex flex-wrap gap-1 p-2 border rounded-md focus-within:ring-1 focus-within:ring-ring', className)}>
      {/* Value tags */}
      {values.map((value, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
        >
          {value}
          <button
            type="button"
            onClick={() => removeValue(value)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${value}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      
      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={values.length === 0 ? placeholder : ''}
        className="flex-1 min-w-20 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
        disabled={values.length >= maxTags}
      />
    </div>
  )
})

DebouncedFilterInput.displayName = 'DebouncedFilterInput'

// =============================================================================
// NUMERIC INPUT WITH DEBOUNCING
// =============================================================================

interface DebouncedNumericInputProps {
  value: number | null
  onChange: (value: number | null) => void
  debounceMs?: number
  min?: number
  max?: number
  step?: number
  placeholder?: string
  className?: string
}

export const DebouncedNumericInput = React.memo<DebouncedNumericInputProps>(({
  value,
  onChange,
  debounceMs = 300,
  min,
  max,
  step = 1,
  placeholder,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState(value?.toString() || '')
  const debouncedValue = useDebounce(internalValue, debounceMs)

  // Sync external value changes
  React.useEffect(() => {
    setInternalValue(value?.toString() || '')
  }, [value])

  // Parse and validate debounced value
  React.useEffect(() => {
    const numericValue = debouncedValue === '' ? null : parseFloat(debouncedValue)
    
    if (numericValue !== null) {
      // Validate against min/max
      let validatedValue = numericValue
      if (min !== undefined) validatedValue = Math.max(min, validatedValue)
      if (max !== undefined) validatedValue = Math.min(max, validatedValue)
      
      if (validatedValue !== value) {
        onChange(validatedValue)
      }
    } else if (value !== null) {
      onChange(null)
    }
  }, [debouncedValue, value, onChange, min, max])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string, numbers, and decimal points
    if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
      setInternalValue(inputValue)
    }
  }, [])

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  )
})

DebouncedNumericInput.displayName = 'DebouncedNumericInput'

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook for managing debounced search state
 */
export function useDebouncedSearch(
  initialQuery: string = '',
  debounceMs: number = 300
) {
  const [query, setQuery] = React.useState(initialQuery)
  const [isSearching, setIsSearching] = React.useState(false)
  const debouncedQuery = useDebounce(query, debounceMs)

  // Track when debounced value is different from current (searching state)
  React.useEffect(() => {
    setIsSearching(query !== debouncedQuery)
  }, [query, debouncedQuery])

  const clearSearch = React.useCallback(() => {
    setQuery('')
  }, [])

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    isSearching,
  }
}

/**
 * Hook for managing multiple filter inputs
 */
export function useDebouncedFilters<T extends Record<string, any>>(
  initialFilters: T,
  debounceMs: number = 300
) {
  const [filters, setFilters] = React.useState<T>(initialFilters)
  const debouncedFilters = useDebounce(filters, debounceMs)

  const updateFilter = React.useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilter = React.useCallback(<K extends keyof T>(key: K) => {
    setFilters(prev => ({ ...prev, [key]: initialFilters[key] }))
  }, [initialFilters])

  const clearAllFilters = React.useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const hasActiveFilters = React.useMemo(() => {
    return Object.keys(filters).some(key => 
      filters[key] !== initialFilters[key] && 
      filters[key] !== '' && 
      filters[key] !== null && 
      filters[key] !== undefined
    )
  }, [filters, initialFilters])

  return {
    filters,
    debouncedFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  }
}