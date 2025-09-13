/**
 * Shared Application Service Utilities - Index
 *
 * This module exports shared utilities used across all application services.
 */

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
} from './ServiceResponse'

export {
  type UseCase,
  type UseCaseContext,
  UseCaseBase,
  QueryUseCaseBase,
  CommandUseCaseBase,
  UseCaseContextFactory,
} from './UseCaseBase'

export {
  type BulkOperationItem,
  type BulkOperationResult,
  type BulkOperationInput,
  BulkOperationResultBuilder,
  BulkOperationUtils,
  isCompleteSuccess,
  isPartialSuccess,
  isCompleteFailure,
} from './BulkOperationResult'
