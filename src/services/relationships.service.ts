/**
 * Relationship Service for KitchenPantry CRM
 * 
 * Provides specialized operations for managing relationships between entities:
 * - Principal-Distributor business relationships
 * - Organization hierarchy management
 * - Cross-entity data integrity
 * - Relationship analytics and reporting
 */

import { supabase, ApiError, handleSupabaseResponse } from './api'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

// =============================================================================
// TYPES
// =============================================================================

type PrincipalDistributorRelationship = Tables<'principal_distributor_relationships'>
type PrincipalDistributorInsert = TablesInsert<'principal_distributor_relationships'>
type PrincipalDistributorUpdate = TablesUpdate<'principal_distributor_relationships'>

export interface RelationshipWithDetails extends PrincipalDistributorRelationship {
  principal?: Tables<'organizations'>
  distributor?: Tables<'organizations'>
}

export interface RelationshipSummary {
  id: string
  principal_name: string
  distributor_name: string
  is_active: boolean
  territory: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  annual_volume_commitment: number | null
  discount_tier: string | null
  days_until_expiry: number | null
  opportunity_count: number
  total_opportunity_value: number
  relationship_health: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface TerritoryAssignment {
  territory: string
  principal_count: number
  distributor_count: number
  relationship_count: number
  total_commitment: number
}

export interface ContractAlert {
  relationship: RelationshipWithDetails
  alert_type: 'expiring_soon' | 'expired' | 'no_commitment' | 'low_performance'
  days_until_expiry: number | null
  severity: 'high' | 'medium' | 'low'
  recommended_action: string
}

// =============================================================================
// RELATIONSHIPS SERVICE CLASS
// =============================================================================

export class RelationshipService {
  private readonly cache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  // =============================================================================
  // CORE CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new principal-distributor relationship
   */
  async createRelationship(data: {
    principal_id: string
    distributor_id: string
    territory?: string
    contract_start_date?: string
    contract_end_date?: string
    annual_volume_commitment?: number
    discount_tier?: string
  }): Promise<PrincipalDistributorRelationship> {
    try {
      // Validate that organizations exist and are correct types
      await this.validatePrincipalDistributorTypes(data.principal_id, data.distributor_id)

      // Check for existing relationship
      const existingRelationship = await this.findRelationship(data.principal_id, data.distributor_id)
      if (existingRelationship) {
        throw new ApiError(
          'A relationship already exists between these organizations',
          409
        )
      }

      const insertData: PrincipalDistributorInsert = {
        ...data,
        is_active: true
      }

      const { data: result, error } = await supabase
        .from('principal_distributor_relationships')
        .insert(insertData)
        .select()
        .single()

      const relationship = handleSupabaseResponse(result, error)
      this.invalidateCache()
      
      return relationship
    } catch (error) {
      throw new ApiError(
        'Failed to create principal-distributor relationship',
        500,
        error as any
      )
    }
  }

  /**
   * Update existing relationship
   */
  async updateRelationship(
    id: string,
    data: PrincipalDistributorUpdate
  ): Promise<PrincipalDistributorRelationship> {
    try {
      const { data: result, error } = await supabase
        .from('principal_distributor_relationships')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      const relationship = handleSupabaseResponse(result, error)
      this.invalidateCache()
      
      return relationship
    } catch (error) {
      throw new ApiError(
        `Failed to update relationship: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Deactivate relationship
   */
  async deactivateRelationship(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('principal_distributor_relationships')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      this.invalidateCache()
    } catch (error) {
      throw new ApiError(
        `Failed to deactivate relationship: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Reactivate relationship
   */
  async reactivateRelationship(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('principal_distributor_relationships')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      this.invalidateCache()
    } catch (error) {
      throw new ApiError(
        `Failed to reactivate relationship: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Delete relationship permanently
   */
  async deleteRelationship(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('principal_distributor_relationships')
        .delete()
        .eq('id', id)

      if (error) throw error
      this.invalidateCache()
    } catch (error) {
      throw new ApiError(
        `Failed to delete relationship: ${id}`,
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // RELATIONSHIP QUERIES
  // =============================================================================

  /**
   * Find specific relationship between principal and distributor
   */
  async findRelationship(
    principalId: string,
    distributorId: string
  ): Promise<RelationshipWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('principal_distributor_relationships')
        .select(`
          *,
          principal:principal_id(*),
          distributor:distributor_id(*)
        `)
        .eq('principal_id', principalId)
        .eq('distributor_id', distributorId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data || null
    } catch (error) {
      throw new ApiError(
        'Failed to find relationship',
        500,
        error as any
      )
    }
  }

  /**
   * Get all relationships for a principal
   */
  async getPrincipalRelationships(
    principalId: string,
    activeOnly = true
  ): Promise<RelationshipWithDetails[]> {
    try {
      let query = supabase
        .from('principal_distributor_relationships')
        .select(`
          *,
          principal:principal_id(*),
          distributor:distributor_id(*)
        `)
        .eq('principal_id', principalId)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get relationships for principal: ${principalId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get all relationships for a distributor
   */
  async getDistributorRelationships(
    distributorId: string,
    activeOnly = true
  ): Promise<RelationshipWithDetails[]> {
    try {
      let query = supabase
        .from('principal_distributor_relationships')
        .select(`
          *,
          principal:principal_id(*),
          distributor:distributor_id(*)
        `)
        .eq('distributor_id', distributorId)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get relationships for distributor: ${distributorId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get all active relationships
   */
  async getAllActiveRelationships(): Promise<RelationshipWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('principal_distributor_relationships')
        .select(`
          *,
          principal:principal_id(*),
          distributor:distributor_id(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to get all active relationships',
        500,
        error as any
      )
    }
  }

  /**
   * Search relationships by territory
   */
  async findByTerritory(territory: string): Promise<RelationshipWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('principal_distributor_relationships')
        .select(`
          *,
          principal:principal_id(*),
          distributor:distributor_id(*)
        `)
        .ilike('territory', `%${territory}%`)
        .eq('is_active', true)
        .order('territory')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to find relationships in territory: ${territory}`,
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // RELATIONSHIP ANALYTICS
  // =============================================================================

  /**
   * Get relationship summary with performance metrics
   */
  async getRelationshipSummary(id: string): Promise<RelationshipSummary> {
    try {
      const relationship = await this.getRelationshipWithDetails(id)

      // Calculate days until contract expiry
      let daysUntilExpiry: number | null = null
      if (relationship.contract_end_date) {
        const expiryDate = new Date(relationship.contract_end_date)
        const today = new Date()
        daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Get opportunity metrics for this relationship
      const { count: opportunityCount, totalValue } = await this.getRelationshipOpportunityMetrics(
        relationship.principal_id,
        relationship.distributor_id
      )

      // Calculate relationship health
      const relationshipHealth = this.calculateRelationshipHealth(relationship, opportunityCount, totalValue)

      return {
        id: relationship.id,
        principal_name: relationship.principal?.name || '',
        distributor_name: relationship.distributor?.name || '',
        is_active: relationship.is_active,
        territory: relationship.territory,
        contract_start_date: relationship.contract_start_date,
        contract_end_date: relationship.contract_end_date,
        annual_volume_commitment: relationship.annual_volume_commitment,
        discount_tier: relationship.discount_tier,
        days_until_expiry: daysUntilExpiry,
        opportunity_count: opportunityCount,
        total_opportunity_value: totalValue,
        relationship_health: relationshipHealth
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get relationship summary: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get territory assignments overview
   */
  async getTerritoryAssignments(): Promise<TerritoryAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('principal_distributor_relationships')
        .select('territory, annual_volume_commitment, principal_id, distributor_id')
        .eq('is_active', true)
        .not('territory', 'is', null)

      if (error) throw error

      // Group by territory
      const territoryMap = new Map<string, {
        principals: Set<string>
        distributors: Set<string>
        relationshipCount: number
        totalCommitment: number
      }>()

      data?.forEach(rel => {
        if (!rel.territory) return

        if (!territoryMap.has(rel.territory)) {
          territoryMap.set(rel.territory, {
            principals: new Set(),
            distributors: new Set(),
            relationshipCount: 0,
            totalCommitment: 0
          })
        }

        const territory = territoryMap.get(rel.territory)!
        territory.principals.add(rel.principal_id)
        territory.distributors.add(rel.distributor_id)
        territory.relationshipCount++
        territory.totalCommitment += rel.annual_volume_commitment || 0
      })

      return Array.from(territoryMap.entries()).map(([territory, data]) => ({
        territory,
        principal_count: data.principals.size,
        distributor_count: data.distributors.size,
        relationship_count: data.relationshipCount,
        total_commitment: data.totalCommitment
      })).sort((a, b) => b.total_commitment - a.total_commitment)
    } catch (error) {
      throw new ApiError(
        'Failed to get territory assignments',
        500,
        error as any
      )
    }
  }

  /**
   * Get contract alerts (expiring, expired, etc.)
   */
  async getContractAlerts(): Promise<ContractAlert[]> {
    try {
      const relationships = await this.getAllActiveRelationships()
      const alerts: ContractAlert[] = []
      const today = new Date()

      for (const relationship of relationships) {
        let daysUntilExpiry: number | null = null
        
        if (relationship.contract_end_date) {
          const expiryDate = new Date(relationship.contract_end_date)
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          // Contract expiring in 30 days
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            alerts.push({
              relationship,
              alert_type: 'expiring_soon',
              days_until_expiry: daysUntilExpiry,
              severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
              recommended_action: 'Contact distributor to discuss contract renewal'
            })
          }

          // Contract already expired
          if (daysUntilExpiry <= 0) {
            alerts.push({
              relationship,
              alert_type: 'expired',
              days_until_expiry: daysUntilExpiry,
              severity: 'high',
              recommended_action: 'Urgent: Renew contract or deactivate relationship'
            })
          }
        }

        // No volume commitment set
        if (!relationship.annual_volume_commitment) {
          alerts.push({
            relationship,
            alert_type: 'no_commitment',
            days_until_expiry: daysUntilExpiry,
            severity: 'medium',
            recommended_action: 'Set annual volume commitment target'
          })
        }

        // Low performance check would require opportunity data analysis
        // This is a placeholder for more complex performance metrics
        const { totalValue } = await this.getRelationshipOpportunityMetrics(
          relationship.principal_id,
          relationship.distributor_id
        )
        
        if (relationship.annual_volume_commitment && totalValue < relationship.annual_volume_commitment * 0.5) {
          alerts.push({
            relationship,
            alert_type: 'low_performance',
            days_until_expiry: daysUntilExpiry,
            severity: 'medium',
            recommended_action: 'Review performance and develop action plan'
          })
        }
      }

      // Sort by severity and days until expiry
      return alerts.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        const aSeverity = severityOrder[a.severity]
        const bSeverity = severityOrder[b.severity]
        
        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity
        }
        
        if (a.days_until_expiry && b.days_until_expiry) {
          return a.days_until_expiry - b.days_until_expiry
        }
        
        return 0
      })
    } catch (error) {
      throw new ApiError(
        'Failed to get contract alerts',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // CROSS-ENTITY OPERATIONS
  // =============================================================================

  /**
   * Get available distributors for a principal (not already in relationship)
   */
  async getAvailableDistributors(principalId: string): Promise<Tables<'organizations'>[]> {
    try {
      // Get all distributors
      const { data: allDistributors, error: distributorError } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', 'distributor')
        .is('deleted_at', null)

      if (distributorError) throw distributorError

      // Get existing relationships for this principal
      const existingRelationships = await this.getPrincipalRelationships(principalId, false)
      const existingDistributorIds = new Set(
        existingRelationships.map(rel => rel.distributor_id)
      )

      // Filter out distributors that already have relationships
      return (allDistributors || []).filter(
        distributor => !existingDistributorIds.has(distributor.id)
      )
    } catch (error) {
      throw new ApiError(
        `Failed to get available distributors for principal: ${principalId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get available principals for a distributor
   */
  async getAvailablePrincipals(distributorId: string): Promise<Tables<'organizations'>[]> {
    try {
      // Get all principals
      const { data: allPrincipals, error: principalError } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', 'principal')
        .is('deleted_at', null)

      if (principalError) throw principalError

      // Get existing relationships for this distributor
      const existingRelationships = await this.getDistributorRelationships(distributorId, false)
      const existingPrincipalIds = new Set(
        existingRelationships.map(rel => rel.principal_id)
      )

      // Filter out principals that already have relationships
      return (allPrincipals || []).filter(
        principal => !existingPrincipalIds.has(principal.id)
      )
    } catch (error) {
      throw new ApiError(
        `Failed to get available principals for distributor: ${distributorId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Transfer opportunities from one distributor to another in a relationship
   */
  async transferOpportunities(
    principalId: string,
    fromDistributorId: string,
    toDistributorId: string
  ): Promise<{ transferred: number; failed: number }> {
    try {
      // Validate relationships exist
      const fromRelationship = await this.findRelationship(principalId, fromDistributorId)
      const toRelationship = await this.findRelationship(principalId, toDistributorId)

      if (!fromRelationship) {
        throw new ApiError('Source relationship not found', 404)
      }
      if (!toRelationship) {
        throw new ApiError('Target relationship not found', 404)
      }

      // Get opportunities to transfer
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('principal_id', principalId)
        .eq('distributor_id', fromDistributorId)
        .not('stage', 'in', '(closed_won,closed_lost)')
        .is('deleted_at', null)

      if (oppError) throw oppError

      if (!opportunities || opportunities.length === 0) {
        return { transferred: 0, failed: 0 }
      }

      // Transfer opportunities
      const opportunityIds = opportunities.map(opp => opp.id)
      const { error: updateError } = await supabase
        .from('opportunities')
        .update({ distributor_id: toDistributorId })
        .in('id', opportunityIds)

      if (updateError) throw updateError

      return { transferred: opportunities.length, failed: 0 }
    } catch (error) {
      throw new ApiError(
        'Failed to transfer opportunities',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async getRelationshipWithDetails(id: string): Promise<RelationshipWithDetails> {
    try {
      const { data, error } = await supabase
        .from('principal_distributor_relationships')
        .select(`
          *,
          principal:principal_id(*),
          distributor:distributor_id(*)
        `)
        .eq('id', id)
        .single()

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(`Failed to get relationship: ${id}`, 500, error as any)
    }
  }

  private async getRelationshipOpportunityMetrics(
    principalId: string,
    distributorId: string
  ): Promise<{ count: number; totalValue: number }> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('estimated_value')
        .eq('principal_id', principalId)
        .eq('distributor_id', distributorId)
        .is('deleted_at', null)

      if (error) throw error

      const count = data?.length || 0
      const totalValue = data?.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0) || 0

      return { count, totalValue }
    } catch (error) {
      return { count: 0, totalValue: 0 }
    }
  }

  private calculateRelationshipHealth(
    relationship: RelationshipWithDetails,
    opportunityCount: number,
    totalValue: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0

    // Active relationship
    if (relationship.is_active) score += 20

    // Has contract dates
    if (relationship.contract_start_date && relationship.contract_end_date) score += 15

    // Has volume commitment
    if (relationship.annual_volume_commitment) score += 15

    // Has territory
    if (relationship.territory) score += 10

    // Opportunity activity
    if (opportunityCount > 0) score += 20
    if (opportunityCount >= 5) score += 10

    // Value performance
    if (relationship.annual_volume_commitment && totalValue > 0) {
      const performance = totalValue / relationship.annual_volume_commitment
      if (performance >= 1) score += 20
      else if (performance >= 0.75) score += 15
      else if (performance >= 0.5) score += 10
      else if (performance >= 0.25) score += 5
    }

    // Contract status
    if (relationship.contract_end_date) {
      const daysUntilExpiry = Math.ceil(
        (new Date(relationship.contract_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilExpiry > 365) score += 10
      else if (daysUntilExpiry > 90) score += 5
      else if (daysUntilExpiry <= 0) score -= 20
    }

    // Determine health level
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'fair'
    return 'poor'
  }

  private async validatePrincipalDistributorTypes(
    principalId: string,
    distributorId: string
  ): Promise<void> {
    try {
      // Validate principal
      const { data: principal, error: principalError } = await supabase
        .from('organizations')
        .select('id, type')
        .eq('id', principalId)
        .is('deleted_at', null)
        .single()

      if (principalError || !principal) {
        throw new ApiError('Principal organization not found', 404)
      }

      if (principal.type !== 'principal') {
        throw new ApiError('Organization must be of type "principal"', 400)
      }

      // Validate distributor
      const { data: distributor, error: distributorError } = await supabase
        .from('organizations')
        .select('id, type')
        .eq('id', distributorId)
        .is('deleted_at', null)
        .single()

      if (distributorError || !distributor) {
        throw new ApiError('Distributor organization not found', 404)
      }

      if (distributor.type !== 'distributor') {
        throw new ApiError('Organization must be of type "distributor"', 400)
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate organization types', 500, error as any)
    }
  }

  private invalidateCache(): void {
    this.cache.clear()
  }
}

// =============================================================================
// SERVICE INSTANCE
// =============================================================================

export const relationshipService = new RelationshipService()