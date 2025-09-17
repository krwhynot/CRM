# Design Token System Overhaul - Shared Resources

The CRM design token system requires a complete overhaul to remove all 47 MFB brand color definitions and implement a fresh, modern OKLCH-based color system with enhanced accessibility and CRM-specific functionality. This is a complete "clean slate" replacement that will modernize the visual identity while addressing critical gaps in colorblind accessibility, interactive states, and CRM workflow support. The new system will maintain the proven 2-layer architecture (Primitives → Semantic) while introducing comprehensive accessibility features and eliminating technical debt.

## Relevant Files

### Core Design Token Infrastructure
- `/src/styles/tokens/primitives.css`: MFB brand colors in OKLCH format (47 variations, lines 20-226) requiring complete removal and replacement with new brand system
- `/src/styles/tokens/semantic.css`: shadcn/ui mappings with circular dependencies and missing fallbacks requiring comprehensive overhaul
- `/src/index.css`: Main CSS entry point with 2-layer import structure and legacy chart color definitions
- `/tailwind.config.js`: Extensive HSL variable mappings for shadcn/ui compatibility requiring MFB color removal and new brand integration
- `/src/lib/design-token-types.ts`: Comprehensive TypeScript definitions suggesting 4-layer hierarchy but misaligned with 2-layer CSS implementation
- `/src/lib/design-token-utils.ts`: Advanced OKLCH→HSL conversion utilities (1,193 lines) with proper color science but not integrated into build process

### Theme System & Color Conversion
- `/src/components/theme-provider.tsx`: Enhanced theme provider with DOM class management requiring updates for new color system
- `/src/hooks/use-theme.ts`: Theme context hook with localStorage persistence
- `/src/components/theme-toggle.tsx`: Theme toggle component needing integration with new brand colors
- `/src/contexts/ThemeContext.tsx`: Theme context with light/dark/system modes requiring new semantic mappings

### Component Systems Requiring Fresh Implementation
- `/src/components/ui/button-variants.ts`: Button system using CVA with semantic tokens requiring fresh visual hierarchy with new brand colors
- `/src/components/ui/badge.variants.ts`: Comprehensive badge system with priority/orgType variants requiring new color mapping and missing organization tokens
- `/src/components/ui/priority-indicator.variants.ts`: Priority indicators requiring enhanced visual distinction with new color hierarchy
- `/src/components/ui/status-indicator.variants.ts`: Status indicators needing expanded states for CRM workflows
- `/src/components/data-table/columns/organizations.tsx`: High-priority migration target with 11+ hardcoded color instances (bg-red-100, text-green-800 patterns)
- `/src/components/data-table/columns/contacts.tsx`: Contact table with hardcoded status and priority colors requiring semantic token migration
- `/src/components/data-table/columns/interactions.tsx`: Interaction types with hardcoded colors needing entity-specific semantic mappings
- `/src/components/data-table/columns/opportunities.tsx`: Opportunity pipeline colors requiring fresh semantic mapping
- `/src/components/data-table/columns/products.tsx`: Product category colors needing systematic semantic token replacement

### Build & Validation Infrastructure
- `/scripts/validate-design-tokens.sh`: Sophisticated 1,167-line validation script with WCAG compliance checking requiring optimization for new token structure
- `/tests/design-tokens/token-contract.test.ts`: Token API stability validation requiring updates for new brand system
- `/tests/design-tokens/contrast-validation.test.ts`: WCAG contrast ratio validation with 453 test assertions
- `/.github/workflows/design-tokens.yml`: CI/CD workflow with progressive validation levels requiring updates for new build process
- `/vite.config.ts`: Vite configuration with design token chunking and CSS optimization requiring OKLCH pipeline integration

### Chart & Visual Systems
- `/src/components/dashboard/chart-colors.ts`: Well-organized chart colors using CSS variables with getCSSVar helper (exemplary implementation pattern)
- `/build/design-tokens.json`: W3C-compliant design token export requiring regeneration with new brand system

## Relevant Tables

No database tables are directly relevant to this design token system overhaul. The system operates entirely through CSS custom properties, TypeScript definitions, build processes, and component variant systems.

## Relevant Patterns

**OKLCH→HSL Conversion Pipeline**: Primitives use OKLCH for perceptual color accuracy with automated HSL fallback generation for shadcn/ui compatibility - current manual process needs build-time automation using existing utilities in `/src/lib/design-token-utils.ts:245-891`.

**2-Layer Token Hierarchy**: Proven architecture where semantic tokens reference primitives (`--primary: var(--brand-primary-hsl)`) - maintains simplicity while providing comprehensive coverage, documented in `/src/styles/tokens/semantic.css:21-327`.

**Component Variant Architecture**: Uses class-variance-authority with semantic tokens (`bg-primary text-primary-foreground`) - see `/src/components/ui/button-variants.ts` for proper CVA patterns that should be preserved during migration.

**Chart Color Integration Pattern**: Unified chart colors using getCSSVar helper function with CSS variable references - exemplary implementation in `/src/components/dashboard/chart-colors.ts:15-45` that demonstrates ideal migration target pattern.

**MFB Brand Removal Pattern**: Complete elimination of `--mfb-*` variable references (47 color definitions) requiring systematic replacement across 25+ component files - priority migration based on user impact assessment.

**Hardcoded Color Migration Pattern**: Standard migration from Tailwind hardcoded colors to semantic tokens (`bg-green-100 text-green-800 → bg-success-subtle text-success`) - documented across `/src/components/data-table/columns/` files.

**Enhanced Interactive States Pattern**: Comprehensive hover/focus/active/disabled/loading states for all components - critical gap requiring new semantic tokens for CRM workflow states and accessibility compliance.

**Accessibility Validation Pattern**: WCAG AAA compliance with 15:1+ contrast ratios using automated testing framework - pattern in `/tests/design-tokens/contrast-validation.test.ts:12-89` must be extended for new brand colors.

**Build-Time Validation Pattern**: 165-point automated scoring system for design token governance - implemented in `/scripts/validate-design-tokens.sh:550-820` requiring updates for new token structure.

## Relevant Docs

**/.docs/plans/design-token-system-overhaul/requirements.md**: You _must_ read this when working on scope definition, architectural decisions, success criteria, migration strategy, and understanding the complete MFB color removal and replacement requirements.

**/.docs/plans/design-token-system-overhaul/token-architecture-analysis.docs.md**: You _must_ read this when working on current system analysis, OKLCH→HSL conversion pipeline, 2-layer architecture preservation, circular dependency resolution, and TypeScript integration patterns.

**/.docs/plans/design-token-system-overhaul/component-usage-patterns.docs.md**: You _must_ read this when working on component migration priorities, hardcoded color replacement strategy, chart color consolidation, and understanding which components have exemplary vs problematic token usage.

**/.docs/plans/design-token-system-overhaul/build-validation-infrastructure.docs.md**: You _must_ read this when working on build process updates, OKLCH conversion automation, validation script optimization, CI/CD pipeline modifications, and TypeScript integration improvements.

**/.docs/plans/design-token-system-overhaul/accessibility-crm-requirements.docs.md**: You _must_ read this when working on accessibility compliance, colorblind support implementation, enhanced interactive states, CRM-specific token requirements, and understanding critical gaps in the current system.

**/src/styles/design-tokens.md**: You _must_ read this when working on documentation updates, as it contains current 2-layer system documentation requiring alignment with new brand system and enhanced accessibility features.

**/scripts/validate-design-tokens.sh**: You _must_ read this when working on validation logic updates, WCAG compliance checking enhancements, and design token governance - contains sophisticated validation requiring optimization for new token structure.

**/src/lib/design-token-utils.ts**: You _must_ read this when working on OKLCH conversion automation, color space mathematics, contrast validation utilities, and build process integration - contains advanced utilities ready for automation.

**/CLAUDE.md**: You _must_ read this when working on development commands, architectural guidelines, component patterns, quality gate validation processes, and understanding the overall project architecture and build system.