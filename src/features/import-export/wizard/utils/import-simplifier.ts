import type { ParsedData } from '@/hooks/useFileUpload'
import type { SmartFieldMapping } from '../hooks/useSmartImport'

// Auto-fix results tracking
export interface AutoFixResult {
  totalFixes: number
  fixes: AutoFix[]
  cleanedData: ParsedData
}

export interface AutoFix {
  type: 'trim' | 'phone' | 'email' | 'capitalize' | 'format' | 'normalize'
  count: number
  description: string
}

// Critical issues that require user decisions
export interface CriticalIssue {
  type: 'missing_required' | 'duplicates' | 'invalid_data' | 'format_mismatch'
  count: number
  title: string
  description: string
  recommendation: string
  alternatives: string[]
}

// Field name mappings based on actual CSV analysis
const FIELD_MAPPINGS: Record<string, string> = {
  'PRIORITY-FOCUS (A-D) A-highest\n(DropDown)': 'Priority Level',
  'PRIORITY-FOCUS (A-D) A-highest (DropDown)': 'Priority Level',
  Organizations: 'Organization Name',
  'SEGMENT\n(DropDown)': 'Business Segment',
  'SEGMENT (DropDown)': 'Business Segment',
  'DISTRIBUTOR \n(DropDown)': 'Distributor',
  'DISTRIBUTOR (DropDown)': 'Distributor',
  'Distr Rep': 'Distributor Rep',
  'PRIMARY ACCT. MANAGER \n(DropDown)': 'Primary Manager',
  'PRIMARY ACCT. MANAGER (DropDown)': 'Primary Manager',
  'SECONDARY ACCT. MANAGER \n(DropDown)': 'Secondary Manager',
  'SECONDARY ACCT. MANAGER (DropDown)': 'Secondary Manager',
  'Weekly Priority-dated Mondays': 'Weekly Priority',
  LINKEDIN: 'LinkedIn',
  PHONE: 'Phone Number',
  'STREET ADDRESS': 'Street Address',
  CITY: 'City',
  'STATE\n(DropDown)': 'State',
  'STATE (DropDown)': 'State',
  'Zip Code': 'ZIP Code',
  NOTES: 'Notes',
}

// Fallback mappings for generic column names like "_1", "_2", etc.
const GENERIC_COLUMN_MAPPINGS: Record<string, string> = {
  _1: 'Priority Level',
  _2: 'Organization Name',
  _3: 'Business Segment',
  _4: 'Distributor',
  _5: 'Distributor Rep',
  _6: 'Primary Manager',
  _7: 'Secondary Manager',
  _8: 'Weekly Priority',
  _9: 'LinkedIn',
  _10: 'Phone Number',
  _11: 'Street Address',
  _12: 'City',
  _13: 'State',
  _14: 'ZIP Code',
  _15: 'Notes',
}

/**
 * Clean messy CSV headers to human-readable field names
 */
export function cleanFieldName(header: string): string {
  if (!header) return ''

  // Check for exact matches first
  const cleanHeader = header.trim()
  if (FIELD_MAPPINGS[cleanHeader]) {
    return FIELD_MAPPINGS[cleanHeader]
  }

  // Check for generic column mappings (_1, _2, etc.)
  if (GENERIC_COLUMN_MAPPINGS[cleanHeader]) {
    return GENERIC_COLUMN_MAPPINGS[cleanHeader]
  }

  // Handle column_XXXXX pattern (from our CSV parser fallback)
  if (cleanHeader.match(/^column_[a-z0-9]+$/)) {
    return 'Unnamed Column'
  }

  // Apply general cleaning rules
  let cleaned = cleanHeader
    // Remove (DropDown) suffixes
    .replace(/\s*\(DropDown\)\s*/gi, '')
    // Remove newlines and normalize whitespace
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Convert UPPER CASE to Title Case
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 2) {
    cleaned = cleaned
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Special handling for common abbreviations
  cleaned = cleaned
    .replace(/\bACCT\b/gi, 'Account')
    .replace(/\bMANAGER\b/gi, 'Manager')
    .replace(/\bSTREET\b/gi, 'Street')
    .replace(/\bADDRESS\b/gi, 'Address')

  return cleaned || 'Unnamed Column'
}

/**
 * Format phone numbers to (XXX) XXX-XXXX format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Format based on digit count
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  return phone // Return original if can't format
}

/**
 * Validate and clean email addresses
 */
export function cleanEmailAddress(email: string): string {
  if (!email) return email

  return email.toLowerCase().trim()
}

/**
 * Capitalize names properly
 */
export function capitalizeName(name: string): string {
  if (!name) return name

  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 1) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Apply automatic fixes to import data
 */
export function autoFixImportData(data: ParsedData): AutoFixResult {
  const fixes: AutoFix[] = []
  let totalFixes = 0

  // Clone the data to avoid mutations
  const cleanedData: ParsedData = {
    ...data,
    headers: data.headers.map(cleanFieldName),
    rows: data.rows.map((row) => ({ ...row })),
  }

  // Track fixes
  let trimCount = 0
  let phoneCount = 0
  let emailCount = 0
  let nameCount = 0

  // Process each row
  cleanedData.rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const originalValue = row[key]
      if (!originalValue || typeof originalValue !== 'string') return

      let cleanedValue = originalValue

      // 1. Trim whitespace
      const trimmed = originalValue.trim()
      if (trimmed !== originalValue) {
        trimCount++
        cleanedValue = trimmed
      }

      // 2. Format phone numbers (detect phone fields)
      if (key.toLowerCase().includes('phone') || /^\(?[\d\s\-\.\(\)]+\)?$/.test(cleanedValue)) {
        const formatted = formatPhoneNumber(cleanedValue)
        if (formatted !== cleanedValue) {
          phoneCount++
          cleanedValue = formatted
        }
      }

      // 3. Clean email addresses
      if (key.toLowerCase().includes('email') || cleanedValue.includes('@')) {
        const cleanEmail = cleanEmailAddress(cleanedValue)
        if (cleanEmail !== cleanedValue) {
          emailCount++
          cleanedValue = cleanEmail
        }
      }

      // 4. Capitalize names (organization, manager, contact names)
      if (
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('manager') ||
        key.toLowerCase().includes('organization')
      ) {
        const capitalized = capitalizeName(cleanedValue)
        if (capitalized !== cleanedValue) {
          nameCount++
          cleanedValue = capitalized
        }
      }

      // Update the row if value changed
      if (cleanedValue !== originalValue) {
        row[key] = cleanedValue
        totalFixes++
      }
    })
  })

  // Build fixes summary
  if (trimCount > 0) {
    fixes.push({
      type: 'trim',
      count: trimCount,
      description: `Trimmed extra spaces — ${trimCount.toLocaleString()}`,
    })
  }

  if (phoneCount > 0) {
    fixes.push({
      type: 'phone',
      count: phoneCount,
      description: `Standardized phone format — ${phoneCount.toLocaleString()}`,
    })
  }

  if (emailCount > 0) {
    fixes.push({
      type: 'email',
      count: emailCount,
      description: `Cleaned email addresses — ${emailCount.toLocaleString()}`,
    })
  }

  if (nameCount > 0) {
    fixes.push({
      type: 'capitalize',
      count: nameCount,
      description: `Capitalized names — ${nameCount.toLocaleString()}`,
    })
  }

  return {
    totalFixes,
    fixes,
    cleanedData,
  }
}

/**
 * Detect critical issues that need user decisions
 */
export function detectCriticalIssues(
  data: ParsedData,
  mappings: SmartFieldMapping[]
): CriticalIssue[] {
  const issues: CriticalIssue[] = []

  // Find organization name field
  const orgNameMapping = mappings.find(
    (m) => m.crmField === 'name' || m.csvHeader.toLowerCase().includes('organization')
  )

  if (orgNameMapping) {
    // Check for missing organization names
    const emptyOrgNames = data.rows.filter(
      (row) => !row[orgNameMapping.csvHeader] || row[orgNameMapping.csvHeader].trim() === ''
    ).length

    if (emptyOrgNames > 0) {
      issues.push({
        type: 'missing_required',
        count: emptyOrgNames,
        title: 'Missing Organization Names',
        description: `${emptyOrgNames} rows have no organization name`,
        recommendation: 'Import as "(Unknown)"',
        alternatives: ['Skip these rows', 'Stop import'],
      })
    }
  }

  // Check for potential duplicates (simple name-based check)
  if (orgNameMapping) {
    const orgNames = data.rows
      .map((row) => row[orgNameMapping.csvHeader]?.trim().toLowerCase())
      .filter(Boolean)

    const duplicateCount = orgNames.length - new Set(orgNames).size
    const duplicatePercentage = (duplicateCount / orgNames.length) * 100

    if (duplicatePercentage > 10) {
      issues.push({
        type: 'duplicates',
        count: duplicateCount,
        title: 'Potential Duplicates',
        description: `${duplicateCount} potential duplicate organizations found`,
        recommendation: "Import all (we'll mark duplicates)",
        alternatives: ['Skip duplicates', 'Review manually'],
      })
    }
  }

  return issues
}

/**
 * Calculate overall import confidence score
 */
export function calculateImportConfidence(mappings: SmartFieldMapping[]): number {
  if (mappings.length === 0) return 0

  // Base confidence on mapping quality
  const totalConfidence = mappings.reduce((sum, mapping) => {
    // Auto-mapped fields get full confidence
    if (mapping.status === 'auto' || mapping.status === 'confirmed') {
      return sum + 1
    }
    // Needs review reduces confidence
    if (mapping.status === 'needs_review') {
      return sum + Math.max(mapping.confidence, 0.5)
    }
    // Skipped fields don't affect confidence negatively
    return sum + 1
  }, 0)

  const averageConfidence = totalConfidence / mappings.length

  // Boost confidence if we have essential fields mapped
  const hasOrgName = mappings.some((m) => m.crmField === 'name' && m.status !== 'skipped')

  if (hasOrgName) {
    return Math.min(averageConfidence * 1.1, 1)
  }

  return averageConfidence
}

/**
 * Generate plain English summary of import status
 */
export function generateImportSummary(
  totalRecords: number,
  mappings: SmartFieldMapping[],
  autoFixes: AutoFixResult,
  issues: CriticalIssue[]
): string {
  const confidence = calculateImportConfidence(mappings)
  const mappedFields = mappings.filter((m) => m.status !== 'skipped').length

  if (confidence >= 0.9 && issues.length === 0) {
    return `We mapped your ${mappedFields} columns and fixed minor formatting so you can import now.`
  }

  if (issues.length > 0) {
    return `We prepared your ${totalRecords.toLocaleString()} records but need ${issues.length} quick decision${issues.length > 1 ? 's' : ''} from you.`
  }

  if (confidence >= 0.7) {
    return `We mapped most of your data successfully. A few fields need your review before importing.`
  }

  return `Your data looks good, but we need to confirm some field mappings before importing.`
}
