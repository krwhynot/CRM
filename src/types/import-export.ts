/**
 * Import/Export Type Definitions
 *
 * Comprehensive type definitions for import/export functionality across all CRM entities.
 * Provides type-safe interfaces for file processing, field mapping, validation, and error handling.
 */

// ============================================================================
// CORE IMPORT/EXPORT INTERFACES
// ============================================================================

/**
 * Supported file formats for import/export operations
 */
export type FileFormat = 'csv' | 'xlsx' | 'json'

/**
 * Supported CRM entity types for import/export
 */
export type EntityType = 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'

/**
 * Import column definition for field mapping
 */
export interface ImportColumn {
  /** The header name from the imported file */
  header: string
  /** The corresponding CRM field name */
  field: string
  /** Whether this field is required for the entity */
  required: boolean
  /** Optional transformation function for data conversion */
  transform?: (value: string) => unknown
  /** Data type validation */
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone'
  /** Example values to help users understand the expected format */
  examples?: string[]
}

/**
 * Import error details for individual fields/rows
 */
export interface ImportError {
  /** Row number where the error occurred (1-based) */
  row: number
  /** Column name where the error occurred */
  column: string
  /** Error message describing what went wrong */
  message: string
  /** The invalid value that caused the error */
  value?: unknown
  /** Error severity level */
  severity: 'error' | 'warning'
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  /** Whether the overall import operation was successful */
  success: boolean
  /** Array of successfully imported data */
  data?: unknown[]
  /** Array of import errors - can be detailed ImportError objects or simple error objects */
  errors?: ImportError[] | Array<{ row: number; error: string }>
  /** Summary message */
  message: string
  /** Number of records successfully imported */
  imported: number
  /** Number of records that failed to import */
  failed: number
  /** Number of records skipped (e.g., duplicates) */
  skipped?: number
  /** Details of skipped records */
  skippedRecords?: SkippedRecord[]
  /** Total processing time in milliseconds */
  processingTime?: number
}

/**
 * Details of skipped records during import
 */
export interface SkippedRecord {
  /** Identifying name/title of the skipped record */
  name: string
  /** Entity type being imported */
  type: string
  /** Reason why the record was skipped */
  reason: string
  /** Original row index in the import file */
  rowIndex: number
  /** Additional context data */
  context?: Record<string, unknown>
}

// ============================================================================
// FIELD MAPPING AND VALIDATION
// ============================================================================

/**
 * Field mapping configuration for imports
 */
export interface FieldMapping {
  /** Source column from import file */
  sourceColumn: string
  /** Target field in CRM entity */
  targetField: string
  /** Whether this mapping is required */
  required: boolean
  /** Default value if source is empty */
  defaultValue?: unknown
  /** Validation rules for this field */
  validation?: FieldValidation
}

/**
 * Validation rules for imported fields
 */
export interface FieldValidation {
  /** Minimum length for strings */
  minLength?: number
  /** Maximum length for strings */
  maxLength?: number
  /** Regex pattern for validation */
  pattern?: RegExp
  /** List of allowed values */
  allowedValues?: string[]
  /** Whether the field is required */
  required?: boolean
  /** Custom validation function */
  customValidator?: (value: unknown) => string | null
}

/**
 * Import configuration and settings
 */
export interface ImportConfiguration {
  /** Type of entity being imported */
  entityType: EntityType
  /** File format */
  format: FileFormat
  /** Field mappings */
  fieldMappings: FieldMapping[]
  /** Whether to skip validation */
  skipValidation: boolean
  /** Whether to allow duplicate records */
  allowDuplicates: boolean
  /** Batch size for processing */
  batchSize: number
  /** Whether to create a backup before import */
  createBackup: boolean
  /** Additional options specific to entity type */
  entityOptions?: Record<string, unknown>
}

// ============================================================================
// EXPORT INTERFACES
// ============================================================================

/**
 * Export options and configuration
 */
export interface ExportOptions {
  /** Type of entity to export */
  entityType: EntityType
  /** Output file format */
  format: FileFormat
  /** Fields to include in export */
  selectedFields: string[]
  /** Filters to apply to data */
  filters: ExportFilters
  /** Whether to include inactive records */
  includeInactive: boolean
  /** Sorting configuration */
  sorting?: ExportSorting
  /** Maximum number of records to export */
  limit?: number
  /** Whether to include related data */
  includeRelatedData?: boolean
}

/**
 * Filters for export operations
 */
export interface ExportFilters {
  /** Date range filter */
  dateRange?: {
    start: Date
    end: Date
    field: string // Which date field to filter on
  }
  /** Entity type filters (for organizations) */
  type?: string[]
  /** Priority filters (for organizations) */
  priority?: string[]
  /** Segment filters (for organizations) */
  segment?: string[]
  /** Status filters (for opportunities) */
  status?: string[]
  /** Custom field filters */
  customFilters?: Record<string, unknown>
}

/**
 * Sorting configuration for exports
 */
export interface ExportSorting {
  /** Field to sort by */
  field: string
  /** Sort direction */
  direction: 'asc' | 'desc'
  /** Secondary sort field */
  secondaryField?: string
  /** Secondary sort direction */
  secondaryDirection?: 'asc' | 'desc'
}

/**
 * Export result details
 */
export interface ExportResult {
  /** Whether the export was successful */
  success: boolean
  /** Generated file information */
  file?: {
    name: string
    size: number
    downloadUrl?: string
  }
  /** Number of records exported */
  recordCount: number
  /** Export summary message */
  message: string
  /** Any warnings during export */
  warnings?: string[]
  /** Processing time in milliseconds */
  processingTime: number
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Progress tracking for import/export operations
 */
export interface ProgressTracker {
  /** Current operation phase */
  phase: 'parsing' | 'validating' | 'processing' | 'completing' | 'error'
  /** Overall progress percentage (0-100) */
  progress: number
  /** Current step within the phase */
  currentStep: string
  /** Number of records processed */
  recordsProcessed: number
  /** Total number of records */
  totalRecords: number
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number
  /** Current processing speed (records per second) */
  processingSpeed?: number
}

// ============================================================================
// ENTITY-SPECIFIC TYPES
// ============================================================================

/**
 * Organization-specific import data structure
 */
export interface OrganizationImportData {
  name: string
  type: 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'
  priority?: 'A+' | 'A' | 'B' | 'C' | 'D'
  segment?: string
  website?: string
  phone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  notes?: string
  primary_manager_name?: string
  secondary_manager_name?: string
  is_active?: boolean
  import_notes?: string
}

/**
 * Contact-specific import data structure
 */
export interface ContactImportData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  job_title?: string
  department?: string
  organization_name: string // Will be resolved to organization_id
  role?: 'decision_maker' | 'influencer' | 'buyer' | 'end_user' | 'gatekeeper' | 'champion'
  purchase_influence?: 'high' | 'medium' | 'low'
  decision_authority?: 'final' | 'recommend' | 'influence' | 'none'
  notes?: string
  is_active?: boolean
}

/**
 * Product-specific import data structure
 */
export interface ProductImportData {
  name: string
  description?: string
  category: string
  sku?: string
  unit_price?: number
  unit_of_measure?: string
  principal_name: string // Will be resolved to principal_id
  specifications?: string
  is_active?: boolean
}

/**
 * Opportunity-specific import data structure
 */
export interface OpportunityImportData {
  name: string
  description?: string
  organization_name: string // Will be resolved to organization_id
  contact_name?: string // Will be resolved to contact_id
  product_name?: string // Will be resolved to product_id
  stage: string
  value?: number
  probability?: number
  expected_close_date?: string
  actual_close_date?: string
  notes?: string
  is_active?: boolean
}

/**
 * Interaction-specific import data structure
 */
export interface InteractionImportData {
  type: 'call' | 'email' | 'meeting' | 'demo' | 'note'
  subject: string
  description: string
  organization_name: string // Will be resolved to organization_id
  contact_name?: string // Will be resolved to contact_id
  opportunity_name?: string // Will be resolved to opportunity_id
  interaction_date: string
  duration_minutes?: number
  outcome?: string
  follow_up_required?: boolean
  follow_up_date?: string
  notes?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Generic import data type that can be any entity
 */
export type ImportData =
  | OrganizationImportData
  | ContactImportData
  | ProductImportData
  | OpportunityImportData
  | InteractionImportData

/**
 * File processing status
 */
export type FileProcessingStatus =
  | 'pending'
  | 'uploading'
  | 'parsing'
  | 'validating'
  | 'importing'
  | 'completed'
  | 'failed'

/**
 * Template configuration for guided imports
 */
export interface ImportTemplate {
  /** Unique identifier for the template */
  id: string
  /** Human-readable name */
  name: string
  /** Description of what this template does */
  description: string
  /** Entity type this template is for */
  entityType: EntityType
  /** Predefined field mappings */
  fieldMappings: FieldMapping[]
  /** Required columns for this template */
  requiredColumns: string[]
  /** Optional columns with descriptions */
  optionalColumns: Record<string, string>
  /** Sample data for demonstration */
  sampleData?: Record<string, unknown>[]
}

/**
 * Bulk operation configuration
 */
export interface BulkOperationConfig {
  /** Type of bulk operation */
  operation: 'import' | 'export' | 'update' | 'delete'
  /** Target entity type */
  entityType: EntityType
  /** Batch size for processing */
  batchSize: number
  /** Maximum concurrent operations */
  concurrency: number
  /** Whether to stop on first error */
  stopOnError: boolean
  /** Timeout per batch in milliseconds */
  batchTimeout: number
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for import hooks
 */
export interface UseImportReturn {
  /** Current import state */
  importState: {
    isImporting: boolean
    progress: ProgressTracker
    result: ImportResult | null
    error: string | null
  }
  /** Import execution functions */
  actions: {
    uploadFile: (file: File) => Promise<void>
    startImport: (config: ImportConfiguration) => Promise<void>
    pauseImport: () => void
    resumeImport: () => void
    cancelImport: () => void
    resetImport: () => void
  }
}

/**
 * Return type for export hooks
 */
export interface UseExportReturn {
  /** Current export state */
  exportState: {
    isExporting: boolean
    progress: ProgressTracker
    result: ExportResult | null
    error: string | null
  }
  /** Export execution functions */
  actions: {
    startExport: (options: ExportOptions) => Promise<void>
    cancelExport: () => void
    downloadFile: (result: ExportResult) => void
    resetExport: () => void
  }
}
