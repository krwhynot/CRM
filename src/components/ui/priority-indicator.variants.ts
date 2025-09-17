import { cva } from 'class-variance-authority'

export const priorityIndicatorVariants = cva(
  'flex items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      priority: {
        low: 'border-priority-low bg-priority-low text-priority-low-foreground',
        medium: 'border-priority-medium bg-priority-medium text-priority-medium-foreground',
        normal: 'border-priority-normal bg-priority-normal text-priority-normal-foreground',
        high: 'border-priority-high bg-priority-high text-priority-high-foreground',
        critical: 'border-priority-critical bg-priority-critical text-priority-critical-foreground',
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
