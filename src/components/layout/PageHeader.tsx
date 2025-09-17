import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { FilterLayoutToggle } from '@/components/data-table/filters/FilterLayoutToggle'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  children?: React.ReactNode
  className?: string
  /**
   * Show layout toggle controls (useful for development and testing)
   */
  showLayoutToggle?: boolean
  /**
   * Show layout debug information (development only)
   */
  showLayoutDebug?: boolean
}

/**
 * Simple page header component for consistent page titles and actions.
 * Provides standard layout for page title, optional description, and action button.
 * Works with breadcrumb navigation in PageLayout for consistent page structure.
 * Optionally includes layout toggle controls for development and testing.
 */
export function PageHeader({
  title,
  description,
  action,
  children,
  className,
  showLayoutToggle = false,
  showLayoutDebug = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Layout toggle controls (development/testing) */}
        {showLayoutToggle && <FilterLayoutToggle showDebugInfo={showLayoutDebug} compact />}

        {children}
        {action && (
          <Button onClick={action.onClick}>
            {action.icon || <Plus className="size-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
