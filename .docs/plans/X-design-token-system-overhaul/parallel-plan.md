# Design Token System Overhaul - Parallel Implementation Plan

The CRM design token system requires a comprehensive breaking change overhaul to resolve 6 critical runtime failures and architectural inconsistencies. The current 2-layer implementation (Primitives → Semantic) has diverged from documented 4-layer architecture, creating circular dependencies, missing fallbacks, and TypeScript mismatches. This parallel plan coordinates simultaneous fixes across CSS architecture, component migration, build system integration, and validation infrastructure to deliver a clean, robust design token system with proper OKLCH→HSL conversion pipeline.

## Critically Relevant Files and Documentation

### Core Token Infrastructure
- `/src/styles/tokens/primitives.css` - MFB brand colors in OKLCH with 47 variations + spacing/typography
- `/src/styles/tokens/semantic.css` - shadcn/ui mappings with circular dependency issues at lines 135-136
- `/src/index.css` - Main entry point with token imports and legacy chart definitions
- `/src/lib/design-token-types.ts` - 4-layer TypeScript hierarchy misaligned with 2-layer CSS
- `/src/lib/design-token-utils.ts` - Incomplete OKLCH support and contrast validation (lines 153-164)
- `/tailwind.config.js` - Token-to-Tailwind mapping requiring HSL format consistency

### Component Migration Targets
- `/src/components/forms/FormField.enhanced.tsx` - Critical form components with hardcoded gray colors
- `/src/features/interactions/hooks/useInteractionIconMapping.tsx` - 56 lines of hardcoded color mappings
- `/src/components/dashboard/chart-colors.ts` - Well-structured chart system using getCSSVar helper
- `/src/components/ui/badge.tsx` - Mixed semantic token and hardcoded color patterns

### Build & Validation Infrastructure
- `/scripts/validate-design-tokens.sh` - 960-line validation with 165-point scoring system
- `/tests/design-tokens/token-contract.test.ts` - Token API stability requiring 4-layer alignment
- `/vite.config.ts` - Bundle optimization needing CSS variable tree-shaking enhancement
- `/.github/workflows/design-tokens.yml` - CI/CD pipeline requiring validation integration

### Critical Documentation
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Scope and success criteria
- `/.docs/plans/design-token-system-overhaul/token-files-analysis.docs.md` - CSS structure analysis
- `/.docs/plans/design-token-system-overhaul/component-usage-analysis.docs.md` - Migration patterns
- `/src/styles/design-tokens.md` - Outdated 3-tier documentation requiring alignment

## Implementation Plan

### Phase 1: Foundation Architecture

#### Task 1.1: Fix Circular Dependencies and Missing Fallbacks [none]

**READ THESE BEFORE TASK**
- `/src/styles/tokens/semantic.css` - Lines 135-136 contain circular dependencies
- `/src/layout/components/Header.tsx` - Line 19 uses var(--header-shadow) without fallback
- `/src/lib/toast-styles.ts` - Lines 10-23 use MFB brand variables without fallbacks
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Smart fallback strategy

**Instructions**

Files to Modify
- `/src/styles/tokens/semantic.css`
- `/src/layout/components/Header.tsx`
- `/src/lib/toast-styles.ts`
- `/src/index.css`

Fix 3 circular dependencies in semantic.css (lines 135-136, 143) by replacing self-referential variables with proper primitive references. Add hardcoded MFB brand fallbacks to 25+ CSS variables missing fallbacks across index.css, Header.tsx, and toast-styles.ts. Implement spacing fallbacks using standard rem units and typography fallbacks with system font stack.

#### Task 1.2: Implement OKLCH→HSL Conversion Pipeline [1.1]

**READ THESE BEFORE TASK**
- `/src/lib/design-token-utils.ts` - Lines 153-164 contain incomplete OKLCH conversion
- `/src/styles/tokens/primitives.css` - Lines 22-98 OKLCH definitions, 106-182 HSL fallbacks
- `/.docs/plans/design-token-system-overhaul/token-files-analysis.docs.md` - Conversion requirements

**Instructions**

Files to Modify
- `/src/lib/design-token-utils.ts`
- `/src/styles/tokens/primitives.css`

Replace simplified OKLCH parsing (lines 153-164) with proper OKLCH to RGB conversion utilities. Implement automated HSL generation from OKLCH values to eliminate manual maintenance of 94 color mappings. Add validation for OKLCH format consistency and proper fallback generation.

#### Task 1.3: Align TypeScript Definitions with CSS Implementation [1.1]

**READ THESE BEFORE TASK**
- `/src/lib/design-token-types.ts` - 4-layer interface definitions misaligned with 2-layer CSS
- `/tests/design-tokens/token-contract.test.ts` - Test expectations requiring alignment
- `/src/styles/tokens/archived/` - Component and feature layers archived

**Instructions**

Files to Modify
- `/src/lib/design-token-types.ts`
- `/tests/design-tokens/token-contract.test.ts`

Simplify TypeScript definitions to match 2-layer CSS implementation by removing Component and Feature layer references. Update token contract tests to expect only Primitive and Semantic tokens. Maintain utility functions while removing phantom token references that don't exist in CSS.

### Phase 2: Component Migration

#### Task 2.1: Migrate Critical Form Components [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/components/forms/FormField.enhanced.tsx` - Hardcoded gray color usage patterns
- `/src/components/forms/FormField.tsx` - text-gray-700, bg-gray-50 instances
- `/src/components/forms/FormInput.tsx` - border-gray-100 usage
- `/.docs/plans/design-token-system-overhaul/component-usage-analysis.docs.md` - Migration patterns

**Instructions**

Files to Modify
- `/src/components/forms/FormField.enhanced.tsx`
- `/src/components/forms/FormField.tsx`
- `/src/components/forms/FormInput.tsx`
- `/src/types/forms/contact-form.types.ts`

Replace hardcoded Tailwind gray colors with semantic tokens following pattern: text-gray-400 → text-muted-foreground, bg-gray-50 → bg-muted, border-gray-200 → border-border. Update form validation state colors to use semantic intent tokens (success, warning, destructive). Test form components in both light and dark themes.

#### Task 2.2: Convert Interaction Color Mappings [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/features/interactions/hooks/useInteractionIconMapping.tsx` - 56 lines of hardcoded colors
- `/src/styles/tokens/semantic.css` - Intent color mappings (lines 187-198)
- `/.docs/plans/design-token-system-overhaul/component-usage-analysis.docs.md` - Business logic patterns

**Instructions**

Files to Modify
- `/src/features/interactions/hooks/useInteractionIconMapping.tsx`
- `/src/styles/tokens/semantic.css`

Convert 9 interaction type color mappings from hardcoded Tailwind classes to semantic tokens. Add missing semantic tokens for interaction-specific colors (email → info, call → success, meeting → primary). Maintain business logic meaning while ensuring theme compatibility.

#### Task 2.3: Consolidate Chart Color System [2.1, 2.2]

**READ THESE BEFORE TASK**
- `/src/components/dashboard/chart-colors.ts` - Well-structured getCSSVar pattern
- `/src/index.css` - Lines 33-37, 42-46 contain duplicate chart definitions
- `/src/styles/tokens/semantic.css` - Lines 320-324 redundant chart variables
- `/src/components/dashboard/examples/CRMDashboardExample.tsx` - Lines 171-174 hardcoded hex colors

**Instructions**

Files to Modify
- `/src/components/dashboard/examples/CRMDashboardExample.tsx`
- `/src/index.css`
- `/src/styles/tokens/semantic.css`

Remove chart color redundancy across 3 files by consolidating all definitions in semantic.css. Update dashboard example to use chartColors object instead of hardcoded hex values. Maintain existing getCSSVar helper pattern while eliminating duplicate variables.

### Phase 3: Theme System Implementation

#### Task 3.1: Create Theme Provider with DOM Class Management [1.3]

**READ THESE BEFORE TASK**
- `/src/hooks/use-theme.ts` - Simple theme context hook pattern
- `/src/components/theme-toggle.tsx` - Basic dark mode toggle
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Theme provider specifications

**Instructions**

Files to Create
- `/src/components/theme-provider.tsx`
- `/src/contexts/ThemeContext.tsx`

Files to Modify
- `/src/hooks/use-theme.ts`
- `/src/components/theme-toggle.tsx`
- `/src/App.tsx`

Create React theme provider with DOM class management for light/dark/system themes. Implement localStorage persistence and system preference detection. Add DOM class application to document.documentElement for proper CSS variable cascade. Integrate with existing use-theme hook.

#### Task 3.2: Implement Density Mode System [3.1]

**READ THESE BEFORE TASK**
- `/src/lib/design-token-types.ts` - Lines 442-496 density utility functions
- `/src/styles/design-tokens.md` - Lines 337-384 density system documentation
- `/src/styles/tokens/archived/features.css.original` - Archived density implementations

**Instructions**

Files to Create
- `/src/components/density-provider.tsx`
- `/src/hooks/use-density.ts`

Files to Modify
- `/src/components/theme-provider.tsx`
- `/src/App.tsx`

Implement density mode provider for compact/comfortable/spacious modes. Add DOM class management for density-* CSS classes. Create density-aware component utilities and integrate with theme provider for unified design system control.

### Phase 4: Build System Integration

#### Task 4.1: Enhance Validation Scripts [1.1, 1.2, 1.3]

**READ THESE BEFORE TASK**
- `/scripts/validate-design-tokens.sh` - 960-line validation needing 2-layer alignment
- `/tests/design-tokens/hierarchy-validation.test.ts` - 4-layer hierarchy tests
- `/.docs/plans/design-token-system-overhaul/build-validation-analysis.docs.md` - Script requirements

**Instructions**

Files to Modify
- `/scripts/validate-design-tokens.sh`
- `/tests/design-tokens/hierarchy-validation.test.ts`
- `/tests/design-tokens/token-contract.test.ts`

Update validation script to check 2-layer hierarchy instead of 4-layer system. Enhance circular dependency detection to catch self-referential patterns. Modify test contracts to expect simplified token structure. Maintain 165-point scoring system while aligning with new architecture.

#### Task 4.2: Optimize Build Pipeline for CSS Variables [4.1]

**READ THESE BEFORE TASK**
- `/vite.config.ts` - Bundle optimization configuration
- `/scripts/build.sh` - Enhanced build script
- `/.docs/plans/design-token-system-overhaul/build-validation-analysis.docs.md` - Performance requirements

**Instructions**

Files to Modify
- `/vite.config.ts`
- `/scripts/build.sh`
- `/package.json`

Add CSS variable tree-shaking configuration to Vite build. Implement design token bundle analysis with bundle size monitoring. Create design-tokens chunk separation in manual chunks configuration. Add build-time validation for token usage.

#### Task 4.3: Update CI/CD Pipeline Integration [4.1, 4.2]

**READ THESE BEFORE TASK**
- `/.github/workflows/design-tokens.yml` - Multi-job validation pipeline
- `/scripts/run-quality-gates.sh` - 6-stage quality validation
- `/.docs/plans/design-token-system-overhaul/build-validation-analysis.docs.md` - CI/CD modifications

**Instructions**

Files to Modify
- `/.github/workflows/design-tokens.yml`
- `/scripts/run-quality-gates.sh`

Update CI/CD workflow to validate 2-layer token architecture. Add bundle impact analysis for design token changes. Implement progressive validation levels (basic/full/strict) with feature flag support. Maintain 10-minute timeout while optimizing validation performance.

### Phase 5: Documentation and Cleanup

#### Task 5.1: Update Design Token Documentation [3.1, 3.2]

**READ THESE BEFORE TASK**
- `/src/styles/design-tokens.md` - Lines 19-24 document non-existent 4-layer system
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Success criteria documentation
- `/CLAUDE.md` - Project guidelines requiring updates

**Instructions**

Files to Modify
- `/src/styles/design-tokens.md`
- `/CLAUDE.md`

Update documentation to reflect 2-layer architecture reality. Remove references to Component and Feature layers that are archived. Document new theme provider and density system capabilities. Align developer guidelines with simplified token architecture.

#### Task 5.2: Clean Up Hardcoded Color Usage [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/config/ui-styles.ts` - 25+ hardcoded hex color values
- `/src/components/dashboard/examples/CRMDashboardExample.tsx` - Development utilities
- `/.docs/plans/design-token-system-overhaul/component-usage-analysis.docs.md` - Cleanup patterns

**Instructions**

Files to Modify
- `/src/config/ui-styles.ts`
- `/src/components/dashboard/examples/CRMDashboardExample.tsx`
- `/src/lib/design-token-utils.ts`

Replace remaining hardcoded colors in development utilities with semantic tokens. Update example components to showcase proper design token usage patterns. Remove legacy color definitions and ensure 95% reduction in non-semantic color usage.

## Advice

- **Breaking Change Coordination**: All tasks must be completed in a single comprehensive update to avoid partial state issues. Test thoroughly in staging environment before production deployment.

- **Fallback Strategy Implementation**: When adding CSS variable fallbacks, use MFB brand colors for branding consistency (--mfb-green, --mfb-clay) and system defaults for spacing/typography to prevent white screen failures.

- **OKLCH Browser Support**: Implement proper OKLCH to RGB conversion utilities rather than simplified approximations. The current lightness-only conversion in design-token-utils.ts (lines 153-164) will cause color accuracy issues.

- **Component Token Decision**: The archived Component and Feature layers in `/src/styles/tokens/archived/` contain 16KB+ of definitions. Decide early whether to restore selective component tokens or fully commit to 2-layer simplification to avoid scope creep.

- **Validation Performance**: The 165-point scoring system in validate-design-tokens.sh can be slow in CI/CD. Consider parallel validation execution and early exit optimizations while maintaining comprehensive coverage.

- **Theme Provider Integration**: Integrate theme and density providers into a single design system provider to avoid multiple context renders and simplify component consumption patterns.

- **Chart System Preservation**: The existing chart color system at `/src/components/dashboard/chart-colors.ts` is well-architected and should be preserved as a reference implementation for other component color systems.

- **TypeScript Performance**: Removing 200+ phantom tokens from design-token-types.ts will improve TypeScript compilation performance. Focus on aligning types with actual CSS implementation rather than aspirational architecture.

- **Build Stability**: Use feature flags (`FEATURE_FLAGS.ENABLE_TOKEN_VALIDATION`) for incremental rollout of enhanced validation. Maintain backward compatibility during transition with `--skip-token-validation` escape hatch for emergency builds.

- **Color Semantic Mapping**: Business logic colors (interaction types, organization categories, priority levels) require careful semantic mapping to maintain meaning while achieving theme compatibility. Document business color relationships clearly.