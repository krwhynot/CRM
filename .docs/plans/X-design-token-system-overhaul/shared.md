# Design Token System Overhaul - Shared Resources

The CRM project implements a sophisticated design token system with OKLCH color science, comprehensive validation, and shadcn/ui integration. The current 2-layer implementation (Primitives → Semantic) has diverged from the documented 4-layer architecture, creating critical issues including circular dependencies, missing fallbacks, and TypeScript mismatches. This overhaul will align all components around a consistent 2-layer architecture with OKLCH→HSL conversion pipeline and fail-fast validation.

## Relevant Files

### Core Design Token Infrastructure
- `/src/styles/tokens/primitives.css`: MFB brand colors in OKLCH format with 47 color variations and accessibility tokens
- `/src/styles/tokens/semantic.css`: shadcn/ui mappings and CRM-specific semantic tokens with circular dependency issues
- `/src/index.css`: Main CSS entry point with token imports and legacy chart color definitions
- `/src/lib/design-token-types.ts`: Comprehensive TypeScript definitions for 4-layer hierarchy (misaligned with 2-layer CSS)
- `/src/lib/design-token-utils.ts`: Color parsing utilities with incomplete OKLCH support and contrast validation
- `/tailwind.config.js`: Extensive token-to-Tailwind mapping with HSL format for shadcn/ui compatibility

### Theme System Components
- `/src/components/theme-provider.tsx`: Basic light/dark theme provider needing DOM class management enhancement
- `/src/hooks/use-theme.ts`: Simple theme context hook with localStorage persistence
- `/src/components/theme-toggle.tsx`: Theme toggle component with basic dark mode support

### Chart Color System
- `/src/components/dashboard/chart-colors.ts`: Well-organized chart colors using CSS variables with getCSSVar helper
- `/build/design-tokens.json`: W3C-compliant design token export with redundant chart definitions

### Component Migration Targets
- `/src/features/contacts/components/ContactsTable.tsx`: High-priority migration target with text-gray-400, bg-gray-50 hardcoded colors
- `/src/features/organizations/components/OrganizationsTable.tsx`: Multiple hardcoded color instances requiring semantic token migration
- `/src/components/ui/badge.tsx`: Mixed semantic token and hardcoded color usage patterns
- `/src/components/ui/table.tsx`: Deprecated component with extensive hardcoded gray colors

### Build & Validation Infrastructure
- `/scripts/validate-design-tokens.sh`: Sophisticated 960-line validation script with WCAG compliance and 165-point scoring
- `/tests/design-tokens/token-contract.test.ts`: Token API stability and contract validation
- `/tests/design-tokens/contrast-validation.test.ts`: WCAG contrast ratio validation with TypeScript utilities
- `/.github/workflows/design-tokens.yml`: CI/CD workflow with multi-job validation pipeline

## Relevant Tables

No database tables are directly relevant to this design token system overhaul. The system operates entirely through CSS custom properties, TypeScript definitions, and build processes.

## Relevant Patterns

**OKLCH→HSL Conversion Pipeline**: Primitives use OKLCH for color accuracy, automatically converted to HSL for shadcn/ui compatibility - see `/src/styles/tokens/primitives.css:22-98` for OKLCH definitions and lines 106-182 for HSL fallbacks.

**Semantic Token Mapping**: Two-layer hierarchy where semantic tokens reference primitives (`--primary: var(--mfb-green-hsl)`) - implemented in `/src/styles/tokens/semantic.css:21-327`.

**Component Variant Architecture**: Uses class-variance-authority with semantic tokens (`bg-primary text-primary-foreground`) - see `/src/components/ui/button-variants.ts` for proper patterns.

**Chart Color System**: Unified chart colors using getCSSVar helper function with CSS variable references - pattern documented in `/src/components/dashboard/chart-colors.ts:15-45`.

**Four-Tier TypeScript Hierarchy**: Comprehensive type definitions (Primitive → Semantic → Component → Feature) that exceed actual CSS implementation - defined in `/src/lib/design-token-types.ts:12-379`.

**Hardcoded Color Migration Pattern**: Standard migration from Tailwind hardcoded colors to semantic tokens (`text-gray-400 → text-muted-foreground`, `bg-gray-50 → bg-muted`) - examples throughout `/src/features/` components.

**Validation Scoring System**: 165-point automated scoring for design token governance with WCAG compliance checking - implemented in `/scripts/validate-design-tokens.sh:550-820`.

**Circular Dependency Detection**: Build-time validation to prevent self-referential CSS variables (`--space-card-padding: var(--space-card-padding)`) - critical issue found in `/src/styles/tokens/semantic.css:135-136`.

## Relevant Docs

**/.docs/plans/design-token-system-overhaul/requirements.md**: You _must_ read this when working on scope definition, architectural decisions, success criteria, and migration strategy.

**/.docs/plans/design-token-system-overhaul/token-files-analysis.docs.md**: You _must_ read this when working on CSS token structure, OKLCH/HSL conversion, TypeScript integration, and circular dependency resolution.

**/.docs/plans/design-token-system-overhaul/component-usage-analysis.docs.md**: You _must_ read this when working on component migration, hardcoded color replacement, chart color consolidation, and theme-aware component implementation.

**/.docs/plans/design-token-system-overhaul/build-validation-analysis.docs.md**: You _must_ read this when working on build process integration, validation script updates, test infrastructure, and CI/CD pipeline modifications.

**/src/styles/design-tokens.md**: You _must_ read this when working on documentation updates, as it contains outdated 3-tier system references that need alignment with 2-layer implementation.

**/scripts/validate-design-tokens.sh**: You _must_ read this when working on validation logic, WCAG compliance checking, and design token governance - contains sophisticated 960-line validation with 165-point scoring system.

**/CLAUDE.md**: You _must_ read this when working on development commands, architectural guidelines, component patterns, and quality gate validation processes.