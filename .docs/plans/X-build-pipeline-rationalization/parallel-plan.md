# Build Pipeline Rationalization - Parallel Implementation Plan

The current CRM build system has grown to 70+ npm scripts across multiple categories, creating maintenance complexity and developer confusion. This rationalization plan consolidates these into ~20-25 parameterized scripts while preserving all functionality, quality enforcement, and CI/CD integration. The approach prioritizes safety through parallel implementation, comprehensive testing, and phased rollout to minimize risk of breaking existing workflows.

## Critically Relevant Files and Documentation
- `/package.json` - Contains all 70+ scripts to be rationalized
- `/scripts/run-quality-gates.sh` - 7-stage quality pipeline that must be preserved
- `/scripts/validate-architecture.js` - Component architecture health scoring (80%+ required)
- `/scripts/performance-monitor.sh` - Performance baseline monitoring with timeout handling
- `/.github/workflows/quality-gates.yml` - Core CI/CD workflow using specific script patterns
- `/.github/workflows/comprehensive-testing.yml` - Full testing pipeline with 7 phases
- `/vite.config.ts` - Build configuration with manual chunks and optimizations
- `/.eslintrc.cjs` - Architectural enforcement with custom rules
- `/CLAUDE.md` - Development commands and quality standards
- `/.docs/plans/build-pipeline-rationalization/current-scripts-analysis.docs.md` - Detailed script analysis
- `/.docs/plans/build-pipeline-rationalization/build-system-architecture.docs.md` - Build system architecture
- `/.docs/plans/build-pipeline-rationalization/quality-gates-analysis.docs.md` - Quality validation requirements

## Implementation Plan

### Phase 1: Foundation and Safe Consolidations

#### Task 1.1: Create Consolidated Test Runners Depends on [none]

**READ THESE BEFORE TASK**
- `/package.json` - Current test script structure
- `/tests/backend/` - Vitest test suite structure
- `/tests/architecture/` - Architecture validation tests
- `/vitest.config.ts` - Current Vitest configuration

**Instructions**

Files to Create
- `/scripts/test.sh` - Unified test runner with parameter support
- `/scripts/validate.sh` - Consolidated validation runner

Files to modify
- `/package.json` - Add consolidated test commands while preserving existing ones

Create parameterized test runners that support the current test suites:
- Backend testing with coverage/watch modes
- Architecture testing with focus areas (state, components, performance, eslint)
- Migration testing with parity checks
- Design token testing with visual/contract validation

Implement backward compatibility by keeping existing scripts as aliases to new parameterized commands.

#### Task 1.2: Implement Technical Debt Management Consolidation Depends on [none]

**READ THESE BEFORE TASK**
- `/scripts/technical-debt-monitor.js` - Current debt management script
- `/package.json` - Current debt-related scripts

**Instructions**

Files to Create
- None (modify existing script to be main entry point)

Files to modify
- `/scripts/technical-debt-monitor.js` - Enhance to accept action parameters
- `/package.json` - Replace multiple debt scripts with single parameterized command

Consolidate `debt:audit`, `debt:scan`, `debt:report`, `debt:validate`, `debt:issues` into single `npm run debt -- <action>` command. Maintain all current functionality while reducing script count.

#### Task 1.3: Create Development Utility Consolidation Depends on [none]

**READ THESE BEFORE TASK**
- `/scripts/dev-assist.sh` - Current development assistant
- `/package.json` - Development utility scripts

**Instructions**

Files to Create
- `/scripts/clean.sh` - Parameterized cleanup utility

Files to modify
- `/scripts/dev-assist.sh` - Enhance to handle setup, health, fix actions
- `/package.json` - Consolidate dev utilities and clean commands

Merge development utilities (`dev:setup`, `dev:health`, `dev:fix`) into single entry point. Create parameterized clean script supporting basic, all, fresh levels. Remove redundant `organize` script.

### Phase 2: Architecture and Quality Gate Enhancement

#### Task 2.1: Enhance Quality Gates with Parameterization Depends on [1.1]

**READ THESE BEFORE TASK**
- `/scripts/run-quality-gates.sh` - Current 7-stage pipeline
- `/.github/workflows/quality-gates.yml` - CI/CD workflow dependencies
- `/.docs/plans/build-pipeline-rationalization/quality-gates-analysis.docs.md` - Critical requirements

**Instructions**

Files to Create
- `/scripts/validate-enhanced.sh` - Parameterized validation with different levels

Files to modify
- `/scripts/run-quality-gates.sh` - Add support for partial gate execution
- `/package.json` - Add validation levels while preserving core commands

Enhance quality gates to support partial execution (basic, full, architecture, performance) while maintaining the critical 7-stage pipeline for CI/CD. Preserve exit code patterns and output parsing that workflows depend on.

#### Task 2.2: Architecture Validation Script Consolidation Depends on [1.1]

**READ THESE BEFORE TASK**
- `/scripts/validate-architecture.js` - Component health scoring
- `/tests/architecture/` - Architecture test suites
- `/package.json` - Architecture-related scripts

**Instructions**

Files to Create
- None

Files to modify
- `/scripts/validate-architecture.js` - Add parameter support for focused validation
- `/package.json` - Consolidate architecture commands with focus parameters

Consolidate multiple architecture validation scripts into single entry point with focus areas (state, components, performance, eslint). Maintain 80% health score threshold and component organization enforcement.

#### Task 2.3: Format and Linting Script Optimization Depends on [none]

**READ THESE BEFORE TASK**
- `/package.json` - Current format scripts
- `/.github/workflows/comprehensive-testing.yml` - Format:check usage
- `/.eslintrc.cjs` - ESLint configuration

**Instructions**

Files to Create
- None

Files to modify
- `/package.json` - Add parameters to format command, preserve format:check for CI

Consolidate `format` and `format:check` into single parameterized command while maintaining `format:check` alias for CI/CD compatibility. Ensure no breaking changes to workflow dependencies.

### Phase 3: Testing Infrastructure Rationalization

#### Task 3.1: Backend Test Suite Integration Depends on [1.1, 2.1]

**READ THESE BEFORE TASK**
- `/tests/backend/` - Vitest test structure
- `/vitest.config.ts` - Backend testing configuration
- `/.github/workflows/comprehensive-testing.yml` - Test script usage in CI

**Instructions**

Files to Create
- None

Files to modify
- `/scripts/test.sh` - Enhance backend test parameter handling
- `/package.json` - Consolidate backend test scripts with focus parameters

Consolidate backend testing scripts (db, performance, security, integrity, imports) into parameterized command structure. Maintain CI/CD compatibility for `test:backend` and `test:security` commands.

#### Task 3.2: MCP Test Suite Organization Depends on [1.1]

**READ THESE BEFORE TASK**
- `/tests/mcp/` - Node.js integration tests
- `/tests/mcp/run-all.js` - MCP test runner
- `/.github/workflows/comprehensive-testing.yml` - MCP test usage

**Instructions**

Files to Create
- `/scripts/test-mcp.sh` - Enhanced MCP test runner with parameters

Files to modify
- `/tests/mcp/run-all.js` - Add selective test execution
- `/package.json` - Preserve individual MCP test commands for CI compatibility

Enhance MCP test suite with selective execution while preserving individual commands (`test:auth`, `test:crud`, `test:dashboard`, `test:mobile`) that CI/CD workflows depend on.

#### Task 3.3: Design Token and UI Testing Consolidation Depends on [1.1]

**READ THESE BEFORE TASK**
- `/tests/design-tokens/` - Design token validation tests
- `/package.json` - UI and design token test scripts
- `/scripts/validate-design-tokens.sh` - Current design token validation

**Instructions**

Files to Create
- None

Files to modify
- `/scripts/test.sh` - Add design token test parameters
- `/package.json` - Consolidate UI/design token scripts

Consolidate design token and UI consistency tests into parameterized structure while maintaining functionality for visual regression, contract validation, and UI compliance checks.

### Phase 4: Build System and Performance Optimization

#### Task 4.1: Performance Monitoring Integration Depends on [2.1]

**READ THESE BEFORE TASK**
- `/scripts/performance-monitor.sh` - Current performance monitoring
- `/scripts/measure-performance-baseline.js` - Performance baseline establishment
- `/.github/workflows/quality-gates.yml` - Performance validation in CI

**Instructions**

Files to Create
- None

Files to modify
- `/scripts/performance-monitor.sh` - Add parameter support for different monitoring levels
- `/package.json` - Integrate performance commands with validation levels

Enhance performance monitoring with parameterized execution levels while maintaining 60-second timeout and structured markdown reporting that CI/CD workflows parse.

#### Task 4.2: Bundle Analysis and Build Optimization Depends on [none]

**READ THESE BEFORE TASK**
- `/vite.config.ts` - Build configuration with manual chunks
- `/package.json` - Build and analysis scripts
- `/scripts/run-quality-gates.sh` - Bundle size validation (3MB threshold)

**Instructions**

Files to Create
- `/scripts/build.sh` - Enhanced build script with analysis parameters

Files to modify
- `/package.json` - Consolidate build-related commands
- Preserve core `build` command for CI/CD compatibility

Create enhanced build script supporting analysis modes while maintaining core `build` command and 3MB bundle size threshold validation for quality gates.

### Phase 5: Documentation and Finalization

#### Task 5.1: Update Documentation and Workflow Compatibility Depends on [2.1, 3.1, 4.1]

**READ THESE BEFORE TASK**
- `/CLAUDE.md` - Current development commands documentation
- `/.github/workflows/` - All workflow files using npm scripts
- `/.docs/plans/build-pipeline-rationalization/` - All rationalization documentation

**Instructions**

Files to Create
- `/.docs/plans/build-pipeline-rationalization/migration-guide.md` - Migration guide for developers

Files to modify
- `/CLAUDE.md` - Update with new consolidated command patterns
- Documentation files with new script structure

Update all documentation to reflect new consolidated script structure. Create migration guide showing old vs new command patterns. Ensure backward compatibility guidance is clear.

#### Task 5.2: Validation and Cleanup Depends on [5.1]

**READ THESE BEFORE TASK**
- All files modified in previous tasks
- `/.github/workflows/` - Workflow validation requirements

**Instructions**

Files to Create
- `/scripts/validate-rationalization.sh` - Script to validate migration success

Files to modify
- `/package.json` - Remove redundant scripts after validation
- Clean up temporary files and unused scripts

Create validation script to ensure all functionality is preserved. Remove redundant scripts only after confirming CI/CD workflows continue working. Validate that quality gates, performance monitoring, and architecture validation maintain their critical functionality.

## Advice

- **Preserve CI/CD Compatibility**: Never remove scripts used by GitHub workflows until workflows are updated. The following scripts are critical: `type-check`, `lint`, `build`, `test:auth`, `test:mobile`, `test:crud`, `test:dashboard`, `format:check`
- **Maintain Exit Code Patterns**: Quality gates and validation scripts have specific exit codes (0 for pass/warning, 1 for failure) that CI/CD workflows depend on
- **Test Architecture Health Score**: The 80% architecture health score threshold is hardcoded in CI/CD workflows and must be preserved
- **Bundle Size Validation**: The 3MB bundle size limit is a hard requirement that will fail deployments if exceeded
- **Performance Timeout Handling**: Performance monitoring has 60-second timeout that must be maintained for CI/CD stability
- **Backward Compatibility First**: Implement all consolidations as new parameterized commands while keeping existing commands as aliases
- **Phased Removal Strategy**: Only remove redundant scripts after confirming new consolidated commands work in all environments
- **Quality Gates Cannot Break**: The 7-stage quality pipeline is production-critical and any changes must maintain exact functionality
- **Report Format Compatibility**: Performance reports and architecture health output have specific formats that CI/CD workflows parse
- **Parallel Implementation**: All phases can be worked on simultaneously since they maintain backward compatibility until final cleanup phase