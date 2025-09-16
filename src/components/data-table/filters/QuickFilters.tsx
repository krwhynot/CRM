import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, TrendingUp, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuickFilterValue = 'none' | 'high_engagement' | 'multiple_opportunities' | 'inactive_orgs' | 'recent_activity' | 'high_priority' | 'needs_attention'

interface QuickFilterOption {
  value: QuickFilterValue
  label: string
  icon?: React.ComponentType<{ className?: string }>
  color?: 'default' | 'secondary' | 'destructive' | 'outline'
  description?: string
}

interface QuickFiltersProps {
  value: QuickFilterValue
  onChange: (value: QuickFilterValue) => void
  entityType?: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  isLoading?: boolean
  compact?: boolean
  showBadges?: boolean
  className?: string
}

// Entity-specific quick filter configurations
const QUICK_FILTER_CONFIGS: Record<string, QuickFilterOption[]> = {
  organizations: [
    { value: 'none', label: 'All Organizations', icon: Users },
    { value: 'high_engagement', label: 'High Engagement', icon: Star, color: 'default', description: 'Organizations with frequent interactions' },
    { value: 'multiple_opportunities', label: 'Multiple Opportunities', icon: TrendingUp, color: 'secondary', description: 'Organizations with 2+ active opportunities' },
    { value: 'inactive_orgs', label: 'Inactive', icon: AlertTriangle, color: 'destructive', description: 'No activity in last 30 days' },
  ],
  contacts: [
    { value: 'none', label: 'All Contacts', icon: Users },
    { value: 'high_engagement', label: 'Decision Makers', icon: Star, color: 'default', description: 'Contacts with decision authority' },
    { value: 'recent_activity', label: 'Recent Activity', icon: Clock, color: 'secondary', description: 'Contacts with recent interactions' },
    { value: 'needs_attention', label: 'Needs Follow-up', icon: AlertTriangle, color: 'destructive', description: 'Contacts requiring attention' },
  ],
  opportunities: [
    { value: 'none', label: 'All Opportunities', icon: TrendingUp },
    { value: 'high_priority', label: 'High Priority', icon: Star, color: 'default', description: 'Priority opportunities' },
    { value: 'recent_activity', label: 'Recent Updates', icon: Clock, color: 'secondary', description: 'Recently updated opportunities' },
    { value: 'needs_attention', label: 'Stalled', icon: AlertTriangle, color: 'destructive', description: 'Opportunities needing attention' },
  ],
  products: [
    { value: 'none', label: 'All Products', icon: CheckCircle },
    { value: 'high_engagement', label: 'Top Performers', icon: Star, color: 'default', description: 'Best selling products' },
    { value: 'recent_activity', label: 'Recently Added', icon: Clock, color: 'secondary', description: 'Newly added products' },
    { value: 'needs_attention', label: 'Low Stock', icon: AlertTriangle, color: 'destructive', description: 'Products with low inventory' },
  ],
  interactions: [
    { value: 'none', label: 'All Interactions', icon: Users },
    { value: 'recent_activity', label: 'This Week', icon: Clock, color: 'secondary', description: 'Interactions from this week' },
    { value: 'high_priority', label: 'Important', icon: Star, color: 'default', description: 'High-priority interactions' },
    { value: 'needs_attention', label: 'Follow-up Required', icon: AlertTriangle, color: 'destructive', description: 'Interactions requiring follow-up' },
  ],
}

export function QuickFilters({
  value,
  onChange,
  entityType = 'organizations',
  isLoading = false,
  compact = false,
  showBadges = true,
  className = ''
}: QuickFiltersProps) {
  const options = QUICK_FILTER_CONFIGS[entityType] || QUICK_FILTER_CONFIGS.organizations

  const getButtonVariant = (option: QuickFilterOption) => {
    if (value === option.value) {
      return option.color === 'destructive' ? 'destructive' : 'default'
    }
    return 'outline'
  }

  const getButtonSize = () => {
    return compact ? 'sm' : 'default'
  }

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {!compact && (
        <label className="text-xs font-medium text-muted-foreground">
          Quick Filters
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const IconComponent = option.icon
          const isActive = value === option.value
          const variant = getButtonVariant(option)

          return (
            <Button
              key={option.value}
              variant={variant}
              size={getButtonSize()}
              onClick={() => onChange(option.value)}
              disabled={isLoading}
              className={cn(
                'relative',
                compact && 'h-8 px-3 text-xs',
                isActive && 'ring-2 ring-primary ring-offset-2'
              )}
              title={option.description}
            >
              {IconComponent && (
                <IconComponent className={cn(
                  compact ? 'mr-1 size-3' : 'mr-2 size-4'
                )} />
              )}

              <span className={compact ? 'text-xs' : 'text-sm'}>
                {option.label}
              </span>

              {showBadges && isActive && !compact && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-4 px-1 text-xs"
                >
                  Active
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Active filter description */}
      {!compact && value !== 'none' && (
        <div className="text-xs text-muted-foreground">
          {options.find(opt => opt.value === value)?.description}
        </div>
      )}
    </div>
  )
}

// Helper function to get available quick filters for an entity type
export function getQuickFilterOptions(entityType: string): QuickFilterOption[] {
  return QUICK_FILTER_CONFIGS[entityType] || QUICK_FILTER_CONFIGS.organizations
}

// Helper function to create quick filter configuration
export function createQuickFilterConfig(
  entityType: string,
  customOptions?: QuickFilterOption[]
): QuickFilterOption[] {
  if (customOptions) {
    return customOptions
  }
  return getQuickFilterOptions(entityType)
}

export type { QuickFilterOption }