# Database Integration Testing Guide

## Overview

This guide provides comprehensive documentation for the database integration test suite designed to prevent schema drift and ensure ongoing database compatibility in the KitchenPantry CRM system.

## Table of Contents

1. [Test Architecture](#test-architecture)
2. [Getting Started](#getting-started)
3. [Test Categories](#test-categories)
4. [Running Tests](#running-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Maintenance](#maintenance)

## Test Architecture

### Framework Stack

- **Test Runner**: Vitest with jsdom environment
- **Database Client**: Supabase JavaScript client
- **Form Testing**: React Testing Library
- **Validation**: Yup schema validation
- **Coverage**: V8 coverage provider

### Test Structure

```
src/test/
├── setup.ts                    # Global test configuration
├── utils/
│   └── test-database.ts        # Database utilities
├── fixtures/
│   └── test-data.ts           # Test data factories
├── database/                   # Database-specific tests
│   ├── schema-validation.test.ts
│   ├── organizations-crud.test.ts
│   ├── contacts-crud.test.ts
│   └── constraint-validation.test.ts
└── integration/               # Form integration tests
    └── form-validation.test.tsx
```

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Access to Supabase test database
3. Environment variables configured

### Installation

```bash
# Install dependencies
npm ci

# Install additional test dependencies if needed
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom
```

### Environment Setup

Create a `.env.test` file with test database credentials:

```env
VITE_SUPABASE_URL=your_test_supabase_url
VITE_SUPABASE_ANON_KEY=your_test_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

Ensure your test database has:
- All required tables and schemas
- RLS policies configured
- Test user accounts created
- Proper permissions set

## Test Categories

### 1. Schema Validation Tests

**Purpose**: Verify database schema matches TypeScript types and expected structure.

**Location**: `src/test/database/schema-validation.test.ts`

**Tests Include**:
- Table existence and column validation
- Enum value consistency
- Foreign key relationships
- RLS policy verification
- Security function validation

**Example**:
```typescript
it('should validate organizations table schema', async () => {
  const result = await validateTableSchema('organizations', ExpectedSchemas.organizations)
  expect(result.exists).toBe(true)
  expect(result.missingColumns).toEqual([])
})
```

### 2. CRUD Operation Tests

**Purpose**: Validate create, read, update, and delete operations for all entities.

**Locations**: 
- `src/test/database/organizations-crud.test.ts`
- `src/test/database/contacts-crud.test.ts`
- Additional CRUD test files for each entity

**Tests Include**:
- Valid data insertion
- Data retrieval with filtering
- Update operations
- Soft delete functionality
- Relationship integrity

**Example**:
```typescript
it('should create a new organization with valid data', async () => {
  const orgData = TestDataFactory.createOrganization()
  const { data, error } = await testSupabase
    .from('organizations')
    .insert(orgData)
    .select()
    .single()
  
  expect(error).toBeNull()
  expect(data?.name).toBe(orgData.name)
})
```

### 3. Constraint Validation Tests

**Purpose**: Verify database constraints are properly enforced.

**Location**: `src/test/database/constraint-validation.test.ts`

**Tests Include**:
- NOT NULL constraints
- Foreign key constraints
- Enum constraints
- CHECK constraints
- Unique constraints
- Business logic constraints

**Example**:
```typescript
it('should enforce NOT NULL on organization.name', async () => {
  const invalidData = { type: 'customer', priority: 'B' }
  const { data, error } = await testSupabase
    .from('organizations')
    .insert(invalidData as any)
  
  expect(error).toBeDefined()
  expect(error?.code).toBe('23502') // NOT NULL violation
})
```

### 4. Form Integration Tests

**Purpose**: Validate form validation schemas match database constraints.

**Location**: `src/test/integration/form-validation.test.tsx`

**Tests Include**:
- Schema validation consistency
- Enum value alignment
- Required field enforcement
- Error message validation
- Field mapping accuracy

## Running Tests

### Command Line Options

```bash
# Run all database integration tests
npm run test:database

# Run specific test suite
npm run test:database -- src/test/database/schema-validation.test.ts

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Watch mode for development
npm test
```

### Test Runner Script

Use the comprehensive test runner for full reporting:

```bash
# Run complete database integration test suite
node scripts/run-database-tests.js
```

This generates:
- JSON test results
- Markdown reports
- Failure analysis
- Recommendations

### Environment-Specific Testing

```bash
# Test against staging database
VITE_SUPABASE_URL=staging_url npm run test:database

# Test against local database
VITE_SUPABASE_URL=localhost:54321 npm run test:database
```

## CI/CD Integration

### GitHub Actions Workflow

The test suite includes a comprehensive GitHub Actions workflow:

**File**: `.github/workflows/database-integration-tests.yml`

**Triggers**:
- Push to main/develop branches
- Pull requests
- Daily scheduled runs (2 AM UTC)

**Jobs**:
1. **Schema Validation**: Verify database schema integrity
2. **CRUD Operations**: Test all entity operations
3. **Form Integration**: Validate form-database alignment
4. **Health Check**: Monitor database health
5. **Regression Prevention**: Test for known issues

**Artifacts**:
- Test results (JSON/HTML)
- Coverage reports
- Health check reports
- Regression analysis

### Pull Request Integration

Tests automatically run on PRs and provide:
- Status checks that block merging on failures
- Detailed test reports in PR comments
- Coverage metrics
- Regression analysis

### Scheduled Monitoring

Daily runs detect:
- Schema drift
- Performance degradation
- Security policy changes
- Data integrity issues

## Troubleshooting

### Common Issues

#### Database Connection Failures

```bash
Error: Database connection failed
```

**Solutions**:
1. Verify environment variables are set correctly
2. Check database URL and credentials
3. Ensure database is accessible from test environment
4. Verify RLS policies allow test operations

#### Schema Validation Failures

```bash
Error: Missing columns in table
```

**Solutions**:
1. Run database migrations
2. Regenerate TypeScript types
3. Update expected schema definitions
4. Check for recent schema changes

#### Constraint Violations

```bash
Error: Foreign key constraint violation
```

**Solutions**:
1. Check test data relationships
2. Verify foreign key references exist
3. Review constraint definitions
4. Update test data factories

#### Enum Value Mismatches

```bash
Error: Invalid enum value
```

**Solutions**:
1. Update database enum definitions
2. Sync TypeScript enum types
3. Update validation schemas
4. Check Constants export

### Debugging Tests

#### Enable Verbose Logging

```bash
# Run with debug output
DEBUG=* npm run test:database

# Supabase client debugging
SUPABASE_DEBUG=true npm run test:database
```

#### Test Data Inspection

```typescript
// Add to test for debugging
console.log('Test data:', JSON.stringify(testData, null, 2))
console.log('Database response:', { data, error })
```

#### Isolation Testing

```bash
# Run single test file
npm run test:database -- src/test/database/organizations-crud.test.ts

# Run specific test case
npm run test:database -- --grep "should create organization"
```

## Best Practices

### Test Data Management

1. **Use Factories**: Always use `TestDataFactory` for consistent test data
2. **Cleanup**: Ensure `cleanupTestData()` runs before/after tests
3. **Isolation**: Each test should be independent
4. **Realistic Data**: Use realistic but recognizable test data

### Assertion Patterns

```typescript
// Good: Specific assertions
expect(data?.name).toBe('Expected Name')
expect(error?.code).toBe('23502')

// Avoid: Generic assertions
expect(data).toBeTruthy()
expect(error).toBeFalsy()
```

### Error Handling

```typescript
// Always check both success and failure cases
const { data, error } = await operation()

if (expectSuccess) {
  expect(error).toBeNull()
  expect(data).toBeDefined()
} else {
  expect(error).toBeDefined()
  expect(error?.code).toBe(expectedErrorCode)
}
```

### Performance Considerations

1. **Parallel Execution**: Use `describe.concurrent` for independent tests
2. **Database Limits**: Respect connection limits
3. **Cleanup Efficiency**: Batch cleanup operations
4. **Query Optimization**: Use specific selects and filters

### Test Maintenance

1. **Keep Tests Updated**: Update tests when schema changes
2. **Regular Review**: Review and refactor test code
3. **Documentation**: Document complex test scenarios
4. **Version Control**: Track test changes with schema changes

## Maintenance

### Regular Tasks

#### Weekly
- Review test failure reports
- Update test data as needed
- Check performance metrics
- Validate coverage targets

#### Monthly
- Review and update expected schemas
- Optimize slow tests
- Update test documentation
- Analyze failure patterns

#### Quarterly
- Comprehensive test suite review
- Update testing tools and dependencies
- Performance benchmarking
- Security review

### Schema Change Protocol

When making database schema changes:

1. **Update Types**: Regenerate TypeScript types
2. **Update Tests**: Modify test expectations
3. **Update Fixtures**: Adjust test data factories
4. **Update Validation**: Sync Yup schemas
5. **Run Tests**: Ensure all tests pass
6. **Update Docs**: Document schema changes

### Monitoring and Alerts

Set up monitoring for:
- Test failure rates
- Schema drift detection
- Performance degradation
- Coverage drops below thresholds

### Emergency Procedures

If critical tests fail in production:

1. **Immediate**: Stop deployments
2. **Assess**: Identify scope of impact
3. **Investigate**: Check recent changes
4. **Fix**: Address root cause
5. **Verify**: Run full test suite
6. **Document**: Record lessons learned

## Integration with Development Workflow

### Pre-commit Hooks

```bash
# Run quick database tests before commit
npm run test:database -- --reporter=minimal
```

### Development Guidelines

1. **Test-Driven**: Write tests before schema changes
2. **Continuous**: Run tests during development
3. **Review**: Include test changes in code reviews
4. **Document**: Update tests with feature changes

### Release Process

1. All database integration tests must pass
2. Coverage must meet minimum thresholds
3. No critical or high-priority test failures
4. Schema changes must be documented
5. Migration tests must pass

---

## Support

For questions or issues with the database integration test suite:

1. Check this documentation first
2. Review test logs and error messages
3. Check GitHub Issues for known problems
4. Contact the development team

---

*This guide is maintained as part of the KitchenPantry CRM project and should be updated whenever the test suite changes.*