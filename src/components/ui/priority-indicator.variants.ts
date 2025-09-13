import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticRadius } from '@/styles/tokens'

export const priorityIndicatorVariants = cva(
  cn(
    'flex items-center justify-center border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    semanticRadius.full
  ),
  {
    variants: {
      priority: {
        low: 'border-muted bg-muted text-muted-foreground',
        medium:
          'border-organization-customer bg-organization-customer text-organization-customer-foreground',
        high: 'border-warning bg-warning text-warning-foreground',
        critical: 'border-destructive bg-destructive text-destructive-foreground',
      },
      size: {
        sm: cn('size-6 min-h-11 min-w-11', semanticSpacing.compact),
        default: cn('size-8 min-h-12 min-w-12', semanticSpacing.interactiveElementLarge),
        lg: cn('size-10 min-h-14 min-w-14', semanticSpacing.cardContainer),
      },
    },
    defaultVariants: {
      priority: 'medium',
      size: 'default',
    },
  }
)
