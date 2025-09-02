import { cva } from 'class-variance-authority'

export const priorityIndicatorVariants = cva(
  'flex items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      priority: {
        low: 'border-gray-300 bg-gray-100 text-gray-700',
        medium: 'border-blue-300 bg-blue-100 text-blue-700',
        high: 'border-orange-300 bg-orange-100 text-orange-700',
        critical: 'border-red-400 bg-red-100 text-red-800',
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
