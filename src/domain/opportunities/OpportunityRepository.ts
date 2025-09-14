import type { BaseRepository } from '../shared/BaseEntity'
import type { OpportunityDomain } from './OpportunityTypes'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type DatabaseOpportunity = Database['public']['Tables']['opportunities']['Row']
type DatabaseOpportunityInsert = Database['public']['Tables']['opportunities']['Insert']
type DatabaseOpportunityUpdate = Database['public']['Tables']['opportunities']['Update']

/**
 * Opportunity repository implementation using Supabase
 * Handles data persistence and retrieval for opportunities
 */
export class OpportunityRepository implements BaseRepository<OpportunityDomain> {
  /**
   * Convert database row to domain entity
   */
  private toDomainEntity(dbRow: DatabaseOpportunity): OpportunityDomain {
    return {
      id: dbRow.id,
      created_at: dbRow.created_at || '',
      updated_at: dbRow.updated_at || '',
      name: dbRow.name,
      organization_id: dbRow.organization_id,
      contact_id: dbRow.contact_id,
      principal_organization_id: dbRow.principal_organization_id,
      stage: dbRow.stage as OpportunityDomain['stage'],
      status: dbRow.status as OpportunityDomain['status'],
      estimated_value: dbRow.estimated_value || 0,
      close_date: dbRow.estimated_close_date, // Database uses estimated_close_date
      notes: dbRow.notes,
      context: dbRow.opportunity_context as OpportunityDomain['context'], // Database uses opportunity_context
      stage_updated_at: dbRow.updated_at, // Use general updated_at as fallback
    }
  }

  /**
   * Convert domain entity to database insert format
   */
  private toInsertFormat(
    entity: Omit<OpportunityDomain, 'id' | 'created_at' | 'updated_at'>
  ): DatabaseOpportunityInsert {
    return {
      name: entity.name,
      organization_id: entity.organization_id,
      contact_id: entity.contact_id,
      principal_organization_id: entity.principal_organization_id,
      stage: entity.stage,
      status: entity.status,
      estimated_value: entity.estimated_value,
      estimated_close_date: entity.close_date, // Database uses estimated_close_date
      notes: entity.notes,
      opportunity_context: entity.context, // Database uses opportunity_context
      // stage_changed_at field doesn't exist in database schema
    }
  }

  /**
   * Convert domain entity to database update format
   */
  private toUpdateFormat(entity: OpportunityDomain): DatabaseOpportunityUpdate {
    return {
      name: entity.name,
      organization_id: entity.organization_id,
      contact_id: entity.contact_id,
      principal_organization_id: entity.principal_organization_id,
      stage: entity.stage,
      status: entity.status,
      estimated_value: entity.estimated_value,
      estimated_close_date: entity.close_date, // Database uses estimated_close_date
      notes: entity.notes,
      opportunity_context: entity.context, // Database uses opportunity_context
      // stage_changed_at field doesn't exist in database schema
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Find opportunity by ID
   */
  async findById(id: string): Promise<OpportunityDomain | null> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .eq('deleted', false)
      .single()

    if (error || !data) {
      return null
    }

    return this.toDomainEntity(data)
  }

  /**
   * Find all opportunities
   */
  async findAll(): Promise<OpportunityDomain[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch opportunities: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Create new opportunity
   */
  async create(
    entity: Omit<OpportunityDomain, 'id' | 'created_at' | 'updated_at'>
  ): Promise<OpportunityDomain> {
    const insertData = this.toInsertFormat(entity)

    const { data, error } = await supabase
      .from('opportunities')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create opportunity: ${error.message}`)
    }

    return this.toDomainEntity(data)
  }

  /**
   * Update existing opportunity
   */
  async update(entity: OpportunityDomain): Promise<OpportunityDomain> {
    const updateData = this.toUpdateFormat(entity)

    const { data, error } = await supabase
      .from('opportunities')
      .update(updateData)
      .eq('id', entity.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update opportunity: ${error.message}`)
    }

    return this.toDomainEntity(data)
  }

  /**
   * Hard delete opportunity (rarely used)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('opportunities').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete opportunity: ${error.message}`)
    }
  }

  /**
   * Soft delete opportunity (preferred method)
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('opportunities')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to soft delete opportunity: ${error.message}`)
    }
  }

  /**
   * Find opportunities by organization ID
   */
  async findByOrganization(organizationId: string): Promise<OpportunityDomain[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch opportunities by organization: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find opportunities by stage
   */
  async findByStage(stage: string): Promise<OpportunityDomain[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('stage', stage)
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch opportunities by stage: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find active opportunities (not closed)
   */
  async findActive(): Promise<OpportunityDomain[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .not('stage', 'in', '("Closed - Won","Closed - Lost")')
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch active opportunities: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Count opportunities by organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    const { count, error } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('deleted', false)

    if (error) {
      throw new Error(`Failed to count opportunities by organization: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Find opportunities with relationships (for complex queries)
   */
  async findWithRelations(): Promise<OpportunityDomain[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select(
        `
        *,
        organization:organizations(*),
        contact:contacts(*),
        principal_organization:organizations!principal_organization_id(*)
      `
      )
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch opportunities with relations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }
}
