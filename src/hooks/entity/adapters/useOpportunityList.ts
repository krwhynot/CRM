import { useMemo } from 'react'
import { useEntityList } from '../useEntityList'
import { OpportunityApplicationService } from '@/services/OpportunityApplicationService'
import { OpportunityRepository } from '@/domain/opportunities/OpportunityRepository'
import { OpportunityService } from '@/domain/opportunities/OpportunityService'
import { useQueryClient } from '@tanstack/react-query'
import type { OpportunityDomain } from '@/domain/opportunities/OpportunityTypes'
import type { EntityListOptions } from '../types'

/**
 * Feature-specific adapter for opportunities using generic entity hooks
 */
export function useOpportunityList(options?: Partial<EntityListOptions<OpportunityDomain>>) {
  const queryClient = useQueryClient()

  // Create service instances
  const applicationService = useMemo(() => {
    const repository = new OpportunityRepository()
    const domainService = new OpportunityService(repository)
    return new OpportunityApplicationService(domainService, repository, queryClient)
  }, [queryClient])

  // Define entity service interface
  const entityService = useMemo(
    () => ({
      entityName: 'opportunities',

      async list(filters?: Record<string, any>) {
        const response = filters?.active
          ? await applicationService.getActiveOpportunities({})
          : await applicationService.getAllOpportunities({})

        if (response.success) {
          return response.data || []
        }
        throw new Error(response.error?.message || 'Failed to fetch opportunities')
      },

      async create(data: Omit<OpportunityDomain, 'id' | 'created_at' | 'updated_at'>) {
        const response = await applicationService.createOpportunity(data)
        if (response.success && response.data) {
          return response.data
        }
        throw new Error(response.error?.message || 'Failed to create opportunity')
      },

      async update(id: string, data: Partial<OpportunityDomain>) {
        const response = await applicationService.updateOpportunity({
          opportunityId: id,
          data,
        })
        if (response.success && response.data) {
          return response.data
        }
        throw new Error(response.error?.message || 'Failed to update opportunity')
      },

      async delete(id: string) {
        const response = await applicationService.deleteOpportunity(id)
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete opportunity')
        }
      },

      async bulkDelete(ids: string[]) {
        const response = await applicationService.bulkDeleteOpportunities({
          items: ids.map((id) => ({ id, data: { opportunityId: id } })),
          options: { strategy: 'parallel', continueOnError: true },
        })

        if (response.failedCount > 0) {
          throw new Error(`Failed to delete ${response.failedCount} opportunities`)
        }
      },
    }),
    [applicationService]
  )

  // Use the generic entity list hook with opportunity-specific defaults
  const defaultOptions: EntityListOptions<OpportunityDomain> = {
    filters: { active: true },
    queryOptions: {
      staleTime: 30000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...options,
  }

  return useEntityList(entityService, defaultOptions)
}

/**
 * Hook for opportunity stage updates
 */
export function useOpportunityStageUpdate() {
  const queryClient = useQueryClient()

  const applicationService = useMemo(() => {
    const repository = new OpportunityRepository()
    const domainService = new OpportunityService(repository)
    return new OpportunityApplicationService(domainService, repository, queryClient)
  }, [queryClient])

  return {
    updateStage: async (opportunityId: string, newStage: string) => {
      const response = await applicationService.updateOpportunityStage({
        opportunityId,
        stage: newStage as any,
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update stage')
      }

      return response.data
    },
  }
}

/**
 * Hook for opportunity pipeline metrics
 */
export function useOpportunityPipeline() {
  const queryClient = useQueryClient()

  const applicationService = useMemo(() => {
    const repository = new OpportunityRepository()
    const domainService = new OpportunityService(repository)
    return new OpportunityApplicationService(domainService, repository, queryClient)
  }, [queryClient])

  return {
    getPipelineMetrics: async (organizationId?: string) => {
      const response = await applicationService.getOpportunityPipeline({
        organizationId,
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to get pipeline metrics')
      }

      return response.data
    },
  }
}
