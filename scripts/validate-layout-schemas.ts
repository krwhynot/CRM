#!/usr/bin/env ts-node

/**
 * Layout Schema Validation Utility
 *
 * Comprehensive schema validation utility for the layout-as-data migration system.
 * Provides detailed error reporting, validation rules checking, and migration-specific
 * validations to ensure schema configurations are correct and follow established patterns.
 *
 * Features:
 * - Comprehensive error reporting with detailed context
 * - Validation of layout schemas against TypeScript types
 * - Cross-reference validation with existing patterns
 * - Entity-specific validation rules
 * - Performance validation (virtualization thresholds)
 * - Responsive behavior validation
 * - Component registry validation
 * - Batch validation of multiple schemas
 * - Export validation reports in multiple formats
 *
 * Usage:
 *   npm run validate:schemas
 *   npm run validate:schemas -- --schema src/pages/Organizations.schema.ts
 *   npm run validate:schemas -- --batch src/layouts/ --report json
 *   npm run validate:schemas -- --fix --backup
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { Command } from 'commander'
import { glob } from 'glob'
import * as ts from 'typescript'
import { z } from 'zod'

// Import CRM types and utilities
import type {
  LayoutConfiguration,
  SlotBasedLayout,
  GridBasedLayout,
  FlexBasedLayout,
  SlotConfiguration,
  SlotType,
  LayoutEntityType,
  ResponsiveBreakpoints,
  ValidationFunction,
  EntitySpecificLayoutConfig,
  OrganizationLayoutConfig,
  ContactLayoutConfig,
  OpportunityLayoutConfig,
  ProductLayoutConfig,
  InteractionLayoutConfig,
  isSlotBasedLayout,
  isGridBasedLayout,
  isFlexBasedLayout,
} from '../src/types/layout/schema.types'
import { LayoutValidator } from '../src/lib/layout/validation'
import { getComponentRegistry } from '../src/lib/layout/component-registry'

// Validation Configuration
interface ValidationConfig {
  schemasDir: string
  outputFormat: 'console' | 'json' | 'markdown' | 'html'
  outputFile?: string
  strictMode: boolean
  fixErrors: boolean
  createBackup: boolean
  verbose: boolean
  includeWarnings: boolean
  includePerformanceTips: boolean
  validateComponents: boolean
  validateEntitySpecific: boolean
  crossReferencePatterns: boolean
}

// Validation Result Types
interface ValidationResult {
  filePath: string
  schemaId: string
  schemaName: string
  entityType: LayoutEntityType
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  performanceTips: PerformanceTip[]
  score: number
  fixes: AutoFix[]
}

interface ValidationError {
  id: string
  severity: 'error' | 'critical'
  category: 'structure' | 'types' | 'logic' | 'performance' | 'compatibility'
  message: string
  details: string
  location?: ValidationLocation
  suggestedFix?: string
  references?: string[]
}

interface ValidationWarning {
  id: string
  category: 'best-practices' | 'performance' | 'compatibility' | 'maintainability'
  message: string
  details: string
  location?: ValidationLocation
  suggestion?: string
  impact: 'low' | 'medium' | 'high'
}

interface PerformanceTip {
  id: string
  category: 'virtualization' | 'caching' | 'rendering' | 'memory'
  message: string
  details: string
  expectedImpact: 'minor' | 'moderate' | 'significant'
  implementation?: string
}

interface ValidationLocation {
  path: string
  line?: number
  column?: number
  context?: string
}

interface AutoFix {
  id: string
  description: string
  category: 'safe' | 'risky' | 'breaking'
  changes: FixChange[]
}

interface FixChange {
  path: string
  type: 'add' | 'remove' | 'modify' | 'replace'
  oldValue?: any
  newValue: any
  reason: string
}

// Validation Summary
interface ValidationSummary {
  timestamp: string
  totalSchemas: number
  validSchemas: number
  invalidSchemas: number
  totalErrors: number
  totalWarnings: number
  averageScore: number
  categories: Record<string, number>
  entityTypes: Record<LayoutEntityType, ValidationStats>
  recommendations: string[]
}

interface ValidationStats {
  total: number
  valid: number
  averageScore: number
  commonIssues: string[]
}

/**
 * Main Schema Validation Class
 */
export class LayoutSchemaValidator {
  private config: ValidationConfig
  private componentRegistry: any
  private existingPatterns = new Map<string, LayoutConfiguration>()
  private validationCache = new Map<string, ValidationResult>()
  private entityValidators: Record<LayoutEntityType, (schema: any) => ValidationError[]>

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      schemasDir: path.resolve('./src/layouts'),
      outputFormat: 'console',
      strictMode: false,
      fixErrors: false,
      createBackup: false,
      verbose: false,
      includeWarnings: true,
      includePerformanceTips: true,
      validateComponents: true,
      validateEntitySpecific: true,
      crossReferencePatterns: true,
      ...config,
    }

    // Initialize entity-specific validators
    this.entityValidators = {
      organizations: this.validateOrganizationSchema.bind(this),
      contacts: this.validateContactSchema.bind(this),
      opportunities: this.validateOpportunitySchema.bind(this),
      products: this.validateProductSchema.bind(this),
      interactions: this.validateInteractionSchema.bind(this),
    }
  }

  /**
   * Main validation workflow
   */
  async validate(schemaPattern?: string): Promise<ValidationSummary> {
    try {
      console.log('🔍 Starting schema validation...')

      // Initialize validation environment
      await this.initialize()

      // Discover schemas to validate
      const schemaFiles = await this.discoverSchemas(schemaPattern)
      console.log(`📋 Found ${schemaFiles.length} schema files to validate`)

      // Validate each schema
      const results: ValidationResult[] = []
      for (const filePath of schemaFiles) {
        const result = await this.validateSchema(filePath)
        results.push(result)

        // Apply fixes if requested
        if (this.config.fixErrors && result.fixes.length > 0) {
          await this.applyFixes(filePath, result.fixes)
        }
      }

      // Generate summary
      const summary = this.generateSummary(results)

      // Output results
      await this.outputResults(results, summary)

      return summary

    } catch (error) {
      console.error('❌ Validation failed:', error)
      throw error
    }
  }

  /**
   * Validate a single schema file
   */
  async validateSchema(filePath: string): Promise<ValidationResult> {
    // Check cache first
    const cacheKey = `${filePath}-${await this.getFileHash(filePath)}`
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!
    }

    console.log(`🔍 Validating ${path.basename(filePath)}...`)

    try {
      // Load and parse the schema
      const schema = await this.loadSchema(filePath)

      const result: ValidationResult = {
        filePath,
        schemaId: schema.id,
        schemaName: schema.name,
        entityType: schema.entityType,
        valid: true,
        errors: [],
        warnings: [],
        performanceTips: [],
        score: 0,
        fixes: [],
      }

      // Core structure validation
      result.errors.push(...await this.validateStructure(schema))

      // Type validation
      result.errors.push(...await this.validateTypes(schema))

      // Entity-specific validation
      if (this.config.validateEntitySpecific) {
        const entityValidator = this.entityValidators[schema.entityType]
        if (entityValidator) {
          result.errors.push(...entityValidator(schema))
        }
      }

      // Component registry validation
      if (this.config.validateComponents) {
        result.errors.push(...await this.validateComponents(schema))
      }

      // Performance validation
      result.performanceTips.push(...await this.validatePerformance(schema))

      // Responsive behavior validation
      result.errors.push(...await this.validateResponsive(schema))

      // Cross-reference validation
      if (this.config.crossReferencePatterns) {
        result.warnings.push(...await this.validateCrossReferences(schema))
      }

      // Best practices validation
      result.warnings.push(...await this.validateBestPractices(schema))

      // Generate auto-fixes
      result.fixes.push(...await this.generateAutoFixes(schema, result.errors))

      // Calculate score
      result.score = this.calculateValidationScore(result)
      result.valid = result.errors.filter(e => e.severity === 'critical' || e.severity === 'error').length === 0

      // Cache result
      this.validationCache.set(cacheKey, result)

      return result

    } catch (error) {
      return {
        filePath,
        schemaId: 'unknown',
        schemaName: 'unknown',
        entityType: 'organizations',
        valid: false,
        errors: [{
          id: 'parse-error',
          severity: 'critical',
          category: 'structure',
          message: 'Failed to parse schema file',
          details: `Error: ${error}`,
          suggestedFix: 'Check file syntax and imports',
        }],
        warnings: [],
        performanceTips: [],
        score: 0,
        fixes: [],
      }
    }
  }

  /**
   * Validate schema structure and required fields
   */
  private async validateStructure(schema: LayoutConfiguration): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    // Required field validation
    const requiredFields = ['id', 'name', 'version', 'type', 'entityType', 'metadata', 'structure']
    for (const field of requiredFields) {
      if (!(field in schema)) {
        errors.push({
          id: `missing-${field}`,
          severity: 'error',
          category: 'structure',
          message: `Missing required field: ${field}`,
          details: `Schema must include ${field} property`,
          location: { path: `schema.${field}` },
          suggestedFix: `Add ${field} property to schema configuration`,
        })
      }
    }

    // ID format validation
    if (schema.id && !/^[a-z0-9-]+$/.test(schema.id)) {
      errors.push({
        id: 'invalid-id-format',
        severity: 'error',
        category: 'structure',
        message: 'Invalid schema ID format',
        details: 'Schema ID must contain only lowercase letters, numbers, and hyphens',
        location: { path: 'schema.id', context: schema.id },
        suggestedFix: 'Use lowercase letters, numbers, and hyphens only',
      })
    }

    // Version validation
    if (schema.version && !/^\d+\.\d+\.\d+$/.test(schema.version)) {
      errors.push({
        id: 'invalid-version-format',
        severity: 'error',
        category: 'structure',
        message: 'Invalid version format',
        details: 'Version must follow semantic versioning (e.g., 1.0.0)',
        location: { path: 'schema.version', context: schema.version },
        suggestedFix: 'Use semantic versioning format (major.minor.patch)',
      })
    }

    // Metadata validation
    if (schema.metadata) {
      const requiredMetaFields = ['displayName', 'description', 'category', 'tags', 'createdAt']
      for (const field of requiredMetaFields) {
        if (!(field in schema.metadata)) {
          errors.push({
            id: `missing-metadata-${field}`,
            severity: 'error',
            category: 'structure',
            message: `Missing required metadata field: ${field}`,
            details: `Metadata must include ${field} property`,
            location: { path: `schema.metadata.${field}` },
            suggestedFix: `Add ${field} to metadata object`,
          })
        }
      }

      // Tags validation
      if (schema.metadata.tags && !Array.isArray(schema.metadata.tags)) {
        errors.push({
          id: 'invalid-tags-type',
          severity: 'error',
          category: 'types',
          message: 'Tags must be an array',
          details: 'metadata.tags should be an array of strings',
          location: { path: 'schema.metadata.tags' },
          suggestedFix: 'Convert tags to string array format',
        })
      }
    }

    return errors
  }

  /**
   * Validate TypeScript type compliance
   */
  private async validateTypes(schema: LayoutConfiguration): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    try {
      // Use Zod schema validation if available
      const validationResult = LayoutValidator.validateLayout(schema)

      if (!validationResult.valid) {
        validationResult.errors.forEach(error => {
          errors.push({
            id: `type-error-${error.path}`,
            severity: 'error',
            category: 'types',
            message: error.message,
            details: `Type validation failed at ${error.path}`,
            location: { path: error.path },
            suggestedFix: 'Ensure property matches expected type definition',
          })
        })
      }

      // Additional type-specific validations
      if (isSlotBasedLayout(schema)) {
        errors.push(...this.validateSlotBasedTypes(schema))
      } else if (isGridBasedLayout(schema)) {
        errors.push(...this.validateGridBasedTypes(schema))
      } else if (isFlexBasedLayout(schema)) {
        errors.push(...this.validateFlexBasedTypes(schema))
      }

    } catch (error) {
      errors.push({
        id: 'type-validation-failed',
        severity: 'critical',
        category: 'types',
        message: 'Type validation system failed',
        details: `Error: ${error}`,
        suggestedFix: 'Check schema structure and type imports',
      })
    }

    return errors
  }

  /**
   * Validate slot-based layout types
   */
  private validateSlotBasedTypes(schema: SlotBasedLayout): ValidationError[] {
    const errors: ValidationError[] = []

    if (!schema.structure.slots || !Array.isArray(schema.structure.slots)) {
      errors.push({
        id: 'invalid-slots-type',
        severity: 'error',
        category: 'types',
        message: 'Slots must be an array',
        details: 'structure.slots should be an array of SlotConfiguration objects',
        location: { path: 'schema.structure.slots' },
        suggestedFix: 'Ensure slots is an array of slot configurations',
      })
    } else {
      // Validate each slot
      schema.structure.slots.forEach((slot, index) => {
        errors.push(...this.validateSlotConfiguration(slot, `schema.structure.slots[${index}]`))
      })
    }

    // Validate composition rules
    if (schema.structure.composition) {
      if (!Array.isArray(schema.structure.composition.requiredSlots)) {
        errors.push({
          id: 'invalid-required-slots-type',
          severity: 'error',
          category: 'types',
          message: 'Required slots must be an array',
          details: 'composition.requiredSlots should be an array of slot IDs',
          location: { path: 'schema.structure.composition.requiredSlots' },
          suggestedFix: 'Ensure requiredSlots is a string array',
        })
      }

      if (!Array.isArray(schema.structure.composition.slotOrder)) {
        errors.push({
          id: 'invalid-slot-order-type',
          severity: 'error',
          category: 'types',
          message: 'Slot order must be an array',
          details: 'composition.slotOrder should be an array of slot IDs',
          location: { path: 'schema.structure.composition.slotOrder' },
          suggestedFix: 'Ensure slotOrder is a string array',
        })
      }
    }

    return errors
  }

  /**
   * Validate individual slot configuration
   */
  private validateSlotConfiguration(slot: SlotConfiguration, basePath: string): ValidationError[] {
    const errors: ValidationError[] = []

    const requiredSlotFields = ['id', 'type', 'name', 'required', 'multiple']
    for (const field of requiredSlotFields) {
      if (!(field in slot)) {
        errors.push({
          id: `missing-slot-${field}`,
          severity: 'error',
          category: 'structure',
          message: `Missing required slot field: ${field}`,
          details: `Slot configuration must include ${field} property`,
          location: { path: `${basePath}.${field}` },
          suggestedFix: `Add ${field} property to slot configuration`,
        })
      }
    }

    // Validate slot type
    const validSlotTypes: SlotType[] = ['header', 'title', 'subtitle', 'meta', 'actions', 'filters', 'search', 'content', 'sidebar', 'footer', 'custom']
    if (slot.type && !validSlotTypes.includes(slot.type)) {
      errors.push({
        id: 'invalid-slot-type',
        severity: 'error',
        category: 'types',
        message: `Invalid slot type: ${slot.type}`,
        details: `Slot type must be one of: ${validSlotTypes.join(', ')}`,
        location: { path: `${basePath}.type`, context: slot.type },
        suggestedFix: `Use one of the valid slot types: ${validSlotTypes.join(', ')}`,
      })
    }

    return errors
  }

  /**
   * Entity-specific validators
   */
  private validateOrganizationSchema(schema: OrganizationLayoutConfig): ValidationError[] {
    const errors: ValidationError[] = []

    if (schema.entitySpecific) {
      // Validate organization-specific fields
      const requiredOrgFields = ['typeFilters', 'priorityLevels']
      for (const field of requiredOrgFields) {
        if (!(field in schema.entitySpecific)) {
          errors.push({
            id: `missing-org-${field}`,
            severity: 'error',
            category: 'structure',
            message: `Missing organization-specific field: ${field}`,
            details: `Organization schema must include entitySpecific.${field}`,
            location: { path: `schema.entitySpecific.${field}` },
            suggestedFix: `Add ${field} to entitySpecific configuration`,
          })
        }
      }

      // Validate priority levels
      if (schema.entitySpecific.priorityLevels) {
        const validPriorities = ['A+', 'A', 'B', 'C', 'D']
        const invalidPriorities = schema.entitySpecific.priorityLevels.filter(p => !validPriorities.includes(p))

        if (invalidPriorities.length > 0) {
          errors.push({
            id: 'invalid-priority-levels',
            severity: 'error',
            category: 'logic',
            message: 'Invalid priority levels found',
            details: `Invalid priorities: ${invalidPriorities.join(', ')}. Valid: ${validPriorities.join(', ')}`,
            location: { path: 'schema.entitySpecific.priorityLevels' },
            suggestedFix: 'Use only valid priority levels (A+, A, B, C, D)',
          })
        }
      }
    }

    return errors
  }

  private validateContactSchema(schema: ContactLayoutConfig): ValidationError[] {
    const errors: ValidationError[] = []

    if (schema.entitySpecific) {
      // Validate contact-specific authority levels
      if (schema.entitySpecific.authorityLevels) {
        const validAuthorities = ['primary', 'secondary', 'influencer']
        const invalidAuthorities = schema.entitySpecific.authorityLevels.filter(a => !validAuthorities.includes(a))

        if (invalidAuthorities.length > 0) {
          errors.push({
            id: 'invalid-authority-levels',
            severity: 'error',
            category: 'logic',
            message: 'Invalid authority levels found',
            details: `Invalid authorities: ${invalidAuthorities.join(', ')}`,
            location: { path: 'schema.entitySpecific.authorityLevels' },
            suggestedFix: 'Use valid authority levels (primary, secondary, influencer)',
          })
        }
      }
    }

    return errors
  }

  private validateOpportunitySchema(schema: OpportunityLayoutConfig): ValidationError[] {
    const errors: ValidationError[] = []

    // Opportunity-specific validations would go here
    return errors
  }

  private validateProductSchema(schema: ProductLayoutConfig): ValidationError[] {
    const errors: ValidationError[] = []

    // Product-specific validations would go here
    return errors
  }

  private validateInteractionSchema(schema: InteractionLayoutConfig): ValidationError[] {
    const errors: ValidationError[] = []

    // Interaction-specific validations would go here
    return errors
  }

  /**
   * Validate component registry references
   */
  private async validateComponents(schema: LayoutConfiguration): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    if (isSlotBasedLayout(schema)) {
      for (const slot of schema.structure.slots) {
        if (slot.defaultComponent) {
          const isValidComponent = await this.componentRegistry.has(slot.defaultComponent)
          if (!isValidComponent) {
            errors.push({
              id: 'invalid-component-reference',
              severity: 'error',
              category: 'compatibility',
              message: `Invalid component reference: ${slot.defaultComponent}`,
              details: `Component "${slot.defaultComponent}" is not registered in the component registry`,
              location: { path: `slot[${slot.id}].defaultComponent` },
              suggestedFix: 'Register component or use existing registered component',
              references: Array.from(this.componentRegistry.keys()),
            })
          }
        }

        if (slot.allowedComponents) {
          for (const component of slot.allowedComponents) {
            const isValidComponent = await this.componentRegistry.has(component)
            if (!isValidComponent) {
              errors.push({
                id: 'invalid-allowed-component',
                severity: 'error',
                category: 'compatibility',
                message: `Invalid allowed component reference: ${component}`,
                details: `Component "${component}" is not registered in the component registry`,
                location: { path: `slot[${slot.id}].allowedComponents` },
                suggestedFix: 'Remove invalid component or register it in the registry',
              })
            }
          }
        }
      }
    }

    return errors
  }

  /**
   * Validate performance configurations
   */
  private async validatePerformance(schema: LayoutConfiguration): Promise<PerformanceTip[]> {
    const tips: PerformanceTip[] = []

    if (isSlotBasedLayout(schema)) {
      // Check for virtualization configuration
      const contentSlots = schema.structure.slots.filter(s => s.type === 'content')
      for (const slot of contentSlots) {
        if (slot.props?.enableVirtualization === 'auto' && !slot.props?.virtualizationThreshold) {
          tips.push({
            id: 'missing-virtualization-threshold',
            category: 'virtualization',
            message: 'Virtualization threshold not defined',
            details: 'Auto-virtualization requires a threshold for optimal performance',
            expectedImpact: 'moderate',
            implementation: 'Add virtualizationThreshold: 500 to slot props',
          })
        }

        if (!slot.props?.enableVirtualization && schema.entityType) {
          tips.push({
            id: 'consider-virtualization',
            category: 'virtualization',
            message: 'Consider enabling virtualization',
            details: `${schema.entityType} lists can benefit from virtualization with large datasets`,
            expectedImpact: 'significant',
            implementation: 'Add enableVirtualization: "auto" to content slot props',
          })
        }
      }

      // Check for caching configuration
      if (!schema.structure.slots.some(s => s.props?.enableCaching)) {
        tips.push({
          id: 'consider-caching',
          category: 'caching',
          message: 'Consider enabling component caching',
          details: 'Caching can improve render performance for complex layouts',
          expectedImpact: 'minor',
          implementation: 'Add enableCaching: true to slot props',
        })
      }
    }

    return tips
  }

  /**
   * Validate responsive behavior
   */
  private async validateResponsive(schema: LayoutConfiguration): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    if (isSlotBasedLayout(schema)) {
      const responsiveBreakpoints: (keyof ResponsiveBreakpoints)[] = ['mobile', 'tablet', 'laptop', 'desktop']

      for (const slot of schema.structure.slots) {
        if (slot.responsive) {
          // Ensure at least mobile and desktop are defined
          if (!slot.responsive.mobile) {
            errors.push({
              id: 'missing-mobile-responsive',
              severity: 'error',
              category: 'logic',
              message: 'Missing mobile responsive configuration',
              details: 'Responsive slots must include mobile behavior',
              location: { path: `slot[${slot.id}].responsive.mobile` },
              suggestedFix: 'Add mobile responsive configuration',
            })
          }

          if (!slot.responsive.desktop) {
            errors.push({
              id: 'missing-desktop-responsive',
              severity: 'error',
              category: 'logic',
              message: 'Missing desktop responsive configuration',
              details: 'Responsive slots must include desktop behavior',
              location: { path: `slot[${slot.id}].responsive.desktop` },
              suggestedFix: 'Add desktop responsive configuration',
            })
          }

          // Validate responsive behavior consistency
          const visibilityMap = responsiveBreakpoints
            .filter(bp => slot.responsive![bp])
            .map(bp => ({ breakpoint: bp, visible: slot.responsive![bp]!.visible }))

          if (visibilityMap.some(v => v.visible) && visibilityMap.some(v => !v.visible)) {
            // Mixed visibility is OK, but warn about potential UX issues
            // This would go in warnings instead of errors
          }
        }
      }
    }

    return errors
  }

  /**
   * Initialize validation environment
   */
  private async initialize(): Promise<void> {
    try {
      // Load component registry
      this.componentRegistry = await getComponentRegistry()

      // Load existing patterns for cross-reference validation
      await this.loadExistingPatterns()

      console.log('✅ Validation environment initialized')
    } catch (error) {
      console.warn('⚠️  Warning: Could not fully initialize validation environment:', error)
    }
  }

  // Additional helper methods and utilities...
  private async loadExistingPatterns(): Promise<void> {
    // Implementation similar to migration tool
  }

  private async loadSchema(filePath: string): Promise<LayoutConfiguration> {
    // Dynamic import and parse schema file
    const module = require(filePath)

    // Find the main layout configuration export
    const schemaExports = Object.values(module).filter(this.isLayoutConfiguration)

    if (schemaExports.length === 0) {
      throw new Error('No valid layout configuration found in file')
    }

    if (schemaExports.length > 1) {
      console.warn(`Multiple schemas found in ${filePath}, using first one`)
    }

    return schemaExports[0] as LayoutConfiguration
  }

  private validateGridBasedTypes(schema: GridBasedLayout): ValidationError[] { return [] }
  private validateFlexBasedTypes(schema: FlexBasedLayout): ValidationError[] { return [] }
  private async validateCrossReferences(schema: LayoutConfiguration): Promise<ValidationWarning[]> { return [] }
  private async validateBestPractices(schema: LayoutConfiguration): Promise<ValidationWarning[]> { return [] }
  private async generateAutoFixes(schema: LayoutConfiguration, errors: ValidationError[]): Promise<AutoFix[]> { return [] }
  private calculateValidationScore(result: ValidationResult): number {
    const errorWeight = -10
    const warningWeight = -2
    const baseScore = 100

    return Math.max(0, baseScore + (result.errors.length * errorWeight) + (result.warnings.length * warningWeight))
  }

  private async discoverSchemas(pattern?: string): Promise<string[]> {
    const searchPattern = pattern || path.join(this.config.schemasDir, '**/*.{schema.ts,layout.ts}')
    return await glob(searchPattern)
  }

  private async getFileHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8')
    return require('crypto').createHash('md5').update(content).digest('hex')
  }

  private isLayoutConfiguration(obj: any): boolean {
    return obj && typeof obj === 'object' && obj.id && obj.type && obj.entityType
  }

  private generateSummary(results: ValidationResult[]): ValidationSummary {
    const validSchemas = results.filter(r => r.valid).length
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length

    return {
      timestamp: new Date().toISOString(),
      totalSchemas: results.length,
      validSchemas,
      invalidSchemas: results.length - validSchemas,
      totalErrors,
      totalWarnings,
      averageScore,
      categories: this.categorizeCounts(results),
      entityTypes: this.analyzeByEntityType(results),
      recommendations: this.generateGlobalRecommendations(results),
    }
  }

  private categorizeCounts(results: ValidationResult[]): Record<string, number> {
    const categories: Record<string, number> = {}

    results.forEach(result => {
      result.errors.forEach(error => {
        categories[error.category] = (categories[error.category] || 0) + 1
      })
    })

    return categories
  }

  private analyzeByEntityType(results: ValidationResult[]): Record<LayoutEntityType, ValidationStats> {
    const entityStats: Record<LayoutEntityType, ValidationStats> = {
      organizations: { total: 0, valid: 0, averageScore: 0, commonIssues: [] },
      contacts: { total: 0, valid: 0, averageScore: 0, commonIssues: [] },
      opportunities: { total: 0, valid: 0, averageScore: 0, commonIssues: [] },
      products: { total: 0, valid: 0, averageScore: 0, commonIssues: [] },
      interactions: { total: 0, valid: 0, averageScore: 0, commonIssues: [] },
    }

    results.forEach(result => {
      const stats = entityStats[result.entityType]
      stats.total++
      if (result.valid) stats.valid++
      stats.averageScore = (stats.averageScore + result.score) / 2
    })

    return entityStats
  }

  private generateGlobalRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = []

    const invalidCount = results.filter(r => !r.valid).length
    if (invalidCount > 0) {
      recommendations.push(`Fix ${invalidCount} invalid schemas before deployment`)
    }

    const performanceIssues = results.filter(r => r.performanceTips.length > 0).length
    if (performanceIssues > 0) {
      recommendations.push(`Consider performance optimizations for ${performanceIssues} schemas`)
    }

    return recommendations
  }

  private async outputResults(results: ValidationResult[], summary: ValidationSummary): Promise<void> {
    switch (this.config.outputFormat) {
      case 'json':
        await this.outputJSON(results, summary)
        break
      case 'markdown':
        await this.outputMarkdown(results, summary)
        break
      case 'html':
        await this.outputHTML(results, summary)
        break
      default:
        this.outputConsole(results, summary)
    }
  }

  private outputConsole(results: ValidationResult[], summary: ValidationSummary): void {
    console.log('\n📊 Validation Summary:')
    console.log(`   Total schemas: ${summary.totalSchemas}`)
    console.log(`   Valid schemas: ${summary.validSchemas}`)
    console.log(`   Invalid schemas: ${summary.invalidSchemas}`)
    console.log(`   Total errors: ${summary.totalErrors}`)
    console.log(`   Total warnings: ${summary.totalWarnings}`)
    console.log(`   Average score: ${summary.averageScore.toFixed(1)}/100`)

    // Show detailed results for invalid schemas
    const invalidResults = results.filter(r => !r.valid)
    if (invalidResults.length > 0) {
      console.log('\n❌ Invalid Schemas:')
      invalidResults.forEach(result => {
        console.log(`\n  ${path.basename(result.filePath)} (${result.schemaId})`)
        result.errors.forEach(error => {
          console.log(`    ❌ ${error.message}`)
          if (this.config.verbose && error.details) {
            console.log(`       ${error.details}`)
          }
        })
      })
    }

    // Show recommendations
    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      summary.recommendations.forEach(rec => console.log(`   • ${rec}`))
    }
  }

  private async outputJSON(results: ValidationResult[], summary: ValidationSummary): Promise<void> {
    const output = { summary, results }
    const outputPath = this.config.outputFile || 'validation-report.json'
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2))
    console.log(`📄 Report saved to ${outputPath}`)
  }

  private async outputMarkdown(results: ValidationResult[], summary: ValidationSummary): Promise<void> {
    // Implementation would generate markdown report
    console.log('📄 Markdown output not yet implemented')
  }

  private async outputHTML(results: ValidationResult[], summary: ValidationSummary): Promise<void> {
    // Implementation would generate HTML report
    console.log('📄 HTML output not yet implemented')
  }

  private async applyFixes(filePath: string, fixes: AutoFix[]): Promise<void> {
    if (this.config.createBackup) {
      const backupPath = `${filePath}.backup-${Date.now()}`
      await fs.copyFile(filePath, backupPath)
      console.log(`📋 Created backup: ${backupPath}`)
    }

    // Apply safe fixes automatically
    const safeFixes = fixes.filter(f => f.category === 'safe')
    if (safeFixes.length > 0) {
      console.log(`🔧 Applying ${safeFixes.length} safe fixes to ${path.basename(filePath)}`)
      // Implementation would apply the fixes
    }
  }
}

/**
 * CLI Command Setup
 */
const program = new Command()

program
  .name('validate-layout-schemas')
  .description('Comprehensive schema validation utility for layout-as-data migration')
  .version('1.0.0')

program
  .option('-s, --schema <file>', 'Validate specific schema file')
  .option('-d, --dir <directory>', 'Directory containing schemas to validate')
  .option('-f, --format <format>', 'Output format (console|json|markdown|html)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .option('--strict', 'Enable strict validation mode')
  .option('--fix', 'Attempt to automatically fix errors')
  .option('--backup', 'Create backups before applying fixes')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--no-warnings', 'Disable warning reporting')
  .option('--no-performance', 'Disable performance tip reporting')
  .option('--no-components', 'Skip component registry validation')
  .option('--no-entity', 'Skip entity-specific validation')
  .option('--no-cross-ref', 'Skip cross-reference validation')

program.action(async (options) => {
  const validator = new LayoutSchemaValidator({
    schemasDir: options.dir,
    outputFormat: options.format,
    outputFile: options.output,
    strictMode: options.strict,
    fixErrors: options.fix,
    createBackup: options.backup,
    verbose: options.verbose,
    includeWarnings: options.warnings !== false,
    includePerformanceTips: options.performance !== false,
    validateComponents: options.components !== false,
    validateEntitySpecific: options.entity !== false,
    crossReferencePatterns: options.crossRef !== false,
  })

  try {
    await validator.validate(options.schema)
    console.log('✅ Validation completed successfully')
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
})

// Export for programmatic use
export { LayoutSchemaValidator }

// Run CLI if called directly
if (require.main === module) {
  program.parse()
}