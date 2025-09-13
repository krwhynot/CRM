import type {
  OrganizationDomain,
  OrganizationType,
  OrganizationPriority,
  OrganizationRelationshipType,
  OrganizationRelationshipMetrics,
  OrganizationBusinessValidation,
  OrganizationSegmentAnalysis,
  OrganizationPerformance,
  OrganizationValidationContext,
  OrganizationTerritory,
  ORGANIZATION_TYPES,
  ORGANIZATION_PRIORITIES,
  FOOD_SERVICE_SEGMENTS,
} from './OrganizationTypes'
import { BusinessRuleViolation, ValidationRules } from '../shared/BusinessRules'

/**
 * Organization business rules and validation logic
 * Extracted from existing organization validation and business logic
 */
export class OrganizationRules {
  /**
   * Organization type business logic mapping
   */
  private static readonly TYPE_BUSINESS_LOGIC: Record<
    OrganizationType,
    {
      canHaveOpportunities: boolean
      canBePrincipal: boolean
      canBeDistributor: boolean
      requiresManager: boolean
      defaultPriority: OrganizationPriority
    }
  > = {
    customer: {
      canHaveOpportunities: true,
      canBePrincipal: false,
      canBeDistributor: false,
      requiresManager: true,
      defaultPriority: 'B',
    },
    prospect: {
      canHaveOpportunities: true,
      canBePrincipal: false,
      canBeDistributor: false,
      requiresManager: true,
      defaultPriority: 'C',
    },
    distributor: {
      canHaveOpportunities: false,
      canBePrincipal: false,
      canBeDistributor: true,
      requiresManager: true,
      defaultPriority: 'A',
    },
    principal: {
      canHaveOpportunities: false,
      canBePrincipal: true,
      canBeDistributor: false,
      requiresManager: false,
      defaultPriority: 'A',
    },
    supplier: {
      canHaveOpportunities: false,
      canBePrincipal: false,
      canBeDistributor: false,
      requiresManager: false,
      defaultPriority: 'C',
    },
    vendor: {
      canHaveOpportunities: false,
      canBePrincipal: false,
      canBeDistributor: false,
      requiresManager: false,
      defaultPriority: 'C',
    },
  }

  /**
   * Priority score mapping for calculations
   */
  private static readonly PRIORITY_SCORES: Record<OrganizationPriority, number> = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
  }

  /**
   * Segment importance mapping
   */
  private static readonly SEGMENT_IMPORTANCE: Record<string, number> = {
    Healthcare: 4,
    Education: 4,
    'Fine Dining': 3,
    'Corporate Catering': 3,
    'Hotel & Resort': 3,
    'Fast Casual': 2,
    'Fast Food': 2,
    'Entertainment Venue': 2,
    Government: 2,
    'Retail Food Service': 1,
    'Senior Living': 1,
    Other: 1,
  }

  /**
   * Validate organization data
   */
  static validateOrganizationData(
    data: Partial<OrganizationDomain>,
    context?: OrganizationValidationContext
  ): void {
    // Required fields
    if (!ValidationRules.required.string(data.name)) {
      throw new BusinessRuleViolation('REQUIRED_NAME', 'Organization name is required')
    }

    if (!data.type) {
      throw new BusinessRuleViolation('REQUIRED_TYPE', 'Organization type is required')
    }

    if (!ValidationRules.required.string(data.segment)) {
      throw new BusinessRuleViolation('REQUIRED_SEGMENT', 'Organization segment is required')
    }

    // Name validation
    if (data.name && data.name.length > 255) {
      throw new BusinessRuleViolation(
        'NAME_TOO_LONG',
        'Organization name must be 255 characters or less'
      )
    }

    // Name uniqueness check if context provided
    if (context?.enforceUniqueNameRule && context.existingOrganizations && data.name) {
      const duplicate = context.existingOrganizations.find(
        (org) => org.name.toLowerCase() === data.name!.toLowerCase() && org.id !== data.id
      )
      if (duplicate) {
        throw new BusinessRuleViolation(
          'DUPLICATE_NAME',
          `Organization name "${data.name}" already exists`
        )
      }
    }

    // Type validation
    if (data.type && !this.isValidType(data.type)) {
      throw new BusinessRuleViolation('INVALID_TYPE', 'Invalid organization type')
    }

    // Priority validation
    if (data.priority && !this.isValidPriority(data.priority)) {
      throw new BusinessRuleViolation('INVALID_PRIORITY', 'Invalid priority level')
    }

    // Email validation
    if (data.email && data.email.trim() !== '' && !ValidationRules.email.validate(data.email)) {
      throw new BusinessRuleViolation('INVALID_EMAIL', 'Invalid email address format')
    }

    // Phone validation
    if (data.phone && data.phone.trim() !== '' && !ValidationRules.phone.validate(data.phone)) {
      throw new BusinessRuleViolation('INVALID_PHONE', 'Invalid phone number format')
    }

    // Business logic validation
    if (data.type) {
      const businessLogic = this.TYPE_BUSINESS_LOGIC[data.type]

      // Principal flag consistency
      if (data.is_principal && !businessLogic.canBePrincipal) {
        throw new BusinessRuleViolation(
          'INVALID_PRINCIPAL_FLAG',
          `Organization type "${data.type}" cannot be marked as principal`
        )
      }

      // Distributor flag consistency
      if (data.is_distributor && !businessLogic.canBeDistributor) {
        throw new BusinessRuleViolation(
          'INVALID_DISTRIBUTOR_FLAG',
          `Organization type "${data.type}" cannot be marked as distributor`
        )
      }
    }

    // Address validation if complete address required
    if (context?.requireCompleteAddress) {
      if (!data.address_line_1 || !data.city || !data.state_province || !data.postal_code) {
        throw new BusinessRuleViolation(
          'INCOMPLETE_ADDRESS',
          'Complete address is required (address, city, state/province, postal code)'
        )
      }
    }

    // Field length validations
    if (data.description && data.description.length > 500) {
      throw new BusinessRuleViolation(
        'DESCRIPTION_TOO_LONG',
        'Description must be 500 characters or less'
      )
    }

    if (data.notes && data.notes.length > 500) {
      throw new BusinessRuleViolation('NOTES_TOO_LONG', 'Notes must be 500 characters or less')
    }

    if (data.segment && data.segment.length > 100) {
      throw new BusinessRuleViolation('SEGMENT_TOO_LONG', 'Segment must be 100 characters or less')
    }
  }

  /**
   * Validate organization business relationships and data consistency
   */
  static validateOrganizationBusiness(
    organization: OrganizationDomain,
    context?: OrganizationValidationContext
  ): OrganizationBusinessValidation {
    const issues: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const businessLogic = this.TYPE_BUSINESS_LOGIC[organization.type]

    // Priority alignment with type
    const recommendedPriority = businessLogic.defaultPriority
    if (organization.priority !== recommendedPriority) {
      if (organization.type === 'customer' && organization.priority === 'D') {
        warnings.push('Customer organizations typically should not have D priority')
      }
      if (
        (organization.type === 'distributor' || organization.type === 'principal') &&
        organization.priority === 'C'
      ) {
        warnings.push('Distributor and Principal organizations typically have A or B priority')
      }
    }

    // Segment alignment
    if (context?.validateSegmentAlignment) {
      const segmentImportance = this.SEGMENT_IMPORTANCE[organization.segment] || 1
      const priorityScore = this.PRIORITY_SCORES[organization.priority]

      if (segmentImportance >= 3 && priorityScore <= 2) {
        warnings.push('High-importance segment organization has low priority - verify accuracy')
      }
    }

    // Contact information completeness
    if (!organization.email && !organization.phone) {
      warnings.push('Organization has no contact information (email or phone)')
    }

    // Address completeness for key accounts
    if (organization.priority === 'A' && (!organization.address_line_1 || !organization.city)) {
      warnings.push('High-priority organization missing address information')
    }

    // Type-specific validations
    if (organization.type === 'customer' && !organization.segment) {
      issues.push('Customer organizations must have a defined segment')
    }

    if (organization.type === 'principal' && !organization.industry) {
      suggestions.push('Principal organizations should specify their industry')
    }

    if (organization.type === 'distributor' && !organization.website) {
      suggestions.push('Distributor organizations should have website information')
    }

    // Flag consistency checks
    if (organization.is_principal && organization.type !== 'principal') {
      issues.push('Organization is flagged as principal but type is not "principal"')
    }

    if (organization.is_distributor && organization.type !== 'distributor') {
      issues.push('Organization is flagged as distributor but type is not "distributor"')
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      suggestions,
    }
  }

  /**
   * Calculate relationship score for organization
   */
  static calculateRelationshipScore(
    organization: OrganizationDomain,
    contactCount: number,
    opportunityCount: number,
    interactionCount: number,
    annualValue: number,
    daysSinceLastInteraction?: number
  ): number {
    let baseScore = 0

    // Priority weight (0-40 points)
    baseScore += this.PRIORITY_SCORES[organization.priority] * 10

    // Type weight (0-30 points)
    const typeWeights: Record<OrganizationType, number> = {
      customer: 30,
      prospect: 25,
      distributor: 20,
      principal: 15,
      supplier: 10,
      vendor: 5,
    }
    baseScore += typeWeights[organization.type] || 0

    // Contact engagement (0-20 points)
    baseScore += Math.min(contactCount * 4, 20)

    // Opportunity activity (0-20 points)
    baseScore += Math.min(opportunityCount * 5, 20)

    // Interaction frequency (0-15 points)
    baseScore += Math.min(interactionCount * 1.5, 15)

    // Annual value bonus (0-25 points)
    if (annualValue > 0) {
      const valueScore = Math.log10(annualValue / 1000) * 5 // Logarithmic scale
      baseScore += Math.min(valueScore, 25)
    }

    // Recency penalty
    if (daysSinceLastInteraction !== undefined && daysSinceLastInteraction > 0) {
      const recencyPenalty = Math.min(daysSinceLastInteraction * 0.3, 30)
      baseScore = Math.max(baseScore - recencyPenalty, 0)
    }

    return Math.round(baseScore)
  }

  /**
   * Analyze organization segment fit and opportunity
   */
  static analyzeSegmentation(
    organization: OrganizationDomain,
    marketData?: {
      segmentGrowthRate: number
      competitorCount: number
      marketSize: number
    }
  ): OrganizationSegmentAnalysis {
    const primarySegment = organization.segment
    const segmentImportance = this.SEGMENT_IMPORTANCE[primarySegment] || 1

    // Calculate segment fit score
    let segmentFit = segmentImportance * 20 // Base fit from segment importance

    // Adjust based on organization type
    if (organization.type === 'customer' || organization.type === 'prospect') {
      segmentFit += 20 // Good fit for revenue-generating types
    }

    // Priority adjustment
    segmentFit += this.PRIORITY_SCORES[organization.priority] * 5

    // Market opportunity assessment
    let marketOpportunity: 'high' | 'medium' | 'low' = 'medium'
    if (marketData) {
      if (marketData.segmentGrowthRate > 10 && marketData.marketSize > 1000000) {
        marketOpportunity = 'high'
      } else if (marketData.segmentGrowthRate < 5 || marketData.marketSize < 100000) {
        marketOpportunity = 'low'
      }
    } else {
      // Default assessment based on segment
      if (['Healthcare', 'Education', 'Corporate Catering'].includes(primarySegment)) {
        marketOpportunity = 'high'
      } else if (['Fine Dining', 'Hotel & Resort'].includes(primarySegment)) {
        marketOpportunity = 'medium'
      } else {
        marketOpportunity = 'low'
      }
    }

    // Competitive density
    let competitiveDensity: 'high' | 'medium' | 'low' = 'medium'
    if (marketData?.competitorCount) {
      if (marketData.competitorCount > 10) competitiveDensity = 'high'
      else if (marketData.competitorCount < 5) competitiveDensity = 'low'
    }

    // Growth potential calculation
    let growthPotential = segmentImportance * 15
    if (marketOpportunity === 'high') growthPotential += 30
    else if (marketOpportunity === 'low') growthPotential -= 20

    if (competitiveDensity === 'low') growthPotential += 20
    else if (competitiveDensity === 'high') growthPotential -= 15

    growthPotential = Math.max(0, Math.min(100, growthPotential))

    return {
      primarySegment,
      subSegments: [primarySegment], // Could be enhanced with sub-categorization
      segmentFit: Math.max(0, Math.min(100, segmentFit)),
      marketOpportunity,
      competitiveDensity,
      growthPotential,
    }
  }

  /**
   * Calculate organization performance metrics
   */
  static calculatePerformanceMetrics(
    organization: OrganizationDomain,
    opportunityData: {
      totalValue: number
      wonValue: number
      lostValue: number
      activeCount: number
      averageCycleLength: number
    },
    lastPurchaseDate?: string | null
  ): OrganizationPerformance {
    const { totalValue, wonValue, lostValue, activeCount, averageCycleLength } = opportunityData

    const closedValue = wonValue + lostValue
    const winRate = closedValue > 0 ? (wonValue / closedValue) * 100 : 0
    const averageDealSize = activeCount > 0 ? totalValue / activeCount : 0

    // Customer Lifetime Value calculation (simplified)
    const annualValue = wonValue // Assuming wonValue represents annual revenue
    const averageCustomerLifespan = 5 // years (could be calculated from historical data)
    const customerLifetimeValue = annualValue * averageCustomerLifespan

    // Churn risk assessment
    let churnRisk: 'high' | 'medium' | 'low' = 'low'
    const daysSinceLastPurchase = lastPurchaseDate
      ? Math.floor(
          (new Date().getTime() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : null

    if (daysSinceLastPurchase) {
      if (daysSinceLastPurchase > 180) churnRisk = 'high'
      else if (daysSinceLastPurchase > 90) churnRisk = 'medium'
    }

    if (winRate < 20) churnRisk = 'high'
    else if (winRate < 40) churnRisk = 'medium'

    return {
      organizationId: organization.id,
      totalOpportunityValue: totalValue,
      wonOpportunityValue: wonValue,
      lostOpportunityValue: lostValue,
      activeOpportunityCount: activeCount,
      winRate,
      averageDealSize,
      salesCycleLength: averageCycleLength,
      lastPurchaseDate,
      customerLifetimeValue,
      churnRisk,
    }
  }

  /**
   * Get default values for new organizations
   */
  static getDefaults(type?: OrganizationType): Partial<OrganizationDomain> {
    const businessLogic = type ? this.TYPE_BUSINESS_LOGIC[type] : null

    return {
      priority: businessLogic?.defaultPriority || 'B',
      is_principal: businessLogic?.canBePrincipal || false,
      is_distributor: businessLogic?.canBeDistributor || false,
      segment: 'Other', // Default segment
    }
  }

  /**
   * Check if organization type is valid
   */
  static isValidType(type: string): type is OrganizationType {
    return ORGANIZATION_TYPES.includes(type as OrganizationType)
  }

  /**
   * Check if priority is valid
   */
  static isValidPriority(priority: string): priority is OrganizationPriority {
    return ORGANIZATION_PRIORITIES.includes(priority as OrganizationPriority)
  }

  /**
   * Check if organization can have opportunities
   */
  static canHaveOpportunities(type: OrganizationType): boolean {
    return this.TYPE_BUSINESS_LOGIC[type].canHaveOpportunities
  }

  /**
   * Check if organization can be principal
   */
  static canBePrincipal(type: OrganizationType): boolean {
    return this.TYPE_BUSINESS_LOGIC[type].canBePrincipal
  }

  /**
   * Check if organization can be distributor
   */
  static canBeDistributor(type: OrganizationType): boolean {
    return this.TYPE_BUSINESS_LOGIC[type].canBeDistributor
  }

  /**
   * Check if organization requires manager
   */
  static requiresManager(type: OrganizationType): boolean {
    return this.TYPE_BUSINESS_LOGIC[type].requiresManager
  }

  /**
   * Get priority score for calculations
   */
  static getPriorityScore(priority: OrganizationPriority): number {
    return this.PRIORITY_SCORES[priority]
  }

  /**
   * Get segment importance score
   */
  static getSegmentImportance(segment: string): number {
    return this.SEGMENT_IMPORTANCE[segment] || 1
  }

  /**
   * Check if organization is high priority
   */
  static isHighPriority(organization: OrganizationDomain): boolean {
    return organization.priority === 'A' || organization.priority === 'B'
  }

  /**
   * Check if organization is key account
   */
  static isKeyAccount(organization: OrganizationDomain): boolean {
    return (
      organization.priority === 'A' &&
      (organization.type === 'customer' || organization.type === 'distributor')
    )
  }

  /**
   * Determine territory assignment tier
   */
  static getTerritoryTier(organization: OrganizationDomain): 'tier_1' | 'tier_2' | 'tier_3' {
    if (organization.priority === 'A') return 'tier_1'
    if (organization.priority === 'B') return 'tier_2'
    return 'tier_3'
  }

  /**
   * Get recommended contact frequency
   */
  static getRecommendedContactFrequency(
    organization: OrganizationDomain
  ): 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' {
    if (this.isKeyAccount(organization)) return 'weekly'
    if (organization.priority === 'B') return 'bi_weekly'
    if (organization.priority === 'C') return 'monthly'
    return 'quarterly'
  }

  /**
   * Validate organization name uniqueness
   */
  static validateNameUniqueness(
    name: string,
    existingOrganizations: OrganizationDomain[],
    excludeId?: string
  ): boolean {
    return !existingOrganizations.some(
      (org) => org.name.toLowerCase() === name.toLowerCase() && org.id !== excludeId
    )
  }
}
