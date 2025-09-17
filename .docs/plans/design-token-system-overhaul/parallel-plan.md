# Design Token System Overhaul - Parallel Implementation Plan

This plan outlines the complete replacement of the MFB (Master Food Brokers) brand color system with a fresh, modern OKLCH-based color system. The implementation follows a "big bang" approach where all 47 MFB color definitions are removed and replaced with a new brand identity, enhanced accessibility features, and comprehensive CRM-specific functionality.

## Critically Relevant Files and Documentation

### Core Token Files
- `/src/styles/tokens/primitives.css` - Contains 47 MFB brand colors (lines 20-226) to be completely replaced
- `/src/styles/tokens/semantic.css` - Semantic mappings with MFB references requiring complete overhaul
- `/tailwind.config.js` - MFB color object (lines 110-128) requiring removal and replacement
- `/src/lib/design-token-utils.ts` - OKLCH→HSL conversion utilities (1,193 lines) ready for build automation

### Component Migration Targets
- `/src/components/data-table/columns/organizations.tsx` - 11+ hardcoded color instances
- `/src/components/data-table/columns/contacts.tsx` - Contact status and priority colors
- `/src/components/data-table/columns/interactions.tsx` - Interaction type colors
- `/src/components/data-table/columns/opportunities.tsx` - Pipeline status colors
- `/src/components/data-table/columns/products.tsx` - Product category colors
- `/src/components/ui/button-variants.ts` - Button system using CVA with semantic tokens
- `/src/components/ui/badge.variants.ts` - Comprehensive badge system with priority/orgType variants

### Documentation
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Complete requirements and success criteria
- `/.docs/plans/design-token-system-overhaul/token-architecture-analysis.docs.md` - Current system analysis
- `/.docs/plans/design-token-system-overhaul/component-usage-patterns.docs.md` - Component migration priorities
- `/.docs/plans/design-token-system-overhaul/accessibility-crm-requirements.docs.md` - Accessibility gaps

## Critical Prerequisites

### BLOCKER: Component Token Compliance Must Be Fixed First

The validation research revealed that components extensively use hardcoded Tailwind colors instead of the existing semantic token system. This must be fixed before any token system migration can proceed, as updating tokens would have no effect on hardcoded colors.

#### Task 0.1: Fix Hardcoded Colors in Data Tables [Depends on: none]

**READ THESE BEFORE TASK**
- `/docs/internal-docs/component-design-token-dependency-analysis.docs.md` - Complete violation analysis
- `/src/components/data-table/columns/*.tsx` - All column files with hardcoded colors

**Instructions**

Files to Modify
- All files in `/src/components/data-table/columns/`

Replace all hardcoded Tailwind colors (e.g., `bg-red-100 text-red-800`) with proper semantic tokens that already exist in the system. This is a prerequisite blocker that must be completed before any token system changes.

## Implementation Plan

### Phase 1: Foundation Layer

#### Task 1.1: Create New Brand Primitives [Depends on: 0.1]

**READ THESE BEFORE TASK**
- `/src/styles/tokens/primitives.css` - Current MFB implementation to understand structure
- `/.docs/plans/design-token-system-overhaul/requirements.md` - New brand color specifications
- `/src/lib/design-token-utils.ts` - OKLCH color science utilities

**Instructions**

Files to Create
- `/src/styles/tokens/primitives-new.css` - New brand primitives without MFB colors

Files to Modify
- None at this stage (parallel-safe)

Implement new brand color primitives in OKLCH format with yellow-green primary (`oklch(0.747 0.1309 124.48)`). Include complete interaction states (base, hover, focus, active, disabled), grayscale scale, and accessibility-focused primitives. Structure should match existing file but with fresh brand colors replacing all MFB definitions.

#### Task 1.2: Implement HSL Fallback Generation [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/lib/design-token-utils.ts` - Existing OKLCH→HSL conversion functions
- `/vite.config.ts` - Current build configuration
- `/.docs/plans/design-token-system-overhaul/build-validation-infrastructure.docs.md` - Build automation requirements

**Instructions**

Files to Create
- `/scripts/generate-hsl-fallbacks.js` - Build-time HSL generation script
- `/src/lib/build-plugins/oklch-converter.js` - Vite plugin for automated conversion

Files to Modify
- `/vite.config.ts` - Add OKLCH conversion plugin

Create automated build-time HSL fallback generation from OKLCH primitives. Integrate existing conversion utilities into Vite build pipeline to eliminate manual HSL maintenance. Plugin should process primitives-new.css and generate HSL variables automatically.

#### Task 1.3: Add Missing Accessibility Primitives [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-system-overhaul/accessibility-crm-requirements.docs.md` - Critical gaps
- `/src/styles/tokens/primitives.css` - Current accessibility tokens (lines 299-345)

**Instructions**

Files to Modify
- `/src/styles/tokens/primitives-new.css` - Add accessibility primitives

Add critical missing primitives for colorblind support, high contrast mode, enhanced interactive states (disabled, loading, readonly, pressed), and expanded typography hierarchy. Include proper WCAG AAA contrast ratios (15:1+).

### Phase 2: Semantic Layer

#### Task 2.1: Create New Semantic Mappings [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/src/styles/tokens/semantic.css` - Current semantic structure
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Fresh CRM entity color mapping

**Instructions**

Files to Create
- `/src/styles/tokens/semantic-new.css` - New semantic mappings without MFB references

Files to Modify
- None at this stage (parallel-safe)

Create comprehensive semantic layer referencing new brand primitives. Map new colors to shadcn/ui semantic tokens, CRM entity states, priority systems, and organization types. Include missing organization type tokens (vendor, prospect, unknown).

#### Task 2.2: Implement CRM-Specific Semantic Tokens [Depends on: 2.1]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-system-overhaul/accessibility-crm-requirements.docs.md` - CRM requirements
- `/src/components/ui/badge.variants.ts` - Organization type usage patterns

**Instructions**

Files to Modify
- `/src/styles/tokens/semantic-new.css` - Add CRM-specific tokens

Add comprehensive CRM workflow states: data entry validation, bulk operations, import/export progress, sync operations. Implement fresh priority system (Critical→High→Medium→Low) and complete organization type tokens with proper contrast.

#### Task 2.3: Add Enhanced Focus System [Depends on: 2.1]

**READ THESE BEFORE TASK**
- `/src/styles/tokens/semantic.css` - Current focus system (lines 72-83)
- `/.docs/plans/design-token-system-overhaul/accessibility-crm-requirements.docs.md` - Focus requirements

**Instructions**

Files to Modify
- `/src/styles/tokens/semantic-new.css` - Enhanced focus tokens

Implement context-specific focus rings with proper WCAG compliance. Add focus variants for different interaction contexts (destructive, success, warning, info). Include keyboard navigation indicators and touch interface feedback.

### Phase 3: Component Migration

#### Task 3.1: Migrate Data Table Columns [Depends on: 2.1]

**READ THESE BEFORE TASK**
- `/src/components/data-table/columns/organizations.tsx` - 11 hardcoded instances
- `/src/components/data-table/columns/contacts.tsx` - Status colors
- `/.docs/plans/design-token-system-overhaul/component-usage-patterns.docs.md` - Migration patterns

**Instructions**

Files to Modify
- `/src/components/data-table/columns/organizations.tsx`
- `/src/components/data-table/columns/contacts.tsx`
- `/src/components/data-table/columns/interactions.tsx`
- `/src/components/data-table/columns/opportunities.tsx`
- `/src/components/data-table/columns/products.tsx`

Replace all hardcoded Tailwind colors (bg-green-100, text-green-800) with semantic tokens. Standardize status colors across entities. Update to use new semantic classes referencing fresh brand system.

#### Task 3.2: Update Button and Badge Variants [Depends on: 2.1]

**READ THESE BEFORE TASK**
- `/src/components/ui/button-variants.ts` - CVA implementation
- `/src/components/ui/badge.variants.ts` - Priority and orgType variants
- `/src/components/ui/priority-indicator.variants.ts` - Priority indicators

**Instructions**

Files to Modify
- `/src/components/ui/button-variants.ts`
- `/src/components/ui/badge.variants.ts`
- `/src/components/ui/priority-indicator.variants.ts`
- `/src/components/ui/status-indicator.variants.ts`

Update all variant systems to reference new semantic tokens. Fix priority inconsistency (organization-customer for medium). Add missing organization type variants. Ensure compound variants work with new colors.

#### Task 3.3: Update Chart Colors [Depends on: 2.1]

**READ THESE BEFORE TASK**
- `/src/components/dashboard/chart-colors.ts` - Exemplary implementation
- `/src/index.css` - Legacy chart definitions

**Instructions**

Files to Modify
- `/src/components/dashboard/chart-colors.ts`
- `/src/index.css`

Update chart colors to use new brand palette. Maintain getCSSVar helper pattern. Remove legacy chart color definitions. Ensure proper color distribution for data visualization.

### Phase 4: Build System Integration

#### Task 4.1: Update Tailwind Configuration [Depends on: 1.1, 2.1]

**READ THESE BEFORE TASK**
- `/tailwind.config.js` - Current MFB integration (lines 110-128)
- `/.docs/plans/design-token-system-overhaul/token-architecture-analysis.docs.md` - Tailwind requirements

**Instructions**

Files to Modify
- `/tailwind.config.js`

Remove entire 'mfb' color object. Add new brand color mappings. Update HSL variable references to new system. Ensure compatibility with shadcn/ui requirements.

#### Task 4.2: Implement CSS Tree-Shaking [Depends on: none]

**READ THESE BEFORE TASK**
- `/vite.config.ts` - Current optimization configuration
- `/.docs/plans/design-token-system-overhaul/build-validation-infrastructure.docs.md` - Tree-shaking requirements

**Instructions**

Files to Modify
- `/vite.config.ts`
- `/scripts/optimize-css-variables.js` (create)

Replace placeholder CSS tree-shaking with actual implementation. Create script to analyze CSS variable usage and eliminate unused tokens in production builds. Integrate with Vite's rollup configuration.

#### Task 4.3: Update Validation Scripts [Depends on: 1.1, 2.1]

**READ THESE BEFORE TASK**
- `/scripts/validate-design-tokens.sh` - 1,167-line validation script
- `/tests/design-tokens/contrast-validation.test.ts` - WCAG tests
- `/.docs/plans/design-token-system-overhaul/build-validation-infrastructure.docs.md` - Validation requirements

**Instructions**

Files to Modify
- `/scripts/validate-design-tokens.sh`
- `/tests/design-tokens/contrast-validation.test.ts`
- `/tests/design-tokens/token-contract.test.ts`

Update validation to check for zero MFB references. Add colorblind validation tests. Update WCAG calculations to proper algorithms. Optimize performance for CI/CD timeout issues.

### Phase 5: Final Integration

#### Task 5.1: Atomic Token Replacement [Depends on: all previous tasks]

**READ THESE BEFORE TASK**
- All new token files created in previous tasks
- `/CLAUDE.md` - Development commands and validation

**Instructions**

Files to Modify
- `/src/styles/tokens/primitives.css` - Replace with primitives-new.css content
- `/src/styles/tokens/semantic.css` - Replace with semantic-new.css content
- `/src/index.css` - Update imports if needed

Perform atomic replacement of old token files with new implementations. This is the "big bang" moment where the old MFB system is completely replaced. Ensure all imports and references are updated.

#### Task 5.2: Cleanup and Verification [Depends on: 5.1]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-system-overhaul/requirements.md` - Success criteria
- `/scripts/validate-design-tokens.sh` - Validation script

**Instructions**

Files to Delete
- `/src/styles/tokens/primitives-new.css` (after copying to primitives.css)
- `/src/styles/tokens/semantic-new.css` (after copying to semantic.css)

Files to Modify
- `/.github/workflows/design-tokens.yml` - Ensure CI/CD uses updated validation

Run comprehensive validation suite. Verify zero MFB references remain. Check WCAG AAA compliance. Ensure dark mode works correctly. Validate all component migrations.

## Advice

- **CRITICAL BLOCKER**: The validation research revealed that data table columns use 100+ hardcoded Tailwind colors instead of semantic tokens. Task 0.1 MUST be completed first or the entire token migration will fail. Components that hardcode colors won't respond to token changes.

- **Build Automation Gap**: The `processTokenFileForHslGeneration()` function in design-token-utils.ts exists but isn't integrated into the build. When implementing Task 1.2, you're connecting existing utilities rather than writing new ones.

- **Color Science Accuracy**: When implementing OKLCH colors, ensure L (lightness) is 0-1, C (chroma) is 0-0.4, and H (hue) is 0-360. The existing utilities in `/src/lib/design-token-utils.ts` handle proper clamping and conversion.

- **HSL Fallback Precision**: The automated HSL generation must maintain exact color matching. Use the `oklchToHsl()` function from design-token-utils.ts which implements proper color space mathematics.

- **Semantic Token References**: Always use CSS variable references (`var(--brand-primary)`) in semantic layer, never direct color values. This maintains the proper token hierarchy.

- **Dark Mode Considerations**: OKLCH colors need brightness increases (not simple inversion) for dark mode. Increase L value by ~0.05-0.1 while slightly reducing C for better visibility.

- **Component Migration Order**: Start with data table columns as they have the highest user impact and most hardcoded colors. This provides immediate visual validation of the new system.

- **Validation Critical Path**: The validation script must be updated early to catch any MFB references that slip through. Add `grep -r "--mfb-" src/` as a quick check. Note that the validation found 945 total `--mfb-` references and 242 `var(--mfb-)` usages across the codebase.

- **Build Performance**: The OKLCH→HSL conversion should cache results to avoid regenerating unchanged colors. Consider using file hashing to detect changes.

- **Testing Strategy**: Create visual regression tests for critical components before migration. The chart-colors.ts file provides a good reference pattern for other components.

- **Rollback Plan**: Keep the original token files backed up until full validation passes. The atomic replacement in Phase 5 allows for quick rollback if issues arise.

- **Browser Compatibility**: Always generate HSL fallbacks even though modern browsers support OKLCH. Some enterprise environments may use older browsers.