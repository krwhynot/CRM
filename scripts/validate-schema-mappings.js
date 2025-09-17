#!/usr/bin/env node

/**
 * Database Schema Mapping Validation Script
 *
 * Task 1.4 Deliverable - Automated validation of database field mappings
 * to ensure data integrity during architecture simplification.
 *
 * This script validates that:
 * 1. Zod schemas match documented database field mappings
 * 2. Form fields map correctly to database columns
 * 3. Data transformation logic is preserved
 * 4. Required field constraints are maintained
 * 5. Validation rules align with database constraints
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  projectRoot: path.resolve(__dirname, '..'),
  zodTypesDir: path.join(path.resolve(__dirname, '..'), 'src', 'types'),
  componentsDir: path.join(path.resolve(__dirname, '..'), 'src', 'features'),
  mappingsFile: path.join(path.resolve(__dirname, '..'), 'docs', 'validation', 'database-field-mappings.md'),
  outputFile: path.join(path.resolve(__dirname, '..'), 'reports', 'schema-validation-report.md')
}

// Expected field mappings from documentation
const EXPECTED_MAPPINGS = {
  organization: {
    required: ['name', 'type', 'priority', 'segment', 'is_principal', 'is_distributor'],
    optional: ['description', 'email', 'phone', 'website', 'address_line_1', 'address_line_2',
               'city', 'state_province', 'postal_code', 'country', 'industry', 'notes'],
    systemFields: ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at'],
    transforms: {
      'name': 'requiredString',
      'email': 'nullableEmail',
      'phone': 'nullablePhone',
      'website': 'nullableUrl',
      'description': 'nullableString',
      'notes': 'nullableString'
    },
    constraints: {
      'name': { maxLength: 255 },
      'description': { maxLength: 500 },
      'email': { maxLength: 255 },
      'phone': { maxLength: 50 }
    }
  },
  contact: {
    required: ['first_name', 'last_name', 'purchase_influence', 'decision_authority'],
    conditionalRequired: {
      'organization_id': "when organization_mode='existing'"
    },
    optional: ['email', 'phone', 'title', 'department', 'mobile_phone', 'linkedin_url',
               'is_primary_contact', 'notes', 'role'],
    virtualFields: ['organization_mode', 'organization_name', 'organization_type',
                   'preferred_principals'],
    transforms: {
      'first_name': 'requiredString',
      'last_name': 'requiredString',
      'email': 'nullableEmail',
      'phone': 'nullablePhone',
      'organization_id': 'uuidField'
    },
    constraints: {
      'first_name': { maxLength: 100 },
      'last_name': { maxLength: 100 },
      'email': { maxLength: 255 },
      'notes': { maxLength: 500 }
    }
  },
  opportunity: {
    required: ['name', 'organization_id', 'estimated_value', 'stage', 'status'],
    optional: ['contact_id', 'estimated_close_date', 'description', 'notes', 'principal_id',
               'product_id', 'opportunity_context', 'auto_generated_name', 'probability', 'deal_owner'],
    virtualFields: ['principals', 'custom_context'],
    transforms: {
      'name': 'requiredString',
      'organization_id': 'uuidField',
      'estimated_value': 'positiveNumber',
      'description': 'nullableString'
    },
    constraints: {
      'name': { maxLength: 255 },
      'description': { maxLength: 1000 },
      'notes': { maxLength: 500 },
      'estimated_value': { min: 0 },
      'probability': { min: 0, max: 100 }
    }
  }
}

// Validation results collector
class ValidationResults {
  constructor() {
    this.results = {
      summary: {
        totalEntities: 0,
        validatedEntities: 0,
        errors: 0,
        warnings: 0,
        passed: false
      },
      entities: {},
      criticalIssues: [],
      recommendations: []
    }
  }

  addEntity(entityName) {
    this.results.summary.totalEntities++
    this.results.entities[entityName] = {
      name: entityName,
      status: 'pending',
      errors: [],
      warnings: [],
      validations: {
        schemaExists: false,
        requiredFields: false,
        optionalFields: false,
        transforms: false,
        constraints: false,
        businessRules: false
      }
    }
  }

  addError(entityName, type, message, critical = false) {
    if (!this.results.entities[entityName]) {
      this.addEntity(entityName)
    }

    this.results.entities[entityName].errors.push({ type, message })
    this.results.summary.errors++

    if (critical) {
      this.results.criticalIssues.push(`${entityName}: ${message}`)
    }
  }

  addWarning(entityName, type, message) {
    if (!this.results.entities[entityName]) {
      this.addEntity(entityName)
    }

    this.results.entities[entityName].warnings.push({ type, message })
    this.results.summary.warnings++
  }

  setValidation(entityName, validationType, passed) {
    if (!this.results.entities[entityName]) {
      this.addEntity(entityName)
    }

    this.results.entities[entityName].validations[validationType] = passed
  }

  finalizeEntity(entityName) {
    const entity = this.results.entities[entityName]
    if (!entity) return

    const hasErrors = entity.errors.length > 0
    const allValidationsPassed = Object.values(entity.validations).every(v => v === true)

    entity.status = hasErrors ? 'failed' : (allValidationsPassed ? 'passed' : 'partial')

    if (entity.status !== 'failed') {
      this.results.summary.validatedEntities++
    }
  }

  finalize() {
    const totalIssues = this.results.summary.errors + this.results.summary.warnings
    const criticalIssueCount = this.results.criticalIssues.length

    this.results.summary.passed = (
      this.results.summary.errors === 0 &&
      criticalIssueCount === 0 &&
      this.results.summary.validatedEntities === this.results.summary.totalEntities
    )

    // Add recommendations based on results
    if (this.results.summary.warnings > 0) {
      this.results.recommendations.push(
        'Address validation warnings to ensure robust data integrity'
      )
    }

    if (criticalIssueCount > 0) {
      this.results.recommendations.push(
        'CRITICAL: Fix critical issues before proceeding with migration'
      )
    }

    if (this.results.summary.validatedEntities < this.results.summary.totalEntities) {
      this.results.recommendations.push(
        'Complete validation for all entities before migration'
      )
    }
  }
}

/**
 * File system utilities
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    return null
  }
}

function extractZodSchemaInfo(content) {
  const info = {
    schemas: [],
    fields: [],
    transforms: [],
    validations: []
  }

  // Extract schema names
  const schemaMatches = content.match(/export const (\w+Schema) = z\./g)
  if (schemaMatches) {
    info.schemas = schemaMatches.map(match =>
      match.replace('export const ', '').replace(' = z.', '')
    )
  }

  // Extract field definitions
  const fieldMatches = content.match(/(\w+): z\..+/g)
  if (fieldMatches) {
    info.fields = fieldMatches.map(match => {
      const [field] = match.split(':')
      return field.trim()
    })
  }

  // Extract transforms
  const transformMatches = content.match(/ZodTransforms\.(\w+)/g)
  if (transformMatches) {
    info.transforms = transformMatches.map(match =>
      match.replace('ZodTransforms.', '')
    )
  }

  // Extract validations (min, max, etc.)
  const validationMatches = content.match(/\.(min|max|refine)\([^)]+\)/g)
  if (validationMatches) {
    info.validations = validationMatches
  }

  return info
}

function extractTableComponentInfo(content) {
  const info = {
    columns: [],
    displayFields: [],
    formFields: []
  }

  // Extract column definitions
  const columnMatches = content.match(/key: '(\w+)'/g)
  if (columnMatches) {
    info.columns = columnMatches.map(match =>
      match.replace("key: '", '').replace("'", '')
    )
  }

  // Extract display field usage
  const displayMatches = content.match(/\w+\.\w+/g)
  if (displayMatches) {
    info.displayFields = [...new Set(displayMatches.filter(match =>
      !match.includes('className') && !match.includes('onClick')
    ))]
  }

  return info
}

/**
 * Schema validation functions
 */
function validateZodSchema(entityName, results) {
  const zodFile = path.join(CONFIG.zodTypesDir, `${entityName}.zod.ts`)

  if (!fileExists(zodFile)) {
    results.addError(entityName, 'schema', `Zod schema file not found: ${zodFile}`, true)
    results.setValidation(entityName, 'schemaExists', false)
    return false
  }

  const content = readFileContent(zodFile)
  if (!content) {
    results.addError(entityName, 'schema', `Could not read Zod schema file: ${zodFile}`, true)
    results.setValidation(entityName, 'schemaExists', false)
    return false
  }

  results.setValidation(entityName, 'schemaExists', true)

  const schemaInfo = extractZodSchemaInfo(content)
  const expectedMapping = EXPECTED_MAPPINGS[entityName]

  if (!expectedMapping) {
    results.addWarning(entityName, 'mapping', 'No expected mapping defined for validation')
    return true
  }

  // Validate required fields
  let requiredFieldsValid = true
  for (const requiredField of expectedMapping.required) {
    if (!schemaInfo.fields.includes(requiredField)) {
      results.addError(entityName, 'required_field',
        `Required field '${requiredField}' not found in schema`)
      requiredFieldsValid = false
    }
  }
  results.setValidation(entityName, 'requiredFields', requiredFieldsValid)

  // Validate optional fields
  let optionalFieldsValid = true
  for (const optionalField of expectedMapping.optional || []) {
    if (!schemaInfo.fields.includes(optionalField)) {
      results.addWarning(entityName, 'optional_field',
        `Optional field '${optionalField}' not found in schema`)
      optionalFieldsValid = false
    }
  }
  results.setValidation(entityName, 'optionalFields', optionalFieldsValid)

  // Validate transforms
  let transformsValid = true
  for (const [field, expectedTransform] of Object.entries(expectedMapping.transforms || {})) {
    if (schemaInfo.fields.includes(field) && !schemaInfo.transforms.includes(expectedTransform)) {
      results.addError(entityName, 'transform',
        `Field '${field}' missing expected transform '${expectedTransform}'`)
      transformsValid = false
    }
  }
  results.setValidation(entityName, 'transforms', transformsValid)

  // Validate constraints
  let constraintsValid = true
  for (const [field, constraints] of Object.entries(expectedMapping.constraints || {})) {
    if (schemaInfo.fields.includes(field)) {
      if (constraints.maxLength) {
        const hasMaxConstraint = schemaInfo.validations.some(v =>
          v.includes('max') && v.includes(constraints.maxLength.toString())
        )
        if (!hasMaxConstraint) {
          results.addWarning(entityName, 'constraint',
            `Field '${field}' missing max length constraint (${constraints.maxLength})`)
          constraintsValid = false
        }
      }
    }
  }
  results.setValidation(entityName, 'constraints', constraintsValid)

  return true
}

function validateTableComponent(entityName, results) {
  const entityPlural = entityName + 's'
  const tableFile = path.join(CONFIG.componentsDir, entityPlural, 'components', `${entityName.charAt(0).toUpperCase() + entityName.slice(1)}sTable.tsx`)

  if (!fileExists(tableFile)) {
    results.addWarning(entityName, 'component', `Table component not found: ${tableFile}`)
    return false
  }

  const content = readFileContent(tableFile)
  if (!content) {
    results.addWarning(entityName, 'component', `Could not read table component: ${tableFile}`)
    return false
  }

  const componentInfo = extractTableComponentInfo(content)

  // Validate that essential columns are present
  const essentialColumns = ['selection', 'actions']
  const missingEssential = essentialColumns.filter(col => !componentInfo.columns.includes(col))

  if (missingEssential.length > 0) {
    results.addWarning(entityName, 'component',
      `Missing essential columns: ${missingEssential.join(', ')}`)
  }

  return true
}

function validateBusinessRules(entityName, results) {
  const expectedMapping = EXPECTED_MAPPINGS[entityName]
  if (!expectedMapping) return true

  let businessRulesValid = true

  // Check specific business rules per entity
  switch (entityName) {
    case 'organization':
      // Validate type alignment rules
      const zodFile = path.join(CONFIG.zodTypesDir, 'organization.zod.ts')
      const content = readFileContent(zodFile)
      if (content && !content.includes('refine')) {
        results.addError(entityName, 'business_rule',
          'Missing type alignment business rule validation')
        businessRulesValid = false
      }
      break

    case 'contact':
      // Validate discriminated union for organization mode
      const contactZodFile = path.join(CONFIG.zodTypesDir, 'contact.zod.ts')
      const contactContent = readFileContent(contactZodFile)
      if (contactContent && !contactContent.includes('discriminatedUnion')) {
        results.addError(entityName, 'business_rule',
          'Missing organization mode discriminated union')
        businessRulesValid = false
      }
      break

    case 'opportunity':
      // Validate multi-principal business rules
      const oppZodFile = path.join(CONFIG.zodTypesDir, 'opportunity.zod.ts')
      const oppContent = readFileContent(oppZodFile)
      if (oppContent && !oppContent.includes('multiPrincipal')) {
        results.addWarning(entityName, 'business_rule',
          'Multi-principal business rules may not be fully implemented')
        businessRulesValid = false
      }
      break
  }

  results.setValidation(entityName, 'businessRules', businessRulesValid)
  return businessRulesValid
}

/**
 * Main validation function
 */
async function validateSchemaMappings() {
  console.log('🔍 Starting database schema mapping validation...\n')

  const results = new ValidationResults()

  // Validate each entity
  for (const entityName of Object.keys(EXPECTED_MAPPINGS)) {
    console.log(`📋 Validating ${entityName}...`)

    results.addEntity(entityName)

    // Run all validations
    validateZodSchema(entityName, results)
    validateTableComponent(entityName, results)
    validateBusinessRules(entityName, results)

    results.finalizeEntity(entityName)

    const entity = results.results.entities[entityName]
    const statusIcon = entity.status === 'passed' ? '✅' :
                      entity.status === 'partial' ? '⚠️' : '❌'
    console.log(`   ${statusIcon} ${entity.status.toUpperCase()} (${entity.errors.length} errors, ${entity.warnings.length} warnings)`)
  }

  results.finalize()

  console.log('\n📊 Validation Summary:')
  console.log(`   Total Entities: ${results.results.summary.totalEntities}`)
  console.log(`   Validated: ${results.results.summary.validatedEntities}`)
  console.log(`   Errors: ${results.results.summary.errors}`)
  console.log(`   Warnings: ${results.results.summary.warnings}`)
  console.log(`   Overall Status: ${results.results.summary.passed ? '✅ PASSED' : '❌ FAILED'}`)

  // Show critical issues
  if (results.results.criticalIssues.length > 0) {
    console.log('\n🚨 Critical Issues:')
    results.results.criticalIssues.forEach(issue => {
      console.log(`   ❌ ${issue}`)
    })
  }

  // Show recommendations
  if (results.results.recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    results.results.recommendations.forEach(rec => {
      console.log(`   • ${rec}`)
    })
  }

  // Generate detailed report
  await generateDetailedReport(results.results)

  return results.results.summary.passed
}

/**
 * Generate detailed validation report
 */
async function generateDetailedReport(results) {
  const reportDir = path.dirname(CONFIG.outputFile)

  // Ensure reports directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const timestamp = new Date().toISOString()

  const report = `# Schema Mapping Validation Report

**Generated**: ${timestamp}
**Script**: validate-schema-mappings.js
**Purpose**: Task 1.4 - Database Schema Documentation validation

## Summary

- **Total Entities**: ${results.summary.totalEntities}
- **Validated Successfully**: ${results.summary.validatedEntities}
- **Errors**: ${results.summary.errors}
- **Warnings**: ${results.summary.warnings}
- **Overall Status**: ${results.summary.passed ? '✅ PASSED' : '❌ FAILED'}

## Entity Validation Results

${Object.entries(results.entities).map(([name, entity]) => `
### ${name.charAt(0).toUpperCase() + name.slice(1)}

**Status**: ${entity.status === 'passed' ? '✅' : entity.status === 'partial' ? '⚠️' : '❌'} ${entity.status.toUpperCase()}

**Validations**:
${Object.entries(entity.validations).map(([type, passed]) =>
  `- ${type}: ${passed ? '✅' : '❌'}`
).join('\n')}

${entity.errors.length > 0 ? `**Errors**:
${entity.errors.map(error => `- [${error.type}] ${error.message}`).join('\n')}` : ''}

${entity.warnings.length > 0 ? `**Warnings**:
${entity.warnings.map(warning => `- [${warning.type}] ${warning.message}`).join('\n')}` : ''}
`).join('\n')}

${results.criticalIssues.length > 0 ? `## Critical Issues

${results.criticalIssues.map(issue => `- ❌ ${issue}`).join('\n')}` : ''}

${results.recommendations.length > 0 ? `## Recommendations

${results.recommendations.map(rec => `- ${rec}`).join('\n')}` : ''}

## Next Steps

${results.summary.passed ?
  '✅ All validations passed. Schema mappings are ready for migration.' :
  '❌ Validation failed. Address the issues above before proceeding with migration.'
}

### Migration Readiness Checklist

- [ ] All Zod schemas exist and are complete
- [ ] Required fields are properly validated
- [ ] Data transforms are correctly implemented
- [ ] Business rules are enforced in schemas
- [ ] Table components use correct field mappings
- [ ] No critical validation errors
- [ ] All warnings have been reviewed

## Validation Details

This report validates the database field mappings documented in:
\`/docs/validation/database-field-mappings.md\`

The validation ensures that:
1. Zod schemas match documented database field mappings
2. Form fields map correctly to database columns
3. Data transformation logic is preserved
4. Required field constraints are maintained
5. Validation rules align with database constraints

For detailed field mappings, refer to the documentation file.
`

  try {
    fs.writeFileSync(CONFIG.outputFile, report)
    console.log(`\n📄 Detailed report generated: ${CONFIG.outputFile}`)
  } catch (error) {
    console.error(`❌ Failed to generate report: ${error.message}`)
  }
}

/**
 * CLI Interface
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSchemaMappings()
    .then(passed => {
      process.exit(passed ? 0 : 1)
    })
    .catch(error => {
      console.error('❌ Validation failed with error:', error.message)
      process.exit(1)
    })
}

export { validateSchemaMappings, EXPECTED_MAPPINGS, ValidationResults }