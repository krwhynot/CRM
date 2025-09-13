import React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticShadows,
} from '@/styles/tokens'

interface LoadingStateProps {
  message?: string
  subtext?: string
  variant?: 'default' | 'table' | 'skeleton'
  rows?: number // For skeleton variant
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  subtext = 'This should only take a few seconds',
  variant = 'default',
  rows = 5,
  className,
}) => {
  if (variant === 'skeleton') {
    return (
      <div
        className={cn(semanticSpacing.stack.lg, className)}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className={semanticSpacing.stack.sm}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div
        className={cn(
          `text-center ${semanticSpacing.sectionContainer} bg-card ${semanticRadius.card} border ${semanticShadows.card}`,
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className={semanticSpacing.stack.lg}>
          <div className="flex justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <div className={semanticSpacing.stack.sm}>
            <div className={cn(semanticTypography.h4, 'text-card-foreground')}>{message}</div>
            <div className={`${semanticTypography.body} text-muted-foreground`}>{subtext}</div>
          </div>
        </div>
        <span className="sr-only">{message}</span>
      </div>
    )
  }

  return (
    <div
      className={cn('text-center py-12 bg-card rounded-lg border shadow-sm', className)}
      role="status"
      aria-live="polite"
    >
      <div className={`${semanticSpacing.stack.md}`}>
        <div className="flex justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticTypography.h4, 'text-card-foreground')}>{message}</div>
          <div className={cn(semanticTypography.body, 'text-muted-foreground')}>{subtext}</div>
        </div>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  variant?: 'default' | 'destructive' | 'warning'
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  variant = 'default',
  className,
}) => {
  const iconColor =
    variant === 'destructive'
      ? 'text-destructive'
      : variant === 'warning'
        ? 'text-warning-foreground'
        : 'text-muted-foreground'

  const titleColor =
    variant === 'destructive'
      ? 'text-destructive'
      : variant === 'warning'
        ? 'text-warning-foreground'
        : 'text-card-foreground'

  return (
    <div
      className={cn('text-center py-12 bg-card rounded-lg border shadow-sm', className)}
      role="alert"
    >
      <div className={cn(semanticSpacing.stack.lg, 'mx-auto max-w-md')}>
        <div className="flex justify-center">
          <AlertCircle className={cn('h-12 w-12', iconColor)} />
        </div>
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn('text-lg font-semibold', titleColor)}>{title}</div>
          <div
            className={cn(
              semanticTypography.body,
              semanticTypography.relaxedLine,
              'text-muted-foreground'
            )}
          >
            {message}
          </div>
        </div>
        {onRetry && (
          <div className="pt-2">
            <Button
              onClick={onRetry}
              variant={variant === 'destructive' ? 'destructive' : 'outline'}
              className="mobile-touch-target"
            >
              <RefreshCw className={cn(semanticSpacing.rightGap.xs, 'size-4')} />
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  message = 'Get started by adding your first item',
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('text-center py-16 bg-card rounded-lg border shadow-sm', className)}>
      <div className={cn(semanticSpacing.stack.lg, 'mx-auto max-w-md')}>
        {icon && <div className="flex justify-center text-muted">{icon}</div>}
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticTypography.h3, semanticTypography.h4, 'text-card-foreground')}>
            {title}
          </div>
          <div
            className={cn(
              semanticTypography.body,
              semanticTypography.relaxedLine,
              'text-muted-foreground'
            )}
          >
            {message}
          </div>
        </div>
        {action && (
          <div className="pt-2">
            <Button onClick={action.onClick} className="mobile-touch-target">
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
