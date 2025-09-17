# Layout-as-Data Migration Validation Test Suite

## Overview

This comprehensive test suite validates the successful completion of the layout-as-data migration. It systematically tests all aspects of the migration including functionality, performance, backward compatibility, and error handling.

## Test Coverage

### 1. **Smoke Tests** (`smoke-tests.test.ts`)
- Basic page loading and rendering
- Core CRUD operations
- Navigation between pages
- Error boundary functionality
- Performance baselines

### 2. **Component Registry Tests** (`component-registry.test.ts`)
- Component registration and resolution
- Lazy loading and hot reloading
- Category management
- Schema-driven resolution
- Performance optimization
- Error handling

### 3. **Backward Compatibility Tests** (`backward-compatibility.test.ts`)
- Traditional slot-based rendering
- Existing hook interfaces
- Design token coverage (88% target)
- API stability
- Migration path validation

### 4. **Data Binding Integration Tests** (`data-binding-integration.test.ts`)
- Data binding engine
- TanStack Query integration
- Real-time synchronization
- Performance optimizations
- Error handling and caching

### 5. **Render Mode Tests** (`test-render-modes.ts`)
- Dual-mode rendering (slots vs schema)
- Performance comparison
- Mode switching functionality
- Browser-based validation

### 6. **Performance Scale Tests** (`test-performance-scale.ts`)
- Auto-virtualization at 500+ rows
- Memory usage monitoring
- Frame drop detection
- Scroll performance
- Scale testing (100-5000 rows)

### 7. **Error Scenario Tests** (`test-error-scenarios.ts`)
- Schema validation failures
- Component registry errors
- Lazy loading failures
- Race conditions
- Memory leaks

## Usage

### Quick Start

Run the complete validation suite:

```bash
npm run test:migration-validation
```

### Individual Test Suites

```bash
# Smoke tests only
npm run test:migration:smoke

# Performance tests only
npm run test:migration:performance

# Error scenario tests only
npm run test:migration:errors

# Component registry tests
cd tests/migration-validation && npm run test:registry

# Backward compatibility tests
cd tests/migration-validation && npm run test:compatibility

# Data binding tests
cd tests/migration-validation && npm run test:data-binding
```

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev  # Must be running on localhost:5173
   ```

2. **Required Dependencies**
   - Node.js 18+
   - Playwright (installed automatically)
   - Vitest
   - All project dependencies installed

## Test Results

### Report Locations
- **Comprehensive Report**: `test-results/migration-validation/migration-validation-report.json`
- **Summary Report**: `test-results/migration-validation/migration-validation-summary.md`
- **Individual Reports**: `test-results/migration-validation/*-report.md`
- **Videos**: `test-results/videos/` (browser tests only)

### Success Criteria

**Migration Passes If:**
- ✅ All smoke tests pass (basic functionality works)
- ✅ Backward compatibility score ≥ 95%
- ✅ Performance degradation < 20%
- ✅ Auto-virtualization works at 500+ rows
- ✅ Error rate < 0.1% in scenarios
- ✅ Overall score ≥ 90%

**Migration Requires Fixes If:**
- ⚠️ Overall score 70-89% (proceed with caution)
- ❌ Overall score < 70% (do not proceed)
- ❌ Any critical functionality broken
- ❌ Significant performance regression
- ❌ Backward compatibility broken

## Test Architecture

### Browser Tests (Playwright)
- **Render Mode Tests**: Validates dual-mode rendering in real browser
- **Performance Scale Tests**: Tests with actual data loads and measurements
- **Error Scenario Tests**: Reproduces production-like error conditions

### Unit/Integration Tests (Vitest)
- **Smoke Tests**: React Testing Library component tests
- **Component Registry Tests**: Unit tests for registry system
- **Compatibility Tests**: Hook and component interface validation
- **Data Binding Tests**: TanStack Query integration tests

### Test Data Generation
Tests use mock data generators to create realistic datasets:
- Products: 100-5000 items with categories, pricing, principals
- Contacts: Decision makers with authority levels and organizations
- Organizations: Various types (customer/distributor/principal) with segments

## Troubleshooting

### Common Issues

**"Development server not running"**
```bash
# Start the dev server first
npm run dev
# Then run tests in another terminal
npm run test:migration-validation
```

**"Tests failing due to timing"**
```bash
# Increase timeouts in the test files
# Or run individual test suites instead of full suite
npm run test:migration:smoke
```

**"Browser not launching"**
```bash
# Install Playwright browsers
npx playwright install
```

**"Memory errors during large scale tests"**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm run test:migration:performance
```

## Continuous Integration

### GitHub Actions Integration
```yaml
- name: Run Migration Validation
  run: |
    npm run dev &
    sleep 10  # Wait for server
    npm run test:migration-validation
  env:
    CI: true
```

### Local Development
```bash
# Full validation (like CI)
npm run dev &
sleep 5
npm run test:migration-validation

# Quick smoke test
npm run test:migration:smoke
```

## Extending Tests

### Adding New Test Scenarios

1. **Create Test File**
   ```typescript
   // tests/migration-validation/my-new-test.ts
   export async function runMyNewTest(page: Page): Promise<string> {
     // Test implementation
     return "Test report"
   }
   ```

2. **Register in Main Runner**
   ```typescript
   // In run-all-tests.ts
   import { runMyNewTest } from './my-new-test'

   // Add to runAllTests method
   const newTestReport = await runMyNewTest(this.page)
   this.results.push({
     name: 'My New Test',
     // ...
   })
   ```

### Custom Assertions
```typescript
// Add to smoke-tests.test.ts
it('should meet custom requirement', () => {
  // Custom test logic
  expect(customCheck()).toBe(true)
})
```

## Performance Benchmarks

### Expected Baselines
- **Page Load**: < 2 seconds (first load)
- **Render Switch**: < 500ms (slots ↔ schema)
- **500 Rows**: Virtualization auto-enabled
- **5000 Rows**: < 3 seconds initial render
- **Memory**: < 100MB for 1000 rows
- **Frame Drops**: < 5 during smooth scrolling

### Monitoring
- **Bundle Size**: Tracked via webpack analyzer
- **Memory Usage**: Chrome DevTools metrics
- **Render Time**: React Profiler data
- **Network**: Request timing and payload sizes

## Security Considerations

### Test Data
- All test data is generated/mocked
- No real user data or credentials used
- Tests run in isolated environment

### Browser Security
- Playwright runs in sandboxed contexts
- No access to production systems
- Local development server only

## Contributing

### Test Standards
- **Coverage**: Aim for 100% of migration features
- **Performance**: Include timing assertions
- **Error Handling**: Test failure scenarios
- **Documentation**: Update this README for new tests

### Code Review
- All test additions require review
- Performance impact must be assessed
- Error scenarios should be realistic
- Reports must be actionable

---

## Migration Decision Matrix

| Score Range | Status | Action |
|-------------|--------|--------|
| 90-100% | ✅ **PROCEED** | Deploy with confidence |
| 70-89% | ⚠️ **CAUTION** | Address issues, limited rollout |
| 50-69% | ❌ **DELAYED** | Fix critical issues first |
| 0-49% | ❌ **BLOCKED** | Major rework required |

---

**Generated by Migration Validation Test Suite v1.0**
*For questions or issues, check the test output logs and reports.*