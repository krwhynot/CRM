import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
/**
 * Quick Search Component
 *
 * Lightweight search component for the header/navigation bar.
 * Provides instant search with command palette-style interface.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { debugError } from '@/utils/debug'
import { Button } from '@/components/ui/button'
// Removed unused: import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Search, ArrowRight, Clock } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface QuickSearchResult {
  id: string
  type: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  title: string
  subtitle?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  url?: string
}

interface QuickSearchProps {
  onSearch: (query: string) => Promise<QuickSearchResult[]>
  onResultSelect: (result: QuickSearchResult) => void
  onOpenAdvancedSearch?: () => void
  placeholder?: string
  maxResults?: number
  showRecentSearches?: boolean
  recentSearches?: string[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickSearch({
  onSearch,
  onResultSelect,
  onOpenAdvancedSearch,
  placeholder = 'Search...',
  maxResults = 8,
  showRecentSearches = true,
  recentSearches = [],
  className,
  size = 'md',
}: QuickSearchProps) {
  // State
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QuickSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Size variants
  const sizeClasses = {
    sm: 'h-8 w-64',
    md: 'h-9 w-80',
    lg: 'h-10 w-96',
  }

  // Perform search with debouncing
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const searchResults = await onSearch(searchQuery)
        setResults(searchResults.slice(0, maxResults))
      } catch (error) {
        debugError('Quick search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [onSearch, maxResults]
  )

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: QuickSearchResult) => {
      onResultSelect(result)
      setOpen(false)
      setQuery('')
      setResults([])
    },
    [onResultSelect]
  )

  // Handle recent search selection
  const handleRecentSearchSelect = useCallback(
    (recentQuery: string) => {
      setQuery(recentQuery)
      performSearch(recentQuery)
    },
    [performSearch]
  )

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, QuickSearchResult[]> = {}
    results.forEach((result) => {
      const type = result.type
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(result)
    })
    return groups
  }, [results])

  // Entity type labels
  const entityLabels = {
    organization: 'Organizations',
    contact: 'Contacts',
    product: 'Products',
    opportunity: 'Opportunities',
    interaction: 'Interactions',
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-start text-muted-foreground font-normal',
            sizeClasses[size],
            className
          )}
        >
          <Search className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
          {query || placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className={cn(semanticSpacing.compactX, 'flex items-center border-b')}>
            <Search className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4 shrink-0 opacity-50')} />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder}
              className={cn(
                semanticRadius.default,
                semanticSpacing.compactY,
                semanticTypography.body,
                'flex h-10 w-full bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
            {loading && (
              <div className={`${semanticSpacing.leftGap.xs}`}>
                <div
                  className={cn(
                    semanticRadius.full,
                    'h-4 w-4 animate-spin border-2 border-primary border-t-transparent'
                  )}
                />
              </div>
            )}
          </div>

          <CommandList className="max-h-[300px]">
            {!query && showRecentSearches && recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.slice(0, 5).map((recentQuery, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleRecentSearchSelect(recentQuery)}
                    className={cn(semanticSpacing.gap.xs, 'flex items-center')}
                  >
                    <Clock className="size-4 text-muted-foreground" />
                    <span>{recentQuery}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query && results.length === 0 && !loading && (
              <CommandEmpty>
                <div className={cn(semanticSpacing.cardY, 'text-center')}>
                  <p
                    className={cn(
                      semanticTypography.body,
                      semanticSpacing.bottomGap.xs,
                      'text-muted-foreground'
                    )}
                  >
                    No results found for "{query}"
                  </p>
                  {onOpenAdvancedSearch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpenAdvancedSearch()
                        setOpen(false)
                      }}
                    >
                      Try Advanced Search
                      <ArrowRight className="ml-1 size-3" />
                    </Button>
                  )}
                </div>
              </CommandEmpty>
            )}

            {Object.entries(groupedResults).map(([type, typeResults]) => (
              <CommandGroup key={type} heading={entityLabels[type as keyof typeof entityLabels]}>
                {typeResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultSelect(result)}
                    className={cn(semanticSpacing.compactY, 'flex items-center justify-between')}
                  >
                    <div className={cn(semanticSpacing.gap.sm, 'flex items-center flex-1 min-w-0')}>
                      {result.icon && (
                        <result.icon className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={cn(semanticTypography.label, 'truncate')}>
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div
                            className={cn(
                              semanticTypography.body,
                              'text-muted-foreground truncate'
                            )}
                          >
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        semanticTypography.caption,
                        semanticSpacing.leftGap.xs,
                        'shrink-0'
                      )}
                    >
                      {type}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            {query && results.length > 0 && onOpenAdvancedSearch && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onOpenAdvancedSearch()
                    setOpen(false)
                  }}
                  className={cn(
                    semanticSpacing.compactY,
                    semanticTypography.body,
                    'flex items-center justify-center text-primary'
                  )}
                >
                  <Search className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                  View all results in Advanced Search
                  <ArrowRight className="ml-1 size-3" />
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// =============================================================================
// KEYBOARD SHORTCUT TRIGGER
// =============================================================================

interface QuickSearchTriggerProps {
  onTrigger: () => void
  shortcut?: string
  className?: string
}

export function QuickSearchTrigger({
  onTrigger,
  shortcut = 'Ctrl+K',
  className,
}: QuickSearchTriggerProps) {
  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onTrigger()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onTrigger])

  return (
    <Button
      variant="outline"
      onClick={onTrigger}
      className={cn('justify-between text-muted-foreground font-normal w-64', className)}
    >
      <div className="flex items-center">
        <Search className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
        Search...
      </div>
      <kbd
        className={cn(
          semanticSpacing.gap.xs,
          semanticRadius.small,
          semanticTypography.label,
          'pointer-events-none h-5 select-none items-center border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground opacity-100 inline-flex'
        )}
      >
        {shortcut}
      </kbd>
    </Button>
  )
}

// =============================================================================
// SEARCH RESULT FORMATTERS
// =============================================================================

/**
 * Helper functions to format search results for different entity types
 */
export const formatSearchResult = {
  organization: (org: any): QuickSearchResult => ({
    id: org.id,
    type: 'organization',
    title: org.name,
    subtitle: org.type,
    description: org.location,
    url: `/organizations/${org.id}`,
  }),

  contact: (contact: any): QuickSearchResult => ({
    id: contact.id,
    type: 'contact',
    title: contact.name,
    subtitle: contact.email,
    description: contact.organization_name,
    url: `/contacts/${contact.id}`,
  }),

  product: (product: any): QuickSearchResult => ({
    id: product.id,
    type: 'product',
    title: product.name,
    subtitle: product.category,
    description: product.description,
    url: `/products/${product.id}`,
  }),

  opportunity: (opportunity: any): QuickSearchResult => ({
    id: opportunity.id,
    type: 'opportunity',
    title: opportunity.title,
    subtitle: `$${opportunity.value?.toLocaleString()} • ${opportunity.stage}`,
    description: opportunity.organization_name,
    url: `/opportunities/${opportunity.id}`,
  }),

  interaction: (interaction: any): QuickSearchResult => ({
    id: interaction.id,
    type: 'interaction',
    title: interaction.subject || interaction.type,
    subtitle: new Date(interaction.date).toLocaleDateString(),
    description: interaction.organization_name,
    url: `/interactions/${interaction.id}`,
  }),
}
