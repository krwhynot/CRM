import type { ReactNode } from 'react'
import type { FilterSection } from '@/components/filters/FilterSidebar.types'

/**
 * Core slots interface for PageLayout component
 * Each slot accepts ReactNode for maximum flexibility
 */
export interface PageLayoutSlots {
  /** Page title - can be string or complex ReactNode */
  title: ReactNode
  /** Optional subtitle or description */
  subtitle?: ReactNode
  /** Action buttons or custom action area */
  actions?: ReactNode
  /** Filter components for sidebar */
  filters?: ReactNode
  /** Meta information like counts, badges, etc. */
  meta?: ReactNode
  /** Main page content */
  children: ReactNode
}

/**
 * Filter sidebar configuration options
 */
export interface FilterSidebarConfig {
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Width when collapsed (default: 64px) */
  collapsedWidth?: number
  /** Width when expanded (default: 280px) */
  expandedWidth?: number
  /** Minimum resizable width (default: 200px) */
  minWidth?: number
  /** Maximum resizable width (default: 400px) */
  maxWidth?: number
  /** LocalStorage key for state persistence */
  persistKey?: string
  /** Structured filter sections (alternative to children) */
  sections?: FilterSection[]
  /** Mobile breakpoint for sheet overlay */
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Callback when width changes */
  onWidthChange?: (width: number) => void
}

/**
 * Main PageLayout component props
 * Combines slots with layout configuration options
 */
export interface PageLayoutProps extends PageLayoutSlots {
  /** Enable filter sidebar rendering */
  withFilterSidebar?: boolean
  /** Filter sidebar configuration */
  filterSidebarConfig?: FilterSidebarConfig

  /** Custom CSS class for root element */
  className?: string
  /** Custom CSS class for main content area */
  contentClassName?: string
  /** Custom CSS class for header area */
  headerClassName?: string

  /** Wrap content in PageContainer (default: true) */
  containerized?: boolean
  /** Use full height layout (default: true) */
  fullHeight?: boolean
}

/**
 * Props for the internal header composition
 */
export interface PageLayoutHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Props for the main content area
 */
export interface PageLayoutContentProps {
  children: ReactNode
  className?: string
  containerized?: boolean
}
