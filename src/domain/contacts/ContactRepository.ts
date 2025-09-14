import type { BaseRepository } from '../shared/BaseEntity'
import type { ContactDomain } from './ContactTypes'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type DatabaseContact = Database['public']['Tables']['contacts']['Row']
type DatabaseContactInsert = Database['public']['Tables']['contacts']['Insert']
type DatabaseContactUpdate = Database['public']['Tables']['contacts']['Update']

/**
 * Contact repository implementation using Supabase
 * Handles data persistence and retrieval for contacts
 */
export class ContactRepository implements BaseRepository<ContactDomain> {
  /**
   * Convert database row to domain entity
   */
  private toDomainEntity(dbRow: DatabaseContact): ContactDomain {
    return {
      id: dbRow.id,
      created_at: dbRow.created_at || '',
      updated_at: dbRow.updated_at || '',
      first_name: dbRow.first_name,
      last_name: dbRow.last_name,
      organization_id: dbRow.organization_id,
      email: dbRow.email,
      title: dbRow.title,
      department: dbRow.department,
      phone: dbRow.phone,
      mobile_phone: dbRow.mobile_phone,
      linkedin_url: dbRow.linkedin_url,
      role: dbRow.role as ContactDomain['role'],
      purchase_influence: dbRow.purchase_influence as ContactDomain['purchase_influence'],
      decision_authority: dbRow.decision_authority as ContactDomain['decision_authority'],
      is_primary_contact: dbRow.is_primary_contact,
      notes: dbRow.notes,
    }
  }

  /**
   * Convert domain entity to database insert format
   */
  private toInsertFormat(
    entity: Omit<ContactDomain, 'id' | 'created_at' | 'updated_at'>
  ): DatabaseContactInsert {
    return {
      first_name: entity.first_name,
      last_name: entity.last_name,
      organization_id: entity.organization_id,
      email: entity.email,
      title: entity.title,
      department: entity.department,
      phone: entity.phone,
      mobile_phone: entity.mobile_phone,
      linkedin_url: entity.linkedin_url,
      role: entity.role,
      purchase_influence: entity.purchase_influence,
      decision_authority: entity.decision_authority,
      is_primary_contact: entity.is_primary_contact,
      notes: entity.notes,
      created_by: 'system', // TODO: Replace with actual user ID from auth context
    }
  }

  /**
   * Convert domain entity to database update format
   */
  private toUpdateFormat(entity: ContactDomain): DatabaseContactUpdate {
    return {
      first_name: entity.first_name,
      last_name: entity.last_name,
      organization_id: entity.organization_id,
      email: entity.email,
      title: entity.title,
      department: entity.department,
      phone: entity.phone,
      mobile_phone: entity.mobile_phone,
      linkedin_url: entity.linkedin_url,
      role: entity.role,
      purchase_influence: entity.purchase_influence,
      decision_authority: entity.decision_authority,
      is_primary_contact: entity.is_primary_contact,
      notes: entity.notes,
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Find contact by ID
   */
  async findById(id: string): Promise<ContactDomain | null> {
    const { data, error } = await supabase
      .from('contacts')
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
   * Find all contacts
   */
  async findAll(): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('deleted', false)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Create new contact
   */
  async create(
    entity: Omit<ContactDomain, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ContactDomain> {
    const insertData = this.toInsertFormat(entity)

    const { data, error } = await supabase.from('contacts').insert(insertData).select().single()

    if (error) {
      throw new Error(`Failed to create contact: ${error.message}`)
    }

    return this.toDomainEntity(data)
  }

  /**
   * Update existing contact
   */
  async update(entity: ContactDomain): Promise<ContactDomain> {
    const updateData = this.toUpdateFormat(entity)

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', entity.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update contact: ${error.message}`)
    }

    return this.toDomainEntity(data)
  }

  /**
   * Hard delete contact (rarely used)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contacts').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete contact: ${error.message}`)
    }
  }

  /**
   * Soft delete contact (preferred method)
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to soft delete contact: ${error.message}`)
    }
  }

  /**
   * Find contacts by organization ID
   */
  async findByOrganization(organizationId: string): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('deleted', false)
      .order('is_primary_contact', { ascending: false }) // Primary contact first
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contacts by organization: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find primary contact for organization
   */
  async findPrimaryByOrganization(organizationId: string): Promise<ContactDomain | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_primary_contact', true)
      .eq('deleted', false)
      .single()

    if (error || !data) {
      return null
    }

    return this.toDomainEntity(data)
  }

  /**
   * Find contacts by decision authority
   */
  async findByDecisionAuthority(authority: string): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('decision_authority', authority)
      .eq('deleted', false)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contacts by decision authority: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find contacts by purchase influence level
   */
  async findByPurchaseInfluence(influence: string): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('purchase_influence', influence)
      .eq('deleted', false)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contacts by purchase influence: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find high-value contacts (decision makers and high influence)
   */
  async findHighValue(): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(
        'decision_authority.eq.Decision Maker,purchase_influence.eq.High,is_primary_contact.eq.true'
      )
      .eq('deleted', false)
      .order('decision_authority', { ascending: true }) // Decision makers first
      .order('purchase_influence', { ascending: true }) // High influence first
      .order('last_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch high-value contacts: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Search contacts by name or email
   */
  async search(searchTerm: string): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .eq('deleted', false)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .limit(50) // Limit search results

    if (error) {
      throw new Error(`Failed to search contacts: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Count contacts by organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('deleted', false)

    if (error) {
      throw new Error(`Failed to count contacts by organization: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Find contacts with email addresses
   */
  async findWithEmail(): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .not('email', 'is', null)
      .neq('email', '')
      .eq('deleted', false)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contacts with email: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Find contacts with relationships (for complex queries)
   */
  async findWithRelations(): Promise<ContactDomain[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select(
        `
        *,
        organization:organizations(*),
        interactions(count),
        opportunities(count)
      `
      )
      .eq('deleted', false)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contacts with relations: ${error.message}`)
    }

    return data.map((row) => this.toDomainEntity(row))
  }

  /**
   * Update primary contact status for organization
   * Ensures only one primary contact per organization
   */
  async updatePrimaryContactForOrganization(
    contactId: string,
    organizationId: string
  ): Promise<void> {
    // First, remove primary status from all contacts in the organization
    const { error: clearError } = await supabase
      .from('contacts')
      .update({
        is_primary_contact: false,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)
      .eq('deleted', false)

    if (clearError) {
      throw new Error(`Failed to clear primary contacts: ${clearError.message}`)
    }

    // Then set the new primary contact
    const { error: setError } = await supabase
      .from('contacts')
      .update({
        is_primary_contact: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)

    if (setError) {
      throw new Error(`Failed to set primary contact: ${setError.message}`)
    }
  }
}
