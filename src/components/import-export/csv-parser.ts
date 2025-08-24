import type { Database } from '@/lib/database.types'

export interface CsvRow {
  [key: string]: string
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

export interface ParsedContact {
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  organization_id?: string
  is_primary: boolean
}

export interface OrganizationGroup {
  organization: ParsedOrganization
  contacts: ParsedContact[]
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
 * Detect organization segment from name patterns
 */
export function detectSegment(name: string): string {
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
export function determineOrganizationType(row: CsvRow, segment: string): Database['public']['Enums']['organization_type'] {
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
export function normalizePriority(priority: string | undefined): string {
  if (!priority) return 'C'
  
  const normalized = priority.toUpperCase().trim()
  if (['A', 'B', 'C', 'D'].includes(normalized)) {
    return normalized
  }
  
  return 'C'
}

/**
 * Simple email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}