# Application Services Layer

The application services layer coordinates between the domain layer and infrastructure concerns, providing a clean interface for the presentation layer while maintaining proper separation of concerns.

## Architecture Overview

```
Presentation Layer (Components/Hooks)
         ↓
Application Services Layer (Use Cases)
         ↓
Domain Services Layer (Business Logic)
         ↓
Infrastructure Layer (Database/External APIs)
```

## Key Responsibilities

1. **Use Case Orchestration**: Implement application-specific use cases that coordinate domain operations
2. **Cache Management**: Integrate with TanStack Query for cache invalidation and optimization
3. **Transaction Management**: Coordinate transactions across multiple domain operations
4. **Error Handling**: Provide standardized error responses and validation
5. **Bulk Operations**: Handle complex bulk operations with proper feedback
6. **Cross-Cutting Concerns**: Logging, monitoring, and performance tracking

## Directory Structure

```
src/services/
├── shared/                              # Shared utilities
│   ├── ServiceResponse.ts              # Standardized response format
│   ├── UseCaseBase.ts                  # Base classes for use cases
│   ├── BulkOperationResult.ts          # Bulk operation handling
│   └── index.ts
├── OpportunityApplicationService.ts     # Opportunity use cases
├── ContactApplicationService.ts         # Contact use cases (placeholder)
├── OrganizationApplicationService.ts    # Organization use cases (placeholder)
├── index.ts                            # Main exports
└── README.md                           # This file
```

## Core Concepts

### ServiceResponse

All application service operations return a standardized `ServiceResponse<T>` format:

```typescript
interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: ServiceError
  metadata?: ServiceMetadata
}
```

### Use Case Base Classes

Three base classes provide common functionality:

1. **UseCaseBase**: Common functionality for all use cases
2. **QueryUseCaseBase**: Optimized for read operations with caching
3. **CommandUseCaseBase**: Optimized for write operations with cache invalidation

### Bulk Operations

The `BulkOperationResult` system handles complex bulk operations with:
- Individual item tracking
- Partial success scenarios
- Detailed error reporting
- Performance monitoring

## Implementation Status

### ✅ Completed

- **OpportunityApplicationService**: Fully implemented with all CRUD operations
- **Shared Utilities**: Complete ServiceResponse, UseCaseBase, and BulkOperationResult
- **Cache Integration**: TanStack Query keys and invalidation patterns
- **Error Handling**: Standardized error responses and validation

### 🚧 Placeholder Implementations

- **ContactApplicationService**: Structure ready, awaiting ContactService domain layer
- **OrganizationApplicationService**: Structure ready, awaiting OrganizationService domain layer

## Usage Examples

### Creating a Service Instance

```typescript
import { OpportunityApplicationServiceFactory } from '@/services'
import { queryClient } from '@/lib/react-query'

const opportunityService = OpportunityApplicationServiceFactory.create(
  opportunityRepository,
  queryClient,
  { userId: 'current-user-id' }
)
```

### Using in React Components

```typescript
// In a React component or custom hook
const createOpportunity = async (data: CreateOpportunityData) => {
  const response = await opportunityService.createOpportunity(data)
  
  if (response.success) {
    toast.success('Opportunity created successfully')
    return response.data
  } else {
    toast.error(response.error?.message || 'Failed to create opportunity')
    throw new Error(response.error?.message)
  }
}
```

### Bulk Operations

```typescript
const deleteMultipleOpportunities = async (opportunityIds: string[]) => {
  const bulkInput: BulkOperationInput<{ opportunityId: string }> = {
    items: opportunityIds.map(id => ({
      id,
      data: { opportunityId: id }
    })),
    options: {
      strategy: 'parallel',
      maxConcurrency: 5,
      continueOnError: true
    }
  }

  const response = await opportunityService.bulkDeleteOpportunities(bulkInput)
  
  if (response.success && response.data) {
    const result = response.data
    console.log(`Deleted ${result.summary.successful} of ${result.summary.total} opportunities`)
    
    // Handle partial failures
    if (result.overallStatus === 'partial_success') {
      const failedItems = result.items.filter(item => item.status === 'error')
      console.warn('Some deletions failed:', failedItems)
    }
  }
}
```

## Integration with TanStack Query

Application services automatically handle cache invalidation through query keys:

```typescript
export const OpportunityQueryKeys = {
  all: ['opportunities'] as const,
  lists: () => [...OpportunityQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...OpportunityQueryKeys.details(), id] as const,
  byOrganization: (organizationId: string) =>
    [...OpportunityQueryKeys.all, 'organization', organizationId] as const,
}
```

When operations complete, relevant cache entries are automatically invalidated.

## Error Handling

The services layer provides comprehensive error handling:

```typescript
// Validation errors
const validationResponse = ServiceResponseBuilder.validationFailure([
  { field: 'name', message: 'Name is required' },
  { field: 'email', message: 'Invalid email format' }
])

// Domain errors
const domainResponse = ServiceResponseBuilder.fromDomainResult(domainResult)

// Generic errors
const errorResponse = ServiceResponseBuilder.failure({
  code: SERVICE_ERROR_CODES.DATABASE_ERROR,
  message: 'Database connection failed',
  details: { originalError: error }
})
```

## Performance Features

1. **Optimistic Updates**: UI updates immediately while operations are in progress
2. **Cache Management**: Intelligent cache invalidation and prefetching
3. **Bulk Processing**: Efficient batch processing with concurrency control
4. **Query Deduplication**: TanStack Query prevents duplicate requests

## Future Enhancements

When the Contact and Organization domain services are implemented:

1. Replace placeholder types with actual domain types
2. Implement all use cases following the OpportunityApplicationService pattern
3. Add entity-specific business rules and validation
4. Implement optimistic updates for better UX
5. Add transaction support for complex operations

## Best Practices

1. **Single Responsibility**: Each use case handles one specific application operation
2. **Error First**: Always check for errors before processing results
3. **Cache Awareness**: Consider cache implications for all operations
4. **Validation**: Validate inputs at the application service boundary
5. **Monitoring**: Use metadata for performance tracking and debugging

## Testing Strategy

Application services should be tested with:

1. **Unit Tests**: Test individual use cases with mocked domain services
2. **Integration Tests**: Test cache invalidation and TanStack Query integration
3. **Error Scenarios**: Test all error paths and validation rules
4. **Bulk Operations**: Test partial success scenarios and error handling
5. **Performance Tests**: Test with large datasets and concurrent operations