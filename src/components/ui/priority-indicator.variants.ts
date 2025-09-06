import { cva } from 'class-variance-authority'

export const priorityIndicatorVariants = cva(
  'flex items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      priority: {
        low: 'border-muted bg-muted text-muted-foreground',
        medium: 'border-organization-customer bg-organization-customer text-organization-customer-foreground',
        high: 'border-warning bg-warning text-warning-foreground',
        critical: 'border-destructive bg-destructive text-destructive-foreground',
      },
      size: {
        sm: 'size-6 min-h-11 min-w-11 p-2',
        default: 'size-8 min-h-12 min-w-12 p-3',
        lg: 'size-10 min-h-14 min-w-14 p-4',
      },
    },
    defaultVariants: {
      priority: 'medium',
      size: 'default',
    },
  }
)
