import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticColors,
  semanticShadows,
  semanticRadius,
  semanticTypography
} from '@/styles/tokens'
import { useTemplates, useTrackTemplateUsage } from '../hooks/useTemplates'
import { useTemplateRatings } from '../hooks/useTemplateRatings'
import type {
  TemplateGalleryFilters,
  TemplateWithMetadata,
  TemplateCategory,
  TemplateVisibility,
  TemplateSortBy,
} from '../types/template.types'
import type { LayoutEntityType } from '@/types/layout/schema.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Star,
  StarIcon,
  Eye,
  Download,
  Fork,
  Share,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Users,
  Globe,
  Lock,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { TemplatePreviewCard } from './TemplatePreviewCard'
import { TemplateDetailsModal } from './TemplateDetailsModal'

export interface TemplateGalleryProps {
  /** Entity type to filter templates by */
  entityType?: LayoutEntityType
  /** Initial category filter */
  initialCategory?: TemplateCategory
  /** Whether to show only public templates */
  publicOnly?: boolean
  /** Callback when a template is selected */
  onTemplateSelect?: (template: TemplateWithMetadata) => void
  /** Whether to show template selection actions */
  showActions?: boolean
  /** Custom CSS classes */
  className?: string
}

/**
 * TemplateGallery - Browse and manage layout templates
 *
 * Provides a comprehensive interface for:
 * - Browsing templates with filtering and search
 * - Categorization and sorting options
 * - Template preview and details
 * - Actions like fork, rate, and share
 * - Responsive grid/list view modes
 *
 * @example
 * <TemplateGallery
 *   entityType="organizations"
 *   onTemplateSelect={handleTemplateSelect}
 *   showActions={true}
 * />
 */
export function TemplateGallery({
  entityType,
  initialCategory = 'custom',
  publicOnly = false,
  onTemplateSelect,
  showActions = true,
  className,
}: TemplateGalleryProps) {
  // Filter and view state
  const [filters, setFilters] = useState<TemplateGalleryFilters>({
    entityType,
    category: initialCategory,
    visibility: publicOnly ? 'public' : undefined,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithMetadata | null>(null)

  // Data hooks
  const { data: templatesData, isLoading, error } = useTemplates(filters)
  const trackUsage = useTrackTemplateUsage()

  const templates = templatesData?.templates || []
  const totalTemplates = templatesData?.total || 0

  // Filter options
  const entityTypes: LayoutEntityType[] = [
    'organizations',
    'contacts',
    'opportunities',
    'products',
    'interactions',
  ]

  const categories: TemplateCategory[] = [
    'system',
    'community',
    'organization',
    'personal',
    'custom',
  ]

  const sortOptions: { value: TemplateSortBy; label: string }[] = [
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'created_at', label: 'Recently Created' },
    { value: 'name', label: 'Name' },
    { value: 'rating_average', label: 'Rating' },
    { value: 'usage_count', label: 'Popularity' },
    { value: 'rating_count', label: 'Most Reviewed' },
  ]

  // Filter handlers
  const updateFilters = useCallback((updates: Partial<TemplateGalleryFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSearch = useCallback((query: string) => {
    updateFilters({ search: query || undefined })
  }, [updateFilters])

  const handleTemplateClick = useCallback((template: TemplateWithMetadata) => {
    setSelectedTemplate(template)
    trackUsage.mutate({ templateId: template.id, action: 'view' })
    onTemplateSelect?.(template)
  }, [onTemplateSelect, trackUsage])

  // Memoized filtered data (for client-side enhancements)
  const displayTemplates = useMemo(() => {
    return templates
  }, [templates])

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className={cn(semanticTypography.body, 'text-red-600')}>
          Error loading templates: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header and Filters */}
      <div className={cn(
        semanticSpacing.cardContainer,
        'border-b space-y-4'
      )}>
        {/* Main header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={semanticTypography.sectionTitle}>Template Gallery</h2>
            <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>
              {totalTemplates} template{totalTemplates !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center rounded-md border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="size-4" />
              </Button>
            </div>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {filters.sortOrder === 'asc' ? <SortAsc className="mr-2 size-4" /> : <SortDesc className="mr-2 size-4" />}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => updateFilters({ sortBy: option.value })}
                    className={filters.sortBy === option.value ? 'bg-accent' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => updateFilters({
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  {filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and filters row */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Entity type filter */}
          {!entityType && (
            <Select
              value={filters.entityType || ''}
              onValueChange={(value) => updateFilters({ entityType: value as LayoutEntityType || undefined })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Category filter */}
          <Select
            value={filters.category || ''}
            onValueChange={(value) => updateFilters({ category: value as TemplateCategory || undefined })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Visibility filter */}
          {!publicOnly && (
            <Select
              value={filters.visibility || ''}
              onValueChange={(value) => updateFilters({ visibility: value as TemplateVisibility || undefined })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Templates</SelectItem>
                <SelectItem value="private">
                  <Lock className="mr-2 size-4" />
                  Private
                </SelectItem>
                <SelectItem value="organization">
                  <Users className="mr-2 size-4" />
                  Organization
                </SelectItem>
                <SelectItem value="public">
                  <Globe className="mr-2 size-4" />
                  Public
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Rating filter */}
          <Select
            value={filters.minRating?.toString() || ''}
            onValueChange={(value) => updateFilters({ minRating: value ? Number(value) : undefined })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template Grid/List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-3 w-1/2 rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayTemplates.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Search className="mb-4 size-12 text-muted-foreground" />
            <h3 className={semanticTypography.h3}>No templates found</h3>
            <p className={cn(semanticTypography.caption, 'text-muted-foreground max-w-md')}>
              Try adjusting your filters or search terms to find more templates.
            </p>
          </div>
        ) : (
          <div className={cn(
            semanticSpacing.cardContainer,
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {displayTemplates.map((template) => (
              <TemplatePreviewCard
                key={template.id}
                template={template}
                viewMode={viewMode}
                showActions={showActions}
                onClick={() => handleTemplateClick(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <TemplateDetailsModal
          template={selectedTemplate}
          open={!!selectedTemplate}
          onOpenChange={(open) => !open && setSelectedTemplate(null)}
          showActions={showActions}
        />
      )}
    </div>
  )
}