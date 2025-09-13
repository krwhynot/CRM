import { semanticSpacing, semanticTypography } from '@/styles/tokens'
/**
 * Bulk Actions Toolbar
 *
 * A toolbar component that displays when items are selected and provides
 * quick access to bulk actions with visual feedback and confirmation dialogs.
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { cn } from '@/lib/utils'
import { useBulkActions, type BulkAction } from './BulkActionsProvider'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface BulkActionsToolbarProps {
  className?: string
  position?: 'top' | 'bottom' | 'floating'
  maxVisibleActions?: number
  showClearAll?: boolean
  animate?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BulkActionsToolbar({
  className,
  position = 'top',
  maxVisibleActions = 4,
  showClearAll = true,
  animate = true,
}: BulkActionsToolbarProps) {
  const { getSelectionCount, availableActions, executeBulkAction, canExecuteAction, deselectAll } =
    useBulkActions()

  // Local state
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    action: BulkAction
    open: boolean
  } | null>(null)

  const selectionCount = getSelectionCount()

  // Don't render if no items selected
  if (selectionCount === 0) {
    return null
  }

  // Handle action execution
  const handleActionClick = async (action: BulkAction) => {
    if (!canExecuteAction(action.id)) return

    // Show confirmation dialog if required
    if (action.requiresConfirmation) {
      setConfirmationDialog({ action, open: true })
      return
    }

    // Execute action directly
    await executeAction(action)
  }

  const executeAction = async (action: BulkAction) => {
    try {
      setExecutingAction(action.id)
      await executeBulkAction(action.id)
    } catch (error) {
      console.error(`Failed to execute bulk action ${action.id}:`, error)
      // TODO: Show error toast/notification
    } finally {
      setExecutingAction(null)
      setConfirmationDialog(null)
    }
  }

  const handleConfirmAction = async () => {
    if (confirmationDialog) {
      await executeAction(confirmationDialog.action)
    }
  }

  // Split actions into visible and overflow
  const visibleActions = availableActions.slice(0, maxVisibleActions)
  const overflowActions = availableActions.slice(maxVisibleActions)

  // Position-specific classes
  const positionClasses = {
    top: 'border-b',
    bottom: 'border-t',
    floating: 'rounded-lg shadow-lg border',
  }

  // Animation classes
  const animationClasses = animate
    ? 'transition-all duration-200 ease-in-out transform translate-y-0 opacity-100'
    : ''

  return (
    <>
      <div
        className={cn(
          `flex items-center justify-between ${semanticSpacing.gap.xl} bg-background ${semanticSpacing.horizontalPadding.xl} ${semanticSpacing.verticalPadding.lg}`,
          positionClasses[position],
          animationClasses,
          className
        )}
        role="toolbar"
        aria-label="Bulk actions"
      >
        {/* Selection Info */}
        <div className={cn(semanticSpacing.gap.sm, 'flex items-center')}>
          <Badge variant="secondary" className={`${semanticTypography.label}`}>
            {selectionCount} selected
          </Badge>

          {showClearAll && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={deselectAll}
                className={cn(
                  semanticSpacing.compactX,
                  'h-8 text-muted-foreground hover:text-foreground'
                )}
              >
                <X className={`h-3 w-3 ${semanticSpacing.rightGap.xs}`} />
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
          {visibleActions.map((action) => {
            const isExecuting = executingAction === action.id
            const canExecute = canExecuteAction(action.id)

            return (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                size="sm"
                disabled={!canExecute || isExecuting}
                onClick={() => handleActionClick(action)}
                className="h-8"
                title={action.disabled ? action.disabledReason : undefined}
              >
                {isExecuting ? (
                  <Loader2 className={`h-3 w-3 ${semanticSpacing.rightGap.xs} animate-spin`} />
                ) : action.icon ? (
                  <action.icon className={`h-3 w-3 ${semanticSpacing.rightGap.xs}`} />
                ) : null}
                {action.label}
              </Button>
            )
          })}

          {/* Overflow Actions - TODO: Implement dropdown */}
          {overflowActions.length > 0 && (
            <Button variant="outline" size="sm" className="h-8">
              More ({overflowActions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <StandardDialog
          variant="alert"
          open={confirmationDialog.open}
          onOpenChange={(open) => {
            if (!open) setConfirmationDialog(null)
          }}
          title={`Confirm ${confirmationDialog.action.label}`}
          description={
            confirmationDialog.action.confirmationMessage ||
            `Are you sure you want to ${confirmationDialog.action.label.toLowerCase()} ${selectionCount} item${selectionCount !== 1 ? 's' : ''}?`
          }
          confirmText={confirmationDialog.action.label}
          confirmVariant={
            confirmationDialog.action.variant === 'destructive' ? 'destructive' : 'default'
          }
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmationDialog(null)}
          isLoading={executingAction === confirmationDialog.action.id}
        >
          <div
            className={cn(
              semanticSpacing.gap.xs,
              semanticTypography.body,
              'flex items-center text-muted-foreground'
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            This action cannot be undone.
          </div>
        </StandardDialog>
      )}
    </>
  )
}

// =============================================================================
// HOOK FOR EASY INTEGRATION
// =============================================================================

/**
 * Hook to easily set up bulk actions for a specific entity type
 */
export function useBulkActionsSetup(actions: BulkAction[]) {
  const { setAvailableActions } = useBulkActions()

  React.useEffect(() => {
    setAvailableActions(actions)

    // Cleanup when component unmounts
    return () => setAvailableActions([])
  }, [actions, setAvailableActions])
}

// =============================================================================
// COMMON BULK ACTIONS
// =============================================================================

/**
 * Factory functions for common bulk actions
 */
export const createBulkActions = {
  delete: (onDelete: (items: any[]) => Promise<void>): BulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: X,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'This will permanently delete the selected items.',
    handler: onDelete,
  }),

  export: (onExport: (items: any[]) => Promise<void>): BulkAction => ({
    id: 'export',
    label: 'Export',
    variant: 'secondary',
    handler: onExport,
  }),

  updateStatus: (
    status: string,
    onUpdate: (items: any[], status: string) => Promise<void>
  ): BulkAction => ({
    id: `update-status-${status}`,
    label: `Mark as ${status}`,
    handler: (items) => onUpdate(items, status),
  }),

  assignTo: (
    assignee: string,
    onAssign: (items: any[], assignee: string) => Promise<void>
  ): BulkAction => ({
    id: `assign-to-${assignee}`,
    label: `Assign to ${assignee}`,
    handler: (items) => onAssign(items, assignee),
  }),
}
