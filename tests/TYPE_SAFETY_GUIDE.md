# TypeScript Testing Best Practices Guide

Comprehensive guide to leveraging TypeScript for type-safe testing in the KitchenPantry CRM system.

## Overview

The CRM test suite uses advanced TypeScript patterns to provide:

- **Compile-time error detection** for test data and database operations
- **IntelliSense support** for entity properties and relationships  
- **Type-safe factories** that prevent invalid data creation
- **Generic helpers** that work with any CRM entity type

## Type System Architecture

### Entity Type Hierarchy

```typescript
// Base database types
type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

// Test-specific extensions
type TestOrganizationData = Partial<OrganizationInsert>
type TestOrganizationResult = Organization & { _testMetadata?: TestMetadata }
```

### Generic Entity Mapping

```typescript
// Entity map for type-safe generic operations
type EntityMap = {
  organization: {
    Row: Organization
    Insert: OrganizationInsert  
    Update: Database['public']['Tables']['organizations']['Update']
  }
  contact: {
    Row: Contact
    Insert: ContactInsert
    Update: Database['public']['Tables']['contacts']['Update']
  }
  // ... other entities
}

// Usage in generic functions
function createTestEntity<T extends keyof EntityMap>(
  entityType: T,
  overrides?: Partial<EntityMap[T]['Insert']>
): EntityMap[T]['Insert']
```

## Type-Safe Factory Patterns

### 1. Generic Factory with Type Constraints

```typescript
// ✅ Good: Type-safe factory
const organization = createTestEntity('organization', {
  type: 'principal',        // ✅ Valid enum value
  segment: 'Fine Dining',   // ✅ Valid segment
  priority: 'A'            // ✅ Valid priority
})

// ❌ TypeScript will catch these errors at compile time:
const badOrg = createTestEntity('organization', {
  type: 'invalid_type',    // ❌ Error: Invalid enum value
  segment: 123,            // ❌ Error: Wrong type
  nonExistentField: true   // ❌ Error: Property doesn't exist
})
```

### 2. Relationship Type Validation

```typescript
// ✅ Good: Typed relationship constraints
interface ContactWithRelationships {
  organization_id: string  // Required foreign key
  purchase_influence: PurchaseInfluenceLevel  // Typed enum
  decision_authority: DecisionAuthorityRole   // Typed enum
}

const contact = createTestEntity('contact', {
  first_name: 'John',
  last_name: 'Doe', 
  organization_id: org.id,           // ✅ Proper UUID
  purchase_influence: 'moderate',    // ✅ Valid enum
  decision_authority: 'recommender'  // ✅ Valid enum
})
```

### 3. Generic Database Helper

```typescript
class DatabaseTestHelper<T extends EntityType> {
  async create(data: Partial<EntityMap[T]['Insert']>): Promise<EntityMap[T]['Row']> {
    // Type-safe implementation
  }
  
  async list(filters?: Partial<EntityMap[T]['Row']>): Promise<EntityMap[T]['Row'][]> {
    // Type-safe filtering
  }
}

// Usage with full type safety
const orgHelper = new DatabaseTestHelper('organization')
const org = await orgHelper.create({ name: 'Test Org', type: 'customer' })
//    ^-- org is typed as Organization
```

## Advanced Type Patterns

### 1. Conditional Types for Entity Variants

```typescript
// Define valid/invalid data variants
type TestDataVariant = 'valid' | 'invalid'

type EntityTestData<T extends EntityType, V extends TestDataVariant> = 
  V extends 'valid' 
    ? Partial<EntityMap[T]['Insert']>
    : Partial<EntityMap[T]['Insert']> & { _isInvalid: true }

// Usage
const validData: EntityTestData<'organization', 'valid'> = {
  name: 'Valid Org',
  type: 'customer'
}

const invalidData: EntityTestData<'organization', 'invalid'> = {
  name: '',  // Invalid but allowed for testing
  type: 'customer',
  _isInvalid: true
}
```

### 2. Type Guards for Runtime Validation

```typescript
// Type guard functions
export const isTestEntityData = (data: unknown): data is TestEntityData => {
  return typeof data === 'object' && data !== null && 
    ('name' in data || 'first_name' in data || 'subject' in data)
}

export const isOrganization = (entity: TestEntityResult): entity is TestOrganizationResult => {
  return 'type' in entity && 'segment' in entity
}

// Usage in tests
test('should handle different entity types', () => {
  const entities: TestEntityResult[] = [org, contact, product]
  
  entities.forEach(entity => {
    if (isOrganization(entity)) {
      expect(entity.type).toBeOneOf(['customer', 'principal', 'distributor'])
      //     ^-- TypeScript knows entity is Organization
    }
  })
})
```

### 3. Mapped Types for Test Configurations

```typescript
// Generate test configurations for all entity types
type EntityTestConfigs = {
  [K in EntityType]: {
    factory: () => EntityMap[K]['Insert']
    validator: (data: EntityMap[K]['Row']) => boolean
    requiredFields: (keyof EntityMap[K]['Insert'])[]
  }
}

const testConfigs: EntityTestConfigs = {
  organization: {
    factory: () => createTestEntity('organization', {}),
    validator: (data) => !!data.name && !!data.type,
    requiredFields: ['name', 'type', 'priority', 'segment']
  },
  contact: {
    factory: () => createTestEntity('contact', {}),
    validator: (data) => !!data.first_name && !!data.last_name,
    requiredFields: ['first_name', 'last_name', 'organization_id']
  }
  // ... other entities
}
```

## Enum Type Safety

### 1. Database Enum Integration

```typescript
// Import database enums
type OrganizationType = Database['public']['Enums']['organization_type']
type ContactRole = Database['public']['Enums']['contact_role']
type OpportunityStage = Database['public']['Enums']['opportunity_stage']

// Type-safe enum validators
export const EnumValidators = {
  organizationType: (value: string): value is OrganizationType => {
    return ['customer', 'principal', 'distributor', 'prospect', 'vendor'].includes(value)
  },
  
  contactRole: (value: string): value is ContactRole => {
    return ['decision_maker', 'influencer', 'buyer', 'end_user', 'gatekeeper', 'champion'].includes(value)
  }
}

// Usage in tests
test('should validate organization type enum', () => {
  expect(EnumValidators.organizationType('principal')).toBe(true)
  expect(EnumValidators.organizationType('invalid')).toBe(false)
  
  // TypeScript ensures type safety
  const orgType: OrganizationType = 'principal' // ✅ Valid
  const badType: OrganizationType = 'invalid'   // ❌ Compile error
})
```

### 2. Constants with Type Assertions

```typescript
// Type-safe constants
export const CRM_CONSTANTS = {
  ORGANIZATION_TYPES: ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const,
  OPPORTUNITY_STAGES: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const,
} as const

// Derive types from constants
type OrganizationType = typeof CRM_CONSTANTS.ORGANIZATION_TYPES[number]
//    ^-- 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'

// Usage in factory
const createOrganization = (type: OrganizationType) => {
  return createTestEntity('organization', { type })
}
```

## Form Type Safety

### 1. Form Data Validation Types

```typescript
// Type-safe form data
interface FormTestCase<T> {
  description: string
  input: T
  expected: {
    isValid: boolean
    errors?: string[]
  }
  customValidation?: (data: T) => boolean
}

// Usage for organization form testing
const organizationFormTests: FormTestCase<OrganizationFormData>[] = [
  {
    description: 'should accept valid organization data',
    input: {
      name: 'Test Organization',
      type: 'customer',
      priority: 'B',
      segment: 'Fine Dining'
    },
    expected: { isValid: true }
  },
  {
    description: 'should reject empty name',
    input: {
      name: '',
      type: 'customer', 
      priority: 'B',
      segment: 'Fine Dining'
    },
    expected: { 
      isValid: false,
      errors: ['Name is required']
    }
  }
]
```

### 2. Mock Form Data Generation

```typescript
interface MockFormDataOptions {
  includeOptionalFields?: boolean
  useValidData?: boolean
  customOverrides?: Record<string, any>
}

function generateMockFormData<T extends FormData>(
  formType: keyof FormTypeMap,
  options: MockFormDataOptions = {}
): T {
  // Type-safe mock data generation
  const baseData = getFormDefaults(formType)
  
  if (!options.useValidData) {
    // Introduce controlled invalid data for testing
    return introduceMockErrors(baseData) as T
  }
  
  return { ...baseData, ...options.customOverrides } as T
}

// Usage
const validOrgForm = generateMockFormData<OrganizationFormData>('organization', {
  useValidData: true,
  customOverrides: { name: 'Custom Test Name' }
})
```

## Performance Type Safety

### 1. Typed Performance Benchmarks

```typescript
interface PerformanceBenchmarkConfig<T extends EntityType> {
  entityType: T
  operationType: DatabaseOperation
  testData: Partial<EntityMap[T]['Insert']>
  iterations: number
  thresholds: PerformanceThresholds
}

interface PerformanceThresholds {
  averageTime: number    // milliseconds
  maxTime: number       // milliseconds
  successRate: number   // 0.0 to 1.0
}

// Type-safe benchmark execution
async function benchmarkEntity<T extends EntityType>(
  config: PerformanceBenchmarkConfig<T>
): Promise<PerformanceTestResult> {
  const helper = new DatabaseTestHelper(config.entityType)
  // ... benchmark implementation with type safety
}

// Usage
const orgBenchmark = await benchmarkEntity({
  entityType: 'organization',
  operationType: 'create',
  testData: { name: 'Test Org', type: 'customer' },
  iterations: 10,
  thresholds: { averageTime: 50, maxTime: 200, successRate: 0.95 }
})
```

### 2. Typed Result Validation

```typescript
interface TestResults<T> {
  name: string
  result: T
  passed: boolean
  error?: string
  duration: number
  metadata?: Record<string, any>
}

// Generic result validator
function validateTestResults<T>(
  results: TestResults<T>[],
  validator: (result: T) => boolean
): TestResults<T>[] {
  return results.filter(r => r.passed && validator(r.result))
}

// Usage with type safety
const orgResults: TestResults<Organization>[] = await runOrganizationTests()
const validResults = validateTestResults(orgResults, (org) => {
  return org.name.length > 0 && org.type !== null
  //     ^-- TypeScript knows org is Organization
})
```

## Error Handling with Types

### 1. Typed Error Expectations

```typescript
interface DatabaseTestExpectations<T> {
  shouldSucceed: boolean
  expectedError?: string | RegExp
  dataValidation?: (data: T) => boolean | string
  relationshipValidation?: RelationshipValidation[]
}

// Usage
function expectDatabaseResult<T>(
  result: { data: T | null; error: any },
  expectations: DatabaseTestExpectations<T>
): void {
  if (expectations.shouldSucceed) {
    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    
    if (result.data && expectations.dataValidation) {
      const validation = expectations.dataValidation(result.data)
      if (typeof validation === 'string') {
        throw new Error(validation)
      }
      expect(validation).toBe(true)
    }
  } else {
    expect(result.error).not.toBeNull()
    if (expectations.expectedError) {
      expect(result.error.message).toMatch(expectations.expectedError)
    }
  }
}
```

### 2. Type-Safe Error Classes

```typescript
abstract class TestError extends Error {
  abstract readonly errorType: string
}

class ValidationTestError extends TestError {
  readonly errorType = 'VALIDATION'
  
  constructor(
    public entityType: EntityType,
    public field: string,
    public value: any,
    message: string
  ) {
    super(`${entityType}.${field} validation failed: ${message}`)
  }
}

class RelationshipTestError extends TestError {
  readonly errorType = 'RELATIONSHIP'
  
  constructor(
    public fromEntity: EntityType,
    public toEntity: EntityType,
    public relationship: string,
    message: string
  ) {
    super(`${fromEntity} -> ${toEntity} (${relationship}): ${message}`)
  }
}

// Usage
try {
  await ContactTestHelper.create({ first_name: 'John' }) // Missing organization_id
} catch (error) {
  if (error instanceof RelationshipTestError) {
    expect(error.fromEntity).toBe('contact')
    expect(error.toEntity).toBe('organization')
    expect(error.relationship).toBe('organization_id')
  }
}
```

## Best Practices

### 1. Prefer Type Inference Over Explicit Types

```typescript
// ✅ Good: Let TypeScript infer types
const org = await OrganizationTestHelper.create({
  name: 'Test Org',
  type: 'customer'
})
// org is inferred as Organization

// ❌ Avoid: Unnecessary explicit typing
const org: Organization = await OrganizationTestHelper.create({
  name: 'Test Org',
  type: 'customer'
}) as Organization
```

### 2. Use Const Assertions for Immutable Data

```typescript
// ✅ Good: Const assertion preserves literal types
const testScenario = {
  organizations: ['Acme Corp', 'Beta Inc', 'Gamma LLC'],
  types: ['customer', 'principal', 'distributor'],
  segments: ['Fine Dining', 'Fast Food', 'Healthcare']
} as const

// testScenario.types[0] is 'customer', not string
```

### 3. Leverage Template Literal Types

```typescript
// Template literal types for test naming
type TestPrefix = 'test' | 'mock' | 'stub'
type EntityType = 'organization' | 'contact' | 'product'
type TestEntityName = `${TestPrefix}_${EntityType}_${string}`

const createTestName = <T extends TestEntityName>(name: T): T => name

const validName = createTestName('test_organization_acme_corp')  // ✅ Valid
const invalidName = createTestName('invalid_name')               // ❌ Type error
```

### 4. Use Branded Types for IDs

```typescript
// Branded types prevent ID mixing
type OrganizationId = string & { readonly __brand: 'OrganizationId' }
type ContactId = string & { readonly __brand: 'ContactId' }

const createOrganizationId = (id: string): OrganizationId => id as OrganizationId
const createContactId = (id: string): ContactId => id as ContactId

// Usage prevents accidental ID swapping
function linkContactToOrganization(contactId: ContactId, orgId: OrganizationId) {
  // Implementation with type safety
}

const orgId = createOrganizationId(org.id)
const contactId = createContactId(contact.id)

linkContactToOrganization(contactId, orgId)     // ✅ Correct order
linkContactToOrganization(orgId, contactId)     // ❌ Type error
```

## Common TypeScript Issues and Solutions

### 1. Generic Type Constraints

```typescript
// ❌ Problem: Generic type too broad
function processEntity<T>(entity: T): T {
  return entity.name.toUpperCase() // Error: Property 'name' doesn't exist on T
}

// ✅ Solution: Add type constraint
interface HasName {
  name: string
}

function processEntity<T extends HasName>(entity: T): T {
  return { ...entity, name: entity.name.toUpperCase() }
}
```

### 2. Union Type Discrimination

```typescript
// Discriminated union for different test scenarios
type TestCase = 
  | { type: 'valid'; data: ValidEntityData }
  | { type: 'invalid'; data: InvalidEntityData; expectedError: string }
  | { type: 'edge_case'; data: EdgeCaseData; customValidation: () => boolean }

function runTestCase(testCase: TestCase) {
  switch (testCase.type) {
    case 'valid':
      // TypeScript knows testCase.data is ValidEntityData
      expect(validateEntity(testCase.data)).toBe(true)
      break
    case 'invalid':
      // TypeScript knows testCase has expectedError
      expect(() => validateEntity(testCase.data)).toThrow(testCase.expectedError)
      break
    case 'edge_case':
      // TypeScript knows testCase has customValidation
      expect(testCase.customValidation()).toBe(true)
      break
  }
}
```

### 3. Async Type Safety

```typescript
// ✅ Good: Proper async/await typing
async function createTestOrganizations(): Promise<Organization[]> {
  const operations = Array.from({ length: 5 }, (_, i) =>
    OrganizationTestHelper.create({
      name: `Test Org ${i}`,
      type: 'customer'
    })
  )
  
  return await Promise.all(operations)
  // Return type is correctly inferred as Promise<Organization[]>
}

// ❌ Avoid: Mixed Promise handling
function createTestOrganizationsBad() {
  return Array.from({ length: 5 }, (_, i) =>
    OrganizationTestHelper.create({
      name: `Test Org ${i}`,
      type: 'customer'
    })
  )
  // Return type is Promise<Organization>[], not Promise<Organization[]>
}
```

By following these TypeScript patterns, your tests will have:
- **Compile-time error detection**
- **Better IDE support and autocomplete**
- **Self-documenting test code**  
- **Reduced runtime errors**
- **Easier refactoring and maintenance**