import { cva } from 'class-variance-authority'

export const priorityIndicatorVariants = cva(
  'flex items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--focus-ring))] focus:ring-offset-2',
  {
    variants: {
      priority: {
        low: 'border-priority-low bg-priority-low text-priority-low-foreground focus:ring-[hsl(var(--focus-ring-priority-low))]',
        medium: 'border-priority-medium bg-priority-medium text-priority-medium-foreground focus:ring-[hsl(var(--focus-ring-priority-medium))]',
        normal: 'border-primary bg-primary text-primary-foreground focus:ring-[hsl(var(--focus-ring-priority-normal))]',
        high: 'border-priority-high bg-priority-high text-priority-high-foreground focus:ring-[hsl(var(--focus-ring-priority-high))]',
        critical: 'border-priority-critical bg-priority-critical text-priority-critical-foreground focus:ring-[hsl(var(--focus-ring-priority-critical))]',
      },
      size: {
        sm: 'size-6 min-h-11 min-w-11 p-2',
        default: 'size-8 min-h-12 min-w-12 p-3',
        lg: 'size-10 min-h-14 min-w-14 p-4',
      },
    },
    defaultVariants: {
      priority: 'normal',
      size: 'default',
    },
  }
)
