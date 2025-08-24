// Smart field mappings for CSV columns
export const FIELD_MAPPINGS = {
  // Organization field mappings
  organization_name: ['Customer Name', 'Company', 'Business Name', 'Organization', 'Name', 'organizations'],
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
 * Generate import notes for unmapped data
 */
export function generateImportNotes(row: Record<string, string>, headers: string[]): string | null {
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