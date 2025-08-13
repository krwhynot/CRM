/**
 * Contact-specific type definitions and utilities
 * 
 * This file provides specialized types for contact-related functionality
 * including validation schemas, form types, and business logic interfaces.
 */

import type { 
  Contact, 
  ContactWithRelations,
  ContactListItem,
  ContactFilter,
  ContactRole,
  Organization,
  Interaction
} from './entities'

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Contact creation form validation schema type
 */
export interface CreateContactSchema {
  organization_id: string
  first_name: string
  last_name: string
  title?: string
  role?: ContactRole
  department?: string
  email?: string
  phone_work?: string
  phone_mobile?: string
  phone_direct?: string
  linkedin_url?: string
  notes?: string
  is_primary_contact?: boolean
}

/**
 * Contact update form validation schema type
 */
export interface UpdateContactSchema {
  first_name?: string
  last_name?: string
  title?: string
  role?: ContactRole
  department?: string
  email?: string
  phone_work?: string
  phone_mobile?: string
  phone_direct?: string
  linkedin_url?: string
  notes?: string
  is_primary_contact?: boolean
}

// =============================================================================
// BUSINESS LOGIC TYPES
// =============================================================================

/**
 * Contact summary for dashboard views
 */
export interface ContactSummary {
  id: string
  full_name: string
  title: string | null
  role: ContactRole | null
  organization_name: string
  organization_type: string
  email: string | null
  phone_work: string | null
  phone_mobile: string | null
  last_interaction_date: string | null
  interaction_count: number
  opportunity_count: number
  is_primary_contact: boolean
}

/**
 * Contact with full organization context
 */
export interface ContactWithFullContext extends ContactWithRelations {
  organization: Organization
  recent_interactions?: Interaction[]
  interaction_summary?: {
    total: number
    calls: number
    emails: number
    meetings: number
    last_interaction_type: string | null
    last_interaction_date: string | null
  }
}

/**
 * Contact communication preferences
 */
export interface ContactCommunicationPreferences {
  preferred_method: 'email' | 'phone_work' | 'phone_mobile' | 'phone_direct' | 'linkedin'
  best_time_to_call?: string
  time_zone?: string
  notes?: string
  do_not_call?: boolean
  do_not_email?: boolean
}

/**
 * Contact role hierarchy and influence mapping
 */
export interface ContactInfluence {
  contact_id: string
  influence_score: number // 1-10 scale
  decision_authority: 'high' | 'medium' | 'low' | 'none'
  budget_authority: boolean
  technical_authority: boolean
  relationship_strength: 'champion' | 'supporter' | 'neutral' | 'detractor'
  notes?: string
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

/**
 * Contact card display props
 */
export interface ContactCardProps {
  contact: ContactListItem
  showOrganization?: boolean
  showActions?: boolean
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  onCall?: (phone: string) => void
  onEmail?: (email: string) => void
}

/**
 * Contact table column configuration
 */
export interface ContactTableColumn {
  key: keyof ContactListItem | 'actions'
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: ContactListItem) => string | number
}

/**
 * Contact form section configuration
 */
export interface ContactFormSection {
  id: string
  title: string
  description?: string
  fields: Array<keyof CreateContactSchema>
  collapsible?: boolean
  defaultOpen?: boolean
}

/**
 * Contact avatar configuration
 */
export interface ContactAvatarProps {
  contact: Contact | ContactSummary | ContactListItem
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showInitials?: boolean
  showStatus?: boolean
  className?: string
}

// =============================================================================
// COMMUNICATION TYPES
// =============================================================================

/**
 * Contact communication method
 */
export type CommunicationMethod = 'email' | 'phone_work' | 'phone_mobile' | 'phone_direct' | 'linkedin'

/**
 * Available communication channels for a contact
 */
export interface ContactCommunicationChannels {
  email?: {
    address: string
    verified: boolean
    primary: boolean
  }
  phone_work?: {
    number: string
    extension?: string
    verified: boolean
  }
  phone_mobile?: {
    number: string
    verified: boolean
    sms_enabled: boolean
  }
  phone_direct?: {
    number: string
    verified: boolean
  }
  linkedin?: {
    url: string
    profile_id?: string
    connected: boolean
  }
}

/**
 * Contact outreach attempt tracking
 */
export interface ContactOutreachAttempt {
  id: string
  contact_id: string
  method: CommunicationMethod
  attempted_at: string
  successful: boolean
  response_received: boolean
  notes?: string
  follow_up_required: boolean
  follow_up_date?: string
}

// =============================================================================
// API SERVICE TYPES
// =============================================================================

/**
 * Contact service method signatures
 */
export interface ContactService {
  // CRUD operations
  getAll: (filter?: ContactFilter) => Promise<ContactListItem[]>
  getById: (id: string) => Promise<ContactWithFullContext | null>
  create: (data: CreateContactSchema) => Promise<Contact>
  update: (id: string, data: UpdateContactSchema) => Promise<Contact>
  delete: (id: string) => Promise<void>
  
  // Organization relationships
  getByOrganization: (organizationId: string) => Promise<ContactListItem[]>
  getPrimaryContact: (organizationId: string) => Promise<Contact | null>
  setPrimaryContact: (organizationId: string, contactId: string) => Promise<void>
  
  // Communication
  getCommunicationChannels: (id: string) => Promise<ContactCommunicationChannels>
  recordOutreachAttempt: (data: Omit<ContactOutreachAttempt, 'id'>) => Promise<ContactOutreachAttempt>
  getOutreachHistory: (contactId: string) => Promise<ContactOutreachAttempt[]>
  
  // Search and filter
  search: (query: string, organizationId?: string) => Promise<ContactListItem[]>
  filter: (filter: ContactFilter) => Promise<ContactListItem[]>
  
  // Business operations
  getSummary: (id: string) => Promise<ContactSummary>
  getInfluenceMap: (organizationId: string) => Promise<ContactInfluence[]>
  
  // Bulk operations
  bulkUpdate: (updates: Array<{ id: string; data: UpdateContactSchema }>) => Promise<Contact[]>
  bulkDelete: (ids: string[]) => Promise<void>
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Contact role validation
 */
export const CONTACT_ROLES: ContactRole[] = [
  'decision_maker',
  'influencer',
  'buyer',
  'end_user',
  'gatekeeper',
  'champion'
] as const

/**
 * Required fields for contact creation
 */
export const REQUIRED_CONTACT_FIELDS: Array<keyof CreateContactSchema> = [
  'organization_id',
  'first_name',
  'last_name'
]

/**
 * Phone validation patterns
 */
export const PHONE_PATTERNS = {
  US: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  INTERNATIONAL: /^\+?[\d\s\-\(\)]+$/,
  EXTENSION: /^[\d\s\-\(\)]+(?:\s?(?:ext|extension|x)\.?\s?\d+)?$/i
}

/**
 * LinkedIn URL validation pattern
 */
export const LINKEDIN_URL_PATTERN = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Contact role type guard function
 */
export const isContactRole = (value: string): value is ContactRole => {
  return CONTACT_ROLES.includes(value as ContactRole)
}

/**
 * Contact display utilities
 */
export interface ContactDisplayUtils {
  getFullName: (contact: Contact | ContactSummary) => string
  getInitials: (contact: Contact | ContactSummary) => string
  formatPhoneNumber: (phone: string | null, format?: 'display' | 'dial') => string
  getBestPhone: (contact: Contact) => string | null
  getRoleIcon: (role: ContactRole | null) => string
  getRoleColor: (role: ContactRole | null) => string
  getStatusIndicator: (lastInteraction: string | null) => 'active' | 'stale' | 'cold'
}

/**
 * Contact merge capabilities
 */
export interface ContactMergeCandidate {
  contact: Contact
  similarity_score: number
  matching_fields: string[]
  potential_duplicate: boolean
  confidence: 'high' | 'medium' | 'low'
}

export interface ContactMergeOperation {
  primary_contact_id: string
  duplicate_contact_id: string
  field_preferences: Record<keyof Contact, 'primary' | 'duplicate' | 'merge'>
  preserve_history: boolean
}

// =============================================================================
// FORM STATE MANAGEMENT
// =============================================================================

/**
 * Contact form state
 */
export interface ContactFormState {
  data: Partial<CreateContactSchema>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  selectedOrganization?: Organization
  availableOrganizations?: Organization[]
}

/**
 * Contact form actions
 */
export type ContactFormAction =
  | { type: 'SET_FIELD'; field: keyof CreateContactSchema; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ORGANIZATION'; organization: Organization }
  | { type: 'SET_AVAILABLE_ORGANIZATIONS'; organizations: Organization[] }
  | { type: 'RESET_FORM' }

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Contact analytics metrics
 */
export interface ContactMetrics {
  total_contacts: number
  by_role: Record<ContactRole, number>
  with_email: number
  with_phone: number
  primary_contacts: number
  recent_interactions: number
  engagement_rate: number
  response_rate: number
}

/**
 * Contact engagement tracking
 */
export interface ContactEngagement {
  contact_id: string
  last_interaction_date: string | null
  interaction_frequency: number // interactions per month
  response_rate: number // percentage
  engagement_score: number // 1-10 scale
  preferred_channel: CommunicationMethod | null
  best_contact_time: string | null
}

/**
 * Contact import/export types
 */
export interface ContactImportRow extends Omit<CreateContactSchema, 'organization_id' | 'role'> {
  organization_name?: string
  organization_id?: string
  role?: string // String version for CSV import
  row_number: number
  validation_errors?: string[]
}

export interface ContactExportRow extends ContactListItem {
  phone_mobile: string | null
  phone_direct: string | null
  linkedin_url: string | null
  department: string | null
  notes: string | null
}