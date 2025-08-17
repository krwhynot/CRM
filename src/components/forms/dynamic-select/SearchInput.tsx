import * as React from "react"
import { forwardRef } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommandInput } from "@/components/ui/command"
import type { SearchInputProps } from "./types"

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onKeyDown, placeholder, disabled, isLoading, name, label, hasError = false }, ref) => {
    return (
      <>
        <CommandInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onValueChange={onChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className={cn(
            "h-9",
            hasError && "border-destructive focus:ring-destructive"
          )}
          aria-label={`Search ${label.toLowerCase()}${hasError ? '. Error state' : ''}`}
          aria-describedby={`${name}-search-help ${hasError ? `${name}-search-error` : ''}`}
          aria-invalid={hasError}
          autoComplete="off"
        />
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
          {hasError && (
            <AlertCircle 
              className="h-4 w-4 text-destructive" 
              aria-label="Search error" 
            />
          )}
          {isLoading && (
            <Loader2 
              className="h-4 w-4 animate-spin text-muted-foreground" 
              aria-label="Loading search results" 
            />
          )}
        </div>
        <div id={`${name}-search-help`} className="sr-only">
          Type to search for {label.toLowerCase()}. Use arrow keys to navigate results, Enter to select.
        </div>
        {hasError && (
          <div id={`${name}-search-error`} className="sr-only" role="alert">
            Search encountered an error. Please check your connection and try again.
          </div>
        )}
      </>
    )
  }
)

SearchInput.displayName = "SearchInput"