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
          <div className="flex flex-col items-center gap-3">
            <Spinner size={spinnerSize} />
            <span className="text-sm text-muted-foreground">{message}</span>
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
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
        {showPercentage && (
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
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
        <div className="flex gap-4">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
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
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
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

export function FormSkeleton({
  fields = 5,
  hasSubmitButton = true,
  className,
}: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} role="status" aria-label="Loading form">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      {hasSubmitButton && (
        <div className="flex justify-end space-x-2">
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
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {hasStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      )}

      {hasCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {hasTable && (
        <div className="rounded-lg border p-4">
          <div className="space-y-4">
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
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
          {showAvatar && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className="flex-1 space-y-2">
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

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
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
      {loading && <Spinner size="sm" className="mr-2" />}
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
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-destructive text-xl">!</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
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

  const withLoading = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T | undefined> => {
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
  }, [])

  return {
    loading,
    error,
    setLoading,
    setError,
    withLoading,
  }
}