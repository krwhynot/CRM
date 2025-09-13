import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'

interface BulkDeleteDialogProps<T extends { id: string; name?: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: T[]
  onConfirm: () => void | Promise<void>
  isDeleting?: boolean
  entityType: string
  entityTypePlural: string
  // For backward compatibility with organizations prop
  organizations?: T[]
}

/**
 * Shared bulk delete dialog for all entity types.
 * Provides consistent deletion confirmation UI across the application.
 */
export function BulkDeleteDialog<T extends { id: string; name?: string }>({
  open,
  onOpenChange,
  items,
  organizations, // Support legacy prop name
  onConfirm,
  isDeleting = false,
  entityType,
  entityTypePlural,
}: BulkDeleteDialogProps<T>) {
  // Support legacy organizations prop
  const itemsToDelete = items || organizations || []
  const count = itemsToDelete.length

  if (count === 0) {
    return null
  }

  const handleConfirm = async () => {
    await onConfirm()
    if (!isDeleting) {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count} {count === 1 ? entityType : entityTypePlural}?
          </AlertDialogTitle>
          <AlertDialogDescription className={semanticSpacing.stack.sm}>
            <p>
              This action cannot be undone. This will permanently delete the following{' '}
              {count === 1 ? entityType : entityTypePlural}:
            </p>
            {count <= 5 ? (
              <ul
                className={cn(
                  'list-disc list-inside overflow-y-auto',
                  semanticTypography.caption,
                  semanticSpacing.topGap.sm,
                  'max-h-32'
                )}
              >
                {itemsToDelete.map((item) => (
                  <li key={item.id}>{item.name || `${entityType} ${item.id}`}</li>
                ))}
              </ul>
            ) : (
              <div className={cn(semanticTypography.caption, semanticSpacing.topGap.sm)}>
                <p className={semanticTypography.label}>
                  {itemsToDelete
                    .slice(0, 3)
                    .map((item) => item.name || `${entityType} ${item.id}`)
                    .join(', ')}
                </p>
                <p className={semanticColors.text.muted}>
                  ...and {count - 3} more {entityTypePlural}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className={cn(
              semanticColors.error.primary,
              semanticColors.error.foreground,
              'hover:opacity-90'
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4 animate-spin')} />
                Deleting...
              </>
            ) : (
              `Delete ${count} ${count === 1 ? entityType : entityTypePlural}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
