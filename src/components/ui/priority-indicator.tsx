import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { priorityIndicatorVariants } from './priority-indicator.variants'

export interface PriorityIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof priorityIndicatorVariants> {
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical'
  /** Show text label alongside indicator */
  showLabel?: boolean
  /** Custom accessibility label */
  ariaLabel?: string
}

const priorityLabels = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
  critical: 'Critical Priority',
}

const PriorityIndicator = React.forwardRef<HTMLDivElement, PriorityIndicatorProps>(
  ({ className, priority, showLabel = false, ariaLabel, size, ...props }, ref) => {
    const label = ariaLabel || priorityLabels[priority]

    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        aria-label={label}
        ref={ref}
        {...props}
      >
        <div
          className={cn(priorityIndicatorVariants({ priority, size }))}
          role="img"
          aria-hidden={showLabel ? 'true' : 'false'}
        />
        {showLabel && <span className="text-sm font-medium capitalize">{priority}</span>}
      </div>
    )
  }
)
PriorityIndicator.displayName = 'PriorityIndicator'

export { PriorityIndicator }
