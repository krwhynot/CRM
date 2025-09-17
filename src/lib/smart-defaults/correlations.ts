/**
 * Smart Defaults - Field Correlation Rules
 *
 * Defines intelligent relationships between contact form fields
 * to auto-populate related values and reduce user input burden.
 */

import type { Database } from '@/lib/database.types'
import type {
  ContactRole,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole,
} from '@/types/contact.types'

type OrganizationType = Database['public']['Enums']['organization_type']

/**
 * Contact role correlations with purchase influence and decision authority
 * Based on typical business relationship patterns
 */
export const ROLE_CORRELATIONS: Record<
  ContactRole,
  {
    purchase_influence: PurchaseInfluenceLevel
    decision_authority: DecisionAuthorityRole
    confidence: number // 0-100
  }
> = {
  decision_maker: {
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    confidence: 95,
  },
  buyer: {
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    confidence: 90,
  },
  influencer: {
    purchase_influence: 'Medium',
    decision_authority: 'Influencer',
    confidence: 85,
  },
  champion: {
    purchase_influence: 'Medium',
    decision_authority: 'Influencer',
    confidence: 80,
  },
  end_user: {
    purchase_influence: 'Low',
    decision_authority: 'End User',
    confidence: 90,
  },
  gatekeeper: {
    purchase_influence: 'Low',
    decision_authority: 'Gatekeeper',
    confidence: 95,
  },
}

/**
 * Default contact roles based on organization type
 * Helps pre-select the most common role for each organization type
 */
export const ORGANIZATION_TYPE_DEFAULT_ROLES: Record<
  OrganizationType,
  {
    primary: ContactRole
    alternatives: ContactRole[]
    confidence: number
  }
> = {
  customer: {
    primary: 'decision_maker',
    alternatives: ['buyer', 'end_user'],
    confidence: 75,
  },
  principal: {
    primary: 'influencer',
    alternatives: ['champion', 'decision_maker'],
    confidence: 70,
  },
  distributor: {
    primary: 'champion',
    alternatives: ['influencer', 'buyer'],
    confidence: 80,
  },
  prospect: {
    primary: 'decision_maker',
    alternatives: ['influencer', 'gatekeeper'],
    confidence: 60, // Lower confidence for prospects
  },
  vendor: {
    primary: 'influencer',
    alternatives: ['decision_maker', 'champion'],
    confidence: 65,
  },
}

/**
 * Job title patterns that suggest specific contact roles
 */
export const JOB_TITLE_ROLE_PATTERNS: Record<
  string,
  {
    role: ContactRole
    confidence: number
  }
> = {
  // Decision Makers
  ceo: { role: 'decision_maker', confidence: 95 },
  president: { role: 'decision_maker', confidence: 90 },
  owner: { role: 'decision_maker', confidence: 95 },
  founder: { role: 'decision_maker', confidence: 90 },
  director: { role: 'decision_maker', confidence: 85 },
  'general manager': { role: 'decision_maker', confidence: 90 },
  gm: { role: 'decision_maker', confidence: 85 },

  // Buyers/Purchasing
  buyer: { role: 'buyer', confidence: 95 },
  purchasing: { role: 'buyer', confidence: 90 },
  procurement: { role: 'buyer', confidence: 90 },
  sourcing: { role: 'buyer', confidence: 85 },

  // Influencers
  manager: { role: 'influencer', confidence: 75 },
  supervisor: { role: 'influencer', confidence: 70 },
  chef: { role: 'influencer', confidence: 85 },
  'head chef': { role: 'influencer', confidence: 90 },
  'executive chef': { role: 'decision_maker', confidence: 85 },
  'kitchen manager': { role: 'influencer', confidence: 80 },
  'food service director': { role: 'decision_maker', confidence: 85 },

  // End Users
  cook: { role: 'end_user', confidence: 85 },
  'line cook': { role: 'end_user', confidence: 90 },
  'prep cook': { role: 'end_user', confidence: 85 },
  server: { role: 'end_user', confidence: 80 },
  bartender: { role: 'end_user', confidence: 75 },

  // Gatekeepers
  assistant: { role: 'gatekeeper', confidence: 80 },
  admin: { role: 'gatekeeper', confidence: 75 },
  secretary: { role: 'gatekeeper', confidence: 85 },
  coordinator: { role: 'gatekeeper', confidence: 70 },
  receptionist: { role: 'gatekeeper', confidence: 85 },
}

/**
 * Detects contact role based on job title
 */
export function detectContactRoleFromTitle(
  title: string
): { role: ContactRole; confidence: number } | null {
  if (!title || title.trim().length < 2) {
    return null
  }

  const titleLower = title.toLowerCase().trim()

  // Direct pattern matching
  for (const [pattern, result] of Object.entries(JOB_TITLE_ROLE_PATTERNS)) {
    if (titleLower.includes(pattern)) {
      return result
    }
  }

  return null
}

/**
 * Gets smart defaults for a contact role
 */
export function getRoleCorrelations(role: ContactRole): {
  purchase_influence: PurchaseInfluenceLevel
  decision_authority: DecisionAuthorityRole
  confidence: number
} {
  return ROLE_CORRELATIONS[role]
}

/**
 * Gets default role for organization type
 */
export function getDefaultRoleForOrganizationType(orgType: OrganizationType): {
  role: ContactRole
  confidence: number
} {
  const defaults = ORGANIZATION_TYPE_DEFAULT_ROLES[orgType]
  return {
    role: defaults.primary,
    confidence: defaults.confidence,
  }
}

/**
 * Smart defaults combination - organization type + job title analysis
 */
export function getSmartRoleDefaults(
  organizationType?: OrganizationType,
  jobTitle?: string
): {
  role: ContactRole
  purchase_influence: PurchaseInfluenceLevel
  decision_authority: DecisionAuthorityRole
  confidence: number
  source: 'job_title' | 'org_type' | 'combined'
} | null {
  // Priority 1: Job title analysis (most specific)
  if (jobTitle) {
    const titleResult = detectContactRoleFromTitle(jobTitle)
    if (titleResult && titleResult.confidence >= 70) {
      const correlations = getRoleCorrelations(titleResult.role)
      return {
        role: titleResult.role,
        purchase_influence: correlations.purchase_influence,
        decision_authority: correlations.decision_authority,
        confidence: Math.min(titleResult.confidence, correlations.confidence),
        source: 'job_title',
      }
    }
  }

  // Priority 2: Organization type defaults
  if (organizationType) {
    const orgDefaults = getDefaultRoleForOrganizationType(organizationType)
    const correlations = getRoleCorrelations(orgDefaults.role)
    return {
      role: orgDefaults.role,
      purchase_influence: correlations.purchase_influence,
      decision_authority: correlations.decision_authority,
      confidence: Math.min(orgDefaults.confidence, correlations.confidence),
      source: 'org_type',
    }
  }

  return null
}

/**
 * Validates if auto-suggested values make business sense
 */
export function validateSmartDefaults(values: {
  role?: ContactRole
  purchase_influence?: PurchaseInfluenceLevel
  decision_authority?: DecisionAuthorityRole
  organization_type?: OrganizationType
}): boolean {
  // Ensure role correlations are consistent
  if (values.role && values.purchase_influence && values.decision_authority) {
    const expectedCorrelations = getRoleCorrelations(values.role)
    return (
      expectedCorrelations.purchase_influence === values.purchase_influence &&
      expectedCorrelations.decision_authority === values.decision_authority
    )
  }

  return true // Valid if incomplete
}
