import type { BaseEntity } from '../shared/BaseEntity'

/**
 * Domain-specific organization types
 * Extracted from existing organization.types.ts but focused on domain logic
 */

// Organization types - database enum values
export const ORGANIZATION_TYPES = [
  'customer',
  'distributor',
  'principal',
  'supplier',
  'prospect',
  'vendor',
] as const

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]

// Organization priority levels
export const ORGANIZATION_PRIORITIES = ['A', 'B', 'C', 'D'] as const

export type OrganizationPriority = (typeof ORGANIZATION_PRIORITIES)[number]

// Food service segments
export const FOOD_SERVICE_SEGMENTS = [
  'Fine Dining',
  'Fast Food',
  'Fast Casual',
  'Healthcare',
  'Education',
  'Corporate Catering',
  'Hotel & Resort',
  'Entertainment Venue',
  'Retail Food Service',
  'Government',
  'Senior Living',
  'Other',
] as const

export type FoodServiceSegment = (typeof FOOD_SERVICE_SEGMENTS)[number]

// Organization relationship types
export const ORGANIZATION_RELATIONSHIP_TYPES = [
  'direct_customer',
  'indirect_customer',
  'key_account',
  'strategic_partner',
  'preferred_vendor',
  'distributor_partner',
  'principal_partner',
] as const

export type OrganizationRelationshipType = (typeof ORGANIZATION_RELATIONSHIP_TYPES)[number]

/**
 * Domain organization entity
 * Core business properties without database-specific fields
 */
export interface OrganizationDomain extends BaseEntity {
  name: string
  type: OrganizationType
  priority: OrganizationPriority
  segment: string
  is_principal: boolean
  is_distributor: boolean
  description: string | null
  email: string | null
  phone: string | null
  website: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  industry: string | null
  notes: string | null
}

/**
 * Organization creation data
 */
export interface CreateOrganizationData {
  name: string
  type: OrganizationType
  priority?: OrganizationPriority // Optional, defaults to 'B'
  segment: string
  description?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  industry?: string | null
  notes?: string | null
}

/**
 * Organization update data
 */
export interface UpdateOrganizationData {
  name?: string
  type?: OrganizationType
  priority?: OrganizationPriority
  segment?: string
  description?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  industry?: string | null
  notes?: string | null
}

/**
 * Organization relationship metrics
 */
export interface OrganizationRelationshipMetrics {
  organizationId: string
  relationshipType: OrganizationRelationshipType
  relationshipScore: number
  engagementLevel: 'high' | 'medium' | 'low'
  contactCount: number
  opportunityCount: number
  interactionCount: number
  lastInteractionDate: string | null
  annualValue: number
  potentialValue: number
}

/**
 * Organization business validation result
 */
export interface OrganizationBusinessValidation {
  isValid: boolean
  issues: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * Organization segmentation analysis
 */
export interface OrganizationSegmentAnalysis {
  primarySegment: string
  subSegments: string[]
  segmentFit: number // 0-100 score
  marketOpportunity: 'high' | 'medium' | 'low'
  competitiveDensity: 'high' | 'medium' | 'low'
  growthPotential: number // 0-100 score
}

/**
 * Organization hierarchy information
 */
export interface OrganizationHierarchy {
  parentOrganization?: OrganizationDomain
  childOrganizations: OrganizationDomain[]
  relatedDistributors: OrganizationDomain[]
  relatedPrincipals: OrganizationDomain[]
  level: number
  isHeadquarters: boolean
}

/**
 * Organization performance metrics
 */
export interface OrganizationPerformance {
  organizationId: string
  totalOpportunityValue: number
  wonOpportunityValue: number
  lostOpportunityValue: number
  activeOpportunityCount: number
  winRate: number
  averageDealSize: number
  salesCycleLength: number // in days
  lastPurchaseDate: string | null
  customerLifetimeValue: number
  churnRisk: 'high' | 'medium' | 'low'
}

/**
 * Organization validation context
 */
export interface OrganizationValidationContext {
  existingOrganizations?: OrganizationDomain[]
  enforceUniqueNameRule?: boolean
  requireCompleteAddress?: boolean
  validateSegmentAlignment?: boolean
}

/**
 * Organization territory assignment
 */
export interface OrganizationTerritory {
  organizationId: string
  territoryName: string
  salesManagerId?: string
  region: string
  isKeyAccount: boolean
  accountTier: 'tier_1' | 'tier_2' | 'tier_3'
  coverageFrequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly'
}

/**
 * Organization contact summary
 */
export interface OrganizationContactSummary {
  totalContacts: number
  primaryContact?: {
    id: string
    name: string
    title?: string
    email?: string
    phone?: string
  }
  decisionMakers: number
  influencers: number
  champions: number
  keyContacts: Array<{
    id: string
    name: string
    role: string
    authority: string
  }>
}
