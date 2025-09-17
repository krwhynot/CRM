import { cva } from 'class-variance-authority'

export const statusIndicatorVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'border border-success bg-success text-success-foreground hover:bg-success/90',
        warning: 'border border-warning bg-warning text-warning-foreground hover:bg-warning/90',
        info: 'border border-info bg-info text-info-foreground hover:bg-info/90',
        destructive:
          'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
        // CRM-specific workflow states
        'data-valid': 'border border-[hsl(var(--data-valid))] bg-[hsl(var(--data-valid))] text-[hsl(var(--data-valid-foreground))] hover:bg-[hsl(var(--data-valid))]/90',
        'data-invalid': 'border border-[hsl(var(--data-invalid))] bg-[hsl(var(--data-invalid))] text-[hsl(var(--data-invalid-foreground))] hover:bg-[hsl(var(--data-invalid))]/90',
        'data-pending': 'border border-[hsl(var(--data-pending))] bg-[hsl(var(--data-pending))] text-[hsl(var(--data-pending-foreground))] hover:bg-[hsl(var(--data-pending))]/90',
        'sync-synced': 'border border-[hsl(var(--sync-synced))] bg-[hsl(var(--sync-synced))] text-[hsl(var(--sync-synced-foreground))] hover:bg-[hsl(var(--sync-synced))]/90',
        'sync-pending': 'border border-[hsl(var(--sync-pending))] bg-[hsl(var(--sync-pending))] text-[hsl(var(--sync-pending-foreground))] hover:bg-[hsl(var(--sync-pending))]/90',
        'sync-error': 'border border-[hsl(var(--sync-error))] bg-[hsl(var(--sync-error))] text-[hsl(var(--sync-error-foreground))] hover:bg-[hsl(var(--sync-error))]/90',
      },
      size: {
        sm: 'h-11 min-w-11 px-3 py-2 text-xs',
        default: 'h-12 min-w-12 px-4 py-2 text-sm',
        lg: 'h-14 min-w-14 px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
