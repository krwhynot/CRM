import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Trash2, X, CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BulkAction {
  /** Unique identifier for the action */
  id: string
  /** Display label for the action */
  label: string
  /** Icon component to display */
  icon: React.ComponentType<{ className?: string }>
  /** Action handler */
  onClick: () => void
  /** Whether the action is destructive (affects styling) */
  destructive?: boolean
  /** Whether the action is disabled */
  disabled?: boolean
  /** Tooltip text for the action */
  tooltip?: string
}

export interface BulkActionsToolbarProps {
  /** Number of selected items */
  selectedCount: number
  /** Total number of available items */
  totalCount: number
  /** Whether bulk operations are currently running */
  isLoading?: boolean
  /** Custom bulk actions */
  actions?: BulkAction[]
  /** Show default delete action */
  showDelete?: boolean
  /** Delete action handler */
  onDelete?: () => void
  /** Clear selection handler */
  onClearSelection: () => void
  /** Select all handler */
  onSelectAll: () => void
  /** Select none handler */
  onSelectNone: () => void
  /** Entity type for display (e.g., "organizations", "contacts") */
  entityType?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable bulk actions toolbar component
 * Extracted from individual table components to provide consistent bulk operations UI
 */
export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  isLoading = false,
  actions = [],
  showDelete = true,
  onDelete,
  onClearSelection,
  onSelectAll,
  onSelectNone,
  entityType = 'items',
  className,
}: BulkActionsToolbarProps) {
  // Don't render if no items are available
  if (totalCount === 0) return null

  // Show minimal toolbar when nothing is selected
  if (selectedCount === 0) {
    return (
      <div className={cn("flex items-center justify-between py-2", className)}>
        <div className="text-sm text-gray-500">
          {totalCount} {entityType}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="h-8"
          >
            <CheckSquare className="h-3 w-3 mr-1" />
            Select All
          </Button>
        </div>
      </div>
    )
  }

  // Show full toolbar when items are selected
  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {selectedCount} selected
          </Badge>
          
          <div className="text-sm text-gray-600">
            {selectedCount} of {totalCount} {entityType} selected
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedCount === totalCount ? onSelectNone : onSelectAll}
            disabled={isLoading}
            className="h-8"
          >
            {selectedCount === totalCount ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-3 w-3 mr-1" />
                Select All
              </>
            )}
          </Button>

          {/* Custom Actions */}
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.destructive ? "destructive" : "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled || isLoading}
              className="h-8"
              title={action.tooltip}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}

          {/* Default Delete Action */}
          {showDelete && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
              className="h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
            className="h-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}