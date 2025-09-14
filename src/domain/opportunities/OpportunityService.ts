import { DomainService, Result } from '../shared/BaseEntity'
import { OpportunityRules } from './OpportunityRules'
import type {
  OpportunityDomain,
  CreateOpportunityData,
  UpdateOpportunityData,
  OpportunityStage,
  OpportunityStatus,
  PipelineMetrics,
  OpportunityNameContext,
} from './OpportunityTypes'
import {
  OPPORTUNITY_STAGES,
} from './OpportunityTypes'
import type { BaseRepository } from '../shared/BaseEntity'

/**
 * Opportunity domain service
 * Contains all business logic for opportunity management
 */
export class OpportunityService extends DomainService {
  constructor(private repository: BaseRepository<OpportunityDomain>) {
    super()
  }

  /**
   * Create a new opportunity with business rule validation
   */
  async create(data: CreateOpportunityData): Promise<Result<OpportunityDomain>> {
    try {
      // Apply defaults
      const opportunityData: Partial<OpportunityDomain> = {
        ...data,
        stage: data.stage || OpportunityRules.getDefaultStage(),
        status: data.status || OpportunityRules.getDefaultStatus(),
      }

      // Validate business rules
      OpportunityRules.validateOpportunityData(opportunityData)

      // Create the opportunity
      const opportunity = await this.repository.create(opportunityData as any)

      // Emit domain event
      this.emit('OpportunityCreated', {
        opportunityId: opportunity.id,
        organizationId: opportunity.organization_id,
        stage: opportunity.stage,
        value: opportunity.estimated_value,
      })

      return Result.success(opportunity)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Update opportunity stage with business rule validation
   */
  async updateStage(
    opportunityId: string,
    newStage: OpportunityStage,
    updatedBy?: string
  ): Promise<Result<OpportunityDomain>> {
    try {
      const opportunity = await this.repository.findById(opportunityId)
      if (!opportunity) {
        return Result.failure('Opportunity not found')
      }

      // Validate stage transition
      const transitionResult = OpportunityRules.validateStageTransition(opportunity.stage, newStage)

      if (!transitionResult.isValid) {
        return Result.failure(transitionResult.reason || 'Invalid stage transition')
      }

      // Update stage and timestamp
      const oldStage = opportunity.stage
      opportunity.stage = newStage
      opportunity.stage_updated_at = new Date().toISOString()

      // Auto-update status if moving to closed stages
      if (OpportunityRules.isWonStage(newStage)) {
        opportunity.status = 'Closed - Won'
      } else if (OpportunityRules.isLostStage(newStage)) {
        opportunity.status = 'Closed - Lost'
      }

      const updatedOpportunity = await this.repository.update(opportunity)

      // Emit domain events
      this.emit('OpportunityStageChanged', {
        opportunityId,
        oldStage,
        newStage,
        changedBy: updatedBy,
      })

      if (OpportunityRules.isClosedStage(newStage)) {
        this.emit('OpportunityClosed', {
          opportunityId,
          finalStage: newStage as 'Closed - Won' | 'Closed - Lost',
          finalValue: opportunity.estimated_value,
          closedAt: new Date(),
        })
      }

      return Result.success(updatedOpportunity)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Update opportunity with business rule validation
   */
  async update(
    opportunityId: string,
    data: UpdateOpportunityData
  ): Promise<Result<OpportunityDomain>> {
    try {
      const opportunity = await this.repository.findById(opportunityId)
      if (!opportunity) {
        return Result.failure('Opportunity not found')
      }

      // Merge update data
      const updatedData = { ...opportunity, ...data }

      // Validate business rules
      OpportunityRules.validateOpportunityData(updatedData)

      // Validate status transition if status is being changed
      if (data.status && data.status !== opportunity.status) {
        const isValidStatusTransition = OpportunityRules.validateStatusTransition(
          opportunity.status,
          data.status,
          opportunity.stage
        )

        if (!isValidStatusTransition) {
          return Result.failure('Invalid status transition')
        }
      }

      // Track value changes
      const oldValue = opportunity.estimated_value
      const newValue = data.estimated_value

      const updatedOpportunity = await this.repository.update(updatedData as OpportunityDomain)

      // Emit value change event if applicable
      if (newValue && newValue !== oldValue) {
        this.emit('OpportunityValueUpdated', {
          opportunityId,
          oldValue,
          newValue,
        })
      }

      return Result.success(updatedOpportunity)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Soft delete opportunity
   */
  async softDelete(opportunityId: string): Promise<Result<void>> {
    try {
      await this.repository.softDelete(opportunityId)
      return Result.success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Generate opportunity name based on context
   */
  generateName(context: OpportunityNameContext): string {
    return OpportunityRules.generateOpportunityName(context)
  }

  /**
   * Calculate pipeline metrics from opportunities
   */
  calculatePipelineMetrics(opportunities: OpportunityDomain[]): PipelineMetrics {
    const activeOpportunities = opportunities.filter((opp) =>
      OpportunityRules.isActiveStage(opp.stage)
    )
    const wonOpportunities = opportunities.filter((opp) => OpportunityRules.isWonStage(opp.stage))
    const lostOpportunities = opportunities.filter((opp) => OpportunityRules.isLostStage(opp.stage))

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.estimated_value, 0)
    const activeValue = activeOpportunities.reduce((sum, opp) => sum + opp.estimated_value, 0)
    const wonValue = wonOpportunities.reduce((sum, opp) => sum + opp.estimated_value, 0)
    const lostValue = lostOpportunities.reduce((sum, opp) => sum + opp.estimated_value, 0)

    // Calculate stage breakdown
    const stageBreakdown = OPPORTUNITY_STAGES.reduce(
      (breakdown, stage) => {
        const stageOpps = opportunities.filter((opp) => opp.stage === stage)
        breakdown[stage] = {
          count: stageOpps.length,
          value: stageOpps.reduce((sum, opp) => sum + opp.estimated_value, 0),
        }
        return breakdown
      },
      {} as Record<(typeof OPPORTUNITY_STAGES)[number], { count: number; value: number }>
    )

    return {
      totalValue,
      activeValue,
      wonValue,
      lostValue,
      stageBreakdown,
      averageDealSize: OpportunityRules.calculateAverageDealSize(opportunities),
      winRate: OpportunityRules.calculateWinRate(opportunities),
    }
  }

  /**
   * Validate stage transition (without updating)
   */
  validateStageTransition(currentStage: OpportunityStage, newStage: OpportunityStage) {
    return OpportunityRules.validateStageTransition(currentStage, newStage)
  }

  /**
   * Get all active opportunities
   */
  async getActiveOpportunities(): Promise<OpportunityDomain[]> {
    const allOpportunities = await this.repository.findAll()
    return allOpportunities.filter((opp) => OpportunityRules.isActiveStage(opp.stage))
  }

  /**
   * Get opportunities by organization
   */
  async getByOrganization(organizationId: string): Promise<OpportunityDomain[]> {
    const allOpportunities = await this.repository.findAll()
    return allOpportunities.filter((opp) => opp.organization_id === organizationId)
  }
}
