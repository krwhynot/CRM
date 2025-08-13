/**
 * Organization Service for KitchenPantry CRM
 * 
 * Provides type-safe CRUD operations for organizations including:
 * - Organization hierarchy management
 * - Principal-distributor relationship handling
 * - Business logic validation
 * - Advanced querying and filtering
 */

import { BaseService } from './baseService'
import type { 
  Tables, 
  TablesInsert, 
  TablesUpdate, 
  Enums 
} from '@/types/database.types'
import type { 
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  OrganizationSummary,
  OrganizationTree,
  OrganizationMetrics
} from '@/types'
import { ApiError, supabase, handleSupabaseResponse } from './api'

// =============================================================================
// TYPES
// =============================================================================

type Organization = Tables<'organizations'>
type OrganizationInsert = TablesInsert<'organizations'>
type OrganizationUpdate = TablesUpdate<'organizations'>
type OrganizationType = Enums<'organization_type'>

export interface OrganizationWithRelations extends Organization {
  parent_organization?: Organization | null
  child_organizations?: Organization[]
  contacts?: Array<Tables<'contacts'>>
  opportunities?: Array<Tables<'opportunities'>>
  products?: Array<Tables<'products'>>
  principal_relationships?: Array<Tables<'principal_distributor_relationships'>>
  distributor_relationships?: Array<Tables<'principal_distributor_relationships'>>
}

export interface OrganizationSearchOptions {
  query?: string
  type?: OrganizationType[]
  industry?: string[]
  hasContacts?: boolean
  hasOpportunities?: boolean
  revenueRange?: { min?: number; max?: number }
  employeeRange?: { min?: number; max?: number }
}

export interface HierarchyOptions {
  includeChildren?: boolean
  includeParents?: boolean
  maxDepth?: number
}

// =============================================================================
// ORGANIZATION SERVICE CLASS
// =============================================================================

export class OrganizationService extends BaseService<
  Organization,
  OrganizationInsert,
  OrganizationUpdate
> {
  constructor() {
    super('organizations')
  }

  // =============================================================================
  // ENHANCED CRUD OPERATIONS
  // =============================================================================

  /**
   * Create organization with business logic validation
   */
  async create(data: CreateOrganizationSchema): Promise<Organization> {
    // Validate required fields
    this.validateRequiredFields(data, ['name', 'type'])
    
    // Validate business constraints
    await this.validateConstraints(data, 'create')

    // Prepare insert data
    const insertData: OrganizationInsert = {
      ...data,
      country: data.country || 'United States' // Default country
    }

    return super.create(insertData)
  }

  /**
   * Update organization with validation
   */
  async update(id: string, data: UpdateOrganizationSchema): Promise<Organization> {
    // Validate constraints
    await this.validateConstraints(data, 'update')

    // Prevent self-parenting
    if (data.parent_organization_id === id) {
      throw new ApiError('Organization cannot be its own parent', 400)
    }

    // Validate parent relationship doesn't create a cycle
    if (data.parent_organization_id) {
      await this.validateHierarchy(id, data.parent_organization_id)
    }

    const updateData: OrganizationUpdate = { ...data }
    return super.update(id, updateData)
  }

  /**
   * Get organization with related data
   */
  async findByIdWithRelations(
    id: string, 
    options: { 
      includeContacts?: boolean
      includeOpportunities?: boolean
      includeProducts?: boolean
      includeRelationships?: boolean 
    } = {}
  ): Promise<OrganizationWithRelations> {
    try {
      const {
        includeContacts = false,
        includeOpportunities = false,
        includeProducts = false,
        includeRelationships = false
      } = options

      let selectFields = '*'

      // Build select fields based on options
      const relations = []
      if (includeContacts) relations.push('contacts(*)')
      if (includeOpportunities) relations.push('opportunities(*)')
      if (includeProducts) relations.push('products(*)')
      if (includeRelationships) {
        relations.push('principal_distributor_relationships!principal_id(*)')
        relations.push('principal_distributor_relationships!distributor_id(*)')
      }

      if (relations.length > 0) {
        selectFields = `*, ${relations.join(', ')}`
      }

      const { data, error } = await supabase
        .from('organizations')
        .select(selectFields)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to fetch organization with relations: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Advanced search with business-specific filters
   */
  async search(options: OrganizationSearchOptions = {}): Promise<Organization[]> {
    try {
      const {
        query,
        type,
        industry,
        hasContacts,
        hasOpportunities,
        revenueRange,
        employeeRange
      } = options

      let searchQuery = supabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)

      // Text search
      if (query) {
        searchQuery = searchQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,industry.ilike.%${query}%`
        )
      }

      // Type filter
      if (type && type.length > 0) {
        searchQuery = searchQuery.in('type', type)
      }

      // Industry filter
      if (industry && industry.length > 0) {
        searchQuery = searchQuery.in('industry', industry)
      }

      // Revenue range filter
      if (revenueRange) {
        if (revenueRange.min !== undefined) {
          searchQuery = searchQuery.gte('annual_revenue', revenueRange.min)
        }
        if (revenueRange.max !== undefined) {
          searchQuery = searchQuery.lte('annual_revenue', revenueRange.max)
        }
      }

      // Employee count filter
      if (employeeRange) {
        if (employeeRange.min !== undefined) {
          searchQuery = searchQuery.gte('employee_count', employeeRange.min)
        }
        if (employeeRange.max !== undefined) {
          searchQuery = searchQuery.lte('employee_count', employeeRange.max)
        }
      }

      const { data, error } = await searchQuery.order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to search organizations',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // HIERARCHY MANAGEMENT
  // =============================================================================

  /**
   * Get organization hierarchy tree
   */
  async getHierarchyTree(
    rootId: string,
    options: HierarchyOptions = {}
  ): Promise<OrganizationTree> {
    const { includeChildren = true, maxDepth = 5 } = options

    const root = await this.findById(rootId)
    
    if (!includeChildren) {
      return {
        organization: root,
        children: [],
        level: 0,
        has_children: false
      }
    }

    return this.buildHierarchyTree(root, 0, maxDepth)
  }

  /**
   * Get all child organizations (recursive)
   */
  async getChildOrganizations(
    parentId: string,
    includeNestedChildren = false
  ): Promise<Organization[]> {
    try {
      let query = supabase
        .from('organizations')
        .select('*')
        .eq('parent_organization_id', parentId)
        .is('deleted_at', null)
        .order('name')

      const { data: children, error } = await query
      const directChildren = handleSupabaseResponse(children, error)

      if (!includeNestedChildren) {
        return directChildren
      }

      // Get nested children recursively
      const allChildren = [...directChildren]
      for (const child of directChildren) {
        const nestedChildren = await this.getChildOrganizations(child.id, true)
        allChildren.push(...nestedChildren)
      }

      return allChildren
    } catch (error) {
      throw new ApiError(
        `Failed to get child organizations for ${parentId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get parent organization chain
   */
  async getParentChain(organizationId: string): Promise<Organization[]> {
    const chain: Organization[] = []
    let currentId: string | null = organizationId

    while (currentId) {
      const org = await this.findById(currentId)
      chain.unshift(org) // Add to beginning of array
      currentId = org.parent_organization_id
    }

    return chain
  }

  // =============================================================================
  // BUSINESS RELATIONSHIPS
  // =============================================================================

  /**
   * Get organizations by type
   */
  async findByType(type: OrganizationType): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', type)
        .is('deleted_at', null)
        .order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get organizations of type: ${type}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get principals (organizations that own products)
   */
  async getPrincipals(): Promise<Organization[]> {
    return this.findByType('principal')
  }

  /**
   * Get distributors
   */
  async getDistributors(): Promise<Organization[]> {
    return this.findByType('distributor')
  }

  /**
   * Get customers and prospects
   */
  async getCustomers(): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .in('type', ['customer', 'prospect'])
        .is('deleted_at', null)
        .order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to get customers',
        500,
        error as any
      )
    }
  }

  /**
   * Get principal-distributor relationships for an organization
   */
  async getRelationships(organizationId: string): Promise<{
    as_principal: Array<Tables<'principal_distributor_relationships'>>
    as_distributor: Array<Tables<'principal_distributor_relationships'>>
  }> {
    try {
      // Get relationships where this org is the principal
      const { data: asPrincipal, error: principalError } = await supabase
        .from('principal_distributor_relationships')
        .select('*, distributor:distributor_id(*)')
        .eq('principal_id', organizationId)

      if (principalError) throw principalError

      // Get relationships where this org is the distributor
      const { data: asDistributor, error: distributorError } = await supabase
        .from('principal_distributor_relationships')
        .select('*, principal:principal_id(*)')
        .eq('distributor_id', organizationId)

      if (distributorError) throw distributorError

      return {
        as_principal: asPrincipal || [],
        as_distributor: asDistributor || []
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get relationships for organization: ${organizationId}`,
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  /**
   * Get organization summary with key metrics
   */
  async getSummary(id: string): Promise<OrganizationSummary> {
    try {
      const org = await this.findById(id)

      // Get contact count
      const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id)
        .is('deleted_at', null)

      // Get opportunity metrics
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('estimated_value, stage, updated_at')
        .eq('organization_id', id)
        .is('deleted_at', null)

      if (oppError) throw oppError

      const opportunityCount = opportunities?.length || 0
      const totalOpportunityValue = opportunities?.reduce(
        (sum, opp) => sum + (opp.estimated_value || 0), 0
      ) || 0
      const activeOpportunities = opportunities?.filter(
        opp => !['closed_won', 'closed_lost'].includes(opp.stage)
      ).length || 0

      // Get last activity date
      const lastActivityDate = opportunities?.length > 0 
        ? opportunities.reduce((latest, opp) => 
            opp.updated_at > latest ? opp.updated_at : latest, 
            opportunities[0].updated_at
          )
        : null

      // Get primary contact
      const { data: primaryContact } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', id)
        .eq('is_primary_contact', true)
        .is('deleted_at', null)
        .single()

      return {
        id: org.id,
        name: org.name,
        type: org.type,
        contact_count: contactCount || 0,
        opportunity_count: opportunityCount,
        total_opportunity_value: totalOpportunityValue,
        active_opportunities: activeOpportunities,
        last_activity_date: lastActivityDate,
        primary_contact: primaryContact || null
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get organization summary: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get organization metrics for analytics
   */
  async getMetrics(): Promise<OrganizationMetrics> {
    try {
      // Get counts by type
      const { data: typeStats, error: typeError } = await supabase
        .from('organizations')
        .select('type')
        .is('deleted_at', null)

      if (typeError) throw typeError

      const typeCounts = typeStats?.reduce((acc, org) => {
        acc[org.type] = (acc[org.type] || 0) + 1
        return acc
      }, {} as Record<OrganizationType, number>) || {}

      // Get total count
      const totalCount = typeStats?.length || 0

      // Get recent activity (created in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)

      return {
        total_count: totalCount,
        by_type: typeCounts,
        recent_additions: recentCount || 0,
        growth_rate: totalCount > 0 ? ((recentCount || 0) / totalCount) * 100 : 0
      }
    } catch (error) {
      throw new ApiError(
        'Failed to get organization metrics',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  protected async validateConstraints(
    data: any, 
    operation: 'create' | 'update' = 'create'
  ): Promise<void> {
    // Validate organization type for business rules
    if (data.type === 'principal' && operation === 'create') {
      // Principals should have business details
      if (!data.industry) {
        throw new ApiError(
          'Principal organizations must specify an industry',
          400
        )
      }
    }

    // Validate email format
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new ApiError('Invalid email format', 400)
      }
    }

    // Validate website format
    if (data.website) {
      const websiteRegex = /^https?:\/\/.+/
      if (!websiteRegex.test(data.website)) {
        throw new ApiError(
          'Website must start with http:// or https://',
          400
        )
      }
    }

    // Validate unique name within type
    await this.validateUniqueName(data.name, data.type, operation === 'update' ? data.id : undefined)
  }

  /**
   * Validate organization name is unique within its type
   */
  private async validateUniqueName(
    name: string, 
    type: OrganizationType, 
    excludeId?: string
  ): Promise<void> {
    if (!name) return

    try {
      let query = supabase
        .from('organizations')
        .select('id')
        .ilike('name', name)
        .eq('type', type)
        .is('deleted_at', null)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        throw new ApiError(
          `An organization with name "${name}" already exists for type "${type}"`,
          409
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(
        'Failed to validate organization name uniqueness',
        500,
        error as any
      )
    }
  }

  /**
   * Validate hierarchy to prevent circular references
   */
  private async validateHierarchy(
    organizationId: string, 
    newParentId: string
  ): Promise<void> {
    try {
      // Check if the new parent is a descendant of the current organization
      const descendants = await this.getChildOrganizations(organizationId, true)
      const descendantIds = descendants.map(d => d.id)

      if (descendantIds.includes(newParentId)) {
        throw new ApiError(
          'Cannot set parent organization - would create circular reference',
          400
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(
        'Failed to validate organization hierarchy',
        500,
        error as any
      )
    }
  }

  /**
   * Build hierarchy tree recursively
   */
  private async buildHierarchyTree(
    organization: Organization,
    level: number,
    maxDepth: number
  ): Promise<OrganizationTree> {
    const children: OrganizationTree[] = []
    let hasChildren = false

    if (level < maxDepth) {
      const childOrgs = await this.getChildOrganizations(organization.id, false)
      hasChildren = childOrgs.length > 0

      for (const child of childOrgs) {
        const childTree = await this.buildHierarchyTree(child, level + 1, maxDepth)
        children.push(childTree)
      }
    }

    return {
      organization,
      children,
      level,
      has_children: hasChildren
    }
  }

  // =============================================================================
  // SELECT FIELD BUILDER
  // =============================================================================

  protected buildSelectFields(include: string[]): string {
    const baseFields = '*'
    const relationMap: Record<string, string> = {
      'parent': 'parent_organization:parent_organization_id(*)',
      'children': 'child_organizations:organizations!parent_organization_id(*)',
      'contacts': 'contacts(*)',
      'opportunities': 'opportunities(*)',
      'products': 'products(*)',
      'principal_relationships': 'principal_distributor_relationships!principal_id(*)',
      'distributor_relationships': 'principal_distributor_relationships!distributor_id(*)'
    }

    const relations = include
      .filter(rel => relationMap[rel])
      .map(rel => relationMap[rel])

    return relations.length > 0 
      ? `${baseFields}, ${relations.join(', ')}` 
      : baseFields
  }
}

// =============================================================================
// SERVICE INSTANCE
// =============================================================================

export const organizationService = new OrganizationService()