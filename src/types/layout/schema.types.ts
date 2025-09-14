import type { ReactNode } from 'react'
import type { Database, Json } from '@/lib/database.types'
import type { EntityType } from '@/types/forms/form-interfaces'

// Core Entity Types for Layout System
export type LayoutEntityType = 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'

// Layout Schema Version Management
export interface LayoutSchemaVersion {
  version: string
  createdAt: string
  deprecated?: boolean
  migrationPath?: string
}

// Base Layout Configuration
export interface BaseLayoutConfig {
  id: string
  name: string
  version: string
  entityType: LayoutEntityType
  metadata: LayoutMetadata
}

// Layout Metadata
export interface LayoutMetadata {
  displayName: string
  description?: string
  category: 'default' | 'custom' | 'template' | 'shared'
  tags: string[]
  isShared: boolean
  isDefault: boolean
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  lastUsed?: string
  usageCount: number
}

// Responsive Breakpoints
export interface ResponsiveBreakpoints {
  mobile: number    // 0-768px
  tablet: number    // 768-1024px
  laptop: number    // 1024-1280px
  desktop: number   // 1280px+
}

export interface ResponsiveConfig {
  breakpoints: ResponsiveBreakpoints
  mobileFirst: boolean
  adaptiveLayout: boolean
}

// Slot-Based Layout Structure
export interface SlotConfiguration {
  id: string
  type: SlotType
  name: string
  displayName?: string
  required: boolean
  multiple: boolean
  allowedComponents?: string[]
  defaultComponent?: string
  props?: Record<string, any>
  responsive?: ResponsiveSlotConfig
  conditional?: ConditionalConfig
}

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

export interface ResponsiveSlotConfig {
  mobile?: SlotBehavior
  tablet?: SlotBehavior
  laptop?: SlotBehavior
  desktop?: SlotBehavior
}

export interface SlotBehavior {
  visible: boolean
  order?: number
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto'
  alignment?: 'start' | 'center' | 'end' | 'stretch'
}

// Conditional Rendering
export interface ConditionalConfig {
  when: ConditionalExpression
  then?: SlotBehavior
  else?: SlotBehavior
}

export interface ConditionalExpression {
  type: 'field' | 'permission' | 'feature' | 'custom'
  field?: string
  operator?: 'equals' | 'not_equals' | 'contains' | 'exists' | 'greater_than' | 'less_than'
  value?: any
  permission?: string
  feature?: string
  customCheck?: string // JavaScript expression or function name
}

// Layout Type Definitions
export interface SlotBasedLayout extends BaseLayoutConfig {
  type: 'slots'
  structure: {
    slots: SlotConfiguration[]
    composition: CompositionRules
    responsive: ResponsiveConfig
  }
}

export interface GridBasedLayout extends BaseLayoutConfig {
  type: 'grid'
  structure: {
    columns: number
    rows?: number
    gap: GridGap
    areas: GridArea[]
    responsive: ResponsiveGridConfig
  }
}

export interface FlexBasedLayout extends BaseLayoutConfig {
  type: 'flex'
  structure: {
    direction: 'row' | 'column'
    wrap: boolean
    justify: FlexJustify
    align: FlexAlign
    gap: FlexGap
    responsive: ResponsiveFlexConfig
  }
}

// Layout Structure Union Type
export type LayoutConfiguration = SlotBasedLayout | GridBasedLayout | FlexBasedLayout

// Composition Rules
export interface CompositionRules {
  maxSlots?: number
  requiredSlots: string[]
  slotOrder: string[]
  inheritance: InheritanceConfig
  validation: ValidationRules
}

export interface InheritanceConfig {
  inheritsFrom?: string // Parent layout ID
  overrides: string[] // Slot IDs that override parent
  merge: string[] // Slot IDs that merge with parent
}

export interface ValidationRules {
  required: string[]
  dependencies: Record<string, string[]> // slot -> required slots
  conflicts: Record<string, string[]> // slot -> conflicting slots
  custom?: ValidationFunction[]
}

export interface ValidationFunction {
  name: string
  expression: string // JavaScript expression
  message: string
}

// Grid Specific Types
export interface GridGap {
  row: string
  column: string
  responsive?: Record<keyof ResponsiveBreakpoints, { row: string; column: string }>
}

export interface GridArea {
  name: string
  row: GridPosition
  column: GridPosition
  component?: string
}

export interface GridPosition {
  start: number
  end: number
}

export interface ResponsiveGridConfig extends ResponsiveConfig {
  columnsMap: Record<keyof ResponsiveBreakpoints, number>
  gapMap?: Record<keyof ResponsiveBreakpoints, GridGap>
}

// Flex Specific Types
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
export type FlexAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline'

export interface FlexGap {
  value: string
  responsive?: Record<keyof ResponsiveBreakpoints, string>
}

export interface ResponsiveFlexConfig extends ResponsiveConfig {
  directionMap?: Record<keyof ResponsiveBreakpoints, 'row' | 'column'>
  justifyMap?: Record<keyof ResponsiveBreakpoints, FlexJustify>
  alignMap?: Record<keyof ResponsiveBreakpoints, FlexAlign>
}

// Design Token Integration
export interface DesignTokenConfig {
  spacing: SpacingTokens
  typography: TypographyTokens
  colors: ColorTokens
  shadows: ShadowTokens
  radius: RadiusTokens
  semantic: SemanticTokenMapping
}

export interface SpacingTokens {
  containerPadding: string
  sectionGap: string
  componentGap: string
  fieldGap: string
}

export interface TypographyTokens {
  titleSize: string
  subtitleSize: string
  labelSize: string
  bodySize: string
}

export interface ColorTokens {
  background: string
  surface: string
  border: string
  accent: string
}

export interface ShadowTokens {
  card: string
  elevated: string
  overlay: string
}

export interface RadiusTokens {
  card: string
  input: string
  button: string
}

export interface SemanticTokenMapping {
  priority: Record<'a-plus' | 'a' | 'b' | 'c' | 'd', ColorTokens>
  orgType: Record<Database['public']['Enums']['organization_type'], ColorTokens>
  status: Record<string, ColorTokens>
}

// User Preferences Integration
export interface UserLayoutPreferences {
  userId: string
  globalPreferences: GlobalLayoutPreferences
  entityPreferences: Record<LayoutEntityType, EntityLayoutPreferences>
  customLayouts: LayoutConfiguration[]
}

export interface GlobalLayoutPreferences {
  defaultDensity: 'compact' | 'normal' | 'relaxed'
  theme: 'light' | 'dark' | 'auto'
  animations: boolean
  autoSave: boolean
  snapToGrid: boolean
}

export interface EntityLayoutPreferences {
  entityType: LayoutEntityType
  defaultLayout: string // Layout ID
  viewMode: 'list' | 'grid' | 'card' | 'table'
  sortBy: string
  sortOrder: 'asc' | 'desc'
  filters: Record<string, any>
  density: 'compact' | 'normal' | 'relaxed'
}

// JSONB Database Integration
export interface LayoutStorageFormat {
  schemaVersion: string
  layoutData: LayoutConfiguration
  preferences: UserLayoutPreferences
  metadata: {
    checksum: string
    compressed: boolean
    size: number
  }
}

// Type Guards and Utilities
export function isSlotBasedLayout(layout: LayoutConfiguration): layout is SlotBasedLayout {
  return layout.type === 'slots'
}

export function isGridBasedLayout(layout: LayoutConfiguration): layout is GridBasedLayout {
  return layout.type === 'grid'
}

export function isFlexBasedLayout(layout: LayoutConfiguration): layout is FlexBasedLayout {
  return layout.type === 'flex'
}

// Generic Layout Component Props
export interface LayoutComponentProps<T = any> {
  layoutConfig: LayoutConfiguration
  data?: T[]
  loading?: boolean
  error?: Error | null
  onConfigChange?: (config: LayoutConfiguration) => void
  onDataChange?: (data: T[]) => void
  className?: string
  style?: React.CSSProperties
}

// Entity-Specific Layout Types
export type OrganizationLayoutConfig = LayoutConfiguration & {
  entityType: 'organizations'
  entitySpecific: {
    typeFilters: Database['public']['Enums']['organization_type'][]
    priorityLevels: string[]
    hierarchyDepth: number
  }
}

export type ContactLayoutConfig = LayoutConfiguration & {
  entityType: 'contacts'
  entitySpecific: {
    roleFilters: Database['public']['Enums']['contact_role'][]
    authorityLevels: string[]
    organizationContext: boolean
  }
}

export type OpportunityLayoutConfig = LayoutConfiguration & {
  entityType: 'opportunities'
  entitySpecific: {
    stageFilters: Database['public']['Enums']['opportunity_stage'][]
    statusFilters: Database['public']['Enums']['opportunity_status'][]
    pipelineView: boolean
    valueMetrics: boolean
  }
}

export type ProductLayoutConfig = LayoutConfiguration & {
  entityType: 'products'
  entitySpecific: {
    categoryFilters: Database['public']['Enums']['product_category'][]
    principalGrouping: boolean
    inventoryStatus: boolean
    pricingView: boolean
  }
}

export type InteractionLayoutConfig = LayoutConfiguration & {
  entityType: 'interactions'
  entitySpecific: {
    typeFilters: Database['public']['Enums']['interaction_type'][]
    timelineView: boolean
    outcomeTracking: boolean
    followUpReminders: boolean
  }
}

// Union of all entity-specific layouts
export type EntitySpecificLayoutConfig =
  | OrganizationLayoutConfig
  | ContactLayoutConfig
  | OpportunityLayoutConfig
  | ProductLayoutConfig
  | InteractionLayoutConfig

// Layout Migration Types
export interface LayoutMigration {
  fromVersion: string
  toVersion: string
  migrationFn: (oldConfig: any) => LayoutConfiguration
  breaking: boolean
  description: string
}

export interface MigrationResult {
  success: boolean
  newConfig?: LayoutConfiguration
  errors: string[]
  warnings: string[]
}