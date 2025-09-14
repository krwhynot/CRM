# Comprehensive Cleanup Plan
The CRM system requires strategic cleanup across four priority phases to achieve production excellence. Research shows 140 console statements, 23 TODO placeholders, 3.6MB bundle (20% over target), and 50+ TypeScript errors blocking quality gates. The architecture foundation is strong with 88% design token coverage, unified DataTable components, and comprehensive quality validation - cleanup focuses on removing development artifacts and optimizing for production.

## Relevant Files
- /src/contexts/AuthContext.tsx: 27 critical production console warnings requiring immediate environment gating
- /src/lib/monitoring.ts: 17 system health console statements creating production noise
- /src/services/*ApplicationService.ts: 14 TODO placeholders for missing CRUD implementations
- /src/features/*/hooks/use*Actions.ts: 8 UI action placeholders affecting user experience completeness
- /src/styles/tokens/colors.ts: Color system at 53% coverage with 362 hardcoded instances requiring migration
- /src/styles/tokens/shadows.ts: Shadow system at 34% coverage with 37 hardcoded instances needing tokens
- /src/components/style-guide/*: 328KB StyleGuide chunk loaded in production requiring dev-only separation
- /src/features/import-export/*: 256KB ImportExport module needing lazy loading optimization
- /src/features/*/components/*TableRefactored.tsx: Component naming artifacts from refactoring requiring cleanup
- /scripts/token-migration-codemod.js: Automated migration tool for hardcoded style conversion

## Relevant Tables
- organizations: Primary business entity with complete DataTable migration
- contacts: Contact management with unified table implementation
- opportunities: Sales pipeline with refactored table components
- products: Product catalog with virtualization support
- interactions: Communication history with timeline integration

## Relevant Patterns
**Unified DataTable Pattern**: All entity tables use single DataTable component with auto-virtualization at 500+ rows, TypeScript generics, and consistent BulkActionsProvider integration - see /src/components/ui/DataTable.tsx
**Design Token System**: Semantic tokens at 88% coverage with organized categories (spacing, typography, colors, shadows) for consistent styling - see /src/styles/tokens/
**Service Layer Architecture**: Application services with domain separation requiring CRUD implementation completion - see /src/services/ContactApplicationService.ts
**Quality Gates Validation**: 9-gate comprehensive validation including TypeScript, bundle size, token coverage, and architecture health - run via npm run quality-gates
**Console Statement Patterns**: Development debug statements requiring environment-gated logging infrastructure - see /src/utils/debug.ts for proper pattern

## Relevant Docs
**/.docs/plans/comprehensive-cleanup/console-todos-research.docs.md**: You _must_ read this when working on console statement cleanup, TODO resolution, and logging infrastructure implementation.
**/.docs/plans/comprehensive-cleanup/css-tokens-research.docs.md**: You _must_ read this when working on design token migration, CSS optimization, and hardcoded style conversion.
**/.docs/plans/comprehensive-cleanup/component-architecture-research.docs.md**: You _must_ read this when working on component naming cleanup, table migration validation, and architecture consistency.
**/.docs/plans/comprehensive-cleanup/testing-bundle-research.docs.md**: You _must_ read this when working on bundle optimization, TypeScript error fixes, dependency cleanup, and performance improvements.
**/CLAUDE.md**: You _must_ read this when working on any aspect of the cleanup plan for project architecture, quality standards, and validation commands.