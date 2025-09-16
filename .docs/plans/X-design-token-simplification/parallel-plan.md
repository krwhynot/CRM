# Design Token System Radical Simplification - Parallel Implementation Plan

The current design token system represents massive over-engineering with 4,652 lines of token definitions (3,176 TypeScript + 1,476 CSS) that creates significant technical debt with minimal actual usage. This plan strategically eliminates 90% of the complexity through parallel implementation focused on eliminating unused tokens, consolidating duplicate definitions, and leveraging Tailwind defaults while preserving essential MFB brand identity and accessibility requirements.

## Critically Relevant Files and Documentation

### Core System Files
- `/src/lib/design-tokens.ts` - 3,176-line TypeScript module (only 1 import usage)
- `/src/styles/tokens/primitives.css` - 390-line MFB brand colors and base tokens
- `/src/styles/tokens/semantic.css` - 371-line semantic mappings for shadcn/ui
- `/src/styles/tokens/components.css` - 387-line component tokens (minimal usage)
- `/src/styles/tokens/features.css` - 328-line density/accessibility tokens (unused)
- `/src/index.css` - Main CSS entry importing 4-layer token system
- `/vite.config.ts` - Complex build pipeline with token optimization
- `/src/lib/utils/design-utils.ts` - Only file importing design tokens

### Build System Files
- `/scripts/analyze-token-usage.js` - 18KB token analysis script
- `/scripts/optimize-css-tokens.js` - 22KB tree-shaking optimization
- `/scripts/optimize-design-tokens.js` - 15KB token optimization
- `/scripts/design-token-changelog.js` - 24KB change tracking
- `/scripts/export-design-tokens.js` - 23KB export utilities
- `/package.json` - Token-specific npm scripts (5 commands)

### Documentation Files
- `/.docs/plans/design-token-simplification/shared.md` - Master overview document
- `/.docs/plans/design-token-simplification/current-system-analysis.docs.md` - System analysis
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md` - MFB brand requirements
- `/.docs/plans/design-token-simplification/build-migration-analysis.docs.md` - Build system impact

## Implementation Plan

### Phase 1: Foundation Analysis & Preparation (Parallel Execution)

#### Task 1.1: Token Usage Audit and Mapping [Depends on: none]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/current-system-analysis.docs.md`
- `/src/lib/design-tokens.ts` (lines 1-100 for structure understanding)
- All component files using CSS variables

**Instructions**

Files to Create
- `/.docs/plans/design-token-simplification/token-usage-audit.md`
- `/scripts/simplified-token-analysis.js`

Files to Modify
- None (audit only)

Conduct comprehensive audit of actual token usage across codebase. Identify the 6 CSS variable references in 4 components, map TypeScript token imports (only 1 file), and create definitive list of 273 critical tokens that must be preserved vs 231 orphaned tokens safe to eliminate.

#### Task 1.2: MFB Brand Token Inventory [Depends on: none]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`
- `/src/styles/tokens/primitives.css` (lines 1-100 for MFB colors)
- `/tailwind.config.js` (MFB color integration)

**Instructions**

Files to Create
- `/.docs/plans/design-token-simplification/mfb-brand-preservation-map.md`

Files to Modify
- None (inventory only)

Create definitive inventory of 47 MFB brand color variations that must be preserved, including OKLCH/HSL dual format requirements, WCAG AAA contrast ratios (15.8:1, 12.6:1, 7.5:1), Nunito font family requirement, and brand-specific spacing tokens. Document which tokens can be replaced with Tailwind defaults vs brand-critical elements.

#### Task 1.3: Build System Complexity Assessment [Depends on: none]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/build-migration-analysis.docs.md`
- `/vite.config.ts` (design token optimization pipeline)
- All `/scripts/*token*.js` files

**Instructions**

Files to Create
- `/.docs/plans/design-token-simplification/build-simplification-roadmap.md`

Files to Modify
- None (assessment only)

Document the complex 7-script build system (160KB total), analyze Vite plugin complexity for token optimization, identify which build tools provide minimal value for 6 CSS variable usages, and create roadmap for reducing build scripts from 7 to 1 while maintaining essential functionality.

### Phase 2: TypeScript System Elimination (Low Risk - Parallel Execution)

#### Task 2.1: Design Token TypeScript Module Removal [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/src/lib/design-tokens.ts` (full file understanding)
- `/src/lib/utils/design-utils.ts` (only import point)
- `/.docs/plans/design-token-simplification/token-usage-audit.md`

**Instructions**

Files to Create
- `/src/lib/archived/design-tokens.ts.backup`

Files to Modify
- `/src/lib/utils/design-utils.ts` (remove design token imports)
- Delete `/src/lib/design-tokens.ts`

Remove the 3,176-line TypeScript design token module that has only 1 actual import usage. Update design-utils.ts to use CSS variables or Tailwind classes instead of TypeScript token imports. Archive original file for emergency rollback. This eliminates ~95KB from bundle with minimal risk.

#### Task 2.2: Build Script Elimination [Depends on: 1.3]

**READ THESE BEFORE TASK**
- All `/scripts/*token*.js` files
- `/package.json` (token-specific npm scripts)
- `/.docs/plans/design-token-simplification/build-simplification-roadmap.md`

**Instructions**

Files to Create
- `/scripts/archived/` (directory for backup)

Files to Modify
- `/package.json` (remove token-specific npm scripts)
- Move to `/scripts/archived/`: analyze-token-usage.js, optimize-css-tokens.js, optimize-design-tokens.js, design-token-changelog.js, export-design-tokens.js

Remove 5 build scripts (87% reduction) that provide complex optimization for minimal token usage. Keep only essential scripts for basic token validation. Update package.json to remove token-specific npm commands. This eliminates 160KB of build tooling complexity.

#### Task 2.3: Vite Configuration Simplification [Depends on: 2.2]

**READ THESE BEFORE TASK**
- `/vite.config.ts` (design token optimization plugin)
- `/.docs/plans/design-token-simplification/build-migration-analysis.docs.md`

**Instructions**

Files to Create
- None

Files to Modify
- `/vite.config.ts` (remove designTokenOptimization plugin and related complexity)

Remove the complex designTokenOptimization() plugin (lines 9-60), eliminate CSS variable tree-shaking, remove design-tokens manual chunk configuration, and simplify build pipeline. Retain standard Vite CSS processing and Tailwind compilation. This reduces build complexity while improving development performance.

### Phase 3: CSS Layer Consolidation (Medium Risk - Sequential within Phase)

#### Task 3.1: Orphaned Token Elimination [Depends on: 1.1, 1.2]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/token-usage-audit.md`
- `/src/styles/tokens/components.css` (component tokens analysis)
- `/src/styles/tokens/features.css` (density system analysis)

**Instructions**

Files to Create
- `/src/styles/tokens/archived/` (backup directory)

Files to Modify
- `/src/styles/tokens/components.css` (remove 231 orphaned tokens)
- `/src/styles/tokens/features.css` (remove unused density system)

Systematically remove 231 orphaned tokens (34% of total) identified in audit. Focus on eliminating 715-line density system (lines 789-1504 in original TypeScript) that has no evidence of usage, extensive component tokens with minimal usage, and advanced color utilities unused. Backup original files before modification.

#### Task 3.2: Duplicate Token Resolution [Depends on: 3.1]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/token-usage-audit.md`
- All CSS token files (duplicate pattern analysis)

**Instructions**

Files to Create
- `/.docs/plans/design-token-simplification/duplicate-token-resolution-log.md`

Files to Modify
- `/src/styles/tokens/primitives.css` (consolidate duplicates)
- `/src/styles/tokens/semantic.css` (remove redundant mappings)

Resolve 292 duplicate token definitions across the system. Consolidate color definitions (both OKLCH and HSL fallbacks), eliminate redundant brand color mappings, and merge parallel spacing systems. Document resolution decisions for each duplicate group to ensure consistency.

#### Task 3.3: Layer Architecture Simplification [Depends on: 3.2]

**READ THESE BEFORE TASK**
- `/src/index.css` (4-layer import structure)
- All CSS token files (layer dependency analysis)

**Instructions**

Files to Create
- None

Files to Modify
- `/src/index.css` (consolidate from 4 layers to 2 layers)
- Delete `/src/styles/tokens/components.css` (merge into semantic.css)
- Delete `/src/styles/tokens/features.css` (preserve essential tokens in primitives.css)

Simplify from complex 4-layer hierarchy (primitives → semantic → components → features) to streamlined 2-layer system (primitives → semantic). Merge essential component tokens into semantic.css, preserve critical accessibility tokens in primitives.css, and eliminate feature layer complexity.

### Phase 4: Brand-Critical Token Optimization (High Risk - Sequential Execution)

#### Task 4.1: MFB Color System Preservation [Depends on: 1.2, 3.3]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/mfb-brand-preservation-map.md`
- `/src/styles/tokens/primitives.css` (MFB color definitions)
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`

**Instructions**

Files to Create
- None

Files to Modify
- `/src/styles/tokens/primitives.css` (consolidate 47 MFB color variations)

Consolidate 47 MFB brand color variations while preserving WCAG AAA compliance. Maintain dual OKLCH/HSL format support for accessibility, preserve all interaction states (hover, focus, active), keep dark mode variants, and ensure Tailwind integration continues working. Critical brand elements that cannot be simplified.

#### Task 4.2: Typography System Consolidation [Depends on: 4.1]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`
- `/src/styles/tokens/primitives.css` (typography tokens)
- `/tailwind.config.js` (Nunito font configuration)

**Instructions**

Files to Create
- None

Files to Modify
- `/src/styles/tokens/primitives.css` (consolidate typography tokens)
- `/src/styles/tokens/semantic.css` (typography mappings)

Preserve Nunito font family requirement and 15px (0.9375rem) brand-specific body text size while replacing standard font sizes/weights with Tailwind defaults. Maintain MFB Olive color for headings and brand-specific typography hierarchy. Eliminate redundant typography tokens that match Tailwind defaults.

#### Task 4.3: Spacing and Component Token Optimization [Depends on: 4.2]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`
- Current spacing token usage in components

**Instructions**

Files to Create
- None

Files to Modify
- `/src/styles/tokens/primitives.css` (brand-specific spacing only)
- `/src/styles/tokens/semantic.css` (essential component mappings)

Replace standard spacing values that match Tailwind defaults (space-1 through space-20) with direct Tailwind classes. Preserve brand-specific spacing: --space-card-padding (24px), --space-dashboard-grid-gap (24px), --dialog-max-height (iPad-optimized), and --radius-card (12px) for professional appearance.

### Phase 5: Validation and Performance Optimization (Parallel Validation)

#### Task 5.1: Component Visual Regression Testing [Depends on: 4.3]

**READ THESE BEFORE TASK**
- All component files using CSS variables or design tokens
- `/.docs/plans/design-token-simplification/token-usage-audit.md`

**Instructions**

Files to Create
- `/tests/design-tokens/visual-regression-baseline.md`

Files to Modify
- None (testing only)

Test all components that use CSS variables (4 files identified) to ensure no visual regressions. Verify MFB brand colors render correctly, typography hierarchy maintains brand consistency, spacing remains professional, and all interaction states work properly. Document any issues for immediate resolution.

#### Task 5.2: Accessibility Compliance Verification [Depends on: 4.1]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`
- WCAG AAA compliance requirements

**Instructions**

Files to Create
- `/tests/design-tokens/accessibility-compliance-report.md`

Files to Modify
- None (verification only)

Validate all contrast ratios maintain WCAG AAA compliance (15.8:1, 12.6:1, 7.5:1), test focus ring visibility across all brand colors, verify screen reader compatibility with new token structure, and ensure colorblind-safe variants continue working. Critical for MFB brand accessibility requirements.

#### Task 5.3: Build Performance and Bundle Size Validation [Depends on: 2.3, 3.3]

**READ THESE BEFORE TASK**
- `/.docs/plans/design-token-simplification/build-migration-analysis.docs.md`
- Current bundle size baseline

**Instructions**

Files to Create
- `/.docs/plans/design-token-simplification/performance-validation-report.md`

Files to Modify
- None (validation only)

Measure build time improvements, validate 76% CSS size reduction (1,476 → 350 lines), confirm 90% total token system reduction (384KB → 40KB), test development hot reload performance, and verify no build errors with simplified configuration. Document performance gains achieved.

## Advice

### Critical Implementation Considerations

- **Token System Over-Engineering**: The current 4,652-line system has only 6 CSS variable usages across 4 components, making this simplification low-risk with massive complexity reduction benefits

- **MFB Brand Requirements Are Non-Negotiable**: 47 brand color variations with WCAG AAA compliance, Nunito font family, and brand-specific spacing must be preserved exactly to maintain visual identity and accessibility standards

- **Build System Provides Minimal Value**: 160KB of build scripts optimize a system with minimal usage - removing 87% of build complexity will improve development experience without functional impact

- **Phase 2 Can Run Completely in Parallel**: TypeScript module removal, build script elimination, and Vite simplification have no dependencies and minimal risk due to low actual usage

- **CSS Layer Consolidation Requires Sequential Execution Within Phase 3**: Dependencies between orphaned token removal, duplicate resolution, and layer simplification must be respected to avoid broken references

- **Emergency Rollback Strategy**: Maintain `design-tokens-complex` branch and archived copies in `/scripts/archived/` and `/src/lib/archived/` for immediate rollback if issues arise

- **Component Usage Pattern**: Most components already use direct Tailwind classes rather than CSS variables, making the migration path clear and low-impact

- **Bundle Size Impact**: Projected 90% reduction in token system size (384KB → 40KB) will significantly improve initial load performance and build times

- **Developer Experience**: Simplified 2-layer system will reduce cognitive overhead, eliminate decision paralysis, and make the design system more approachable for new developers

- **Validation Is Critical**: Given the brand importance, comprehensive visual regression testing and accessibility validation must be completed before considering the migration successful