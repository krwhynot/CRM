import { QueryClient } from '@tanstack/react-query'
import {
  CommandUseCaseBase,
  QueryUseCaseBase,
  UseCaseContextFactory,
  type UseCaseContext,
} from './shared/UseCaseBase'
import type { ServiceResponse } from './shared/ServiceResponse'
import { ServiceResponseBuilder, SERVICE_ERROR_CODES } from './shared/ServiceResponse'
import {
  BulkOperationResultBuilder,
  BulkOperationUtils,
  type BulkOperationInput,
  type BulkOperationResult,
} from './shared/BulkOperationResult'

/**
 * Placeholder types for Contact domain
 * These should be moved to domain layer when ContactService is created
 */
export interface ContactDomain {
  id: string
  first_name: string
  last_name: string
  email: string
  organization_id: string
  decision_authority?: 'primary' | 'secondary' | 'influencer'
  created_at: string
  updated_at: string
}

export interface CreateContactData {
  first_name: string
  last_name: string
  email: string
  organization_id: string
  decision_authority?: 'primary' | 'secondary' | 'influencer'
}

export interface UpdateContactData {
  first_name?: string
  last_name?: string
  email?: string
  decision_authority?: 'primary' | 'secondary' | 'influencer'
}

/**
 * Application service for Contact entity
 * Coordinates between domain services and infrastructure concerns
 *
 * NOTE: This is a placeholder implementation. When ContactService is created in the domain layer,
 * this should be updated to use the actual domain service patterns like OpportunityApplicationService
 */
export class ContactApplicationService {
  private context: UseCaseContext

  constructor(
    private readonly _queryClient: QueryClient,
    options?: {
      userId?: string
      transactionId?: string
    }
  ) {
    this.context = UseCaseContextFactory.create(_queryClient, options)
  }

  /**
   * Create a new contact use case
   * TODO: Implement when ContactService domain layer is available
   */
  async createContact(data: CreateContactData): Promise<ServiceResponse<ContactDomain>> {
    return ServiceResponseBuilder.failure({
      code: SERVICE_ERROR_CODES.GENERIC_ERROR,
      message:
        'ContactApplicationService not fully implemented - awaiting domain layer ContactService',
    })
  }

  /**
   * Update contact use case
   * TODO: Implement when ContactService domain layer is available
   */
  async updateContact(
    contactId: string,
    data: UpdateContactData
  ): Promise<ServiceResponse<ContactDomain>> {
    return ServiceResponseBuilder.failure({
      code: SERVICE_ERROR_CODES.GENERIC_ERROR,
      message:
        'ContactApplicationService not fully implemented - awaiting domain layer ContactService',
    })
  }

  /**
   * Delete contact use case
   * TODO: Implement when ContactService domain layer is available
   */
  async deleteContact(contactId: string): Promise<ServiceResponse<void>> {
    return ServiceResponseBuilder.failure({
      code: SERVICE_ERROR_CODES.GENERIC_ERROR,
      message:
        'ContactApplicationService not fully implemented - awaiting domain layer ContactService',
    })
  }

  /**
   * Bulk delete contacts use case
   * TODO: Implement when ContactService domain layer is available
   */
  async bulkDeleteContacts(
    input: BulkOperationInput<{ contactId: string }>
  ): Promise<ServiceResponse<BulkOperationResult<void>>> {
    return ServiceResponseBuilder.failure({
      code: SERVICE_ERROR_CODES.GENERIC_ERROR,
      message:
        'ContactApplicationService not fully implemented - awaiting domain layer ContactService',
    })
  }

  /**
   * Get contacts by organization use case
   * TODO: Implement when ContactService domain layer is available
   */
  async getContactsByOrganization(
    organizationId: string
  ): Promise<ServiceResponse<ContactDomain[]>> {
    return ServiceResponseBuilder.failure({
      code: SERVICE_ERROR_CODES.GENERIC_ERROR,
      message:
        'ContactApplicationService not fully implemented - awaiting domain layer ContactService',
    })
  }
}

/**
 * Query keys for contact cache invalidation
 * These will be used once the domain service is implemented
 */
export const ContactQueryKeys = {
  all: ['contacts'] as const,
  lists: () => [...ContactQueryKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...ContactQueryKeys.lists(), { filters }] as const,
  details: () => [...ContactQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ContactQueryKeys.details(), id] as const,
  byOrganization: (organizationId: string) =>
    [...ContactQueryKeys.all, 'organization', organizationId] as const,
}

/**
 * Factory for creating ContactApplicationService instances
 */
export class ContactApplicationServiceFactory {
  static create(
    queryClient: QueryClient,
    options?: {
      userId?: string
      transactionId?: string
    }
  ): ContactApplicationService {
    return new ContactApplicationService(queryClient, options)
  }
}

/**
 * IMPLEMENTATION NOTES:
 *
 * Once the ContactService is created in the domain layer, this service should be updated to:
 *
 * 1. Import and use the actual ContactService from '@/domain/contacts/ContactService'
 * 2. Import the actual Contact domain types from '@/domain/contacts/ContactTypes'
 * 3. Replace the placeholder types above with the actual domain types
 * 4. Implement the use cases following the pattern established in OpportunityApplicationService:
 *    - Create command use cases that extend CommandUseCaseBase
 *    - Create query use cases that extend QueryUseCaseBase
 *    - Implement proper cache invalidation using ContactQueryKeys
 *    - Add proper validation and error handling
 * 5. Add business rule validation using ContactRules (when created)
 * 6. Implement optimistic updates for better UX
 * 7. Add proper transaction support when needed
 *
 * Example implementation structure when ready:
 *
 * class CreateContactUseCase extends CommandUseCaseBase<CreateContactData, ContactDomain> {
 *   constructor(context: UseCaseContext, private contactService: ContactService) {
 *     super(context)
 *   }
 *
 *   async execute(input: CreateContactData): Promise<ServiceResponse<ContactDomain>> {
 *     // Validation
 *     const validation = this.validateInput(input, this.validateCreateData)
 *     if (validation) return validation
 *
 *     // Execute with cache invalidation
 *     return this.executeCommand(input, async () => {
 *       const result = await this.contactService.create(input)
 *       if (result.isFailure) throw new Error(result.error)
 *       return result.value
 *     })
 *   }
 *
 *   getInvalidationKeys(input: CreateContactData): unknown[][] {
 *     return [
 *       ContactQueryKeys.all,
 *       ContactQueryKeys.lists(),
 *       ContactQueryKeys.byOrganization(input.organization_id)
 *     ]
 *   }
 * }
 */
