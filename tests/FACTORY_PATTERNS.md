# Factory Patterns Guide

Comprehensive guide to using the new type-safe test data factories in the KitchenPantry CRM test suite.

## Overview

The test suite provides two complementary factory systems:

1. **Generic Factories** (`test-utils.ts`) - Type-safe, database-focused factories
2. **Legacy Enhanced Factories** (`test-utilities.ts`) - Flexible, scenario-based factories

## Generic Factory System

### Basic Usage

```typescript
import { createTestEntity, DatabaseTestHelper } from '../shared/test-utils'

// Create typed test data for any entity
const orgData = createTestEntity('organization', {
  type: 'principal',
  segment: 'Fine Dining',
  priority: 'A'
})

// Use database helper for CRUD operations
const helper = new DatabaseTestHelper('organization')
const createdOrg = await helper.create(orgData)
```

### Entity-Specific Helpers

```typescript
import { 
  OrganizationTestHelper,
  ContactTestHelper,
  ProductTestHelper,
  OpportunityTestHelper,
  InteractionTestHelper
} from '../shared/test-utils'

// Pre-configured helpers for each entity type
const org = await OrganizationTestHelper.create({
  name: 'Test Principal',
  type: 'principal'
})

const contact = await ContactTestHelper.create({
  first_name: 'John',
  last_name: 'Doe',
  organization_id: org.id
})
```

### Performance Benchmarking

```typescript
import { TestPerformanceUtils } from '../shared/test-utils'

// Benchmark CRUD operations
const results = await TestPerformanceUtils.benchmarkCRUD(
  'organization',
  { name: 'Test Org', type: 'customer' },
  10 // iterations
)

console.log(`Create: ${results.create.avgTime}ms`)
console.log(`Read: ${results.read.avgTime}ms`)
```

## Enhanced Legacy Factory System

### Basic Test Data Generation

```typescript
import { TestData, createTypedTestData } from '../shared/test-utilities'

// Direct factory usage
const validOrg = TestData.organizations.valid()
const invalidOrg = TestData.organizations.invalid.emptyName()

// Generic factory function
const contactData = createTypedTestData('contacts', 'valid', organizationId)
const invalidContact = createTypedTestData('contacts', 'emptyFirstName', organizationId)
```

### Relationship Builder Pattern

```typescript
import { TestDataBuilder } from '../shared/test-utilities'

// Build related entities with proper relationships
const testData = new TestDataBuilder()
  .organization('acmePrincipal', { 
    type: 'principal', 
    name: 'ACME Foods' 
  })
  .organization('distributor1', { 
    type: 'distributor',
    name: 'Regional Distributors Inc' 
  })
  .contact('primaryContact', 'acmePrincipal', {
    first_name: 'Jane',
    last_name: 'Smith',
    title: 'Sales Manager'
  })
  .product('flagshipProduct', 'acmePrincipal', {
    name: 'Premium Sauce',
    category: 'spices_seasonings'
  })
  .opportunity('bigDeal', 'distributor1', 'primaryContact', {
    name: 'Q1 Expansion Deal',
    estimated_value: 50000
  })
  .interaction('kickoffCall', 'bigDeal', 'primaryContact', 'distributor1', {
    type: 'meeting',
    subject: 'Deal Kickoff Meeting'
  })

// Access built entities
const principal = testData.get('acmePrincipal')
const opportunity = testData.get('bigDeal')
const allEntities = testData.getAll()
```

## Validation Patterns

### Entity Validation

```typescript
import { RelationshipValidators, EnumValidators } from '../shared/test-utilities'

// Validate entity requirements
const contactErrors = RelationshipValidators.validateContactRequirements({
  first_name: 'John',
  last_name: 'Doe',
  // Missing required organization_id
})

console.log(contactErrors) // ['Contact must have organization_id', ...]

// Validate enum values
const isValidType = EnumValidators.organizationType('principal') // true
const isValidStage = EnumValidators.opportunityStage('invalid_stage') // false
```

### Database Result Validation

```typescript
import { checkDatabaseResult } from '../shared/test-utils'

const result = await supabase
  .from('organizations')
  .insert(orgData)
  .select()
  .single()

// Validate result with expectations
checkDatabaseResult(result, {
  shouldSucceed: true,
  dataValidation: (data) => data.name === orgData.name
})
```

## Common Patterns

### Test Setup with Cleanup

```typescript
import { TestCleanup } from '../backend/setup/test-setup'

beforeEach(() => {
  TestCleanup.reset()
})

afterEach(async () => {
  await TestCleanup.cleanupTestData()
})

test('should create organization with contacts', async () => {
  // Create with automatic cleanup tracking
  const org = await OrganizationTestHelper.create({
    name: 'Test Org',
    type: 'customer'
  }, true) // trackForCleanup = true (default)
  
  const contact = await ContactTestHelper.create({
    first_name: 'John',
    last_name: 'Doe',
    organization_id: org.id
  })
  
  // Entities will be automatically cleaned up after test
})
```

### Batch Entity Creation

```typescript
import { TestPerformanceUtils } from '../shared/test-utils'

// Create multiple related entities efficiently
const operations = [
  {
    name: 'create_organizations',
    operation: async () => {
      const orgs = []
      for (let i = 0; i < 10; i++) {
        const org = await OrganizationTestHelper.create({
          name: `Test Org ${i}`,
          type: 'customer'
        })
        orgs.push(org)
      }
      return orgs
    }
  },
  {
    name: 'create_contacts', 
    operation: async () => {
      // Create contacts for each organization
      // ... implementation
    }
  }
]

const results = await TestPerformanceUtils.measureOperations(operations, 3)
```

### Complex Relationship Testing

```typescript
// Test principal-distributor-customer relationship chain
const testScenario = new TestDataBuilder()
  .organization('principal', { type: 'principal', name: 'Food Corp' })
  .organization('distributor', { type: 'distributor', name: 'Dist Co' })
  .organization('customer', { type: 'customer', name: 'Restaurant Chain' })
  .contact('principalSales', 'principal', { title: 'Sales Director' })
  .contact('customerBuyer', 'customer', { title: 'Purchasing Manager' })
  .product('mainProduct', 'principal', { name: 'Signature Sauce' })
  .opportunity('dealFlow', 'customer', 'customerBuyer', {
    principal_organization_id: testScenario.get('principal').id,
    distributor_organization_id: testScenario.get('distributor').id
  })

// Validate the complete relationship chain
const entities = testScenario.getAll()
expect(entities.dealFlow.organization_id).toBe(entities.customer.id)
expect(entities.dealFlow.principal_organization_id).toBe(entities.principal.id)
```

## Performance Considerations

### Batch Operations

```typescript
// ✅ Good: Batch operations with controlled concurrency
const batchSize = 10
const organizations = []

for (let batch = 0; batch < totalRecords; batch += batchSize) {
  const batchPromises = []
  for (let i = 0; i < batchSize && (batch + i) < totalRecords; i++) {
    batchPromises.push(OrganizationTestHelper.create({
      name: `Batch Org ${batch + i}`,
      type: 'customer'
    }))
  }
  const batchResults = await Promise.all(batchPromises)
  organizations.push(...batchResults)
  
  // Small delay between batches to avoid overwhelming database
  await new Promise(resolve => setTimeout(resolve, 50))
}
```

```typescript
// ❌ Avoid: Unbounded concurrent operations
const badPromises = []
for (let i = 0; i < 1000; i++) {
  badPromises.push(OrganizationTestHelper.create({...})) // Don't do this
}
await Promise.all(badPromises) // Will overwhelm the database
```

### Memory Management

```typescript
// ✅ Good: Reset builder to free memory
const builder = new TestDataBuilder()
// ... create many entities
const entities = builder.getAll()
builder.reset() // Free memory

// ✅ Good: Explicit cleanup in long-running tests
afterEach(async () => {
  await TestCleanup.cleanupTestData()
  TestCleanup.reset()
})
```

## Error Handling Patterns

### Graceful Failure Testing

```typescript
test('should handle database constraints gracefully', async () => {
  // Create organization
  const org = await OrganizationTestHelper.create({
    name: 'Test Org',
    type: 'customer'
  })
  
  // Try to create contact without required fields
  await expect(
    ContactTestHelper.create({
      first_name: 'John',
      // Missing last_name and organization_id
    })
  ).rejects.toThrow(/required/)
})
```

### Validation Error Testing

```typescript
test('should validate enum constraints', async () => {
  const invalidOrgData = TestData.organizations.invalid.invalidType()
  
  await expect(
    OrganizationTestHelper.create(invalidOrgData)
  ).rejects.toThrow(/invalid.*type/)
})
```

## Best Practices

### 1. Use Appropriate Factory Type

- **Generic Factories** for database operations and performance testing
- **Legacy Factories** for complex scenarios and relationship building

### 2. Leverage Type Safety

```typescript
// ✅ Good: Let TypeScript catch errors
const contact: ContactInsert = createTestEntity('contact', {
  first_name: 'John',
  organization_id: validOrgId
})

// ❌ Avoid: Bypassing type safety
const contact = createTestEntity('contact', {
  firstName: 'John', // Wrong field name, won't be caught
  orgId: validOrgId   // Wrong field name, won't be caught
}) as any
```

### 3. Clean Test Isolation

```typescript
// ✅ Good: Isolated tests with cleanup
beforeEach(() => {
  TestCleanup.reset()
})

afterEach(async () => {
  await TestCleanup.cleanupTestData()
})

// ❌ Avoid: Tests depending on each other
let sharedOrganization // Don't do this
```

### 4. Meaningful Test Data

```typescript
// ✅ Good: Descriptive test data
const restaurantChain = await OrganizationTestHelper.create({
  name: 'Burger Palace Chain',
  type: 'customer',
  segment: 'Fast Food',
  description: 'Multi-location burger restaurant chain'
})

// ❌ Avoid: Generic test data
const org = await OrganizationTestHelper.create({
  name: 'Test Org 1',
  type: 'customer'
})
```

### 5. Performance Awareness

```typescript
// ✅ Good: Monitor performance
const startTime = performance.now()
const results = await TestPerformanceUtils.benchmarkCRUD('organization', testData, 5)
const duration = performance.now() - startTime

expect(results.create.avgTime).toBeLessThan(100) // 100ms threshold
```

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure imports match the new type system
2. **Relationship Failures**: Use `RelationshipValidators` to catch missing foreign keys
3. **Performance Issues**: Use batch operations and cleanup properly
4. **Memory Leaks**: Reset builders and cleanup test data

### Debug Helpers

```typescript
// Enable verbose logging
process.env.DEBUG_TEST_FACTORIES = 'true'

// Check entity relationships
const validationErrors = RelationshipValidators.validateContactRequirements(contactData)
console.log('Validation errors:', validationErrors)

// Monitor performance
console.log('Performance metrics:', PerformanceMonitor.getMetrics())
```