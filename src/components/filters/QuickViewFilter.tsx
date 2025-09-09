import { 
  Zap, 
  Target, 
  Trophy, 
  AlertCircle, 
  Calendar, 
  Plus, 
  ArrowRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { QuickViewType, QuickViewOption } from '@/types/filters.types'

interface QuickViewFilterProps {
  value: QuickViewType | 'none'
  onChange: (value: QuickViewType | 'none') => void
  isLoading?: boolean
  compact?: boolean
  showBadges?: boolean
  quickViewCounts?: Partial<Record<QuickViewType, number>>
}

const QUICK_VIEW_OPTIONS: QuickViewOption[] = [
  { 
    value: 'action_items_due', 
    label: 'Action Items Due', 
    shortLabel: 'Due Items',
    description: 'Tasks and actions due today or overdue',
    icon: 'AlertCircle'
  },
  { 
    value: 'pipeline_movers', 
    label: 'Pipeline Movers', 
    shortLabel: 'Pipeline',
    description: 'Opportunities progressing through pipeline',
    icon: 'Target'
  },
  { 
    value: 'recent_wins', 
    label: 'Recent Wins', 
    shortLabel: 'Wins',
    description: 'Recently closed successful opportunities',
    icon: 'Trophy'
  },
  { 
    value: 'needs_attention', 
    label: 'Needs Attention', 
    shortLabel: 'Attention',
    description: 'Items requiring immediate attention',
    icon: 'AlertCircle'
  },
  { 
    value: 'upcoming_meetings', 
    label: 'Upcoming Meetings', 
    shortLabel: 'Meetings',
    description: 'Scheduled meetings and calls',
    icon: 'Calendar'
  },
  { 
    value: 'new_opportunities', 
    label: 'New Opportunities', 
    shortLabel: 'New Opps',
    description: 'Recently created opportunities',
    icon: 'Plus'
  },
  { 
    value: 'follow_up_required', 
    label: 'Follow-up Required', 
    shortLabel: 'Follow-up',
    description: 'Contacts and opportunities needing follow-up',
    icon: 'ArrowRight'
  },
]

const getIcon = (iconName: string, className: string = "size-4") => {
  const icons = {
    Zap: <Zap className={className} />,
    Target: <Target className={className} />,
    Trophy: <Trophy className={className} />,
    AlertCircle: <AlertCircle className={className} />,
    Calendar: <Calendar className={className} />,
    Plus: <Plus className={className} />,
    ArrowRight: <ArrowRight className={className} />,
    X: <X className={className} />,
  }
  return icons[iconName as keyof typeof icons] || <Zap className={className} />
}

export function QuickViewFilter({
  value,
  onChange,
  isLoading = false,
  compact = false,
  showBadges = false,
  quickViewCounts = {}
}: QuickViewFilterProps) {
  const selectedOption = QUICK_VIEW_OPTIONS.find(option => option.value === value)
  const isActive = value !== 'none'
  
  const getDisplayText = () => {
    if (value === 'none') return 'Quick View'
    return compact ? selectedOption?.shortLabel : selectedOption?.label
  }

  const getButtonVariant = () => {
    if (isActive) return 'default'
    return 'outline'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size={compact ? "sm" : "default"}
          className="justify-between"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            {isActive && selectedOption ? 
              getIcon(selectedOption.icon || 'Zap') : 
              <Zap className="size-4" />
            }
            <span>{getDisplayText()}</span>
            {showBadges && isActive && quickViewCounts && value !== 'none' && quickViewCounts[value as QuickViewType] && (
              <Badge variant="secondary" className="ml-1">
                {quickViewCounts[value as QuickViewType]}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {/* Clear/None Option */}
        <DropdownMenuItem
          onClick={() => onChange('none')}
          className={`flex items-center justify-between ${
            value === 'none' ? 'bg-accent' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <X className="size-4" />
            <div className="flex flex-col">
              <span className="font-medium">Clear Quick View</span>
              <span className="text-xs text-muted-foreground">
                Show all activities
              </span>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Quick View Options */}
        {QUICK_VIEW_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-between ${
              value === option.value ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              {getIcon(option.icon || 'Zap')}
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
            {showBadges && quickViewCounts[option.value] && (
              <Badge variant="outline" className="ml-2">
                {quickViewCounts[option.value]}
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}