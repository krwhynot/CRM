/**
 * Smart Defaults - Pattern Matching Rules
 * 
 * Implements Tesler's Law by automatically detecting organization types
 * and providing intelligent field correlations for faster form completion.
 */

import type { Database } from '@/lib/database.types'

type OrganizationType = Database['public']['Enums']['organization_type']

/**
 * Organization type detection patterns
 * Analyzes organization names to predict the most likely type
 */
export const ORGANIZATION_TYPE_PATTERNS: Record<OrganizationType, string[]> = {
  customer: [
    // Food Service Establishments
    'restaurant', 'cafe', 'bistro', 'diner', 'eatery', 'grill', 'kitchen', 'tavern', 
    'bar', 'pub', 'steakhouse', 'pizzeria', 'bakery', 'coffee', 'catering',
    
    // Hospitality
    'hotel', 'resort', 'lodge', 'inn', 'motel', 'casino',
    
    // Institutional
    'school', 'university', 'college', 'hospital', 'clinic', 'nursing home',
    'senior living', 'assisted living', 'healthcare', 'medical center',
    
    // Corporate Dining
    'corporate dining', 'employee dining', 'cafeteria', 'food service',
    
    // Retail Food
    'grocery', 'supermarket', 'market', 'store', 'retail'
  ],
  
  principal: [
    // Manufacturing
    'foods', 'food company', 'food corp', 'manufacturing', 'producers', 
    'production', 'processing', 'brands', 'products', 'ingredients',
    
    // Corporate Identifiers
    'corporation', 'corp', 'incorporated', 'inc', 'company', 'co',
    
    // Food Industry Terms
    'dairy', 'beverages', 'snacks', 'frozen', 'meat', 'seafood',
    'organic', 'natural', 'farm', 'ranch', 'agriculture'
  ],
  
  distributor: [
    // Distribution Terms
    'distribution', 'distributors', 'supply', 'supplies', 'logistics', 
    'wholesale', 'warehousing', 'fulfillment',
    
    // Food Distribution
    'food service', 'foodservice', 'food distribution', 'food supply',
    'sysco', 'us foods', 'performance food', 'gordon food service'
  ],
  
  prospect: [
    // Potential Indicators
    'new', 'opening', 'coming soon', 'planned', 'development',
    'concept', 'startup', 'emerging'
  ],
  
  vendor: [
    // Service Providers
    'services', 'consulting', 'solutions', 'technology', 'software',
    'equipment', 'supplies', 'maintenance', 'cleaning', 'marketing',
    'advertising', 'design', 'construction', 'hvac', 'refrigeration'
  ]
}

/**
 * Detects organization type based on name patterns
 * Returns the most likely organization type or null if no clear match
 */
export function detectOrganizationType(organizationName: string): OrganizationType | null {
  if (!organizationName || organizationName.trim().length < 2) {
    return null
  }

  const name = organizationName.toLowerCase().trim()
  const scores: Record<OrganizationType, number> = {
    customer: 0,
    principal: 0,
    distributor: 0,
    prospect: 0,
    vendor: 0
  }

  // Score each organization type based on pattern matches
  Object.entries(ORGANIZATION_TYPE_PATTERNS).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      if (name.includes(pattern.toLowerCase())) {
        scores[type as OrganizationType] += pattern.length // Longer patterns get higher scores
      }
    })
  })

  // Find the type with highest score
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) {
    return null // No clear match
  }

  const bestMatch = Object.entries(scores).find(([_, score]) => score === maxScore)
  return bestMatch ? (bestMatch[0] as OrganizationType) : null
}

/**
 * Gets confidence level for organization type detection
 */
export function getDetectionConfidence(organizationName: string, detectedType: OrganizationType): number {
  if (!organizationName || !detectedType) return 0

  const name = organizationName.toLowerCase().trim()
  const patterns = ORGANIZATION_TYPE_PATTERNS[detectedType]
  const matchCount = patterns.filter(pattern => name.includes(pattern.toLowerCase())).length
  
  // Confidence based on number of matching patterns and name length
  const confidence = Math.min((matchCount / patterns.length) * 100, 95) // Cap at 95%
  return Math.round(confidence)
}

/**
 * Common business entity suffixes that don't indicate type
 */
export const BUSINESS_SUFFIXES = [
  'llc', 'inc', 'corp', 'corporation', 'company', 'co', 'ltd', 'limited',
  'enterprises', 'group', 'holdings', 'partners', 'associates'
]

/**
 * Cleans organization name by removing common business suffixes
 * Useful for better pattern matching
 */
export function cleanOrganizationName(name: string): string {
  if (!name) return ''
  
  let cleaned = name.toLowerCase().trim()
  
  // Remove business suffixes
  BUSINESS_SUFFIXES.forEach(suffix => {
    const regex = new RegExp(`\\b${suffix}\\b\\.?$`, 'i')
    cleaned = cleaned.replace(regex, '').trim()
  })
  
  return cleaned
}