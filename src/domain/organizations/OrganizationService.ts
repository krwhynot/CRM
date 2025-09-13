import { DomainService, Result } from '../shared/BaseEntity'
import { OrganizationRules } from './OrganizationRules'
import type {
  OrganizationDomain,
  CreateOrganizationData,
  UpdateOrganizationData,
  OrganizationType,
  OrganizationRelationshipMetrics,
  OrganizationBusinessValidation,
  OrganizationSegmentAnalysis,
  OrganizationPerformance,
  OrganizationValidationContext,
  OrganizationTerritory,
  OrganizationContactSummary,
} from './OrganizationTypes'
import type { BaseRepository } from '../shared/BaseEntity'

/**
 * Organization domain service
 * Contains all business logic for organization management
 */
export class OrganizationService extends DomainService {
  constructor(private repository: BaseRepository<OrganizationDomain>) {
    super()
  }

  /**
   * Create a new organization with business rule validation
   */
  async create(
    data: CreateOrganizationData,
    context?: OrganizationValidationContext
  ): Promise<Result<OrganizationDomain>> {
    try {
      // Apply defaults based on organization type
      const organizationData: Partial<OrganizationDomain> = {
        ...data,
        ...OrganizationRules.getDefaults(data.type),
        ...data, // Override defaults with provided data
      }

      // Load existing organizations for validation if needed
      let validationContext = context
      if (!validationContext?.existingOrganizations) {
        const existingOrganizations = await this.repository.findAll()
        validationContext = {
          ...context,
          existingOrganizations,
          enforceUniqueNameRule: true,
        }
      }

      // Validate business rules
      OrganizationRules.validateOrganizationData(organizationData, validationContext)

      // Auto-set business flags based on type
      if (data.type && OrganizationRules.canBePrincipal(data.type)) {
        organizationData.is_principal = true
      }
      if (data.type && OrganizationRules.canBeDistributor(data.type)) {
        organizationData.is_distributor = true
      }

      // Create the organization
      const organization = await this.repository.create(organizationData as any)

      // Emit domain event
      this.emit('OrganizationCreated', {
        organizationId: organization.id,
        type: organization.type,
        priority: organization.priority,
        segment: organization.segment,
        isPrincipal: organization.is_principal,
        isDistributor: organization.is_distributor,
      })

      return Result.success(organization)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Update organization with business rule validation
   */
  async update(
    organizationId: string,
    data: UpdateOrganizationData,
    context?: OrganizationValidationContext
  ): Promise<Result<OrganizationDomain>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      // Merge update data
      const updatedData = { ...organization, ...data }

      // Load existing organizations for validation if needed
      let validationContext = context
      if (!validationContext?.existingOrganizations) {
        const existingOrganizations = await this.repository.findAll()
        validationContext = {
          ...context,
          existingOrganizations,
          enforceUniqueNameRule: true,
        }
      }

      // Validate business rules
      OrganizationRules.validateOrganizationData(updatedData, validationContext)

      // Track important changes
      const typeChanged = data.type && data.type !== organization.type
      const priorityChanged = data.priority && data.priority !== organization.priority
      const segmentChanged = data.segment && data.segment !== organization.segment

      // Auto-update business flags if type changed
      if (typeChanged && data.type) {
        updatedData.is_principal = OrganizationRules.canBePrincipal(data.type)
        updatedData.is_distributor = OrganizationRules.canBeDistributor(data.type)
      }

      const updatedOrganization = await this.repository.update(updatedData as OrganizationDomain)

      // Emit domain events for significant changes
      if (typeChanged) {
        this.emit('OrganizationTypeChanged', {
          organizationId,
          oldType: organization.type,
          newType: data.type,
          affectsOpportunities:
            OrganizationRules.canHaveOpportunities(data.type!) !==
            OrganizationRules.canHaveOpportunities(organization.type),
        })
      }

      if (priorityChanged) {
        this.emit('OrganizationPriorityChanged', {
          organizationId,
          oldPriority: organization.priority,
          newPriority: data.priority,
          tierChanged:
            OrganizationRules.getTerritoryTier(updatedOrganization) !==
            OrganizationRules.getTerritoryTier(organization),
        })
      }

      if (segmentChanged) {
        this.emit('OrganizationSegmentChanged', {
          organizationId,
          oldSegment: organization.segment,
          newSegment: data.segment,
        })
      }

      return Result.success(updatedOrganization)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Change organization priority with validation
   */
  async changePriority(
    organizationId: string,
    newPriority: string,
    reason?: string
  ): Promise<Result<OrganizationDomain>> {
    try {
      if (!OrganizationRules.isValidPriority(newPriority)) {
        return Result.failure('Invalid priority level')
      }

      const result = await this.update(organizationId, { priority: newPriority })

      if (result.isSuccess) {
        this.emit('OrganizationPriorityUpdated', {
          organizationId,
          newPriority,
          reason,
          updatedAt: new Date(),
        })
      }

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Soft delete organization
   */
  async softDelete(organizationId: string): Promise<Result<void>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      await this.repository.softDelete(organizationId)

      // Emit domain event
      this.emit('OrganizationDeleted', {
        organizationId,
        name: organization.name,
        type: organization.type,
        hadRelationships: true, // Could be enhanced to check actual relationships
      })

      return Result.success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Calculate relationship metrics for organization
   */
  async calculateRelationshipMetrics(
    organizationId: string,
    contactCount: number,
    opportunityCount: number,
    interactionCount: number,
    annualValue: number,
    potentialValue: number = 0,
    lastInteractionDate: string | null = null,
    daysSinceLastInteraction?: number
  ): Promise<Result<OrganizationRelationshipMetrics>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      const relationshipScore = OrganizationRules.calculateRelationshipScore(
        organization,
        contactCount,
        opportunityCount,
        interactionCount,
        annualValue,
        daysSinceLastInteraction
      )

      let engagementLevel: 'high' | 'medium' | 'low' = 'low'
      if (relationshipScore >= 80) engagementLevel = 'high'
      else if (relationshipScore >= 50) engagementLevel = 'medium'

      // Determine relationship type based on organization characteristics
      let relationshipType:
        | 'direct_customer'
        | 'indirect_customer'
        | 'key_account'
        | 'strategic_partner'
        | 'preferred_vendor'
        | 'distributor_partner'
        | 'principal_partner' = 'direct_customer'

      if (OrganizationRules.isKeyAccount(organization)) {
        relationshipType = 'key_account'
      } else if (organization.type === 'distributor') {
        relationshipType = 'distributor_partner'
      } else if (organization.type === 'principal') {
        relationshipType = 'principal_partner'
      } else if (organization.type === 'supplier' || organization.type === 'vendor') {
        relationshipType = 'preferred_vendor'
      } else if (annualValue > 100000) {
        relationshipType = 'strategic_partner'
      }

      const metrics: OrganizationRelationshipMetrics = {
        organizationId,
        relationshipType,
        relationshipScore,
        engagementLevel,
        contactCount,
        opportunityCount,
        interactionCount,
        lastInteractionDate,
        annualValue,
        potentialValue,
      }

      return Result.success(metrics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Validate organization business data and relationships
   */
  async validateBusiness(
    organizationId: string,
    context?: OrganizationValidationContext
  ): Promise<Result<OrganizationBusinessValidation>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      const validation = OrganizationRules.validateOrganizationBusiness(organization, context)
      return Result.success(validation)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Analyze organization segmentation and market opportunity
   */
  async analyzeSegmentation(
    organizationId: string,
    marketData?: {
      segmentGrowthRate: number
      competitorCount: number
      marketSize: number
    }
  ): Promise<Result<OrganizationSegmentAnalysis>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      const analysis = OrganizationRules.analyzeSegmentation(organization, marketData)
      return Result.success(analysis)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Calculate performance metrics for organization
   */
  async calculatePerformanceMetrics(
    organizationId: string,
    opportunityData: {
      totalValue: number
      wonValue: number
      lostValue: number
      activeCount: number
      averageCycleLength: number
    },
    lastPurchaseDate?: string | null
  ): Promise<Result<OrganizationPerformance>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      const performance = OrganizationRules.calculatePerformanceMetrics(
        organization,
        opportunityData,
        lastPurchaseDate
      )

      return Result.success(performance)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Get territory assignment for organization
   */
  async getTerritoryAssignment(organizationId: string): Promise<Result<OrganizationTerritory>> {
    try {
      const organization = await this.repository.findById(organizationId)
      if (!organization) {
        return Result.failure('Organization not found')
      }

      const territory: OrganizationTerritory = {
        organizationId,
        territoryName: `${organization.city || organization.state_province || 'Unknown'} Territory`,
        region: organization.state_province || organization.country || 'Unknown',
        isKeyAccount: OrganizationRules.isKeyAccount(organization),
        accountTier: OrganizationRules.getTerritoryTier(organization),
        coverageFrequency: OrganizationRules.getRecommendedContactFrequency(organization),
      }

      return Result.success(territory)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Get organizations by type
   */
  async getOrganizationsByType(type: OrganizationType): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => org.type === type)
  }

  /**
   * Get customer organizations (can have opportunities)
   */
  async getCustomerOrganizations(): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => OrganizationRules.canHaveOpportunities(org.type))
  }

  /**
   * Get principal organizations
   */
  async getPrincipalOrganizations(): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => org.is_principal)
  }

  /**
   * Get distributor organizations
   */
  async getDistributorOrganizations(): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => org.is_distributor)
  }

  /**
   * Get high-priority organizations
   */
  async getHighPriorityOrganizations(): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => OrganizationRules.isHighPriority(org))
  }

  /**
   * Get key account organizations
   */
  async getKeyAccountOrganizations(): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => OrganizationRules.isKeyAccount(org))
  }

  /**
   * Search organizations by criteria
   */
  async searchOrganizations(searchTerm: string): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    const lowerSearchTerm = searchTerm.toLowerCase()

    return allOrganizations.filter(
      (org) =>
        org.name.toLowerCase().includes(lowerSearchTerm) ||
        (org.email && org.email.toLowerCase().includes(lowerSearchTerm)) ||
        (org.city && org.city.toLowerCase().includes(lowerSearchTerm)) ||
        (org.industry && org.industry.toLowerCase().includes(lowerSearchTerm)) ||
        org.segment.toLowerCase().includes(lowerSearchTerm)
    )
  }

  /**
   * Get organizations by segment
   */
  async getOrganizationsBySegment(segment: string): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => org.segment === segment)
  }

  /**
   * Get organizations by priority
   */
  async getOrganizationsByPriority(priority: string): Promise<OrganizationDomain[]> {
    const allOrganizations = await this.repository.findAll()
    return allOrganizations.filter((org) => org.priority === priority)
  }

  /**
   * Check if organization name is available
   */
  async isNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    const existingOrganizations = await this.repository.findAll()
    return OrganizationRules.validateNameUniqueness(name, existingOrganizations, excludeId)
  }

  /**
   * Validate organization data (without creating)
   */
  validateOrganizationData(
    data: Partial<OrganizationDomain>,
    context?: OrganizationValidationContext
  ): Result<boolean> {
    try {
      OrganizationRules.validateOrganizationData(data, context)
      return Result.success(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Get organization statistics and insights
   */
  async getOrganizationInsights(): Promise<{
    totalCount: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    bySegment: Record<string, number>
    highPriorityCount: number
    keyAccountCount: number
  }> {
    const allOrganizations = await this.repository.findAll()

    const insights = {
      totalCount: allOrganizations.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      bySegment: {} as Record<string, number>,
      highPriorityCount: 0,
      keyAccountCount: 0,
    }

    allOrganizations.forEach((org) => {
      // Count by type
      insights.byType[org.type] = (insights.byType[org.type] || 0) + 1

      // Count by priority
      insights.byPriority[org.priority] = (insights.byPriority[org.priority] || 0) + 1

      // Count by segment
      insights.bySegment[org.segment] = (insights.bySegment[org.segment] || 0) + 1

      // High priority count
      if (OrganizationRules.isHighPriority(org)) {
        insights.highPriorityCount++
      }

      // Key account count
      if (OrganizationRules.isKeyAccount(org)) {
        insights.keyAccountCount++
      }
    })

    return insights
  }
}
