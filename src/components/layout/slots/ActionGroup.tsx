import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { semanticSpacing } from '@/styles/tokens'

/**
 * Props for individual action items
 */
export interface ActionItem {
  /** Action type determines rendering behavior */
  type: 'button' | 'custom'
  /** Button label (required for button type) */
  label?: string
  /** Click handler (required for button type) */
  onClick?: () => void
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  /** Button size */
  size?: 'default' | 'sm' | 'lg'
  /** Icon to display */
  icon?: React.ReactNode
  /** Custom component (required for custom type) */
  component?: React.ReactNode
  /** Accessibility label */
  'aria-label'?: string
  /** Whether the action is disabled */
  disabled?: boolean
  /** Whether the action is loading */
  loading?: boolean
}

/**
 * Props for ActionGroup component
 */
export interface ActionGroupProps {
  /** Array of action items to render */
  actions: ActionItem[]
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
  /** Spacing between actions */
  spacing?: 'xs' | 'sm' | 'md' | 'lg'
  /** Alignment of actions */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Whether to wrap actions on smaller screens */
  wrap?: boolean
  /** Custom CSS class */
  className?: string
  /** Priority-based ordering (higher priority items appear first) */
  priorityOrder?: boolean
}

/**
 * ActionGroup Component
 *
 * Composite slot component for organizing multiple actions with consistent spacing
 * and responsive behavior. Replaces manual div composition with standardized patterns.
 *
 * Features:
 * - Consistent spacing using semantic design tokens
 * - Responsive wrapping and alignment
 * - Priority-based ordering for complex action sets
 * - Mixed button and custom component support
 * - Loading and disabled states
 *
 * @example
 * ```tsx
 * // Basic button group
 * <ActionGroup
 *   actions={[
 *     {
 *       type: 'button',
 *       label: 'Export',
 *       onClick: handleExport,
 *       variant: 'outline',
 *       icon: <Download className="size-4" />
 *     },
 *     {
 *       type: 'button',
 *       label: 'Add Contact',
 *       onClick: handleAdd,
 *       icon: <Plus className="size-4" />
 *     }
 *   ]}
 * />
 *
 * // Mixed actions with custom components
 * <ActionGroup
 *   actions={[
 *     {
 *       type: 'custom',
 *       component: <FilterCountBadge count={5} />
 *     },
 *     {
 *       type: 'button',
 *       label: 'Add',
 *       onClick: handleAdd
 *     }
 *   ]}
 *   direction="horizontal"
 *   spacing="sm"
 * />
 * ```
 */
export const ActionGroup: React.FC<ActionGroupProps> = ({
  actions,
  direction = 'horizontal',
  spacing = 'sm',
  align = 'center',
  wrap = true,
  className,
  priorityOrder = false,
}) => {
  // Sort actions by priority if enabled
  const sortedActions = React.useMemo(() => {
    if (!priorityOrder) return actions

    return [...actions].sort((a, b) => {
      const priorityA = (a as any).priority || 0
      const priorityB = (b as any).priority || 0
      return priorityB - priorityA // Higher priority first
    })
  }, [actions, priorityOrder])

  // Build container classes
  const containerClasses = cn(
    'flex',
    // Direction
    direction === 'horizontal' ? 'flex-row' : 'flex-col',
    // Spacing
    direction === 'horizontal' ? semanticSpacing.gap[spacing] : semanticSpacing.stack[spacing],
    // Alignment
    align === 'start' && 'justify-start items-start',
    align === 'center' && 'justify-center items-center',
    align === 'end' && 'justify-end items-end',
    align === 'stretch' && 'justify-stretch items-stretch',
    // Wrapping
    wrap && direction === 'horizontal' && 'flex-wrap',
    className
  )

  // Render individual action
  const renderAction = (action: ActionItem, index: number) => {
    const key = `action-${index}`

    if (action.type === 'custom') {
      return (
        <div key={key} className="shrink-0">
          {action.component}
        </div>
      )
    }

    if (action.type === 'button') {
      const {
        label,
        onClick,
        variant = 'default',
        size = 'default',
        icon,
        disabled = false,
        loading = false,
        'aria-label': ariaLabel,
      } = action

      return (
        <Button
          key={key}
          variant={variant}
          size={size}
          onClick={onClick}
          disabled={disabled || loading}
          aria-label={ariaLabel || label}
          className="shrink-0"
        >
          {icon && <span className={cn(label && semanticSpacing.rightGap.xs)}>{icon}</span>}
          {label}
        </Button>
      )
    }

    return null
  }

  if (sortedActions.length === 0) {
    return null
  }

  return <div className={containerClasses}>{sortedActions.map(renderAction)}</div>
}

/**
 * Utility function to create action items easily
 */
export const createAction = {
  button: (props: Omit<ActionItem, 'type'> & { type?: 'button' }): ActionItem => ({
    type: 'button',
    ...props,
  }),

  custom: (component: React.ReactNode): ActionItem => ({
    type: 'custom',
    component,
  }),

  /**
   * Create a priority action (will be sorted first if priorityOrder is enabled)
   */
  priority: (
    props: Omit<ActionItem, 'type'> & { type?: 'button'; priority?: number }
  ): ActionItem =>
    ({
      type: 'button',
      ...props,
      priority: props.priority || 10,
    }) as ActionItem & { priority: number },
}

// Default export
export default ActionGroup
