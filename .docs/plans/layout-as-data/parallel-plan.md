# Layout-as-Data Migration Parallel Implementation Plan

Transform the CRM's JSX-based layout system into a configuration-driven architecture where layouts are defined as data structures interpreted by a rendering engine. This migration builds upon the existing slot-based PageLayout system, 88% design token coverage, and comprehensive TypeScript infrastructure to create a flexible, maintainable, and scalable layout system. The plan enables parallel development across core infrastructure, data layer, component registry, and page migrations while maintaining backward compatibility throughout the transition.

## Critically Relevant Files and Documentation

### Core Architecture Files
- `/src/components/layout/PageLayout.tsx` - Modern slot-based layout with automatic app shell integration
- `/src/hooks/usePageLayout.tsx` - Migration helper hook for auto-deriving layout props from entity types
- `/src/components/ui/DataTable.tsx` - Unified table component with auto-virtualization at 500+ rows
- `/src/components/filters/FilterSidebar.tsx` - Advanced responsive filter system with desktop/mobile patterns
- `/src/components/forms/SimpleForm.tsx` - Declarative form builder with configuration-driven fields

### Documentation and Research
- `/.docs/plans/layout-as-data/shared.md` - Comprehensive architecture overview and relevant patterns
- `/.docs/plans/layout-as-data/current-layout-architecture.docs.md` - Existing layout system analysis
- `/.docs/plans/layout-as-data/data-binding-patterns.docs.md` - Data flow and state management patterns
- `/.docs/plans/layout-as-data/component-architecture.docs.md` - Component organization and registry foundation
- `/.docs/plans/layout-as-data/database-integration.docs.md` - Storage and security model analysis
- `/CLAUDE.md` - Project architecture, quality gates, and performance thresholds

## Implementation Plan

### Phase 1: Core Infrastructure (Parallel Foundation)

#### Task 1.1: Layout Schema Type System **Depends on [none]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/shared.md`
- `/.docs/plans/layout-as-data/component-architecture.docs.md`
- `/src/types/index.ts`
- `/src/lib/database.types.ts`

**Instructions**

Files to Create:
- `/src/types/layout/schema.types.ts` - Core layout schema interfaces
- `/src/types/layout/registry.types.ts` - Component registry type definitions
- `/src/types/layout/configuration.types.ts` - Layout configuration interfaces
- `/src/types/layout/index.ts` - Barrel exports for layout types

Create comprehensive TypeScript definitions for layout schemas, component registry, and configuration structures. Include generic support for entity-specific layouts and full type inference for dynamic component resolution. Leverage existing `Database` and `Json` types for JSONB integration.

#### Task 1.2: Layout Validation Schema **Depends on [none]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/shared.md`
- `/src/lib/form-resolver.ts` - Existing Zod validation patterns
- `/src/types/validation.ts` - Current validation infrastructure

**Instructions**

Files to Create:
- `/src/lib/layout/validation.ts` - Zod schemas for layout validation
- `/src/lib/layout/schema-versioning.ts` - Schema version management

Create Zod validation schemas for layout configurations, component definitions, and slot specifications. Include schema versioning system for backward compatibility and migration support. Follow existing validation patterns from form infrastructure.

#### Task 1.3: Component Registry Infrastructure **Depends on [1.1]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/component-architecture.docs.md`
- `/src/hooks/usePageLayout.tsx` - Existing factory patterns
- `/src/components/ui/DataTable.tsx` - Component generics example

**Instructions**

Files to Create:
- `/src/lib/layout/component-registry.ts` - Core component registry
- `/src/lib/layout/registry-resolver.ts` - Dynamic component resolution
- `/src/lib/layout/component-factory.ts` - Component factory utilities

Build centralized component registry system that extends existing factory patterns. Include support for lazy loading, dynamic imports, and type-safe component resolution. Integrate with existing CVA variant system and design tokens.

#### Task 1.4: Layout Renderer Engine **Depends on [1.1, 1.2, 1.3]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/current-layout-architecture.docs.md`
- `/src/components/layout/PageLayout.tsx` - Slot-based architecture
- `/src/components/ui/DataTable.tsx` - Dynamic rendering patterns

**Instructions**

Files to Create:
- `/src/lib/layout/renderer.ts` - Core layout rendering engine
- `/src/lib/layout/slot-renderer.ts` - Slot-specific rendering logic
- `/src/lib/layout/responsive-renderer.ts` - Responsive behavior engine

Create layout rendering engine that interprets schema configurations into React components. Build upon existing slot system in PageLayout while adding dynamic component resolution. Include responsive rendering capabilities and performance optimizations.

### Phase 2: Data Layer Integration (Parallel with Phase 1)

#### Task 2.1: Database Schema for Layout Storage **Depends on [none]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/database-integration.docs.md`
- `/src/lib/database.types.ts` - Existing database patterns
- Database RLS policy examples from research documents

**Instructions**

Files to Create:
- `/database/migrations/add_user_preferences_table.sql` - Database migration
- `/database/policies/user_preferences_rls.sql` - Row Level Security policies

Tables to Create:
- **user_preferences** - JSONB storage for layout configurations

Create user preferences table with JSONB support for layout configurations using the **Supabase MCP tool** to access the database directly. Include RLS policies following existing security patterns. Support scoped preferences (global, page, entity) with proper indexing for performance. Use the MCP tool to execute migrations and verify schema creation.

#### Task 2.2: Layout Preference Service **Depends on [2.1]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/data-binding-patterns.docs.md`
- `/src/hooks/useOrganizations.ts` - Query pattern example
- `/src/stores/contactAdvocacyStore.ts` - Zustand store pattern

**Instructions**

Files to Create:
- `/src/services/layout-preferences.ts` - Layout preference service
- `/src/hooks/useLayoutPreferences.ts` - TanStack Query integration
- `/src/stores/layoutStore.ts` - Zustand store for layout state

Build service layer for layout preference management following existing TanStack Query patterns. Include proper cache invalidation, optimistic updates, and error handling. Create Zustand store for client-side layout state management. Use the **Supabase MCP tool** to test database interactions and validate JSONB query patterns.

#### Task 2.3: Data Binding System **Depends on [1.1, 2.2]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/data-binding-patterns.docs.md`
- `/src/lib/form-transforms.ts` - Data transformation utilities
- `/src/hooks/useUniversalFilters.ts` - Filter integration patterns

**Instructions**

Files to Create:
- `/src/lib/layout/data-binding.ts` - Layout-driven data binding utilities
- `/src/lib/layout/query-integration.ts` - Query pattern automation
- `/src/hooks/layout/useLayoutData.ts` - Hook for layout-driven data fetching

Create data binding system that connects layout configurations to data sources. Include automatic query generation, filter integration, and state synchronization. Leverage existing query key factories and cache management patterns.

### Phase 3: Enhanced PageLayout System (Depends on Phase 1)

#### Task 3.1: Registry-Enabled PageLayout **Depends on [1.4]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/current-layout-architecture.docs.md`
- `/src/components/layout/PageLayout.tsx` - Current slot implementation
- `/src/hooks/usePageLayout.tsx` - Migration helper patterns

**Instructions**

Files to Modify:
- `/src/components/layout/PageLayout.tsx` - Add registry support
- `/src/components/layout/PageLayout.types.ts` - Extend type definitions

Files to Create:
- `/src/components/layout/PageLayoutRenderer.tsx` - Schema-driven renderer
- `/src/components/layout/LayoutProvider.tsx` - Layout context provider

Extend existing PageLayout to support both traditional slots and schema-driven rendering. Maintain backward compatibility while adding registry-based component resolution. Include layout provider for context management.

#### Task 3.2: Enhanced Filter System **Depends on [1.4]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/current-layout-architecture.docs.md`
- `/src/components/filters/FilterSidebar.tsx` - Current filter system
- `/src/hooks/useFilterSidebar.ts` - Filter state management

**Instructions**

Files to Modify:
- `/src/components/filters/FilterSidebar.tsx` - Add schema support
- `/src/hooks/useFilterSidebar.ts` - Registry integration

Files to Create:
- `/src/components/filters/SchemaFilter.tsx` - Schema-driven filter component
- `/src/lib/layout/filter-generator.ts` - Dynamic filter generation

Extend FilterSidebar to support schema-driven filter generation while maintaining existing responsive patterns. Include automatic filter validation and state management integration.

#### Task 3.3: Enhanced Form System **Depends on [1.4]**

**READ THESE BEFORE TASK**
- `/src/components/forms/SimpleForm.tsx` - Declarative form patterns
- `/src/hooks/useFormLayout.ts` - Form layout configuration
- `/src/lib/form-transforms.ts` - Form data transformations

**Instructions**

Files to Modify:
- `/src/components/forms/SimpleForm.tsx` - Add registry support
- `/src/hooks/useFormLayout.ts` - Schema integration

Files to Create:
- `/src/components/forms/SchemaForm.tsx` - Full schema-driven form
- `/src/lib/layout/form-generator.ts` - Dynamic form generation

Enhance form system to support full schema-driven generation while maintaining existing validation and transformation patterns. Include progressive enhancement for complex form scenarios.

### Phase 4: Page Migration (Parallel Implementation)

#### Task 4.1: Products Page Migration **Depends on [3.1]**

**READ THESE BEFORE TASK**
- `/.docs/plans/layout-as-data/shared.md`
- `/src/pages/Products.tsx` - Target page for migration
- `/src/features/products/` - Product feature architecture

**Instructions**

Files to Create:
- `/src/pages/Products.schema.ts` - Layout configuration for products page
- `/src/layouts/products-list.layout.ts` - Reusable layout definition

Files to Modify:
- `/src/pages/Products.tsx` - Implement schema-driven rendering

Migrate Products page to use schema-driven layout as proof-of-concept. Start with simple list view and expand to include filters and actions. Document migration patterns for other pages.

#### Task 4.2: Contacts Page Migration **Depends on [3.1]**

**READ THESE BEFORE TASK**
- `/src/pages/Contacts.tsx` - Current implementation
- `/src/features/contacts/` - Contact feature architecture
- Task 4.1 outcomes for migration patterns

**Instructions**

Files to Create:
- `/src/pages/Contacts.schema.ts` - Layout configuration
- `/src/layouts/contacts-list.layout.ts` - Reusable layout definition

Files to Modify:
- `/src/pages/Contacts.tsx` - Schema implementation

Apply migration patterns from Products page to Contacts. Include expanded content and table integration as additional complexity layer.

#### Task 4.3: Organizations Page Migration **Depends on [3.2, 4.2]**

**READ THESE BEFORE TASK**
- `/src/pages/Organizations.tsx` - Complex filter example
- `/src/features/organizations/` - Organization feature architecture
- Previous migration task outcomes

**Instructions**

Files to Create:
- `/src/pages/Organizations.schema.ts` - Complex layout configuration
- `/src/layouts/organizations-list.layout.ts` - Advanced layout definition

Files to Modify:
- `/src/pages/Organizations.tsx` - Full schema implementation

Migrate Organizations page with advanced filter system and complex interactions. Test full schema-driven capabilities including dynamic filtering and responsive behavior.

### Phase 5: Advanced Features (Sequential after Phase 4)

#### Task 5.1: Layout Builder UI **Depends on [4.3]**

**READ THESE BEFORE TASK**
- All previous task outcomes
- `/src/components/ui/DataTable.tsx` - Component patterns
- `/src/styles/tokens/` - Design token system

**Instructions**

Files to Create:
- `/src/components/layout-builder/LayoutBuilder.tsx` - Drag-and-drop interface
- `/src/components/layout-builder/ComponentPalette.tsx` - Available components
- `/src/components/layout-builder/PreviewPane.tsx` - Live preview system

Build visual layout builder interface with drag-and-drop capabilities. Include component palette, property editors, and live preview. Integrate with design token system for consistent styling.

#### Task 5.2: Layout Templates and Sharing **Depends on [5.1]**

**READ THESE BEFORE TASK**
- Task 5.1 outcomes
- `/.docs/plans/layout-as-data/database-integration.docs.md`
- RLS policy patterns

**Instructions**

Files to Create:
- `/src/features/layout-templates/` - Template management system
- `/src/services/layout-sharing.ts` - Layout sharing service

Files to Modify:
- Database migration for shared templates

Implement layout template system with sharing capabilities. Include template gallery, versioning, and organization-level sharing with proper security controls.

#### Task 5.3: Migration Tooling **Depends on [4.3]**

**READ THESE BEFORE TASK**
- All page migration outcomes
- `/src/components/layout/PageLayout.tsx` - Current architecture

**Instructions**

Files to Create:
- `/scripts/layout-migration-tool.ts` - Automated JSX-to-schema converter
- `/scripts/validate-layout-schemas.ts` - Schema validation utility
- `/src/dev-tools/LayoutDebugger.tsx` - Development debugging tools

Build tooling for automated migration of remaining pages and validation of layout schemas. Include debugging tools for development experience.

## Advice

- **Maintain Backward Compatibility**: Every phase must preserve existing functionality. The migration should be transparent to users and not break existing features.

- **Leverage Existing Patterns**: The codebase has excellent foundations with slot-based architecture, design tokens, and data flow patterns. Build upon these rather than replacing them.

- **Performance is Critical**: The system currently auto-virtualizes at 500+ rows and has excellent performance. Ensure schema-driven rendering doesn't degrade performance - add benchmarking to each phase.

- **Security First**: All layout storage must follow existing RLS patterns. User preferences table should use the same security model as other user-scoped data. Never store executable code in configurations.

- **Type Safety Throughout**: The migration relies heavily on TypeScript generics and type inference. Ensure every schema-driven component maintains full type safety and IDE support.

- **Mobile-First Responsive**: FilterSidebar already demonstrates desktop ↔ mobile sheet patterns. All schema-driven layouts must preserve this responsive behavior.

- **Design Token Integration**: With 88% token coverage, schema-driven styling should prefer semantic tokens over hardcoded classes. Include token validation in schema system.

- **Error Boundaries**: Schema-driven rendering needs robust error handling. Invalid configurations should fail gracefully with fallback to basic layouts.

- **Development Experience**: Include comprehensive dev tools, schema validation, and migration utilities. Poor DX will lead to resistance to adoption.

- **Gradual Migration Path**: Phase 4 migration order (Products → Contacts → Organizations) provides increasing complexity. Use lessons learned to refine migration patterns.

- **Cache Strategy**: Layout preferences should integrate with existing TanStack Query cache management. Consider cache invalidation patterns when layouts change.

- **Bundle Size Impact**: Registry-based systems can increase bundle size. Use lazy loading and code splitting to maintain current performance characteristics.

- **Supabase MCP Tool Usage**: Use the Supabase MCP tool for all database access during development. This includes creating migrations, setting up RLS policies, testing JSONB queries, and validating schema changes. The MCP tool provides direct database access without needing separate database credentials or connection management.