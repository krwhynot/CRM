import type { ReactNode } from 'react'

export interface FilterSection {
  id: string
  title: string
  icon?: ReactNode
  badge?: string | number
  defaultExpanded?: boolean
  content: ReactNode
}

export interface FilterSidebarProps {
  children?: ReactNode
  sections?: FilterSection[]
  defaultCollapsed?: boolean
  collapsedWidth?: number
  expandedWidth?: number
  minWidth?: number
  maxWidth?: number
  persistKey?: string
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
  onWidthChange?: (width: number) => void
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
}

export interface FilterSidebarState {
  isCollapsed: boolean
  width: number
  openSections: Set<string>
}

export interface UseFilterSidebarOptions {
  defaultCollapsed?: boolean
  defaultWidth?: number
  persistKey?: string
  collapsedWidth?: number
  expandedWidth?: number
}

export interface UseFilterSidebarReturn {
  isCollapsed: boolean
  width: number
  isMobile: boolean
  toggleCollapsed: () => void
  setCollapsed: (collapsed: boolean) => void
  setWidth: (width: number) => void
  openSections: Set<string>
  toggleSection: (sectionId: string) => void
}
