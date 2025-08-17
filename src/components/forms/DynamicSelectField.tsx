"use client"

import * as React from "react"
import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useController, Control, FieldValues, Path } from "react-hook-form"
import { Check, ChevronsUpDown, Plus, Loader2, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedValue, setSelectedValue] = useState("")
  const [searchResults, setSearchResults] = useState<SelectOption[]>(preloadOptions)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  
  // Refs for focus management and cleanup
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)
  const renderCountRef = useRef(0)
  
  // Development safety net: Track renders to detect infinite loops
  renderCountRef.current += 1
  if (renderCountRef.current > 100) {
    console.error('🚨 INFINITE LOOP DETECTED: DynamicSelectField has rendered more than 100 times!', {
      component: 'DynamicSelectField',
      renderCount: renderCountRef.current,
      searchQuery,
      searchResultsLength: searchResults.length,
      open,
      isLoading
    })
  }
  
  const isMobile = useMediaQuery("(max-width: 768px)")
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)
  
  // Debug logging for search flow
  console.log("🔍 DynamicSelectField Debug:", {
    searchQuery,
    debouncedSearchQuery,
    searchResultsLength: searchResults.length,
    isLoading,
    preloadOptionsLength: preloadOptions.length,
    open
  })
  
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: required ? `${label} is required` : false },
  })

  // Find selected option
  const selectedOption = useMemo(() => {
    const allOptions = [...preloadOptions, ...searchResults]
    return allOptions.find(option => option.value === field.value) || null
  }, [field.value, preloadOptions, searchResults])

  // Stable references for performSearch dependencies
  const onSearchRef = useRef(onSearch)
  const minSearchLengthRef = useRef(minSearchLength)
  const preloadOptionsRef = useRef(preloadOptions)
  
  // Update refs when props change
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])
  
  useEffect(() => {
    minSearchLengthRef.current = minSearchLength
  }, [minSearchLength])
  
  useEffect(() => {
    preloadOptionsRef.current = preloadOptions
  }, [preloadOptions])

  // Stable search function to prevent infinite loops
  const performSearch = useCallback(async (query: string) => {
    console.log("🔍 performSearch called with:", { query, minSearchLength: minSearchLengthRef.current, isMounted: isMountedRef.current })
    
    if (!isMountedRef.current) return
    
    if (query.length < minSearchLengthRef.current) {
      console.log("🔍 Query too short, using preloadOptions:", preloadOptionsRef.current.length)
      if (isMountedRef.current) {
        // Only set preload options if we have them, don't clear existing results unnecessarily
        if (preloadOptionsRef.current.length > 0) {
          setSearchResults(preloadOptionsRef.current)
        }
        // If no preload options, leave existing results in place
      }
      return
    }

    console.log("🔍 Starting search for query:", query)
    setIsLoading(true)
    
    try {
      const results = await onSearchRef.current(query)
      console.log("🔍 Search completed, results:", { 
        resultsLength: results?.length || 0, 
        results: results?.slice(0, 3) // Log first 3 results for debugging
      })
      
      if (isMountedRef.current) {
        setSearchResults(results)
        console.log("🔍 Updated searchResults state")
      }
    } catch (error) {
      console.error("🔍 Search error:", error)
      if (isMountedRef.current) {
        setSearchResults([])
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
        console.log("🔍 Search loading completed")
      }
    }
  }, []) // Empty dependency array - now truly stable

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }, [])

  // Combined effects for search and lifecycle management
  useEffect(() => {
    // Search when debounced query changes
    if (debouncedSearchQuery !== undefined) {
      performSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, performSearch]) // performSearch is now stable

  useEffect(() => {
    // Load initial results when component opens
    if (open && searchQuery === "") {
      if (preloadOptions.length > 0) {
        // Use preload options if available
        setSearchResults(preloadOptions)
      } else if (searchResults.length === 0) {
        // Only fetch fresh data if we have no results at all
        performSearch("")
      }
      // If we already have search results, keep them to avoid clearing dropdown
    }
  }, [open, searchQuery, preloadOptions, searchResults.length, performSearch]) // performSearch is now stable

  useEffect(() => {
    // Clear announcement after it's been read
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement("")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [announcement])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Create a stable callback that always works with current state
  const updateSearchResults = useCallback((updateFn: (results: SelectOption[]) => SelectOption[]) => {
    setSearchResults(currentResults => {
      const newResults = updateFn(currentResults)
      console.log('🔄 Search results updated via callback:', { 
        oldCount: currentResults.length, 
        newCount: newResults.length 
      })
      return newResults
    })
  }, []) // Empty deps - callback reference never changes (prevents infinite loops)

  // Expose search results update function to parent components
  useEffect(() => {
    if (onSearchResultsUpdate) {
      onSearchResultsUpdate(updateSearchResults)
    }
  }, [onSearchResultsUpdate, updateSearchResults]) // Re-register when parent callback changes

  // Stable reference for search query change callback
  const onSearchQueryChangeRef = useRef(onSearchQueryChange)
  
  useEffect(() => {
    onSearchQueryChangeRef.current = onSearchQueryChange
  }, [onSearchQueryChange])

  // Track search query changes and notify parent
  useEffect(() => {
    if (onSearchQueryChangeRef.current) {
      onSearchQueryChangeRef.current(searchQuery)
    }
  }, [searchQuery]) // Only depend on searchQuery, not the callback

  // Group options if groupBy function is provided
  const groupedOptions = useMemo(() => {
    console.log("🔍 Grouping options:", { 
      searchResultsLength: searchResults.length, 
      hasGroupBy: !!groupBy,
      searchResults: searchResults.slice(0, 2) // Log first 2 for debugging
    })
    
    if (!groupBy) return { "": searchResults }
    
    const grouped = searchResults.reduce((groups, option) => {
      const group = groupBy(option)
      if (!groups[group]) groups[group] = []
      groups[group].push(option)
      return groups
    }, {} as Record<string, SelectOption[]>)
    
    console.log("🔍 Grouped options result:", { 
      groupNames: Object.keys(grouped),
      totalItems: Object.values(grouped).flat().length
    })
    
    return grouped
  }, [searchResults, groupBy])

  // Handle selection
  const handleSelect = useCallback((value: string) => {
    const selectedOption = searchResults.find(option => option.value === value)
    field.onChange(value)
    setOpen(false)
    setSearchQuery("")
    setSelectedValue("") // Reset command selection state
    
    // Announce selection for screen readers
    if (selectedOption) {
      setAnnouncement(`Selected ${selectedOption.label}`)
    }
    
    // Return focus to input for better UX
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [field, searchResults])

  // Handle clear
  const handleClear = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    field.onChange("")
    setAnnouncement("Selection cleared")
    onClear?.()
  }, [field, onClear])

  // Handle create new
  const handleCreateNew = useCallback(async () => {
    setIsCreateOpen(true)
    setAnnouncement("Opening create new dialog")
    try {
      await onCreateNew?.()
      // Refresh search results after creation
      if (searchQuery) {
        await performSearch(searchQuery)
      }
      setAnnouncement("Create dialog closed")
    } catch (error) {
      console.error("Create new error:", error)
      setAnnouncement("Error creating new item")
    } finally {
      setIsCreateOpen(false)
    }
  }, [onCreateNew, searchQuery, performSearch])

  // Render option content
  const renderOptionContent = useCallback((option: SelectOption) => {
    if (renderOption) {
      return renderOption(option)
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span className="font-medium">{option.label}</span>
          {option.description && (
            <span className="text-xs text-muted-foreground">{option.description}</span>
          )}
        </div>
        {option.badge && (
          <Badge variant={option.badge.variant || "default"} className="ml-2 text-xs">
            {option.badge.text}
          </Badge>
        )}
      </div>
    )
  }, [renderOption])

  // Render selected content
  const renderSelectedContent = useCallback(() => {
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
  }, [selectedOption, placeholder, renderSelected])

  // Render command content
  const renderCommandContent = () => (
    <Command 
      className="h-full relative" 
      data-slot="command"
      value={selectedValue}
      onValueChange={setSelectedValue}
    >
      <CommandInput
        ref={inputRef}
        placeholder={searchPlaceholder}
        value={searchQuery}
        onValueChange={setSearchQuery}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="h-9"
        aria-label={`Search ${label.toLowerCase()}`}
        aria-describedby={`${name}-search-help`}
        autoComplete="off"
      />
      {isLoading && (
        <div className="absolute right-3 top-3 z-10">
          <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading search results" />
        </div>
      )}
      <div id={`${name}-search-help`} className="sr-only">
        Type to search for {label.toLowerCase()}. Use arrow keys to navigate results, Enter to select.
      </div>
      <CommandList className="max-h-[300px] overflow-y-auto" data-slot="command-list">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">{loadingText}</span>
          </div>
        ) : (
          <>
            {/* Create new option */}
            {onCreateNew && (showCreateAlways || (showCreateWhenEmpty && searchResults.length === 0)) && (
              <CommandGroup data-slot="command-group">
                <CommandItem
                  onSelect={handleCreateNew}
                  disabled={isCreateOpen}
                  className="flex items-center gap-2 text-primary data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                  aria-label={`${createNewText}. Press Enter to open creation dialog.`}
                  data-slot="command-item"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{createNewText}</span>
                  {isCreateOpen && <Loader2 className="h-4 w-4 animate-spin ml-auto" aria-label="Creating new item" />}
                </CommandItem>
              </CommandGroup>
            )}

            {/* Search results */}
            {Object.entries(groupedOptions).length === 0 || Object.values(groupedOptions).every(group => group.length === 0) ? (
              // No results found - show enhanced empty state with inline quick add
              <div>
                <CommandEmpty data-slot="command-empty">
                  <div className="text-center py-6 px-4">
                    <div className="text-sm text-muted-foreground mb-3">
                      {searchQuery 
                        ? `No results found for "${searchQuery}"`
                        : noResultsText || "No options available"
                      }
                    </div>
                    {onCreateNew && searchQuery && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Create a new organization with this name:
                        </p>
                        <button
                          onClick={handleCreateNew}
                          disabled={isCreateOpen}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          {isCreateOpen ? 'Creating...' : `Create "${searchQuery}"`}
                          {isCreateOpen && <Loader2 className="h-4 w-4 animate-spin" />}
                        </button>
                      </div>
                    )}
                  </div>
                </CommandEmpty>
                
                {/* Alternative: Inline quick add as a command item when no search query */}
                {onCreateNew && !searchQuery && (
                  <CommandGroup data-slot="command-group">
                    <CommandItem
                      onSelect={handleCreateNew}
                      disabled={isCreateOpen}
                      className="flex items-center gap-2 text-primary data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground cursor-pointer"
                      aria-label={`${createNewText}. Press Enter to open creation dialog.`}
                      data-slot="command-item"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>{createNewText}</span>
                      {isCreateOpen && <Loader2 className="h-4 w-4 animate-spin ml-auto" aria-label="Creating new item" />}
                    </CommandItem>
                  </CommandGroup>
                )}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([groupName, options]) => {
                console.log("🔍 Rendering CommandGroup:", { 
                  groupName, 
                  optionsCount: options.length, 
                  firstOption: options[0] 
                })
                return (
                  <CommandGroup key={groupName} heading={groupName || undefined} data-slot="command-group">
                    {options.map((option) => {
                      // Ensure value is a string for cmdk filtering
                      const itemValue = String(option.value)
                      console.log("🔍 Rendering CommandItem:", { 
                        value: itemValue, 
                        label: option.label,
                        selected: selectedOption?.value === option.value
                      })
                      return (
                        <CommandItem
                          key={itemValue}
                          value={itemValue}
                          onSelect={() => handleSelect(option.value)}
                          className="flex items-center gap-2 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                          aria-label={`${option.label}${option.description ? `. ${option.description}` : ''}. ${selectedOption?.value === option.value ? 'Currently selected.' : 'Press Enter to select.'}`}
                          data-slot="command-item"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              selectedOption?.value === option.value ? "opacity-100" : "opacity-0"
                            )}
                            aria-hidden="true"
                          />
                          {renderOptionContent(option)}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )
              })
            )}
          </>
        )}
      </CommandList>
    </Command>
  )

  const triggerContent = (
    <div className="flex items-center justify-between w-full">
      {renderSelectedContent()}
      <div className="flex items-center gap-1">
        {clearable && selectedOption && (
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
            aria-label={`Clear selection: ${selectedOption.label}`}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </div>
    </div>
  )

  return (
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
                aria-label={`${label}. ${selectedOption ? `Currently selected: ${selectedOption.label}` : 'No selection'}. Press Enter or Space to open selection dialog.`}
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
                aria-label={`${label}. ${selectedOption ? `Currently selected: ${selectedOption.label}` : 'No selection'}. Press Enter or Space to open selection menu.`}
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
  )
}