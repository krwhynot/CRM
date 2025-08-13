/**
 * Contact Service for KitchenPantry CRM
 * 
 * Provides type-safe CRUD operations for contacts including:
 * - Contact-organization relationship management
 * - Primary contact designation
 * - Communication tracking
 * - Role-based filtering and searching
 */

import { BaseService } from './baseService'
import type { 
  Tables, 
  TablesInsert, 
  TablesUpdate, 
  Enums 
} from '@/types/database.types'
import type { 
  CreateContactSchema,
  UpdateContactSchema,
  ContactMetrics
} from '@/types'
import { ApiError, supabase, handleSupabaseResponse } from './api'

// =============================================================================
// TYPES
// =============================================================================

type Contact = Tables<'contacts'>
type ContactInsert = TablesInsert<'contacts'>
type ContactUpdate = TablesUpdate<'contacts'>
type ContactRole = Enums<'contact_role'>

export interface ContactWithRelations extends Contact {
  organization?: Tables<'organizations'>
  opportunities?: Array<Tables<'opportunities'>>
  interactions?: Array<Tables<'interactions'>>
}

export interface ContactSearchOptions {
  query?: string
  organizationId?: string
  role?: ContactRole[]
  department?: string[]
  isPrimary?: boolean
  hasEmail?: boolean
  hasPhone?: boolean
}

export interface ContactSummary {
  id: string
  full_name: string
  title: string | null
  role: ContactRole | null
  organization_name: string
  organization_type: string
  email: string | null
  phone_work: string | null
  phone_mobile: string | null
  is_primary_contact: boolean
  interaction_count: number
  opportunity_count: number
  last_interaction_date: string | null
}

// =============================================================================
// CONTACT SERVICE CLASS
// =============================================================================

export class ContactService extends BaseService<
  Contact,
  ContactInsert,
  ContactUpdate
> {
  constructor() {
    super('contacts')
  }

  // =============================================================================
  // ENHANCED CRUD OPERATIONS
  // =============================================================================

  /**
   * Create contact with business logic validation
   */
  async create(data: CreateContactSchema): Promise<Contact> {
    // Validate required fields
    this.validateRequiredFields(data, ['organization_id', 'first_name', 'last_name'])
    
    // Validate business constraints
    await this.validateConstraints(data, 'create')

    // Handle primary contact designation
    if (data.is_primary_contact) {
      await this.clearPrimaryContact(data.organization_id)
    }

    const insertData: ContactInsert = {
      ...data,
      is_primary_contact: data.is_primary_contact || false
    }

    return super.create(insertData)
  }

  /**
   * Update contact with validation
   */
  async update(id: string, data: UpdateContactSchema): Promise<Contact> {
    // Validate constraints
    await this.validateConstraints(data, 'update')

    // Handle primary contact designation
    if (data.is_primary_contact === true) {
      const contact = await this.findById(id)
      await this.clearPrimaryContact(contact.organization_id, id)
    }

    const updateData: ContactUpdate = { ...data }
    return super.update(id, updateData)
  }

  /**
   * Get contact with organization and related data
   */
  async findByIdWithRelations(
    id: string,
    options: {
      includeOrganization?: boolean
      includeOpportunities?: boolean
      includeInteractions?: boolean
    } = {}
  ): Promise<ContactWithRelations> {
    try {
      const {
        includeOrganization = true,
        includeOpportunities = false,
        includeInteractions = false
      } = options

      let selectFields = '*'

      // Build select fields based on options
      const relations = []
      if (includeOrganization) relations.push('organization:organization_id(*)')
      if (includeOpportunities) relations.push('opportunities!primary_contact_id(*)')
      if (includeInteractions) relations.push('interactions!contact_id(*)')

      if (relations.length > 0) {
        selectFields = `*, ${relations.join(', ')}`
      }

      const { data, error } = await supabase
        .from('contacts')
        .select(selectFields)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      if (!data) throw new Error('Contact not found')
      return data as ContactWithRelations
    } catch (error) {
      throw new ApiError(
        `Failed to fetch contact with relations: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Advanced search with business-specific filters
   */
  async search(options: ContactSearchOptions = {}): Promise<Contact[]> {
    try {
      const {
        query,
        organizationId,
        role,
        department,
        isPrimary,
        hasEmail,
        hasPhone
      } = options

      let searchQuery = supabase
        .from('contacts')
        .select('*')
        .is('deleted_at', null)

      // Text search across multiple fields
      if (query) {
        searchQuery = searchQuery.or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,title.ilike.%${query}%,department.ilike.%${query}%,email.ilike.%${query}%`
        )
      }

      // Organization filter
      if (organizationId) {
        searchQuery = searchQuery.eq('organization_id', organizationId)
      }

      // Role filter
      if (role && role.length > 0) {
        searchQuery = searchQuery.in('role', role)
      }

      // Department filter
      if (department && department.length > 0) {
        searchQuery = searchQuery.in('department', department)
      }

      // Primary contact filter
      if (isPrimary !== undefined) {
        searchQuery = searchQuery.eq('is_primary_contact', isPrimary)
      }

      // Email filter
      if (hasEmail !== undefined) {
        if (hasEmail) {
          searchQuery = searchQuery.not('email', 'is', null)
        } else {
          searchQuery = searchQuery.is('email', null)
        }
      }

      // Phone filter
      if (hasPhone !== undefined) {
        if (hasPhone) {
          searchQuery = searchQuery.or(
            'phone_work.not.is.null,phone_mobile.not.is.null,phone_direct.not.is.null'
          )
        } else {
          searchQuery = searchQuery
            .is('phone_work', null)
            .is('phone_mobile', null)
            .is('phone_direct', null)
        }
      }

      const { data, error } = await searchQuery.order('last_name').order('first_name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to search contacts',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // ORGANIZATION-SPECIFIC OPERATIONS
  // =============================================================================

  /**
   * Get all contacts for an organization
   */
  async findByOrganization(
    organizationId: string,
    includePrimary = true
  ): Promise<Contact[]> {
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (!includePrimary) {
        query = query.eq('is_primary_contact', false)
      }

      const { data, error } = await query.order('is_primary_contact', { ascending: false })
        .order('last_name').order('first_name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get contacts for organization: ${organizationId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get primary contact for an organization
   */
  async getPrimaryContact(organizationId: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_primary_contact', true)
        .is('deleted_at', null)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data || null
    } catch (error) {
      throw new ApiError(
        `Failed to get primary contact for organization: ${organizationId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Set a contact as primary for their organization
   */
  async setPrimaryContact(contactId: string): Promise<Contact> {
    try {
      const contact = await this.findById(contactId)
      
      // Clear existing primary contact
      await this.clearPrimaryContact(contact.organization_id, contactId)

      // Set this contact as primary
      return this.update(contactId, { is_primary_contact: true })
    } catch (error) {
      throw new ApiError(
        `Failed to set primary contact: ${contactId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Clear primary contact designation for an organization
   */
  private async clearPrimaryContact(
    organizationId: string, 
    exceptContactId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('contacts')
        .update({ is_primary_contact: false })
        .eq('organization_id', organizationId)
        .eq('is_primary_contact', true)

      if (exceptContactId) {
        query = query.neq('id', exceptContactId)
      }

      const { error } = await query

      if (error) throw error
    } catch (error) {
      throw new ApiError(
        'Failed to clear primary contact designation',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // ROLE-BASED OPERATIONS
  // =============================================================================

  /**
   * Get contacts by role
   */
  async findByRole(role: ContactRole): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('role', role)
        .is('deleted_at', null)
        .order('last_name').order('first_name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get contacts with role: ${role}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get decision makers across all organizations
   */
  async getDecisionMakers(): Promise<Contact[]> {
    return this.findByRole('decision_maker')
  }

  /**
   * Get champions (internal advocates)
   */
  async getChampions(): Promise<Contact[]> {
    return this.findByRole('champion')
  }

  /**
   * Get influencers
   */
  async getInfluencers(): Promise<Contact[]> {
    return this.findByRole('influencer')
  }

  // =============================================================================
  // CONTACT SUMMARY AND ANALYTICS
  // =============================================================================

  /**
   * Get contact summary with related data
   */
  async getSummary(id: string): Promise<ContactSummary> {
    try {
      const contactData = await this.findByIdWithRelations(id, {
        includeOrganization: true,
        includeOpportunities: false,
        includeInteractions: false
      })

      // Get interaction count
      const { count: interactionCount } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('contact_id', id)
        .is('deleted_at', null)

      // Get opportunity count (as primary contact)
      const { count: opportunityCount } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('primary_contact_id', id)
        .is('deleted_at', null)

      // Get last interaction date
      const { data: lastInteraction } = await supabase
        .from('interactions')
        .select('interaction_date')
        .eq('contact_id', id)
        .is('deleted_at', null)
        .order('interaction_date', { ascending: false })
        .limit(1)
        .single()

      const lastInteractionDate = lastInteraction?.interaction_date || null

      return {
        id: contactData.id,
        full_name: `${contactData.first_name} ${contactData.last_name}`,
        title: contactData.title,
        role: contactData.role,
        organization_name: contactData.organization?.name || '',
        organization_type: contactData.organization?.type || '',
        email: contactData.email,
        phone_work: contactData.phone,
        phone_mobile: contactData.mobile_phone,
        is_primary_contact: contactData.is_primary_contact ?? false,
        interaction_count: interactionCount || 0,
        opportunity_count: opportunityCount || 0,
        last_interaction_date: lastInteractionDate
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get contact summary: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get contact metrics for analytics
   */
  async getMetrics(): Promise<ContactMetrics> {
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Get counts by role
      const { data: roleStats, error: roleError } = await supabase
        .from('contacts')
        .select('role')
        .is('deleted_at', null)

      if (roleError) throw roleError

      const roleCounts = roleStats?.reduce((acc, contact) => {
        if (contact.role) {
          acc[contact.role] = (acc[contact.role] || 0) + 1
        }
        return acc
      }, {} as Record<ContactRole, number>) || {}

      // Get primary contact count
      const { count: primaryCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('is_primary_contact', true)
        .is('deleted_at', null)

      // Get contacts with email count
      const { count: emailCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .not('email', 'is', null)
        .is('deleted_at', null)

      // Get contacts with phone count
      const { count: phoneCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .or('phone_work.not.is.null,phone_mobile.not.is.null,phone_direct.not.is.null')
        .is('deleted_at', null)

      // Get recent additions (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)

      return {
        total_contacts: totalCount || 0,
        by_role: roleCounts,
        primary_contacts: primaryCount || 0,
        with_email: emailCount || 0,
        with_phone: phoneCount || 0,
        recent_interactions: recentCount || 0,
        engagement_rate: (totalCount || 0) > 0 ? ((emailCount || 0) / (totalCount || 1)) * 100 : 0,
        response_rate: (totalCount || 0) > 0 ? ((phoneCount || 0) / (totalCount || 1)) * 100 : 0
      }
    } catch (error) {
      throw new ApiError(
        'Failed to get contact metrics',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  /**
   * Import contacts for an organization
   */
  async importForOrganization(
    organizationId: string,
    contacts: Omit<CreateContactSchema, 'organization_id'>[]
  ): Promise<{ success: Contact[]; failed: Array<{ contact: any; error: string }> }> {
    const success: Contact[] = []
    const failed: Array<{ contact: any; error: string }> = []

    for (const contactData of contacts) {
      try {
        const contact = await this.create({
          ...contactData,
          organization_id: organizationId
        })
        success.push(contact)
      } catch (error) {
        failed.push({
          contact: contactData,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { success, failed }
  }

  /**
   * Transfer contacts from one organization to another
   */
  async transferToOrganization(
    contactIds: string[],
    newOrganizationId: string
  ): Promise<void> {
    try {
      // Clear primary contact flags first
      await supabase
        .from('contacts')
        .update({ is_primary_contact: false })
        .in('id', contactIds)

      // Update organization
      const { error } = await supabase
        .from('contacts')
        .update({ 
          organization_id: newOrganizationId,
          updated_at: new Date().toISOString(),
          updated_by: await this.getCurrentUserId()
        })
        .in('id', contactIds)

      if (error) throw error

      this.invalidateCache()
    } catch (error) {
      throw new ApiError(
        'Failed to transfer contacts to new organization',
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
    // Validate email format
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new ApiError('Invalid email format', 400)
      }
    }

    // Validate phone formats
    const phoneFields = ['phone_work', 'phone_mobile', 'phone_direct']
    phoneFields.forEach(field => {
      if (data[field]) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
        if (!phoneRegex.test(data[field])) {
          throw new ApiError(`Invalid ${field} format`, 400)
        }
      }
    })

    // Validate LinkedIn URL format
    if (data.linkedin_url) {
      const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/.+/
      if (!linkedinRegex.test(data.linkedin_url)) {
        throw new ApiError(
          'LinkedIn URL must be in format: https://linkedin.com/in/username',
          400
        )
      }
    }

    // Validate organization exists
    if (data.organization_id) {
      await this.validateOrganizationExists(data.organization_id)
    }

    // Validate unique email within organization (if provided)
    if (data.email && data.organization_id) {
      await this.validateUniqueEmail(
        data.email, 
        data.organization_id, 
        operation === 'update' ? data.id : undefined
      )
    }
  }

  /**
   * Validate organization exists
   */
  private async validateOrganizationExists(organizationId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', organizationId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new ApiError('Organization not found', 404)
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate organization', 500, error as any)
    }
  }

  /**
   * Validate email is unique within organization
   */
  private async validateUniqueEmail(
    email: string,
    organizationId: string,
    excludeContactId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('contacts')
        .select('id')
        .eq('email', email)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (excludeContactId) {
        query = query.neq('id', excludeContactId)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        throw new ApiError(
          'A contact with this email already exists in the organization',
          409
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate email uniqueness', 500, error as any)
    }
  }

  // =============================================================================
  // SELECT FIELD BUILDER
  // =============================================================================

  protected buildSelectFields(include: string[]): string {
    const baseFields = '*'
    const relationMap: Record<string, string> = {
      'organization': 'organization:organization_id(*)',
      'opportunities': 'opportunities!primary_contact_id(*)',
      'interactions': 'interactions!contact_id(*)'
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

export const contactService = new ContactService()