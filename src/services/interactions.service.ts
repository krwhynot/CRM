/**
 * Interaction Service
 * 
 * Service for managing customer interactions and follow-ups
 * Handles business logic, validation, and complex queries for interactions
 */

import { BaseService } from './baseService'
import type { 
  Interaction, 
  InteractionInsert, 
  InteractionUpdate,
  InteractionWithRelations,
  InteractionFilter,
  InteractionListItem,
  InteractionType
} from '../types'

/**
 * Service for interaction-specific operations
 */
export class InteractionService extends BaseService<Interaction, InteractionInsert, InteractionUpdate> {
  constructor() {
    super('interactions')
  }

  // =============================================================================
  // CORE CRUD OPERATIONS
  // =============================================================================

  /**
   * Create interaction with validation
   */
  async create(data: any): Promise<Interaction> {
    // Validate required fields
    if (!data.type || !data.subject) {
      throw new Error('Type and subject are required')
    }

    // Set default values
    const insertData: InteractionInsert = {
      ...data,
      follow_up_required: data.follow_up_required || false,
      interaction_date: data.interaction_date || new Date().toISOString(),
      duration_minutes: data.duration_minutes || this.getDefaultDuration(data.type)
    }

    return super.create(insertData)
  }

  /**
   * Update interaction with validation
   */
  async update(id: string, data: any): Promise<Interaction> {
    const updateData: InteractionUpdate = { ...data }
    return super.update(id, updateData)
  }

  /**
   * Complete an interaction
   */
  async complete(
    id: string,
    outcome?: string,
    nextSteps?: string,
    followUpDate?: string
  ): Promise<Interaction> {
    const updateData: InteractionUpdate = {
      outcome: outcome,
      follow_up_required: false
    }

    if (followUpDate) {
      updateData.follow_up_required = true
      updateData.follow_up_date = followUpDate
    }

    return this.update(id, updateData)
  }

  // =============================================================================
  // SEARCH AND FILTER OPERATIONS
  // =============================================================================

  /**
   * Get interactions with enhanced filtering
   */
  async getInteractions(filter?: InteractionFilter): Promise<InteractionListItem[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, type),
        contact:contacts(id, first_name, last_name, email),
        opportunity:opportunities(id, name, stage)
      `)

    // Apply filters
    if (filter?.organization_id) {
      query = query.eq('organization_id', filter.organization_id)
    }

    if (filter?.contact_id) {
      query = query.eq('contact_id', filter.contact_id)
    }

    if (filter?.opportunity_id) {
      query = query.eq('opportunity_id', filter.opportunity_id)
    }

    if (filter?.type) {
      query = query.eq('type', filter.type)
    }

    if (filter?.follow_up_required !== undefined) {
      query = query.eq('follow_up_required', filter.follow_up_required)
    }

    // Date range filter
    if (filter?.dateRange) {
      if (filter.dateRange.start) {
        query = query.gte('interaction_date', filter.dateRange.start)
      }
      if (filter.dateRange.end) {
        query = query.lte('interaction_date', filter.dateRange.end)
      }
    }

    const { data, error } = await query.order('interaction_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get upcoming interactions (requiring follow-up)
   */
  async getUpcoming(daysAhead: number = 30): Promise<InteractionListItem[]> {
    const now = new Date()
    const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000))
    const futureDateStr = futureDate.toISOString()

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, type),
        contact:contacts(id, first_name, last_name, email),
        opportunity:opportunities(id, name, stage)
      `)
      .eq('follow_up_required', true)
      .lte('follow_up_date', futureDateStr)
      .order('follow_up_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Get overdue interactions
   */
  async getOverdue(): Promise<InteractionListItem[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, type),
        contact:contacts(id, first_name, last_name, email),
        opportunity:opportunities(id, name, stage)
      `)
      .eq('follow_up_required', true)
      .lt('follow_up_date', now)
      .order('follow_up_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get default duration for interaction type
   */
  private getDefaultDuration(type: InteractionType): number {
    const durations: Record<InteractionType, number> = {
      call: 30,
      email: 0,
      meeting: 60,
      demo: 90,
      proposal: 120,
      follow_up: 15,
      trade_show: 120,
      site_visit: 240,
      contract_review: 60
    }
    return durations[type] || 30
  }

  /**
   * Search interactions by text
   */
  async search(searchTerm: string, filter?: InteractionFilter): Promise<InteractionListItem[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, type),
        contact:contacts(id, first_name, last_name, email),
        opportunity:opportunities(id, name, stage)
      `)

    // Text search
    if (searchTerm) {
      query = query.or(`subject.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,outcome.ilike.%${searchTerm}%`)
    }

    // Apply additional filters
    if (filter?.organization_id) {
      query = query.eq('organization_id', filter.organization_id)
    }

    const { data, error } = await query
      .order('interaction_date', { ascending: false })
      .limit(100)

    if (error) throw error
    return data || []
  }

  // =============================================================================
  // RELATIONSHIP MANAGEMENT
  // =============================================================================

  /**
   * Get interactions for an organization
   */
  async getByOrganization(organizationId: string): Promise<InteractionListItem[]> {
    return this.getInteractions({ organization_id: organizationId })
  }

  /**
   * Get interactions for a contact
   */
  async getByContact(contactId: string): Promise<InteractionListItem[]> {
    return this.getInteractions({ contact_id: contactId })
  }

  /**
   * Get interactions for an opportunity
   */
  async getByOpportunity(opportunityId: string): Promise<InteractionListItem[]> {
    return this.getInteractions({ opportunity_id: opportunityId })
  }

  /**
   * Create follow-up interaction
   */
  async createFollowUp(parentId: string, data: Partial<InteractionInsert>): Promise<Interaction> {
    // Get parent interaction to copy context
    const parent = await this.getById(parentId)
    if (!parent) {
      throw new Error('Parent interaction not found')
    }

    const followUpData: InteractionInsert = {
      organization_id: parent.organization_id,
      contact_id: parent.contact_id,
      opportunity_id: parent.opportunity_id,
      type: 'follow_up',
      subject: `Follow-up: ${parent.subject}`,
      interaction_date: new Date().toISOString(),
      follow_up_required: false,
      ...data
    }

    return this.create(followUpData)
  }
}

// Export service instance
export const interactionService = new InteractionService()

// Export types and interfaces
export type {
  InteractionWithRelations,
  InteractionFilter,
  InteractionListItem,
  InteractionSummary,
  FollowUpTask
} from '../types/interactions.types'