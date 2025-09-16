import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticColors,
  semanticShadows,
  semanticRadius,
  semanticTypography
} from '@/styles/tokens'
import { useForkTemplate, useTrackTemplateUsage } from '../hooks/useTemplates'
import { useRateTemplate, useUserTemplateRating } from '../hooks/useTemplateRatings'
import type { TemplateWithMetadata } from '../types/template.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Star,
  StarIcon,
  Eye,
  Download,
  Fork,
  Share,
  MoreHorizontal,
  Users,
  Globe,
  Lock,
  Calendar,
  TrendingUp,
  User,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export interface TemplatePreviewCardProps {
  /** Template data to display */
  template: TemplateWithMetadata
  /** View mode for the card */
  viewMode: 'grid' | 'list'
  /** Whether to show action buttons */
  showActions?: boolean
  /** Click handler */
  onClick?: () => void
  /** Custom CSS classes */
  className?: string
}

/**
 * TemplatePreviewCard - Preview card for layout templates
 *
 * Displays template information with:
 * - Template name, description, and metadata
 * - Rating display and quick rating
 * - Usage statistics
 * - Action menu (fork, share, etc.)
 * - Responsive grid/list layouts
 */
export function TemplatePreviewCard({
  template,
  viewMode,
  showActions = true,
  onClick,
  className,
}: TemplatePreviewCardProps) {
  const [showForkDialog, setShowForkDialog] = useState(false)
  const [quickRating, setQuickRating] = useState<number | null>(null)

  // Hooks
  const forkTemplate = useForkTemplate()
  const rateTemplate = useRateTemplate()
  const trackUsage = useTrackTemplateUsage()
  const { data: userRating } = useUserTemplateRating(template.id)

  // Handlers
  const handleFork = async (customName?: string) => {
    try {
      const result = await forkTemplate.mutateAsync({
        sourceTemplateId: template.id,
        name: customName || `${template.name} (Copy)`,
        description: `Forked from ${template.name}`,
        visibility: 'private',
      })

      if (result.success) {
        toast({
          title: 'Template forked successfully',
          description: `Created your own copy: ${customName || `${template.name} (Copy)`}`,
        })
        setShowForkDialog(false)
      } else {
        throw new Error(result.errors.join(', '))
      }
    } catch (error) {
      toast({
        title: 'Failed to fork template',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleQuickRate = async (rating: number) => {
    try {
      await rateTemplate.mutateAsync({
        templateId: template.id,
        rating,
      })

      setQuickRating(rating)
      toast({
        title: 'Rating submitted',
        description: `You rated this template ${rating} star${rating !== 1 ? 's' : ''}`,
      })
    } catch (error) {
      toast({
        title: 'Failed to rate template',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/templates/${template.id}`
      await navigator.clipboard.writeText(url)

      trackUsage.mutate({ templateId: template.id, action: 'share' })

      toast({
        title: 'Template link copied',
        description: 'Share this template with others using the copied link',
      })
    } catch (error) {
      toast({
        title: 'Failed to copy link',
        description: 'Could not copy template link to clipboard',
        variant: 'destructive',
      })
    }
  }

  const handleExport = () => {
    trackUsage.mutate({ templateId: template.id, action: 'export' })
    // TODO: Implement template export functionality
    toast({
      title: 'Export functionality coming soon',
      description: 'Template export will be available in a future update',
    })
  }

  // Computed values
  const visibilityIcon = {
    private: <Lock className="size-3" />,
    organization: <Users className="size-3" />,
    public: <Globe className="size-3" />,
  }[template.visibility]

  const categoryColor = {
    system: 'bg-blue-100 text-blue-800',
    community: 'bg-green-100 text-green-800',
    organization: 'bg-purple-100 text-purple-800',
    personal: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-gray-100 text-gray-800',
  }[template.category]

  const currentRating = quickRating || userRating?.rating

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:shadow-md border-l-4',
          template.is_default && 'border-l-blue-500',
          className
        )}
        onClick={onClick}
      >
        <CardContent className={cn(semanticSpacing.inline.md, 'flex items-center justify-between')}>
          <div className="flex flex-1 items-center space-x-4">
            {/* Template icon/preview */}
            <div className={cn(
              'w-12 h-12 rounded flex items-center justify-center',
              semanticColors.cardBackground,
              'border-2 border-dashed border-gray-300'
            )}>
              <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                {template.entity_type.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Template info */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <h3 className={cn(semanticTypography.label, 'truncate')}>{template.name}</h3>
                {template.is_default && (
                  <Badge variant="outline" className="text-xs">Default</Badge>
                )}
                <Badge className={cn('text-xs', categoryColor)}>{template.category}</Badge>
              </div>

              {template.description && (
                <p className={cn(semanticTypography.caption, 'text-muted-foreground truncate')}>
                  {template.description}
                </p>
              )}

              <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  {visibilityIcon}
                  <span>{template.visibility}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="size-3" />
                  <span>{template.creator_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="size-3" />
                  <span>{formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and actions */}
          <div className="flex items-center space-x-6">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className={semanticTypography.caption}>
                {template.rating_average.toFixed(1)} ({template.rating_count})
              </span>
            </div>

            {/* Usage count */}
            <div className="flex items-center space-x-1">
              <Eye className="size-4 text-muted-foreground" />
              <span className={semanticTypography.caption}>{template.usage_count}</span>
            </div>

            {/* Actions */}
            {showActions && (
              <TemplateActions
                template={template}
                onFork={() => setShowForkDialog(true)}
                onShare={handleShare}
                onExport={handleExport}
                onRate={handleQuickRate}
                currentRating={currentRating}
              />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 group',
          'hover:shadow-lg hover:scale-[1.02]',
          template.is_default && 'ring-2 ring-blue-200',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className={semanticSpacing.cardHeader}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className={cn(semanticTypography.cardTitle, 'truncate')}>
                {template.name}
              </CardTitle>
              <div className="mt-1 flex items-center space-x-2">
                <Badge className={cn('text-xs', categoryColor)}>{template.category}</Badge>
                {template.is_default && (
                  <Badge variant="outline" className="text-xs">Default</Badge>
                )}
              </div>
            </div>

            {showActions && (
              <TemplateActions
                template={template}
                onFork={() => setShowForkDialog(true)}
                onShare={handleShare}
                onExport={handleExport}
                onRate={handleQuickRate}
                currentRating={currentRating}
                compact
              />
            )}
          </div>

          {template.description && (
            <CardDescription className="line-clamp-2">
              {template.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className={semanticSpacing.cardContent}>
          {/* Template preview placeholder */}
          <div className={cn(
            'w-full h-32 rounded border-2 border-dashed border-gray-300',
            'flex items-center justify-center mb-4',
            semanticColors.cardBackground
          )}>
            <div className="text-center text-muted-foreground">
              <div className={cn(semanticTypography.body, 'font-mono')}>
                {template.entity_type.toUpperCase()}
              </div>
              <div className={semanticTypography.caption}>
                Layout Preview
              </div>
            </div>
          </div>

          {/* Template stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span>{template.rating_average.toFixed(1)}</span>
                <span className="text-muted-foreground">({template.rating_count})</span>
              </div>

              {/* Usage */}
              <div className="flex items-center space-x-1">
                <TrendingUp className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{template.usage_count}</span>
              </div>
            </div>

            {/* Visibility indicator */}
            <div className="flex items-center space-x-1 text-muted-foreground">
              {visibilityIcon}
              <span className="capitalize">{template.visibility}</span>
            </div>
          </div>

          {/* Template metadata */}
          <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <User className="size-3" />
                <span>{template.creator_name}</span>
              </div>
              <span>{formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fork Dialog */}
      <ForkTemplateDialog
        template={template}
        open={showForkDialog}
        onOpenChange={setShowForkDialog}
        onFork={handleFork}
      />
    </>
  )
}

/**
 * Template actions dropdown/menu
 */
interface TemplateActionsProps {
  template: TemplateWithMetadata
  onFork: () => void
  onShare: () => void
  onExport: () => void
  onRate: (rating: number) => void
  currentRating?: number
  compact?: boolean
}

function TemplateActions({
  template,
  onFork,
  onShare,
  onExport,
  onRate,
  currentRating,
  compact = false,
}: TemplateActionsProps) {
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onFork}>
            <Fork className="mr-2 size-4" />
            Fork Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share className="mr-2 size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExport}>
            <Download className="mr-2 size-4" />
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1">
            <div className="mb-1 text-xs text-muted-foreground">Quick Rate:</div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(rating => (
                <Button
                  key={rating}
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0"
                  onClick={() => onRate(rating)}
                >
                  <Star
                    className={cn(
                      'h-3 w-3',
                      (currentRating && rating <= currentRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                </Button>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="sm" onClick={onFork}>
        <Fork className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onShare}>
        <Share className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onExport}>
            <Download className="mr-2 size-4" />
            Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * Fork template dialog
 */
interface ForkTemplateDialogProps {
  template: TemplateWithMetadata
  open: boolean
  onOpenChange: (open: boolean) => void
  onFork: (name: string) => void
}

function ForkTemplateDialog({ template, open, onOpenChange, onFork }: ForkTemplateDialogProps) {
  const [name, setName] = useState(`${template.name} (Copy)`)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onFork(name.trim())
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fork Template</DialogTitle>
          <DialogDescription>
            Create your own copy of "{template.name}" to customize and use.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your copy..."
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              <Fork className="mr-2 size-4" />
              Fork Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}