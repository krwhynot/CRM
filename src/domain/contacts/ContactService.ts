import { DomainService, Result } from '../shared/BaseEntity'
import { ContactRules } from './ContactRules'
import type {
  ContactDomain,
  CreateContactData,
  UpdateContactData,
  ContactEngagement,
  ContactRelationshipValidation,
  ContactDisplayInfo,
  ContactInfluenceMetrics,
  ContactValidationContext,
} from './ContactTypes'
import type { BaseRepository } from '../shared/BaseEntity'

/**
 * Contact domain service
 * Contains all business logic for contact management
 */
export class ContactService extends DomainService {
  constructor(private repository: BaseRepository<ContactDomain>) {
    super()
  }

  /**
   * Create a new contact with business rule validation
   */
  async create(
    data: CreateContactData,
    context?: ContactValidationContext
  ): Promise<Result<ContactDomain>> {
    try {
      // Apply defaults
      const contactData: Partial<ContactDomain> = {
        ...data,
        ...ContactRules.getDefaults(),
        ...data, // Override defaults with provided data
      }

      // Load existing contacts for validation if needed
      let validationContext = context
      if (contactData.organization_id && !validationContext?.existingContacts) {
        const existingContacts = await this.getContactsByOrganization(contactData.organization_id)
        validationContext = {
          ...context,
          organizationId: contactData.organization_id,
          existingContacts,
          enforcePrimaryContactRule: true,
        }
      }

      // Validate business rules
      ContactRules.validateContactData(contactData, validationContext)

      // Create the contact
      const contact = await this.repository.create(contactData as any)

      // Emit domain event
      this.emit('ContactCreated', {
        contactId: contact.id,
        organizationId: contact.organization_id,
        isPrimary: contact.is_primary_contact,
        decisionAuthority: contact.decision_authority,
        purchaseInfluence: contact.purchase_influence,
      })

      return Result.success(contact)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Update contact with business rule validation
   */
  async update(
    contactId: string,
    data: UpdateContactData,
    context?: ContactValidationContext
  ): Promise<Result<ContactDomain>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      // Merge update data
      const updatedData = { ...contact, ...data }

      // Load existing contacts for validation if needed
      let validationContext = context
      if (updatedData.organization_id && !validationContext?.existingContacts) {
        const existingContacts = await this.getContactsByOrganization(updatedData.organization_id)
        validationContext = {
          ...context,
          organizationId: updatedData.organization_id,
          existingContacts,
          enforcePrimaryContactRule: true,
        }
      }

      // Validate business rules
      ContactRules.validateContactData(updatedData, validationContext)

      // Track important changes
      const wasPromotedToPrimary = !contact.is_primary_contact && data.is_primary_contact
      const authorityChanged =
        data.decision_authority && data.decision_authority !== contact.decision_authority
      const influenceChanged =
        data.purchase_influence && data.purchase_influence !== contact.purchase_influence

      const updatedContact = await this.repository.update(updatedData as ContactDomain)

      // Emit domain events for significant changes
      if (wasPromotedToPrimary) {
        this.emit('ContactPromotedToPrimary', {
          contactId,
          organizationId: updatedContact.organization_id,
          previousPrimary: null, // Could be enhanced to track this
        })
      }

      if (authorityChanged) {
        this.emit('ContactAuthorityChanged', {
          contactId,
          oldAuthority: contact.decision_authority,
          newAuthority: data.decision_authority,
        })
      }

      if (influenceChanged) {
        this.emit('ContactInfluenceChanged', {
          contactId,
          oldInfluence: contact.purchase_influence,
          newInfluence: data.purchase_influence,
        })
      }

      return Result.success(updatedContact)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Set primary contact for organization
   */
  async setPrimaryContact(
    contactId: string,
    organizationId: string
  ): Promise<Result<ContactDomain>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      if (contact.organization_id !== organizationId) {
        return Result.failure('Contact does not belong to the specified organization')
      }

      // Update contact to be primary
      const updatedContact = await this.update(contactId, { is_primary_contact: true })

      if (updatedContact.isSuccess) {
        this.emit('PrimaryContactChanged', {
          organizationId,
          newPrimaryContactId: contactId,
          contactName: `${contact.first_name} ${contact.last_name}`,
        })
      }

      return updatedContact
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Soft delete contact
   */
  async softDelete(contactId: string): Promise<Result<void>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      await this.repository.softDelete(contactId)

      // Emit domain event
      this.emit('ContactDeleted', {
        contactId,
        organizationId: contact.organization_id,
        wasPrimary: contact.is_primary_contact,
      })

      return Result.success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Calculate engagement score for contact
   */
  async calculateEngagement(
    contactId: string,
    interactionCount: number,
    lastInteractionDate: string | null,
    daysSinceLastInteraction?: number
  ): Promise<Result<ContactEngagement>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      const engagementScore = ContactRules.calculateEngagementScore(
        contact,
        interactionCount,
        lastInteractionDate,
        daysSinceLastInteraction
      )

      const needsFollowUp = daysSinceLastInteraction
        ? ContactRules.needsFollowUp(contact, daysSinceLastInteraction, interactionCount)
        : false

      const isHighValue = ContactRules.isHighValueContact(contact)

      let responsiveness: 'high' | 'medium' | 'low' | 'unresponsive' = 'unresponsive'
      if (daysSinceLastInteraction !== undefined) {
        if (daysSinceLastInteraction <= 7) responsiveness = 'high'
        else if (daysSinceLastInteraction <= 14) responsiveness = 'medium'
        else if (daysSinceLastInteraction <= 30) responsiveness = 'low'
      }

      const engagement: ContactEngagement = {
        contactId,
        engagementScore,
        interactionCount,
        lastInteractionDate,
        needsFollowUp,
        isHighValue,
        responsiveness,
      }

      return Result.success(engagement)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Validate contact relationships and data consistency
   */
  async validateRelationships(
    contactId: string,
    context?: ContactValidationContext
  ): Promise<Result<ContactRelationshipValidation>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      const validation = ContactRules.validateContactRelationships(contact, context)
      return Result.success(validation)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Generate display information for contact
   */
  async getDisplayInfo(contactId: string): Promise<Result<ContactDisplayInfo>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      const displayInfo = ContactRules.generateDisplayInfo(contact)
      return Result.success(displayInfo)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Calculate influence metrics for contact
   */
  async calculateInfluenceMetrics(
    contactId: string,
    networkConnections: number = 0,
    opportunityInvolvement: number = 0,
    communicationFrequency: number = 0
  ): Promise<Result<ContactInfluenceMetrics>> {
    try {
      const contact = await this.repository.findById(contactId)
      if (!contact) {
        return Result.failure('Contact not found')
      }

      const metrics = ContactRules.calculateInfluenceMetrics(
        contact,
        networkConnections,
        opportunityInvolvement,
        communicationFrequency
      )

      return Result.success(metrics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }

  /**
   * Get contacts by organization
   */
  async getContactsByOrganization(organizationId: string): Promise<ContactDomain[]> {
    // This is a simple wrapper around repository method for internal use
    const allContacts = await this.repository.findAll()
    return allContacts.filter((contact) => contact.organization_id === organizationId)
  }

  /**
   * Get primary contact for organization
   */
  async getPrimaryContactForOrganization(organizationId: string): Promise<ContactDomain | null> {
    const contacts = await this.getContactsByOrganization(organizationId)
    return contacts.find((contact) => contact.is_primary_contact) || null
  }

  /**
   * Get high-value contacts
   */
  async getHighValueContacts(): Promise<ContactDomain[]> {
    const allContacts = await this.repository.findAll()
    return allContacts.filter((contact) => ContactRules.isHighValueContact(contact))
  }

  /**
   * Get contacts needing follow-up
   */
  async getContactsNeedingFollowUp(
    interactionData: Array<{
      contactId: string
      daysSinceLastInteraction: number
      interactionCount: number
    }>
  ): Promise<ContactDomain[]> {
    const allContacts = await this.repository.findAll()
    const needsFollowUp: ContactDomain[] = []

    for (const contact of allContacts) {
      const interactionInfo = interactionData.find((data) => data.contactId === contact.id)
      if (
        interactionInfo &&
        ContactRules.needsFollowUp(
          contact,
          interactionInfo.daysSinceLastInteraction,
          interactionInfo.interactionCount
        )
      ) {
        needsFollowUp.push(contact)
      }
    }

    return needsFollowUp
  }

  /**
   * Search contacts by criteria
   */
  async searchContacts(searchTerm: string): Promise<ContactDomain[]> {
    const allContacts = await this.repository.findAll()
    const lowerSearchTerm = searchTerm.toLowerCase()

    return allContacts.filter(
      (contact) =>
        contact.first_name.toLowerCase().includes(lowerSearchTerm) ||
        contact.last_name.toLowerCase().includes(lowerSearchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(lowerSearchTerm)) ||
        (contact.title && contact.title.toLowerCase().includes(lowerSearchTerm)) ||
        (contact.department && contact.department.toLowerCase().includes(lowerSearchTerm))
    )
  }

  /**
   * Validate contact data (without creating)
   */
  validateContactData(
    data: Partial<ContactDomain>,
    context?: ContactValidationContext
  ): Result<boolean> {
    try {
      ContactRules.validateContactData(data, context)
      return Result.success(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return Result.failure(message)
    }
  }
}
