# Shared Component Architecture Plan

The CRM codebase requires strategic architectural decisions to consolidate shared components, standardize selection patterns, and migrate from deprecated table implementations. Current bulk actions are already generic but misplaced in organization features, selection hooks are inconsistent across entities, and all tables use deprecated DataTable implementations despite enhanced alternatives being available.

## Relevant Files

### Bulk Actions (Currently Misplaced)
- `/src/features/organizations/components/BulkActionsToolbar.tsx`: Generic bulk actions toolbar used by all entities but located in organizations feature
- `/src/features/organizations/components/BulkDeleteDialog.tsx`: Already generic delete dialog with DeletableEntity interface, used across all features
- `/src/components/data-table/data-table.tsx`: Enhanced DataTable with built-in selection support and TanStack Table integration
- `/src/components/data-table/toolbar.tsx`: DataTable toolbar with actions integration point for bulk operations

### Selection Hooks (Inconsistent Implementation)
- `/src/features/contacts/hooks/useContactsSelection.ts`: Multi-selection hook for bulk operations (Set<string> pattern)
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts`: Multi-selection hook for bulk operations (Set<string> pattern)
- `/src/features/contacts/hooks/useContactsPageState.ts`: Single-item selection for CRUD operations (object-based)
- `/src/features/organizations/hooks/useOrganizationsPageState.ts`: Single-item selection for CRUD operations (object-based)
- `/src/features/products/hooks/useProductsPageState.ts`: Single-item selection for CRUD operations (object-based)
- `/src/features/interactions/hooks/useInteractionsPageState.ts`: Single-item selection for CRUD operations (object-based)
- `/src/hooks/useEntitySelectState.ts`: Generic entity selection for dropdowns/pickers

### Table Components (Migration Required)
- `/src/components/ui/DataTable.tsx`: **@deprecated** legacy DataTable implementation used by all entity tables
- `/src/features/contacts/components/ContactsTable.tsx`: Contact listing using deprecated DataTable
- `/src/features/organizations/components/OrganizationsTable.tsx`: Organization listing using deprecated DataTable
- `/src/features/opportunities/components/OpportunitiesTable.tsx`: Opportunity listing using deprecated DataTable
- `/src/features/interactions/components/InteractionsTable.tsx`: Interaction history using deprecated DataTable
- `/src/features/products/components/ProductsTable.tsx`: Product catalog using deprecated DataTable

### Generated Forms (Cleanup Candidates)
- `/src/components/forms/ContactForm.generated.tsx`: Auto-generated contact form (548 lines) - purpose unclear
- `/src/components/forms/OrganizationForm.generated.tsx`: Auto-generated organization form - purpose unclear
- `/src/components/forms/ProductForm.generated.tsx`: Auto-generated product form - purpose unclear
- `/src/components/forms/OpportunityForm.generated.tsx`: Auto-generated opportunity form - purpose unclear
- `/src/components/forms/InteractionForm.generated.tsx`: Auto-generated interaction form - purpose unclear

### Architecture Validation
- `/.eslintrc.cjs`: Main ESLint configuration with import restriction rules that need updating
- `/.eslintrc.component-organization.js`: Separate component organization rules needing integration
- `/tests/architecture/component-placement.test.ts`: Component placement validation tests requiring updates
- `/scripts/run-quality-gates.sh`: 6-stage quality validation pipeline requiring 80% architecture health score
- `/scripts/analyze-component-usage.js`: Component usage analytics and health scoring system

## Relevant Tables

No database tables are directly relevant to this architectural refactoring, as this focuses on frontend component organization and patterns.

## Relevant Patterns

**Generic Component Design**: BulkDeleteDialog already implements DeletableEntity interface with configurable entity types but is located in organization features, example in `/src/features/organizations/components/BulkDeleteDialog.tsx`

**Cross-Feature Import Anti-Pattern**: All entity features import bulk components from organizations feature despite being generic, violating feature boundary principles

**Set-Based Multi-Selection**: Contacts and opportunities use `Set<string>` pattern for multi-selection state management with consistent interface, example in `/src/features/contacts/hooks/useContactsSelection.ts`

**Deprecated Component Usage**: All entity tables use deprecated DataTable implementation despite enhanced version being available with TanStack Table integration

**Import Restriction Rules**: ESLint patterns block cross-feature component imports via `no-restricted-imports` but need exceptions for strategically shared components

**ID-Based Selection Pattern**: contactAdvocacyStore uses ID-only selection to avoid stale data issues, pattern should be extended to page state hooks

**Quality Gates Health Scoring**: Architecture validation uses 80% health score requirement based on component placement accuracy and usage patterns

## Relevant Docs

**bulk-actions-patterns.docs.md**: Read this when working on bulk component migration, shared component organization, import path updates, or generic component design patterns.

**selection-hooks-analysis.docs.md**: Read this when working on selection hook standardization, creating generic useEntitySelection patterns, implementing missing selection hooks for organizations/products/interactions, or migrating to ID-based selection patterns.

**architecture-validation.docs.md**: Read this when working on ESLint rule updates, component placement validation changes, quality gates configuration, or architectural health scoring adjustments.

**table-components-analysis.docs.md**: Read this when working on DataTable migration from deprecated to enhanced version, table component consolidation, generated form cleanup, or entity table standardization.