// Re-export from focused modules for backward compatibility
export type { CsvRow, ParsedContact, ParsedOrganization, OrganizationGroup } from './csv-parser'
export type { ValidationResult, ImportResult } from './validation'
export type { FieldMapping, FieldMappingOption } from './field-mapping'

export {
  parseContactName,
  detectSegment,
  determineOrganizationType,
  normalizePriority,
  isValidEmail,
} from './csv-parser'

export {
  FIELD_MAPPINGS,
  findBestMatch,
  calculateMappingConfidence,
  generateInitialMappings,
  getFieldMappingOptions,
  generateImportNotes,
} from './field-mapping'

export {
  validateRow,
  validateMappingCompleteness,
  checkDuplicateOrganizations,
  formatImportResults,
} from './validation'

import type { CsvRow, ParsedOrganization, ParsedContact } from './csv-parser'
import {
  parseContactName,
  detectSegment,
  determineOrganizationType,
  normalizePriority,
} from './csv-parser'
import { FIELD_MAPPINGS, findBestMatch, generateImportNotes } from './field-mapping'

/**
 * Parse organization data from CSV row
 */
export function parseOrganization(row: CsvRow, headers: string[]): ParsedOrganization {
  const nameField = findBestMatch(headers, FIELD_MAPPINGS.organization_name)
  const phoneField = findBestMatch(headers, FIELD_MAPPINGS.organization_phone)
  const addressField = findBestMatch(headers, FIELD_MAPPINGS.address)
  const cityField = findBestMatch(headers, FIELD_MAPPINGS.city)
  const stateField = findBestMatch(headers, FIELD_MAPPINGS.state)
  const zipField = findBestMatch(headers, FIELD_MAPPINGS.zip)
  const priorityField = findBestMatch(headers, FIELD_MAPPINGS.priority)
  const segmentField = findBestMatch(headers, FIELD_MAPPINGS.segment)
  const websiteField = findBestMatch(headers, FIELD_MAPPINGS.website)
  const notesField = findBestMatch(headers, FIELD_MAPPINGS.notes)
  const primaryManagerField = findBestMatch(headers, FIELD_MAPPINGS.primary_manager)
  const secondaryManagerField = findBestMatch(headers, FIELD_MAPPINGS.secondary_manager)

  const name = nameField ? row[nameField]?.trim() : ''
  const segment = segmentField ? row[segmentField]?.trim() : detectSegment(name)

  return {
    name,
    type: determineOrganizationType(row, segment),
    priority: priorityField ? normalizePriority(row[priorityField]?.trim()) : 'C',
    segment: segment || 'General',
    website: websiteField ? row[websiteField]?.trim() || null : null,
    phone: phoneField ? row[phoneField]?.trim() || null : null,
    address_line_1: addressField ? row[addressField]?.trim() || null : null,
    city: cityField ? row[cityField]?.trim() || null : null,
    state_province: stateField ? row[stateField]?.trim() || null : null,
    postal_code: zipField ? row[zipField]?.trim() || null : null,
    country: 'US',
    notes: notesField ? row[notesField]?.trim() || null : null,
    primary_manager_name: primaryManagerField ? row[primaryManagerField]?.trim() || null : null,
    secondary_manager_name: secondaryManagerField
      ? row[secondaryManagerField]?.trim() || null
      : null,
    import_notes: generateImportNotes(row, headers),
    is_active: true,
  }
}

/**
 * Parse contact data from CSV row
 */
export function parseContact(
  row: CsvRow,
  headers: string[],
  isPrimary = false
): ParsedContact | null {
  const nameField = findBestMatch(headers, FIELD_MAPPINGS.contact_name)
  const emailField = findBestMatch(headers, FIELD_MAPPINGS.contact_email)
  const phoneField = findBestMatch(headers, FIELD_MAPPINGS.contact_phone)

  const fullName = nameField ? row[nameField]?.trim() : ''

  // Skip if no contact name provided
  if (!fullName) return null

  const { first_name, last_name } = parseContactName(fullName)

  return {
    first_name,
    last_name,
    email: emailField ? row[emailField]?.trim() || null : null,
    phone: phoneField ? row[phoneField]?.trim() || null : null,
    is_primary: isPrimary,
  }
}

/**
 * Group CSV rows by organization
 */
export function groupRowsByOrganization(
  rows: CsvRow[],
  headers: string[]
): Array<{ organization: ParsedOrganization; contacts: ParsedContact[] }> {
  const groups = new Map<string, { organization: ParsedOrganization; contacts: ParsedContact[] }>()

  const orgNameField = findBestMatch(headers, FIELD_MAPPINGS.organization_name)
  if (!orgNameField) return []

  rows.forEach((row) => {
    const orgName = row[orgNameField]?.trim()
    if (!orgName) return

    // Get or create organization group
    if (!groups.has(orgName)) {
      const organization = parseOrganization(row, headers)
      groups.set(orgName, { organization, contacts: [] })
    }

    // Parse contact if present
    const contact = parseContact(row, headers, groups.get(orgName)!.contacts.length === 0)
    if (contact) {
      groups.get(orgName)!.contacts.push(contact)
    }
  })

  return Array.from(groups.values())
}
