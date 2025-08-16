# Database Integration Test Suite

## Quick Start

### Run All Tests
```bash
npm run test:database
```

### Run Specific Test Categories
```bash
# Schema validation only
npm run test:database -- src/test/database/schema-validation.test.ts

# CRUD operations only
npm run test:database -- src/test/database/*-crud.test.ts

# Constraint validation only
npm run test:database -- src/test/database/constraint-validation.test.ts

# Form integration only
npm run test:integration
```

### Run with Coverage
```bash
npm run test:coverage
```

### Generate Comprehensive Report
```bash
node scripts/run-database-tests.js
```

## Test Categories Overview

### 🔍 Schema Validation
- **File**: `database/schema-validation.test.ts`
- **Purpose**: Verify database schema matches TypeScript types
- **Critical**: Yes - Blocks deployment on failure

### 📊 CRUD Operations
- **Files**: `database/*-crud.test.ts`
- **Purpose**: Test create, read, update, delete operations
- **Critical**: Yes - Core functionality validation

### 🛡️ Constraint Validation
- **File**: `database/constraint-validation.test.ts`
- **Purpose**: Verify database constraints are enforced
- **Critical**: Yes - Data integrity protection

### 📝 Form Integration
- **File**: `integration/form-validation.test.tsx`
- **Purpose**: Ensure forms match database constraints
- **Critical**: No - UX validation

## Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Test Database Requirements
- All CRM tables and schemas
- RLS policies enabled
- Test user permissions
- Enum types defined

## Test Data

### Factories
Use `TestDataFactory` for consistent test data:

```typescript
import { TestDataFactory } from '../fixtures/test-data'

// Create test organization
const orgData = TestDataFactory.createOrganization({
  name: 'Test Org',
  type: 'customer'
})

// Create test contact
const contactData = TestDataFactory.createContact(organizationId, {
  first_name: 'John',
  last_name: 'Doe'
})
```

### Cleanup
Always clean up test data:

```typescript
import { cleanupTestData } from '../utils/test-database'

afterEach(async () => {
  await cleanupTestData()
})
```

## Regression Prevention

The test suite specifically tests for issues discovered in Phases 1-3:

### ✅ Organization Issues
- Type/priority/segment field mapping
- Enum value consistency
- Business rule validation

### ✅ Contact Issues  
- Decision authority validation
- Purchase influence mapping
- Role enum consistency

### ✅ Opportunity Issues
- Priority level alignment
- Date field validation
- Probability constraints

### ✅ Product Issues
- Category enum validation
- Principal ID constraints
- Season value limits

### ✅ Interaction Issues
- Type enum consistency
- Date handling accuracy
- Duration validation

## CI/CD Integration

Tests run automatically on:
- ✅ Every push to main/develop
- ✅ All pull requests
- ✅ Daily at 2 AM UTC (health check)

### Status Indicators
- 🟢 **All tests pass**: Safe to deploy
- 🟡 **Non-critical failures**: Review recommended
- 🔴 **Critical failures**: Deployment blocked

## Quick Debugging

### Connection Issues
```bash
# Test database connection
npm run test:database -- --grep "database connection"
```

### Schema Issues
```bash
# Test specific table schema
npm run test:database -- --grep "organizations table schema"
```

### Constraint Issues
```bash
# Test specific constraints
npm run test:database -- --grep "NOT NULL"
```

### Form Issues
```bash
# Test form validation
npm run test:integration -- --grep "organization form"
```

## Common Patterns

### Test Structure
```typescript
describe('Entity CRUD Operations', () => {
  beforeEach(async () => {
    await cleanupTestData()
    // Setup test data
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should perform operation', async () => {
    // Arrange
    const testData = TestDataFactory.createEntity()
    
    // Act
    const { data, error } = await operation(testData)
    
    // Assert
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

### Error Testing
```typescript
it('should fail with invalid data', async () => {
  const invalidData = { /* invalid fields */ }
  
  const { data, error } = await testSupabase
    .from('table')
    .insert(invalidData)
  
  expect(error).toBeDefined()
  expect(error?.code).toBe('expected_error_code')
  expect(data).toBeNull()
})
```

## Performance Guidelines

- ⚡ Keep tests under 30 seconds each
- 🔄 Use concurrent execution where possible
- 🗃️ Minimize database operations
- 🧹 Clean up efficiently

## Support

- 📖 **Full Documentation**: `docs/DATABASE_INTEGRATION_TESTING_GUIDE.md`
- 🐛 **Issues**: Check GitHub Issues
- 💬 **Questions**: Contact development team

---

**Last Updated**: Phase 4.1 Implementation
**Coverage Target**: 90%+ for critical paths
**Maintenance**: Weekly review recommended