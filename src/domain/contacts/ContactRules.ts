import type {
  ContactDomain,
  ContactRole,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole,
  ContactRelationshipValidation,
  ContactDisplayInfo,
  ContactInfluenceMetrics,
  ContactValidationContext,
} from './ContactTypes'
import {
  CONTACT_ROLES,
  PURCHASE_INFLUENCE_LEVELS,
  DECISION_AUTHORITY_ROLES,
} from './ContactTypes'
import { BusinessRuleViolation, ValidationRules } from '../shared/BusinessRules'

/**
 * Contact business rules and validation logic
 * Extracted from existing contact validation and business logic
 */
export class ContactRules {
  /**
   * Authority hierarchy for decision making
   * Higher values indicate more decision-making power
   */
  private static readonly AUTHORITY_HIERARCHY: Record<DecisionAuthorityRole, number> = {
    'Decision Maker': 4,
    Influencer: 3,
    'End User': 2,
    Gatekeeper: 1,
  }

  /**
   * Influence score mapping
   */
  private static readonly INFLUENCE_SCORES: Record<PurchaseInfluenceLevel, number> = {
    High: 4,
    Medium: 3,
    Low: 2,
    Unknown: 1,
  }

  /**
   * Role priority for contact display
   */
  private static readonly ROLE_PRIORITY: Record<ContactRole, number> = {
    decision_maker: 6,
    buyer: 5,
    champion: 4,
    influencer: 3,
    end_user: 2,
    gatekeeper: 1,
  }

  /**
   * Validate contact data
   */
  static validateContactData(
    data: Partial<ContactDomain>,
    context?: ContactValidationContext
  ): void {
    // Required fields
    if (!ValidationRules.required.string(data.first_name)) {
      throw new BusinessRuleViolation('REQUIRED_FIRST_NAME', 'First name is required')
    }

    if (!ValidationRules.required.string(data.last_name)) {
      throw new BusinessRuleViolation('REQUIRED_LAST_NAME', 'Last name is required')
    }

    // Name length validation
    if (data.first_name && data.first_name.length > 100) {
      throw new BusinessRuleViolation(
        'FIRST_NAME_TOO_LONG',
        'First name must be 100 characters or less'
      )
    }

    if (data.last_name && data.last_name.length > 100) {
      throw new BusinessRuleViolation(
        'LAST_NAME_TOO_LONG',
        'Last name must be 100 characters or less'
      )
    }

    // Email validation
    if (data.email && data.email.trim() !== '' && !ValidationRules.email.validate(data.email)) {
      throw new BusinessRuleViolation('INVALID_EMAIL', 'Invalid email address format')
    }

    // Phone validation
    if (data.phone && data.phone.trim() !== '' && !ValidationRules.phone.validate(data.phone)) {
      throw new BusinessRuleViolation('INVALID_PHONE', 'Invalid phone number format')
    }

    if (
      data.mobile_phone &&
      data.mobile_phone.trim() !== '' &&
      !ValidationRules.phone.validate(data.mobile_phone)
    ) {
      throw new BusinessRuleViolation('INVALID_MOBILE_PHONE', 'Invalid mobile phone number format')
    }

    // Authority and influence validation
    if (data.purchase_influence && !this.isValidPurchaseInfluence(data.purchase_influence)) {
      throw new BusinessRuleViolation(
        'INVALID_PURCHASE_INFLUENCE',
        'Invalid purchase influence level'
      )
    }

    if (data.decision_authority && !this.isValidDecisionAuthority(data.decision_authority)) {
      throw new BusinessRuleViolation(
        'INVALID_DECISION_AUTHORITY',
        'Invalid decision authority role'
      )
    }

    if (data.role && !this.isValidRole(data.role)) {
      throw new BusinessRuleViolation('INVALID_ROLE', 'Invalid contact role')
    }

    // Primary contact validation
    if (context?.enforcePrimaryContactRule && data.is_primary_contact && context.existingContacts) {
      this.validatePrimaryContactRule(data, context.existingContacts, context.organizationId)
    }

    // Field length validations
    if (data.title && data.title.length > 100) {
      throw new BusinessRuleViolation('TITLE_TOO_LONG', 'Title must be 100 characters or less')
    }

    if (data.department && data.department.length > 100) {
      throw new BusinessRuleViolation(
        'DEPARTMENT_TOO_LONG',
        'Department must be 100 characters or less'
      )
    }

    if (data.notes && data.notes.length > 500) {
      throw new BusinessRuleViolation('NOTES_TOO_LONG', 'Notes must be 500 characters or less')
    }
  }

  /**
   * Validate primary contact rule - only one primary contact per organization
   */
  private static validatePrimaryContactRule(
    data: Partial<ContactDomain>,
    existingContacts: ContactDomain[],
    organizationId?: string | null
  ): void {
    if (!data.is_primary_contact || !organizationId) return

    const existingPrimary = existingContacts.find(
      (contact) =>
        contact.organization_id === organizationId &&
        contact.is_primary_contact &&
        contact.id !== data.id // Exclude self when updating
    )

    if (existingPrimary) {
      throw new BusinessRuleViolation(
        'DUPLICATE_PRIMARY_CONTACT',
        `Organization already has a primary contact: ${existingPrimary.first_name} ${existingPrimary.last_name}`
      )
    }
  }

  /**
   * Validate contact relationships and data consistency
   */
  static validateContactRelationships(
    contact: ContactDomain,
    context?: ContactValidationContext
  ): ContactRelationshipValidation {
    const issues: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Authority alignment check
    if (
      this.isHighAuthorityRole(contact.decision_authority) &&
      contact.purchase_influence === 'Low'
    ) {
      warnings.push('High decision authority contact has low purchase influence - verify accuracy')
    }

    if (contact.decision_authority === 'Gatekeeper' && contact.purchase_influence === 'High') {
      warnings.push('Gatekeeper role typically has lower purchase influence - verify accuracy')
    }

    // Role consistency check
    if (contact.role === 'decision_maker' && contact.decision_authority !== 'Decision Maker') {
      warnings.push('Decision maker role should align with decision authority')
    }

    // Contact completeness check
    if (!contact.email && !contact.phone && !contact.mobile_phone) {
      issues.push('Contact has no contact information (email, phone, or mobile)')
    }

    if (!contact.title && !contact.department) {
      warnings.push('Missing title and department information')
    }

    // Primary contact validation
    if (contact.is_primary_contact && contact.decision_authority === 'Gatekeeper') {
      warnings.push('Primary contact is typically a decision maker or influencer, not a gatekeeper')
    }

    // Influence and authority alignment
    const authorityScore = this.getAuthorityScore(contact.decision_authority)
    const influenceScore = this.getInfluenceScore(contact.purchase_influence)

    if (authorityScore >= 3 && influenceScore <= 2) {
      warnings.push('High authority contact may have higher purchase influence than indicated')
    }

    // Suggestions based on contact profile
    if (contact.role === 'champion' && contact.purchase_influence !== 'High') {
      suggestions.push('Champions typically have high purchase influence - consider updating')
    }

    if (contact.decision_authority === 'Decision Maker' && !contact.is_primary_contact) {
      suggestions.push('Decision makers are often primary contacts - consider marking as primary')
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      suggestions,
    }
  }

  /**
   * Calculate engagement score for contact
   */
  static calculateEngagementScore(
    contact: ContactDomain,
    interactionCount: number,
    lastInteractionDate: string | null,
    daysSinceLastInteraction?: number
  ): number {
    let baseScore = 0

    // Authority weight (0-40 points)
    baseScore += this.getAuthorityScore(contact.decision_authority) * 10

    // Influence weight (0-30 points)
    baseScore += this.getInfluenceScore(contact.purchase_influence) * 7.5

    // Primary contact bonus (0-10 points)
    if (contact.is_primary_contact) {
      baseScore += 10
    }

    // Interaction frequency score (0-20 points)
    if (interactionCount > 0) {
      const interactionScore = Math.min(interactionCount * 2, 20)
      baseScore += interactionScore
    }

    // Recency penalty (reduce score based on days since last interaction)
    if (daysSinceLastInteraction !== undefined && daysSinceLastInteraction > 0) {
      const recencyPenalty = Math.min(daysSinceLastInteraction * 0.5, 30)
      baseScore = Math.max(baseScore - recencyPenalty, 0)
    }

    return Math.round(baseScore)
  }

  /**
   * Generate display information for contact
   */
  static generateDisplayInfo(contact: ContactDomain): ContactDisplayInfo {
    const fullName = `${contact.first_name} ${contact.last_name}`.trim()

    let displayTitle = contact.title || ''
    if (contact.department && displayTitle) {
      displayTitle += ` - ${contact.department}`
    } else if (contact.department) {
      displayTitle = contact.department
    }

    const displayRole = this.getRoleDisplayName(contact.role) || displayTitle || 'Contact'

    const primaryIdentifier = contact.email || contact.phone || contact.mobile_phone || fullName

    return {
      fullName,
      displayTitle,
      displayRole,
      primaryIdentifier,
    }
  }

  /**
   * Calculate influence metrics for contact
   */
  static calculateInfluenceMetrics(
    contact: ContactDomain,
    networkConnections: number = 0,
    opportunityInvolvement: number = 0,
    communicationFrequency: number = 0
  ): ContactInfluenceMetrics {
    const decisionWeight = this.getAuthorityScore(contact.decision_authority) * 25
    const purchaseInfluenceScore = this.getInfluenceScore(contact.purchase_influence) * 25

    return {
      decisionWeight,
      purchaseInfluenceScore,
      networkConnections,
      opportunityInvolvement,
      communicationFrequency,
    }
  }

  /**
   * Get default values for new contacts
   */
  static getDefaults(): Partial<ContactDomain> {
    return {
      purchase_influence: 'Unknown',
      decision_authority: 'Gatekeeper',
      is_primary_contact: false,
    }
  }

  /**
   * Check if purchase influence level is valid
   */
  static isValidPurchaseInfluence(influence: string): influence is PurchaseInfluenceLevel {
    return PURCHASE_INFLUENCE_LEVELS.includes(influence as PurchaseInfluenceLevel)
  }

  /**
   * Check if decision authority is valid
   */
  static isValidDecisionAuthority(authority: string): authority is DecisionAuthorityRole {
    return DECISION_AUTHORITY_ROLES.includes(authority as DecisionAuthorityRole)
  }

  /**
   * Check if contact role is valid
   */
  static isValidRole(role: string): role is ContactRole {
    return CONTACT_ROLES.includes(role as ContactRole)
  }

  /**
   * Check if contact has high authority
   */
  static isHighAuthorityRole(authority: DecisionAuthorityRole): boolean {
    return this.AUTHORITY_HIERARCHY[authority] >= 3
  }

  /**
   * Check if contact has high influence
   */
  static isHighInfluence(influence: PurchaseInfluenceLevel): boolean {
    return this.INFLUENCE_SCORES[influence] >= 3
  }

  /**
   * Get authority score for contact
   */
  static getAuthorityScore(authority: DecisionAuthorityRole): number {
    return this.AUTHORITY_HIERARCHY[authority]
  }

  /**
   * Get influence score for contact
   */
  static getInfluenceScore(influence: PurchaseInfluenceLevel): number {
    return this.INFLUENCE_SCORES[influence]
  }

  /**
   * Get role priority score
   */
  static getRolePriority(role: ContactRole | null): number {
    return role ? this.ROLE_PRIORITY[role] : 0
  }

  /**
   * Get display name for contact role
   */
  static getRoleDisplayName(role: ContactRole | null): string | null {
    if (!role) return null

    const roleMap: Record<ContactRole, string> = {
      decision_maker: 'Decision Maker',
      influencer: 'Influencer',
      buyer: 'Buyer',
      end_user: 'End User',
      gatekeeper: 'Gatekeeper',
      champion: 'Champion',
    }

    return roleMap[role]
  }

  /**
   * Determine if contact needs follow-up
   */
  static needsFollowUp(
    contact: ContactDomain,
    daysSinceLastInteraction: number,
    interactionCount: number
  ): boolean {
    // High priority contacts need more frequent follow-up
    if (
      this.isHighAuthorityRole(contact.decision_authority) ||
      this.isHighInfluence(contact.purchase_influence)
    ) {
      return daysSinceLastInteraction > 14
    }

    // Medium priority contacts
    if (contact.is_primary_contact || interactionCount > 3) {
      return daysSinceLastInteraction > 21
    }

    // Standard contacts
    return daysSinceLastInteraction > 30
  }

  /**
   * Assess contact value for prioritization
   */
  static isHighValueContact(contact: ContactDomain): boolean {
    const authorityScore = this.getAuthorityScore(contact.decision_authority)
    const influenceScore = this.getInfluenceScore(contact.purchase_influence)

    // High value if high authority or high influence, or if primary contact with medium+ scores
    return (
      authorityScore >= 3 ||
      influenceScore >= 3 ||
      (contact.is_primary_contact && (authorityScore >= 2 || influenceScore >= 2))
    )
  }
}
