import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'

/**
 * Meta information item
 */
export interface MetaItem {
  /** Type determines rendering style */
  type: 'count' | 'status' | 'badge' | 'text' | 'custom'
  /** Display label */
  label?: string
  /** Value to display */
  value?: string | number
  /** Badge variant (for badge and status types) */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Icon to display */
  icon?: React.ReactNode
  /** Custom component (for custom type) */
  component?: React.ReactNode
  /** Color scheme for status type */
  color?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  /** Whether to show tooltip */
  tooltip?: string
}

/**
 * Props for MetaBadge component
 */
export interface MetaBadgeProps {
  /** Array of meta items to display */
  items: MetaItem[]
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
  /** Spacing between items */
  spacing?: 'xs' | 'sm' | 'md' | 'lg'
  /** Text size */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show separators between items */
  separator?: boolean | string
  /** Custom separator character */
  separatorChar?: string
  /** Custom CSS class */
  className?: string
}

/**
 * MetaBadge Component
 *
 * Composite slot component for displaying meta information like counts, statuses,
 * and badges with consistent formatting and spacing.
 *
 * Features:
 * - Multiple display types (count, status, badge, text)
 * - Semantic spacing and typography tokens
 * - Flexible separator support
 * - Color-coded status indicators
 * - Mixed content support
 *
 * @example
 * ```tsx
 * // Entity count display
 * <MetaBadge
 *   items={[
 *     {
 *       type: 'count',
 *       value: organizations.length,
 *       label: 'organizations'
 *     }
 *   ]}
 * />
 *
 * // Filter status with separators
 * <MetaBadge
 *   items={[
 *     {
 *       type: 'count',
 *       value: filteredItems.length,
 *       label: 'filtered'
 *     },
 *     {
 *       type: 'count',
 *       value: totalItems.length,
 *       label: 'total'
 *     }
 *   ]}
 *   separator="of"
 * />
 *
 * // Status indicators
 * <MetaBadge
 *   items={[
 *     {
 *       type: 'status',
 *       value: 'active',
 *       color: 'success'
 *     },
 *     {
 *       type: 'badge',
 *       label: 'Priority',
 *       value: 'High',
 *       variant: 'destructive'
 *     }
 *   ]}
 * />
 * ```
 */
export const MetaBadge: React.FC<MetaBadgeProps> = ({
  items,
  direction = 'horizontal',
  spacing = 'sm',
  size = 'md',
  separator = false,
  separatorChar = '•',
  className,
}) => {
  // Build container classes
  const containerClasses = cn(
    'flex items-center',
    direction === 'horizontal' ? 'flex-row' : 'flex-col',
    direction === 'horizontal' ? semanticSpacing.gap[spacing] : semanticSpacing.stack[spacing],
    className
  )

  // Get text classes based on size
  const getTextClasses = (metaSize: typeof size) => {
    switch (metaSize) {
      case 'sm':
        return semanticTypography.caption
      case 'lg':
        return semanticTypography.body
      case 'md':
      default:
        return semanticTypography.body
    }
  }

  // Render separator
  const renderSeparator = (index: number) => {
    if (!separator || index === 0) return null

    const separatorContent = typeof separator === 'string' ? separator : separatorChar

    return (
      <span
        key={`separator-${index}`}
        className={cn(getTextClasses(size), 'text-muted-foreground select-none')}
      >
        {separatorContent}
      </span>
    )
  }

  // Render individual meta item
  const renderMetaItem = (item: MetaItem, index: number) => {
    const key = `meta-${index}`

    switch (item.type) {
      case 'count': {
        const displayValue =
          typeof item.value === 'number' ? item.value.toLocaleString() : item.value

        const countText = item.label
          ? `${displayValue} ${
              item.value === 1
                ? item.label.replace(/s$/, '') // Remove plural 's'
                : item.label
            }`
          : displayValue

        return (
          <span
            key={key}
            className={cn(getTextClasses(size), 'text-muted-foreground')}
            title={item.tooltip}
          >
            {item.icon && <span className={semanticSpacing.rightGap.xs}>{item.icon}</span>}(
            {countText})
          </span>
        )
      }

      case 'status': {
        const statusClasses = cn(
          `inline-flex items-center rounded-full px-2 py-1 ${semanticTypography.tiny} ${semanticTypography.fontWeight.medium}`,
          item.color === 'success' && semanticColors.badges.statusActive,
          item.color === 'warning' && semanticColors.badges.statusPending,
          item.color === 'error' && semanticColors.badges.statusArchived,
          item.color === 'info' && semanticColors.badges.statusActive,
          (!item.color || item.color === 'neutral') &&
            semanticColors.badges.statusInactive
        )

        return (
          <span key={key} className={statusClasses} title={item.tooltip}>
            {item.icon && <span className={semanticSpacing.rightGap.xs}>{item.icon}</span>}
            {item.value}
          </span>
        )
      }

      case 'badge': {
        return (
          <Badge
            key={key}
            variant={item.variant || 'secondary'}
            className="shrink-0"
            title={item.tooltip}
          >
            {item.icon && <span className={semanticSpacing.rightGap.xs}>{item.icon}</span>}
            {item.label && `${item.label}: `}
            {item.value}
          </Badge>
        )
      }

      case 'text': {
        return (
          <span
            key={key}
            className={cn(getTextClasses(size), 'text-muted-foreground')}
            title={item.tooltip}
          >
            {item.icon && <span className={semanticSpacing.rightGap.xs}>{item.icon}</span>}
            {item.label && `${item.label}: `}
            {item.value}
          </span>
        )
      }

      case 'custom': {
        return (
          <span key={key} className="shrink-0">
            {item.component}
          </span>
        )
      }

      default:
        return null
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className={containerClasses}>
      {items.map((item, index) => (
        <React.Fragment key={`fragment-${index}`}>
          {renderSeparator(index)}
          {renderMetaItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * Utility functions to create meta items easily
 */
export const createMeta = {
  count: (value: number, label?: string, icon?: React.ReactNode): MetaItem => ({
    type: 'count',
    value,
    label,
    icon,
  }),

  entityCount: (count: number, entityName: string, icon?: React.ReactNode): MetaItem => ({
    type: 'count',
    value: count,
    label: count === 1 ? entityName : `${entityName}s`,
    icon,
  }),

  filterCount: (filtered: number, total: number): MetaItem[] => [
    { type: 'count', value: filtered, label: 'filtered' },
    { type: 'count', value: total, label: 'total' },
  ],

  status: (
    value: string,
    color: MetaItem['color'] = 'neutral',
    icon?: React.ReactNode
  ): MetaItem => ({
    type: 'status',
    value,
    color,
    icon,
  }),

  badge: (
    label: string,
    value: string | number,
    variant: MetaItem['variant'] = 'secondary'
  ): MetaItem => ({
    type: 'badge',
    label,
    value,
    variant,
  }),

  text: (value: string, label?: string, icon?: React.ReactNode): MetaItem => ({
    type: 'text',
    value,
    label,
    icon,
  }),

  custom: (component: React.ReactNode): MetaItem => ({
    type: 'custom',
    component,
  }),
}

// Default export
export default MetaBadge
