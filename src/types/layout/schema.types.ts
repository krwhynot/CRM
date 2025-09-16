/**
 * Core Layout Schema Types
 *
 * Fundamental type definitions for the schema-driven layout system.
 * These types define the structure and behavior of layout configurations,
 * entity mappings, and component composition rules.
 */

import type { ReactNode, ComponentType } from 'react'
import type { Json } from '../../lib/database.types'

// === Core Entity Types ===

/**
 * Supported entity types for layout configurations
 */
export type LayoutEntityType =
  | 'organizations'
  | 'contacts'
  | 'opportunities'
  | 'products'
  | 'interactions'

/**
 * Layout composition types
 */
export type LayoutType = 'slots' | 'grid' | 'flex'

/**
 * Layout category types
 */
export type LayoutCategoryType = 'default' | 'custom' | 'template' | 'shared'

// === Slot Configuration ===

/**
 * Available slot types for component placement
 */
export type SlotType =
  | 'header'
  | 'title'
  | 'subtitle'
  | 'meta'
  | 'actions'
  | 'filters'
  | 'search'
  | 'content'
  | 'sidebar'
  | 'footer'
  | 'custom'

/**
 * Slot behavior configuration
 */
export interface SlotBehavior {
  /** Can the slot contain multiple components */
  multiple?: boolean
  /** Is the slot required to have at least one component */
  required?: boolean
  /** Minimum number of components (if multiple) */
  minComponents?: number
  /** Maximum number of components (if multiple) */
  maxComponents?: number
  /** Allow sorting of components within the slot */
  sortable?: boolean
  /** Allow resizing of components within the slot */
  resizable?: boolean
}

/**
 * Individual slot configuration
 */
export interface SlotConfiguration {
  /** Unique slot identifier */
  id: string
  /** Slot type from predefined types */
  type: SlotType
  /** Internal name for the slot */
  name: string
  /** Display name shown in UI */
  displayName: string
  /** Optional description */
  description?: string
  /** Is this slot required */
  required?: boolean
  /** Can contain multiple components */
  multiple?: boolean
  /** Default component to render in this slot */
  defaultComponent?: string
  /** Slot behavior rules */
  behavior?: SlotBehavior
  /** CSS classes for the slot container */
  className?: string
  /** Inline styles for the slot container */
  style?: React.CSSProperties
  /** Component props to pass to slot contents */
  props?: Record<string, any>
  /** Responsive configuration for this slot */
  responsive?: ResponsiveSlotConfig
  /** Conditional rendering rules */
  conditional?: ConditionalConfig
}

// === Layout Configurations ===

/**
 * Base layout configuration interface
 */
export interface BaseLayoutConfig {
  /** Unique layout identifier */
  id: string
  /** Layout name */
  name: string
  /** Layout description */
  description?: string
  /** Entity type this layout is designed for */
  entityType: LayoutEntityType
  /** Layout composition type */
  type: LayoutType
  /** Layout category */
  category?: LayoutCategoryType
  /** Layout version */
  version: string
  /** Metadata about the layout */
  metadata: LayoutMetadata
}

/**
 * Layout metadata
 */
export interface LayoutMetadata {
  /** When the layout was created */
  createdAt: string
  /** When the layout was last updated */
  updatedAt: string
  /** Who created the layout */
  createdBy: string
  /** Who last modified the layout */
  modifiedBy?: string
  /** Layout tags for categorization */
  tags: string[]
  /** Is this layout shared with other users */
  isShared: boolean
  /** Is this the default layout for the entity type */
  isDefault: boolean
  /** Usage statistics */
  usageCount?: number
  /** Performance metrics */
  performance?: {
    avgRenderTime?: number
    bundleSize?: number
    cacheHitRate?: number
  }
}

/**
 * Slot-based layout configuration
 */
export interface SlotBasedLayout extends BaseLayoutConfig {
  type: 'slots'
  /** Slot configurations */
  slots: SlotConfiguration[]
  /** Composition rules for slot arrangement */
  composition?: CompositionRules
  /** Global responsive settings */
  responsive?: ResponsiveConfig
}

/**
 * Grid-based layout configuration
 */
export interface GridBasedLayout extends BaseLayoutConfig {
  type: 'grid'
  /** Grid configuration */
  grid: {
    /** Number of columns */
    columns: number
    /** Number of rows */
    rows?: number
    /** Grid gap */
    gap?: GridGap
    /** Grid areas definition */
    areas?: GridArea[]
    /** Responsive grid configurations */
    responsive?: ResponsiveGridConfig
  }
}

/**
 * Flex-based layout configuration
 */
export interface FlexBasedLayout extends BaseLayoutConfig {
  type: 'flex'
  /** Flex configuration */
  flex: {
    /** Flex direction */
    direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    /** Justify content */
    justify?: FlexJustify
    /** Align items */
    align?: FlexAlign
    /** Flex wrap */
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
    /** Gap between items */
    gap?: FlexGap
    /** Responsive flex configurations */
    responsive?: ResponsiveFlexConfig
  }
}

/**
 * Union type for all layout configurations
 */
export type LayoutConfiguration = SlotBasedLayout | GridBasedLayout | FlexBasedLayout

// === Entity-Specific Layout Configs ===

export interface EntitySpecificLayoutConfig {
  organizations?: LayoutConfiguration[]
  contacts?: LayoutConfiguration[]
  opportunities?: LayoutConfiguration[]
  products?: LayoutConfiguration[]
  interactions?: LayoutConfiguration[]
}

export type OrganizationLayoutConfig = LayoutConfiguration & { entityType: 'organizations' }
export type ContactLayoutConfig = LayoutConfiguration & { entityType: 'contacts' }
export type OpportunityLayoutConfig = LayoutConfiguration & { entityType: 'opportunities' }
export type ProductLayoutConfig = LayoutConfiguration & { entityType: 'products' }
export type InteractionLayoutConfig = LayoutConfiguration & { entityType: 'interactions' }

// === Responsive Design ===

/**
 * Responsive breakpoints
 */
export interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  laptop: number
  desktop: number
}

/**
 * Responsive configuration
 */
export interface ResponsiveConfig {
  /** Breakpoint definitions */
  breakpoints?: ResponsiveBreakpoints
  /** Mobile-first approach */
  mobileFirst?: boolean
  /** Responsive slot configurations */
  slots?: Record<string, ResponsiveSlotConfig>
}

/**
 * Responsive slot configuration
 */
export interface ResponsiveSlotConfig {
  /** Hide slot at certain breakpoints */
  hidden?: {
    mobile?: boolean
    tablet?: boolean
    laptop?: boolean
    desktop?: boolean
  }
  /** Different order at breakpoints */
  order?: {
    mobile?: number
    tablet?: number
    laptop?: number
    desktop?: number
  }
  /** Different widths at breakpoints */
  width?: {
    mobile?: string | number
    tablet?: string | number
    laptop?: string | number
    desktop?: string | number
  }
}

// === Grid Layout Types ===

export interface GridGap {
  row?: string | number
  column?: string | number
  /** Shorthand for both row and column */
  gap?: string | number
}

export interface GridArea {
  name: string
  row: GridPosition
  column: GridPosition
}

export interface GridPosition {
  start: number
  end?: number
  span?: number
}

export interface ResponsiveGridConfig {
  mobile?: Partial<GridBasedLayout['grid']>
  tablet?: Partial<GridBasedLayout['grid']>
  laptop?: Partial<GridBasedLayout['grid']>
  desktop?: Partial<GridBasedLayout['grid']>
}

// === Flex Layout Types ===

export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

export type FlexAlign =
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'

export interface FlexGap {
  row?: string | number
  column?: string | number
  /** Shorthand for both row and column */
  gap?: string | number
}

export interface ResponsiveFlexConfig {
  mobile?: Partial<FlexBasedLayout['flex']>
  tablet?: Partial<FlexBasedLayout['flex']>
  laptop?: Partial<FlexBasedLayout['flex']>
  desktop?: Partial<FlexBasedLayout['flex']>
}

// === Conditional Logic ===

/**
 * Conditional configuration for dynamic layouts
 */
export interface ConditionalConfig {
  /** Conditions that must be met */
  conditions: ConditionalExpression[]
  /** Action to take when conditions are met */
  action: 'show' | 'hide' | 'disable' | 'modify'
  /** Properties to modify if action is 'modify' */
  modifications?: Record<string, any>
}

/**
 * Conditional expressions for layout rules
 */
export interface ConditionalExpression {
  /** Field to evaluate */
  field: string
  /** Comparison operator */
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'exists' | 'not-exists'
  /** Value to compare against */
  value?: any
  /** Logical operator to combine with next expression */
  logic?: 'and' | 'or'
}

// === Composition Rules ===

/**
 * Rules for how slots are composed together
 */
export interface CompositionRules {
  /** Layout arrangement strategy */
  arrangement?: 'vertical' | 'horizontal' | 'grid' | 'masonry'
  /** Spacing between slots */
  spacing?: string | number
  /** Alignment of slots */
  alignment?: 'start' | 'center' | 'end' | 'stretch'
  /** Whether slots can overlap */
  allowOverlap?: boolean
}

/**
 * Inheritance configuration for layout templates
 */
export interface InheritanceConfig {
  /** Parent layout to inherit from */
  parentId?: string
  /** Which properties to inherit */
  inherit?: ('slots' | 'metadata' | 'responsive' | 'composition')[]
  /** Properties to override from parent */
  overrides?: Partial<LayoutConfiguration>
}

// === Validation ===

/**
 * Validation rules for layout configurations
 */
export interface ValidationRules {
  /** Required slots */
  requiredSlots?: SlotType[]
  /** Maximum number of slots */
  maxSlots?: number
  /** Allowed slot types */
  allowedSlotTypes?: SlotType[]
  /** Custom validation functions */
  customValidators?: ValidationFunction[]
}

/**
 * Custom validation function type
 */
export type ValidationFunction = (layout: LayoutConfiguration) => {
  valid: boolean
  errors?: string[]
  warnings?: string[]
}

// === Design Token Integration ===

/**
 * Design token configuration
 */
export interface DesignTokenConfig {
  spacing?: SpacingTokens
  typography?: TypographyTokens
  colors?: ColorTokens
  shadows?: ShadowTokens
  radius?: RadiusTokens
  semantic?: SemanticTokenMapping
}

export interface SpacingTokens {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
  '3xl'?: string
}

export interface TypographyTokens {
  heading?: {
    fontSize: string
    lineHeight: string
    fontWeight: string
  }
  body?: {
    fontSize: string
    lineHeight: string
    fontWeight: string
  }
  caption?: {
    fontSize: string
    lineHeight: string
    fontWeight: string
  }
}

export interface ColorTokens {
  primary?: string
  secondary?: string
  accent?: string
  neutral?: string
  success?: string
  warning?: string
  error?: string
  info?: string
}

export interface ShadowTokens {
  sm?: string
  md?: string
  lg?: string
  xl?: string
}

export interface RadiusTokens {
  sm?: string
  md?: string
  lg?: string
  full?: string
}

export interface SemanticTokenMapping {
  cardBackground?: string
  textPrimary?: string
  textSecondary?: string
  borderPrimary?: string
  borderSecondary?: string
}

// === User Preferences ===

/**
 * User layout preferences
 */
export interface UserLayoutPreferences {
  /** User ID */
  userId: string
  /** Global layout preferences */
  global?: GlobalLayoutPreferences
  /** Entity-specific preferences */
  entities?: EntityLayoutPreferences
  /** Custom layouts created by user */
  customLayouts?: LayoutConfiguration[]
}

export interface GlobalLayoutPreferences {
  /** Default layout density */
  density?: 'compact' | 'comfortable' | 'spacious'
  /** Preferred theme */
  theme?: 'light' | 'dark' | 'auto'
  /** Animation preferences */
  animations?: boolean
  /** Accessibility preferences */
  a11y?: {
    reduceMotion?: boolean
    highContrast?: boolean
    screenReader?: boolean
  }
}

export interface EntityLayoutPreferences {
  organizations?: {
    defaultLayoutId?: string
    viewMode?: 'list' | 'grid' | 'card'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  contacts?: {
    defaultLayoutId?: string
    viewMode?: 'list' | 'grid' | 'card'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  opportunities?: {
    defaultLayoutId?: string
    viewMode?: 'list' | 'grid' | 'card'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  products?: {
    defaultLayoutId?: string
    viewMode?: 'list' | 'grid' | 'card'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  interactions?: {
    defaultLayoutId?: string
    viewMode?: 'list' | 'grid' | 'card'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
}

// === Database Storage ===

/**
 * Layout storage format for database persistence
 */
export interface LayoutStorageFormat {
  id: string
  name: string
  entity_type: LayoutEntityType
  layout_type: LayoutType
  configuration: Json
  metadata: Json
  is_shared: boolean
  is_default: boolean
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Layout schema version for migrations
 */
export interface LayoutSchemaVersion {
  version: string
  description: string
  migrations: LayoutMigration[]
}

// === Migration ===

/**
 * Layout migration definition
 */
export interface LayoutMigration {
  id: string
  fromVersion: string
  toVersion: string
  description: string
  migrationFunction: (layout: LayoutConfiguration) => LayoutConfiguration
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean
  fromVersion: string
  toVersion: string
  errors?: string[]
  warnings?: string[]
  layout?: LayoutConfiguration
}

// === Component Props ===

/**
 * Generic props for layout components
 */
export interface LayoutComponentProps {
  /** Layout configuration being rendered */
  layoutConfig: LayoutConfiguration
  /** Data to be displayed */
  data?: any[]
  /** Callback when layout configuration changes */
  onConfigChange?: (config: LayoutConfiguration) => void
  /** Callback when data changes */
  onDataChange?: (data: any[]) => void
  /** Additional CSS classes */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
  /** Children components */
  children?: ReactNode
}

// === Type Guards ===

/**
 * Type guard for slot-based layouts
 */
export function isSlotBasedLayout(layout: LayoutConfiguration): layout is SlotBasedLayout {
  return layout.type === 'slots'
}

/**
 * Type guard for grid-based layouts
 */
export function isGridBasedLayout(layout: LayoutConfiguration): layout is GridBasedLayout {
  return layout.type === 'grid'
}

/**
 * Type guard for flex-based layouts
 */
export function isFlexBasedLayout(layout: LayoutConfiguration): layout is FlexBasedLayout {
  return layout.type === 'flex'
}