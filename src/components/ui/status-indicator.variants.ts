import { cva } from 'class-variance-authority'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'

export const statusIndicatorVariants = cva(
  `inline-flex items-center justify-center ${semanticRadius.button} font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'border border-success bg-success text-success-foreground hover:bg-success/90',
        warning: 'border border-warning bg-warning text-warning-foreground hover:bg-warning/90',
        destructive:
          'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: `h-11 min-w-11 ${semanticSpacing.compactX} py-2 ${semanticTypography.caption}`,
        default: `h-12 min-w-12 ${semanticSpacing.cardContainer} py-2 ${semanticTypography.body}`,
        lg: `h-14 min-w-14 ${semanticSpacing.sectionContainer} ${semanticSpacing.compactY} ${semanticTypography.h6}`,
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
