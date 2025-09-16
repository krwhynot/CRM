/**
 * PageLayout Types
 *
 * Type definitions for PageLayout components and schema-driven rendering.
 * These types bridge the gap between the layout configuration system and
 * the React component rendering layer.
 */

import type { ReactNode, ComponentType } from 'react'

// ============================================================================
// STUB TYPES - These will be replaced when core schema types are implemented
// ============================================================================

/**
 * Layout configuration object for schema-driven rendering
 */
export interface LayoutConfiguration {
  id: string
  type: 'slots' | 'grid' | 'flex'
  entityType?: string
  name?: string
  description?: string
  version?: string
  [key: string]: any
}

/**
 * Supported entity types for layout configurations
 */
export type LayoutEntityType = 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'

/**
 * Component registry for dynamic component resolution
 */
export interface LayoutComponentRegistry {
  components: Map<string, any>
  metadata?: {
    version: string
    totalComponents: number
  }
  [key: string]: any
}

/**
 * Render options for schema-driven rendering
 */
export interface RenderOptions {
  /** Enable virtualization: 'auto', 'always', 'never' */
  enableVirtualization?: 'auto' | 'always' | 'never'
  /** Enable error boundaries for components */
  enableErrorBoundaries?: boolean
  /** Enable performance monitoring in development */
  enablePerformanceMonitoring?: boolean
  /** Enable caching of rendered components */
  enableCaching?: boolean
  /** Enable strict validation of component props */
  strictValidation?: boolean
  /** Rendering mode: 'development' or 'production' */
  renderMode?: 'development' | 'production'
  /** Maximum number of retry attempts on render failure */
  maxRetries?: number
}

/**
 * Result of a layout rendering operation
 */
export interface RenderResult {
  /** Whether the render was successful */
  success: boolean
  /** The rendered React component */
  component?: ComponentType<any>
  /** Props to pass to the rendered component */
  props?: Record<string, any>
  /** Any errors that occurred during rendering */
  errors?: string[]
  /** Metadata about the render operation */
  metadata?: {
    renderTime?: number
    componentCount?: number
    virtualizedRows?: number
  }
}

/**
 * Basic layout component props interface
 */
export interface LayoutComponentProps {
  /** Layout configuration for this component */
  layoutConfig?: LayoutConfiguration
  /** Data to render */
  data?: any[]
  /** Additional CSS class name */
  className?: string
  /** Children elements */
  children?: ReactNode
  /** Callback when configuration changes */
  onConfigChange?: (config: LayoutConfiguration) => void
  /** Callback when data changes */
  onDataChange?: (data: any[]) => void
}

// ============================================================================
// CORE LAYOUT CONTEXT AND SCHEMA TYPES
// ============================================================================

/**
 * Context type for layout management
 */
export interface LayoutContextType {
  /** Current active layout configuration */
  currentLayout?: LayoutConfiguration
  /** Available layout configurations */
  availableLayouts: LayoutConfiguration[]
  /** Component registry for dynamic rendering */
  registry?: LayoutComponentRegistry
  /** Switch to a different layout by ID */
  switchLayout: (layoutId: string) => void
  /** Update the current layout configuration */
  updateLayout: (layout: LayoutConfiguration) => void
  /** Whether a layout operation is in progress */
  loading: boolean
  /** Any error that occurred during layout operations */
  error?: Error | null
}

/**
 * Schema configuration for PageLayoutRenderer
 */
export interface PageLayoutSchemaConfig {
  /** The layout configuration to render */
  layout: LayoutConfiguration
  /** Data to pass to the layout components */
  data?: any[]
  /** Component registry to use for rendering (optional) */
  registry?: LayoutComponentRegistry
  /** Render options */
  options?: Partial<RenderOptions>
  /** Callback when layout configuration changes */
  onLayoutChange?: (layout: LayoutConfiguration) => void
  /** Callback when data changes */
  onDataChange?: (data: any[]) => void
}

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
export type {
  ReactNode,
  ComponentType,
} from 'react'