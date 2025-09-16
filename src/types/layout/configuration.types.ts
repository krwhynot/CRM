import type { ReactNode } from 'react'
import type {
  LayoutConfiguration,
  LayoutEntityType,
  SlotType,
  UserLayoutPreferences,
  DesignTokenConfig,
  ResponsiveConfig
} from './schema.types'
import type {
  RegisteredComponent,
  ComponentResolver,
  ValidationResult,
  ResolverContext
} from './registry.types'
import type { Database, Json } from '../../lib/database.types'

// Layout Configuration Manager
export interface LayoutConfigManager {
  // Configuration Operations
  create(config: CreateLayoutConfigRequest): Promise<LayoutConfiguration>
  update(id: string, updates: UpdateLayoutConfigRequest): Promise<LayoutConfiguration>
  delete(id: string): Promise<void>
  get(id: string): Promise<LayoutConfiguration | null>
  list(filter?: LayoutConfigFilter): Promise<LayoutConfiguration[]>

  // Template Operations
  createTemplate(config: LayoutConfiguration, metadata: TemplateMetadata): Promise<LayoutTemplate>
  applyTemplate(templateId: string, overrides?: Partial<LayoutConfiguration>): Promise<LayoutConfiguration>

  // Validation & Migration
  validate(config: LayoutConfiguration): Promise<ValidationResult>
  migrate(config: LayoutConfiguration, targetVersion: string): Promise<LayoutConfiguration>

  // User Preferences
  saveUserPreferences(userId: string, preferences: UserLayoutPreferences): Promise<void>
  getUserPreferences(userId: string): Promise<UserLayoutPreferences>

  // Export/Import
  export(configIds: string[]): Promise<LayoutExport>
  import(layoutExport: LayoutExport): Promise<ImportResult>
}

// Configuration Requests
export interface CreateLayoutConfigRequest {
  name: string
  entityType: LayoutEntityType
  type: 'slots' | 'grid' | 'flex'
  baseTemplate?: string
  structure: any // Depends on type
  metadata: Partial<LayoutConfiguration['metadata']>
}

export interface UpdateLayoutConfigRequest {
  name?: string
  structure?: any
  metadata?: Partial<LayoutConfiguration['metadata']>
}

// Configuration Filtering
export interface LayoutConfigFilter {
  entityType?: LayoutEntityType | LayoutEntityType[]
  type?: ('slots' | 'grid' | 'flex')[]
  category?: ('default' | 'custom' | 'template' | 'shared')[]
  createdBy?: string
  isShared?: boolean
  isDefault?: boolean
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount'
  sortOrder?: 'asc' | 'desc'
}

// Layout Templates
export interface LayoutTemplate {
  id: string
  name: string
  description?: string
  category: string
  entityType: LayoutEntityType
  preview?: string // Base64 image or URL
  configuration: LayoutConfiguration
  metadata: TemplateMetadata
  usage: TemplateUsage
}

export interface TemplateMetadata {
  author: string
  version: string
  license?: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  features: string[]
  requirements: string[]
  changelog?: TemplateChange[]
}

export interface TemplateChange {
  version: string
  date: string
  changes: string[]
  breaking?: boolean
}

export interface TemplateUsage {
  totalInstalls: number
  recentInstalls: number
  rating: number
  reviews: number
}

// Configuration State Management
export interface LayoutConfigState {
  // Active Configuration
  activeConfig: LayoutConfiguration | null
  isLoading: boolean
  error: Error | null

  // Available Configurations
  availableConfigs: LayoutConfiguration[]
  templates: LayoutTemplate[]

  // User Preferences
  userPreferences: UserLayoutPreferences | null

  // Editor State
  editorMode: 'view' | 'edit' | 'preview'
  selectedSlot: string | null
  clipboard: ClipboardItem | null

  // Undo/Redo
  history: LayoutConfiguration[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
}

export interface ClipboardItem {
  type: 'slot' | 'component' | 'section'
  data: any
  timestamp: string
}

// Configuration Actions
export interface LayoutConfigActions {
  // Configuration Management
  loadConfig: (id: string) => Promise<void>
  saveConfig: (config?: LayoutConfiguration) => Promise<void>
  createConfig: (request: CreateLayoutConfigRequest) => Promise<void>
  duplicateConfig: (id: string, newName: string) => Promise<void>

  // Editing Actions
  setEditorMode: (mode: 'view' | 'edit' | 'preview') => void
  selectSlot: (slotId: string | null) => void
  updateSlot: (slotId: string, updates: any) => void
  addSlot: (slot: any, parentId?: string) => void
  removeSlot: (slotId: string) => void
  moveSlot: (slotId: string, newPosition: number, newParent?: string) => void

  // Component Management
  addComponent: (slotId: string, componentId: string, props?: any) => void
  updateComponent: (slotId: string, componentId: string, updates: any) => void
  removeComponent: (slotId: string, componentId: string) => void

  // Clipboard Operations
  copy: (type: 'slot' | 'component', id: string) => void
  cut: (type: 'slot' | 'component', id: string) => void
  paste: (targetSlotId?: string) => void

  // History Management
  undo: () => void
  redo: () => void
  clearHistory: () => void
  pushToHistory: () => void

  // Preferences
  updatePreferences: (updates: Partial<UserLayoutPreferences>) => void
}

// Layout Builder Configuration
export interface LayoutBuilderConfig {
  // Builder Mode
  mode: 'basic' | 'advanced' | 'code'

  // Available Components
  enabledCategories: string[]
  enabledComponents: string[]
  customComponents?: RegisteredComponent[]

  // UI Configuration
  showPreview: boolean
  showCode: boolean
  showValidation: boolean
  autoSave: boolean
  autoValidate: boolean

  // Grid & Snapping
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number

  // Responsive Design
  responsiveMode: keyof ResponsiveConfig['breakpoints'] | 'all'
  showBreakpoints: boolean

  // Advanced Features
  enableScripting: boolean
  enableCustomCSS: boolean
  enableDataBinding: boolean
  enableConditionalLogic: boolean

  // Permissions
  canEditStructure: boolean
  canEditProps: boolean
  canAddComponents: boolean
  canRemoveComponents: boolean
  canSaveTemplate: boolean
  canShareLayout: boolean
}

// Layout Runtime Configuration
export interface LayoutRuntimeConfig {
  // Component Registry
  componentRegistry: any // Will be ComponentRegistry from registry.types
  resolver: ComponentResolver

  // Data Binding
  dataSource?: DataSourceConfig
  realTimeUpdates: boolean
  caching: CachingConfig

  // Error Handling
  errorBoundary: boolean
  fallbackComponent?: RegisteredComponent
  onError?: (error: Error, info: { componentStack: string }) => void

  // Performance
  virtualization: VirtualizationConfig
  lazyLoading: boolean
  preloadComponents: string[]

  // Security
  sanitizeProps: boolean
  allowedTags: string[]
  allowedAttributes: string[]
}

// Data Source Configuration
export interface DataSourceConfig {
  type: 'static' | 'api' | 'websocket' | 'supabase'
  endpoint?: string
  query?: string
  realTime?: boolean
  polling?: {
    enabled: boolean
    interval: number
  }
  transform?: (data: any) => any
}

// Caching Configuration
export interface CachingConfig {
  enabled: boolean
  ttl: number // Time to live in milliseconds
  maxSize: number
  strategies: ('memory' | 'localStorage' | 'sessionStorage' | 'indexedDB')[]
}

// Virtualization Configuration
export interface VirtualizationConfig {
  enabled: boolean
  threshold: number // Number of items before virtualization kicks in
  itemHeight?: number | ((index: number) => number)
  overscan?: number
}

// Layout Export/Import
export interface LayoutExport {
  version: string
  timestamp: string
  configurations: LayoutConfiguration[]
  templates?: LayoutTemplate[]
  metadata: ExportMetadata
}

export interface ExportMetadata {
  exportedBy: string
  description?: string
  tags: string[]
  includeUserData: boolean
  includeCustomComponents: boolean
}

export interface ImportResult {
  success: boolean
  imported: {
    configurations: string[] // IDs of imported configs
    templates: string[] // IDs of imported templates
  }
  skipped: {
    configurations: Array<{ id: string; reason: string }>
    templates: Array<{ id: string; reason: string }>
  }
  errors: string[]
}

// Configuration Validation
export interface ConfigValidationResult extends ValidationResult {
  performance: PerformanceAnalysis
  accessibility: AccessibilityAnalysis
  compatibility: CompatibilityAnalysis
}

export interface PerformanceAnalysis {
  score: number // 0-100
  issues: PerformanceIssue[]
  recommendations: string[]
}

export interface PerformanceIssue {
  type: 'bundle_size' | 'render_time' | 'memory_usage' | 'layout_thrashing'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  component?: string
  suggestion: string
}

export interface AccessibilityAnalysis {
  level: 'A' | 'AA' | 'AAA'
  issues: AccessibilityIssue[]
  score: number
}

export interface AccessibilityIssue {
  rule: string
  severity: 'error' | 'warning' | 'info'
  element: string
  message: string
  fix: string
}

export interface CompatibilityAnalysis {
  browserSupport: BrowserSupport
  deviceSupport: DeviceSupport
  featureSupport: FeatureSupport
}

export interface BrowserSupport {
  chrome: string
  firefox: string
  safari: string
  edge: string
  mobile: string
}

export interface DeviceSupport {
  mobile: boolean
  tablet: boolean
  desktop: boolean
  accessibility: boolean
}

export interface FeatureSupport {
  css: string[]
  javascript: string[]
  webapis: string[]
}

// Database Integration Types
export interface LayoutStorageService {
  // Database operations for user_preferences table
  saveLayout: (userId: string, layout: LayoutConfiguration) => Promise<void>
  loadLayout: (userId: string, layoutId: string) => Promise<LayoutConfiguration | null>
  listLayouts: (userId: string, filter?: LayoutConfigFilter) => Promise<LayoutConfiguration[]>
  deleteLayout: (userId: string, layoutId: string) => Promise<void>

  // User preferences
  savePreferences: (userId: string, preferences: UserLayoutPreferences) => Promise<void>
  loadPreferences: (userId: string) => Promise<UserLayoutPreferences | null>

  // Sharing and templates
  shareLayout: (layoutId: string, shareConfig: ShareConfig) => Promise<string> // Returns share ID
  loadSharedLayout: (shareId: string) => Promise<LayoutConfiguration | null>
}

export interface ShareConfig {
  public: boolean
  allowCopy: boolean
  allowModify: boolean
  expiresAt?: string
  description?: string
}

// React Hook Types
export interface UseLayoutConfig {
  configId?: string
  entityType: LayoutEntityType
  userId?: string
}

export interface UseLayoutConfigReturn {
  // State
  config: LayoutConfiguration | null
  isLoading: boolean
  error: Error | null

  // Actions
  loadConfig: (id: string) => Promise<void>
  saveConfig: (config?: LayoutConfiguration) => Promise<void>
  createConfig: (request: CreateLayoutConfigRequest) => Promise<string>
  updateConfig: (updates: UpdateLayoutConfigRequest) => Promise<void>
  deleteConfig: () => Promise<void>

  // Validation
  validate: () => Promise<ValidationResult>

  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

// Context Types
export interface LayoutConfigContext {
  // Configuration
  config: LayoutConfiguration | null
  setConfig: (config: LayoutConfiguration) => void

  // Registry
  componentRegistry: any // ComponentRegistry

  // Runtime
  runtimeConfig: LayoutRuntimeConfig

  // User Context
  userId?: string
  permissions: string[]
  preferences: UserLayoutPreferences | null

  // Editor Context
  isEditing: boolean
  selectedSlot: string | null
  builderConfig?: LayoutBuilderConfig
}

// Event Types
export interface LayoutConfigEvent {
  type: 'config_loaded' | 'config_saved' | 'config_changed' | 'slot_selected' | 'component_added'
  payload: any
  timestamp: string
  userId?: string
}

export interface LayoutConfigEventHandler {
  (event: LayoutConfigEvent): void | Promise<void>
}