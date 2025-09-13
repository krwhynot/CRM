import type { ReactNode } from 'react'

/**
 * Props interface for SlotHeader component
 * Optimized for direct slot composition without array handling
 */
export interface SlotHeaderProps {
  /** Page title - accepts any ReactNode for maximum flexibility */
  title: ReactNode
  /** Optional subtitle or description */
  subtitle?: ReactNode
  /** Meta information like counts, badges, status indicators */
  meta?: ReactNode
  /** Action area - compose buttons/controls directly as ReactNode */
  actions?: ReactNode
  /** Optional icon to display before title */
  icon?: ReactNode
  /** Optional breadcrumb navigation */
  breadcrumb?: ReactNode

  /** Custom CSS class for root element */
  className?: string
  /** Custom CSS class for title area */
  titleClassName?: string
  /** Custom CSS class for actions area */
  actionsClassName?: string

  /** Layout variant */
  variant?: 'default' | 'compact' | 'minimal'
  /** Content alignment */
  align?: 'left' | 'center' | 'space-between'
}

/**
 * Internal component props for title area
 */
export interface SlotHeaderTitleProps {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  icon?: ReactNode
  className?: string
  variant?: SlotHeaderProps['variant']
}

/**
 * Internal component props for actions area
 */
export interface SlotHeaderActionsProps {
  actions?: ReactNode
  className?: string
  variant?: SlotHeaderProps['variant']
}
