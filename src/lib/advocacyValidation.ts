/**
 * Advocacy Validation Library - Business Logic Enforcement
 * 
 * Comprehensive validation rules for contact-to-principal advocacy relationships
 * ensuring data integrity and business rule compliance.
 */

import type {
  Contact,
  Organization,
  ContactPreferredPrincipalInsert,
  ContactPreferredPrincipalUpdate,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole
} from '@/types/entities'

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Business rule constants
export const ADVOCACY_BUSINESS_RULES = {
  MAX_PRINCIPALS_PER_CONTACT: 10, // Reasonable limit to prevent data bloat
  MIN_ADVOCACY_STRENGTH: 1,
  MAX_ADVOCACY_STRENGTH: 10,
  VALID_RELATIONSHIP_TYPES: ['professional', 'personal', 'historical', 'competitive'] as const,
  
  // Advocacy strength recommendations based on contact authority
  STRENGTH_RECOMMENDATIONS: {
    'Decision Maker': { min: 6, max: 10, default: 8 },
    'Influencer': { min: 4, max: 9, default: 6 },
    'End User': { min: 1, max: 7, default: 4 },
    'Gatekeeper': { min: 2, max: 8, default: 5 }
  },

  // Purchase influence impact on advocacy effectiveness
  INFLUENCE_MULTIPLIERS: {
    'High': 1.0,
    'Medium': 0.8,
    'Low': 0.6,
    'Unknown': 0.5
  }
} as const

export type RelationshipType = typeof ADVOCACY_BUSINESS_RULES.VALID_RELATIONSHIP_TYPES[number]

/**
 * Validates advocacy relationship creation data
 */
export function validateAdvocacyCreation(
  data: ContactPreferredPrincipalInsert,
  contact?: Contact,
  principal?: Organization,
  existingRelationships?: number
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!data.contact_id) {
    errors.push('Contact ID is required')
  }

  if (!data.principal_organization_id) {
    errors.push('Principal organization ID is required')
  }

  // Advocacy strength validation
  if (data.advocacy_strength !== undefined && data.advocacy_strength !== null) {
    if (data.advocacy_strength! < ADVOCACY_BUSINESS_RULES.MIN_ADVOCACY_STRENGTH || 
        data.advocacy_strength! > ADVOCACY_BUSINESS_RULES.MAX_ADVOCACY_STRENGTH) {
      errors.push(`Advocacy strength must be between ${ADVOCACY_BUSINESS_RULES.MIN_ADVOCACY_STRENGTH} and ${ADVOCACY_BUSINESS_RULES.MAX_ADVOCACY_STRENGTH}`)
    }
  }

  // Relationship type validation
  if (data.relationship_type && 
      !ADVOCACY_BUSINESS_RULES.VALID_RELATIONSHIP_TYPES.includes(data.relationship_type as RelationshipType)) {
    errors.push(`Invalid relationship type. Must be one of: ${ADVOCACY_BUSINESS_RULES.VALID_RELATIONSHIP_TYPES.join(', ')}`)
  }

  // Business logic validation with context
  if (contact && principal) {
    // Check if principal is actually a principal type organization
    if (principal.type !== 'principal') {
      errors.push('Organization must be of type "principal" to create advocacy relationship')
    }

    // Check maximum relationships per contact
    if (existingRelationships !== undefined && 
        existingRelationships >= ADVOCACY_BUSINESS_RULES.MAX_PRINCIPALS_PER_CONTACT) {
      errors.push(`Contact cannot have more than ${ADVOCACY_BUSINESS_RULES.MAX_PRINCIPALS_PER_CONTACT} principal relationships`)
    }

    // Validate advocacy strength against contact's decision authority
    if (data.advocacy_strength && contact.decision_authority) {
      const recommendations = ADVOCACY_BUSINESS_RULES.STRENGTH_RECOMMENDATIONS[contact.decision_authority as DecisionAuthorityRole]
      
      if (recommendations) {
        if (data.advocacy_strength < recommendations.min) {
          warnings.push(`Advocacy strength seems low for a ${contact.decision_authority}. Consider ${recommendations.min}+ for better effectiveness.`)
        }
        
        if (data.advocacy_strength > recommendations.max) {
          warnings.push(`Advocacy strength seems high for a ${contact.decision_authority}. Consider ${recommendations.max} or below.`)
        }
      }
    }

    // Check for potential conflicts
    if (data.relationship_type === 'competitive') {
      warnings.push('Competitive relationship detected. Ensure this is intentional and properly documented.')
    }

    // Purchase influence considerations
    if (contact.purchase_influence === 'Low' && data.advocacy_strength && data.advocacy_strength > 6) {
      warnings.push('High advocacy strength with low purchase influence may have limited impact.')
    }

    if (contact.purchase_influence === 'Unknown') {
      warnings.push('Contact purchase influence is unknown. Consider updating contact information for better advocacy assessment.')
    }
  }

  // Advocacy notes validation
  if (data.advocacy_notes && data.advocacy_notes.length > 500) {
    errors.push('Advocacy notes must be 500 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates advocacy relationship update data
 */
export function validateAdvocacyUpdate(
  updates: ContactPreferredPrincipalUpdate,
  currentData?: ContactPreferredPrincipalInsert,
  contact?: Contact
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Advocacy strength validation
  if (updates.advocacy_strength !== undefined && updates.advocacy_strength !== null) {
    if (updates.advocacy_strength! < ADVOCACY_BUSINESS_RULES.MIN_ADVOCACY_STRENGTH || 
        updates.advocacy_strength! > ADVOCACY_BUSINESS_RULES.MAX_ADVOCACY_STRENGTH) {
      errors.push(`Advocacy strength must be between ${ADVOCACY_BUSINESS_RULES.MIN_ADVOCACY_STRENGTH} and ${ADVOCACY_BUSINESS_RULES.MAX_ADVOCACY_STRENGTH}`)
    }

    // Check for significant changes
    if (currentData?.advocacy_strength && updates.advocacy_strength !== null &&
        Math.abs(updates.advocacy_strength! - currentData.advocacy_strength) >= 3) {
      warnings.push('Significant advocacy strength change detected. Consider documenting the reason in notes.')
    }
  }

  // Relationship type validation
  if (updates.relationship_type && 
      !ADVOCACY_BUSINESS_RULES.VALID_RELATIONSHIP_TYPES.includes(updates.relationship_type as RelationshipType)) {
    errors.push(`Invalid relationship type. Must be one of: ${ADVOCACY_BUSINESS_RULES.VALID_RELATIONSHIP_TYPES.join(', ')}`)
  }

  // Advocacy notes validation
  if (updates.advocacy_notes !== undefined) {
    if (updates.advocacy_notes && updates.advocacy_notes.length > 500) {
      errors.push('Advocacy notes must be 500 characters or less')
    }
  }

  // Business logic validation with contact context
  if (contact && updates.advocacy_strength) {
    const recommendations = contact.decision_authority ? 
      ADVOCACY_BUSINESS_RULES.STRENGTH_RECOMMENDATIONS[contact.decision_authority as DecisionAuthorityRole] : null

    if (recommendations) {
      if (updates.advocacy_strength < recommendations.min) {
        warnings.push(`Advocacy strength seems low for a ${contact.decision_authority}. Consider ${recommendations.min}+ for better effectiveness.`)
      }
      
      if (updates.advocacy_strength > recommendations.max) {
        warnings.push(`Advocacy strength seems high for a ${contact.decision_authority}. Consider ${recommendations.max} or below.`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Calculates recommended advocacy strength based on contact profile
 */
export function calculateRecommendedAdvocacyStrength(contact: Contact): {
  recommended: number
  min: number
  max: number
  reasoning: string[]
} {
  const reasoning: string[] = []
  let baseScore = 5 // Default middle value

  // Adjust based on decision authority
  if (contact.decision_authority) {
    const recommendations = ADVOCACY_BUSINESS_RULES.STRENGTH_RECOMMENDATIONS[contact.decision_authority as DecisionAuthorityRole]
    if (recommendations) {
      baseScore = recommendations.default
      reasoning.push(`Base score ${baseScore} for ${contact.decision_authority} role`)
      
      // Apply purchase influence modifier
      if (contact.purchase_influence) {
        const multiplier = ADVOCACY_BUSINESS_RULES.INFLUENCE_MULTIPLIERS[contact.purchase_influence as PurchaseInfluenceLevel]
        const adjustedScore = Math.round(baseScore * multiplier)
        
        if (adjustedScore !== baseScore) {
          reasoning.push(`Adjusted to ${adjustedScore} based on ${contact.purchase_influence} purchase influence`)
          baseScore = adjustedScore
        }
      }

      return {
        recommended: Math.max(recommendations.min, Math.min(recommendations.max, baseScore)),
        min: recommendations.min,
        max: recommendations.max,
        reasoning
      }
    }
  }

  // Fallback if no decision authority
  reasoning.push('Using default range due to missing decision authority information')
  return {
    recommended: baseScore,
    min: 1,
    max: 10,
    reasoning
  }
}

/**
 * Validates bulk advocacy strength updates
 */
export function validateBulkAdvocacyUpdate(
  updates: Array<{ id: string; advocacy_strength: number }>
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for empty updates
  if (updates.length === 0) {
    errors.push('No updates provided')
    return { isValid: false, errors, warnings }
  }

  // Validate each update
  updates.forEach((update, index) => {
    if (!update.id) {
      errors.push(`Update at index ${index}: ID is required`)
    }

    if (update.advocacy_strength < ADVOCACY_BUSINESS_RULES.MIN_ADVOCACY_STRENGTH || 
        update.advocacy_strength > ADVOCACY_BUSINESS_RULES.MAX_ADVOCACY_STRENGTH) {
      errors.push(`Update at index ${index}: Advocacy strength must be between ${ADVOCACY_BUSINESS_RULES.MIN_ADVOCACY_STRENGTH} and ${ADVOCACY_BUSINESS_RULES.MAX_ADVOCACY_STRENGTH}`)
    }
  })

  // Check for duplicates
  const ids = updates.map(update => update.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate relationship IDs found in bulk update')
  }

  // Warn about large bulk operations
  if (updates.length > 50) {
    warnings.push('Large bulk update detected. Consider processing in smaller batches for better performance.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates advocacy relationship business constraints
 */
export function validateAdvocacyBusinessRules(
  contactId: string,
  principalId: string,
  advocacyStrength: number,
  relationshipType: string,
  contact?: Contact,
  principal?: Organization
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate IDs
  if (!contactId || !principalId) {
    errors.push('Both contact and principal IDs are required')
  }

  // Validate entities exist and are appropriate
  if (contact && principal) {
    // Ensure principal is actually a principal
    if (principal.type !== 'principal') {
      errors.push('Organization must be a Principal to create advocacy relationship')
    }

    // Check if contact is from a customer/prospect organization
    if (contact.organization_id === principalId) {
      errors.push('Contact cannot advocate for their own organization')
    }

    // Validate contact is active
    if (contact.deleted_at) {
      errors.push('Cannot create advocacy relationship with deleted contact')
    }

    // Validate principal is active
    if (principal.deleted_at) {
      errors.push('Cannot create advocacy relationship with deleted principal')
    }

    if (principal.is_active === false) {
      warnings.push('Principal organization is marked as inactive')
    }
  }

  // Validate advocacy strength makes sense for relationship type
  if (relationshipType === 'competitive' && advocacyStrength > 3) {
    warnings.push('High advocacy strength unusual for competitive relationship')
  }

  if (relationshipType === 'historical' && advocacyStrength > 6) {
    warnings.push('Consider if high advocacy strength is still relevant for historical relationship')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Utility function to format validation messages for UI display
 */
export function formatValidationMessages(result: ValidationResult): {
  hasIssues: boolean
  errorMessage?: string
  warningMessage?: string
  allMessages: string[]
} {
  const allMessages = [...result.errors, ...result.warnings]
  
  return {
    hasIssues: !result.isValid || result.warnings.length > 0,
    errorMessage: result.errors.length > 0 ? result.errors.join('; ') : undefined,
    warningMessage: result.warnings.length > 0 ? result.warnings.join('; ') : undefined,
    allMessages
  }
}

/**
 * Helper function to get validation summary for UI
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return 'All validations passed'
  }
  
  if (!result.isValid) {
    return `${result.errors.length} error(s) found`
  }
  
  return `${result.warnings.length} warning(s) found`
}