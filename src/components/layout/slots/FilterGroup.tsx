import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

/**
 * Filter control types for common UI patterns
 */
export interface FilterControl {
  /** Control type determines rendering */
  type: 'search' | 'select' | 'multiselect' | 'toggle' | 'range' | 'custom'
  /** Control identifier */
  id: string
  /** Display label */
  label: string
  /** Current value */
  value?: any
  /** Change handler */
  onChange?: (value: any) => void
  /** Control-specific options */
  options?: Array<{ label: string; value: any; count?: number }>
  /** Placeholder text */
  placeholder?: string
  /** Whether the control is disabled */
  disabled?: boolean
  /** Custom component (for custom type) */
  component?: React.ReactNode
}

/**
 * Filter group definition
 */
export interface FilterGroupItem {
  /** Unique identifier */
  id: string
  /** Display title */
  title: string
  /** Optional icon */
  icon?: React.ReactNode
  /** Badge to show (count, status, etc.) */
  badge?: string | number | React.ReactNode
  /** Whether expanded by default */
  defaultExpanded?: boolean
  /** Filter controls in this group */
  controls?: FilterControl[]
  /** Custom content (alternative to controls) */
  content?: React.ReactNode
  /** Whether this group is collapsible */
  collapsible?: boolean
}

/**
 * Props for FilterGroup component
 */
export interface FilterGroupProps {
  /** Array of filter groups */
  groups: FilterGroupItem[]
  /** Spacing between groups */
  spacing?: 'xs' | 'sm' | 'md' | 'lg'
  /** Whether to show dividers between groups */
  showDividers?: boolean
  /** Compact mode for smaller sidebars */
  compact?: boolean
  /** Custom CSS class */
  className?: string
  /** Callback when a group's expanded state changes */
  onGroupToggle?: (groupId: string, expanded: boolean) => void
}

/**
 * FilterGroup Component
 *
 * Composite slot component for organizing filter controls into logical groups
 * with consistent spacing, collapsible sections, and responsive behavior.
 *
 * Features:
 * - Structured filter organization with collapsible groups
 * - Common filter control types (search, select, toggle, etc.)
 * - Badge indicators for active filters
 * - Compact mode for narrow sidebars
 * - Custom content support alongside controls
 * - State management for group expansion
 *
 * @example
 * ```tsx
 * // Basic filter groups
 * <FilterGroup
 *   groups={[
 *     {
 *       id: 'search',
 *       title: 'Search',
 *       icon: <Search className="h-4 w-4" />,
 *       defaultExpanded: true,
 *       controls: [
 *         {
 *           type: 'search',
 *           id: 'query',
 *           label: 'Search organizations',
 *           value: searchTerm,
 *           onChange: setSearchTerm,
 *           placeholder: 'Type to search...'
 *         }
 *       ]
 *     },
 *     {
 *       id: 'type',
 *       title: 'Organization Type',
 *       icon: <Building2 className="h-4 w-4" />,
 *       badge: activeFilters.length > 0 ? activeFilters.length : undefined,
 *       controls: [
 *         {
 *           type: 'select',
 *           id: 'orgType',
 *           label: 'Type',
 *           value: selectedType,
 *           onChange: setSelectedType,
 *           options: [
 *             { label: 'All Types', value: 'all' },
 *             { label: 'Customers', value: 'customer', count: 25 },
 *             { label: 'Distributors', value: 'distributor', count: 12 }
 *           ]
 *         }
 *       ]
 *     }
 *   ]}
 * />
 *
 * // Custom content with mixed controls
 * <FilterGroup
 *   groups={[
 *     {
 *       id: 'advanced',
 *       title: 'Advanced Filters',
 *       content: <CustomFilterComponent />
 *     }
 *   ]}
 * />
 * ```
 */
export const FilterGroup: React.FC<FilterGroupProps> = ({
  groups,
  spacing = 'md',
  showDividers = false,
  compact = false,
  className,
  onGroupToggle,
}) => {
  // Track expanded state for each group
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => {
    const initialExpanded = new Set<string>()
    groups.forEach((group) => {
      if (group.defaultExpanded !== false) {
        initialExpanded.add(group.id)
      }
    })
    return initialExpanded
  })

  // Handle group toggle
  const handleGroupToggle = (groupId: string, expanded: boolean) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (expanded) {
        next.add(groupId)
      } else {
        next.delete(groupId)
      }
      return next
    })
    onGroupToggle?.(groupId, expanded)
  }

  // Render filter control
  const renderControl = (control: FilterControl) => {
    const { type, id, label, value, onChange, options, placeholder, disabled, component } = control

    const controlKey = `control-${id}`

    switch (type) {
      case 'search': {
        return (
          <div key={controlKey} className={semanticSpacing.stack.xs}>
            <input
              type="text"
              placeholder={placeholder || `Search ${label.toLowerCase()}...`}
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(
                `flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 ${semanticTypography.body}`,
                `shadow-sm transition-colors file:border-0 file:bg-transparent ${semanticTypography.caption} ${semanticTypography.fontWeight.medium}`,
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1',
                'focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
        )
      }

      case 'select': {
        return (
          <div key={controlKey} className={semanticSpacing.stack.xs}>
            <select
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(
                'flex h-9 w-full items-center justify-between rounded-md border border-input',
                `bg-background px-3 py-2 ${semanticTypography.body} shadow-sm ring-offset-background`,
                'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </option>
              ))}
            </select>
          </div>
        )
      }

      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : []

        return (
          <div key={controlKey} className={semanticSpacing.stack.xs}>
            {options?.map((option) => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value]
                    onChange?.(newValues)
                  }}
                  disabled={disabled}
                  className="w-full justify-between"
                >
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {option.count}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        )
      }

      case 'toggle': {
        return (
          <div key={controlKey} className={semanticSpacing.stack.xs}>
            <Button
              variant={value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange?.(!value)}
              disabled={disabled}
              className="w-full"
            >
              {label}
            </Button>
          </div>
        )
      }

      case 'custom': {
        return (
          <div key={controlKey} className={semanticSpacing.stack.xs}>
            {component}
          </div>
        )
      }

      default:
        return null
    }
  }

  // Render group header
  const renderGroupHeader = (group: FilterGroupItem) => {
    const isExpanded = expandedGroups.has(group.id)
    const { title, icon, badge, collapsible = true } = group

    const headerContent = (
      <div className="flex w-full items-center justify-between">
        <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
          {icon && <span className="shrink-0">{icon}</span>}
          <h3 className={cn(semanticTypography.label, compact && 'text-xs')}>{title}</h3>
          {badge && (
            <Badge variant="secondary" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>

        {collapsible && (
          <span className="shrink-0">
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </span>
        )}
      </div>
    )

    if (!collapsible) {
      return (
        <div className={cn(semanticSpacing.layoutPadding.sm, 'border-b border-border')}>
          {headerContent}
        </div>
      )
    }

    return (
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between text-left',
          semanticSpacing.layoutPadding.sm,
          'border-b border-border hover:bg-muted/50 transition-colors'
        )}
        onClick={() => handleGroupToggle(group.id, !isExpanded)}
      >
        {headerContent}
      </CollapsibleTrigger>
    )
  }

  // Render group content
  const renderGroupContent = (group: FilterGroupItem) => {
    const content = group.content || (
      <div className={semanticSpacing.stack.sm}>{group.controls?.map(renderControl)}</div>
    )

    if (!group.collapsible) {
      return <div className={semanticSpacing.layoutPadding.sm}>{content}</div>
    }

    return (
      <CollapsibleContent>
        <div className={semanticSpacing.layoutPadding.sm}>{content}</div>
      </CollapsibleContent>
    )
  }

  if (groups.length === 0) {
    return null
  }

  return (
    <div className={cn(semanticSpacing.stack[spacing], className)}>
      {groups.map((group, index) => (
        <React.Fragment key={group.id}>
          {showDividers && index > 0 && <hr className="border-border" />}

          <Collapsible
            open={expandedGroups.has(group.id)}
            onOpenChange={(open) => handleGroupToggle(group.id, open)}
          >
            <div
              className={cn(
                'border border-border rounded-lg overflow-hidden',
                compact && semanticTypography.caption
              )}
            >
              {renderGroupHeader(group)}
              {renderGroupContent(group)}
            </div>
          </Collapsible>
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * Utility functions to create filter groups and controls easily
 */
export const createFilterGroup = {
  search: (
    id: string,
    value: string,
    onChange: (value: string) => void,
    placeholder?: string
  ): FilterGroupItem => ({
    id: `search-${id}`,
    title: 'Search',
    defaultExpanded: true,
    controls: [
      {
        type: 'search',
        id,
        label: 'Search',
        value,
        onChange,
        placeholder,
      },
    ],
  }),

  select: (
    id: string,
    title: string,
    value: any,
    onChange: (value: any) => void,
    options: FilterControl['options'] = [],
    icon?: React.ReactNode
  ): FilterGroupItem => ({
    id: `select-${id}`,
    title,
    icon,
    badge: value && value !== 'all' ? '1' : undefined,
    controls: [
      {
        type: 'select',
        id,
        label: title,
        value,
        onChange,
        options,
      },
    ],
  }),

  multiselect: (
    id: string,
    title: string,
    value: any[],
    onChange: (value: any[]) => void,
    options: FilterControl['options'] = [],
    icon?: React.ReactNode
  ): FilterGroupItem => ({
    id: `multiselect-${id}`,
    title,
    icon,
    badge: value.length > 0 ? value.length : undefined,
    controls: [
      {
        type: 'multiselect',
        id,
        label: title,
        value,
        onChange,
        options,
      },
    ],
  }),

  custom: (
    id: string,
    title: string,
    content: React.ReactNode,
    icon?: React.ReactNode,
    badge?: string | number
  ): FilterGroupItem => ({
    id: `custom-${id}`,
    title,
    icon,
    badge,
    content,
  }),
}

// Default export
export default FilterGroup
