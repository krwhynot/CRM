# Design Tokens Architecture - Strict Token Hierarchy Implementation

The KitchenPantry CRM has sophisticated design system foundations but suffers from design system drift - multiple layers added without proper consolidation. While featuring excellent OKLCH color science, WCAG AAA compliance, and advanced density management, the system has Multiple Sources of Truth where MFB brand colors are defined in 3+ different files, token duplication across index.css/component-tokens.css/advanced-colors.css, and unclear ownership making it hard to determine which file to update for changes. The solution is implementing a strict four-tier design token hierarchy with defined ownership and single source rules.

## Relevant Files

- `/src/index.css`: PRIMITIVES LAYER - All MFB brand colors, base spacing, typography, shadows, light/dark theme mappings (SINGLE SOURCE)
- `/src/styles/semantic-tokens.css`: SEMANTIC LAYER - Maps primitives to meanings (--color-primary: var(--mfb-green)) [NEW FILE NEEDED]
- `/src/styles/component-tokens.css`: COMPONENTS LAYER - Component-specific tokens only, no primitive definitions [REFACTOR NEEDED]
- `/src/styles/density.css`: FEATURE LAYER - Advanced density system referencing semantic tokens only
- `/src/styles/accessibility.css`: FEATURE LAYER - WCAG AAA compliance patterns referencing semantic tokens
- `/src/styles/advanced-colors.css`: FEATURE LAYER - High contrast/colorblind support referencing semantic tokens
- `/tailwind.config.js`: Tailwind integration with strict semantic token references only
- `/components.json`: shadcn/ui configuration with "new-york" style and CSS variables enabled
- `/src/components/theme-provider.tsx`: Complete theme context provider with dark/light/system mode support
- `/src/lib/design-tokens.ts`: TypeScript definitions for strict token hierarchy validation
- `/scripts/validate-design-tokens.sh`: Token hierarchy validation and contrast checking

## Relevant Tables

No database tables are directly relevant to design tokens implementation.

## Relevant Patterns

**Strict Token Hierarchy Pattern**: Four-tier architecture (Primitives → Semantic → Components → Features) where each layer only references tokens from layers below, preventing circular dependencies and ensuring clear ownership, implemented across `/src/index.css` (primitives) and `/src/styles/*.css` (upper layers).

**Single Source Rule Pattern**: No primitive values defined in multiple places - all MFB brand colors, base spacing, and core values live exclusively in `/src/index.css`, with all other files referencing through CSS custom properties, demonstrated throughout the token system.

**Semantic Abstraction Pattern**: Components reference semantic tokens (`var(--color-primary)`) rather than primitives (`var(--mfb-green)`), allowing brand color changes to flow automatically through the entire system, shown in component token references.

**Layer-Based CSS Organization**: CSS organized in `@layer` structure with strict layering rules where base defines primitives, components define mappings, and utilities provide overrides, implemented in `/src/index.css` and style files.

**Clear Ownership Pattern**: Each type of token has exactly one home - colors in primitives layer, semantic mappings in semantic layer, component-specific in component layer, eliminating confusion about where to make changes.

**CSS Custom Properties with OKLCH Science**: Advanced variable system using `hsl(var(--variable))` pattern with OKLCH color space for perceptual accuracy and HSL fallbacks for compatibility, maintaining scientific precision while ensuring broad support.

## Relevant Docs

**`.docs/plans/design-tokens-architecture/css-variables-research.md`**: You _must_ read this when working on the token hierarchy implementation, OKLCH color system, current design system analysis, and identifying duplicate color definitions across files.

**`.docs/plans/design-tokens-architecture/component-theming-research.md`**: You _must_ read this when working on MFB brand color consolidation, component token refactoring, semantic color mapping, and eliminating Multiple Sources of Truth.

**`.docs/plans/design-tokens-architecture/accessibility-research.md`**: You _must_ read this when working on contrast-validated color tokens, accessibility layer integration, WCAG AAA compliance validation, and inclusive design token patterns.

**`.docs/plans/design-tokens-architecture/parallel-plan.md`**: You _must_ read this when implementing the token hierarchy, understanding task dependencies, and following the phase-by-phase consolidation approach to eliminate design system drift.