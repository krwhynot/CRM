# Build Pipeline Rationalization - Migration Guide

This guide helps developers transition from the current 70+ npm scripts to the new consolidated script structure. The rationalization maintains all functionality while reducing complexity and improving developer experience.

## Overview

The build pipeline rationalization consolidates 70+ npm scripts into ~20-25 parameterized scripts while preserving all functionality, quality enforcement, and CI/CD integration. All changes maintain backward compatibility during the transition period.

## Key Principles

- **Backward Compatibility**: Existing scripts continue to work during transition
- **Parameterization**: Single scripts handle multiple related functions via parameters
- **Quality Preservation**: All quality gates, architecture validation, and performance monitoring remain intact
- **CI/CD Compatibility**: GitHub workflows continue using existing script names

## Migration Timeline

1. **Phase 1-4**: Implement consolidated scripts alongside existing ones
2. **Phase 5**: Update documentation and validate compatibility (Current)
3. **Phase 6**: Remove redundant scripts after validation

## Consolidated Command Structure

### Test Commands

#### Old Pattern (Multiple Scripts)
```bash
# Backend Testing - 8+ separate scripts
npm run test:backend
npm run test:backend:watch
npm run test:backend:coverage
npm run test:backend:database
npm run test:backend:performance
npm run test:backend:security
npm run test:backend:integrity
npm run test:backend:imports
```

#### New Pattern (Parameterized)
```bash
# Single unified test runner with parameters
npm run test -- backend                    # Basic backend tests
npm run test -- backend --mode watch       # Watch mode
npm run test -- backend --mode coverage    # With coverage
npm run test -- backend --focus database   # Database-specific
npm run test -- backend --focus performance # Performance tests
npm run test -- backend --focus security   # Security tests
npm run test -- backend --focus integrity  # Data integrity tests
npm run test -- backend --focus imports    # Import functionality tests

# Alternative syntax using new dedicated scripts
./scripts/test.sh backend
./scripts/test.sh backend --mode watch
./scripts/test.sh backend --focus database
```

#### MCP Test Commands
```bash
# Old (preserved for CI/CD compatibility)
npm run test:auth
npm run test:crud
npm run test:dashboard
npm run test:mobile

# New (additional options)
npm run test -- mcp --suite auth
npm run test -- mcp --suite crud,dashboard
npm run test -- mcp --suite mobile --verbose

# Script syntax
./scripts/test-mcp.sh auth
./scripts/test-mcp.sh crud,dashboard
./scripts/test-mcp.sh mobile --verbose
```

#### Architecture Testing
```bash
# Old Pattern
npm run test:architecture:state
npm run test:architecture:components
npm run test:architecture:performance
npm run test:architecture:eslint

# New Pattern
npm run test -- architecture --focus state
npm run test -- architecture --focus components
npm run test -- architecture --focus performance
npm run test -- architecture --focus eslint

# Script syntax
./scripts/test.sh architecture --focus state
./scripts/test.sh architecture --focus components,performance
```

### Quality & Validation Commands

#### Quality Gates
```bash
# Old Pattern
npm run quality-gates                    # Full 6-stage pipeline

# New Pattern (enhanced with levels)
npm run validate                         # Basic validation (type-check + lint + build)
npm run validate -- --level full        # Complete pipeline
npm run validate -- --level architecture # Architecture-focused
npm run validate -- --level performance # Performance-focused
npm run validate -- --level ui          # UI compliance focused

# Script syntax
./scripts/validate-enhanced.sh          # Basic
./scripts/validate-enhanced.sh --level full
./scripts/validate-enhanced.sh --level architecture
```

#### Architecture Validation
```bash
# Old Pattern
npm run validate:architecture
npm run validate:architecture:state
npm run validate:architecture:components
npm run validate:architecture:performance

# New Pattern
npm run architecture                     # Basic architecture validation
npm run architecture -- --focus state   # State boundary validation
npm run architecture -- --focus components # Component placement validation
npm run architecture -- --focus performance # Performance patterns

# Script syntax
./scripts/validate-architecture.js
./scripts/validate-architecture.js --focus state
./scripts/validate-architecture.js --focus components,performance
```

#### Performance Monitoring
```bash
# Old Pattern
npm run performance
npm run performance:basic
npm run performance:build
npm run performance:runtime
npm run performance:analysis
npm run performance:full

# New Pattern
npm run perf                            # Basic performance check
npm run perf -- --level basic          # Basic monitoring
npm run perf -- --level build          # Build-time analysis
npm run perf -- --level runtime        # Runtime performance
npm run perf -- --level analysis       # Detailed analysis
npm run perf -- --level full           # Comprehensive monitoring

# Script syntax
./scripts/performance-monitor.sh
./scripts/performance-monitor.sh --level basic
./scripts/performance-monitor.sh --level build,runtime
```

### Development Commands

#### Development Utilities
```bash
# Old Pattern
npm run dev:setup
npm run dev:health
npm run dev:fix
npm run clean
npm run clean:all
npm run fresh

# New Pattern
npm run dev -- setup                   # Development setup
npm run dev -- health                  # Health check
npm run dev -- fix                     # Auto-fix issues
npm run clean                          # Basic cleanup (preserved)
npm run clean -- --level all          # Full cleanup
npm run clean -- --level fresh        # Clean reinstall

# Script syntax
./scripts/dev-assist.sh setup
./scripts/dev-assist.sh health
./scripts/clean.sh
./scripts/clean.sh --level all
./scripts/clean.sh --level fresh
```

#### Technical Debt Management
```bash
# Old Pattern
npm run debt:audit
npm run debt:scan
npm run debt:report
npm run debt:validate
npm run debt:issues

# New Pattern
npm run debt -- audit                  # Technical debt analysis
npm run debt -- scan                   # Scan for debt patterns
npm run debt -- report                 # Generate debt report
npm run debt -- validate               # Validate debt tracking
npm run debt -- issues                 # Create GitHub issues

# Script syntax
./scripts/technical-debt-monitor.js audit
./scripts/technical-debt-monitor.js scan,report
```

### Build & Format Commands

#### Build Commands
```bash
# Old Pattern (preserved for CI/CD)
npm run build                          # Production build
npm run analyze                        # Bundle analysis

# New Pattern (enhanced)
npm run build                          # Standard build (preserved)
npm run build -- --analyze             # Build with analysis
npm run build -- --analyze --open     # Build, analyze, and open visualizer

# Script syntax
./scripts/build.sh                     # Standard build
./scripts/build.sh --analyze          # With bundle analysis
./scripts/build.sh --analyze --open   # With visualizer
```

#### Format Commands
```bash
# Old Pattern (preserved for CI/CD compatibility)
npm run format                         # Format code
npm run format:check                   # Check formatting

# New Pattern (enhanced)
npm run format                         # Format code (preserved)
npm run format -- --check             # Check formatting only
npm run format -- --staged            # Format staged files only

# Note: format:check preserved for GitHub workflows
```

## CI/CD Compatibility

### Critical Scripts (Never Remove)
These scripts are used by GitHub workflows and must be preserved:

```bash
# Core workflow dependencies
npm run type-check                     # TypeScript compilation
npm run lint                           # ESLint validation
npm run build                          # Production build
npm run format:check                   # Format validation (CI only)

# MCP test scripts (used by comprehensive-testing.yml)
npm run test:auth                      # Authentication tests
npm run test:crud                      # CRUD operation tests
npm run test:dashboard                 # Dashboard functionality tests
npm run test:mobile                    # Mobile/responsive tests

# Backend test scripts
npm run test:backend                   # Backend test suite
npm run test:security                  # Security validation

# Quality validation
npm run quality-gates                  # Quality gates pipeline
```

### Workflow Migration Strategy

1. **Phase 1-4**: Keep all existing scripts working
2. **Phase 5**: Document new patterns, validate compatibility
3. **Phase 6**: Update workflows to use new scripts, then remove old ones

### GitHub Workflow Files
- `/.github/workflows/quality-gates.yml` - Uses type-check, lint, build
- `/.github/workflows/comprehensive-testing.yml` - Uses format:check, test:*, quality validation
- `/.github/workflows/pr-quality-check.yml` - Uses validation pipeline

## Backward Compatibility Guarantees

### During Transition (Phases 1-5)
- All existing scripts continue to work
- New parameterized scripts work alongside old ones
- CI/CD workflows remain unaffected
- Quality thresholds preserved (80% architecture health, 3MB bundle size)
- Performance timeouts maintained (60s for monitoring)

### Script Aliases
Old scripts become aliases to new parameterized commands:

```bash
# Example: npm run test:backend becomes:
"test:backend": "./scripts/test.sh backend"

# Example: npm run validate:architecture becomes:
"validate:architecture": "./scripts/validate-architecture.js"

# Example: npm run debt:audit becomes:
"debt:audit": "./scripts/technical-debt-monitor.js audit"
```

## Migration Checklist for Developers

### Phase 5 (Current) - Documentation & Compatibility
- [ ] **Learn New Patterns**: Review consolidated command structure above
- [ ] **Test New Commands**: Try parameterized scripts in development
- [ ] **Validate Quality Gates**: Ensure new scripts maintain quality standards
- [ ] **Check Workflow Compatibility**: Verify CI/CD scripts still work

### Phase 6 (Future) - Script Cleanup
- [ ] **Update Scripts**: Migrate team to new parameterized commands
- [ ] **Validate Workflows**: Test GitHub Actions with new scripts
- [ ] **Remove Redundancy**: Clean up old script entries after validation

## Quality Assurance

### Architecture Health Validation
```bash
# Validate architecture health score remains above 80%
npm run architecture -- --validate
./scripts/validate-architecture.js --validate

# Check component organization
npm run architecture -- --focus components
```

### Performance Baseline Validation
```bash
# Ensure performance monitoring maintains 60s timeout
npm run perf -- --level basic
./scripts/performance-monitor.sh --level basic

# Validate bundle size under 3MB
npm run build -- --analyze
```

### Quality Gates Validation
```bash
# Run full quality pipeline
npm run validate -- --level full
./scripts/validate-enhanced.sh --level full

# Validate specific quality areas
npm run validate -- --level architecture
npm run validate -- --level performance
```

## Advanced Usage

### Combining Parameters
```bash
# Multiple test suites
npm run test -- mcp --suite auth,crud,dashboard

# Backend tests with multiple focuses
npm run test -- backend --focus database,security --mode coverage

# Architecture validation with multiple areas
npm run architecture -- --focus state,components,performance
```

### Development Workflow Integration
```bash
# Pre-commit validation (enhanced)
npm run validate                       # Basic validation
npm run validate -- --level full      # Comprehensive pre-commit

# Development setup with health check
npm run dev -- setup,health          # Combined operations

# Performance monitoring with multiple levels
npm run perf -- --level build,runtime,analysis
```

## Troubleshooting

### Common Issues

#### Script Not Found
```bash
# If you get "script not found" errors:
# 1. Ensure you're using the correct syntax
# 2. Check if the script file exists and is executable

# Make scripts executable if needed:
chmod +x ./scripts/test.sh
chmod +x ./scripts/validate-enhanced.sh
chmod +x ./scripts/build.sh
```

#### Parameter Parsing Issues
```bash
# Use -- to separate npm arguments from script arguments:
npm run test -- backend --mode coverage  # Correct
npm run test backend --mode coverage     # Incorrect
```

#### CI/CD Failures
```bash
# If workflows fail after migration:
# 1. Check that critical scripts are preserved
# 2. Validate exit codes match expected patterns
# 3. Ensure quality thresholds remain unchanged
```

### Getting Help

1. **Review Documentation**: Check updated CLAUDE.md for latest command patterns
2. **Test Locally**: Always test new scripts locally before pushing
3. **Validate Quality**: Run full quality gates before committing
4. **Check Workflows**: Ensure GitHub Actions continue passing

## Next Steps

1. **Familiarize**: Review and test new consolidated command patterns
2. **Validate**: Run quality gates and architecture validation with new scripts
3. **Feedback**: Report any issues or inconsistencies
4. **Prepare**: Get ready for Phase 6 script cleanup

The rationalization maintains all current functionality while dramatically reducing complexity. The new parameterized structure provides better discoverability, consistency, and maintainability while preserving the quality standards and CI/CD integration the project depends on.