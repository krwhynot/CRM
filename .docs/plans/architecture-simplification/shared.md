# Architecture Simplification Plan - Shared Documentation

The CRM codebase contains 158 component files across 29 directories (~500KB of component code) with significant over-engineering and duplication. This simplification plan reduces complexity to ~40 files across 5 directories (~150KB) by eliminating duplications, consolidating patterns, and removing unused infrastructure. The target architecture follows OpenStatus data table patterns with shadcn-form.com generated forms, cutting ~70% of code complexity while maintaining functionality.

**⚠️ CRITICAL**: This plan includes mandatory data integrity validation to ensure database field mappings are preserved during component migration. No component should be deleted until data integrity is verified for its replacement.

## Relevant Files

### Current Component Structure
- /src/components/ui/: 51 files of shadcn/ui primitives with large custom extensions (sidebar.tsx: 737 lines)
- /src/components/forms/: 24 files including SchemaForm (649 lines), CRMFormBuilder (640 lines), CRMFormFields (628 lines)
- /src/components/filters/: 18 files with SchemaFilter (478 lines) and multiple filtering approaches
- /src/components/layout-builder/: 3 files totaling 1,363 lines of unused visual builder infrastructure
- /src/components/tables/: Multiple table implementations including CRMTable (433 lines), OptimizedDataTable (384 lines)

### Target Structure Files
- /src/components/data-table/: OpenStatus pattern implementation with expansion support
- /src/components/forms/: SimpleForm.tsx only + generated forms from shadcn-form.com
- /src/components/layout/: Static page layouts only
- /src/components/app/: All remaining components in flat structure

### Core Infrastructure
- /src/lib/form-resolver.ts: Dual validation system (Yup/Zod) requiring migration
- /src/lib/form-transforms.ts: 418 lines of transform utilities for consolidation
- /src/lib/layout/: 14,862 lines of over-engineered layout system for removal
- /src/services/layout-preferences.ts: 455 lines of layout preferences for simplification

### Data Integrity Infrastructure
- /src/types/*.zod.ts: Zod schemas that must match database field mappings exactly
- /docs/validation/: Database field mappings and data flow documentation (to be created)
- /scripts/validate-schema-mappings.js: Automated validation script (to be created)
- /tests/integration/data-integrity-*.test.ts: Data integrity validation tests (to be created)

## Relevant Tables

### Core CRM Entities
- organizations: Primary business entities with contacts and opportunities
- contacts: Individual people within organizations
- opportunities: Sales deals and pipeline management
- products: Items being sold/distributed
- interactions: Communication history and touchpoints

### Layout Preference Tables
- user_preferences: JSONB storage for layout configurations (for potential removal)

## Relevant Patterns

**OpenStatus Data Table Pattern**: Single table implementation with integrated filtering sidebar, expandable rows, and toolbar actions - replaces 5 different table components (7,000 → 2,600 lines, 63% reduction)

**shadcn-form.com Generated Forms**: Replace complex form builders with generated forms from schema definitions, keeping only SimpleForm.tsx for basic needs

**Component Consolidation Pattern**: Merge overlapping implementations (4+ table systems, 3+ form approaches) into single patterns per concern

**Flat Component Structure**: Replace 29 nested directories with 5 organized folders to reduce cognitive overhead and simplify imports

**Layout-as-Components**: Replace sophisticated layout-builder system (19,300 lines, 95% reduction opportunity) with simple component composition

**Database Field Mapping Validation**: Mandatory validation pattern ensuring new components map to identical database fields as old components - prevents data corruption during migration

**Data Integrity Testing**: Comprehensive CRUD operation testing with new components against existing database schema - required before any component deletion

## Relevant Docs

**/.docs/plans/architecture-simplification/component-structure-analysis.md**: You _must_ read this when working on component organization, identifying duplications, and understanding current complexity patterns.

**/.docs/plans/architecture-simplification/table-implementations-analysis.md**: You _must_ read this when working on table consolidation, understanding data patterns, and implementing the OpenStatus approach.

**/.docs/plans/architecture-simplification/form-architecture-analysis.md**: You _must_ read this when working on form simplification, validation migration, and field component consolidation.

**/.docs/plans/architecture-simplification/layout-system-analysis.md**: You _must_ read this when working on layout system removal, understanding over-engineering patterns, and implementing simple alternatives.

**/.docs/plans/architecture-simplification/data-integrity-addendum.md**: You _must_ read this when working on any component migration, database field validation, or data integrity testing.

**/CLAUDE.md**: You _must_ read this when working on project conventions, understanding current architecture status, and following development patterns.

**OpenStatus References**:
- https://data-table.openstatus.dev/default: Live example of target table pattern
- https://github.com/openstatusHQ/data-table-filters/tree/main/src/components/data-table: Source implementation to adapt