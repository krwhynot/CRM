/**
 * KitchenPantry CRM Services Index
 * 
 * Centralized exports for all API services providing:
 * - Type-safe CRUD operations
 * - Business logic validation
 * - Error handling and caching
 * - Relationship management
 * - Analytics and reporting
 */

// =============================================================================
// BASE SERVICES AND UTILITIES
// =============================================================================

export { BaseService } from './baseService'
export { ApiError, handleSupabaseResponse, supabase } from './api'

// =============================================================================
// ENTITY SERVICES
// =============================================================================

// Organization Service
export { 
  OrganizationService, 
  organizationService,
  type OrganizationWithRelations,
  type OrganizationSearchOptions,
  type HierarchyOptions
} from './organizations.service'

// Contact Service
export { 
  ContactService, 
  contactService,
  type ContactWithRelations,
  type ContactSearchOptions,
  type ContactSummary
} from './contacts.service'

// Product Service
export { 
  ProductService, 
  productService,
  type ProductWithRelations,
  type ProductSearchOptions,
  type ProductSummary,
  type SeasonalProductInfo
} from './products.service'

// Opportunity Service
export { 
  OpportunityService, 
  opportunityService,
  type OpportunityWithRelations,
  type OpportunitySearchOptions,
  type OpportunitySummary,
  type StageProgression,
  type OpportunityProduct
} from './opportunities.service'

// Interaction Service
export { 
  InteractionService, 
  interactionService,
  type InteractionWithRelations,
  type InteractionFilter,
  type InteractionSummary,
  type FollowUpTask
} from './interactions.service'

// Relationship Service
export { 
  RelationshipService, 
  relationshipService,
  type RelationshipWithDetails,
  type RelationshipSummary,
  type TerritoryAssignment,
  type ContractAlert
} from './relationships.service'

// Engagement Aggregation Service
export { 
  EngagementAggregationService, 
  engagementAggregationService,
  type PrincipalEngagementAnalytics,
  type EngagementPatternAnalytics,
  type RelationshipHealthMetrics,
  type CommunicationTrendAnalytics,
  type RelationshipRiskFactor,
  type ChurnRiskIndicator,
  type GrowthOpportunityIndicator
} from './engagementAggregation.service'

// =============================================================================
// SERVICE COLLECTION
// =============================================================================

/**
 * Collection of all service instances for easy access
 */
import { organizationService } from './organizations.service'
import { contactService } from './contacts.service'
import { productService } from './products.service'
import { opportunityService } from './opportunities.service'
import { interactionService } from './interactions.service'
import { relationshipService } from './relationships.service'
import { engagementAggregationService } from './engagementAggregation.service'
import { ApiError } from './api'

export const services = {
  organizations: organizationService,
  contacts: contactService,
  products: productService,
  opportunities: opportunityService,
  interactions: interactionService,
  relationships: relationshipService,
  engagement: engagementAggregationService
} as const

// =============================================================================
// COMMON TYPES
// =============================================================================

export type {
  ServiceResponse,
  BulkOperation,
  QueryOptions,
  PaginationOptions,
  SortOptions,
  FilterOptions,
  SearchOptions
} from './baseService'

// =============================================================================
// SERVICE HELPER FUNCTIONS
// =============================================================================

/**
 * Initialize all services (for any setup that might be needed)
 */
export const initializeServices = async (): Promise<void> => {
  // Currently no initialization needed, but this provides a hook for future needs
  // Could be used for:
  // - Setting up event listeners
  // - Initializing caches
  // - Validating service configurations
  console.log('CRM Services initialized successfully')
}

/**
 * Clear all service caches
 */
export const clearAllCaches = (): void => {
  Object.values(services).forEach(service => {
    if ('invalidateCache' in service && typeof service.invalidateCache === 'function') {
      service.invalidateCache()
    }
  })
}

/**
 * Health check for all services
 */
export const checkServiceHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: Record<string, { status: string; message?: string }>
}> => {
  const results: Record<string, { status: string; message?: string }> = {}
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  try {
    // Test basic database connectivity through each service
    const healthChecks = [
      { name: 'organizations', fn: () => services.organizations.count() },
      { name: 'contacts', fn: () => services.contacts.count() },
      { name: 'products', fn: () => services.products.count() },
      { name: 'opportunities', fn: () => services.opportunities.count() },
      { name: 'interactions', fn: () => services.interactions.count() }
    ]

    const healthPromises = healthChecks.map(async check => {
      try {
        await check.fn()
        results[check.name] = { status: 'healthy' }
      } catch (error) {
        results[check.name] = { 
          status: 'unhealthy', 
          message: error instanceof Error ? error.message : 'Unknown error'
        }
        overallStatus = 'unhealthy'
      }
    })

    await Promise.all(healthPromises)

    // Check if any services are degraded
    const unhealthyServices = Object.values(results).filter(r => r.status === 'unhealthy')
    if (unhealthyServices.length > 0 && unhealthyServices.length < healthChecks.length) {
      overallStatus = 'degraded'
    }

  } catch (error) {
    overallStatus = 'unhealthy'
    results.system = { 
      status: 'unhealthy', 
      message: 'System-wide service health check failed'
    }
  }

  return {
    status: overallStatus,
    services: results
  }
}

/**
 * Get service usage statistics
 */
export const getServiceStats = async (): Promise<{
  total_records: number
  by_entity: Record<string, number>
  cache_stats: Record<string, { hits: number; size: number }>
}> => {
  try {
    const entityCounts = await Promise.all([
      services.organizations.count(),
      services.contacts.count(),
      services.products.count(),
      services.opportunities.count(),
      services.interactions.count()
    ])

    const entityNames = ['organizations', 'contacts', 'products', 'opportunities', 'interactions']
    const byEntity = entityNames.reduce((acc, name, index) => {
      acc[name] = entityCounts[index]
      return acc
    }, {} as Record<string, number>)

    const totalRecords = entityCounts.reduce((sum, count) => sum + count, 0)

    // Cache stats would need to be implemented in BaseService if needed
    const cacheStats = {}

    return {
      total_records: totalRecords,
      by_entity: byEntity,
      cache_stats: cacheStats
    }
  } catch (error) {
    throw new ApiError('Failed to get service statistics', 500, error as any)
  }
}

// =============================================================================
// UTILITY FUNCTIONS FOR CROSS-SERVICE OPERATIONS
// =============================================================================

/**
 * Get complete entity summary (cross-service data aggregation)
 */
export const getEntitySummary = async (
  entityType: 'organization' | 'contact' | 'opportunity',
  entityId: string
): Promise<any> => {
  try {
    switch (entityType) {
      case 'organization':
        return services.organizations.getSummary(entityId)
      
      case 'contact':
        return services.contacts.getSummary(entityId)
      
      case 'opportunity':
        return services.opportunities.getSummary(entityId)
      
      default:
        throw new ApiError(`Unsupported entity type: ${entityType}`, 400)
    }
  } catch (error) {
    throw new ApiError(
      `Failed to get entity summary for ${entityType}: ${entityId}`,
      500,
      error as any
    )
  }
}

/**
 * Perform cross-entity search
 */
export const globalSearch = async (query: string, limit = 50): Promise<{
  organizations: any[]
  contacts: any[]
  products: any[]
  opportunities: any[]
  interactions: any[]
}> => {
  try {
    const searchPromises = [
      services.organizations.search({ query }).then(results => results.slice(0, limit)),
      services.contacts.search({ query }).then(results => results.slice(0, limit)),
      services.products.search({ query }).then(results => results.slice(0, limit)),
      services.opportunities.search({ query }).then(results => results.slice(0, limit)),
      services.interactions.search({ query }).then(results => results.slice(0, limit))
    ]

    const [organizations, contacts, products, opportunities, interactions] = await Promise.all(searchPromises)

    return {
      organizations,
      contacts,
      products,
      opportunities,
      interactions
    }
  } catch (error) {
    throw new ApiError(
      `Failed to perform global search for: ${query}`,
      500,
      error as any
    )
  }
}

/**
 * Export data for backup or migration
 */
export const exportData = async (entityTypes?: string[]): Promise<{
  timestamp: string
  data: Record<string, any[]>
}> => {
  const defaultEntityTypes = ['organizations', 'contacts', 'products', 'opportunities', 'interactions']
  const typesToExport = entityTypes || defaultEntityTypes

  const data: Record<string, any[]> = {}

  try {
    for (const entityType of typesToExport) {
      switch (entityType) {
        case 'organizations':
          const orgData = await services.organizations.findMany({ limit: 10000 })
          data.organizations = orgData.data
          break
        
        case 'contacts':
          const contactData = await services.contacts.findMany({ limit: 10000 })
          data.contacts = contactData.data
          break
        
        case 'products':
          const productData = await services.products.findMany({ limit: 10000 })
          data.products = productData.data
          break
        
        case 'opportunities':
          const oppData = await services.opportunities.findMany({ limit: 10000 })
          data.opportunities = oppData.data
          break
        
        case 'interactions':
          const interactionData = await services.interactions.findMany({ limit: 10000 })
          data.interactions = interactionData.data
          break
      }
    }

    return {
      timestamp: new Date().toISOString(),
      data
    }
  } catch (error) {
    throw new ApiError(
      'Failed to export data',
      500,
      error as any
    )
  }
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default services