import type { ReactNode, ComponentType, LazyExoticComponent } from 'react'
import type { LayoutEntityType, SlotType, LayoutConfiguration } from './schema.types'

// Component Registry Core Types
export interface ComponentRegistry {
  components: Map<string, RegisteredComponent>
  categories: Map<string, ComponentCategory>
  resolvers: Map<string, ComponentResolver>
  validators: Map<string, ComponentValidator>
  metadata: RegistryMetadata
}

// Registry Metadata
export interface RegistryMetadata {
  version: string
  lastUpdated: string
  totalComponents: number
  categories: string[]
  supportedSlotTypes: SlotType[]
  supportedEntityTypes: LayoutEntityType[]
}

// Registered Component Definition
export interface RegisteredComponent {
  id: string
  name: string
  displayName: string
  description?: string
  category: string
  version: string

  // Component Loading
  component: ComponentType<any> | LazyExoticComponent<ComponentType<any>>
  loading: 'sync' | 'lazy' | 'dynamic'
  preload?: boolean

  // Slot Compatibility
  compatibleSlots: SlotType[]
  entityTypes: LayoutEntityType[]

  // Props and Configuration
  props: ComponentPropsSchema
  defaultProps: Record<string, any>
  requiredProps: string[]

  // Metadata
  metadata: ComponentMetadata

  // Runtime
  validator?: ComponentValidator
  transformer?: PropTransformer
  dependencies?: string[]
}

// Component Category
export interface ComponentCategory {
  id: string
  name: string
  displayName: string
  description?: string
  icon?: string
  color?: string
  parentCategory?: string
  order: number
  components: string[] // Component IDs
}

// Component Props Schema (for type checking and UI generation)
export interface ComponentPropsSchema {
  properties: Record<string, PropDefinition>
  required: string[]
  additionalProperties?: boolean
  conditionalProps?: ConditionalPropRule[]
}

// Property Definition
export interface PropDefinition {
  type: PropType
  description?: string
  default?: any
  enum?: any[]
  format?: string
  minimum?: number
  maximum?: number
  pattern?: string
  items?: PropDefinition // For array types
  properties?: Record<string, PropDefinition> // For object types

  // UI Configuration
  ui?: PropUIConfig

  // Validation
  validation?: PropValidationRule[]

  // Dependencies
  dependsOn?: string[]
  affects?: string[]
}

export type PropType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'reactNode'
  | 'function'
  | 'enum'
  | 'oneOf'
  | 'anyOf'

// UI Configuration for Props
export interface PropUIConfig {
  widget: WidgetType
  label?: string
  placeholder?: string
  helpText?: string
  order?: number
  section?: string
  hidden?: boolean
  disabled?: boolean
  readOnly?: boolean

  // Widget-specific options
  options?: Record<string, any>
}

export type WidgetType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'multiSelect'
  | 'checkbox'
  | 'toggle'
  | 'slider'
  | 'colorPicker'
  | 'datePicker'
  | 'timePicker'
  | 'fileUpload'
  | 'iconPicker'
  | 'codeEditor'
  | 'richText'
  | 'custom'

// Prop Validation
export interface PropValidationRule {
  type: 'required' | 'pattern' | 'range' | 'length' | 'custom'
  value?: any
  message: string
  validator?: (value: any, props: Record<string, any>) => boolean
}

// Conditional Prop Rules
export interface ConditionalPropRule {
  when: {
    property: string
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'exists' | 'not_exists'
    value?: any
  }
  then: {
    show?: string[]
    hide?: string[]
    require?: string[]
    disable?: string[]
  }
}

// Component Metadata
export interface ComponentMetadata {
  author: string
  license: string
  repository?: string
  documentation?: string
  examples?: ComponentExample[]
  tags: string[]
  maturity: 'alpha' | 'beta' | 'stable' | 'deprecated'
  accessibility: AccessibilityInfo
  performance: PerformanceInfo
  testing: TestingInfo
}

export interface ComponentExample {
  name: string
  description?: string
  props: Record<string, any>
  code?: string
}

export interface AccessibilityInfo {
  level: 'AA' | 'AAA'
  features: string[]
  ariaSupport: boolean
  keyboardNavigation: boolean
  screenReaderSupport: boolean
}

export interface PerformanceInfo {
  bundleSize: number
  renderTime: number
  memoryUsage: number
  dependencies: string[]
  lazyLoadable: boolean
}

export interface TestingInfo {
  unitTests: boolean
  integrationTests: boolean
  e2eTests: boolean
  coverage: number
  testFiles: string[]
}

// Component Resolution
export interface ComponentResolver {
  id: string
  name: string
  resolve: (
    componentId: string,
    props: Record<string, any>,
    context: ResolverContext
  ) => Promise<ResolvedComponent> | ResolvedComponent
  cache?: boolean
  priority?: number
}

export interface ResolverContext {
  slotType: SlotType
  entityType: LayoutEntityType
  layoutConfig: LayoutConfiguration
  userPreferences: any
  permissions: string[]
  features: string[]
}

export interface ResolvedComponent {
  component: ComponentType<any>
  props: Record<string, any>
  metadata?: any
  errors?: string[]
  warnings?: string[]
}

// Component Validation
export interface ComponentValidator {
  id: string
  name: string
  validate: (
    component: RegisteredComponent,
    props: Record<string, any>,
    context: ValidationContext
  ) => ValidationResult
}

export interface ValidationContext {
  slotType: SlotType
  entityType: LayoutEntityType
  siblingComponents: RegisteredComponent[]
  parentLayout: LayoutConfiguration
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  property?: string
  message: string
  code: string
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationWarning {
  property?: string
  message: string
  code: string
  suggestion?: string
}

// Prop Transformation
export interface PropTransformer {
  id: string
  name: string
  transform: (
    props: Record<string, any>,
    context: TransformContext
  ) => Record<string, any>
}

export interface TransformContext {
  component: RegisteredComponent
  slotType: SlotType
  entityType: LayoutEntityType
  data?: any[]
  layoutConfig: LayoutConfiguration
}

// Registry Operations
export interface RegistryOperation {
  register(component: RegisteredComponent): Promise<void>
  unregister(componentId: string): Promise<void>
  update(componentId: string, updates: Partial<RegisteredComponent>): Promise<void>
  get(componentId: string): RegisteredComponent | undefined
  list(filter?: ComponentFilter): RegisteredComponent[]
  categories(): ComponentCategory[]
  resolve(componentId: string, context: ResolverContext): Promise<ResolvedComponent>
  validate(componentId: string, props: Record<string, any>, context: ValidationContext): ValidationResult
}

// Component Filtering
export interface ComponentFilter {
  category?: string | string[]
  slotType?: SlotType | SlotType[]
  entityType?: LayoutEntityType | LayoutEntityType[]
  maturity?: ('alpha' | 'beta' | 'stable')[]
  search?: string
  tags?: string[]
}

// Built-in Component Types
export interface BuiltinComponents {
  // Layout Components
  PageLayout: RegisteredComponent
  SlotRenderer: RegisteredComponent
  ComponentRenderer: RegisteredComponent

  // Content Components
  DataTable: RegisteredComponent
  DataGrid: RegisteredComponent
  CardGrid: RegisteredComponent
  ListView: RegisteredComponent

  // Filter Components
  FilterSidebar: RegisteredComponent
  QuickFilters: RegisteredComponent
  AdvancedFilters: RegisteredComponent
  SearchBox: RegisteredComponent

  // Form Components
  SimpleForm: RegisteredComponent
  WizardForm: RegisteredComponent
  InlineEdit: RegisteredComponent
  BulkEdit: RegisteredComponent

  // Action Components
  ActionBar: RegisteredComponent
  BulkActions: RegisteredComponent
  ExportActions: RegisteredComponent
  ImportActions: RegisteredComponent

  // Navigation Components
  Breadcrumbs: RegisteredComponent
  Pagination: RegisteredComponent
  Tabs: RegisteredComponent
  Steps: RegisteredComponent

  // Utility Components
  LoadingSpinner: RegisteredComponent
  ErrorBoundary: RegisteredComponent
  EmptyState: RegisteredComponent
  PermissionGate: RegisteredComponent
}

// Type-Safe Component Registration
export interface TypedComponentRegistration<TProps = any> {
  component: ComponentType<TProps>
  metadata: Omit<RegisteredComponent, 'component' | 'props'>
  propsSchema: ComponentPropsSchema
}

// Dynamic Component Loading
export interface DynamicComponentLoader {
  load(componentId: string): Promise<ComponentType<any>>
  preload(componentIds: string[]): Promise<void>
  invalidate(componentId: string): void
  getLoadedComponents(): string[]
}

// Component Hot Reloading (Development)
export interface ComponentHotReload {
  watch(componentId: string, callback: (newComponent: ComponentType<any>) => void): () => void
  replace(componentId: string, newComponent: ComponentType<any>): void
  restore(componentId: string): void
}

// Registry Plugin System
export interface RegistryPlugin {
  id: string
  name: string
  version: string
  install(registry: ComponentRegistry): Promise<void>
  uninstall(registry: ComponentRegistry): Promise<void>
  components?: RegisteredComponent[]
  categories?: ComponentCategory[]
  resolvers?: ComponentResolver[]
  validators?: ComponentValidator[]
}

// Type Utilities
export type ComponentProps<T extends keyof BuiltinComponents> =
  BuiltinComponents[T] extends RegisteredComponent
    ? BuiltinComponents[T]['props']
    : never

export type ComponentInstance<T extends string> =
  T extends keyof BuiltinComponents
    ? BuiltinComponents[T]['component']
    : ComponentType<any>

// Registry Events
export interface RegistryEvent {
  type: 'component_registered' | 'component_unregistered' | 'component_updated' | 'category_added'
  payload: any
  timestamp: string
}

export interface RegistryEventHandler {
  (event: RegistryEvent): void | Promise<void>
}

// Registry Configuration
export interface RegistryConfig {
  enableLazyLoading: boolean
  enableHotReload: boolean
  enableValidation: boolean
  cacheComponents: boolean
  maxCacheSize: number
  preloadCriticalComponents: boolean
  strictMode: boolean
  developmentMode: boolean
}

// Render Engine Types
export interface RenderOptions {
  enableVirtualization: 'auto' | 'always' | 'never'
  enableErrorBoundaries: boolean
  enablePerformanceMonitoring: boolean
  enableCaching: boolean
  strictValidation: boolean
  renderMode: 'development' | 'production'
  maxRetries: number
}

export interface RenderResult {
  success: boolean
  component?: ComponentType<any>
  props?: Record<string, any>
  metadata?: {
    layoutType: string
    renderTime: number
    [key: string]: any
  }
  errors?: string[]
  warnings?: string[]
}

// Component and Layout Renderer Interfaces
export interface ComponentRenderer {
  render(component: any, context: ResolverContext): Promise<RenderResult>
  renderMany(components: any[], context: ResolverContext): Promise<RenderResult[]>
}

export interface LayoutRenderer {
  render<T = any>(
    layoutConfig: LayoutConfiguration,
    data?: T[],
    options?: Partial<RenderOptions>
  ): Promise<RenderResult>
  clearCache(): void
  getPerformanceStats(): any
  setRegistry(registry: LayoutComponentRegistry): void
}

// Performance and Error Handling
export interface PerformanceOptions {
  virtualizationThreshold: number
  renderTimeWarningMs: number
  cacheMaxSize: number
  errorRetryLimit: number
}

export interface ErrorBoundaryConfig {
  fallbackComponent?: ComponentType<any>
  onError?: (error: Error, errorInfo: any) => void
  resetOnPropsChange?: boolean
}

// Export Registry Instance Type
export type LayoutComponentRegistry = ComponentRegistry & RegistryOperation