import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
/**
 * Standardized Loading States
 *
 * Unified loading components for consistent user experience across the CRM.
 * Includes skeletons, spinners, and progress indicators with accessibility support.
 */

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Loader2, RefreshCw } from 'lucide-react'

// =============================================================================
// SPINNER COMPONENTS
// =============================================================================

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  'aria-label'?: string
}

export function Spinner({ size = 'md', className, 'aria-label': ariaLabel }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      aria-label={ariaLabel || 'Loading'}
      role="status"
    />
  )
}

export function RefreshSpinner({ size = 'md', className, 'aria-label': ariaLabel }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <RefreshCw
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      aria-label={ariaLabel || 'Refreshing'}
      role="status"
    />
  )
}

// =============================================================================
// LOADING OVERLAY
// =============================================================================

interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  message?: string
  className?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
  blur?: boolean
}

export function LoadingOverlay({
  loading,
  children,
  message = 'Loading...',
  className,
  spinnerSize = 'md',
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-background/80 z-10',
            blur && 'backdrop-blur-sm'
          )}
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          <div className={cn(semanticSpacing.gap.sm, 'flex flex-col items-center')}>
            <Spinner size={spinnerSize} />
            <span className={cn(semanticTypography.body, 'text-muted-foreground')}>{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// PROGRESS INDICATORS
// =============================================================================

interface LoadingProgressProps {
  progress: number
  message?: string
  showPercentage?: boolean
  className?: string
}

export function LoadingProgress({
  progress,
  message,
  showPercentage = true,
  className,
}: LoadingProgressProps) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        {message && (
          <span className={cn(semanticTypography.body, 'text-muted-foreground')}>{message}</span>
        )}
        {showPercentage && (
          <span className={cn(semanticTypography.body, semanticTypography.label)}>
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

// =============================================================================
// SKELETON COMPONENTS
// =============================================================================

interface TableSkeletonProps {
  rows?: number
  columns?: number
  hasHeader?: boolean
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading table">
      {hasHeader && (
        <div className={cn(semanticSpacing.gap.md, 'flex')}>
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className={`${semanticSpacing.stack.xs}`}>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className={cn(semanticSpacing.gap.md, 'flex')}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  'h-8',
                  colIndex === 0 ? 'flex-[2]' : 'flex-1' // First column wider
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface CardSkeletonProps {
  count?: number
  className?: string
  cardClassName?: string
}

export function CardSkeleton({ count = 3, className, cardClassName }: CardSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Loading cards">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn('rounded-lg border p-4 space-y-3', cardClassName)}>
          <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
            <Skeleton className={cn(semanticRadius.full, 'h-10 w-10')} />
            <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className={`${semanticSpacing.stack.xs}`}>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface FormSkeletonProps {
  fields?: number
  hasSubmitButton?: boolean
  className?: string
}

export function FormSkeleton({ fields = 5, hasSubmitButton = true, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} role="status" aria-label="Loading form">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      {hasSubmitButton && (
        <div className={cn(semanticSpacing.inline.xs, 'flex justify-end')}>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  )
}

interface DashboardSkeletonProps {
  hasHeader?: boolean
  hasStats?: boolean
  hasCharts?: boolean
  hasTable?: boolean
  className?: string
}

export function DashboardSkeleton({
  hasHeader = true,
  hasStats = true,
  hasCharts = true,
  hasTable = true,
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} role="status" aria-label="Loading dashboard">
      {hasHeader && (
        <div className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {hasStats && (
        <div
          className={cn(semanticSpacing.gap.md, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4')}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={cn(
                semanticRadius.large,
                semanticSpacing.cardContainer,
                semanticSpacing.stack.xs,
                'border'
              )}
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      )}

      {hasCharts && (
        <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 lg:grid-cols-2')}>
          <div
            className={cn(
              semanticRadius.large,
              semanticSpacing.cardContainer,
              semanticSpacing.stack.md,
              'border'
            )}
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div
            className={cn(
              semanticRadius.large,
              semanticSpacing.cardContainer,
              semanticSpacing.stack.md,
              'border'
            )}
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {hasTable && (
        <div className={cn(semanticRadius.large, semanticSpacing.cardContainer, 'border')}>
          <div className={`${semanticSpacing.stack.md}`}>
            <Skeleton className="h-5 w-32" />
            <TableSkeleton rows={8} columns={5} />
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// LIST SKELETONS
// =============================================================================

interface ListSkeletonProps {
  count?: number
  showAvatar?: boolean
  showActions?: boolean
  className?: string
}

export function ListSkeleton({
  count = 5,
  showAvatar = true,
  showActions = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading list">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            semanticSpacing.inline.sm,
            semanticSpacing.compact,
            semanticRadius.large,
            'flex items-center border'
          )}
        >
          {showAvatar && <Skeleton className={cn(semanticRadius.full, 'h-8 w-8')} />}
          <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showActions && <Skeleton className="h-6 w-16" />}
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// EMPTY STATES
// =============================================================================

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function EmptyState({ title, description, action, icon: Icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && (
        <Icon className={cn(semanticSpacing.bottomGap.sm, 'h-12 w-12 text-muted-foreground')} />
      )}
      <h3
        className={cn(
          semanticTypography.h4,
          semanticTypography.h4,
          semanticSpacing.bottomGap.xs,
          'text-foreground'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            semanticTypography.body,
            semanticSpacing.bottomGap.sm,
            'text-muted-foreground max-w-sm'
          )}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

// =============================================================================
// INLINE LOADING STATES
// =============================================================================

interface InlineLoadingProps {
  text?: string
  size?: 'sm' | 'md'
  className?: string
}

export function InlineLoading({ text = 'Loading', size = 'sm', className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="status">
      <Spinner size={size} />
      <span className={cn('text-muted-foreground', size === 'sm' ? 'text-sm' : 'text-base')}>
        {text}...
      </span>
    </div>
  )
}

interface ButtonLoadingProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function ButtonLoading({ loading, children, loadingText }: ButtonLoadingProps) {
  return (
    <>
      {loading && <Spinner size="sm" className={`${semanticSpacing.rightGap.xs}`} />}
      {loading && loadingText ? loadingText : children}
    </>
  )
}

// =============================================================================
// ERROR STATES
// =============================================================================

interface ErrorStateProps {
  title: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div
        className={cn(
          semanticRadius.full,
          semanticSpacing.bottomGap.sm,
          'h-12 w-12 bg-destructive/10 flex items-center justify-center'
        )}
      >
        <span className={cn(semanticTypography.h3, 'text-destructive')}>!</span>
      </div>
      <h3
        className={cn(
          semanticTypography.h4,
          semanticTypography.h4,
          semanticSpacing.bottomGap.xs,
          'text-foreground'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            semanticTypography.body,
            semanticSpacing.bottomGap.sm,
            'text-muted-foreground max-w-sm'
          )}
        >
          {description}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(semanticTypography.body, 'text-primary hover:underline')}
        >
          Try again
        </button>
      )}
    </div>
  )
}

// =============================================================================
// HOOK FOR LOADING STATES
// =============================================================================

export function useLoadingState(initialLoading = false) {
  const [loading, setLoading] = React.useState(initialLoading)
  const [error, setError] = React.useState<string | null>(null)

  const withLoading = React.useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        setLoading(true)
        setError(null)
        const result = await asyncFn()
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return undefined
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    loading,
    error,
    setLoading,
    setError,
    withLoading,
  }
}
