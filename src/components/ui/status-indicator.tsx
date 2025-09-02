import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { statusIndicatorVariants } from './status-indicator.variants'

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  ariaLabel?: string
}

const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, variant, size, ariaLabel, children, ...props }, ref) => {
    return (
      <span
        className={cn(statusIndicatorVariants({ variant, size }), className)}
        aria-label={ariaLabel}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    )
  }
)
StatusIndicator.displayName = 'StatusIndicator'

export { StatusIndicator }
