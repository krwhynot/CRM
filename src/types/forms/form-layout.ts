/**
 * Form Layout Type Definitions
 *
 * TypeScript types for form layout, dialog context, and responsive behavior.
 * Used by the form utilities and dialog system.
 */

import React from 'react'
import type { DialogSize } from '@/contexts/DialogContext'

/**
 * Dialog Context Types
 */
export interface DialogContextType {
  isInDialog: boolean
  size: DialogSize
  onClose?: () => void
}

/**
 * Form Container Configuration
 */
export interface FormSizeConfig {
  container: {
    dialog: Record<DialogSize, string>
    page: string
  }
  grid: {
    dialog: Record<DialogSize, string>
    page: string
  }
  spacing: {
    dialog: string
    page: string
  }
  padding: {
    dialog: string
    page: string
  }
}

/**
 * Form Container Props
 */
export interface FormContainerProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string

  // Layout behavior
  responsive?: boolean
  showBorder?: boolean
  showShadow?: boolean
}

/**
 * Dialog Height Configuration
 */
export interface DialogHeightConfig {
  maxHeight: Record<DialogSize, string>
  scrollable: boolean
  contentPadding: string
}

/**
 * Form Field Layout Types
 */
export interface FieldLayoutConfig {
  columns: {
    mobile: number
    tablet: number
    desktop: number
  }
  spacing: {
    field: string
    section: string
    group: string
  }
  sizing: {
    input: string
    label: string
    button: string
  }
}

/**
 * Responsive Breakpoint Configuration
 */
export interface ResponsiveConfig {
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  containers: {
    dialog: Record<DialogSize, string>
    page: Record<'sm' | 'md' | 'lg' | 'xl', string>
  }
}

/**
 * Form State Configuration
 */
export interface FormStateConfig {
  loading: {
    spinner: boolean
    disableFields: boolean
    showProgress: boolean
  }
  validation: {
    mode: 'onChange' | 'onBlur' | 'onSubmit'
    revalidateMode: 'onChange' | 'onBlur' | 'onSubmit'
    showErrorSummary: boolean
  }
  submission: {
    preventDoubleSubmit: boolean
    showSuccessMessage: boolean
    resetOnSuccess: boolean
  }
}

/**
 * Form Theme Configuration
 */
export interface FormThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    error: string
    warning: string
    success: string
  }
  typography: {
    title: string
    label: string
    description: string
    error: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borders: {
    radius: string
    width: string
    color: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

/**
 * Animation Configuration
 */
export interface AnimationConfig {
  transitions: {
    duration: string
    easing: string
  }
  collapsible: {
    duration: string
    easing: string
  }
  modal: {
    backdrop: {
      duration: string
      easing: string
    }
    content: {
      duration: string
      easing: string
    }
  }
}

/**
 * Accessibility Configuration
 */
export interface AccessibilityConfig {
  ariaLabels: {
    required: string
    optional: string
    error: string
    loading: string
  }
  focusManagement: {
    autoFocus: boolean
    trapFocus: boolean
    restoreFocus: boolean
  }
  announcements: {
    errors: boolean
    success: boolean
    loading: boolean
  }
}

// Utility types for form layout
export type FormLayoutMode = 'dialog' | 'page'
export type FormGridType = 'single' | 'double' | 'triple' | 'auto'
export type FormSpacingSize = 'compact' | 'normal' | 'relaxed'

// Export commonly used type combinations
export type DialogFormProps = FormContainerProps & {
  isInDialog: true
  size: DialogSize
}

export type PageFormProps = FormContainerProps & {
  isInDialog: false
}

export type ResponsiveFormProps = FormContainerProps & {
  responsive: true
  breakpoints?: Partial<ResponsiveConfig['breakpoints']>
}
