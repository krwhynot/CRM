import * as React from 'react'
import { badgeVariants, type BadgeProps } from './badge.variants'
import { cn } from '@/lib/utils'

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, priority, orgType, segment, status, influence, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, priority, orgType, segment, status, influence }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
