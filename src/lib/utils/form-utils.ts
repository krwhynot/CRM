import type { DialogSize } from '@/contexts/DialogContext'

/**
 * Form Utilities - Responsive width and spacing utilities for forms
 *
 * These utilities help forms adapt to different contexts (dialogs vs pages)
 * and provide consistent spacing and layout patterns.
 */

// Form container width classes based on dialog context
export function getFormContainerClasses(isInDialog: boolean, dialogSize?: DialogSize): string {
  if (!isInDialog) {
    // Full page form - use responsive max widths
    return 'mx-auto w-full max-w-4xl'
  }

  // Dialog form - adapt to dialog size
  switch (dialogSize) {
    case 'sm':
      return 'w-full max-w-sm'
    case 'md':
      return 'w-full max-w-lg'
    case 'lg':
      return 'w-full max-w-2xl'
    case 'xl':
      return 'w-full max-w-4xl'
    default:
      return 'w-full max-w-lg'
  }
}

// Form grid classes for field layouts
export function getFormGridClasses(isInDialog: boolean, fieldCount?: number): string {
  const baseClasses = 'grid gap-4'

  if (!isInDialog) {
    // Full page - responsive grid
    return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  }

  // Dialog - simpler grid based on space
  if (fieldCount && fieldCount <= 2) {
    return `${baseClasses} grid-cols-1`
  }

  return `${baseClasses} grid-cols-1 sm:grid-cols-2`
}

// Form section spacing classes
export function getFormSpacingClasses(isInDialog: boolean): string {
  return isInDialog ? 'space-y-4' : 'space-y-6'
}

// Dialog height classes for scrollable content
export function getDialogHeightClasses(dialogSize: DialogSize): string {
  switch (dialogSize) {
    case 'sm':
      return 'max-h-96'
    case 'md':
      return 'max-h-screen'
    case 'lg':
      return 'max-h-screen'
    case 'xl':
      return 'max-h-screen'
    default:
      return 'max-h-screen'
  }
}

// Form padding classes based on context
export function getFormPaddingClasses(isInDialog: boolean): string {
  return isInDialog ? 'p-4' : 'p-6'
}

// Form header spacing
export function getFormHeaderSpacing(isInDialog: boolean): string {
  return isInDialog ? 'mb-4' : 'mb-6'
}

// Form button classes
export function getFormButtonClasses(isInDialog: boolean): string {
  const baseClasses = 'h-11 font-medium'
  return isInDialog ? `${baseClasses} w-full sm:w-auto` : `${baseClasses} min-w-[120px]`
}

// Form card classes - integrate with existing Card component
export function getFormCardClasses(isInDialog: boolean): string {
  if (!isInDialog) {
    return 'mx-auto w-full max-w-4xl rounded-lg border bg-white shadow-sm'
  }

  // In dialog - remove border/shadow, adapt to dialog container
  return 'w-full bg-transparent border-0 shadow-none'
}

/**
 * Responsive breakpoint utilities for form layouts
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const

/**
 * Form field size configurations
 */
export const fieldSizes = {
  sm: {
    input: 'h-9 px-3 text-sm',
    label: 'text-sm',
    button: 'h-9 px-3 text-sm',
  },
  md: {
    input: 'h-11 px-3 text-base',
    label: 'text-sm',
    button: 'h-11 px-4 text-base',
  },
  lg: {
    input: 'h-12 px-4 text-base',
    label: 'text-base',
    button: 'h-12 px-6 text-base',
  },
} as const

export type FieldSize = keyof typeof fieldSizes
