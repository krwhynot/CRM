# Design Token System Radical Simplification

The current design token system represents massive over-engineering with 3,176 lines of TypeScript + 1,476 lines of CSS creating significant technical debt with minimal actual usage. The system has only 6 CSS variable references across 4 components despite 4,652 total lines of token definitions, while most components use direct Tailwind classes. This plan eliminates 90% of the complexity while preserving essential MFB brand identity and accessibility requirements through strategic simplification that leverages Tailwind defaults for standard values and maintains custom tokens only for brand-critical elements.

## Relevant Files

- `/src/lib/design-tokens.ts`: 3,176-line TypeScript module with 17 export objects, only imported by 1 file (design-utils.ts)
- `/src/styles/tokens/primitives.css`: 390-line base layer with MFB brand colors, spacing, typography primitives
- `/src/styles/tokens/semantic.css`: 371-line semantic mappings for shadcn/ui integration (--primary, --success)
- `/src/styles/tokens/components.css`: 387-line component-specific tokens with minimal actual usage
- `/src/styles/tokens/features.css`: 328-line density/accessibility features with no evidence of usage
- `/src/index.css`: Main CSS entry point importing all 4 token layers
- `/vite.config.ts`: Complex build optimization pipeline with design token tree-shaking and critical CSS generation
- `/scripts/analyze-token-usage.js`: 18KB token analysis script for build optimization
- `/scripts/optimize-css-tokens.js`: 22KB tree-shaking optimization script
- `/scripts/optimize-design-tokens.js`: 15KB token optimization and validation
- `/tailwind.config.js`: Tailwind integration with custom MFB color families
- `/src/lib/utils/design-utils.ts`: Only TypeScript file importing design tokens
- `/components.json`: shadcn/ui configuration requiring CSS variables for theming

## Relevant Tables

No database tables are directly relevant to design token simplification.

## Relevant Patterns

**Token Over-Engineering Pattern**: 4,652 lines of token definitions with only 6 CSS variable usages across 4 components, demonstrating massive system complexity for minimal functional benefit, evidenced in `/src/lib/design-tokens.ts` with 17 export objects and `/src/styles/tokens/` 4-layer architecture.

**Minimal Usage Anti-Pattern**: Complex TypeScript token system with only 1 actual import point and components predominantly using direct Tailwind classes instead of CSS variables, shown by usage analysis across TSX component files.

**Build Complexity Anti-Pattern**: 7 specialized build scripts (160KB total) for optimizing a token system with minimal actual usage, including complex Vite plugins for tree-shaking CSS variables that provide minimal benefit, implemented in `/vite.config.ts` and `/scripts/` directory.

**Brand-Critical Token Pattern**: Essential MFB elements (5 brand colors × 47 variations, Nunito font, accessibility compliance) that must be preserved despite system simplification, documented in color definitions and WCAG AAA contrast ratios.

**Tailwind Default Alignment Pattern**: 95% of current custom tokens exactly match Tailwind defaults (spacing scale, font weights, border radius), indicating opportunity for massive simplification while maintaining functionality.

**Orphaned Token Anti-Pattern**: 231 unused tokens (34% of total) and 292 duplicate definitions across the system, creating maintenance burden and bundle size impact without functional value.

## Relevant Docs

**`.docs/plans/design-token-simplification/current-system-analysis.docs.md`**: You _must_ read this when understanding the scope of over-engineering, analyzing the 3,176-line TypeScript file structure, identifying minimal component usage patterns, and planning the elimination of unused complexity.

**`.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`**: You _must_ read this when determining which MFB brand elements must be preserved, understanding WCAG AAA accessibility requirements, identifying the 5-color brand palette with 47 variations, and differentiating between essential brand tokens and replaceable standard values.

**`.docs/plans/design-token-simplification/build-migration-analysis.docs.md`**: You _must_ read this when planning the migration timeline, understanding bundle size reduction opportunities (90% total reduction), analyzing build script elimination benefits (7 → 1 scripts), and implementing rollback strategies for the 4-week simplification process.