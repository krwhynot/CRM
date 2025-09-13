/**
 * Application Services Layer - Index
 *
 * This module exports all application services and their related utilities.
 * Application services coordinate between domain services and infrastructure concerns,
 * providing TanStack Query integration and standardized response handling.
 */

// Core application services
export {
  OpportunityApplicationService,
  OpportunityApplicationServiceFactory,
  OpportunityQueryKeys,
} from './OpportunityApplicationService'
export {
  ContactApplicationService,
  ContactApplicationServiceFactory,
  ContactQueryKeys,
} from './ContactApplicationService'
export {
  OrganizationApplicationService,
  OrganizationApplicationServiceFactory,
  OrganizationQueryKeys,
} from './OrganizationApplicationService'

// Shared utilities
export {
  type ServiceResponse,
  type ServiceError,
  type ServiceMetadata,
  type ValidationError,
  ServiceResponseBuilder,
  isServiceSuccess,
  isServiceFailure,
  SERVICE_ERROR_CODES,
  type ServiceErrorCode,
} from './shared/ServiceResponse'

export {
  type UseCase,
  type UseCaseContext,
  UseCaseBase,
  QueryUseCaseBase,
  CommandUseCaseBase,
  UseCaseContextFactory,
} from './shared/UseCaseBase'

export {
  type BulkOperationItem,
  type BulkOperationResult,
  type BulkOperationInput,
  BulkOperationResultBuilder,
  BulkOperationUtils,
  isCompleteSuccess,
  isPartialSuccess,
  isCompleteFailure,
} from './shared/BulkOperationResult'

// Type exports for convenience
export type {
  // Contact types (placeholders - replace when domain layer is available)
  ContactDomain,
  CreateContactData,
  UpdateContactData,
} from './ContactApplicationService'

export type {
  // Organization types (placeholders - replace when domain layer is available)
  OrganizationDomain,
  CreateOrganizationData,
  UpdateOrganizationData,
} from './OrganizationApplicationService'
