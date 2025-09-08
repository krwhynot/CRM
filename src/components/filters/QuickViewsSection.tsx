import { useState, useEffect } from 'react'
import { Zap, Target, Trophy, AlertCircle, Calendar, Plus, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { getPresetBadgeCount, getSuggestedPresets, WORKFLOW_PRESETS } from '@/lib/quick-view-presets'
import type { QuickViewType } from '@/types/filters.types'

interface QuickViewsSectionProps {
  selectedQuickView: QuickViewType | 'none'
  onQuickViewChange: (preset: QuickViewType | 'none') => void
  availableQuickViews?: QuickViewType[]
  isLoading?: boolean
  compact?: boolean
  showBadges?: boolean
  showSuggestions?: boolean
  maxButtons?: number
}

const QUICK_VIEW_ICONS = {
  action_items_due: AlertCircle,
  pipeline_movers: Target,
  recent_wins: Trophy,
  needs_attention: AlertCircle,
  upcoming_meetings: Calendar,
  new_opportunities: Plus,
  follow_up_required: ArrowRight,
}

const QUICK_VIEW_LABELS = {
  action_items_due: 'Action Items Due',
  pipeline_movers: 'Pipeline Movers',
  recent_wins: 'Recent Wins',
  needs_attention: 'Needs Attention',
  upcoming_meetings: 'Upcoming Meetings',
  new_opportunities: 'New Opportunities',
  follow_up_required: 'Follow-up Required',
}

export function QuickViewsSection({
  selectedQuickView,
  onQuickViewChange,
  availableQuickViews,
  isLoading = false,
  compact = false,
  showBadges = false,
  showSuggestions = true,
  maxButtons = 6
}: QuickViewsSectionProps) {
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({})
  const [loadingBadges, setLoadingBadges] = useState(false)

  // Determine which quick views to show
  const quickViewsToShow = availableQuickViews || Object.keys(QUICK_VIEW_LABELS) as QuickViewType[]
  const limitedQuickViews = quickViewsToShow.slice(0, maxButtons)
  
  // Get suggested presets
  const suggestedPresets = showSuggestions ? getSuggestedPresets() : []

  // Load badge counts
  useEffect(() => {
    if (showBadges) {
      setLoadingBadges(true)
      
      const loadBadges = async () => {
        const counts: Record<string, number> = {}
        
        for (const preset of limitedQuickViews) {
          try {
            counts[preset] = await getPresetBadgeCount(preset)
          } catch (error) {
            console.warn(`Failed to load badge count for ${preset}:`, error)
            counts[preset] = 0
          }
        }
        
        setBadgeCounts(counts)
        setLoadingBadges(false)
      }
      
      loadBadges()
    }
  }, [limitedQuickViews, showBadges])

  const getIcon = (preset: QuickViewType) => {
    const IconComponent = QUICK_VIEW_ICONS[preset] || Zap
    return <IconComponent className="size-4" />
  }

  const getVariant = (preset: QuickViewType | 'none') => {
    if (selectedQuickView === preset) {
      return 'default' as const
    }
    if (suggestedPresets.includes(preset as QuickViewType)) {
      return 'secondary' as const
    }
    return 'outline' as const
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Quick Views
          </label>
          {selectedQuickView !== 'none' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuickViewChange('none')}
              className="h-6 px-2 text-xs"
            >
              <X className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Main Quick View Buttons */}
      <div className={`grid gap-2 ${
        compact 
          ? 'grid-cols-2 sm:grid-cols-3' 
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      }`}>
        {limitedQuickViews.map((preset) => {
          const isActive = selectedQuickView === preset
          const badgeCount = badgeCounts[preset]
          
          return (
            <TooltipProvider key={preset}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={getVariant(preset)}
                    size={compact ? "sm" : "default"}
                    onClick={() => onQuickViewChange(preset)}
                    disabled={isLoading}
                    className={`justify-start ${isActive ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {getIcon(preset)}
                      <span className="truncate text-left">
                        {compact 
                          ? QUICK_VIEW_LABELS[preset].split(' ')[0] 
                          : QUICK_VIEW_LABELS[preset]
                        }
                      </span>
                      {showBadges && badgeCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto h-5 shrink-0 px-1.5 text-xs"
                        >
                          {loadingBadges ? '...' : badgeCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{QUICK_VIEW_LABELS[preset]}</p>
                  {badgeCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {badgeCount} items
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Suggested Presets */}
      {showSuggestions && suggestedPresets.length > 0 && !compact && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="size-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Suggested for now
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPresets.slice(0, 3).map((preset) => (
                <Button
                  key={`suggested-${preset}`}
                  variant="secondary"
                  size="sm"
                  onClick={() => onQuickViewChange(preset)}
                  disabled={isLoading}
                  className="h-7 px-2 text-xs"
                >
                  {getIcon(preset)}
                  <span className="ml-1">
                    {QUICK_VIEW_LABELS[preset].split(' ')[0]}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Workflow Presets */}
      {!compact && Object.keys(WORKFLOW_PRESETS).length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="size-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Workflows
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(WORKFLOW_PRESETS).slice(0, 2).map(([key, workflow]) => (
                <div 
                  key={key} 
                  className="cursor-pointer rounded-md border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                  onClick={() => {
                    // Apply the first preset from the workflow
                    if (workflow.presets.length > 0) {
                      onQuickViewChange(workflow.presets[0])
                    }
                  }}
                >
                  <div className="text-xs font-medium">{workflow.name}</div>
                  <div className="mb-1 text-xs text-muted-foreground">
                    {workflow.description}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {workflow.presets.slice(0, 2).map((preset) => (
                      <Badge key={preset} variant="outline" className="h-4 px-1 text-xs">
                        {QUICK_VIEW_LABELS[preset].split(' ')[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}