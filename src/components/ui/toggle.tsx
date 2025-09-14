'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius, semanticShadows } from '@/styles/tokens'

const toggleVariants = cva(
  `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex items-center justify-center gap-2 whitespace-nowrap ${semanticRadius.button} ${semanticTypography.body} font-medium outline-none transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          `${semanticShadows.subtle} border border-input bg-transparent hover:bg-accent hover:text-accent-foreground`,
      },
      size: {
        default: `h-9 min-w-9 ${semanticSpacing.compactX}`,
        sm: `h-8 min-w-8 ${semanticSpacing.compactX}`,
        lg: `h-10 min-w-10 ${semanticSpacing.standardX}`,
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
