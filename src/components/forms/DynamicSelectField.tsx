"use client"

import * as React from "react"
import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useController, Control, FieldValues, Path } from "react-hook-form"
import { Check, ChevronsUpDown, Search, Plus, Loader2, X } from "lucide-react"
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
}: DynamicSelectFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SelectOption[]>(preloadOptions)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  
  // Refs for focus management and cleanup
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)
  
  const isMobile = useMediaQuery("(max-width: 768px)")
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)
  
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

  // Stable ref for search function to prevent infinite loops
  const performSearchRef = useRef<(query: string) => Promise<void>>()
  
  // Create stable search function
  useEffect(() => {
    performSearchRef.current = async (query: string) => {
      if (!isMountedRef.current) return
      
      if (query.length < minSearchLength) {
        if (isMountedRef.current) {
          setSearchResults(preloadOptions)
        }
        return
      }

      if (isMountedRef.current) {
        setIsLoading(true)
      }
      
      try {
        const results = await onSearch(query)
        if (isMountedRef.current) {
          setSearchResults(results)
        }
      } catch (error) {
        console.error("Search error:", error)
        if (isMountedRef.current) {
          setSearchResults([])
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }
  }, [onSearch, minSearchLength, preloadOptions])

  // Perform search wrapper that uses the ref
  const performSearch = useCallback(async (query: string) => {
    await performSearchRef.current?.(query)
  }, [])

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      performSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, performSearch])

  // Focus management when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      // Focus search input when popover opens
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }, [])

  // Clear announcement after it's been read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement("")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [announcement])

  // Load initial results when component opens
  useEffect(() => {
    if (open && searchQuery === "" && preloadOptions.length === 0) {
      performSearch("")
    }
  }, [open, searchQuery, preloadOptions.length, performSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Group options if groupBy function is provided
  const groupedOptions = useMemo(() => {
    if (!groupBy) return { "": searchResults }
    
    return searchResults.reduce((groups, option) => {
      const group = groupBy(option)
      if (!groups[group]) groups[group] = []
      groups[group].push(option)
      return groups
    }, {} as Record<string, SelectOption[]>)
  }, [searchResults, groupBy])

  // Handle selection
  const handleSelect = useCallback((value: string) => {
    const selectedOption = searchResults.find(option => option.value === value)
    field.onChange(value)
    setOpen(false)
    setSearchQuery("")
    
    // Announce selection for screen readers
    if (selectedOption) {
      setAnnouncement(`Selected ${selectedOption.label}`)
    }
    
    // Return focus to trigger
    setTimeout(() => {
      triggerRef.current?.focus()
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
    <Command shouldFilter={false} className="h-full">
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        <input
          ref={searchInputRef}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={`Search ${label.toLowerCase()}`}
          aria-describedby={`${name}-search-help`}
          autoComplete="off"
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading search results" />}
        <div id={`${name}-search-help`} className="sr-only">
          Type to search for {label.toLowerCase()}. Use arrow keys to navigate results, Enter to select.
        </div>
      </div>
      <CommandList className="max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">{loadingText}</span>
          </div>
        ) : (
          <>
            {/* Create new option */}
            {onCreateNew && (showCreateAlways || (showCreateWhenEmpty && searchResults.length === 0)) && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateNew}
                  disabled={isCreateOpen}
                  className="flex items-center gap-2 text-primary focus:bg-accent focus:text-accent-foreground"
                  aria-label={`${createNewText}. Press Enter to open creation dialog.`}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{createNewText}</span>
                  {isCreateOpen && <Loader2 className="h-4 w-4 animate-spin ml-auto" aria-label="Creating new item" />}
                </CommandItem>
              </CommandGroup>
            )}

            {/* Search results */}
            {Object.entries(groupedOptions).map(([groupName, options]) => (
              <CommandGroup key={groupName} heading={groupName || undefined}>
                {options.length === 0 && !isLoading && (
                  <CommandEmpty>{noResultsText}</CommandEmpty>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2 focus:bg-accent focus:text-accent-foreground"
                    aria-label={`${option.label}${option.description ? `. ${option.description}` : ''}. ${selectedOption?.value === option.value ? 'Currently selected.' : 'Press Enter to select.'}`}
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
                ))}
              </CommandGroup>
            ))}
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
            className="inline-flex items-center justify-center h-auto p-1 cursor-pointer hover:bg-accent rounded-sm focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:outline-none"
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
                className="h-12 justify-between text-left font-normal focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                className="h-12 justify-between text-left font-normal focus:ring-2 focus:ring-ring focus:ring-offset-2"
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