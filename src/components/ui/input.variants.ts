import { cva } from 'class-variance-authority'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'

export const inputVariants = cva(
  `flex w-full ${semanticRadius.default} border border-input bg-background ${semanticSpacing.compactX} ${semanticSpacing.compactY} ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
  {
    variants: {
      size: {
        default: `h-12 ${semanticTypography.body} file:${semanticTypography.body}`,
        sm: `h-11 ${semanticTypography.body} file:${semanticTypography.body}`,
        lg: `h-14 ${semanticTypography.h3} file:${semanticTypography.h3}`,
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)
