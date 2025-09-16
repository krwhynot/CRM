# Design Tokens Architecture - Strict Token Hierarchy Implementation Plan

The KitchenPantry CRM has sophisticated design system foundations with OKLCH color science and WCAG AAA compliance, but suffers from critical design system drift with 287 duplicate token definitions across 8 files. Multiple Sources of Truth exist where the same conceptual values are defined differently across files, creating maintenance challenges and inconsistencies. The implementation focuses on consolidating these duplicates into a strict four-tier design token hierarchy (Primitives → Semantic → Components → Features) with single source rules and clear ownership patterns.

## Critically Relevant Files and Documentation

**Core Architecture Files:**
- `/src/index.css` - Master primitives file with MFB colors, spacing, typography (SINGLE SOURCE)
- `/src/styles/component-tokens.css` - Component-specific tokens [NEEDS REFACTOR - remove primitives]
- `/src/styles/advanced-colors.css` - Advanced features [NEEDS REFACTOR - remove duplicates]
- `/src/styles/accessibility-tokens.css` - Accessibility enhancements [NEEDS CONSOLIDATION]
- `/src/styles/density.css` - Density system [REFERENCE SEMANTIC ONLY]
- `/tailwind.config.js` - Tailwind integration [UPDATE TO SEMANTIC REFERENCES]
- `/scripts/validate-design-tokens.sh` - Token validation [ENHANCE FOR HIERARCHY]

**Research Documentation:**
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` - 287 duplicate definitions analysis
- `.docs/plans/design-tokens-architecture/semantic-tokens-analysis.docs.md` - Current semantic implementation analysis
- `.docs/plans/design-tokens-architecture/plan-validation-analysis.docs.md` - Validation against codebase reality
- `.docs/plans/design-tokens-architecture/shared.md` - Strict token hierarchy requirements

## Implementation Plan

### Phase 1: Emergency Duplicate Consolidation

#### Task 1.1: Audit and Consolidate MFB Brand Colors [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/index.css` (lines 39-120 for MFB color definitions)
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` (MFB color conflicts)
- `/src/styles/advanced-colors.css` (conflicting MFB definitions)

**Instructions**

Files to Modify:
- `/src/index.css` - Consolidate all MFB primitive definitions here
- `/src/styles/advanced-colors.css` - Remove primitive MFB definitions, reference only

Consolidate the 47 variations of MFB Green and other brand colors into single OKLCH definitions with HSL fallbacks in `/src/index.css`. Remove all duplicate primitive definitions from other files. Ensure consistent WCAG AAA contrast ratios (15.8:1, 12.6:1, 7.5:1) are maintained across all variants.

#### Task 1.2: Create Semantic Token Layer [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/index.css` (lines 286-310 for current semantic mappings)
- `.docs/plans/design-tokens-architecture/semantic-tokens-analysis.docs.md`
- `/tailwind.config.js` (shadcn/ui color mappings)

**Instructions**

Files to Create:
- `/src/styles/semantic-tokens.css` - Dedicated semantic layer mappings

Files to Modify:
- `/src/index.css` - Extract semantic mappings to new file, import semantic-tokens.css

Extract existing semantic token mappings from `/src/index.css` to dedicated `/src/styles/semantic-tokens.css`. Create clear primitive → semantic mappings (--mfb-green → --color-primary). Establish single source for all semantic abstractions that components will reference.

#### Task 1.3: Consolidate Focus Ring Systems [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` (12 focus ring implementations)
- `/src/styles/accessibility.css` (focus management)
- `/src/lib/accessibility/focus-management.tsx`

**Instructions**

Files to Modify:
- `/src/styles/semantic-tokens.css` - Add unified focus tokens
- `/src/styles/accessibility.css` - Reference semantic focus tokens
- `/src/styles/component-tokens.css` - Remove duplicate focus definitions

Consolidate the 12 different focus ring implementations into unified focus tokens in semantic layer. Create focus-ring, focus-ring-offset, and focus-ring-width tokens that reference MFB brand colors. Remove all hardcoded focus implementations from component and advanced files.

### Phase 2: Strict Hierarchy Implementation

#### Task 2.1: Refactor Component Token Layer [Depends on: 1.2]

**READ THESE BEFORE TASK**
- `/src/styles/component-tokens.css`
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` (component duplicates)
- `/src/components/ui/` - Component implementations

**Instructions**

Files to Modify:
- `/src/styles/component-tokens.css` - Remove all primitive definitions, reference semantic only

Remove all primitive color definitions from component-tokens.css. Ensure all component tokens reference semantic layer only (--btn-primary-bg: var(--color-primary)). Establish clear component-specific tokens for consistent styling patterns without bypassing the semantic layer.

#### Task 2.2: Refactor Advanced Color System [Depends on: 1.1, 2.1]

**READ THESE BEFORE TASK**
- `/src/styles/advanced-colors.css`
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` (advanced color conflicts)

**Instructions**

Files to Modify:
- `/src/styles/advanced-colors.css` - Remove primitive definitions, create semantic variants

Refactor advanced-colors.css to create high contrast and colorblind-friendly variants of semantic tokens rather than defining new primitives. Create --color-primary-high-contrast that references MFB colors with enhanced contrast ratios. Remove all primitive MFB color redefinitions.

#### Task 2.3: Consolidate Spacing Systems [Depends on: 1.2]

**READ THESE BEFORE TASK**
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` (5 parallel spacing systems)
- `/src/styles/density.css` - Density spacing implementation
- `/src/index.css` - Base spacing tokens

**Instructions**

Files to Modify:
- `/src/styles/semantic-tokens.css` - Add unified spacing semantic tokens
- `/src/styles/density.css` - Reference semantic spacing only
- `/src/index.css` - Consolidate primitive spacing definitions

Merge the 5 parallel spacing systems into unified primitive spacing scale in index.css. Create semantic spacing mappings (--space-section, --space-component) in semantic-tokens.css. Update density system to reference semantic spacing tokens only.

### Phase 3: Architecture Boundary Enforcement

#### Task 3.1: Implement Hierarchy Validation [Depends on: 2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/scripts/validate-design-tokens.sh`
- `.docs/plans/design-tokens-architecture/plan-validation-analysis.docs.md`

**Instructions**

Files to Modify:
- `/scripts/validate-design-tokens.sh` - Add hierarchy boundary checks

Enhance existing validation script to detect and prevent hierarchy violations. Add checks for primitive definitions in non-primitive files, circular token references, and semantic layer bypassing. Create automated tests that catch design system drift before it occurs.

#### Task 3.2: Create Layer-Separated CSS Organization [Depends on: 3.1]

**READ THESE BEFORE TASK**
- `/src/index.css` (current import structure)
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md`

**Instructions**

Files to Create:
- `/src/styles/tokens/primitives.css` - Pure primitive definitions
- `/src/styles/tokens/semantic.css` - Semantic mappings only
- `/src/styles/tokens/components.css` - Component-specific tokens
- `/src/styles/tokens/features.css` - Feature-specific enhancements

Files to Modify:
- `/src/index.css` - Update imports to use new structure

Reorganize CSS into clear layer separation with dedicated directories. Move appropriate tokens to their designated layer files. Update import order to enforce hierarchy: primitives → semantic → components → features.

#### Task 3.3: Implement Visual Regression Testing [Depends on: 3.2]

**READ THESE BEFORE TASK**
- Existing test infrastructure
- `/src/components/ui/` - Component visual states

**Instructions**

Files to Create:
- `/tests/design-tokens/visual-regression.test.ts` - Visual regression suite
- `/tests/design-tokens/token-contract.test.ts` - Token API contract tests

Create comprehensive visual regression testing to catch unintended changes during token consolidation. Implement token contract tests that ensure semantic tokens maintain expected values across changes. Add automated screenshots of key component states.

### Phase 4: Performance and Documentation

#### Task 4.1: Optimize Token Performance [Depends on: 3.3]

**READ THESE BEFORE TASK**
- `/vite.config.ts` - Build configuration
- `.docs/plans/design-tokens-architecture/duplicate-definitions-audit.docs.md` (performance impact)

**Instructions**

Files to Create:
- `/scripts/optimize-css-tokens.js` - CSS variable tree-shaking
- `/scripts/analyze-token-usage.js` - Token usage analysis

Files to Modify:
- `/vite.config.ts` - Add token optimization plugins

Implement CSS variable tree-shaking to remove unused tokens in production builds. Add token usage analysis to identify orphaned tokens. Optimize critical token inlining for faster initial paint. Target 25% reduction in CSS bundle size through duplicate elimination.

#### Task 4.2: Create Design Token Documentation [Depends on: 4.1]

**READ THESE BEFORE TASK**
- Current token implementations across all layers
- `.docs/plans/design-tokens-architecture/semantic-tokens-analysis.docs.md`

**Instructions**

Files to Create:
- `/docs/DESIGN_TOKEN_HIERARCHY.md` - Complete token system documentation
- `/src/lib/design-token-types.ts` - TypeScript definitions for tokens

Document the complete four-tier hierarchy with usage guidelines, semantic meanings, and ownership patterns. Create TypeScript definitions for design tokens to improve developer experience. Include token lifecycle management and change procedures.

#### Task 4.3: Implement Token Governance [Depends on: 4.2]

**READ THESE BEFORE TASK**
- `/scripts/validate-design-tokens.sh` - Current validation
- Design token governance best practices

**Instructions**

Files to Create:
- `/scripts/token-changelog.js` - Automated change tracking
- `/.github/workflows/design-tokens.yml` - CI/CD token validation

Files to Modify:
- `/scripts/validate-design-tokens.sh` - Add governance checks

Create automated token change tracking and CI/CD validation. Implement governance rules that prevent new duplicate definitions and enforce hierarchy boundaries. Add automated token documentation generation and design tool export capabilities.

## Implementation Advice

**Critical Dependencies:**
- Task 1.1 (MFB Color Consolidation) must complete first - it unblocks 47 conflicting definitions
- Task 1.2 (Semantic Layer) creates the bridge between primitives and components
- Visual regression testing (3.3) is essential before production deployment

**Architecture Considerations:**
- The existing OKLCH color system is excellent - preserve while consolidating duplicates
- Current semantic mappings are sound - they just need proper organization
- Density system demonstrates perfect token usage patterns - use as reference implementation

**Performance Gotchas:**
- 287 duplicate tokens are causing 40% CSS bloat - prioritize consolidation
- OKLCH browser support requires HSL fallbacks - maintain existing pattern
- Complex reference chains can cause cascade performance issues

**Testing Requirements:**
- Visual regression testing is critical - token changes affect UI appearance
- Test across all three density modes (compact/comfortable/spacious)
- Validate WCAG AAA contrast ratios (15.8:1, 12.6:1, 7.5:1) are maintained

**Developer Experience:**
- Create TypeScript definitions for improved IntelliSense
- Document clear usage guidelines for each token layer
- Implement automated validation to prevent future drift

**Success Metrics:**
- Reduce duplicate tokens from 287 to <50
- Achieve 25% CSS bundle size reduction
- Eliminate all primitive bypassing in components
- Maintain 100% visual consistency during migration