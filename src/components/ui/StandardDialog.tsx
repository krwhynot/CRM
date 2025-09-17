import React from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent as BaseDialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'
import { DialogContextProvider } from '@/contexts/DialogContext'

// Size mapping for consistent dialog sizing - using approved responsive ladder
const sizeClasses = {
  sm: 'max-w-[96%] sm:max-w-sm',
  md: 'max-w-[96%] sm:max-w-lg',
  lg: 'max-w-[96%] sm:max-w-lg md:max-w-2xl lg:max-w-4xl',
  xl: 'max-w-[96%] sm:max-w-lg md:max-w-2xl lg:max-w-4xl',
} as const

// Base dialog props interface
interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  size?: keyof typeof sizeClasses
  headerActions?: React.ReactNode
  children: React.ReactNode
}

// Regular dialog props (for forms, content)
interface RegularDialogProps extends BaseDialogProps {
  footer?: React.ReactNode
  scroll?: 'content' | 'body'
}

// Alert dialog props (for confirmations)
interface AlertDialogProps extends BaseDialogProps {
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive'
  isLoading?: boolean
}

// Union type for StandardDialog props
type StandardDialogProps =
  | (RegularDialogProps & { variant?: 'dialog' })
  | (AlertDialogProps & { variant: 'alert' })

/**
 * StandardDialog - Unified dialog component for the CRM system
 *
 * Supports both regular dialogs (forms, content) and alert dialogs (confirmations)
 * with consistent sizing, scrolling patterns, and accessibility features.
 *
 * @example Regular Dialog
 * <StandardDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Add Contact"
 *   description="Fill in the contact details below"
 *   size="lg"
 *   scroll="content"
 *   footer={<Button>Save</Button>}
 * >
 *   <ContactForm />
 * </StandardDialog>
 *
 * @example Alert Dialog
 * <StandardDialog
 *   variant="alert"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Contact"
 *   description="Are you sure you want to delete this contact?"
 *   confirmText="Delete"
 *   confirmVariant="destructive"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 *   isLoading={isDeleting}
 * >
 *   <p>This action cannot be undone.</p>
 * </StandardDialog>
 */
export function StandardDialog(props: StandardDialogProps) {
  const { open, onOpenChange, title, description, size = 'md', headerActions, children } = props

  // Alert dialog variant
  if (props.variant === 'alert') {
    const {
      onConfirm,
      onCancel,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmVariant = 'default',
      isLoading = false,
    } = props

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className={cn(sizeClasses[size], 'flex flex-col')}>
          <DialogContextProvider isInDialog={true} size={size} onClose={() => onOpenChange(false)}>
            <AlertDialogHeader className="flex items-start justify-between">
              <div>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
              </div>
              {headerActions}
            </AlertDialogHeader>

            <div className="py-4">{children}</div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
                {cancelText}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  confirmVariant === 'destructive' &&
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                )}
              >
                {isLoading ? 'Loading...' : confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </DialogContextProvider>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Regular dialog variant (default)
  const { footer, scroll = 'content' } = props
  const scrollClasses = scroll === 'content' ? 'flex-1 min-h-0 overflow-y-auto' : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BaseDialogContent className={cn(sizeClasses[size], 'flex flex-col')}>
        <DialogContextProvider isInDialog={true} size={size} onClose={() => onOpenChange(false)}>
          <DialogHeader className="flex items-start justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            {headerActions}
          </DialogHeader>

          <div className={cn(scrollClasses, scroll === 'content' && 'pr-2')}>{children}</div>

          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContextProvider>
      </BaseDialogContent>
    </Dialog>
  )
}

// Export legacy components for backward compatibility during migration
export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
export { BaseDialogContent as DialogContent }
