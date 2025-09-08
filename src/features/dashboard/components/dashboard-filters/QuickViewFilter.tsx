import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, Trophy, AlertTriangle, X } from 'lucide-react'
import type { FilterState } from '@/types/dashboard'

interface QuickViewFilterProps {
  localFilters: FilterState
  isLoading: boolean
  onFilterChange: (field: keyof FilterState, value: FilterState[keyof FilterState]) => void
}

const quickViewOptions = [
  { 
    value: 'action_items_due', 
    label: 'Action Items Due', 
    icon: Clock,
    variant: 'secondary' as const
  },
  { 
    value: 'pipeline_movers', 
    label: 'Pipeline Movers', 
    icon: TrendingUp,
    variant: 'default' as const
  },
  { 
    value: 'recent_wins', 
    label: 'Recent Wins', 
    icon: Trophy,
    variant: 'default' as const
  },
  { 
    value: 'needs_attention', 
    label: 'Needs Attention', 
    icon: AlertTriangle,
    variant: 'destructive' as const
  },
] as const

export function QuickViewFilter({ localFilters, isLoading, onFilterChange }: QuickViewFilterProps) {
  const selectedQuickView = localFilters.quickView || 'none'

  const handleQuickViewToggle = (value: string) => {
    // Toggle behavior: if already selected, clear it
    const newValue = selectedQuickView === value ? 'none' : value
    onFilterChange('quickView', newValue)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {quickViewOptions.map((option) => {
        const Icon = option.icon
        const isSelected = selectedQuickView === option.value
        
        return (
          <Button
            key={option.value}
            variant={isSelected ? option.variant : 'outline'}
            size="sm"
            onClick={() => handleQuickViewToggle(option.value)}
            disabled={isLoading}
            className="h-8 px-3 text-xs"
          >
            <Icon className="mr-1 size-3" />
            {option.label}
            {isSelected && (
              <X 
                className="ml-1 size-3 cursor-pointer rounded-full p-0.5 hover:bg-white/20" 
                onClick={(e) => {
                  e.stopPropagation()
                  onFilterChange('quickView', 'none')
                }}
              />
            )}
          </Button>
        )
      })}
      
      {selectedQuickView !== 'none' && (
        <Badge variant="outline" className="text-xs">
          Quick View Active
        </Badge>
      )}
    </div>
  )
}