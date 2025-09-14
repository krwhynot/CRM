import {
  semanticShadows,
  semanticSpacing,
  semanticTypography,
  semanticRadius,
} from '@/styles/tokens'
/**
 * Advanced Search Panel
 *
 * Comprehensive search interface for CRM entities with filters, saved searches,
 * and real-time results. Supports global search across all entity types.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { debugError } from '@/utils/debug'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// Removed unused: import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Search, Filter, X, Save, Clock, Star } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface SearchFilter {
  id: string
  field: string
  operator:
    | 'equals'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'greater_than'
    | 'less_than'
    | 'between'
  value: string | string[] | number | number[]
  label: string
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilter[]
  entityTypes: string[]
  createdAt: Date
  isStarred?: boolean
}

export interface SearchResult {
  id: string
  type: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  title: string
  subtitle?: string
  description?: string
  metadata?: Record<string, string>
  score?: number
}

interface AdvancedSearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (
    query: string,
    filters: SearchFilter[],
    entityTypes: string[]
  ) => Promise<SearchResult[]>
  onResultSelect: (result: SearchResult) => void
  savedSearches?: SavedSearch[]
  onSaveSearch?: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void
  onLoadSearch?: (search: SavedSearch) => void
  placeholder?: string
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AdvancedSearchPanel({
  open,
  onOpenChange,
  onSearch,
  onResultSelect,
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
  placeholder = 'Search across all CRM data...',
  className,
}: AdvancedSearchPanelProps) {
  // State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(['all'])
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')

  // Entity types
  const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'organization', label: 'Organizations' },
    { value: 'contact', label: 'Contacts' },
    { value: 'product', label: 'Products' },
    { value: 'opportunity', label: 'Opportunities' },
    { value: 'interaction', label: 'Interactions' },
  ]

  // Available filter fields by entity type
  const filterFields = {
    organization: [
      { value: 'name', label: 'Organization Name' },
      { value: 'type', label: 'Type' },
      { value: 'industry', label: 'Industry' },
      { value: 'location', label: 'Location' },
    ],
    contact: [
      { value: 'name', label: 'Contact Name' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'role', label: 'Role' },
    ],
    product: [
      { value: 'name', label: 'Product Name' },
      { value: 'category', label: 'Category' },
      { value: 'price', label: 'Price' },
      { value: 'status', label: 'Status' },
    ],
    opportunity: [
      { value: 'title', label: 'Opportunity Title' },
      { value: 'value', label: 'Value' },
      { value: 'stage', label: 'Stage' },
      { value: 'probability', label: 'Probability' },
    ],
    interaction: [
      { value: 'type', label: 'Interaction Type' },
      { value: 'date', label: 'Date' },
      { value: 'subject', label: 'Subject' },
    ],
  }

  // Perform search
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchResults = await onSearch(query, filters, selectedEntityTypes)
      setResults(searchResults)
    } catch (error) {
      debugError('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, filters, selectedEntityTypes, onSearch])

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(performSearch, 300)
    return () => clearTimeout(timer)
  }, [performSearch])

  // Add filter
  const addFilter = useCallback(() => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'contains',
      value: '',
      label: '',
    }
    setFilters((prev) => [...prev, newFilter])
  }, [])

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId))
  }, [])

  // Update filter
  const updateFilter = useCallback((filterId: string, updates: Partial<SearchFilter>) => {
    setFilters((prev) => prev.map((f) => (f.id === filterId ? { ...f, ...updates } : f)))
  }, [])

  // Save current search
  const saveCurrentSearch = useCallback(() => {
    if (!onSaveSearch || !query.trim()) return

    const name = prompt('Enter a name for this search:')
    if (!name) return

    onSaveSearch({
      name,
      query,
      filters,
      entityTypes: selectedEntityTypes,
    })
  }, [onSaveSearch, query, filters, selectedEntityTypes])

  // Load saved search
  const loadSavedSearch = useCallback(
    (savedSearch: SavedSearch) => {
      setQuery(savedSearch.query)
      setFilters(savedSearch.filters)
      setSelectedEntityTypes(savedSearch.entityTypes)
      setActiveTab('search')
      onLoadSearch?.(savedSearch)
    },
    [onLoadSearch]
  )

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = []
      }
      groups[result.type].push(result)
    })
    return groups
  }, [results])

  if (!open) return null

  return (
    <div className={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)}>
      <div
        className={cn(
          semanticShadows.extra,
          'fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            semanticSpacing.cardContainer,
            'flex items-center justify-between border-b'
          )}
        >
          <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
            <Search className="size-5" />
            <h2 className={cn(semanticTypography.h4, semanticTypography.h4)}>Advanced Search</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className={cn(
              semanticRadius.none,
              'border-b-2 border-transparent data-[state=active]:border-primary'
            )}
          >
            Search
          </Button>
          <Button
            variant={activeTab === 'saved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('saved')}
            className={cn(
              semanticRadius.none,
              'border-b-2 border-transparent data-[state=active]:border-primary'
            )}
          >
            Saved Searches ({savedSearches.length})
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'search' ? (
            <div className="flex h-full flex-col">
              {/* Search Input */}
              <div className={cn(semanticSpacing.cardContainer, semanticSpacing.stack.md)}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10"
                    autoFocus
                  />
                  {loading && (
                    <div className="absolute right-3 top-3">
                      <div
                        className={cn(
                          semanticRadius.full,
                          'h-4 w-4 animate-spin border-2 border-primary border-t-transparent'
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Entity Type Filter */}
                <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
                  <span className={cn(semanticTypography.body, semanticTypography.label)}>
                    Search in:
                  </span>
                  <Select
                    value={selectedEntityTypes[0] || 'all'}
                    onValueChange={(value) => setSelectedEntityTypes([value])}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                    Filters {filters.length > 0 && `(${filters.length})`}
                  </Button>

                  {onSaveSearch && query.trim() && (
                    <Button variant="outline" size="sm" onClick={saveCurrentSearch}>
                      <Save className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                      Save Search
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {filters.length > 0 && (
                  <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
                    {filters.map((filter) => (
                      <Badge
                        key={filter.id}
                        variant="secondary"
                        className={`${semanticSpacing.gap.xs}`}
                      >
                        {filter.label || filter.field}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div
                  className={cn(
                    semanticSpacing.cardContainer,
                    semanticSpacing.stack.md,
                    'border-t'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={cn(semanticTypography.body, semanticTypography.label)}>
                      Advanced Filters
                    </h3>
                    <Button variant="outline" size="sm" onClick={addFilter}>
                      Add Filter
                    </Button>
                  </div>

                  {filters.map((filter) => (
                    <Card key={filter.id}>
                      <CardContent
                        className={cn(semanticSpacing.compact, semanticSpacing.stack.xs)}
                      >
                        <div className={cn(semanticSpacing.gap.xs, 'grid grid-cols-3')}>
                          <Select
                            value={filter.field}
                            onValueChange={(value) => updateFilter(filter.id, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Add fields based on selected entity types */}
                            </SelectContent>
                          </Select>

                          <Select
                            value={filter.operator}
                            onValueChange={(value) =>
                              updateFilter(filter.id, { operator: value as any })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="starts_with">Starts with</SelectItem>
                              <SelectItem value="ends_with">Ends with</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={filter.value as string}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            placeholder="Value"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFilter(filter.id)}
                          className="w-full"
                        >
                          Remove Filter
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className={`${semanticSpacing.cardContainer}`}>
                    {query && !loading && results.length === 0 && (
                      <div
                        className={cn(semanticSpacing.pageY, 'text-center text-muted-foreground')}
                      >
                        No results found for "{query}"
                      </div>
                    )}

                    {Object.entries(groupedResults).map(([type, typeResults]) => (
                      <div key={type} className={`${semanticSpacing.bottomGap.md}`}>
                        <h3
                          className={cn(
                            semanticTypography.body,
                            semanticTypography.label,
                            'mb-3 capitalize'
                          )}
                        >
                          {type}s ({typeResults.length})
                        </h3>
                        <div className={`${semanticSpacing.stack.xs}`}>
                          {typeResults.map((result) => (
                            <Card
                              key={result.id}
                              className="cursor-pointer transition-colors hover:bg-accent"
                              onClick={() => onResultSelect(result)}
                            >
                              <CardContent className={`${semanticSpacing.compact}`}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className={`${semanticTypography.label}`}>
                                      {result.title}
                                    </h4>
                                    {result.subtitle && (
                                      <p
                                        className={cn(
                                          semanticTypography.body,
                                          'text-muted-foreground'
                                        )}
                                      >
                                        {result.subtitle}
                                      </p>
                                    )}
                                    {result.description && (
                                      <p
                                        className={cn(
                                          semanticTypography.caption,
                                          'text-muted-foreground mt-1'
                                        )}
                                      >
                                        {result.description}
                                      </p>
                                    )}
                                  </div>
                                  {result.score && (
                                    <Badge
                                      variant="outline"
                                      className={`${semanticTypography.caption}`}
                                    >
                                      {Math.round(result.score * 100)}%
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            // Saved Searches Tab
            <ScrollArea className="h-full">
              <div className={cn(semanticSpacing.cardContainer, semanticSpacing.stack.sm)}>
                {savedSearches.length === 0 ? (
                  <div className={cn(semanticSpacing.pageY, 'text-center text-muted-foreground')}>
                    No saved searches yet
                  </div>
                ) : (
                  savedSearches.map((savedSearch) => (
                    <Card
                      key={savedSearch.id}
                      className="cursor-pointer transition-colors hover:bg-accent"
                      onClick={() => loadSavedSearch(savedSearch)}
                    >
                      <CardContent className={`${semanticSpacing.compact}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={cn(
                                semanticTypography.label,
                                semanticSpacing.gap.xs,
                                'flex items-center'
                              )}
                            >
                              {savedSearch.isStarred && <Star className="size-3 fill-current" />}
                              {savedSearch.name}
                            </h4>
                            <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                              {savedSearch.query}
                            </p>
                            <div
                              className={cn(
                                semanticSpacing.gap.xs,
                                semanticSpacing.topGap.xs,
                                'flex items-center'
                              )}
                            >
                              <Clock className="size-3 text-muted-foreground" />
                              <span
                                className={cn(semanticTypography.caption, 'text-muted-foreground')}
                              >
                                {savedSearch.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
