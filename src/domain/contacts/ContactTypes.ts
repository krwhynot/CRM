import type { BaseEntity } from '../shared/BaseEntity'

/**
 * Domain-specific contact types
 * Extracted from existing contact.types.ts but focused on domain logic
 */

// Contact role types - database enum values
export const CONTACT_ROLES = [
  'decision_maker',
  'influencer',
  'buyer',
  'end_user',
  'gatekeeper',
  'champion',
] as const

export type ContactRole = (typeof CONTACT_ROLES)[number]

// Purchase influence levels
export const PURCHASE_INFLUENCE_LEVELS = ['High', 'Medium', 'Low', 'Unknown'] as const

export type PurchaseInfluenceLevel = (typeof PURCHASE_INFLUENCE_LEVELS)[number]

// Decision authority roles
export const DECISION_AUTHORITY_ROLES = [
  'Decision Maker',
  'Influencer',
  'End User',
  'Gatekeeper',
] as const

export type DecisionAuthorityRole = (typeof DECISION_AUTHORITY_ROLES)[number]

/**
 * Domain contact entity
 * Core business properties without database-specific fields
 */
export interface ContactDomain extends BaseEntity {
  first_name: string
  last_name: string
  organization_id: string | null
  email: string | null
  title: string | null
  department: string | null
  phone: string | null
  mobile_phone: string | null
  linkedin_url: string | null
  role: ContactRole | null
  purchase_influence: PurchaseInfluenceLevel
  decision_authority: DecisionAuthorityRole
  is_primary_contact: boolean | null
  notes: string | null
}

/**
 * Contact creation data
 */
export interface CreateContactData {
  first_name: string
  last_name: string
  organization_id: string | null
  email?: string | null
  title?: string | null
  department?: string | null
  phone?: string | null
  mobile_phone?: string | null
  linkedin_url?: string | null
  role?: ContactRole | null
  purchase_influence?: PurchaseInfluenceLevel // Optional, defaults to 'Unknown'
  decision_authority?: DecisionAuthorityRole // Optional, defaults to 'Gatekeeper'
  is_primary_contact?: boolean | null
  notes?: string | null
}

/**
 * Contact update data
 */
export interface UpdateContactData {
  first_name?: string
  last_name?: string
  organization_id?: string | null
  email?: string | null
  title?: string | null
  department?: string | null
  phone?: string | null
  mobile_phone?: string | null
  linkedin_url?: string | null
  role?: ContactRole | null
  purchase_influence?: PurchaseInfluenceLevel
  decision_authority?: DecisionAuthorityRole
  is_primary_contact?: boolean | null
  notes?: string | null
}

/**
 * Contact engagement metrics
 */
export interface ContactEngagement {
  contactId: string
  engagementScore: number
  interactionCount: number
  lastInteractionDate: string | null
  needsFollowUp: boolean
  isHighValue: boolean
  responsiveness: 'high' | 'medium' | 'low' | 'unresponsive'
}

/**
 * Contact relationship validation result
 */
export interface ContactRelationshipValidation {
  isValid: boolean
  issues: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * Contact name generation result
 */
export interface ContactDisplayInfo {
  fullName: string
  displayTitle: string
  displayRole: string
  primaryIdentifier: string
}

/**
 * Contact influence metrics
 */
export interface ContactInfluenceMetrics {
  decisionWeight: number
  purchaseInfluenceScore: number
  networkConnections: number
  opportunityInvolvement: number
  communicationFrequency: number
}

/**
 * Contact validation context
 */
export interface ContactValidationContext {
  organizationId?: string | null
  existingContacts?: ContactDomain[]
  enforcePrimaryContactRule?: boolean
}
