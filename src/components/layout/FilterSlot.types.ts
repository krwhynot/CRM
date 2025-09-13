import type { ReactNode } from 'react'
import type { FilterSection, FilterSidebarProps } from '@/components/filters/FilterSidebar.types'

/**
 * Configuration for FilterSlot component
 * Extends FilterSidebarProps with slot-specific options
 */
export interface FilterSlotConfig extends Omit<FilterSidebarProps, 'children'> {
  /** Content rendering mode */
  mode?: 'sections' | 'custom' | 'hybrid'
  /** Show filter count in collapsed state */
  showFilterCount?: boolean
  /** Custom trigger for mobile sheet */
  customTrigger?: ReactNode
  /** Additional CSS classes for slot wrapper */
  slotClassName?: string
}

/**
 * Props for FilterSlot component
 * Optimized for PageLayout integration
 */
export interface FilterSlotProps extends FilterSlotConfig {
  /** Filter content - can be sections or custom ReactNode */
  children?: ReactNode
  /** Structured filter sections (alternative to children) */
  sections?: FilterSection[]

  /** Render mode for different contexts */
  context?: 'page-layout' | 'standalone' | 'embedded'
  /** Integration with PageLayout state */
  pageLayoutIntegration?: boolean
}

/**
 * Internal props for desktop filter rendering
 */
export interface FilterSlotDesktopProps {
  children?: ReactNode
  sections?: FilterSection[]
  config: FilterSlotConfig
  className?: string
}

/**
 * Internal props for mobile filter rendering
 */
export interface FilterSlotMobileProps {
  children?: ReactNode
  sections?: FilterSection[]
  config: FilterSlotConfig
  trigger?: ReactNode
  className?: string
}

/**
 * Props for filter content wrapper
 */
export interface FilterContentWrapperProps {
  children?: ReactNode
  sections?: FilterSection[]
  mode?: FilterSlotConfig['mode']
}
