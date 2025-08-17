"use client"

import * as React from "react"
import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useController, FieldValues } from "react-hook-form"
import { ChevronsUpDown, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/useMediaQuery"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Command } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormErrorBoundary } from "@/components/ui/form-error-boundary"
import { AlertCircle } from "lucide-react"

// Local imports from modular components
import { useDynamicSelectSearch } from "./hooks/useDynamicSelectSearch"
import { OptionList } from "./OptionList"
import { SearchInput } from "./SearchInput"
import type { DynamicSelectFieldProps, SelectOption } from "./types"

export function DynamicSelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder = "Select an option...",
  description,
  searchPlaceholder = "Search...",
  noResultsText = "No results found",
  loadingText = "Searching...",
  createNewText = "Create new",
  disabled = false,
  required = false,
  className,
  multiple = false,
  maxSelections,
  onSearch,
  onCreateNew,
  showCreateWhenEmpty = true,
  showCreateAlways = false,
  debounceMs = 500,
  minSearchLength = 1,
  preloadOptions = [],
  renderOption,
  renderSelected,
  groupBy,
  clearable = true,
  onClear,
  onSearchResultsUpdate,
  onSearchQueryChange,
}: DynamicSelectFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearchRetrying, setIsSearchRetrying] = useState(false)
  const [selectedOptionCache, setSelectedOptionCache] = useState<SelectOption | null>(null)
  
  // Refs for focus management and cleanup
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const renderCountRef = useRef(0)
  
  // Development safety net: Track renders to detect infinite loops
  renderCountRef.current += 1
  if (renderCountRef.current > 100) {
    throw new Error('DynamicSelectField: Infinite render loop detected')
  }
  
  // Reset render count on unmount to handle component remounts
  useEffect(() => {
    return () => {
      renderCountRef.current = 0
    }
  }, [])
  
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Use extracted search logic with error handling
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    loadInitialResults,
  } = useDynamicSelectSearch({
    onSearch: async (query) => {
      try {
        setSearchError(null)
        setIsSearchRetrying(false)
        if (onSearch) {
          return await onSearch(query)
        }
        return []
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed. Please try again.'
        setSearchError(errorMessage)
        setAnnouncement(`Search error: ${errorMessage}`)
        throw error
      }
    },
    debounceMs,
    minSearchLength,
    preloadOptions,
    onSearchResultsUpdate,
    onSearchQueryChange,
  })

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: required ? `${label} is required` : false },
  })

  // Find selected option(s) - use cache if not found in current results
  const selectedOption = useMemo(() => {
    if (multiple) return null
    const allOptions = [...preloadOptions, ...searchResults]
    const foundOption = allOptions.find(option => option.value === field.value)
    
    // If we can't find the option in current results but have a cached value
    // and the cached value matches the current field value, use the cache
    if (!foundOption && selectedOptionCache && selectedOptionCache.value === field.value) {
      return selectedOptionCache
    }
    
    return foundOption || null
  }, [field.value, preloadOptions, searchResults, multiple, selectedOptionCache])

  const selectedOptions = useMemo(() => {
    if (!multiple) return []
    const allOptions = [...preloadOptions, ...searchResults]
    const values = Array.isArray(field.value) ? field.value : []
    return allOptions.filter(option => values.includes(option.value))
  }, [field.value, preloadOptions, searchResults, multiple])

  // Group options if groupBy function is provided
  const groupedOptions = useMemo(() => {
    if (!groupBy) return { "": searchResults }
    
    const grouped = searchResults.reduce((groups, option) => {
      const group = groupBy(option)
      if (!groups[group]) groups[group] = []
      groups[group].push(option)
      return groups
    }, {} as Record<string, SelectOption[]>)
    
    return grouped
  }, [searchResults, groupBy])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }, [])

  // Load initial results when component opens
  useEffect(() => {
    if (open && searchQuery === "") {
      loadInitialResults()
    }
  }, [open, searchQuery, loadInitialResults])

  // Handle selection when selectedValue changes (cmdk integration)
  useEffect(() => {
    if (selectedValue && open) {
      handleSelect(selectedValue)
    }
  }, [selectedValue, open, handleSelect])

  // Clear cache when field value is externally cleared
  useEffect(() => {
    if (!multiple && !field.value && selectedOptionCache) {
      setSelectedOptionCache(null)
    }
  }, [field.value, multiple, selectedOptionCache])

  // Clear announcement after it's been read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(""), 1000)
      return () => clearTimeout(timer)
    }
  }, [announcement])

  // Handle selection
  const handleSelect = useCallback((value: string) => {
    const allOptions = [...preloadOptions, ...searchResults]
    const selectedOption = allOptions.find(option => option.value === value)
    
    if (multiple) {
      const currentValues = Array.isArray(field.value) ? field.value : []
      const isSelected = currentValues.includes(value)
      
      if (isSelected) {
        // Remove from selection
        const newValues = currentValues.filter(v => v !== value)
        field.onChange(newValues)
        setAnnouncement(`Removed ${selectedOption?.label}. ${newValues.length} items selected.`)
      } else {
        // Add to selection (check max limit)
        if (maxSelections && currentValues.length >= maxSelections) {
          setAnnouncement(`Maximum ${maxSelections} selections allowed`)
          return
        }
        const newValues = [...currentValues, value]
        field.onChange(newValues)
        setAnnouncement(`Selected ${selectedOption?.label}. ${newValues.length} items selected.`)
      }
      
      // Don't close popover in multi-select mode
      setSearchQuery("")
      setSelectedValue("")
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // Single select mode
      field.onChange(value)
      
      // Cache the selected option for display persistence
      if (selectedOption) {
        setSelectedOptionCache(selectedOption)
        setAnnouncement(`Selected ${selectedOption.label}`)
      }
      
      setOpen(false)
      setSearchQuery("")
      setSelectedValue("")
      
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [field, searchResults, setSearchQuery, multiple, maxSelections, preloadOptions])

  // Handle clear
  const handleClear = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    field.onChange(multiple ? [] : "")
    setSelectedOptionCache(null) // Clear cached option
    setAnnouncement("Selection cleared")
    onClear?.()
  }, [field, onClear, multiple])

  // Handle remove single item from multi-select
  const handleRemoveItem = useCallback((valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!multiple) return
    
    const currentValues = Array.isArray(field.value) ? field.value : []
    const newValues = currentValues.filter(v => v !== valueToRemove)
    const removedOption = [...preloadOptions, ...searchResults].find(opt => opt.value === valueToRemove)
    
    field.onChange(newValues)
    setAnnouncement(`Removed ${removedOption?.label}. ${newValues.length} items selected.`)
  }, [field, multiple, preloadOptions, searchResults])

  // Handle create new
  const handleCreateNew = useCallback(async () => {
    setIsCreateOpen(true)
    setAnnouncement("Opening create new dialog")
    try {
      await onCreateNew?.()
      setAnnouncement("Create dialog closed")
      setSearchError(null) // Clear any previous errors on successful creation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create new item'
      setSearchError(errorMessage)
      setAnnouncement(`Error creating new item: ${errorMessage}`)
    } finally {
      setIsCreateOpen(false)
    }
  }, [onCreateNew])

  // Render selected content
  const renderSelectedContent = useCallback(() => {
    if (multiple) {
      if (selectedOptions.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>
      }
      
      return (
        <div className="flex flex-wrap gap-1 max-w-[calc(100%-2rem)]">
          {selectedOptions.slice(0, 3).map(option => (
            <Badge 
              key={option.value} 
              variant="secondary" 
              className="text-xs px-2 py-0.5 flex items-center gap-1"
            >
              <span className="truncate max-w-[100px]">{option.label}</span>
              <button
                type="button"
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                onClick={(e) => handleRemoveItem(option.value, e)}
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedOptions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedOptions.length - 3} more
            </Badge>
          )}
        </div>
      )
    }

    if (!selectedOption) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    if (renderSelected) {
      return renderSelected(selectedOption)
    }

    return (
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{selectedOption.label}</span>
        {selectedOption.badge && (
          <Badge variant={selectedOption.badge.variant || "default"} className="ml-2 text-xs">
            {selectedOption.badge.text}
          </Badge>
        )}
      </div>
    )
  }, [selectedOption, selectedOptions, placeholder, renderSelected, multiple, handleRemoveItem])

  // Handle retry search
  const handleRetrySearch = useCallback(async () => {
    setIsSearchRetrying(true)
    setSearchError(null)
    try {
      await loadInitialResults()
      setAnnouncement("Search retried successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed'
      setSearchError(errorMessage)
      setAnnouncement(`Retry failed: ${errorMessage}`)
    } finally {
      setIsSearchRetrying(false)
    }
  }, [loadInitialResults])

  // Render error state
  const renderErrorState = () => {
    if (!searchError) return null
    
    return (
      <div className="p-3 border-b">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-2">
            <span className="text-sm">{searchError}</span>
            <button
              onClick={handleRetrySearch}
              disabled={isSearchRetrying}
              className="text-xs underline hover:no-underline disabled:opacity-50"
              aria-label="Retry search"
            >
              {isSearchRetrying ? 'Retrying...' : 'Retry'}
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render command content
  const renderCommandContent = () => (
    <Command 
      className="h-full relative" 
      data-slot="command"
      value={selectedValue}
      onValueChange={setSelectedValue}
    >
      {renderErrorState()}
      
      <SearchInput
        ref={inputRef}
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value)
          // Clear error when user starts typing again
          if (searchError && value !== searchQuery) {
            setSearchError(null)
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={searchPlaceholder}
        disabled={disabled}
        isLoading={isLoading || isSearchRetrying}
        name={name}
        label={label}
        hasError={!!searchError}
      />
      
      <OptionList
        options={searchResults}
        groupedOptions={groupedOptions}
        selectedOption={selectedOption}
        selectedOptions={selectedOptions}
        searchQuery={searchQuery}
        isLoading={isLoading || isSearchRetrying}
        searchError={searchError}
        onRetrySearch={handleRetrySearch}
        multiple={multiple}
        onSelect={handleSelect}
        onCreateNew={handleCreateNew}
        loadingText={loadingText}
        noResultsText={noResultsText}
        createNewText={createNewText}
        showCreateWhenEmpty={showCreateWhenEmpty}
        showCreateAlways={showCreateAlways}
        isCreateOpen={isCreateOpen}
        renderOption={renderOption}
        virtualized={searchResults.length >= 50} // Enable virtualization for large lists
      />
    </Command>
  )

  const triggerContent = (
    <div className="flex items-center justify-between w-full">
      {renderSelectedContent()}
      <div className="flex items-center gap-1">
        {clearable && (multiple ? selectedOptions.length > 0 : selectedOption) && (
          <span
            className="inline-flex items-center justify-center h-auto p-1 cursor-pointer hover:bg-accent rounded-sm focus:ring-2 focus:ring-ring focus:ring-offset-1 outline-hidden"
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClear(e as any)
              }
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={multiple ? `Clear all ${selectedOptions.length} selections` : `Clear selection: ${selectedOption?.label}`}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </div>
    </div>
  )

  return (
    <FormErrorBoundary
      onError={(error) => {
        console.error('[DynamicSelectField] Component error:', error)
        setAnnouncement(`Component error: ${error.message}`)
      }}
      fallback={({ error, resetError }) => (
        <FormItem className={className}>
          <FormLabel className="text-sm font-semibold">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="text-sm font-medium">Component Error</div>
              <div className="text-xs text-muted-foreground">
                {error.message || 'The form field encountered an error and cannot be displayed.'}
              </div>
              <button
                onClick={resetError}
                className="inline-flex items-center gap-1 text-xs bg-destructive/10 hover:bg-destructive/20 px-2 py-1 rounded transition-colors"
              >
                Reset Field
              </button>
            </AlertDescription>
          </Alert>
        </FormItem>
      )}
    >
      <FormItem className={className}>
      <FormLabel className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <FormControl>
        {isMobile ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={`${label}. ${multiple ? (selectedOptions.length > 0 ? `Currently selected: ${selectedOptions.length} items` : 'No selections') : (selectedOption ? `Currently selected: ${selectedOption.label}` : 'No selection')}. Press Enter or Space to open selection dialog.`}
                className="h-12 justify-between text-left font-normal focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-hidden"
                disabled={disabled}
              >
                {triggerContent}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>{label}</SheetTitle>
                {description && <SheetDescription>{description}</SheetDescription>}
              </SheetHeader>
              <div className="mt-4 h-full">
                {renderCommandContent()}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={`${label}. ${multiple ? (selectedOptions.length > 0 ? `Currently selected: ${selectedOptions.length} items` : 'No selections') : (selectedOption ? `Currently selected: ${selectedOption.label}` : 'No selection')}. Press Enter or Space to open selection menu.`}
                className="h-12 justify-between text-left font-normal focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-hidden"
                disabled={disabled}
              >
                {triggerContent}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              {renderCommandContent()}
            </PopoverContent>
          </Popover>
        )}
      </FormControl>
      {description && !isMobile && (
        <p className="text-sm text-muted-foreground" id={`${name}-description`}>{description}</p>
      )}
      <FormMessage>{error?.message}</FormMessage>
      
      {/* Form-level error display for critical errors */}
      {searchError && !open && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {searchError}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
      </FormItem>
    </FormErrorBoundary>
  )
}