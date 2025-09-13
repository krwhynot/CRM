import { useMemo } from 'react'
import { useEntityList } from '../useEntityList'
import { OrganizationApplicationService } from '@/services/OrganizationApplicationService'
import { OrganizationRepository } from '@/domain/organizations/OrganizationRepository'
import { OrganizationService } from '@/domain/organizations/OrganizationService'
import { useQueryClient } from '@tanstack/react-query'
import type { OrganizationDomain } from '@/domain/organizations/OrganizationTypes'
import type { EntityListOptions } from '../types'

/**
 * Feature-specific adapter for organizations using generic entity hooks
 */
export function useOrganizationList(options?: Partial<EntityListOptions<OrganizationDomain>>) {
  const queryClient = useQueryClient()

  // Create service instances
  const applicationService = useMemo(() => {
    const repository = new OrganizationRepository()
    const domainService = new OrganizationService(repository)
    return new OrganizationApplicationService(domainService, repository, queryClient)
  }, [queryClient])

  // Define entity service interface
  const entityService = useMemo(
    () => ({
      entityName: 'organizations',

      async list(filters?: Record<string, any>) {
        const response = await applicationService.getAllOrganizations({
          type: filters?.type,
          priority: filters?.priority,
          segment: filters?.segment,
        })

        if (response.success) {
          return response.data || []
        }
        throw new Error(response.error?.message || 'Failed to fetch organizations')
      },

      async create(data: Omit<OrganizationDomain, 'id' | 'created_at' | 'updated_at'>) {
        const response = await applicationService.createOrganization(data)
        if (response.success && response.data) {
          return response.data
        }
        throw new Error(response.error?.message || 'Failed to create organization')
      },

      async update(id: string, data: Partial<OrganizationDomain>) {
        const response = await applicationService.updateOrganization({
          organizationId: id,
          data,
        })
        if (response.success && response.data) {
          return response.data
        }
        throw new Error(response.error?.message || 'Failed to update organization')
      },

      async delete(id: string) {
        const response = await applicationService.deleteOrganization(id)
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete organization')
        }
      },

      async bulkDelete(ids: string[]) {
        const response = await applicationService.bulkDeleteOrganizations({
          items: ids.map((id) => ({ id, data: { organizationId: id } })),
          options: { strategy: 'parallel', continueOnError: true },
        })

        if (response.failedCount > 0) {
          throw new Error(`Failed to delete ${response.failedCount} organizations`)
        }
      },
    }),
    [applicationService]
  )

  // Use the generic entity list hook with organization-specific defaults
  const defaultOptions: EntityListOptions<OrganizationDomain> = {
    filters: {},
    queryOptions: {
      staleTime: 60000, // 1 minute
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
    },
    sortBy: 'name',
    sortOrder: 'asc',
    ...options,
  }

  return useEntityList(entityService, defaultOptions)
}

/**
 * Hook for organization priority updates
 */
export function useOrganizationPriorityUpdate() {
  const queryClient = useQueryClient()

  const applicationService = useMemo(() => {
    const repository = new OrganizationRepository()
    const domainService = new OrganizationService(repository)
    return new OrganizationApplicationService(domainService, repository, queryClient)
  }, [queryClient])

  return {
    updatePriority: async (organizationId: string, newPriority: string) => {
      const response = await applicationService.updateOrganizationPriority({
        organizationId,
        priority: newPriority as any,
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update priority')
      }

      return response.data
    },
  }
}

/**
 * Hook for organization performance metrics
 */
export function useOrganizationMetrics() {
  const queryClient = useQueryClient()

  const applicationService = useMemo(() => {
    const repository = new OrganizationRepository()
    const domainService = new OrganizationService(repository)
    return new OrganizationApplicationService(domainService, repository, queryClient)
  }, [queryClient])

  return {
    getPerformanceMetrics: async (organizationId: string) => {
      const response = await applicationService.getOrganizationMetrics({
        organizationId,
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to get organization metrics')
      }

      return response.data
    },

    getSegmentationAnalysis: async () => {
      const response = await applicationService.getSegmentationAnalysis({})

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to get segmentation analysis')
      }

      return response.data
    },
  }
}
