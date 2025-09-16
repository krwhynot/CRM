// Layout Type System - Main Exports
// Centralized access to all layout-as-data type definitions

// Core Schema Types
export type {
  // Entity and Layout Types
  LayoutEntityType,
  LayoutConfiguration,
  SlotBasedLayout,
  GridBasedLayout,
  FlexBasedLayout,
  EntitySpecificLayoutConfig,
  OrganizationLayoutConfig,
  ContactLayoutConfig,
  OpportunityLayoutConfig,
  ProductLayoutConfig,
  InteractionLayoutConfig,

  // Layout Structure
  BaseLayoutConfig,
  LayoutMetadata,
  SlotConfiguration,
  SlotType,
  SlotBehavior,
  CompositionRules,
  InheritanceConfig,
  ValidationRules,
  ValidationFunction,

  // Responsive Design
  ResponsiveConfig,
  ResponsiveBreakpoints,
  ResponsiveSlotConfig,

  // Conditional Logic
  ConditionalConfig,
  ConditionalExpression,

  // Grid Layout Types
  GridGap,
  GridArea,
  GridPosition,
  ResponsiveGridConfig,

  // Flex Layout Types
  FlexJustify,
  FlexAlign,
  FlexGap,
  ResponsiveFlexConfig,

  // Design Token Integration
  DesignTokenConfig,
  SpacingTokens,
  TypographyTokens,
  ColorTokens,
  ShadowTokens,
  RadiusTokens,
  SemanticTokenMapping,

  // User Preferences
  UserLayoutPreferences,
  GlobalLayoutPreferences,
  EntityLayoutPreferences,

  // Database Storage
  LayoutStorageFormat,
  LayoutSchemaVersion,

  // Migration
  LayoutMigration,
  MigrationResult,

  // Generic Props
  LayoutComponentProps,
} from './schema.types'

export {
  // Type Guards
  isSlotBasedLayout,
  isGridBasedLayout,
  isFlexBasedLayout,
} from './schema.types'

// Component Registry Types
export type {
  // Core Registry
  ComponentRegistry,
  RegistryMetadata,
  RegisteredComponent,
  ComponentCategory,

  // Component Props and Schema
  ComponentPropsSchema,
  PropDefinition,
  PropType,
  PropUIConfig,
  WidgetType,
  PropValidationRule,
  ConditionalPropRule,

  // Component Metadata
  ComponentMetadata,
  ComponentExample,
  AccessibilityInfo,
  PerformanceInfo,
  TestingInfo,

  // Component Resolution
  ComponentResolver,
  ResolverContext,
  ResolvedComponent,

  // Validation
  ComponentValidator,
  ValidationContext,
  ValidationResult,
  ValidationError,
  ValidationWarning,

  // Prop Transformation
  PropTransformer,
  TransformContext,

  // Registry Operations
  RegistryOperation,
  ComponentFilter,

  // Built-in Components
  BuiltinComponents,

  // Type-Safe Registration
  TypedComponentRegistration,

  // Dynamic Loading
  DynamicComponentLoader,
  ComponentHotReload,

  // Plugin System
  RegistryPlugin,

  // Events
  RegistryEvent,
  RegistryEventHandler,

  // Configuration
  RegistryConfig,

  // Main Registry Type
  LayoutComponentRegistry,
} from './registry.types'

export type {
  // Utilities
  ComponentProps,
  ComponentInstance,
} from './registry.types'

// Configuration Management Types
export type {
  // Configuration Manager
  LayoutConfigManager,

  // Configuration Requests
  CreateLayoutConfigRequest,
  UpdateLayoutConfigRequest,
  LayoutConfigFilter,

  // Templates
  LayoutTemplate,
  TemplateMetadata,
  TemplateChange,
  TemplateUsage,

  // State Management
  LayoutConfigState,
  ClipboardItem,
  LayoutConfigActions,

  // Builder Configuration
  LayoutBuilderConfig,

  // Runtime Configuration
  LayoutRuntimeConfig,
  DataSourceConfig,
  CachingConfig,
  VirtualizationConfig,

  // Export/Import
  LayoutExport,
  ExportMetadata,
  ImportResult,

  // Validation
  ConfigValidationResult,
  PerformanceAnalysis,
  PerformanceIssue,
  AccessibilityAnalysis,
  AccessibilityIssue,
  CompatibilityAnalysis,
  BrowserSupport,
  DeviceSupport,
  FeatureSupport,

  // Database Integration
  LayoutStorageService,
  ShareConfig,

  // React Hooks
  UseLayoutConfig,
  UseLayoutConfigReturn,

  // Context
  LayoutConfigContext,

  // Events
  LayoutConfigEvent,
  LayoutConfigEventHandler,
} from './configuration.types'

// Re-export commonly used types for convenience
export type {
  // From Database Types (already imported in schema.types)
  Json as DatabaseJson,
} from '../../lib/database.types'

export type {
  // From Entity Types
  EntityType,
} from '../forms/form-interfaces'

// Constants for common layout configurations
export const LAYOUT_CONSTANTS = {
  // Schema Versions
  CURRENT_SCHEMA_VERSION: '1.0.0',
  SUPPORTED_VERSIONS: ['1.0.0'],

  // Default Responsive Breakpoints
  DEFAULT_BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    laptop: 1280,
    desktop: 1920,
  } as const,

  // Slot Types
  SLOT_TYPES: [
    'header',
    'title',
    'subtitle',
    'meta',
    'actions',
    'filters',
    'search',
    'content',
    'sidebar',
    'footer',
    'custom',
  ] as const,

  // Entity Types
  ENTITY_TYPES: [
    'organizations',
    'contacts',
    'opportunities',
    'products',
    'interactions',
  ] as const,

  // Layout Types
  LAYOUT_TYPES: ['slots', 'grid', 'flex'] as const,

  // Category Types
  CATEGORY_TYPES: ['default', 'custom', 'template', 'shared'] as const,

  // Widget Types
  WIDGET_TYPES: [
    'input',
    'textarea',
    'select',
    'multiSelect',
    'checkbox',
    'toggle',
    'slider',
    'colorPicker',
    'datePicker',
    'timePicker',
    'fileUpload',
    'iconPicker',
    'codeEditor',
    'richText',
    'custom',
  ] as const,

  // Performance Thresholds
  PERFORMANCE: {
    VIRTUALIZATION_THRESHOLD: 500,
    MAX_BUNDLE_SIZE: 3 * 1024 * 1024, // 3MB
    MAX_RENDER_TIME: 16, // 16ms (60fps)
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  },

  // Validation Limits
  LIMITS: {
    MAX_SLOTS: 20,
    MAX_COMPONENTS_PER_SLOT: 10,
    MAX_NESTING_DEPTH: 5,
    MAX_LAYOUT_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },
} as const

// Utility type helpers
export type LayoutConstant<K extends keyof typeof LAYOUT_CONSTANTS> = typeof LAYOUT_CONSTANTS[K]

export type SlotTypeConstant = typeof LAYOUT_CONSTANTS.SLOT_TYPES[number]
export type EntityTypeConstant = typeof LAYOUT_CONSTANTS.ENTITY_TYPES[number]
export type LayoutTypeConstant = typeof LAYOUT_CONSTANTS.LAYOUT_TYPES[number]
export type CategoryTypeConstant = typeof LAYOUT_CONSTANTS.CATEGORY_TYPES[number]
export type WidgetTypeConstant = typeof LAYOUT_CONSTANTS.WIDGET_TYPES[number]

// Export all types in organized namespaces
export * as LayoutSchema from './schema.types'
export * as LayoutRegistry from './registry.types'
export * as LayoutConfig from './configuration.types'