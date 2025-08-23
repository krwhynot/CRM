import type { Database } from '@/lib/database.types'

// Type definitions
export interface CsvRow {
  [key: string]: string
}

export interface ParsedContact {
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  organization_id?: string
  is_primary: boolean
}

export interface ParsedOrganization {
  name: string
  type: Database['public']['Enums']['organization_type']
  priority: string
  segment: string
  website: string | null
  phone: string | null
  address_line_1: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  notes: string | null
  primary_manager_name: string | null
  secondary_manager_name: string | null
  import_notes: string | null
  is_active: boolean
}

export interface OrganizationGroup {
  organization: ParsedOrganization
  contacts: ParsedContact[]
}

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

// Smart field mappings for CSV columns
export const FIELD_MAPPINGS = {
  // Organization field mappings
  organization_name: ['Customer Name', 'Company', 'Business Name', 'Organization', 'Name'],
  organization_phone: ['Customer Phone', 'Phone', 'Tel', 'Telephone', 'Organization Phone'],
  address: ['Address', 'Street', 'Address 1', 'Address Line 1', 'Street Address'],
  city: ['City'],
  state: ['State', 'ST', 'State/Province', 'Province'],
  zip: ['Zip', 'Postal', 'Zip Code', 'Postal Code'],
  priority: ['Priority', 'Priority-Focus', 'Priority Focus'],
  segment: ['Segment'],
  website: ['Website', 'LinkedIn', 'URL'],
  notes: ['Notes', 'Comments', 'Description'],
  primary_manager: ['Primary Acct. Manager', 'Primary Manager', 'Account Manager'],
  secondary_manager: ['Secondary Acct. Manager', 'Secondary Manager'],
  
  // Contact field mappings
  contact_name: ['Attendee Name', 'Contact Name', 'Contact', 'Name'],
  contact_email: ['Attendee Email', 'Contact Email', 'Email'],
  contact_phone: ['Attendee Phone', 'Contact Phone', 'Mobile', 'Cell']
}

/**
 * Parse contact name into first and last name components
 */
export function parseContactName(fullName: string): { first_name: string; last_name: string } {
  if (!fullName?.trim()) {
    return { first_name: '', last_name: '' }
  }

  const cleaned = fullName.trim().replace(/\s+/g, ' ')
  
  // Handle "Last, First" format
  if (cleaned.includes(',')) {
    const [last, first] = cleaned.split(',').map(s => s.trim())
    return { 
      first_name: first || '', 
      last_name: last || '' 
    }
  }
  
  // Handle "First Last" format
  const parts = cleaned.split(' ')
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' }
  }
  
  const first = parts[0]
  const last = parts.slice(1).join(' ')
  return { first_name: first, last_name: last }
}

/**
 * Find the best matching CSV column for a target field
 */
export function findBestMatch(headers: string[], targetPatterns: string[]): string | null {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  
  for (const pattern of targetPatterns) {
    const normalizedPattern = pattern.toLowerCase()
    
    // Exact match
    const exactMatch = normalizedHeaders.findIndex(h => h === normalizedPattern)
    if (exactMatch !== -1) return headers[exactMatch]
    
    // Partial match
    const partialMatch = normalizedHeaders.findIndex(h => 
      h.includes(normalizedPattern) || normalizedPattern.includes(h)
    )
    if (partialMatch !== -1) return headers[partialMatch]
  }
  
  return null
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
  const emailFields = [
    findBestMatch(Object.keys(row), FIELD_MAPPINGS.contact_email)
  ].filter(Boolean) as string[]
  
  emailFields.forEach(field => {
    const email = row[field]?.trim()
    if (email && !isValidEmail(email)) {
      warnings.push(`Invalid email format: ${email}`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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
    secondary_manager_name: secondaryManagerField ? row[secondaryManagerField]?.trim() || null : null,
    import_notes: generateImportNotes(row, headers),
    is_active: true
  }
}

/**
 * Parse contact data from CSV row
 */
export function parseContact(row: CsvRow, headers: string[], isPrimary = false): ParsedContact | null {
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
    is_primary: isPrimary
  }
}

/**
 * Group CSV rows by organization
 */
export function groupRowsByOrganization(rows: CsvRow[], headers: string[]): OrganizationGroup[] {
  const groups = new Map<string, { organization: ParsedOrganization; contacts: ParsedContact[] }>()
  
  const orgNameField = findBestMatch(headers, FIELD_MAPPINGS.organization_name)
  if (!orgNameField) return []

  rows.forEach(row => {
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

/**
 * Detect organization segment from name patterns
 */
function detectSegment(name: string): string {
  if (!name) return 'General'
  
  const lowerName = name.toLowerCase()
  
  if (/restaurant|cafe|grill|kitchen|diner|pizza|food|burger|taco/i.test(lowerName)) {
    return 'Restaurant'
  }
  if (/school|hospital|university|college|medical|academy/i.test(lowerName)) {
    return 'Institutional'
  }
  if (/mart|store|shop|market|grocery/i.test(lowerName)) {
    return 'Retail'
  }
  if (/hotel|inn|resort|lodge/i.test(lowerName)) {
    return 'Hospitality'
  }
  
  return 'General'
}

/**
 * Determine organization type
 */
function determineOrganizationType(row: CsvRow, segment: string): Database['public']['Enums']['organization_type'] {
  // Check for distributor indicators
  const distributorFields = Object.keys(row).filter(key => 
    key.toLowerCase().includes('distributor')
  )
  
  for (const field of distributorFields) {
    const value = row[field]?.toLowerCase()
    if (value && (value.includes('yes') || value.includes('distributor'))) {
      return 'distributor'
    }
  }
  
  // Check segment for distributor
  if (segment?.toLowerCase().includes('distributor')) {
    return 'distributor'
  }
  
  return 'customer'
}

/**
 * Normalize priority values
 */
function normalizePriority(priority: string | undefined): string {
  if (!priority) return 'C'
  
  const normalized = priority.toUpperCase().trim()
  if (['A', 'B', 'C', 'D'].includes(normalized)) {
    return normalized
  }
  
  return 'C'
}

/**
 * Generate import notes for unmapped data
 */
function generateImportNotes(row: CsvRow, headers: string[]): string | null {
  // Find unmapped fields
  const mappedFields = new Set([
    ...FIELD_MAPPINGS.organization_name,
    ...FIELD_MAPPINGS.organization_phone,
    ...FIELD_MAPPINGS.address,
    ...FIELD_MAPPINGS.city,
    ...FIELD_MAPPINGS.state,
    ...FIELD_MAPPINGS.zip,
    ...FIELD_MAPPINGS.priority,
    ...FIELD_MAPPINGS.segment,
    ...FIELD_MAPPINGS.website,
    ...FIELD_MAPPINGS.notes,
    ...FIELD_MAPPINGS.primary_manager,
    ...FIELD_MAPPINGS.secondary_manager,
    ...FIELD_MAPPINGS.contact_name,
    ...FIELD_MAPPINGS.contact_email,
    ...FIELD_MAPPINGS.contact_phone
  ])

  const unmappedData: string[] = []
  
  headers.forEach(header => {
    const value = row[header]?.trim()
    if (value && !mappedFields.has(header)) {
      unmappedData.push(`${header}: ${value}`)
    }
  })

  return unmappedData.length > 0 ? unmappedData.join('; ') : null
}

/**
 * Check for duplicate organizations
 */
export async function checkDuplicateOrganizations(
  organizationNames: string[], 
  supabase: any
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
    console.error('Error checking duplicates:', error)
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

// Enhanced field mapping types and functions
export interface FieldMapping {
  csvColumn: string
  mapsTo: string
  confidence: number
  userOverridden: boolean
}

export interface FieldMappingOption {
  value: string
  label: string
  category: 'organization' | 'contact' | 'system'
}

/**
 * Calculate string similarity using Levenshtein-based algorithm
 */
function getStringSimilarity(str1: string, str2: string): number {
  const a = str1.toLowerCase()
  const b = str2.toLowerCase()
  
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0
  
  const matrix = []
  
  // Create matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  const maxLength = Math.max(a.length, b.length)
  return (maxLength - matrix[b.length][a.length]) / maxLength
}

/**
 * Calculate confidence score for field mapping
 */
export function calculateMappingConfidence(csvHeader: string, targetPatterns: string[]): number {
  const normalized = csvHeader.toLowerCase().trim()
  
  for (const pattern of targetPatterns) {
    const patternNorm = pattern.toLowerCase()
    
    // Exact match
    if (normalized === patternNorm) return 100
    
    // Contains/partial match
    if (normalized.includes(patternNorm) || patternNorm.includes(normalized)) return 75
    
    // Fuzzy matching using string similarity
    const similarity = getStringSimilarity(normalized, patternNorm)
    if (similarity > 0.7) return Math.round(similarity * 80) // Scale to 56-80%
    if (similarity > 0.5) return Math.round(similarity * 60) // Scale to 30-60%
  }
  
  return 0
}

/**
 * Find best field mapping for a CSV header
 */
function findBestFieldMapping(csvHeader: string): { field: string | null; confidence: number } {
  let bestField = null
  let bestConfidence = 0
  
  // Check all field mapping categories
  const allMappings = {
    organization_name: FIELD_MAPPINGS.organization_name,
    organization_phone: FIELD_MAPPINGS.organization_phone,
    address: FIELD_MAPPINGS.address,
    city: FIELD_MAPPINGS.city,
    state: FIELD_MAPPINGS.state,
    zip: FIELD_MAPPINGS.zip,
    priority: FIELD_MAPPINGS.priority,
    segment: FIELD_MAPPINGS.segment,
    website: FIELD_MAPPINGS.website,
    notes: FIELD_MAPPINGS.notes,
    primary_manager: FIELD_MAPPINGS.primary_manager,
    secondary_manager: FIELD_MAPPINGS.secondary_manager,
    contact_name: FIELD_MAPPINGS.contact_name,
    contact_email: FIELD_MAPPINGS.contact_email,
    contact_phone: FIELD_MAPPINGS.contact_phone
  }
  
  for (const [fieldName, patterns] of Object.entries(allMappings)) {
    const confidence = calculateMappingConfidence(csvHeader, patterns)
    if (confidence > bestConfidence) {
      bestField = fieldName
      bestConfidence = confidence
    }
  }
  
  return { field: bestField, confidence: bestConfidence }
}

/**
 * Generate initial field mappings from CSV headers
 */
export function generateInitialMappings(headers: string[]): FieldMapping[] {
  return headers.map(header => {
    const bestMatch = findBestFieldMapping(header)
    return {
      csvColumn: header,
      mapsTo: bestMatch.field || 'skip',
      confidence: bestMatch.confidence,
      userOverridden: false
    }
  })
}

/**
 * Get available field mapping options
 */
export function getFieldMappingOptions(): FieldMappingOption[] {
  return [
    // Organization fields
    { value: 'organization_name', label: 'Organization Name', category: 'organization' },
    { value: 'organization_phone', label: 'Organization Phone', category: 'organization' },
    { value: 'address', label: 'Address', category: 'organization' },
    { value: 'city', label: 'City', category: 'organization' },
    { value: 'state', label: 'State/Province', category: 'organization' },
    { value: 'zip', label: 'Zip/Postal Code', category: 'organization' },
    { value: 'priority', label: 'Priority', category: 'organization' },
    { value: 'segment', label: 'Segment', category: 'organization' },
    { value: 'website', label: 'Website', category: 'organization' },
    { value: 'notes', label: 'Notes', category: 'organization' },
    { value: 'primary_manager', label: 'Primary Manager', category: 'organization' },
    { value: 'secondary_manager', label: 'Secondary Manager', category: 'organization' },
    
    // Contact fields
    { value: 'contact_name', label: 'Contact: Full Name', category: 'contact' },
    { value: 'contact_email', label: 'Contact: Email', category: 'contact' },
    { value: 'contact_phone', label: 'Contact: Phone', category: 'contact' },
    
    // System
    { value: 'skip', label: 'Skip this field', category: 'system' }
  ]
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
  const hasOrgName = mappings.some(m => m.mapsTo === 'organization_name')
  if (!hasOrgName) {
    errors.push('Organization Name is required - please map at least one CSV column to Organization Name')
  }
  
  // Check for duplicate mappings (excluding 'skip')
  const mappedFields = mappings.filter(m => m.mapsTo !== 'skip').map(m => m.mapsTo)
  const duplicates = mappedFields.filter((field, index) => mappedFields.indexOf(field) !== index)
  if (duplicates.length > 0) {
    errors.push(`Duplicate mappings detected: ${[...new Set(duplicates)].join(', ')}`)
  }
  
  // Warnings for low confidence mappings
  const lowConfidenceMappings = mappings.filter(m => m.confidence < 50 && m.mapsTo !== 'skip' && !m.userOverridden)
  if (lowConfidenceMappings.length > 0) {
    warnings.push(`Low confidence mappings detected for: ${lowConfidenceMappings.map(m => m.csvColumn).join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}