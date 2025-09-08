import React from 'react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, Target, Trophy, AlertCircle, Calendar, Plus, ArrowRight, X } from 'lucide-react'

export interface QuickViewOption {
  value: string
  label: string
  shortLabel?: string
  description?: string
  icon?: string
  badge?: string | number
}

export interface GenericQuickViewFilterProps {
  value: string | 'none'
  options: QuickViewOption[]
  isLoading?: boolean
  placeholder?: string
  className?: string
  showBadges?: boolean
  onChange: (value: string | 'none') => void
}

const getIcon = (iconName: string = 'Zap', className: string = "size-4") => {
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

export const GenericQuickViewFilter: React.FC<GenericQuickViewFilterProps> = ({
  value,
  options,
  isLoading = false,
  placeholder = "Quick View",
  className = "",
  showBadges = false,
  onChange,
}) => {
  const selectedOption = options.find(option => option.value === value)
  const isActive = value !== 'none'
  
  const getDisplayText = () => {
    if (value === 'none') return placeholder
    return selectedOption?.shortLabel || selectedOption?.label || placeholder
  }

  const getButtonVariant = () => {
    return isActive ? 'default' : 'outline'
  }

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      {isActive && selectedOption ? 
        getIcon(selectedOption.icon || 'Zap', 'size-4 text-muted-foreground') : 
        <Zap className="size-4 text-muted-foreground" />
      }
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="sm:w-filter-lg w-full">
          <SelectValue placeholder={placeholder}>
            <div className="flex items-center gap-2">
              <span>{getDisplayText()}</span>
              {showBadges && isActive && value !== 'none' && selectedOption?.badge && (
                <span className="ml-1 rounded bg-secondary px-1 py-0.5 text-xs">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-64">
          {/* Clear/None Option */}
          <SelectItem
            value="none"
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <X className="size-4" />
              <div className="flex flex-col">
                <span className="font-medium">Clear Quick View</span>
                <span className="text-xs text-muted-foreground">
                  Show all items
                </span>
              </div>
            </div>
          </SelectItem>
          
          {/* Quick View Options */}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="flex items-center justify-between"
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
              {showBadges && option.badge && (
                <span className="ml-2 rounded bg-secondary px-1 py-0.5 text-xs">
                  {option.badge}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Common quick view options that can be customized per feature
export const createQuickViewOptions = (featureType: 'opportunities' | 'interactions' | 'products' | 'organizations' | 'contacts'): QuickViewOption[] => {
  const baseOptions: Record<string, QuickViewOption[]> = {
    opportunities: [
      {
        value: 'pipeline_movers',
        label: 'Pipeline Movers',
        shortLabel: 'Pipeline',
        description: 'Opportunities that moved stages this week',
        icon: 'Target'
      },
      {
        value: 'stalled_opportunities',
        label: 'Stalled Opportunities', 
        shortLabel: 'Stalled',
        description: 'Opportunities with no recent activity',
        icon: 'AlertCircle'
      },
      {
        value: 'closing_soon',
        label: 'Closing Soon',
        shortLabel: 'Closing',
        description: 'Opportunities in final stages',
        icon: 'Trophy'
      },
      {
        value: 'needs_follow_up',
        label: 'Needs Follow-up',
        shortLabel: 'Follow-up',
        description: 'Opportunities requiring action',
        icon: 'ArrowRight'
      }
    ],
    interactions: [
      {
        value: 'follow_ups_due',
        label: 'Follow-ups Due',
        shortLabel: 'Due',
        description: 'Interactions requiring follow-up action',
        icon: 'Calendar'
      },
      {
        value: 'overdue_actions',
        label: 'Overdue Actions',
        shortLabel: 'Overdue', 
        description: 'Past-due follow-ups',
        icon: 'AlertCircle'
      },
      {
        value: 'this_week_activity',
        label: 'This Week Activity',
        shortLabel: 'This Week',
        description: 'Recent interaction activity',
        icon: 'Zap'
      },
      {
        value: 'high_value_interactions',
        label: 'High Value Interactions',
        shortLabel: 'High Value',
        description: 'Demo/proposal interactions',
        icon: 'Trophy'
      }
    ],
    products: [
      {
        value: 'promoted_this_week',
        label: 'Promoted This Week',
        shortLabel: 'Promoted',
        description: 'Products with recent activity',
        icon: 'Zap'
      },
      {
        value: 'products_with_opportunities',
        label: 'With Opportunities',
        shortLabel: 'Opportunities',
        description: 'Products linked to active opportunities',
        icon: 'Target'
      },
      {
        value: 'high_margin_products',
        label: 'High Margin Products',
        shortLabel: 'High Margin',
        description: 'Products with best profit margins',
        icon: 'Trophy'
      },
      {
        value: 'needs_attention',
        label: 'Needs Attention',
        shortLabel: 'Attention',
        description: 'Products without recent activity',
        icon: 'AlertCircle'
      }
    ],
    organizations: [
      {
        value: 'high_engagement',
        label: 'High Engagement',
        shortLabel: 'High Engage',
        description: 'Organizations with frequent interactions',
        icon: 'Zap'
      },
      {
        value: 'multiple_opportunities',
        label: 'Multiple Opportunities',
        shortLabel: 'Multi Opps',
        description: 'Organizations with several active opportunities',
        icon: 'Target'
      },
      {
        value: 'inactive_orgs',
        label: 'Inactive Organizations',
        shortLabel: 'Inactive',
        description: 'Organizations without recent activity',
        icon: 'AlertCircle'
      }
    ],
    contacts: [
      {
        value: 'decision_makers',
        label: 'Decision Makers',
        shortLabel: 'Decision',
        description: 'Contacts with decision authority',
        icon: 'Trophy'
      },
      {
        value: 'recent_interactions',
        label: 'Recent Interactions',
        shortLabel: 'Recent',
        description: 'Contacts with recent interaction activity',
        icon: 'Zap'
      },
      {
        value: 'needs_follow_up',
        label: 'Needs Follow-up',
        shortLabel: 'Follow-up',
        description: 'Contacts requiring follow-up',
        icon: 'ArrowRight'
      }
    ]
  }

  return baseOptions[featureType] || []
}