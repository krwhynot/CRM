# Current Scripts Analysis

## Script Categories

### Build Scripts
- **`dev`**: Start Vite development server
- **`build`**: Production build with Vite
- **`preview`**: Preview production build locally
- **`type-check`**: TypeScript compilation check without emitting files
- **`clean`**: Remove build artifacts (dist, reports, tsbuildinfo)
- **`clean:all`**: Full cleanup including node_modules and package-lock.json
- **`fresh`**: Clean reinstall - removes node_modules and reinstalls dependencies
- **`organize`**: Quick cleanup and git status check
- **`analyze`**: Build and visualize bundle with vite-bundle-visualizer

### Test Scripts
- **`test`**: Run all MCP tests via Node.js test runner
- **`test:auth`**: Authentication flow tests (MCP-based)
- **`test:crud`**: CRUD operation tests (MCP-based)
- **`test:dashboard`**: Dashboard functionality tests (MCP-based)
- **`test:mobile`**: Mobile/responsive tests (MCP-based)
- **`test:backend`**: Vitest backend unit/integration tests
- **`test:backend:watch`**: Watch mode for backend tests
- **`test:backend:coverage`**: Backend tests with coverage reporting
- **`test:db`**: Database-specific tests
- **`test:performance`**: Performance benchmark tests
- **`test:security`**: Security validation tests
- **`test:integrity`**: Data integrity validation tests
- **`test:import-backend`**: Backend import functionality tests
- **`test:architecture`**: Architecture boundary validation tests
- **`test:architecture:state`**: State boundary validation tests
- **`test:architecture:components`**: Component placement validation tests
- **`test:architecture:performance`**: Performance pattern validation tests
- **`test:architecture:eslint`**: Custom ESLint rule validation tests
- **`test:migration`**: Migration-related tests
- **`test:migration:watch`**: Watch mode for migration tests
- **`test:migration:parity`**: Zod validation consistency tests
- **`test:quality`**: Quality monitoring tests
- **`test:ui-compliance`**: UI design token compliance tests
- **`test:ui-consistency`**: UI consistency validation tests
- **`test:design-tokens`**: Design token validation tests
- **`test:design-tokens:visual`**: Visual regression tests for design tokens
- **`test:design-tokens:contracts`**: Design token contract validation tests

### Quality Scripts
- **`lint`**: ESLint validation with architectural rules (max 20 warnings)
- **`lint:architecture`**: Custom architectural lint rules
- **`lint:ui`**: UI-specific ESLint validation (max 0 warnings)
- **`format`**: Prettier code formatting
- **`format:check`**: Check code formatting without modifying files
- **`validate`**: Complete validation pipeline (type-check + lint + build)
- **`validate:architecture`**: Architecture pattern validation
- **`validate:performance`**: Performance baseline validation
- **`validate:design-tokens`**: Design system validation
- **`quality-gates`**: Comprehensive 6-stage quality gates validation
- **`optimize:performance`**: Performance optimization analysis

### Dev Scripts
- **`dev:setup`**: Development environment setup
- **`dev:assist`**: Development assistant for code analysis
- **`dev:health`**: Development health check
- **`dev:fix`**: Auto-fix common development issues

### Documentation Scripts
- **`docs:lint`**: Markdown linting for documentation
- **`docs:links`**: Check markdown links validity
- **`docs:validate`**: Complete documentation validation (lint + links)

### Technical Debt Scripts
- **`debt:audit`**: Technical debt analysis
- **`debt:scan`**: Scan for debt patterns
- **`debt:report`**: Generate debt report
- **`debt:validate`**: Validate debt tracking
- **`debt:issues`**: Create GitHub issues for technical debt

### Utility Scripts
- **`ui:scan`**: Scan for hardcoded colors/styles in codebase
- **`hooks:install`**: Install git pre-commit hooks
- **`prepare`**: Husky setup (runs automatically on npm install)

## Script Dependencies

### Core Dependencies
- **`validate`**: calls `type-check`, `lint`, `build` (sequential pipeline)
- **`quality-gates`**: calls `type-check`, `lint`, `validate:architecture`, `build`, `validate:performance`, `test:ui-consistency`
- **`docs:validate`**: calls `docs:lint`, `docs:links`
- **`test:ui-compliance`**: calls `lint:ui`, `validate:design-tokens`
- **`analyze`**: calls `build` then `vite-bundle-visualizer`
- **`fresh`**: calls `clean` then removes node_modules and reinstalls

### GitHub Workflows Usage
- **quality-gates.yml**: Uses `type-check`, `lint`, `build`, custom validation scripts
- **comprehensive-testing.yml**: Uses `lint`, `type-check`, `format:check`, `build`, `test:backend`, `test:security`, smoke tests, mobile tests, performance tests
- **pr-quality-check.yml**: Uses validation pipeline scripts
- **design-tokens.yml**: Uses design token validation scripts

### Pre-commit Hook Integration
- **`.githooks/pre-commit`**: Uses `lint` and `lint:ui` on staged files, checks technical debt patterns

## Complexity Analysis

### High Complexity Scripts
- **`quality-gates`** (280 lines): Complex bash script with 7 validation gates, reporting, metrics calculation, error handling, and cleanup
- **`validate-architecture.js`** (546 lines): Comprehensive architecture validation with component organization, import patterns, naming conventions, state management, file sizes
- **`run-quality-gates.sh`**: Multi-stage pipeline with detailed reporting and threshold checking

### Medium Complexity Scripts
- **`validate:performance`**: Performance monitoring with timeout and reporting
- **`dev:assist`**: Development assistant with multiple subcommands
- **`debt:*`** scripts: Technical debt management with scanning, reporting, and GitHub integration
- **`test:*`** scripts: Various test suites with specific configurations
- **Architecture validation scripts**: Custom rules and boundary checking

### Simple Scripts
- **`dev`**, **`build`**, **`preview`**: Direct Vite commands
- **`type-check`**: Direct TypeScript compilation
- **`format`**, **`format:check`**: Direct Prettier commands
- **`clean`**, **`clean:all`**: File/directory cleanup
- **Basic test runners**: Single-purpose test execution

## CI/CD Integration

### GitHub Workflows
1. **quality-gates.yml**: Core quality validation workflow
   - Uses: `type-check`, `lint`, `build`, bundle analysis, performance baseline, architecture health
   - Triggers: Push to main/develop, PRs to main
   - 3 parallel jobs: quality-gates, performance-regression, mobile-optimization

2. **comprehensive-testing.yml**: Full testing pipeline
   - Uses: `lint`, `type-check`, `format:check`, `build`, `test:backend`, `test:security`
   - 7-phase pipeline: code-quality → backend-tests → frontend-e2e → performance → security → summary → deploy
   - Complex multi-job workflow with artifact handling

3. **pr-quality-check.yml**: PR-specific validation
4. **design-tokens.yml**: Design system validation
5. **deploy.yml**: Deployment workflows
6. **playwright-tests.yml**: E2E testing with Playwright

### Pre-commit Hooks
- **ESLint validation**: Runs on staged TypeScript files
- **UI/UX compliance**: Design token validation
- **Technical debt tracking**: Warns about new TODO/FIXME comments
- **Feature flag validation**: Checks for TBD GitHub issues

## Recommendations

### Consolidation Opportunities

1. **Test Script Rationalization**:
   - **Current**: 23 different test scripts with overlapping functionality
   - **Recommendation**: Consolidate into test suites with parameters
   ```bash
   npm run test -- --suite=backend --coverage
   npm run test -- --suite=architecture --watch
   npm run test -- --suite=mcp --type=auth,crud
   ```

2. **Validation Pipeline Simplification**:
   - **Current**: `validate`, `quality-gates`, `test:ui-compliance` have overlapping validation steps
   - **Recommendation**: Single parameterized validation script
   ```bash
   npm run validate -- --level=basic    # type-check + lint + build
   npm run validate -- --level=full     # full quality gates
   npm run validate -- --level=ui       # UI compliance only
   ```

3. **Architecture Validation Consolidation**:
   - **Current**: `validate:architecture`, `lint:architecture`, multiple `test:architecture:*`
   - **Recommendation**: Single architecture command with subcommands
   ```bash
   npm run arch -- validate
   npm run arch -- lint
   npm run arch -- test --focus=state-boundaries
   ```

### Removal Candidates

1. **Redundant Cleanup Scripts**:
   - **`organize`**: Just runs `clean` and `git status` - functionality available via other commands
   - **Recommendation**: Remove, users can run `npm run clean && git status` manually

2. **Duplicate Format Scripts**:
   - **`format:check`**: Only used in CI, could be replaced with CI-specific script
   - **Recommendation**: Keep but consolidate with `format` using parameter

3. **Legacy Test Scripts**:
   - **`backend-validation.test.js`**, **`frontend-smoke.test.js`**, **`simple-db-test.js`**: Standalone test files that duplicate functionality of organized test suites
   - **Recommendation**: Remove standalone files, ensure functionality is covered in organized test suites

### Script Optimization Recommendations

1. **Parameter-driven Scripts**:
   ```bash
   # Instead of multiple debt scripts
   npm run debt -- audit
   npm run debt -- scan --type=todo
   npm run debt -- report --format=json
   ```

2. **Environment-aware Execution**:
   ```bash
   # Intelligent script execution based on context
   npm run validate:ci    # Optimized for CI environment
   npm run validate:dev   # Optimized for development
   ```

3. **Parallel Execution Optimization**:
   - **Current**: Sequential execution in quality-gates
   - **Recommendation**: Parallelize independent validations (type-check + lint + architecture)

4. **Caching Integration**:
   - Add intelligent caching to expensive operations (bundle analysis, architecture validation)
   - Skip unchanged validation steps based on file timestamps

### Script Naming Consistency

1. **Standardize Prefixes**:
   - `test:*` for all testing operations
   - `validate:*` for validation operations
   - `dev:*` for development utilities
   - `build:*` for build-related operations

2. **Action-Resource Pattern**:
   ```bash
   npm run lint:code       # instead of just 'lint'
   npm run lint:ui         # consistent with pattern
   npm run lint:arch       # instead of 'lint:architecture'
   npm run validate:types  # instead of 'type-check'
   ```

### Proposed Rationalized Script Structure

```json
{
  "scripts": {
    // Core Build & Dev
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist reports *.tsbuildinfo",

    // Validation (consolidated)
    "validate": "./scripts/validate.sh",                    // basic validation
    "validate:full": "./scripts/validate.sh --full",       // quality gates
    "validate:arch": "./scripts/validate.sh --arch",       // architecture only
    "validate:ui": "./scripts/validate.sh --ui",           // UI compliance

    // Testing (consolidated)
    "test": "./scripts/test.sh",                           // run all tests
    "test:unit": "./scripts/test.sh --suite=unit",        // unit tests only
    "test:integration": "./scripts/test.sh --suite=integration",
    "test:e2e": "./scripts/test.sh --suite=e2e",

    // Code Quality
    "lint": "eslint src --ext ts,tsx --max-warnings 20",
    "format": "prettier --write src/**/*.{ts,tsx}",

    // Development Tools
    "dev:setup": "./scripts/dev-setup.sh",
    "dev:health": "./scripts/dev-assistant.sh health",

    // Documentation
    "docs:validate": "npm run docs:lint && npm run docs:links",

    // Utilities
    "analyze": "npm run build && npx vite-bundle-visualizer",
    "prepare": "husky"
  }
}
```

This rationalization would reduce the current 70+ scripts to approximately 20-25 focused, parameterized scripts while maintaining all current functionality and improving maintainability.