import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticColors,
  semanticShadows,
  semanticRadius,
  semanticTypography
} from '@/styles/tokens'
import { useTemplate } from '../hooks/useTemplates'
import { useTemplateRatings, useTemplateRatingStats } from '../hooks/useTemplateRatings'
import type { TemplateWithMetadata } from '../types/template.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Star,
  Users,
  Globe,
  Lock,
  Eye,
  Fork,
  Download,
  Share,
  Calendar,
  TrendingUp,
  User,
  Code,
  History,
  MessageSquare,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface TemplateDetailsModalProps {
  /** Template to display details for */
  template: TemplateWithMetadata
  /** Whether the modal is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Whether to show action buttons */
  showActions?: boolean
}

/**
 * TemplateDetailsModal - Detailed view of a layout template
 *
 * Displays comprehensive template information including:
 * - Basic template metadata and description
 * - Version history and changelog
 * - Ratings and reviews
 * - Usage analytics and statistics
 * - Template configuration preview
 */
export function TemplateDetailsModal({
  template,
  open,
  onOpenChange,
  showActions = true,
}: TemplateDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Data hooks
  const { data: templateDetails } = useTemplate(template.id)
  const { data: ratings } = useTemplateRatings(template.id)
  const { data: ratingStats } = useTemplateRatingStats(template.id)

  const displayTemplate = templateDetails || template

  // Computed values
  const visibilityIcon = {
    private: <Lock className="size-4" />,
    organization: <Users className="size-4" />,
    public: <Globe className="size-4" />,
  }[displayTemplate.visibility]

  const categoryColor = {
    system: 'bg-blue-100 text-blue-800',
    community: 'bg-green-100 text-green-800',
    organization: 'bg-purple-100 text-purple-800',
    personal: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-gray-100 text-gray-800',
  }[displayTemplate.category]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <span>{displayTemplate.name}</span>
                {displayTemplate.is_default && (
                  <Badge variant="outline">Default</Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center space-x-4">
                <Badge className={categoryColor}>{displayTemplate.category}</Badge>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  {visibilityIcon}
                  <span className="capitalize">{displayTemplate.visibility}</span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <User className="size-4" />
                  <span>{displayTemplate.creator_name}</span>
                </div>
              </DialogDescription>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Fork className="mr-2 size-4" />
                  Fork
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="mr-2 size-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 size-4" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1">
            <TabsContent value="overview" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Description */}
                  {displayTemplate.description && (
                    <div>
                      <h3 className={semanticTypography.h3}>Description</h3>
                      <p className={cn(semanticTypography.body, 'mt-2 text-muted-foreground')}>
                        {displayTemplate.description}
                      </p>
                    </div>
                  )}

                  {/* Statistics */}
                  <div>
                    <h3 className={cn(semanticTypography.h3, 'mb-4')}>Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg border p-4 text-center">
                        <div className="mb-2 flex items-center justify-center">
                          <Star className="size-5 text-yellow-400" />
                        </div>
                        <div className={semanticTypography.h3}>
                          {displayTemplate.rating_average.toFixed(1)}
                        </div>
                        <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          Average Rating
                        </div>
                        <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          ({displayTemplate.rating_count} reviews)
                        </div>
                      </div>

                      <div className="rounded-lg border p-4 text-center">
                        <div className="mb-2 flex items-center justify-center">
                          <Eye className="size-5 text-blue-500" />
                        </div>
                        <div className={semanticTypography.h3}>
                          {displayTemplate.usage_count}
                        </div>
                        <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          Total Uses
                        </div>
                      </div>

                      <div className="rounded-lg border p-4 text-center">
                        <div className="mb-2 flex items-center justify-center">
                          <Fork className="size-5 text-green-500" />
                        </div>
                        <div className={semanticTypography.h3}>
                          {displayTemplate.version_count}
                        </div>
                        <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          Versions
                        </div>
                      </div>

                      <div className="rounded-lg border p-4 text-center">
                        <div className="mb-2 flex items-center justify-center">
                          <Calendar className="size-5 text-purple-500" />
                        </div>
                        <div className={cn(semanticTypography.body, 'text-sm')}>
                          {formatDistanceToNow(new Date(displayTemplate.updated_at), { addSuffix: true })}
                        </div>
                        <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          Last Updated
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  {ratingStats && ratingStats.total > 0 && (
                    <div>
                      <h3 className={cn(semanticTypography.h3, 'mb-4')}>Rating Distribution</h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = ratingStats.distribution[rating as 1 | 2 | 3 | 4 | 5]
                          const percentage = (count / ratingStats.total) * 100

                          return (
                            <div key={rating} className="flex items-center space-x-2">
                              <span className="w-4 text-sm">{rating}</span>
                              <Star className="size-4 fill-yellow-400 text-yellow-400" />
                              <div className="h-2 flex-1 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-yellow-400 transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 text-sm text-muted-foreground">
                                {count}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Template Metadata */}
                  <div>
                    <h3 className={cn(semanticTypography.h3, 'mb-4')}>Details</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Entity Type:</span>
                        <span className="ml-2 capitalize">{displayTemplate.entity_type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2 capitalize">{displayTemplate.category}</span>
                      </div>
                      <div>
                        <span className="font-medium">Visibility:</span>
                        <span className="ml-2 capitalize">{displayTemplate.visibility}</span>
                      </div>
                      <div>
                        <span className="font-medium">Current Version:</span>
                        <span className="ml-2">{displayTemplate.current_version?.version_number || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">
                          {formatDistanceToNow(new Date(displayTemplate.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span>
                        <span className="ml-2">
                          {formatDistanceToNow(new Date(displayTemplate.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="versions" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <h3 className={semanticTypography.h3}>Version History</h3>
                  {displayTemplate.template_versions?.length ? (
                    <div className="space-y-3">
                      {displayTemplate.template_versions
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((version) => (
                          <div
                            key={version.id}
                            className={cn(
                              'p-4 border rounded-lg',
                              version.is_current && 'border-blue-500 bg-blue-50'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={semanticTypography.label}>
                                    v{version.version_number}
                                  </span>
                                  {version.is_current && (
                                    <Badge variant="outline" className="text-xs">Current</Badge>
                                  )}
                                  {version.version_name && (
                                    <span className={cn(semanticTypography.body, 'text-muted-foreground')}>
                                      - {version.version_name}
                                    </span>
                                  )}
                                </div>
                                {version.changelog && (
                                  <p className={cn(semanticTypography.caption, 'text-muted-foreground mt-1')}>
                                    {version.changelog}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                                  {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className={cn(semanticTypography.body, 'text-muted-foreground text-center py-8')}>
                      No version history available
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="reviews" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <h3 className={semanticTypography.h3}>Reviews & Ratings</h3>
                  {ratings && ratings.length > 0 ? (
                    <div className="space-y-4">
                      {ratings.map((rating) => (
                        <div key={rating.id} className="rounded-lg border p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={semanticTypography.label}>
                                {(rating as any).user_name}
                              </span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'h-4 w-4',
                                      star <= rating.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                              {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {rating.review && (
                            <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                              {rating.review}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={cn(semanticTypography.body, 'text-muted-foreground text-center py-8')}>
                      No reviews yet. Be the first to rate this template!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="config" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <h3 className={semanticTypography.h3}>Configuration Preview</h3>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <pre className={cn(semanticTypography.caption, 'whitespace-pre-wrap')}>
                      {JSON.stringify(displayTemplate.layout_config, null, 2)}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}