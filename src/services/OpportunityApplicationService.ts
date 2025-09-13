import { QueryClient } from '@tanstack/react-query'
import { OpportunityService } from '@/domain/opportunities/OpportunityService'
import type {
  OpportunityDomain,
  CreateOpportunityData,
  UpdateOpportunityData,
  OpportunityStage,
  OpportunityNameContext,
} from '@/domain/opportunities/OpportunityTypes'
import type { BaseRepository } from '@/domain/shared/BaseEntity'
import {
  CommandUseCaseBase,
  QueryUseCaseBase,
  UseCaseContextFactory,
  type UseCaseContext,
} from './shared/UseCaseBase'
import type { ServiceResponse } from './shared/ServiceResponse'
import { ServiceResponseBuilder, SERVICE_ERROR_CODES } from './shared/ServiceResponse'
import {
  BulkOperationResultBuilder,
  BulkOperationUtils,
  type BulkOperationInput,
  type BulkOperationResult,
} from './shared/BulkOperationResult'

/**
 * Application service for Opportunity entity
 * Coordinates between domain services and infrastructure concerns
 * Integrates with TanStack Query for cache invalidation
 */
export class OpportunityApplicationService {
  private context: UseCaseContext

  constructor(
    private readonly opportunityService: OpportunityService,
    private readonly _queryClient: QueryClient,
    options?: {
      userId?: string
      transactionId?: string
    }
  ) {
    this.context = UseCaseContextFactory.create(_queryClient, options)
  }

  /**
   * Create a new opportunity use case
   */
  async createOpportunity(
    data: CreateOpportunityData
  ): Promise<ServiceResponse<OpportunityDomain>> {
    const useCase = new CreateOpportunityUseCase(this.context, this.opportunityService)
    return useCase.execute(data)
  }

  /**
   * Update opportunity stage use case
   */
  async updateOpportunityStage(
    opportunityId: string,
    newStage: OpportunityStage,
    updatedBy?: string
  ): Promise<ServiceResponse<OpportunityDomain>> {
    const useCase = new UpdateOpportunityStageUseCase(this.context, this.opportunityService)
    return useCase.execute({ opportunityId, newStage, updatedBy })
  }

  /**
   * Update opportunity use case
   */
  async updateOpportunity(
    opportunityId: string,
    data: UpdateOpportunityData
  ): Promise<ServiceResponse<OpportunityDomain>> {
    const useCase = new UpdateOpportunityUseCase(this.context, this.opportunityService)
    return useCase.execute({ opportunityId, data })
  }

  /**
   * Soft delete opportunity use case
   */
  async deleteOpportunity(opportunityId: string): Promise<ServiceResponse<void>> {
    const useCase = new DeleteOpportunityUseCase(this.context, this.opportunityService)
    return useCase.execute(opportunityId)
  }

  /**
   * Bulk delete opportunities use case
   */
  async bulkDeleteOpportunities(
    input: BulkOperationInput<{ opportunityId: string }>
  ): Promise<ServiceResponse<BulkOperationResult<void>>> {
    const useCase = new BulkDeleteOpportunitiesUseCase(this.context, this.opportunityService)
    return useCase.execute(input)
  }

  /**
   * Generate opportunity name use case
   */
  async generateOpportunityName(context: OpportunityNameContext): Promise<ServiceResponse<string>> {
    const useCase = new GenerateOpportunityNameUseCase(this.context, this.opportunityService)
    return useCase.execute(context)
  }

  /**
   * Get active opportunities use case
   */
  async getActiveOpportunities(): Promise<ServiceResponse<OpportunityDomain[]>> {
    const useCase = new GetActiveOpportunitiesUseCase(this.context, this.opportunityService)
    return useCase.execute({})
  }

  /**
   * Get opportunities by organization use case
   */
  async getOpportunitiesByOrganization(
    organizationId: string
  ): Promise<ServiceResponse<OpportunityDomain[]>> {
    const useCase = new GetOpportunitiesByOrganizationUseCase(this.context, this.opportunityService)
    return useCase.execute(organizationId)
  }
}

/**
 * Query keys for opportunity cache invalidation
 */
export const OpportunityQueryKeys = {
  all: ['opportunities'] as const,
  lists: () => [...OpportunityQueryKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...OpportunityQueryKeys.lists(), { filters }] as const,
  details: () => [...OpportunityQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...OpportunityQueryKeys.details(), id] as const,
  byOrganization: (organizationId: string) =>
    [...OpportunityQueryKeys.all, 'organization', organizationId] as const,
  pipeline: () => [...OpportunityQueryKeys.all, 'pipeline'] as const,
  active: () => [...OpportunityQueryKeys.all, 'active'] as const,
}

/**
 * Create opportunity use case
 */
class CreateOpportunityUseCase extends CommandUseCaseBase<
  CreateOpportunityData,
  OpportunityDomain
> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(input: CreateOpportunityData): Promise<ServiceResponse<OpportunityDomain>> {
    // Validate input
    const validation = this.validateInput(input, this.validateCreateData)
    if (validation) return validation

    return this.executeCommand(
      input,
      async () => {
        const result = await this.opportunityService.create(input)
        if (result.isFailure) {
          throw new Error(result.error)
        }
        return result.value
      },
      {
        optimisticUpdate: (old: OpportunityDomain[] | undefined) => {
          // Optimistic update for opportunity lists
          if (!old) return old
          const newOpportunity: Partial<OpportunityDomain> = {
            id: `temp-${Date.now()}`,
            ...input,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            stage: input.stage || 'New Lead',
            status: input.status || 'Active',
          } as OpportunityDomain
          return [...old, newOpportunity]
        },
        optimisticKeys: [OpportunityQueryKeys.lists()],
      }
    )
  }

  getInvalidationKeys(input: CreateOpportunityData): unknown[][] {
    return [
      OpportunityQueryKeys.all,
      OpportunityQueryKeys.lists(),
      OpportunityQueryKeys.byOrganization(input.organization_id),
      OpportunityQueryKeys.pipeline(),
      OpportunityQueryKeys.active(),
    ]
  }

  private validateCreateData(data: CreateOpportunityData): { isValid: boolean; errors?: string[] } {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('Opportunity name is required')
    }

    if (!data.organization_id) {
      errors.push('Organization ID is required')
    }

    if (typeof data.estimated_value !== 'number' || data.estimated_value < 0) {
      errors.push('Estimated value must be a non-negative number')
    }

    if (data.close_date) {
      const closeDate = new Date(data.close_date)
      if (isNaN(closeDate.getTime())) {
        errors.push('Close date must be a valid date')
      } else if (closeDate < new Date()) {
        errors.push('Close date cannot be in the past')
      }
    }

    return { isValid: errors.length === 0, errors }
  }
}

/**
 * Update opportunity stage use case
 */
class UpdateOpportunityStageUseCase extends CommandUseCaseBase<
  { opportunityId: string; newStage: OpportunityStage; updatedBy?: string },
  OpportunityDomain
> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(input: {
    opportunityId: string
    newStage: OpportunityStage
    updatedBy?: string
  }): Promise<ServiceResponse<OpportunityDomain>> {
    return this.executeCommand(input, async () => {
      const result = await this.opportunityService.updateStage(
        input.opportunityId,
        input.newStage,
        input.updatedBy
      )
      if (result.isFailure) {
        throw new Error(result.error)
      }
      return result.value
    })
  }

  getInvalidationKeys(input: { opportunityId: string }): unknown[][] {
    return [
      OpportunityQueryKeys.all,
      OpportunityQueryKeys.lists(),
      OpportunityQueryKeys.detail(input.opportunityId),
      OpportunityQueryKeys.pipeline(),
      OpportunityQueryKeys.active(),
    ]
  }
}

/**
 * Update opportunity use case
 */
class UpdateOpportunityUseCase extends CommandUseCaseBase<
  { opportunityId: string; data: UpdateOpportunityData },
  OpportunityDomain
> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(input: {
    opportunityId: string
    data: UpdateOpportunityData
  }): Promise<ServiceResponse<OpportunityDomain>> {
    return this.executeCommand(input, async () => {
      const result = await this.opportunityService.update(input.opportunityId, input.data)
      if (result.isFailure) {
        throw new Error(result.error)
      }
      return result.value
    })
  }

  getInvalidationKeys(input: { opportunityId: string }): unknown[][] {
    return [
      OpportunityQueryKeys.all,
      OpportunityQueryKeys.lists(),
      OpportunityQueryKeys.detail(input.opportunityId),
      OpportunityQueryKeys.pipeline(),
    ]
  }
}

/**
 * Delete opportunity use case
 */
class DeleteOpportunityUseCase extends CommandUseCaseBase<string, void> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(opportunityId: string): Promise<ServiceResponse<void>> {
    return this.executeCommand(opportunityId, async () => {
      const result = await this.opportunityService.softDelete(opportunityId)
      if (result.isFailure) {
        throw new Error(result.error)
      }
      return result.value
    })
  }

  getInvalidationKeys(opportunityId: string): unknown[][] {
    return [
      OpportunityQueryKeys.all,
      OpportunityQueryKeys.lists(),
      OpportunityQueryKeys.detail(opportunityId),
      OpportunityQueryKeys.pipeline(),
      OpportunityQueryKeys.active(),
    ]
  }
}

/**
 * Bulk delete opportunities use case
 */
class BulkDeleteOpportunitiesUseCase extends CommandUseCaseBase<
  BulkOperationInput<{ opportunityId: string }>,
  BulkOperationResult<void>
> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(
    input: BulkOperationInput<{ opportunityId: string }>
  ): Promise<ServiceResponse<BulkOperationResult<void>>> {
    // Validate bulk input
    const validation = BulkOperationUtils.validateBulkInput(input)
    if (!validation.isValid) {
      return ServiceResponseBuilder.validationFailure(
        validation.errors.map((message) => ({ field: 'input', message }))
      )
    }

    return this.executeCommand(input, async () => {
      const builder = new BulkOperationResultBuilder<void>('bulk_delete', input.options?.strategy)

      // Process deletions based on strategy
      const results = await BulkOperationUtils.processBatches(
        input.items,
        async (item) => {
          const result = await this.opportunityService.softDelete(item.data.opportunityId)
          return result
        },
        {
          batchSize: input.options?.batchSize || 10,
          maxConcurrency: input.options?.maxConcurrency || 3,
          continueOnError: input.options?.continueOnError ?? true,
        }
      )

      // Add results to builder
      results.forEach((result, index) => {
        const item = input.items[index]
        if (result.success && result.data) {
          if (result.data.isSuccess) {
            builder.addSuccess(item.id, undefined, item.metadata)
          } else {
            builder.addError(
              item.id,
              {
                code: SERVICE_ERROR_CODES.DOMAIN_ERROR,
                message: result.data.error || 'Domain operation failed',
              },
              item.metadata
            )
          }
        } else {
          builder.addError(
            item.id,
            {
              code: SERVICE_ERROR_CODES.GENERIC_ERROR,
              message: result.error?.message || 'Unknown error occurred',
            },
            item.metadata
          )
        }
      })

      return builder.build()
    })
  }

  getInvalidationKeys(): unknown[][] {
    return [
      OpportunityQueryKeys.all,
      OpportunityQueryKeys.lists(),
      OpportunityQueryKeys.pipeline(),
      OpportunityQueryKeys.active(),
    ]
  }
}

/**
 * Generate opportunity name use case
 */
class GenerateOpportunityNameUseCase extends QueryUseCaseBase<OpportunityNameContext, string> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(input: OpportunityNameContext): Promise<ServiceResponse<string>> {
    return this.executeQuery(
      input,
      async () => {
        const name = this.opportunityService.generateName(input)
        return name
      },
      { skipCache: true } // Names are generated fresh each time
    )
  }

  getCacheKey(input: OpportunityNameContext): unknown[] {
    return ['opportunity-name-generation', input]
  }
}

/**
 * Get active opportunities use case
 */
class GetActiveOpportunitiesUseCase extends QueryUseCaseBase<{}, OpportunityDomain[]> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(input: {}): Promise<ServiceResponse<OpportunityDomain[]>> {
    return this.executeQuery(input, async () => {
      const opportunities = await this.opportunityService.getActiveOpportunities()
      return opportunities
    })
  }

  getCacheKey(input: {}): unknown[] {
    return OpportunityQueryKeys.active()
  }
}

/**
 * Get opportunities by organization use case
 */
class GetOpportunitiesByOrganizationUseCase extends QueryUseCaseBase<string, OpportunityDomain[]> {
  constructor(
    context: UseCaseContext,
    private readonly opportunityService: OpportunityService
  ) {
    super(context)
  }

  async execute(organizationId: string): Promise<ServiceResponse<OpportunityDomain[]>> {
    return this.executeQuery(organizationId, async () => {
      const opportunities = await this.opportunityService.getByOrganization(organizationId)
      return opportunities
    })
  }

  getCacheKey(organizationId: string): unknown[] {
    return OpportunityQueryKeys.byOrganization(organizationId)
  }
}

/**
 * Factory for creating OpportunityApplicationService instances
 */
export class OpportunityApplicationServiceFactory {
  static create(
    opportunityRepository: BaseRepository<OpportunityDomain>,
    queryClient: QueryClient,
    options?: {
      userId?: string
      transactionId?: string
    }
  ): OpportunityApplicationService {
    const opportunityService = new OpportunityService(opportunityRepository)
    return new OpportunityApplicationService(opportunityService, queryClient, options)
  }
}
