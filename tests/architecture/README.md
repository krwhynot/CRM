# Architecture Compliance Tests

This directory contains tests that validate architectural patterns and safeguards in the CRM system.

## Test Categories

### State Management Tests
- **state-boundaries.test.ts** - Validates TanStack Query vs Zustand separation
- **query-patterns.test.ts** - Tests TanStack Query implementation patterns
- **store-patterns.test.ts** - Tests Zustand store implementations

### Component Organization Tests
- **component-placement.test.ts** - Validates feature vs shared component placement
- **import-patterns.test.ts** - Tests import path conventions
- **feature-boundaries.test.ts** - Validates feature isolation

### Performance Tests
- **optimization-patterns.test.ts** - Tests performance optimization implementations
- **bundle-analysis.test.ts** - Validates bundle size and structure
- **runtime-performance.test.ts** - Tests runtime performance characteristics

### ESLint Rule Tests
- **eslint-rules.test.ts** - Tests custom ESLint rule functionality
- **architectural-enforcement.test.ts** - Validates automated enforcement

## Running Tests

```bash
# Run all architecture tests
npm run test:architecture

# Run specific test categories
npm run test:architecture:state
npm run test:architecture:components
npm run test:architecture:performance
npm run test:architecture:eslint
```

## Test Utilities

Shared utilities for architecture testing are available in `/tests/shared/architecture-test-utils.ts`.