import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Base Skeleton Variants
import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
const skeletonVariants = cva('animate-pulse rounded bg-muted', {
  variants: {
    variant: {
      default: 'bg-muted',
      shimmer: 'animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted',
      pulse: 'animate-pulse-slow bg-muted',
    },
    size: {
      xs: 'h-3',
      sm: 'h-4',
      md: 'h-5',
      lg: 'h-6',
      xl: 'h-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

// Base Skeleton Component
export interface SkeletonProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'default',
  size,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
}

// Text Skeleton Component
export interface TextSkeletonProps {
  lines?: number
  className?: string
  lastLineWidth?: string
  lineHeight?: 'xs' | 'sm' | 'md' | 'lg'
}

export function TextSkeleton({
  lines = 3,
  className,
  lastLineWidth = '75%',
  lineHeight = 'md',
}: TextSkeletonProps) {
  const heights = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-5',
    lg: 'h-6',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(heights[lineHeight], i === lines - 1 ? '' : 'w-full')}
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  )
}

// Avatar Skeleton Component
export interface AvatarSkeletonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AvatarSkeleton({ size = 'md', className }: AvatarSkeletonProps) {
  const sizeClasses = {
    xs: 'size-6',
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-16',
  }

  return <Skeleton className={cn(sizeClasses[size], 'rounded-full shrink-0', className)} />
}

// Table Skeleton Component
export interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showActions?: boolean
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showActions = true,
  className,
}: TableSkeletonProps) {
  const actualColumns = showActions ? columns + 1 : columns

  return (
    <div className={cn('space-y-3', className)}>
      {/* Table Header */}
      {showHeader && (
        <div className={cn(semanticSpacing.inline.md, 'flex items-center pb-2 border-b')}>
          {Array.from({ length: actualColumns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              className={cn(
                'h-4',
                i === actualColumns - 1 && showActions
                  ? 'w-16' // Actions column
                  : 'flex-1'
              )}
            />
          ))}
        </div>
      )}
      {/* Table Rows */}
      <div className={`${semanticSpacing.stack.sm}`}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={cn(semanticSpacing.inline.md, semanticSpacing.compactY, 'flex items-center')}
          >
            {Array.from({ length: actualColumns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(colIndex === actualColumns - 1 && showActions ? 'w-16' : 'flex-1')}
              >
                {colIndex === 0 ? (
                  // First column often has more complex content
                  <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                    <AvatarSkeleton size="sm" />
                    <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : colIndex === actualColumns - 1 && showActions ? (
                  // Actions column
                  <div className={cn(semanticSpacing.inline.xs, 'flex')}>
                    <Skeleton className={cn(semanticRadius.small, 'h-6 w-6')} />
                    <Skeleton className={cn(semanticRadius.small, 'h-6 w-6')} />
                  </div>
                ) : (
                  // Regular content columns
                  <Skeleton className="h-4" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Card Skeleton Component
export interface CardSkeletonProps {
  showHeader?: boolean
  showFooter?: boolean
  contentLines?: number
  className?: string
}

export function CardSkeleton({
  showHeader = true,
  showFooter = false,
  contentLines = 3,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn('border rounded-lg p-4 space-y-4', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className={`${semanticSpacing.stack.xs}`}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className={cn(semanticRadius.small, 'h-6 w-6')} />
        </div>
      )}

      {/* Content */}
      <div className={`${semanticSpacing.stack.sm}`}>
        <TextSkeleton lines={contentLines} />
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="flex items-center justify-between border-t pt-2">
          <Skeleton className="h-4 w-20" />
          <div className={cn(semanticSpacing.inline.xs, 'flex')}>
            <Skeleton className={cn(semanticRadius.small, 'h-8 w-16')} />
            <Skeleton className={cn(semanticRadius.small, 'h-8 w-16')} />
          </div>
        </div>
      )}
    </div>
  )
}

// List Skeleton Component
export interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  showMetadata?: boolean
  className?: string
}

export function ListSkeleton({
  items = 5,
  showAvatar = true,
  showMetadata = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn(
            semanticSpacing.inline.sm,
            semanticSpacing.compact,
            semanticRadius.large,
            'flex items-center border'
          )}
        >
          {showAvatar && <AvatarSkeleton size="md" />}
          <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              {showMetadata && <Skeleton className="h-3 w-16" />}
            </div>
            <Skeleton className="h-3 w-48" />
            {showMetadata && (
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Skeleton className={cn(semanticRadius.full, 'h-2 w-2')} />
                <Skeleton className="h-3 w-20" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard Metric Skeleton
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border rounded-lg p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className={cn(semanticRadius.small, 'h-4 w-4')} />
      </div>
      <div className={`${semanticSpacing.stack.xs}`}>
        <Skeleton className="h-8 w-20" />
        <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
          <Skeleton className={cn(semanticRadius.small, 'h-3 w-3')} />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Contact Card Skeleton
export function ContactCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border rounded-lg p-4 space-y-4', className)}>
      <div className={cn(semanticSpacing.inline.sm, 'flex items-start')}>
        <AvatarSkeleton size="lg" />
        <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className={cn(semanticSpacing.inline.xs, 'flex')}>
            <Skeleton className={cn(semanticRadius.full, 'h-5 w-12')} />
            <Skeleton className={cn(semanticRadius.full, 'h-5 w-16')} />
          </div>
        </div>
      </div>
      <div className={`${semanticSpacing.stack.xs}`}>
        <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}

// Organization Card Skeleton
export function OrganizationCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border rounded-lg p-4 space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
          <div
            className={cn(
              semanticRadius.large,
              'size-12 bg-muted animate-pulse flex items-center justify-center'
            )}
          >
            <Skeleton className="size-6" />
          </div>
          <div className={`${semanticSpacing.stack.xs}`}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className={cn(semanticRadius.small, 'h-6 w-6')} />
      </div>
      <div className={cn(semanticSpacing.gap.md, 'grid grid-cols-2')}>
        <div className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// Opportunity Card Skeleton
export function OpportunityCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border rounded-lg p-4 space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className={cn(semanticSpacing.stack.xs, 'text-right')}>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className={`${semanticSpacing.stack.sm}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticTypography.body, 'flex justify-between')}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className={cn(semanticRadius.full, 'h-2 w-full')} />
        </div>
      </div>
    </div>
  )
}

// Activity Feed Skeleton
export function ActivityFeedSkeleton({
  items = 5,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className={cn(semanticSpacing.inline.sm, 'flex items-start')}>
          <AvatarSkeleton size="sm" />
          <div className={cn(semanticSpacing.stack.xs, 'flex-1')}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-64" />
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              <Skeleton className={cn(semanticRadius.small, 'h-4 w-4')} />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Form Skeleton
export interface FormSkeletonProps {
  fields?: number
  showActions?: boolean
  className?: string
}

export function FormSkeleton({ fields = 4, showActions = true, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className={cn(semanticRadius.default, 'h-10 w-full')} />
        </div>
      ))}

      {showActions && (
        <div className={cn(semanticSpacing.inline.xs, 'flex items-center justify-end pt-4')}>
          <Skeleton className={cn(semanticRadius.default, 'h-9 w-20')} />
          <Skeleton className={cn(semanticRadius.default, 'h-9 w-16')} />
        </div>
      )}
    </div>
  )
}

// Navigation Skeleton
export function NavigationSkeleton({
  items = 6,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn(semanticSpacing.inline.sm, semanticSpacing.compact, 'flex items-center')}
        >
          <Skeleton className={cn(semanticRadius.small, 'h-4 w-4')} />
          <Skeleton className="h-4 flex-1" />
          {Math.random() > 0.5 && <Skeleton className={cn(semanticRadius.full, 'h-4 w-8')} />}
        </div>
      ))}
    </div>
  )
}

// Chart Skeleton
export function ChartSkeleton({
  type = 'bar',
  className,
}: {
  type?: 'bar' | 'line' | 'pie' | 'area'
  className?: string
}) {
  return (
    <div className={cn('border rounded-lg p-4', className)}>
      <div className={cn(semanticSpacing.bottomGap.sm, 'flex items-center justify-between')}>
        <div className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className={cn(semanticRadius.small, 'h-6 w-6')} />
      </div>
      <div className={cn(semanticSpacing.inline.xs, 'h-64 flex items-end justify-between')}>
        {type === 'bar' && (
          <>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  minHeight: '20%',
                }}
              />
            ))}
          </>
        )}

        {type === 'pie' && (
          <div className="flex w-full items-center justify-center">
            <div className="relative">
              <Skeleton className={cn(semanticRadius.full, 'h-40 w-40')} />
              <Skeleton
                className={cn(
                  semanticRadius.full,
                  'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-background'
                )}
              />
            </div>
          </div>
        )}

        {(type === 'line' || type === 'area') && (
          <div className="relative size-full">
            <Skeleton className="absolute bottom-0 left-0 w-full h-1/2 ${semanticRadius.default}-t-lg" />
            <div className="absolute bottom-0 left-0 flex size-full items-end">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <Skeleton
                    className="w-1 bg-primary/20"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Page Skeleton (combines multiple skeletons)
export function PageSkeleton({
  layout = 'dashboard',
  className,
}: {
  layout?: 'dashboard' | 'list' | 'detail'
  className?: string
}) {
  if (layout === 'dashboard') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Metrics */}
        <div
          className={cn(semanticSpacing.gap.md, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4')}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts */}
        <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 lg:grid-cols-2')}>
          <ChartSkeleton type="bar" />
          <ChartSkeleton type="line" />
        </div>
      </div>
    )
  }

  if (layout === 'list') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={`${semanticSpacing.stack.xs}`}>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className={cn(semanticSpacing.inline.xs, 'flex')}>
            <Skeleton className={cn(semanticRadius.default, 'h-9 w-20')} />
            <Skeleton className={cn(semanticRadius.default, 'h-9 w-24')} />
          </div>
        </div>

        {/* Filters */}
        <div className={cn(semanticSpacing.inline.xs, 'flex')}>
          <Skeleton className={cn(semanticRadius.default, 'h-9 w-32')} />
          <Skeleton className={cn(semanticRadius.default, 'h-9 w-28')} />
          <Skeleton className={cn(semanticRadius.default, 'h-9 w-24')} />
        </div>

        {/* Table */}
        <TableSkeleton rows={8} columns={5} />
      </div>
    )
  }

  if (layout === 'detail') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={cn(semanticSpacing.inline.md, 'flex items-center')}>
            <AvatarSkeleton size="xl" />
            <div className={`${semanticSpacing.stack.xs}`}>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className={cn(semanticSpacing.inline.xs, 'flex')}>
                <Skeleton className={cn(semanticRadius.full, 'h-6 w-16')} />
                <Skeleton className={cn(semanticRadius.full, 'h-6 w-20')} />
              </div>
            </div>
          </div>
          <div className={cn(semanticSpacing.inline.xs, 'flex')}>
            <Skeleton className={cn(semanticRadius.default, 'h-9 w-16')} />
            <Skeleton className={cn(semanticRadius.default, 'h-9 w-20')} />
          </div>
        </div>

        {/* Content */}
        <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 lg:grid-cols-3')}>
          <div className={cn(semanticSpacing.stack.lg, 'lg:col-span-2')}>
            <CardSkeleton showHeader contentLines={4} />
            <CardSkeleton showHeader contentLines={3} />
          </div>
          <div className={`${semanticSpacing.stack.md}`}>
            <ListSkeleton items={3} />
          </div>
        </div>
      </div>
    )
  }

  return null
}
