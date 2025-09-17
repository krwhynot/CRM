import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertCircle, Search, Plus, Database } from 'lucide-react'

export interface EmptyStateProps {
  /** Main title text */
  title: string
  /** Optional description text */
  description?: string
  /** Icon to display (defaults to appropriate icon based on variant) */
  icon?: React.ReactNode
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  /** Visual variant of the empty state */
  variant?: 'default' | 'search' | 'create' | 'error'
  /** Additional CSS classes */
  className?: string
  /** Size of the empty state */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Flexible EmptyState component for consistent no-data displays
 *
 * Supports different scenarios:
 * - default: General empty state
 * - search: No search results
 * - create: Encourages creation of first item
 * - error: Error state with retry option
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className,
  size = 'md',
}) => {
  // Default icons based on variant
  const getDefaultIcon = () => {
    const iconSize = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-12 w-12'
    const iconClass = cn(iconSize, 'text-muted-foreground/60')

    switch (variant) {
      case 'search':
        return <Search className={iconClass} />
      case 'create':
        return <Plus className={iconClass} />
      case 'error':
        return <AlertCircle className={iconClass} />
      default:
        return <Database className={iconClass} />
    }
  }

  // Size-based styling
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-8',
          title: 'text-base font-medium',
          description: 'text-sm',
          spacing: 'space-y-3',
          iconSpacing: 'mb-3',
          maxWidth: 'max-w-sm',
        }
      case 'lg':
        return {
          container: 'py-20',
          title: 'text-2xl font-semibold',
          description: 'text-base',
          spacing: 'space-y-6',
          iconSpacing: 'mb-6',
          maxWidth: 'max-w-lg',
        }
      default: // md
        return {
          container: 'py-12',
          title: 'text-xl font-semibold',
          description: 'text-sm',
          spacing: 'space-y-4',
          iconSpacing: 'mb-4',
          maxWidth: 'max-w-md',
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div
      className={cn(
        'text-center flex flex-col items-center justify-center',
        sizeClasses.container,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn('mx-auto', sizeClasses.spacing, sizeClasses.maxWidth)}>
        {/* Icon */}
        <div className={cn('flex justify-center', sizeClasses.iconSpacing)}>
          {icon || getDefaultIcon()}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={cn(sizeClasses.title, 'text-foreground')}>{title}</h3>
          {description && (
            <p className={cn(sizeClasses.description, 'text-muted-foreground leading-relaxed')}>
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {action && (
          <div className="pt-4">
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="mobile-touch-target"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Preset configurations for common scenarios
export const EmptyStatePresets = {
  noData: (entityName: string, onAdd?: () => void): EmptyStateProps => ({
    title: `No ${entityName} found`,
    description: `Start by creating your first ${entityName.toLowerCase()}`,
    variant: 'create',
    action: onAdd
      ? {
          label: `Add ${entityName}`,
          onClick: onAdd,
        }
      : undefined,
  }),

  noSearchResults: (searchTerm?: string): EmptyStateProps => ({
    title: 'No results found',
    description: searchTerm
      ? `No results match "${searchTerm}". Try adjusting your search terms.`
      : 'Try adjusting your search terms or filters.',
    variant: 'search',
  }),

  error: (onRetry?: () => void): EmptyStateProps => ({
    title: 'Unable to load data',
    description: 'Something went wrong while loading the data. Please try again.',
    variant: 'error',
    action: onRetry
      ? {
          label: 'Try again',
          onClick: onRetry,
          variant: 'outline',
        }
      : undefined,
  }),

  filtered: (onClearFilters?: () => void): EmptyStateProps => ({
    title: 'No matches found',
    description: 'No items match your current filters. Try adjusting or clearing them.',
    variant: 'search',
    action: onClearFilters
      ? {
          label: 'Clear filters',
          onClick: onClearFilters,
          variant: 'outline',
        }
      : undefined,
  }),
}

export default EmptyState
