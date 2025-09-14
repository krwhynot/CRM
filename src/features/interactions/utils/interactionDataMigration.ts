/**
 * Interaction Data Migration Utility
 *
 * Helps import and transform interaction data from spreadsheets
 * to match the enhanced interaction tracking system.
 */

import { debugWarn } from '@/utils/debug'
import type {
  InteractionType,
  InteractionPriority,
  AccountManager,
  PrincipalInfo,
  InteractionInsert,
} from '@/types/entities'

// Map spreadsheet interaction types to our system types
const INTERACTION_TYPE_MAPPING: Record<string, InteractionType> = {
  'In Person': 'in_person',
  Email: 'email',
  Call: 'call',
  Quoted: 'quoted',
  Distribution: 'distribution',
  Demo: 'demo',
  Meeting: 'meeting',
  // Legacy mappings
  Phone: 'call',
  Visit: 'in_person',
  Quote: 'quoted',
} as const

// Map priority values
const PRIORITY_MAPPING: Record<string, InteractionPriority> = {
  'A+': 'A+',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  // Handle variations
  'A Plus': 'A+',
  High: 'A',
  Medium: 'B',
  Low: 'C',
  'Very Low': 'D',
} as const

// Account manager normalization
const ACCOUNT_MANAGER_MAPPING: Record<string, AccountManager> = {
  Sue: 'Sue',
  Gary: 'Gary',
  Dale: 'Dale',
  // Handle variations
  susan: 'Sue',
  gary: 'Gary',
  dale: 'Dale',
} as const

/**
 * Raw spreadsheet row interface (based on user's Excel data)
 */
export interface SpreadsheetInteractionRow {
  // Core fields
  Date?: string
  Type?: string
  Priority?: string
  Subject?: string

  // Organization info
  Organization?: string
  Formula?: string // Like "Sysco Chicago"

  // Contact info
  Contact?: string
  Dropdown?: string // Additional contact field

  // Account manager
  AccountManager?: string | 'Sue' | 'Gary' | 'Dale'

  // Principals (multiple columns)
  Principal?: string
  Principal2?: string
  Principal3?: string
  Principal4?: string

  // Notes and details
  Notes?: string
  Details?: string
  Summary?: string

  // Follow-up
  FollowUp?: string | boolean
  FollowUpDate?: string

  // Any other fields
  [key: string]: any
}

/**
 * Parse and validate interaction type from spreadsheet
 */
export function parseInteractionType(rawType?: string): InteractionType {
  if (!rawType) return 'follow_up' // Default

  // Try exact match first
  if (rawType in INTERACTION_TYPE_MAPPING) {
    return INTERACTION_TYPE_MAPPING[rawType]
  }

  // Try case-insensitive match
  const normalizedType = rawType.trim()
  const matchingKey = Object.keys(INTERACTION_TYPE_MAPPING).find(
    (key) => key.toLowerCase() === normalizedType.toLowerCase()
  )

  if (matchingKey) {
    return INTERACTION_TYPE_MAPPING[matchingKey]
  }

  // Default fallback
  debugWarn(`Unknown interaction type: ${rawType}, defaulting to 'follow_up'`)
  return 'follow_up'
}

/**
 * Parse priority from spreadsheet
 */
export function parsePriority(rawPriority?: string): InteractionPriority | null {
  if (!rawPriority) return null

  const normalizedPriority = rawPriority.trim()

  // Try exact match
  if (normalizedPriority in PRIORITY_MAPPING) {
    return PRIORITY_MAPPING[normalizedPriority]
  }

  // Try case-insensitive match
  const matchingKey = Object.keys(PRIORITY_MAPPING).find(
    (key) => key.toLowerCase() === normalizedPriority.toLowerCase()
  )

  if (matchingKey) {
    return PRIORITY_MAPPING[matchingKey]
  }

  debugWarn(`Unknown priority: ${rawPriority}, skipping`)
  return null
}

/**
 * Parse account manager from spreadsheet
 */
export function parseAccountManager(rawManager?: string): AccountManager | null {
  if (!rawManager) return null

  const normalizedManager = rawManager.trim()

  // Try exact match
  if (normalizedManager in ACCOUNT_MANAGER_MAPPING) {
    return ACCOUNT_MANAGER_MAPPING[normalizedManager]
  }

  // Try case-insensitive match
  const matchingKey = Object.keys(ACCOUNT_MANAGER_MAPPING).find(
    (key) => key.toLowerCase() === normalizedManager.toLowerCase()
  )

  if (matchingKey) {
    return ACCOUNT_MANAGER_MAPPING[matchingKey]
  }

  // Return as-is if not in our mapping (allows for new managers)
  return normalizedManager as AccountManager
}

/**
 * Parse principals from multiple columns
 */
export function parsePrincipals(row: SpreadsheetInteractionRow): PrincipalInfo[] {
  const principals: PrincipalInfo[] = []

  if (row.Principal) {
    principals.push({
      id: generatePrincipalId(row.Principal),
      name: row.Principal,
      principal2: row.Principal2,
      principal3: row.Principal3,
      principal4: row.Principal4,
    })
  }

  return principals
}

/**
 * Generate a consistent ID for a principal name
 * (In a real implementation, you'd look up actual principal IDs)
 */
function generatePrincipalId(principalName: string): string {
  // Simple hash-based ID generation for consistency
  // In production, you'd lookup real principal IDs from your organizations table
  return `principal-${principalName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Parse date from various formats
 */
export function parseInteractionDate(rawDate?: string): string {
  if (!rawDate) {
    return new Date().toISOString()
  }

  try {
    // Try parsing as-is first
    const date = new Date(rawDate)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }

    // Try common Excel date formats
    const excelDate = parseFloat(rawDate)
    if (!isNaN(excelDate)) {
      // Excel date serial number (days since 1900-01-01)
      const excelEpoch = new Date(1900, 0, 1)
      const jsDate = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000)
      return jsDate.toISOString()
    }

    debugWarn(`Could not parse date: ${rawDate}, using current date`)
    return new Date().toISOString()
  } catch (error) {
    debugWarn(`Error parsing date: ${rawDate}, using current date`)
    return new Date().toISOString()
  }
}

/**
 * Transform spreadsheet row to InteractionInsert
 */
export function transformSpreadsheetRow(
  row: SpreadsheetInteractionRow,
  opportunityId: string,
  organizationId?: string,
  contactId?: string
): InteractionInsert {
  const type = parseInteractionType(row.Type)
  const priority = parsePriority(row.Priority)
  const accountManager = parseAccountManager(row.AccountManager)
  const principals = parsePrincipals(row)
  const interactionDate = parseInteractionDate(row.Date)

  // Compile notes from multiple possible fields
  const notesParts = [
    row.Notes,
    row.Details,
    row.Summary,
    row.Formula && `Organization: ${row.Formula}`,
    row.Dropdown && `Contact Details: ${row.Dropdown}`,
  ].filter(Boolean)

  const notes = notesParts.length > 0 ? notesParts.join('\n\n') : null

  // Parse follow-up
  const followUpRequired = Boolean(
    row.FollowUp === true || row.FollowUp === 'true' || row.FollowUp === 'Yes' || row.FollowUpDate
  )

  const followUpDate = row.FollowUpDate
    ? parseInteractionDate(row.FollowUpDate)
    : followUpRequired
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null

  return {
    type,
    subject: row.Subject || `${type.replace('_', ' ')} interaction`,
    description: notes,
    interaction_date: interactionDate,
    opportunity_id: opportunityId,
    organization_id: organizationId || null,
    contact_id: contactId || null,
    follow_up_required: followUpRequired,
    follow_up_date: followUpDate,
    // Enhanced fields
    priority,
    account_manager: accountManager,
    principals: principals.length > 0 ? principals : [],
    import_notes: `Imported from spreadsheet - Original: ${JSON.stringify({
      type: row.Type,
      priority: row.Priority,
      accountManager: row.AccountManager,
      organization: row.Organization,
      contact: row.Contact,
    })}`,
    created_by: '', // Will be set by auth context
    updated_by: '', // Will be set by auth context
  }
}

/**
 * Validate required fields for import
 */
export function validateSpreadsheetRow(row: SpreadsheetInteractionRow): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!row.Type) {
    errors.push('Interaction type is required')
  }

  if (!row.Subject && !row.Notes && !row.Details) {
    errors.push('At least one of Subject, Notes, or Details is required')
  }

  if (!row.Date) {
    errors.push('Date is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Batch transform spreadsheet data
 */
export function transformSpreadsheetData(
  rows: SpreadsheetInteractionRow[],
  opportunityId: string
): {
  successful: InteractionInsert[]
  failed: { row: SpreadsheetInteractionRow; errors: string[] }[]
} {
  const successful: InteractionInsert[] = []
  const failed: { row: SpreadsheetInteractionRow; errors: string[] }[] = []

  rows.forEach((row) => {
    const validation = validateSpreadsheetRow(row)

    if (!validation.isValid) {
      failed.push({ row, errors: validation.errors })
      return
    }

    try {
      const transformed = transformSpreadsheetRow(row, opportunityId)
      successful.push(transformed)
    } catch (error) {
      failed.push({
        row,
        errors: [
          `Transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      })
    }
  })

  return { successful, failed }
}
