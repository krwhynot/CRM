import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
/**
 * Accessible Dialog Component
 *
 * Enhanced dialog component with comprehensive accessibility features including
 * focus trapping, keyboard navigation, and screen reader support.
 */

import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
import {
  useFocusTrap,
  useFocusRestoration,
  useAnnouncer,
} from '@/lib/accessibility/focus-management'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

interface AccessibleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode

  // Accessibility props
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: 'dialog' | 'alertdialog'

  // Focus management
  initialFocus?: React.RefObject<HTMLElement>
  restoreFocus?: boolean
  trapFocus?: boolean

  // Announcements
  announceOnOpen?: string
  announceOnClose?: string

  // Standard dialog props
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'dialog' | 'alert'
  footer?: React.ReactNode
  headerActions?: React.ReactNode
  className?: string

  // Alert dialog specific props (when variant="alert")
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive'
  isLoading?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AccessibleDialog({
  open,
  onOpenChange,
  title,
  description,
  children,

  // Accessibility
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  role = 'dialog',

  // Focus management
  initialFocus,
  restoreFocus = true,
  trapFocus = true,

  // Announcements
  announceOnOpen,
  announceOnClose,

  // Standard props
  size = 'md',
  variant = 'dialog',
  footer,
  headerActions,
  className,

  // Alert dialog props
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmVariant,
  isLoading,
}: AccessibleDialogProps) {
  // Focus management
  const trapRef = useFocusTrap(open && trapFocus)
  const focusRestoration = useFocusRestoration()
  const announce = useAnnouncer()

  // Handle dialog state changes
  React.useEffect(() => {
    if (open) {
      // Announce dialog opening
      if (announceOnOpen) {
        announce(announceOnOpen)
      }

      // Focus initial element
      if (initialFocus?.current) {
        const timer = setTimeout(() => {
          initialFocus.current?.focus()
        }, 100)
        return () => clearTimeout(timer)
      }
    } else {
      // Announce dialog closing
      if (announceOnClose) {
        announce(announceOnClose)
      }

      // Restore focus if enabled
      if (restoreFocus) {
        focusRestoration.restore()
      }
    }
  }, [
    open,
    initialFocus,
    announceOnOpen,
    announceOnClose,
    announce,
    restoreFocus,
    focusRestoration,
  ])

  // Keyboard event handling
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to close dialog
      if (event.key === 'Escape' && !isLoading) {
        event.preventDefault()
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange, isLoading])

  // Generate IDs for ARIA relationships
  const titleId = React.useId()
  const descriptionId = React.useId()

  // Create properly typed props based on variant
  const dialogProps =
    variant === 'alert' && onConfirm
      ? {
          open,
          onOpenChange,
          title,
          description,
          size,
          headerActions,
          className: cn(className),
          variant: 'alert' as const,
          onConfirm,
          onCancel,
          confirmText,
          cancelText,
          confirmVariant,
          isLoading,
        }
      : {
          open,
          onOpenChange,
          title,
          description,
          size,
          headerActions,
          className: cn(className),
          footer,
        }

  return (
    <div
      ref={trapRef as React.RefObject<HTMLDivElement>}
      role={role}
      aria-modal="true"
      aria-labelledby={ariaLabelledBy || titleId}
      aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
    >
      <StandardDialog {...dialogProps}>{children}</StandardDialog>
    </div>
  )
}

// =============================================================================
// ACCESSIBLE FORM DIALOG
// =============================================================================

interface AccessibleFormDialogProps extends Omit<AccessibleDialogProps, 'variant' | 'children'> {
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  children: React.ReactNode
}

export function AccessibleFormDialog({
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  children,
  ...dialogProps
}: AccessibleFormDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null)

  const footer = (
    <div className={cn(semanticSpacing.inline.xs, 'flex justify-end')}>
      <button
        type="button"
        onClick={() => dialogProps.onOpenChange(false)}
        disabled={isSubmitting}
        className={cn(
          semanticSpacing.cardX,
          semanticSpacing.compactY,
          semanticTypography.body,
          semanticTypography.label,
          semanticRadius.default,
          'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50'
        )}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        form="dialog-form"
        disabled={isSubmitting}
        className={cn(
          semanticSpacing.cardX,
          semanticSpacing.compactY,
          semanticTypography.body,
          semanticTypography.label,
          semanticRadius.default,
          'text-white bg-primary border border-transparent hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50'
        )}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  )

  return (
    <AccessibleDialog {...dialogProps} variant="dialog" footer={footer} initialFocus={formRef}>
      <form id="dialog-form" ref={formRef} onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </AccessibleDialog>
  )
}

// =============================================================================
// ACCESSIBLE CONFIRMATION DIALOG
// =============================================================================

interface AccessibleConfirmDialogProps extends Omit<AccessibleDialogProps, 'variant' | 'children'> {
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
}

export function AccessibleConfirmDialog({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  ...dialogProps
}: AccessibleConfirmDialogProps) {
  return (
    <AccessibleDialog
      {...dialogProps}
      variant="alert"
      role="alertdialog"
      confirmText={confirmLabel}
      cancelText={cancelLabel}
      confirmVariant={isDestructive ? 'destructive' : 'default'}
      announceOnOpen={`Confirmation required: ${typeof dialogProps.title === 'string' ? dialogProps.title : 'Please confirm your action'}`}
    >
      <div className={cn(semanticTypography.body, 'text-muted-foreground')}>{message}</div>
    </AccessibleDialog>
  )
}

// =============================================================================
// HOOKS FOR DIALOG MANAGEMENT
// =============================================================================

/**
 * Hook to manage dialog state with accessibility features
 */
export function useAccessibleDialog(initialOpen = false) {
  const [open, setOpen] = React.useState(initialOpen)
  const announce = useAnnouncer()

  const openDialog = React.useCallback(
    (announcement?: string) => {
      setOpen(true)
      if (announcement) {
        announce(announcement)
      }
    },
    [announce]
  )

  const closeDialog = React.useCallback(
    (announcement?: string) => {
      setOpen(false)
      if (announcement) {
        announce(announcement)
      }
    },
    [announce]
  )

  const toggleDialog = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return {
    open,
    openDialog,
    closeDialog,
    toggleDialog,
    setOpen,
  }
}

/**
 * Hook for form dialog with validation and submission handling
 */
export function useAccessibleFormDialog<T = Record<string, unknown>>(
  onSubmit: (data: T) => Promise<void> | void,
  options: {
    successMessage?: string
    errorMessage?: string
    resetOnSuccess?: boolean
  } = {}
) {
  const { open, openDialog, closeDialog, setOpen } = useAccessibleDialog()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const announce = useAnnouncer()

  const handleSubmit = React.useCallback(
    async (data: T) => {
      try {
        setIsSubmitting(true)
        setError(null)

        await onSubmit(data)

        if (options.successMessage) {
          announce(options.successMessage, 'polite')
        }

        closeDialog()

        if (options.resetOnSuccess) {
          // Reset form if using react-hook-form or similar
          // This would need to be implemented based on form library
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : options.errorMessage || 'An error occurred'
        setError(errorMessage)
        announce(`Error: ${errorMessage}`, 'assertive')
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, announce, closeDialog, options]
  )

  return {
    open,
    openDialog,
    closeDialog,
    setOpen,
    isSubmitting,
    error,
    setError,
    handleSubmit,
  }
}
