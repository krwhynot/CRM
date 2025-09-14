import { cva } from 'class-variance-authority'
import {
  semanticSpacing,
  semanticTypography,
  semanticColors,
  semanticShadows,
  semanticRadius,
  fontWeight,
} from '@/styles/tokens'

export const buttonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap font-nunito transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${semanticTypography.navItem} ${semanticRadius.button} ${semanticColors.focusRing}`,
  {
    variants: {
      variant: {
        default:
          `bg-primary text-primary-foreground ${semanticShadows.button} hover:-translate-y-0.5 hover:bg-primary/90 hover:${semanticShadows.buttonHover} active:translate-y-0`,
        destructive:
          `bg-destructive text-destructive-foreground ${semanticShadows.button} hover:-translate-y-0.5 hover:bg-destructive/90 hover:${semanticShadows.buttonHover} focus-visible:ring-destructive active:translate-y-0`,
        success:
          `bg-success text-success-foreground ${semanticShadows.button} hover:-translate-y-0.5 hover:bg-success/90 hover:${semanticShadows.buttonHover} focus-visible:ring-success active:translate-y-0`,
        warning:
          `bg-warning text-warning-foreground ${semanticShadows.button} hover:-translate-y-0.5 hover:bg-warning/90 hover:${semanticShadows.buttonHover} focus-visible:ring-warning active:translate-y-0`,
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
        secondary:
          `bg-secondary text-secondary-foreground ${semanticShadows.button} hover:-translate-y-0.5 hover:bg-secondary/80 hover:${semanticShadows.buttonHover} active:translate-y-0`,
        ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary/50',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary/50',
      },
      size: {
        sm: `h-11 ${semanticSpacing.compactX} ${semanticSpacing.verticalPadding.lg} ${semanticTypography.caption} ${fontWeight.medium}`,
        default: `h-12 ${semanticSpacing.cardX} ${semanticSpacing.verticalPadding.lg} ${semanticTypography.body} ${fontWeight.medium}`,
        lg: `h-14 ${semanticSpacing.cardX} ${semanticSpacing.verticalPadding.xl} ${semanticTypography.heading} ${fontWeight.medium}`,
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
