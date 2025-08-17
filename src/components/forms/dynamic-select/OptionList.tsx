import * as React from "react"
import { useRef } from "react"
import { Check, Plus, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useConditionalVirtualization } from "./hooks/useConditionalVirtualization"
import type { OptionListProps, SelectOption } from "./types"

export function OptionList({
  options,
  groupedOptions,
  selectedOption,
  selectedOptions,
  searchQuery,
  isLoading,
  searchError,
  onRetrySearch,
  multiple,
  onSelect,
  onCreateNew,
  loadingText,
  noResultsText,
  createNewText,
  showCreateWhenEmpty,
  showCreateAlways,
  isCreateOpen,
  renderOption,
  virtualized = false,
}: OptionListProps) {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  
  // Calculate total item count for virtualization
  const totalItemCount = Object.values(groupedOptions).reduce((acc, group) => acc + group.length, 0)
  
  // Conditional virtualization setup
  const {
    shouldVirtualize,
  } = useConditionalVirtualization({
    itemCount: totalItemCount,
    enabled: virtualized,
    getScrollElement: () => scrollElementRef.current,
  })

  // Render option content
  const renderOptionContent = React.useCallback((option: SelectOption) => {
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

  // Render create new option
  const renderCreateNewOption = () => {
    if (!onCreateNew || (!showCreateAlways && !(showCreateWhenEmpty && options.length === 0))) {
      return null
    }

    return (
      <CommandGroup data-slot="command-group">
        <CommandItem
          onSelect={onCreateNew}
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
    )
  }

  // Render enhanced loading state with skeletons
  const renderLoadingState = () => (
    <div className="space-y-2 p-3">
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{loadingText}</span>
      </div>
      {/* Skeleton items */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-2">
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  )

  // Render error state
  const renderErrorState = () => {
    if (!searchError) return null
    
    return (
      <div className="p-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="text-sm">{searchError}</div>
            {onRetrySearch && (
              <button
                onClick={onRetrySearch}
                className="inline-flex items-center gap-2 text-xs bg-destructive/10 hover:bg-destructive/20 px-2 py-1 rounded transition-colors"
                aria-label="Retry search"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render enhanced empty state
  const renderEmptyState = () => (
    <div>
      <CommandEmpty data-slot="command-empty">
        <div className="text-center py-8 px-4">
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <div className="text-sm font-medium text-foreground mb-2">
            {searchQuery 
              ? `No results for "${searchQuery}"`
              : "No options available"
            }
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search terms or create a new item"
              : "Get started by creating your first item"
            }
          </div>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              disabled={isCreateOpen}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={searchQuery ? `Create "${searchQuery}"` : createNewText}
            >
              <Plus className="h-4 w-4" />
              {isCreateOpen ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                searchQuery ? `Create "${searchQuery}"` : createNewText
              )}
            </button>
          )}
        </div>
      </CommandEmpty>
    </div>
  )

  // Render non-virtualized options
  const renderStandardOptions = () => (
    Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
      <CommandGroup key={groupName} heading={groupName || undefined} data-slot="command-group">
        {groupOptions.map((option) => {
          const itemValue = String(option.value)
          const isSelected = multiple 
            ? selectedOptions.some(selected => selected.value === option.value)
            : selectedOption?.value === option.value
          
          return (
            <CommandItem
              key={itemValue}
              value={itemValue}
              onSelect={() => onSelect(option.value)}
              className={cn(
                "flex items-center gap-2 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                multiple && isSelected && "bg-accent/50"
              )}
              style={{ height: 'var(--dynamic-select-option-height, 40px)' }}
              aria-label={`${option.label}${option.description ? `. ${option.description}` : ''}. ${isSelected ? (multiple ? 'Currently selected. Press Enter to deselect.' : 'Currently selected.') : 'Press Enter to select.'}`}
              data-slot="command-item"
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              {renderOptionContent(option)}
            </CommandItem>
          )
        })}
      </CommandGroup>
    ))
  )

  // For now, we'll use standard rendering. Virtualization can be added later with React.lazy
  const renderVirtualizedOptions = () => {
    // Note: Virtualization is disabled in this version to avoid complex JSX in build
    // Future enhancement: Implement as a separate lazy-loaded component
    if (shouldVirtualize) {
      console.info('[DynamicSelect] Virtualization available but using standard rendering for stability')
    }
    return renderStandardOptions()
  }

  return (
    <CommandList 
      ref={scrollElementRef}
      className="max-h-[var(--dynamic-select-max-height,300px)] overflow-y-auto" 
      data-slot="command-list"
    >
      {/* Error state */}
      {renderErrorState()}
      
      {/* Loading state */}
      {isLoading ? (
        renderLoadingState()
      ) : (
        <>
          {/* Create new option */}
          {renderCreateNewOption()}

          {/* Search results */}
          {Object.entries(groupedOptions).length === 0 || Object.values(groupedOptions).every(group => group.length === 0) ? 
            renderEmptyState() : 
            (shouldVirtualize ? renderVirtualizedOptions() : renderStandardOptions())
          }
        </>
      )}
    </CommandList>
  )
}