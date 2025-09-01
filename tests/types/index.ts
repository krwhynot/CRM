/**
 * Test Types Index
 * 
 * Centralized type definitions for all test-related functionality.
 * This file consolidates test-specific types, mock data types, and testing utilities.
 */

// Core database and entity types
import type { Database } from '@/types/database.types'
import type { 
  Organization, 
  Contact, 
  Product, 
  Opportunity, 
  Interaction,
  OrganizationInsert,
  ContactInsert,
  ProductInsert,
  OpportunityInsert,
  InteractionInsert
} from '@/types/entities'

// Form types
import type {
  ContactFormData,
  OrganizationFormData,
  OpportunityFormData,
  ProductFormData,
  InteractionFormData
} from '@/types/validation'

// =============================================================================
// TEST ENTITY TYPES
// =============================================================================

/**
 * Test data types for database entities
 */
export type TestOrganizationData = Partial<OrganizationInsert>
export type TestContactData = Partial<ContactInsert>
export type TestProductData = Partial<ProductInsert>
export type TestOpportunityData = Partial<OpportunityInsert>
export type TestInteractionData = Partial<InteractionInsert>

/**
 * Union type for all test entity data
 */
export type TestEntityData = 
  | TestOrganizationData 
  | TestContactData 
  | TestProductData 
  | TestOpportunityData 
  | TestInteractionData

/**
 * Test entity result types (after creation)
 */
export type TestOrganizationResult = Organization & { _testMetadata?: TestMetadata }
export type TestContactResult = Contact & { _testMetadata?: TestMetadata }
export type TestProductResult = Product & { _testMetadata?: TestMetadata }
export type TestOpportunityResult = Opportunity & { _testMetadata?: TestMetadata }
export type TestInteractionResult = Interaction & { _testMetadata?: TestMetadata }

export type TestEntityResult = 
  | TestOrganizationResult
  | TestContactResult
  | TestProductResult
  | TestOpportunityResult
  | TestInteractionResult

// =============================================================================
// MOCK DATA TYPES
// =============================================================================

/**
 * Mock form data types for testing forms
 */
export interface MockFormDataOptions {
  includeOptionalFields?: boolean
  includeInvalidData?: boolean
  customOverrides?: Record<string, any>
  validationLevel?: 'strict' | 'permissive'
}

export type MockOrganizationFormData = OrganizationFormData & { _isMock?: true }
export type MockContactFormData = ContactFormData & { _isMock?: true }
export type MockOpportunityFormData = OpportunityFormData & { _isMock?: true }
export type MockProductFormData = ProductFormData & { _isMock?: true }
export type MockInteractionFormData = InteractionFormData & { _isMock?: true }

export type MockFormData = 
  | MockOrganizationFormData
  | MockContactFormData
  | MockOpportunityFormData
  | MockProductFormData
  | MockInteractionFormData

// =============================================================================
// TEST CONTEXT TYPES
// =============================================================================

/**
 * Test execution context
 */
export interface TestContext {
  testName: string
  entityType: TestEntityType
  startTime: number
  endTime?: number
  duration?: number
  createdEntities: TestEntityRecord[]
  cleanupRequired: boolean
  metadata: Record<string, any>
}

/**
 * Test metadata for tracking and cleanup
 */
export interface TestMetadata {
  testId: string
  createdAt: Date
  createdBy: string
  entityType: TestEntityType
  shouldCleanup: boolean
  testContext?: string
  relationships: TestRelationship[]
}

/**
 * Test entity record for tracking created entities
 */
export interface TestEntityRecord {
  id: string
  type: TestEntityType
  tableName: string
  createdAt: Date
  testId: string
  dependencies: string[] // IDs of entities this depends on
}

/**
 * Test relationship tracking
 */
export interface TestRelationship {
  fromEntity: string
  toEntity: string
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many'
  foreignKey: string
  isRequired: boolean
}

// =============================================================================
// DATABASE TEST TYPES
// =============================================================================

/**
 * Database operation result with test metadata
 */
export interface TestDatabaseResult<T> {
  data: T | null
  error: any
  duration: number
  operation: DatabaseOperation
  testMetadata: TestMetadata
}

/**
 * Database operations for testing
 */
export type DatabaseOperation = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'search'
  | 'exists'

/**
 * Database test expectations
 */
export interface DatabaseTestExpectations<T> {
  shouldSucceed: boolean
  expectedError?: string | RegExp
  expectedResultCount?: number
  dataValidation?: (data: T) => boolean | string
  performanceThreshold?: number // milliseconds
  relationshipValidation?: TestRelationshipValidation[]
}

/**
 * Relationship validation for database tests
 */
export interface TestRelationshipValidation {
  entityId: string
  relatedEntityId: string
  relationshipType: string
  shouldExist: boolean
}

// =============================================================================
// PERFORMANCE TEST TYPES
// =============================================================================

/**
 * Performance benchmark configuration
 */
export interface PerformanceBenchmarkConfig {
  entityType: TestEntityType
  operationType: DatabaseOperation
  iterations: number
  concurrency: number
  dataSize: 'small' | 'medium' | 'large'
  measureMemory: boolean
  thresholds: PerformanceThresholds
}

/**
 * Performance thresholds for validation
 */
export interface PerformanceThresholds {
  averageTime: number // milliseconds
  maxTime: number // milliseconds
  successRate: number // percentage (0-1)
  memoryUsage?: number // MB
  throughput?: number // operations per second
}

/**
 * Performance test result
 */
export interface PerformanceTestResult {
  config: PerformanceBenchmarkConfig
  results: {
    averageTime: number
    minTime: number
    maxTime: number
    successCount: number
    failureCount: number
    throughput: number
    memoryUsage?: number
    errors: string[]
  }
  passed: boolean
  thresholdViolations: string[]
}

// =============================================================================
// VALIDATION TEST TYPES
// =============================================================================

/**
 * Validation test case
 */
export interface ValidationTestCase<T> {
  description: string
  input: T
  expected: ValidationExpectation
  entityType: TestEntityType
  validationType: ValidationType
}

/**
 * Validation expectation
 */
export interface ValidationExpectation {
  isValid: boolean
  expectedErrors?: string[]
  expectedWarnings?: string[]
  shouldThrow?: boolean
  customValidation?: (result: any) => boolean
}

/**
 * Types of validation to test
 */
export type ValidationType = 
  | 'schema'
  | 'business_rules'
  | 'relationships'
  | 'constraints'
  | 'permissions'

// =============================================================================
// ASSERTION HELPER TYPES
// =============================================================================

/**
 * Custom assertion helpers for CRM entities
 */
export interface EntityAssertionHelpers<T> {
  hasValidId: (entity: T) => boolean
  hasRequiredFields: (entity: T) => boolean
  hasValidRelationships: (entity: T) => boolean
  matchesSchema: (entity: T) => boolean
  hasValidTimestamps: (entity: T) => boolean
  isNotSoftDeleted: (entity: T) => boolean
}

/**
 * Database assertion configuration
 */
export interface DatabaseAssertionConfig {
  checkRelationships: boolean
  validateConstraints: boolean
  verifyPermissions: boolean
  checkPerformance: boolean
  performanceThreshold?: number
}

/**
 * Form assertion helpers
 */
export interface FormAssertionHelpers<T> {
  hasValidationErrors: (formData: T) => string[]
  isSubmittable: (formData: T) => boolean
  hasRequiredFields: (formData: T) => boolean
  matchesSchema: (formData: T) => boolean
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Supported entity types for testing
 */
export type TestEntityType = 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'

/**
 * Test data variant types
 */
export type TestDataVariant = 
  | 'valid'
  | 'invalid'
  | 'edge_case'
  | 'boundary'
  | 'stress_test'

/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
  database: {
    useServiceRole: boolean
    enableRLS: boolean
    connectionPoolSize: number
  }
  performance: {
    enableProfiling: boolean
    trackMemoryUsage: boolean
    benchmarkThresholds: PerformanceThresholds
  }
  cleanup: {
    autoCleanup: boolean
    cleanupDelay: number
    preserveOnFailure: boolean
  }
  logging: {
    verbose: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    logQueries: boolean
  }
}

// =============================================================================
// FACTORY TYPES
// =============================================================================

/**
 * Entity factory configuration
 */
export interface EntityFactoryConfig<T> {
  entityType: TestEntityType
  variant: TestDataVariant
  overrides?: Partial<T>
  relationships?: TestRelationshipConfig[]
  trackForCleanup?: boolean
  testMetadata?: Partial<TestMetadata>
}

/**
 * Relationship configuration for factory
 */
export interface TestRelationshipConfig {
  field: string
  relatedEntityType: TestEntityType
  relatedEntityId?: string
  createIfMissing?: boolean
  relationshipData?: any
}

/**
 * Batch factory configuration
 */
export interface BatchFactoryConfig<T> {
  count: number
  entityType: TestEntityType
  variant: TestDataVariant
  baseTemplate?: Partial<T>
  variationsPerEntity?: Partial<T>[]
  relationships?: TestRelationshipConfig[]
  parallel?: boolean
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Re-export entity types for convenience
 */
export type {
  Organization,
  Contact,
  Product,
  Opportunity,
  Interaction,
  OrganizationInsert,
  ContactInsert,
  ProductInsert,
  OpportunityInsert,
  InteractionInsert,
  OrganizationFormData,
  ContactFormData,
  OpportunityFormData,
  ProductFormData,
  InteractionFormData
}

/**
 * Re-export database types
 */
export type { Database }

/**
 * Utility type for extracting entity type from factory functions
 */
export type ExtractEntityType<T> = T extends EntityFactoryConfig<infer U> ? U : never

/**
 * Utility type for test result arrays
 */
export type TestResults<T> = Array<{
  name: string
  result: T
  passed: boolean
  error?: string
  duration: number
}>

/**
 * Type guards for runtime type checking
 */
export const isTestEntityData = (data: unknown): data is TestEntityData => {
  return typeof data === 'object' && data !== null && 
    ('name' in data || 'first_name' in data || 'subject' in data)
}

export const isTestContext = (ctx: unknown): ctx is TestContext => {
  return typeof ctx === 'object' && ctx !== null &&
    'testName' in ctx && 'entityType' in ctx && 'startTime' in ctx
}

export const isPerformanceResult = (result: unknown): result is PerformanceTestResult => {
  return typeof result === 'object' && result !== null &&
    'config' in result && 'results' in result && 'passed' in result
}

/**
 * Default configurations for common test scenarios
 */
export const DEFAULT_TEST_CONFIG: TestEnvironmentConfig = {
  database: {
    useServiceRole: true,
    enableRLS: false,
    connectionPoolSize: 10
  },
  performance: {
    enableProfiling: false,
    trackMemoryUsage: false,
    benchmarkThresholds: {
      averageTime: 100,
      maxTime: 1000,
      successRate: 0.95
    }
  },
  cleanup: {
    autoCleanup: true,
    cleanupDelay: 0,
    preserveOnFailure: false
  },
  logging: {
    verbose: false,
    logLevel: 'info',
    logQueries: false
  }
}

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  averageTime: 25, // ms for simple operations
  maxTime: 100, // ms maximum acceptable time
  successRate: 0.95, // 95% success rate
  throughput: 100 // operations per second
}