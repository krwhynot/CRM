/**
 * PageLayout Types
 *
 * Type definitions for simple PageLayout components used throughout the application.
 */

import type { ReactNode } from 'react'

// ============================================================================
// SIMPLE LAYOUT COMPONENT TYPES
// ============================================================================

/**
 * Props for simple page layout components
 */
export interface PageLayoutProps {
  /** Page title */
  title?: string
  /** Page subtitle or description */
  subtitle?: string
  /** Header actions (buttons, etc.) */
  actions?: ReactNode
  /** Whether to show a back button */
  showBack?: boolean
  /** Back button click handler */
  onBack?: () => void
  /** Additional CSS class name */
  className?: string
  /** Children content */
  children?: ReactNode
}

/**
 * Props for page container components
 */
export interface PageContainerProps {
  /** Container size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Whether to add padding */
  padded?: boolean
  /** Additional CSS class name */
  className?: string
  /** Children content */
  children?: ReactNode
}

/**
 * Props for page header components
 */
export interface PageHeaderProps {
  /** Header title */
  title: string
  /** Header subtitle */
  subtitle?: string
  /** Right-side actions */
  actions?: ReactNode
  /** Whether to show a divider below header */
  divided?: boolean
  /** Additional CSS class name */
  className?: string
}

/**
 * Props for content section components
 */
export interface ContentSectionProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Additional CSS class name */
  className?: string
  /** Children content */
  children?: ReactNode
}

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Re-export commonly used React types
export type { ReactNode } from 'react'
