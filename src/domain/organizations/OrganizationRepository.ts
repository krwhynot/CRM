import type { BaseRepository } from '../shared/BaseEntity'
import type { OrganizationDomain } from './OrganizationTypes'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type DatabaseOrganization = Database['public']['Tables']['organizations']['Row']
type DatabaseOrganizationInsert = Database['public']['Tables']['organizations']['Insert']
type DatabaseOrganizationUpdate = Database['public']['Tables']['organizations']['Update']

/**
 * Organization repository implementation using Supabase
 * Handles data persistence and retrieval for organizations
 */
export class OrganizationRepository implements BaseRepository<OrganizationDomain> {
  /**
   * Convert database row to domain entity
   */
  private toDomainEntity(dbRow: DatabaseOrganization): OrganizationDomain {
    return {
      id: dbRow.id,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      name: dbRow.name,
      type: dbRow.type as OrganizationDomain['type'],
      priority: dbRow.priority as OrganizationDomain['priority'],
      segment: dbRow.segment,
      is_principal: dbRow.is_principal,
      is_distributor: dbRow.is_distributor,
      description: dbRow.description,
      email: dbRow.email,
      phone: dbRow.phone,
      website: dbRow.website,
      address_line_1: dbRow.address_line_1,
      address_line_2: dbRow.address_line_2,
      city: dbRow.city,
      state_province: dbRow.state_province,
      postal_code: dbRow.postal_code,
      country: dbRow.country,
      industry: dbRow.industry,
      notes: dbRow.notes,
    }
  }

  /**
   * Convert domain entity to database insert format
   */
  private toInsertFormat(
    entity: Omit<OrganizationDomain, 'id' | 'created_at' | 'updated_at'>
  ): DatabaseOrganizationInsert {
    return {
      name: entity.name,
      type: entity.type,
      priority: entity.priority,
      segment: entity.segment,
      is_principal: entity.is_principal,
      is_distributor: entity.is_distributor,
      description: entity.description,
      email: entity.email,
      phone: entity.phone,
      website: entity.website,
      address_line_1: entity.address_line_1,
      address_line_2: entity.address_line_2,
      city: entity.city,
      state_province: entity.state_province,
      postal_code: entity.postal_code,
      country: entity.country,
      industry: entity.industry,
      notes: entity.notes,
    }
  }

  /**
   * Convert domain entity to database update format
   */
  private toUpdateFormat(entity: OrganizationDomain): DatabaseOrganizationUpdate {
    return {
      name: entity.name,
      type: entity.type,
      priority: entity.priority,
      segment: entity.segment,
      is_principal: entity.is_principal,
      is_distributor: entity.is_distributor,
      description: entity.description,
      email: entity.email,
      phone: entity.phone,
      website: entity.website,
      address_line_1: entity.address_line_1,
      address_line_2: entity.address_line_2,
      city: entity.city,
      state_province: entity.state_province,
      postal_code: entity.postal_code,
      country: entity.country,
      industry: entity.industry,
      notes: entity.notes,
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<OrganizationDomain | null> {
    const { data, error } = await supabase
      .from('organizations')
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
   * Find all organizations
   */
  async findAll(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('deleted', false)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Create new organization
   */
  async create(
    entity: Omit<OrganizationDomain, 'id' | 'created_at' | 'updated_at'>
  ): Promise<OrganizationDomain> {
    const insertData = this.toInsertFormat(entity)

    const { data, error } = await supabase
      .from('organizations')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`)
    }

    return this.toDomainEntity(data)
  }

  /**
   * Update existing organization
   */
  async update(entity: OrganizationDomain): Promise<OrganizationDomain> {
    const updateData = this.toUpdateFormat(entity)

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', entity.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`)
    }

    return this.toDomainEntity(data)
  }

  /**
   * Hard delete organization (rarely used)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('organizations').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete organization: ${error.message}`)
    }
  }

  /**
   * Soft delete organization (preferred method)
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to soft delete organization: ${error.message}`)
    }
  }

  /**
   * Find organizations by type
   */
  async findByType(type: string): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('type', type)
      .eq('deleted', false)
      .order('priority', { ascending: true }) // A priority first
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations by type: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find organizations by priority
   */
  async findByPriority(priority: string): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('priority', priority)
      .eq('deleted', false)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations by priority: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find organizations by segment
   */
  async findBySegment(segment: string): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('segment', segment)
      .eq('deleted', false)
      .order('priority', { ascending: true }) // A priority first
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations by segment: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find customer organizations (can have opportunities)
   */
  async findCustomers(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .in('type', ['customer', 'prospect'])
      .eq('deleted', false)
      .order('priority', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch customer organizations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find principal organizations
   */
  async findPrincipals(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_principal', true)
      .eq('deleted', false)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch principal organizations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find distributor organizations
   */
  async findDistributors(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_distributor', true)
      .eq('deleted', false)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch distributor organizations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find high-priority organizations (A and B priority)
   */
  async findHighPriority(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .in('priority', ['A', 'B'])
      .eq('deleted', false)
      .order('priority', { ascending: true }) // A first, then B
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch high-priority organizations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Search organizations by name
   */
  async search(searchTerm: string): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .eq('deleted', false)
      .order('priority', { ascending: true })
      .order('name', { ascending: true })
      .limit(50) // Limit search results

    if (error) {
      throw new Error(`Failed to search organizations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find organizations with email addresses
   */
  async findWithEmail(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .not('email', 'is', null)
      .neq('email', '')
      .eq('deleted', false)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations with email: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find organizations in specific geographic area
   */
  async findByLocation(
    city?: string,
    state?: string,
    country?: string
  ): Promise<OrganizationDomain[]> {
    let query = supabase.from('organizations').select('*').eq('deleted', false)

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (state) {
      query = query.ilike('state_province', `%${state}%`)
    }

    if (country) {
      query = query.ilike('country', `%${country}%`)
    }

    const { data, error } = await query
      .order('priority', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations by location: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find organizations with relationships (for complex queries)
   */
  async findWithRelations(): Promise<OrganizationDomain[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select(
        `
        *,
        contacts(count),
        opportunities(count, stage, estimated_value),
        interactions(count, interaction_date)
      `
      )
      .eq('deleted', false)
      .order('priority', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch organizations with relations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Count organizations by criteria
   */
  async countByType(type: string): Promise<number> {
    const { count, error } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('deleted', false)

    if (error) {
      throw new Error(`Failed to count organizations by type: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Count organizations by priority
   */
  async countByPriority(priority: string): Promise<number> {
    const { count, error } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('priority', priority)
      .eq('deleted', false)

    if (error) {
      throw new Error(`Failed to count organizations by priority: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Count organizations by segment
   */
  async countBySegment(segment: string): Promise<number> {
    const { count, error } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('segment', segment)
      .eq('deleted', false)

    if (error) {
      throw new Error(`Failed to count organizations by segment: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Find organizations by name (exact match for uniqueness checks)
   */
  async findByName(name: string, excludeId?: string): Promise<OrganizationDomain[]> {
    let query = supabase.from('organizations').select('*').ilike('name', name).eq('deleted', false)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find organizations by name: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Get organization statistics
   */
  async getStatistics(): Promise<{
    total: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    bySegment: Record<string, number>
  }> {
    const { data, error } = await supabase
      .from('organizations')
      .select('type, priority, segment')
      .eq('deleted', false)

    if (error) {
      throw new Error(`Failed to fetch organization statistics: ${error.message}`)
    }

    const stats = {
      total: data.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      bySegment: {} as Record<string, number>,
    }

    data.forEach((org) => {
      // Count by type
      stats.byType[org.type] = (stats.byType[org.type] || 0) + 1

      // Count by priority
      stats.byPriority[org.priority] = (stats.byPriority[org.priority] || 0) + 1

      // Count by segment
      stats.bySegment[org.segment] = (stats.bySegment[org.segment] || 0) + 1
    })

    return stats
  }
}
