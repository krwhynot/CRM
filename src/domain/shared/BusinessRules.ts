/**
 * Shared business rules and constraints across all domains
 */

/**
 * Priority rating business rules
 */
export const PriorityRules = {
  validRatings: ['A', 'B', 'C', 'D'] as const,

  isValidRating(rating: string): rating is 'A' | 'B' | 'C' | 'D' {
    return this.validRatings.includes(rating as any)
  },

  compareRatings(a: string, b: string): number {
    const aIndex = this.validRatings.indexOf(a as any)
    const bIndex = this.validRatings.indexOf(b as any)
    return aIndex - bIndex // Lower index = higher priority
  },

  getDefaultRating(): 'B' {
    return 'B'
  },
} as const

/**
 * Organization type business rules
 */
export const OrganizationTypeRules = {
  validTypes: ['customer', 'distributor', 'principal', 'supplier'] as const,

  isValidType(type: string): type is 'customer' | 'distributor' | 'principal' | 'supplier' {
    return this.validTypes.includes(type as any)
  },

  canHaveOpportunities(type: string): boolean {
    return type === 'customer' // Only customers can have opportunities
  },

  canBePrincipal(type: string): boolean {
    return type === 'principal'
  },

  requiresManager(type: string): boolean {
    return ['customer', 'distributor'].includes(type)
  },
} as const

/**
 * Segment business rules
 */
export const SegmentRules = {
  validSegments: ['restaurant', 'healthcare', 'education'] as const,

  isValidSegment(segment: string): segment is 'restaurant' | 'healthcare' | 'education' {
    return this.validSegments.includes(segment as any)
  },

  getDefaultSegment(): 'restaurant' {
    return 'restaurant'
  },
} as const

/**
 * Decision authority business rules
 */
export const DecisionAuthorityRules = {
  validAuthorities: ['primary', 'secondary', 'influencer'] as const,

  isValidAuthority(authority: string): authority is 'primary' | 'secondary' | 'influencer' {
    return this.validAuthorities.includes(authority as any)
  },

  canMakeFinalDecision(authority: string): boolean {
    return authority === 'primary'
  },

  getDefaultAuthority(): 'influencer' {
    return 'influencer'
  },
} as const

/**
 * Common validation rules
 */
export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate(email: string): boolean {
      return this.pattern.test(email)
    },
  },

  phone: {
    // Basic phone validation - can be enhanced based on requirements
    validate(phone: string): boolean {
      const cleaned = phone.replace(/\D/g, '')
      return cleaned.length >= 10 && cleaned.length <= 15
    },
  },

  currency: {
    validate(amount: number): boolean {
      return amount >= 0 && Number.isFinite(amount)
    },

    format(amount: number): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    },
  },

  required: {
    string(value: string | null | undefined): boolean {
      return Boolean(value && value.trim().length > 0)
    },

    number(value: number | null | undefined): boolean {
      return value !== null && value !== undefined && !isNaN(value)
    },
  },
} as const

/**
 * Business constraint violations
 */
export class BusinessRuleViolation extends Error {
  constructor(rule: string, message: string) {
    super(`Business rule violation [${rule}]: ${message}`)
    this.name = 'BusinessRuleViolation'
  }
}
