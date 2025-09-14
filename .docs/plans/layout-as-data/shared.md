# Layout-as-Data Migration Architecture

The Layout-as-Data migration transforms the CRM's JSX-based layout system into a configuration-driven architecture where layouts are defined as data structures interpreted by a rendering engine. This migration builds upon the existing slot-based PageLayout system, 88% design token coverage, and comprehensive TypeScript infrastructure to create a flexible, maintainable, and scalable layout system while preserving current performance characteristics and developer experience.

## Relevant Files

### Core Layout System (Priority 1)
- `/src/components/layout/PageLayout.tsx`: Modern slot-based layout component with title, actions, filters, and content slots
- `/src/components/layout/PageLayout.types.ts`: TypeScript definitions for layout props and slot configurations
- `/src/hooks/usePageLayout.tsx`: Migration helper hook that auto-derives layout props from entity types
- `/src/components/layout/Container.tsx`: Responsive container wrapper with semantic spacing tokens
- `/src/components/layout/PageContainer.tsx`: Page-level container with max-width constraints

### Filter System Architecture (Priority 2)
- `/src/components/filters/FilterSidebar.tsx`: Advanced responsive filter system with desktop sidebar ↔ mobile sheet
- `/src/components/filters/FilterSidebar.types.ts`: Filter section definitions and configuration types
- `/src/hooks/useFilterSidebar.ts`: Filter sidebar state management with localStorage persistence
- `/src/hooks/useUniversalFilters.ts`: Universal filter system with debouncing and validation

### Data Layer Integration (Priority 2)
- `/src/hooks/useOrganizations.ts`: Example query pattern with 5-minute stale time and coordinated cache invalidation
- `/src/stores/contactAdvocacyStore.ts`: Zustand store pattern for client-side UI state with selective persistence
- `/src/hooks/useContactFormState.ts`: Form state management with React Hook Form and Zod validation
- `/src/lib/form-transforms.ts`: Comprehensive transform utilities for type-safe data handling

### Component Registry Foundation (Priority 3)
- `/src/components/ui/DataTable.tsx`: Unified table component with auto-virtualization at 500+ rows
- `/src/components/forms/SimpleForm.tsx`: Declarative form builder with configuration-driven fields
- `/src/components/forms/FormField.tsx`: Field composition pattern supporting dynamic rendering
- `/src/styles/tokens/index.ts`: Design token system with 88% semantic coverage

### Migration Targets (Priority 4)
- `/src/pages/Organizations.tsx`: Complex filter example with usePageLayout migration pattern
- `/src/pages/Contacts.tsx`: Simple layout example demonstrating slot-based composition
- `/src/pages/Products.tsx`: Product-specific patterns for registry migration
- `/src/pages/Opportunities.tsx`: Pipeline-specific layout with wizard integration

## Relevant Tables

### Core Business Entities
- **organizations**: Companies with hierarchical relationships and organization_type enum (customer, principal, distributor, etc.)
- **contacts**: Individuals with decision_authority levels and contact_role enum (decision_maker, influencer, buyer, etc.)
- **opportunities**: Sales pipeline with stage/status enums and multi-entity relationships
- **products**: Product catalog with product_category enum and principal_id relationships
- **interactions**: Communication history with interaction_type enum and temporal data

### Proposed Layout Storage
- **user_preferences**: JSONB storage for layout configurations with user_id, preference_key, scope, and entity_type fields
- **auth.users**: Supabase auth integration with existing RLS policies and session management

## Relevant Patterns

**Slot-Based Layout System**: Current PageLayout implements flexible slot composition (title, subtitle, actions, filters, content) with ReactNode support and automatic app shell integration, demonstrated in `/src/components/layout/PageLayout.tsx`

**Design Token Integration**: 88% semantic token coverage enables consistent styling through semanticSpacing, semanticColors, and semanticTypography tokens, avoiding hardcoded Tailwind classes in favor of schema-driven design

**Universal Filter Architecture**: FilterSidebar provides responsive desktop sidebar ↔ mobile sheet patterns with section-based organization and active filter badges, supporting complex filter compositions in `/src/components/filters/FilterSidebar.tsx`

**Data Flow Architecture**: Well-structured separation of concerns with TanStack Query (server state), Zustand stores (client state), React Hook Form (form state), and component state, enabling layout-driven data binding

**Component Factory Patterns**: Existing createAction and createMeta utilities demonstrate factory patterns ready for registry-based component resolution in `/src/hooks/usePageLayout.tsx`

**Auto-Virtualization**: DataTable component includes automatic performance optimization with 500-row threshold for virtualization, supporting dynamic component rendering at scale

**CVA Variant System**: Class Variance Authority integration with semantic design tokens enables dynamic styling based on layout configuration in `/src/components/ui/button-variants.ts`

**Form Configuration Pattern**: SimpleForm and useFormLayout demonstrate configuration-driven UI generation with section-based organization and conditional rendering in `/src/components/forms/SimpleForm.tsx`

**Query Key Factories**: Standardized caching patterns with normalized filter keys enable efficient cache management for layout-driven queries in entity hook files

**RLS Security Model**: Row Level Security policies with user-scoped access, organization-based permissions, and admin overrides provide secure foundation for layout preference storage

## Relevant Docs

**/.docs/plans/layout-as-data/current-layout-architecture.docs.md**: You _must_ read this when working on layout system migration, slot-based architecture, design token integration, and understanding existing PageLayout patterns.

**/.docs/plans/layout-as-data/data-binding-patterns.docs.md**: You _must_ read this when working on data integration, state management, query patterns, form state handling, and layout-driven data flow.

**/.docs/plans/layout-as-data/component-architecture.docs.md**: You _must_ read this when working on component registry design, variant systems, TypeScript integration, composition patterns, and performance optimization.

**/.docs/plans/layout-as-data/database-integration.docs.md**: You _must_ read this when working on layout storage, user preferences, security policies, JSONB schema design, and data layer integration.

**/CLAUDE.md**: You _must_ read this when working on project architecture, quality gates, testing requirements, performance thresholds, and understanding the overall CRM technical stack.