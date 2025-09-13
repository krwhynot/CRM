import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'

const alertVariants = cva(
  cn(
    'relative grid w-full grid-cols-1 items-start border has-[>svg]:grid-cols-[1rem_1fr] [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    semanticSpacing.cardContainer,
    semanticSpacing.gap.xs + ' gap-y-0.5 has-[>svg]:gap-x-3',
    semanticRadius.lg,
    semanticTypography.body
  ),
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start [&_p]:leading-relaxed',
        semanticSpacing.gap.xs,
        semanticTypography.body,
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
