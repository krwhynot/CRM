/**
 * Advanced Search Panel
 * 
 * Comprehensive search interface for CRM entities with filters, saved searches,
 * and real-time results. Supports global search across all entity types.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Search, Filter, X, Save, Clock, Star } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface SearchFilter {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between'
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
  onSearch: (query: string, filters: SearchFilter[], entityTypes: string[]) => Promise<SearchResult[]>
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
      console.error('Search failed:', error)
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
    setFilters(prev => [...prev, newFilter])
  }, [])

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId))
  }, [])

  // Update filter
  const updateFilter = useCallback((filterId: string, updates: Partial<SearchFilter>) => {
    setFilters(prev => prev.map(f => f.id === filterId ? { ...f, ...updates } : f))
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
  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setQuery(savedSearch.query)
    setFilters(savedSearch.filters)
    setSelectedEntityTypes(savedSearch.entityTypes)
    setActiveTab('search')
    onLoadSearch?.(savedSearch)
  }, [onLoadSearch])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach(result => {
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
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Advanced Search</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Search
          </Button>
          <Button
            variant={activeTab === 'saved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('saved')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Saved Searches ({savedSearches.length})
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'search' ? (
            <div className="h-full flex flex-col">
              {/* Search Input */}
              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10"
                    autoFocus
                  />
                  {loading && (
                    <div className="absolute right-3 top-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>

                {/* Entity Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Search in:</span>
                  <Select
                    value={selectedEntityTypes[0] || 'all'}
                    onValueChange={(value) => setSelectedEntityTypes([value])}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters {filters.length > 0 && `(${filters.length})`}
                  </Button>
                  
                  {onSaveSearch && query.trim() && (
                    <Button variant="outline" size="sm" onClick={saveCurrentSearch}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Search
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {filters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.map(filter => (
                      <Badge key={filter.id} variant="secondary" className="gap-1">
                        {filter.label || filter.field}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Advanced Filters</h3>
                    <Button variant="outline" size="sm" onClick={addFilter}>
                      Add Filter
                    </Button>
                  </div>
                  
                  {filters.map(filter => (
                    <Card key={filter.id}>
                      <CardContent className="p-3 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
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
                            onValueChange={(value) => updateFilter(filter.id, { operator: value as any })}
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
                  <div className="p-4">
                    {query && !loading && results.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No results found for "{query}"
                      </div>
                    )}

                    {Object.entries(groupedResults).map(([type, typeResults]) => (
                      <div key={type} className="mb-6">
                        <h3 className="text-sm font-medium mb-3 capitalize">
                          {type}s ({typeResults.length})
                        </h3>
                        <div className="space-y-2">
                          {typeResults.map(result => (
                            <Card
                              key={result.id}
                              className="cursor-pointer hover:bg-accent transition-colors"
                              onClick={() => onResultSelect(result)}
                            >
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{result.title}</h4>
                                    {result.subtitle && (
                                      <p className="text-sm text-muted-foreground">
                                        {result.subtitle}
                                      </p>
                                    )}
                                    {result.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {result.description}
                                      </p>
                                    )}
                                  </div>
                                  {result.score && (
                                    <Badge variant="outline" className="text-xs">
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
              <div className="p-4 space-y-3">
                {savedSearches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No saved searches yet
                  </div>
                ) : (
                  savedSearches.map(savedSearch => (
                    <Card
                      key={savedSearch.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => loadSavedSearch(savedSearch)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {savedSearch.isStarred && <Star className="h-3 w-3 fill-current" />}
                              {savedSearch.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {savedSearch.query}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
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