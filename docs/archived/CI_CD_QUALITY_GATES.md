# CI/CD Quality Gates Documentation

## Overview

This document outlines the comprehensive quality gates system implemented for the KitchenPantry CRM project. These gates ensure code quality, architectural consistency, and performance standards are maintained throughout the development lifecycle.

## Quality Gate Categories

### 🔒 **Gate 1: TypeScript Compilation**
- **Purpose**: Ensures type safety and catches compilation errors
- **Command**: `npm run type-check`
- **Threshold**: Must pass without errors
- **CI Integration**: Runs on every PR and push

### 🧹 **Gate 2: Code Linting**
- **Purpose**: Enforces code style and catches potential issues
- **Command**: `npm run lint`
- **Threshold**: Maximum 20 warnings, 0 errors
- **Configuration**: ESLint with TypeScript rules

### 🏗️ **Gate 3: Component Architecture Health**
- **Purpose**: Validates component organization and architectural patterns
- **Command**: `npm run validate:architecture`
- **Threshold**: Architecture health score ≥ 80%
- **Validates**:
  - Component directory structure
  - Import patterns
  - Naming conventions
  - File size limits

### 📦 **Gate 4: Build & Bundle Analysis**
- **Purpose**: Ensures successful builds and monitors bundle size
- **Command**: `npm run build`
- **Thresholds**:
  - Build must complete successfully
  - Bundle size ≤ 3.0MB
  - Build time ≤ 60s
- **Outputs**: Bundle size breakdown report

### ⚡ **Gate 5: Performance Baseline**
- **Purpose**: Monitors application performance metrics
- **Command**: `npm run validate:performance`
- **Validates**:
  - Development server startup time
  - TypeScript compilation time
  - Bundle analysis
  - Database query performance (if available)

### 📱 **Gate 6: Mobile Optimization**
- **Purpose**: Ensures mobile-first approach is maintained
- **Validates**:
  - Mobile-specific CSS patterns
  - Responsive component usage
  - Mobile optimization score ≥ 50%

## Local Quality Gates

### Running All Quality Gates Locally

```bash
# Run comprehensive quality gates
npm run quality-gates

# Individual validations
npm run validate:architecture
npm run validate:performance
npm run validate  # TypeScript + lint + build
```

### Quality Gates Script Features

- **Comprehensive Reporting**: Generates detailed markdown reports
- **Color-coded Output**: Visual indicators for pass/fail status
- **Threshold Validation**: Automatic pass/fail based on predefined thresholds
- **Cleanup**: Automatic cleanup of temporary files
- **Exit Codes**: Proper exit codes for CI/CD integration

## GitHub Actions Integration

### Pull Request Quality Check

**Workflow**: `.github/workflows/pr-quality-check.yml`

- Triggered on: PR open, sync, reopen
- **Changed Files Analysis**: Smart detection of what needs validation
- **Conditional Checks**: Only runs relevant validations based on changes
- **Summary Reports**: Generates PR summary with results

### Quality Gates Workflow

**Workflow**: `.github/workflows/quality-gates.yml`

- Triggered on: Push to main/develop, PRs to main
- **Three Job Structure**:
  1. **quality-gates**: Core validations
  2. **performance-regression**: Performance impact analysis
  3. **mobile-optimization**: Mobile-specific checks

### Workflow Features

- **Timeout Controls**: Prevents hanging builds
- **Parallel Execution**: Jobs run in parallel when possible
- **Summary Reports**: GitHub-native step summaries
- **Artifact Generation**: Performance reports saved as artifacts

## Architecture Validation Rules

### Component Organization Rules

```typescript
const ARCHITECTURE_RULES = {
  componentOrganization: {
    sharedComponentsPath: 'src/components',
    featureComponentsPattern: /^src\/features\/[^\/]+\/components$/,
    allowedSharedComponents: [
      'ui', 'error-boundaries', 'forms', 'layout', 
      'CommandPalette', 'LoadingSpinner', 'ErrorBoundary'
    ],
    forbiddenInShared: [
      'Dashboard', 'Organization', 'Contact', 'Product', 
      'Opportunity', 'Interaction', 'Chart', 'Stats'
    ]
  }
}
```

### Import Rules

- **Cross-feature imports**: Discouraged
- **Deep relative imports**: Use `@/` alias instead of `../../../`
- **Index exports**: Required for feature components

### Naming Conventions

- **Components**: PascalCase.tsx (e.g., `MyComponent.tsx`)
- **Hooks**: useCamelCase.ts (e.g., `useMyHook.ts`)
- **Types**: camelCase.types.ts (e.g., `myTypes.types.ts`)
- **Tests**: PascalCase.test.ts (e.g., `MyComponent.test.ts`)

### File Size Limits

- **Components**: 15KB (~500 lines)
- **Hooks**: 10KB (~300 lines)
- **Utilities**: 8KB (~250 lines)
- **Types**: 5KB (~150 lines)

## Performance Thresholds

### Bundle Size Targets

| Metric | Current | Target | Action Threshold |
|--------|---------|--------|------------------|
| **Total Bundle** | 2.6MB | <3.0MB | Warning at 3MB, Error at 4MB |
| **JS Files** | 40 files | <50 files | Monitor growth |
| **Largest Asset** | 327KB | <500KB | Warning at 500KB |

### Performance Targets

| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| **Build Time** | <30s | >45s | >60s |
| **TypeScript Compilation** | <5s | >10s | >15s |
| **Dev Server Startup** | <10s | >20s | >30s |
| **Architecture Score** | >90% | <80% | <60% |

## Quality Reports

### Report Types

1. **Real-time Console Output**: Color-coded status during execution
2. **Markdown Reports**: Detailed analysis with recommendations
3. **GitHub Step Summaries**: Native GitHub UI integration
4. **Performance Reports**: Time-stamped performance baselines

### Report Locations

```
./quality-gates-report-YYYYMMDD_HHMMSS.md
./performance-reports/performance_report_YYYYMMDD_HHMMSS.md
$GITHUB_STEP_SUMMARY (in GitHub Actions)
```

## Failure Handling

### Local Development

- **Soft Failures**: Warnings don't block development
- **Hard Failures**: TypeScript errors, build failures block deployment
- **Guidance**: Each failure includes specific suggestions for resolution

### CI/CD Integration

- **Blocking**: Architecture score <60%, build failures, TypeScript errors
- **Non-blocking**: Bundle size warnings, mobile optimization suggestions
- **Retry Logic**: Automatic retry for transient failures

## Best Practices

### Development Workflow

1. **Pre-commit**: Run `npm run quality-gates` before committing
2. **Feature Development**: Use `npm run validate:architecture` frequently
3. **Performance Impact**: Monitor bundle size with `npm run analyze`
4. **Mobile Testing**: Validate responsive changes with mobile checks

### CI/CD Optimization

- **Caching**: Node modules cached between runs
- **Conditional Execution**: Skip unnecessary validations based on changed files
- **Parallel Jobs**: Independent validations run in parallel
- **Fast Feedback**: Critical validations run first

## Maintenance & Updates

### Monthly Reviews

- Review performance thresholds based on actual metrics
- Update architectural rules based on team feedback
- Analyze failure patterns and adjust thresholds

### Quarterly Assessments

- Comprehensive architecture health review
- Bundle size optimization opportunities
- CI/CD pipeline performance analysis

### Continuous Improvement

- Monitor GitHub Actions usage costs
- Optimize validation execution time
- Enhance reporting and developer experience

## Troubleshooting

### Common Issues

**Build Timeout**:
```bash
# Increase timeout in workflow
timeout-minutes: 20
```

**Architecture Score Too Low**:
```bash
# Run detailed analysis
npm run validate:architecture
# Follow specific suggestions in output
```

**Bundle Size Exceeded**:
```bash
# Analyze bundle composition
npm run analyze
# Identify large dependencies
```

### Getting Help

- Check quality gate reports for specific guidance
- Review architectural rules in `scripts/validate-architecture.js`
- Consult performance optimization strategy in `/docs/PERFORMANCE_OPTIMIZATION_STRATEGY.md`

---

**Last Updated**: August 2025  
**Maintained By**: CRM Development Team  
**Review Schedule**: Monthly