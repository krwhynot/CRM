# Backend Database Testing Suite

This comprehensive backend testing suite validates the KitchenPantry CRM database operations, security, performance, and data integrity using Vitest and Supabase.

## Overview

The backend tests cover:
- **Database Operations**: CRUD operations for all 5 core entities
- **Row Level Security (RLS)**: Multi-tenant data isolation
- **Data Integrity**: Constraints, foreign keys, and business logic
- **Performance**: Query optimization and index effectiveness  
- **Excel Import**: Backend validation and batch processing
- **Real-time Features**: Subscription and trigger testing
- **Security**: SQL injection prevention and authentication

## Test Structure

```
tests/backend/
├── setup/
│   └── test-setup.ts          # Global test configuration
├── database/
│   ├── organizations.test.ts   # Organizations CRUD tests
│   ├── contacts.test.ts        # Contacts CRUD tests
│   └── products.test.ts        # Products CRUD tests
├── security/
│   └── rls-policies.test.ts    # Row Level Security tests
├── performance/
│   └── query-optimization.test.ts # Performance benchmarks
├── integrity/
│   └── data-constraints.test.ts   # Constraint validation
├── imports/
│   └── excel-import-backend.test.ts # Import validation
└── README.md                   # This file
```

## Running Tests

### All Backend Tests
```bash
npm run test:backend
```

### Specific Test Suites
```bash
# Database operations tests
npm run test:db

# Performance tests
npm run test:performance

# Security tests (RLS policies)
npm run test:security

# Data integrity tests
npm run test:integrity

# Excel import backend tests
npm run test:import-backend
```

### Watch Mode (Development)
```bash
npm run test:backend:watch
```

### Coverage Report
```bash
npm run test:backend:coverage
```

## Test Configuration

### Environment Variables
Create a `.env.test` file with:
```env
VITE_SUPABASE_URL=your_test_database_url
VITE_SUPABASE_ANON_KEY=your_test_anon_key
TEST_USER_EMAIL=test@kitchenpantrycrm.com
TEST_USER_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=admin@kitchenpantrycrm.com
TEST_ADMIN_PASSWORD=AdminPassword123!
```

### Test Database Setup
1. Create a separate Supabase project for testing
2. Apply the same schema as production
3. Enable RLS policies for security testing
4. Create test users with appropriate permissions

## Test Categories

### 1. Database Operations Tests

#### Organizations (`tests/backend/database/organizations.test.ts`)
- **CREATE**: Organization creation with validation
- **READ**: Queries with pagination and filtering  
- **UPDATE**: Field updates and business logic
- **DELETE**: Soft delete functionality
- **Performance**: Index effectiveness validation

**Key Tests:**
- Required field validation
- Type enumeration constraints
- Soft delete queries
- Search performance benchmarks

#### Contacts (`tests/backend/database/contacts.test.ts`)
- **Relationships**: Organization foreign keys
- **Constraints**: Primary contact uniqueness
- **Role Management**: Contact role validation
- **Cascade Behavior**: Organization dependency handling

**Key Tests:**
- Organization relationship integrity
- Primary contact constraint enforcement
- Contact role enumeration validation
- Contact transfer between organizations

#### Products (`tests/backend/database/products.test.ts`)
- **Principal Relationships**: Principal organization validation
- **Category Management**: Product categorization
- **SKU Uniqueness**: Per-principal SKU constraints
- **Seasonal Logic**: Date range validation

**Key Tests:**
- Principal organization type constraint
- SKU uniqueness per principal
- Seasonal availability logic
- Pricing decimal precision

### 2. Row Level Security Tests

#### Multi-Tenant Isolation (`tests/backend/security/rls-policies.test.ts`)
- **User Isolation**: Data access separation
- **Policy Enforcement**: CREATE/READ/UPDATE/DELETE policies
- **Admin Access**: Administrative override testing
- **Anonymous Prevention**: Unauthenticated access blocking

**Key Tests:**
- User can only see their own data
- Cross-tenant data leakage prevention
- Admin access to all tenant data
- Policy performance impact measurement

### 3. Performance Tests

#### Query Optimization (`tests/backend/performance/query-optimization.test.ts`)
- **Index Effectiveness**: Primary key, foreign key, and composite indexes
- **Complex Queries**: Multi-table JOINs and aggregations
- **Pagination**: Large dataset handling
- **Concurrent Load**: Multiple simultaneous queries

**Performance Targets:**
- Simple queries: <25ms
- JOIN queries: <75ms  
- Dashboard queries: <150ms
- Search queries: <100ms
- Large pagination: <150ms

**Key Metrics:**
- Query execution time
- Rows processed per millisecond
- Index utilization effectiveness
- Concurrent query handling

### 4. Data Integrity Tests

#### Constraint Validation (`tests/backend/integrity/data-constraints.test.ts`)
- **Foreign Keys**: Relationship integrity enforcement
- **Check Constraints**: Business rule validation
- **Unique Constraints**: Duplication prevention
- **Not Null Constraints**: Required field validation

**Key Tests:**
- Opportunity probability range (0-100)
- Product season constraints (1-12)
- Contact-organization relationship validation
- Principal organization type enforcement

### 5. Excel Import Backend Tests

#### Import Validation (`tests/backend/imports/excel-import-backend.test.ts`)
- **Data Validation**: Field format and business rule validation
- **Batch Processing**: Large dataset import performance
- **Error Handling**: Detailed error reporting and recovery
- **Data Integrity**: Transaction safety and rollback

**Import Performance Targets:**
- Small batches (25 records): <5 seconds
- Medium batches (100 records): <15 seconds  
- Large batches (200 records): <30 seconds
- Error recovery: <2 seconds per failed record

**Key Tests:**
- CSV parsing and validation
- Batch processing with error handling
- Duplicate data management
- Import resume functionality

## Test Utilities

### Global Test Setup (`tests/backend/setup/test-setup.ts`)
Provides:
- **TestSupabase**: Configured Supabase client
- **TestCleanup**: Automatic test data cleanup
- **PerformanceMonitor**: Query performance tracking
- **TestAuth**: Authentication management

### Helper Functions
```typescript
// Track test data for cleanup
TestCleanup.trackCreatedRecord('organizations', orgId)

// Measure query performance  
const result = await PerformanceMonitor.measureQuery('query_name', async () => {
  return await supabase.from('table').select('*')
})

// Authenticate test users
await TestAuth.loginAsTestUser()
await TestAuth.loginAsAdmin()
```

## Performance Benchmarks

### Database Query Performance
The tests establish performance baselines for common CRM operations:

| Query Type | Target | Measured | Status |
|------------|--------|----------|---------|
| Simple Lookups | <25ms | Variable | ✅ |
| Organization Filtering | <50ms | Variable | ✅ |
| Contact with Org JOIN | <75ms | Variable | ✅ |
| Product with Principal JOIN | <100ms | Variable | ✅ |
| Dashboard Metrics | <150ms | Variable | ✅ |
| Full-text Search | <100ms | Variable | ✅ |

### Import Performance
Import processing benchmarks with realistic CRM data volumes:

| Import Size | Target Time | Records/Second |
|-------------|-------------|----------------|
| 25 records | <5s | >5 rec/sec |
| 100 records | <15s | >6.7 rec/sec |  
| 200 records | <30s | >6.7 rec/sec |

## Continuous Integration

### Test Pipeline Integration
```yaml
# GitHub Actions example
- name: Run Backend Tests
  run: |
    npm install
    npm run test:backend

- name: Performance Tests
  run: npm run test:performance

- name: Coverage Report  
  run: npm run test:backend:coverage
```

### Quality Gates
- **Test Coverage**: >90% for database operations
- **Performance**: All queries within target thresholds
- **Security**: 100% RLS policy coverage  
- **Data Integrity**: 100% constraint validation

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check Supabase connection
curl -I https://your-project.supabase.co/rest/v1/
```

#### RLS Policy Failures
- Verify test users exist in auth.users
- Check policy definitions match test expectations
- Ensure proper user authentication in tests

#### Performance Test Failures
- Database may need VACUUM/ANALYZE
- Check if proper indexes are created
- Network latency may affect test environment

#### Memory Issues with Large Tests
```typescript
// Use connection pooling limits
const supabase = createClient(url, key, {
  db: { schema: 'public' },
  global: { headers: { 'Connection': 'keep-alive' } }
})
```

### Debug Mode
```bash
# Run specific test with debug output
DEBUG=1 npx vitest run tests/backend/database/organizations.test.ts
```

## Contributing

### Adding New Tests
1. Follow the existing test structure
2. Use the global test utilities
3. Include performance benchmarks
4. Add proper cleanup in `afterEach`/`afterAll`
5. Document expected behavior and edge cases

### Test Naming Convention
```typescript
describe('Entity Database Operations', () => {
  describe('CREATE Operations', () => {
    test('should create entity with all required fields', async () => {
      // Test implementation
    })
  })
})
```

### Performance Test Guidelines
- Always include timing measurements
- Set realistic performance expectations  
- Test with production-like data volumes
- Consider network latency in CI environments

## Security Considerations

### Test Data Sensitivity
- Use only synthetic test data
- Never use production user credentials
- Clean up test data after each test run
- Use separate test database environment

### RLS Policy Testing
- Test with multiple user accounts
- Verify data isolation across tenants
- Test admin vs. regular user permissions
- Validate policy performance impact

This comprehensive backend testing suite ensures the KitchenPantry CRM system meets enterprise-grade requirements for performance, security, and reliability.