import React from 'react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import type {
  SlotHeaderProps,
  SlotHeaderTitleProps,
  SlotHeaderActionsProps,
} from './SlotHeader.types'

/**
 * Internal title area component
 * Handles title, subtitle, meta, and icon composition
 */
const SlotHeaderTitle: React.FC<SlotHeaderTitleProps> = ({
  title,
  subtitle,
  meta,
  icon,
  className,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact'
  const isMinimal = variant === 'minimal'

  const titleClasses = cn(
    // Base title styling with responsive sizing
    isMinimal
      ? semanticTypography.h5 // Smaller for minimal variant
      : isCompact
        ? semanticTypography.h4 // Medium for compact
        : semanticTypography.h2, // Full size for default
    semanticTypography.tightSpacing,
    className
  )

  const titleContainerClasses = cn('flex flex-wrap items-center', semanticSpacing.gap.xs)

  const subtitleClasses = cn(
    semanticTypography.body,
    'text-muted-foreground',
    isCompact ? semanticSpacing.topGap.xxs : semanticSpacing.topGap.xs
  )

  return (
    <div className="min-w-0 flex-1">
      <div className={titleContainerClasses}>
        {/* Icon if provided */}
        {icon && (
          <div className={cn('shrink-0', isMinimal ? 'size-4' : isCompact ? 'size-5' : 'size-6')}>
            {icon}
          </div>
        )}

        {/* Title */}
        <h1 className={titleClasses}>{title}</h1>

        {/* Meta information (counts, badges, etc.) */}
        {meta && <div className="shrink-0">{meta}</div>}
      </div>

      {/* Subtitle/description */}
      {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
    </div>
  )
}

/**
 * Internal actions area component
 * Handles action composition without array processing
 */
const SlotHeaderActions: React.FC<SlotHeaderActionsProps> = ({
  actions,
  className,
  variant = 'default',
}) => {
  if (!actions) return null

  const isCompact = variant === 'compact'

  const actionsClasses = cn(
    'shrink-0',
    isCompact ? semanticSpacing.topGap.xs : semanticSpacing.topGap.xs,
    'sm:mt-0', // Remove top margin on desktop
    className
  )

  return <div className={actionsClasses}>{actions}</div>
}

/**
 * SlotHeader Component
 *
 * Header component optimized for slot-based composition.
 * Replaces PageHeader's array-based action handling with direct ReactNode composition.
 *
 * Key improvements over PageHeader:
 * - Direct ReactNode composition (no array handling)
 * - Simplified variant system
 * - Better TypeScript inference for slot content
 * - Optimized for PageLayout integration
 *
 * @example
 * ```tsx
 * <SlotHeader
 *   title="Organizations"
 *   subtitle="Manage your business relationships"
 *   meta={<Badge variant="secondary">{count}</Badge>}
 *   actions={
 *     <div className="flex gap-2">
 *       <Button variant="outline">Export</Button>
 *       <Button>Add Organization</Button>
 *     </div>
 *   }
 * />
 * ```
 */
export const SlotHeader: React.FC<SlotHeaderProps> = ({
  title,
  subtitle,
  meta,
  actions,
  icon,
  breadcrumb,
  className,
  titleClassName,
  actionsClassName,
  variant = 'default',
  align = 'space-between',
}) => {
  const isCompact = variant === 'compact'
  const isMinimal = variant === 'minimal'

  // Root header classes based on variant and alignment
  const headerClasses = cn(
    'flex flex-col',
    // Responsive layout: stack on mobile, side-by-side on desktop
    align === 'space-between' && 'sm:flex-row sm:items-start sm:justify-between',
    align === 'center' && 'sm:items-center sm:justify-center',
    align === 'left' && 'sm:items-start',
    // Spacing based on variant
    isMinimal
      ? semanticSpacing.gap.sm
      : isCompact
        ? semanticSpacing.gap.md
        : semanticSpacing.gap.lg,
    className
  )

  const titleAreaClasses = cn(
    'flex min-w-0 flex-1 items-start',
    isMinimal ? semanticSpacing.gap.sm : semanticSpacing.gap.lg
  )

  return (
    <header data-slot-header className={headerClasses}>
      {/* Breadcrumb navigation if provided */}
      {breadcrumb && (
        <nav
          className={cn(
            'w-full',
            isCompact ? semanticSpacing.bottomGap.xs : semanticSpacing.bottomGap.sm
          )}
        >
          {breadcrumb}
        </nav>
      )}

      {/* Main header content */}
      <div className={titleAreaClasses}>
        <SlotHeaderTitle
          title={title}
          subtitle={subtitle}
          meta={meta}
          icon={icon}
          className={titleClassName}
          variant={variant}
        />
      </div>

      {/* Actions area */}
      <SlotHeaderActions actions={actions} className={actionsClassName} variant={variant} />
    </header>
  )
}

// Default export
export default SlotHeader

// Named exports
export { SlotHeaderTitle, SlotHeaderActions }
export type { SlotHeaderProps, SlotHeaderTitleProps, SlotHeaderActionsProps }
