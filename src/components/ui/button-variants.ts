import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-nunito font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-md active:translate-y-0 focus-visible:ring-destructive',
        success:
          'bg-success text-success-foreground shadow-sm hover:-translate-y-0.5 hover:bg-success/90 hover:shadow-md active:translate-y-0 focus-visible:ring-success',
        warning:
          'bg-warning text-warning-foreground shadow-sm hover:-translate-y-0.5 hover:bg-warning/90 hover:shadow-md active:translate-y-0 focus-visible:ring-warning',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-secondary/80 hover:shadow-md active:translate-y-0',
        ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary/50',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary/50',
      },
      size: {
        sm: 'h-11 px-3 py-1.5 text-sm',
        default: 'h-12 px-6 py-3 text-base',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
