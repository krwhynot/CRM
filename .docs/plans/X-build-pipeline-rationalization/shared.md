# Build Pipeline Rationalization

The current CRM build system has 70+ npm scripts across multiple categories, creating maintenance complexity and developer confusion. The rationalization aims to consolidate these into ~20-25 parameterized scripts while preserving all functionality and quality enforcement. The system features sophisticated quality gates, architectural validation, and performance monitoring that must be maintained through the consolidation process.

## Relevant Files

### Core Configuration
- `/package.json`: Contains 70+ scripts across 7 categories (build, test, quality, dev, docs, debt, utility)
- `/vite.config.ts`: Vite build configuration with manual chunks, optimizations, and bundle analysis
- `/tsconfig.json`: Primary TypeScript configuration with strict mode and path aliases
- `/tsconfig.architectural.json`: Enhanced TypeScript config for architectural validation
- `/.eslintrc.cjs`: ESLint configuration with custom architectural rules and import restrictions

### Build System Scripts
- `/scripts/run-quality-gates.sh`: 7-stage comprehensive quality validation pipeline (280 lines)
- `/scripts/validate-architecture.js`: Component organization and pattern validation (546 lines)
- `/scripts/performance-monitor.sh`: Performance baseline monitoring and analysis
- `/scripts/dev-assistant.js`: Development assistant for component generation and analysis
- `/scripts/measure-performance-baseline.js`: Performance benchmark establishment

### Testing Configuration
- `/vitest.config.ts`: Vitest configuration for backend testing with coverage
- `/tests/backend/setup/test-setup.ts`: Database test setup and utilities
- `/tests/mcp/`: Custom Node.js integration test suite
- `/tests/architecture/`: Architecture pattern validation tests

### CI/CD Integration
- `/.github/workflows/quality-gates.yml`: Core quality validation workflow
- `/.github/workflows/comprehensive-testing.yml`: Full testing pipeline with 7 phases
- `/.githooks/pre-commit`: Git pre-commit hook with ESLint and compliance checks
- `/lint-staged.config.js`: Staged file validation configuration

### Documentation & Analysis
- `/.docs/plans/build-pipeline-rationalization/current-scripts-analysis.docs.md`: Detailed script analysis
- `/.docs/plans/build-pipeline-rationalization/build-system-architecture.docs.md`: Build system documentation
- `/.docs/plans/build-pipeline-rationalization/quality-gates-analysis.docs.md`: Quality validation analysis

## Relevant Tables

### Supabase Database Tables
- Database tables are not directly involved in build pipeline rationalization
- Test database operations use standard CRM entities (organizations, contacts, products, opportunities)

## Relevant Patterns

**Script Consolidation Pattern**: Replace multiple single-purpose scripts with parameterized unified scripts using command-line arguments (`./scripts/test.sh --suite=backend --coverage` instead of separate `test:backend` and `test:backend:coverage` scripts).

**Quality Gate Pipeline Pattern**: Orchestrate validation steps through a unified pipeline script that can run individual gates or comprehensive validation (`./scripts/validate.sh --level=basic|full|arch|ui`).

**Parallel Execution Pattern**: Execute independent validation steps concurrently to reduce CI/CD time while maintaining quality standards (`scripts/run-quality-gates.sh` demonstrates this with parallel type-check and lint operations).

**Configuration-Driven Testing Pattern**: Use unified test runners that select test suites and configurations based on parameters rather than maintaining separate script entries (`./scripts/test.sh --suite=mcp --type=auth,crud`).

**Development Assistant Pattern**: Centralized development tooling through parameterized helper scripts that provide setup, health checks, and automated fixes (`./scripts/dev-tools.sh [setup|health|assist|fix]`).

## Relevant Docs

**/.docs/plans/build-pipeline-rationalization/current-scripts-analysis.docs.md**: You _must_ read this when working on script consolidation, removal candidates, and understanding current script dependencies and CI/CD integration.

**/.docs/plans/build-pipeline-rationalization/build-system-architecture.docs.md**: You _must_ read this when working on build tool configuration, TypeScript setup, testing framework integration, and development tooling.

**/.docs/plans/build-pipeline-rationalization/quality-gates-analysis.docs.md**: You _must_ read this when working on quality validation, architecture enforcement, performance benchmarks, and CI/CD pipeline integration.

**/CLAUDE.md**: You _must_ read this when understanding the overall project architecture, development commands, and quality standards that must be preserved during rationalization.

**/scripts/run-quality-gates.sh**: You _must_ read this when understanding the current 7-stage quality pipeline that serves as the foundation for the rationalized validation system.

**/package.json**: You _must_ read this when identifying script dependencies, understanding current categorization, and planning the consolidated script structure.