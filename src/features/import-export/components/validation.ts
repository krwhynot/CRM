import type { CsvRow } from './csv-parser'
import { isValidEmail } from './csv-parser'
import type { FieldMapping } from './field-mapping'
import { FIELD_MAPPINGS, findBestMatch } from './field-mapping'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ImportResult {
  organizations: {
    created: number
    skipped: number
    failed: Array<{ name: string; error: string }>
  }
  contacts: {
    created: number
    failed: Array<{ name: string; error: string }>
  }
  success: boolean
  message: string
}

/**
 * Validate CSV row data
 */
export function validateRow(row: CsvRow, orgNameField: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!row[orgNameField]?.trim()) {
    errors.push('Organization name is required')
  }

  // Email validation (if provided)
  const emailFields = [findBestMatch(Object.keys(row), FIELD_MAPPINGS.contact_email)].filter(
    Boolean
  ) as string[]

  emailFields.forEach((field) => {
    const email = row[field]?.trim()
    if (email && !isValidEmail(email)) {
      warnings.push(`Invalid email format: ${email}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate field mapping completeness
 */
export function validateMappingCompleteness(mappings: FieldMapping[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for required organization name
  const hasOrgName = mappings.some((m) => m.mapsTo === 'organization_name')
  if (!hasOrgName) {
    errors.push(
      'Organization Name is required - please map at least one CSV column to Organization Name'
    )
  }

  // Check for duplicate mappings (excluding 'skip')
  const mappedFields = mappings.filter((m) => m.mapsTo !== 'skip').map((m) => m.mapsTo)
  const duplicates = mappedFields.filter((field, index) => mappedFields.indexOf(field) !== index)
  if (duplicates.length > 0) {
    errors.push(`Duplicate mappings detected: ${[...new Set(duplicates)].join(', ')}`)
  }

  // Warnings for low confidence mappings
  const lowConfidenceMappings = mappings.filter(
    (m) => m.confidence < 50 && m.mapsTo !== 'skip' && !m.userOverridden
  )
  if (lowConfidenceMappings.length > 0) {
    warnings.push(
      `Low confidence mappings detected for: ${lowConfidenceMappings.map((m) => m.csvColumn).join(', ')}`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check for duplicate organizations
 */
export async function checkDuplicateOrganizations(
  organizationNames: string[],
  supabase: SupabaseClient<Database>
): Promise<Set<string>> {
  try {
    const { data: existingOrgs } = await supabase
      .from('organizations')
      .select('name')
      .in('name', organizationNames)

    const duplicates = new Set<string>()
    existingOrgs?.forEach((org: { name: string }) => {
      duplicates.add(org.name.toLowerCase())
    })

    return duplicates
  } catch (error) {
    // Error checking duplicates - returning empty set as fallback
    return new Set()
  }
}

/**
 * Format import results for display
 */
export function formatImportResults(result: ImportResult): string {
  const { organizations, contacts } = result

  const parts = []

  if (organizations.created > 0) {
    parts.push(`${organizations.created} organizations`)
  }
  if (contacts.created > 0) {
    parts.push(`${contacts.created} contacts`)
  }

  if (organizations.skipped > 0) {
    parts.push(`${organizations.skipped} organizations skipped (duplicates)`)
  }

  const created = parts.join(' and ')
  return created ? `✓ Created ${created}` : 'No records were imported'
}
