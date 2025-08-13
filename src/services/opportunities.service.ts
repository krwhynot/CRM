/**
 * Opportunity Service for KitchenPantry CRM
 * 
 * Provides type-safe CRUD operations for opportunities including:
 * - Sales pipeline management
 * - Stage progression validation
 * - Principal-distributor-customer relationship tracking
 * - Probability and value calculations
 * - Forecasting and analytics
 */

import { BaseService } from './baseService'
import type { 
  Tables, 
  TablesInsert, 
  TablesUpdate, 
  Enums 
} from '@/types/database.types'
import type { 
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  OpportunityMetrics,
  SalesPipeline,
  SalesForecast
} from '@/types'
import { ApiError, supabase, handleSupabaseResponse } from './api'

// =============================================================================
// TYPES
// =============================================================================

type Opportunity = Tables<'opportunities'>
type OpportunityInsert = TablesInsert<'opportunities'>
type OpportunityUpdate = TablesUpdate<'opportunities'>
type OpportunityStage = Enums<'opportunity_stage'>
type PriorityLevel = Enums<'priority_level'>

export interface OpportunityWithRelations extends Opportunity {
  organization?: Tables<'organizations'>
  primary_contact?: Tables<'contacts'>
  principal?: Tables<'organizations'>
  distributor?: Tables<'organizations'>
  opportunity_products?: Array<Tables<'opportunity_products'> & {
    product?: Tables<'products'>
  }>
  interactions?: Array<Tables<'interactions'>>
}

export interface OpportunitySearchOptions {
  query?: string
  organizationId?: string
  stage?: OpportunityStage[]
  priority?: PriorityLevel[]
  principalId?: string
  distributorId?: string
  contactId?: string
  valueRange?: { min?: number; max?: number }
  probabilityRange?: { min?: number; max?: number }
  dateRange?: { start?: string; end?: string }
  closingWithin?: number // days
}

export interface OpportunitySummary {
  id: string
  name: string
  organization_name: string
  stage: OpportunityStage
  priority: PriorityLevel
  estimated_value: number | null
  probability: number
  expected_close_date: string | null
  primary_contact_name: string | null
  principal_name: string | null
  distributor_name: string | null
  product_count: number
  interaction_count: number
  last_interaction_date: string | null
  days_in_stage: number
  weighted_value: number
}

export interface StageProgression {
  from_stage: OpportunityStage
  to_stage: OpportunityStage
  is_valid: boolean
  reason?: string
}

export interface OpportunityProduct {
  product_id: string
  product_name: string
  quantity: number | null
  unit_price: number | null
  discount_percentage: number
  total_value: number | null
  is_primary_product: boolean
}

// =============================================================================
// OPPORTUNITY SERVICE CLASS
// =============================================================================

export class OpportunityService extends BaseService<
  Opportunity,
  OpportunityInsert,
  OpportunityUpdate
> {
  private readonly stageOrder: OpportunityStage[] = [
    'lead',
    'qualified', 
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
  ]

  private readonly defaultProbabilities: Record<OpportunityStage, number> = {
    'lead': 10,
    'qualified': 25,
    'proposal': 50,
    'negotiation': 75,
    'closed_won': 100,
    'closed_lost': 0,
    'on_hold': 25
  }

  constructor() {
    super('opportunities')
  }

  // =============================================================================
  // ENHANCED CRUD OPERATIONS
  // =============================================================================

  /**
   * Create opportunity with business logic validation
   */
  async create(data: CreateOpportunitySchema): Promise<Opportunity> {
    // Validate required fields
    this.validateRequiredFields(data, ['organization_id', 'name'])
    
    // Validate business constraints
    await this.validateConstraints(data, 'create')

    // Set default probability based on stage
    const stage = data.stage || 'lead'
    const probability = data.probability !== undefined 
      ? data.probability 
      : this.defaultProbabilities[stage]

    const insertData: OpportunityInsert = {
      ...data,
      stage,
      priority: data.priority || 'medium',
      probability
    }

    return super.create(insertData)
  }

  /**
   * Update opportunity with stage progression validation
   */
  async update(id: string, data: UpdateOpportunitySchema): Promise<Opportunity> {
    // Validate constraints
    await this.validateConstraints(data, 'update')

    // Validate stage progression if stage is being changed
    if (data.stage) {
      const currentOpportunity = await this.findById(id)
      await this.validateStageProgression(currentOpportunity.stage, data.stage)
      
      // Update probability if stage changed but probability wasn't explicitly set
      if (data.probability === undefined && data.stage !== currentOpportunity.stage) {
        data.probability = this.defaultProbabilities[data.stage]
      }
    }

    // Set close date for closed stages
    if (data.stage === 'closed_won' || data.stage === 'closed_lost') {
      if (!data.actual_close_date) {
        data.actual_close_date = new Date().toISOString().split('T')[0]
      }
    }

    const updateData: OpportunityUpdate = { ...data }
    return super.update(id, updateData)
  }

  /**
   * Get opportunity with all related data
   */
  async findByIdWithRelations(
    id: string,
    options: {
      includeOrganization?: boolean
      includeContact?: boolean
      includePrincipal?: boolean
      includeDistributor?: boolean
      includeProducts?: boolean
      includeInteractions?: boolean
    } = {}
  ): Promise<OpportunityWithRelations> {
    try {
      const {
        includeOrganization = true,
        includeContact = true,
        includePrincipal = true,
        includeDistributor = true,
        includeProducts = false,
        includeInteractions = false
      } = options

      let selectFields = '*'

      // Build select fields based on options
      const relations = []
      if (includeOrganization) relations.push('organization:organization_id(*)')
      if (includeContact) relations.push('primary_contact:primary_contact_id(*)')
      if (includePrincipal) relations.push('principal:principal_id(*)')
      if (includeDistributor) relations.push('distributor:distributor_id(*)')
      if (includeProducts) {
        relations.push('opportunity_products!opportunity_id(*, product:product_id(*))')
      }
      if (includeInteractions) relations.push('interactions!opportunity_id(*)')

      if (relations.length > 0) {
        selectFields = `*, ${relations.join(', ')}`
      }

      const { data, error } = await supabase
        .from('opportunities')
        .select(selectFields)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to fetch opportunity with relations: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Advanced search with opportunity-specific filters
   */
  async search(options: OpportunitySearchOptions = {}): Promise<Opportunity[]> {
    try {
      const {
        query,
        organizationId,
        stage,
        priority,
        principalId,
        distributorId,
        contactId,
        valueRange,
        probabilityRange,
        dateRange,
        closingWithin
      } = options

      let searchQuery = supabase
        .from('opportunities')
        .select('*')
        .is('deleted_at', null)

      // Text search
      if (query) {
        searchQuery = searchQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,source.ilike.%${query}%`
        )
      }

      // Organization filter
      if (organizationId) {
        searchQuery = searchQuery.eq('organization_id', organizationId)
      }

      // Stage filter
      if (stage && stage.length > 0) {
        searchQuery = searchQuery.in('stage', stage)
      }

      // Priority filter
      if (priority && priority.length > 0) {
        searchQuery = searchQuery.in('priority', priority)
      }

      // Principal filter
      if (principalId) {
        searchQuery = searchQuery.eq('principal_id', principalId)
      }

      // Distributor filter
      if (distributorId) {
        searchQuery = searchQuery.eq('distributor_id', distributorId)
      }

      // Contact filter
      if (contactId) {
        searchQuery = searchQuery.eq('primary_contact_id', contactId)
      }

      // Value range filter
      if (valueRange) {
        if (valueRange.min !== undefined) {
          searchQuery = searchQuery.gte('estimated_value', valueRange.min)
        }
        if (valueRange.max !== undefined) {
          searchQuery = searchQuery.lte('estimated_value', valueRange.max)
        }
      }

      // Probability range filter
      if (probabilityRange) {
        if (probabilityRange.min !== undefined) {
          searchQuery = searchQuery.gte('probability', probabilityRange.min)
        }
        if (probabilityRange.max !== undefined) {
          searchQuery = searchQuery.lte('probability', probabilityRange.max)
        }
      }

      // Date range filter (using expected_close_date)
      if (dateRange) {
        if (dateRange.start) {
          searchQuery = searchQuery.gte('expected_close_date', dateRange.start)
        }
        if (dateRange.end) {
          searchQuery = searchQuery.lte('expected_close_date', dateRange.end)
        }
      }

      // Closing within X days filter
      if (closingWithin) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + closingWithin)
        const futureDateStr = futureDate.toISOString().split('T')[0]
        
        searchQuery = searchQuery
          .gte('expected_close_date', new Date().toISOString().split('T')[0])
          .lte('expected_close_date', futureDateStr)
      }

      const { data, error } = await searchQuery.order('updated_at', { ascending: false })

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to search opportunities',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // PIPELINE MANAGEMENT
  // =============================================================================

  /**
   * Get sales pipeline overview
   */
  async getPipeline(): Promise<SalesPipeline> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('stage, estimated_value, probability')
        .not('stage', 'in', '(closed_won,closed_lost)')
        .is('deleted_at', null)

      if (error) throw error

      const pipeline: Record<OpportunityStage, { count: number; total_value: number; weighted_value: number }> = {
        'lead': { count: 0, total_value: 0, weighted_value: 0 },
        'qualified': { count: 0, total_value: 0, weighted_value: 0 },
        'proposal': { count: 0, total_value: 0, weighted_value: 0 },
        'negotiation': { count: 0, total_value: 0, weighted_value: 0 },
        'closed_won': { count: 0, total_value: 0, weighted_value: 0 },
        'closed_lost': { count: 0, total_value: 0, weighted_value: 0 },
        'on_hold': { count: 0, total_value: 0, weighted_value: 0 }
      }

      data?.forEach(opportunity => {
        const stage = opportunity.stage
        const value = opportunity.estimated_value || 0
        const probability = opportunity.probability || 0
        
        pipeline[stage].count++
        pipeline[stage].total_value += value
        pipeline[stage].weighted_value += value * (probability / 100)
      })

      const totalCount = data?.length || 0
      const totalValue = Object.values(pipeline).reduce((sum, stage) => sum + stage.total_value, 0)
      const totalWeightedValue = Object.values(pipeline).reduce((sum, stage) => sum + stage.weighted_value, 0)

      return {
        stages: pipeline,
        total_count: totalCount,
        total_value: totalValue,
        total_weighted_value: totalWeightedValue,
        conversion_rates: await this.getConversionRates()
      }
    } catch (error) {
      throw new ApiError(
        'Failed to get sales pipeline',
        500,
        error as any
      )
    }
  }

  /**
   * Get opportunities by stage
   */
  async findByStage(stage: OpportunityStage): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('stage', stage)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get opportunities in stage: ${stage}`,
        500,
        error as any
      )
    }
  }

  /**
   * Move opportunity to next stage
   */
  async advanceStage(
    opportunityId: string,
    notes?: string
  ): Promise<Opportunity> {
    try {
      const opportunity = await this.findById(opportunityId)
      const currentStageIndex = this.stageOrder.indexOf(opportunity.stage)
      
      if (currentStageIndex === -1 || currentStageIndex >= this.stageOrder.length - 1) {
        throw new ApiError('Cannot advance opportunity from current stage', 400)
      }

      const nextStage = this.stageOrder[currentStageIndex + 1]
      const updateData: OpportunityUpdate = {
        stage: nextStage,
        probability: this.defaultProbabilities[nextStage]
      }

      // Add close date for final stages
      if (nextStage === 'closed_won' || nextStage === 'closed_lost') {
        updateData.actual_close_date = new Date().toISOString().split('T')[0]
        if (nextStage === 'closed_lost' && notes) {
          updateData.reason_lost = notes
        }
      }

      return this.update(opportunityId, updateData)
    } catch (error) {
      throw new ApiError(
        `Failed to advance opportunity stage: ${opportunityId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get stage conversion rates
   */
  private async getConversionRates(): Promise<Record<string, number>> {
    try {
      // This is a simplified version - in a real implementation, you'd analyze historical data
      const { data, error } = await supabase
        .from('opportunities')
        .select('stage')
        .in('stage', ['closed_won', 'closed_lost'])
        .is('deleted_at', null)

      if (error) throw error

      const closedOpportunities = data || []
      const totalClosed = closedOpportunities.length
      const wonCount = closedOpportunities.filter(o => o.stage === 'closed_won').length

      return {
        'lead_to_qualified': 60, // placeholder values
        'qualified_to_proposal': 70,
        'proposal_to_negotiation': 80,
        'negotiation_to_closed': 85,
        'overall_win_rate': totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0
      }
    } catch (error) {
      return {
        'lead_to_qualified': 0,
        'qualified_to_proposal': 0,
        'proposal_to_negotiation': 0,
        'negotiation_to_closed': 0,
        'overall_win_rate': 0
      }
    }
  }

  // =============================================================================
  // FORECASTING AND ANALYTICS
  // =============================================================================

  /**
   * Get sales forecast
   */
  async getForecast(
    months: number = 3
  ): Promise<SalesForecast> {
    try {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + months)
      const endDateStr = endDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('opportunities')
        .select('stage, estimated_value, probability, expected_close_date')
        .not('stage', 'in', '(closed_won,closed_lost)')
        .lte('expected_close_date', endDateStr)
        .is('deleted_at', null)

      if (error) throw error

      const opportunities = data || []
      
      // Calculate forecast values
      const bestCase = opportunities.reduce((sum, opp) => 
        sum + (opp.estimated_value || 0), 0)
      
      const mostLikely = opportunities.reduce((sum, opp) => 
        sum + (opp.estimated_value || 0) * ((opp.probability || 0) / 100), 0)
      
      const conservative = opportunities
        .filter(opp => (opp.probability || 0) >= 75)
        .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)

      // Group by month for timeline
      const monthlyForecast: Array<{
        month: string
        best_case: number
        most_likely: number
        conservative: number
        opportunity_count: number
      }> = []

      for (let i = 0; i < months; i++) {
        const monthStart = new Date()
        monthStart.setMonth(monthStart.getMonth() + i)
        monthStart.setDate(1)
        
        const monthEnd = new Date(monthStart)
        monthEnd.setMonth(monthEnd.getMonth() + 1)
        monthEnd.setDate(0)
        
        const monthOpps = opportunities.filter(opp => {
          if (!opp.expected_close_date) return false
          const closeDate = new Date(opp.expected_close_date)
          return closeDate >= monthStart && closeDate <= monthEnd
        })

        monthlyForecast.push({
          month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
          best_case: monthOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0),
          most_likely: monthOpps.reduce((sum, opp) => 
            sum + (opp.estimated_value || 0) * ((opp.probability || 0) / 100), 0),
          conservative: monthOpps
            .filter(opp => (opp.probability || 0) >= 75)
            .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0),
          opportunity_count: monthOpps.length
        })
      }

      return {
        period_months: months,
        best_case: bestCase,
        most_likely: mostLikely,
        conservative: conservative,
        opportunity_count: opportunities.length,
        monthly_breakdown: monthlyForecast
      }
    } catch (error) {
      throw new ApiError(
        'Failed to get sales forecast',
        500,
        error as any
      )
    }
  }

  /**
   * Get opportunity summary with metrics
   */
  async getSummary(id: string): Promise<OpportunitySummary> {
    try {
      const opportunityData = await this.findByIdWithRelations(id, {
        includeOrganization: true,
        includeContact: true,
        includePrincipal: true,
        includeDistributor: true,
        includeProducts: false,
        includeInteractions: false
      })

      // Get product count
      const { count: productCount } = await supabase
        .from('opportunity_products')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', id)

      // Get interaction count and last interaction date
      const { data: interactions, error: interactionError } = await supabase
        .from('interactions')
        .select('scheduled_at, completed_at')
        .eq('opportunity_id', id)
        .is('deleted_at', null)
        .order('scheduled_at', { ascending: false })

      if (interactionError) throw interactionError

      const interactionCount = interactions?.length || 0
      const lastInteractionDate = interactions?.[0]?.completed_at || interactions?.[0]?.scheduled_at || null

      // Calculate days in current stage
      const stageChangeDate = new Date(opportunityData.updated_at)
      const today = new Date()
      const daysInStage = Math.floor((today.getTime() - stageChangeDate.getTime()) / (1000 * 60 * 60 * 24))

      // Calculate weighted value
      const weightedValue = (opportunityData.estimated_value || 0) * (opportunityData.probability / 100)

      return {
        id: opportunityData.id,
        name: opportunityData.name,
        organization_name: opportunityData.organization?.name || '',
        stage: opportunityData.stage,
        priority: opportunityData.priority,
        estimated_value: opportunityData.estimated_value,
        probability: opportunityData.probability,
        expected_close_date: opportunityData.expected_close_date,
        primary_contact_name: opportunityData.primary_contact
          ? `${opportunityData.primary_contact.first_name} ${opportunityData.primary_contact.last_name}`
          : null,
        principal_name: opportunityData.principal?.name || null,
        distributor_name: opportunityData.distributor?.name || null,
        product_count: productCount || 0,
        interaction_count: interactionCount,
        last_interaction_date: lastInteractionDate,
        days_in_stage: daysInStage,
        weighted_value: weightedValue
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get opportunity summary: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get opportunity metrics for analytics
   */
  async getMetrics(): Promise<OpportunityMetrics> {
    try {
      // Get total opportunities
      const { data: allOpportunities, error: allError } = await supabase
        .from('opportunities')
        .select('stage, estimated_value, probability, created_at')
        .is('deleted_at', null)

      if (allError) throw allError

      const totalCount = allOpportunities?.length || 0

      // Calculate stage distribution
      const stageDistribution = (allOpportunities || []).reduce((acc, opp) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1
        return acc
      }, {} as Record<OpportunityStage, number>)

      // Calculate total and weighted values
      const totalValue = (allOpportunities || []).reduce((sum, opp) => 
        sum + (opp.estimated_value || 0), 0)
      
      const weightedValue = (allOpportunities || []).reduce((sum, opp) => 
        sum + (opp.estimated_value || 0) * ((opp.probability || 0) / 100), 0)

      // Get recent opportunities (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentOpportunities = (allOpportunities || []).filter(
        opp => new Date(opp.created_at) >= thirtyDaysAgo
      )

      // Calculate win rate
      const closedOpportunities = (allOpportunities || []).filter(
        opp => opp.stage === 'closed_won' || opp.stage === 'closed_lost'
      )
      const wonOpportunities = closedOpportunities.filter(opp => opp.stage === 'closed_won')
      const winRate = closedOpportunities.length > 0 
        ? (wonOpportunities.length / closedOpportunities.length) * 100 
        : 0

      // Calculate average deal size
      const activeOpportunities = (allOpportunities || []).filter(
        opp => !['closed_won', 'closed_lost'].includes(opp.stage) && opp.estimated_value
      )
      const averageDealSize = activeOpportunities.length > 0
        ? activeOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0) / activeOpportunities.length
        : 0

      return {
        total_count: totalCount,
        by_stage: stageDistribution,
        total_value: totalValue,
        weighted_value: weightedValue,
        win_rate: winRate,
        average_deal_size: averageDealSize,
        recent_additions: recentOpportunities.length,
        conversion_rates: await this.getConversionRates()
      }
    } catch (error) {
      throw new ApiError(
        'Failed to get opportunity metrics',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // PRODUCT MANAGEMENT
  // =============================================================================

  /**
   * Add products to opportunity
   */
  async addProducts(
    opportunityId: string,
    products: Array<{
      product_id: string
      quantity?: number
      unit_price?: number
      discount_percentage?: number
      is_primary_product?: boolean
    }>
  ): Promise<void> {
    try {
      // Validate opportunity exists
      await this.findById(opportunityId)

      // Clear existing primary product if setting a new one
      const newPrimary = products.find(p => p.is_primary_product)
      if (newPrimary) {
        await supabase
          .from('opportunity_products')
          .update({ is_primary_product: false })
          .eq('opportunity_id', opportunityId)
          .eq('is_primary_product', true)
      }

      // Prepare product data with calculated values
      const productData = products.map(product => {
        const quantity = product.quantity || 1
        const unitPrice = product.unit_price || 0
        const discountPercentage = product.discount_percentage || 0
        const discountAmount = (unitPrice * quantity) * (discountPercentage / 100)
        const totalValue = (unitPrice * quantity) - discountAmount

        return {
          opportunity_id: opportunityId,
          product_id: product.product_id,
          quantity,
          unit_price: unitPrice,
          discount_percentage: discountPercentage,
          total_value: totalValue,
          is_primary_product: product.is_primary_product || false
        }
      })

      const { error } = await supabase
        .from('opportunity_products')
        .insert(productData)

      if (error) throw error

      // Update opportunity estimated value based on products
      await this.updateEstimatedValue(opportunityId)

      this.invalidateCache()
    } catch (error) {
      throw new ApiError(
        `Failed to add products to opportunity: ${opportunityId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get products for an opportunity
   */
  async getProducts(opportunityId: string): Promise<OpportunityProduct[]> {
    try {
      const { data, error } = await supabase
        .from('opportunity_products')
        .select(`
          product_id,
          quantity,
          unit_price,
          discount_percentage,
          total_value,
          is_primary_product,
          product:product_id(name)
        `)
        .eq('opportunity_id', opportunityId)

      if (error) throw error

      return (data || []).map(item => ({
        product_id: item.product_id,
        product_name: (item.product as any)?.name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        total_value: item.total_value,
        is_primary_product: item.is_primary_product
      }))
    } catch (error) {
      throw new ApiError(
        `Failed to get products for opportunity: ${opportunityId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Update estimated value based on opportunity products
   */
  private async updateEstimatedValue(opportunityId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('opportunity_products')
        .select('total_value')
        .eq('opportunity_id', opportunityId)

      if (error) throw error

      const estimatedValue = (data || []).reduce(
        (sum, product) => sum + (product.total_value || 0), 0
      )

      if (estimatedValue > 0) {
        await supabase
          .from('opportunities')
          .update({ estimated_value: estimatedValue })
          .eq('id', opportunityId)
      }
    } catch (error) {
      // Non-critical error, log but don't throw
      console.error('Failed to update estimated value:', error)
    }
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  protected async validateConstraints(
    data: any, 
    operation: 'create' | 'update' = 'create'
  ): Promise<void> {
    // Validate probability range
    if (data.probability !== undefined && (data.probability < 0 || data.probability > 100)) {
      throw new ApiError('Probability must be between 0 and 100', 400)
    }

    // Validate estimated value is positive
    if (data.estimated_value !== undefined && data.estimated_value !== null && data.estimated_value < 0) {
      throw new ApiError('Estimated value must be positive', 400)
    }

    // Validate date formats and logic
    if (data.expected_close_date) {
      const expectedDate = new Date(data.expected_close_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (expectedDate < today) {
        throw new ApiError('Expected close date cannot be in the past', 400)
      }
    }

    // Validate organization exists
    if (data.organization_id) {
      await this.validateEntityExists('organizations', data.organization_id, 'Organization')
    }

    // Validate contact belongs to organization (if both provided)
    if (data.primary_contact_id && data.organization_id) {
      await this.validateContactBelongsToOrganization(data.primary_contact_id, data.organization_id)
    }

    // Validate principal and distributor are correct organization types
    if (data.principal_id) {
      await this.validateOrganizationType(data.principal_id, 'principal')
    }

    if (data.distributor_id) {
      await this.validateOrganizationType(data.distributor_id, 'distributor')
    }
  }

  /**
   * Validate stage progression is allowed
   */
  private async validateStageProgression(
    fromStage: OpportunityStage,
    toStage: OpportunityStage
  ): Promise<void> {
    // Allow any transition for now - in a real implementation, you might have business rules
    // For example, might not allow going backward in the pipeline
    const fromIndex = this.stageOrder.indexOf(fromStage)
    const toIndex = this.stageOrder.indexOf(toStage)

    // Example rule: no going backward (except to on_hold)
    if (toStage !== 'on_hold' && toIndex < fromIndex && fromStage !== 'on_hold') {
      throw new ApiError(
        `Cannot move opportunity from ${fromStage} to ${toStage}`,
        400
      )
    }
  }

  /**
   * Validate entity exists in given table
   */
  private async validateEntityExists(
    table: string,
    id: string,
    entityName: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new ApiError(`${entityName} not found`, 404)
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(`Failed to validate ${entityName}`, 500, error as any)
    }
  }

  /**
   * Validate contact belongs to organization
   */
  private async validateContactBelongsToOrganization(
    contactId: string,
    organizationId: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('organization_id')
        .eq('id', contactId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new ApiError('Contact not found', 404)
      }

      if (data.organization_id !== organizationId) {
        throw new ApiError('Contact does not belong to the specified organization', 400)
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate contact-organization relationship', 500, error as any)
    }
  }

  /**
   * Validate organization type
   */
  private async validateOrganizationType(
    organizationId: string,
    expectedType: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('type')
        .eq('id', organizationId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new ApiError('Organization not found', 404)
      }

      if (data.type !== expectedType) {
        throw new ApiError(
          `Organization must be of type '${expectedType}', found '${data.type}'`,
          400
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate organization type', 500, error as any)
    }
  }

  // =============================================================================
  // SELECT FIELD BUILDER
  // =============================================================================

  protected buildSelectFields(include: string[]): string {
    const baseFields = '*'
    const relationMap: Record<string, string> = {
      'organization': 'organization:organization_id(*)',
      'contact': 'primary_contact:primary_contact_id(*)',
      'principal': 'principal:principal_id(*)',
      'distributor': 'distributor:distributor_id(*)',
      'products': 'opportunity_products!opportunity_id(*, product:product_id(*))',
      'interactions': 'interactions!opportunity_id(*)'
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

export const opportunityService = new OpportunityService()