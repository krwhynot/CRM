# Architecture Simplification - Parallel Implementation Plan

This plan reduces the CRM codebase from 158 component files across 29 directories (~500KB) to ~40 files across 5 directories (~150KB), cutting ~70% of code complexity. The approach consolidates multiple table implementations into the OpenStatus pattern, replaces complex form builders with shadcn-form.com generated forms, removes the over-engineered layout system (19,300 lines), and eliminates component duplications. Each phase can be executed in parallel by different developers with minimal interdependencies.

## Critically Relevant Files and Documentation

### Current Architecture Files
- /src/components/ui/DataTable.tsx: Current table implementation (250 lines) - foundation for consolidation
- /src/components/forms/SimpleForm.tsx: Clean form implementation (158 lines) - keep as primary pattern
- /src/components/tables/CRMTable.tsx: Feature-rich table (433 lines) - merge into DataTable
- /src/components/layout-builder/: Over-engineered system (1,363 lines) - remove entirely
- /src/lib/layout/: Layout infrastructure (14,862 lines) - massive removal opportunity

### OpenStatus Reference Implementation
- https://data-table.openstatus.dev/default: Live demo of target table pattern
- https://github.com/openstatusHQ/data-table-filters/tree/main/src/components/data-table: Source code to adapt

### Research Documentation
- /.docs/plans/architecture-simplification/component-structure-analysis.md: Component inventory and duplication analysis
- /.docs/plans/architecture-simplification/table-implementations-analysis.md: Table consolidation strategy (63% reduction)
- /.docs/plans/architecture-simplification/form-architecture-analysis.md: Form simplification patterns (40-50% reduction)
- /.docs/plans/architecture-simplification/layout-system-analysis.md: Layout system removal (95% reduction)
- /.docs/plans/architecture-simplification/data-integrity-addendum.md: **CRITICAL** - Data integrity validation requirements

## Implementation Plan

### Phase 1: Foundation Setup

#### Task 1.1: Create New Directory Structure Depends on [none]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/shared.md
- /.docs/plans/architecture-simplification/component-structure-analysis.md

**Instructions**

Files to Create
- /src/components/data-table/index.ts (export file)
- /src/components/app/index.ts (export file)
- /src/components/layout/index.ts (export file)

Files to modify
- None

Create the target directory structure: `data-table/`, `app/`, and `layout/` subdirectories under `/src/components/`. Ensure the `ui/` and `forms/` directories remain as they are the foundation for the new architecture.

#### Task 1.2: Copy OpenStatus Data Table Implementation Depends on [1.1]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/table-implementations-analysis.md
- https://github.com/openstatusHQ/data-table-filters/tree/main/src/components/data-table
- /src/components/ui/DataTable.tsx

**Instructions**

Files to Create
- /src/components/data-table/data-table.tsx (main table component)
- /src/components/data-table/columns.tsx (column helper utilities)
- /src/components/data-table/toolbar.tsx (filtering toolbar)
- /src/components/data-table/pagination.tsx (pagination component)

Files to modify
- None

Copy and adapt the OpenStatus data table implementation to match our existing design system (shadcn/ui styling, TypeScript patterns). Add expandable row support with 20-30 lines of enhancement code. Maintain compatibility with existing Column<T> interface from current DataTable.

#### Task 1.3: Generate New Forms from shadcn-form.com Depends on [none]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/form-architecture-analysis.md
- /src/types/contact.zod.ts
- /src/types/organization.zod.ts
- /src/types/opportunity.zod.ts

**Instructions**

Files to Create
- /src/components/forms/ContactForm.generated.tsx (from shadcn-form.com)
- /src/components/forms/OrganizationForm.generated.tsx (from shadcn-form.com)
- /src/components/forms/OpportunityForm.generated.tsx (from shadcn-form.com)
- /src/components/forms/ProductForm.generated.tsx (from shadcn-form.com)
- /src/components/forms/InteractionForm.generated.tsx (from shadcn-form.com)

Files to modify
- None

Use shadcn-form.com to generate clean form implementations based on existing Zod schemas. Replace complex CRMFormBuilder patterns with generated forms. Ensure forms use only Zod validation (not dual Yup/Zod system).

#### Task 1.4: Database Schema Documentation Depends on [none]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/data-integrity-addendum.md
- /src/types/contact.zod.ts
- /src/types/organization.zod.ts
- /src/types/opportunity.zod.ts
- /src/features/*/components/*Table.tsx (all existing tables)

**Instructions**

Files to Create
- /docs/validation/database-field-mappings.md (comprehensive field mapping documentation)
- /scripts/validate-schema-mappings.js (automated validation script)

Files to modify
- None

Document every database field used by current components: table column definitions to database fields, form field names and their database mappings, any data transformation logic in current components. Create baseline for validation after migration.

#### Task 1.5: Data Flow Analysis Depends on [1.4]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/data-integrity-addendum.md
- /docs/validation/database-field-mappings.md
- /src/lib/form-transforms.ts
- Current feature table and form components

**Instructions**

Files to Create
- /docs/validation/data-flow-analysis.md (data flow documentation)
- /tests/integration/data-integrity-baseline.test.ts (baseline tests)

Files to modify
- None

Analyze complete data flow: Database → table components → UI display, Form input → validation → database storage, any data transformations or formatting logic, required fields and validation rules.

### Phase 2: Core Component Consolidation

#### Task 2.1: Consolidate Table Implementations Depends on [1.1, 1.2, 1.4, 1.5]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/table-implementations-analysis.md
- /.docs/plans/architecture-simplification/data-integrity-addendum.md
- /docs/validation/database-field-mappings.md
- /src/components/tables/CRMTable.tsx
- /src/components/optimized/OptimizedDataTable.tsx
- /src/features/organizations/components/OrganizationsTable.tsx

**Instructions**

Files to Create
- /src/components/data-table/columns/organizations.tsx (organization column definitions)
- /src/components/data-table/columns/contacts.tsx (contact column definitions)
- /src/components/data-table/columns/opportunities.tsx (opportunity column definitions)
- /src/components/data-table/expansion/OrganizationExpansion.tsx (expandable content)

Files to modify
- /src/components/data-table/data-table.tsx (merge CRMTable features)
- /src/components/ui/DataTable.tsx (deprecated - add warning comments)

Merge CRMTable selection, sorting, and expansion features into the OpenStatus DataTable. Create standard column definitions for each CRM entity. **CRITICAL**: Verify all column definitions map to exact database field names using field mappings documentation. Test CRUD operations with new components before proceeding. Maintain performance optimizations from OptimizedDataTable. Add deprecation warnings to old table components.

#### Task 2.2: Consolidate Filter System Depends on [1.1, 2.1]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/table-implementations-analysis.md
- /src/components/filters/UniversalFilters.tsx
- /src/components/filters/SchemaFilter.tsx
- /src/features/organizations/components/OrganizationsFilters.tsx

**Instructions**

Files to Create
- /src/components/data-table/filters/EntityFilters.tsx (unified entity filtering)
- /src/components/data-table/filters/TimeRangeFilter.tsx (extracted from current)
- /src/components/data-table/filters/QuickFilters.tsx (preset filters)

Files to modify
- /src/components/data-table/toolbar.tsx (integrate filtering)
- /src/components/filters/UniversalFilters.tsx (deprecation warning)

Integrate filtering directly into the data table toolbar following OpenStatus pattern. Consolidate all feature-specific filters into configurable EntityFilters component. Remove standalone filter components in favor of integrated approach.

#### Task 2.3: Simplify Form Architecture Depends on [1.3]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/form-architecture-analysis.md
- /src/components/forms/SimpleForm.tsx
- /src/lib/form-resolver.ts
- /src/lib/form-transforms.ts

**Instructions**

Files to Create
- /src/components/forms/FormField.enhanced.tsx (consolidated field component)

Files to modify
- /src/lib/form-resolver.ts (remove Yup support, Zod only)
- /src/lib/form-transforms.ts (simplify to Zod transforms only)
- /src/components/forms/SimpleForm.tsx (enhance for all use cases)

Consolidate FormField, EnhancedFormField, and CRMFormFields into single component. Remove dual Yup/Zod validation system - use Zod only. Enhance SimpleForm to handle all current use cases, eliminating need for SchemaForm and CRMFormBuilder.

### Phase 3: Feature Migration

#### Task 3.1: Migrate Organizations Feature Depends on [2.1, 2.2]

**READ THESE BEFORE TASK**
- /src/features/organizations/components/OrganizationsTable.tsx
- /src/features/organizations/components/OrganizationsFilters.tsx
- /src/components/data-table/columns/organizations.tsx

**Instructions**

Files to Create
- None

Files to modify
- /src/features/organizations/components/OrganizationsList.tsx (use new DataTable)
- /src/pages/Organizations.tsx (update imports)

Replace OrganizationsTable (745 lines) with new DataTable + organization columns. Remove OrganizationsFilters in favor of integrated toolbar filtering. Update all imports and ensure feature parity with expandable content for organization details.

#### Task 3.2: Migrate Contacts Feature Depends on [2.1, 2.2]

**READ THESE BEFORE TASK**
- /src/features/contacts/components/ContactsTable.tsx
- /src/features/contacts/components/ContactsFilters.tsx
- /src/components/data-table/columns/contacts.tsx

**Instructions**

Files to Create
- None

Files to modify
- /src/features/contacts/components/ContactsList.tsx (use new DataTable)
- /src/pages/Contacts.tsx (update imports)

Replace ContactsTable (664 lines) with DataTable + contact columns. Migrate relationship data and interaction history to expandable content. Remove standalone filtering components.

#### Task 3.3: Migrate Opportunities Feature Depends on [2.1, 2.2]

**READ THESE BEFORE TASK**
- /src/features/opportunities/components/OpportunitiesTable.tsx
- /src/features/opportunities/components/OpportunitiesFilters.tsx
- /src/components/data-table/columns/opportunities.tsx

**Instructions**

Files to Create
- None

Files to modify
- /src/features/opportunities/components/OpportunitiesList.tsx (use new DataTable)
- /src/pages/Opportunities.tsx (update imports)

Replace OpportunitiesTable (570 lines) with DataTable + opportunity columns. Migrate pipeline stages and value tracking to expandable content. Ensure filtering works with opportunity-specific fields.

#### Task 3.4: Migrate Products Feature Depends on [2.1, 2.2]

**READ THESE BEFORE TASK**
- /src/features/products/components/ProductsTable.tsx
- /src/features/products/components/ProductsFilters.tsx
- /src/components/data-table/columns/products.tsx

**Instructions**

Files to Create
- None

Files to modify
- /src/features/products/components/ProductsList.tsx (use new DataTable)
- /src/pages/Products.tsx (update imports)

Replace ProductsTable (535 lines) with DataTable + product columns. Migrate catalog management and pricing data to expandable content. Remove product-specific filtering components.

### Phase 4: Layout System Removal

#### Task 4.1: Remove Layout Builder Infrastructure Depends on [none]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/layout-system-analysis.md
- /src/components/layout-builder/LayoutBuilder.tsx
- /src/components/layout-builder/ComponentPalette.tsx
- /src/components/layout-builder/PreviewPane.tsx

**Instructions**

Files to Create
- None

Files to modify
- None

Files to Delete
- /src/components/layout-builder/ (entire directory - 1,363 lines)
- /src/lib/layout/ (entire directory - 14,862 lines)
- /src/stores/layoutStore.ts (627 lines)
- /src/services/layout-preferences.ts (455 lines)
- /src/hooks/useLayoutPreferences.ts (488 lines)

Remove the entire over-engineered layout system that has minimal usage (57 imports across codebase). This represents the largest code reduction opportunity (~19,300 lines, 95% reduction).

#### Task 4.2: Create Simple Layout Components Depends on [4.1]

**READ THESE BEFORE TASK**
- /src/pages/Organizations.tsx
- /src/pages/Contacts.tsx
- /.docs/plans/architecture-simplification/layout-system-analysis.md

**Instructions**

Files to Create
- /src/components/layout/PageLayout.tsx (simple page container)
- /src/components/layout/PageHeader.tsx (page header component)
- /src/components/layout/ContentSection.tsx (content wrapper)

Files to modify
- None

Create simple, composable layout components to replace the complex layout system. Use standard React component composition instead of registry pattern. Keep components under 100 lines each and focused on single responsibilities.

#### Task 4.3: Update Page Components for Simple Layouts Depends on [4.2]

**READ THESE BEFORE TASK**
- /src/pages/Organizations.tsx
- /src/pages/Contacts.tsx
- /src/pages/Products.tsx
- /src/components/layout/PageLayout.tsx

**Instructions**

Files to Create
- None

Files to modify
- /src/pages/Organizations.tsx (use simple layout components)
- /src/pages/Contacts.tsx (use simple layout components)
- /src/pages/Products.tsx (use simple layout components)
- /src/pages/Opportunities.tsx (use simple layout components)
- /src/pages/Interactions.tsx (use simple layout components)

Replace complex layout configurations with simple component composition. Use PageLayout, PageHeader, and ContentSection components. Remove all layout-related imports and configurations.

### Phase 5: Cleanup and Consolidation

#### Task 5.1: Mass Component Deletion Depends on [3.1, 3.2, 3.3, 3.4]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/component-structure-analysis.md
- All migration tasks completed

**Instructions**

Files to Create
- None

Files to modify
- None

Files to Delete
- /src/components/tables/ (entire directory)
- /src/components/optimized/ (entire directory)
- /src/components/virtualization/ (entire directory)
- /src/components/filters/ (18 files - feature-specific filters)
- /src/components/accessibility/ (built into shadcn)
- /src/components/alerts/ (use ui/alert)
- /src/components/badges/ (use ui/badge)
- /src/components/bulk-actions/ (move to data-table toolbar)
- /src/components/command/ (use ui/command)
- /src/components/error-boundaries/ (move to app/)
- /src/components/integration/ (delete)
- /src/components/loading/ (use ui/skeleton)
- /src/components/modals/ (use ui/dialog)
- /src/components/progress/ (use ui/progress)
- /src/components/search/ (part of data-table)
- /src/components/sheets/ (use ui/sheet)
- /src/components/sidebar/ (move to layout/)
- /src/components/skeletons/ (use ui/skeleton)
- /src/components/style-guide/ (delete)
- /src/components/templates/ (delete)
- /src/components/toasts/ (use ui/toast)
- /src/components/tooltips/ (use ui/tooltip)

Remove all redundant component directories as outlined in the simplification plan. This represents the bulk deletion phase removing ~120 component files.

#### Task 5.2: Remove Complex Form Components Depends on [2.3]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/form-architecture-analysis.md
- /src/components/forms/SimpleForm.tsx (ensure enhanced)

**Instructions**

Files to Create
- None

Files to modify
- None

Files to Delete
- /src/components/forms/SchemaForm.tsx (649 lines)
- /src/components/forms/CRMFormBuilder.tsx (640 lines)
- /src/components/forms/CRMFormFields.tsx (628 lines)
- /src/components/forms/CRMFormSchemas.tsx (519 lines)
- /src/components/forms/BusinessForm.tsx (337 lines)
- /src/components/forms/EnhancedFormField.tsx
- /src/components/forms/FormProgressBar.tsx
- /src/components/forms/DebouncedInput.tsx

Remove all complex form components now that SimpleForm is enhanced to handle all use cases and generated forms replace custom builders. This eliminates ~3,000 lines of form complexity.

#### Task 5.3: Update All Imports and References Depends on [5.1, 5.2]

**READ THESE BEFORE TASK**
- All previous tasks completed
- /.docs/plans/architecture-simplification/shared.md

**Instructions**

Files to Create
- None

Files to modify
- All remaining feature files (update imports)
- All page components (update imports)
- All test files (update imports)

Files to Search/Replace
- `@/components/tables/` → `@/components/data-table/`
- `@/components/forms/CRM` → `@/components/forms/`
- `@/components/filters/` → `@/components/data-table/filters/`
- Remove all deleted imports

Systematically update all import statements across the codebase to point to new consolidated components. Remove references to deleted components. Ensure all imports use the new structure.

#### Task 5.4: Update Component Exports and Documentation Depends on [5.3]

**READ THESE BEFORE TASK**
- /src/components/data-table/index.ts
- /src/components/app/index.ts
- /src/components/layout/index.ts

**Instructions**

Files to Create
- None

Files to modify
- /src/components/data-table/index.ts (export all data table components)
- /src/components/app/index.ts (export remaining app components)
- /src/components/layout/index.ts (export layout components)
- /src/components/forms/index.ts (update form exports)
- /README.md (update component documentation)

Update all index.ts export files to reflect the new component structure. Update component documentation and examples to use new patterns. Ensure clean, discoverable exports for the simplified architecture.

#### Task 5.5: End-to-End Data Integrity Testing Depends on [5.3]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/data-integrity-addendum.md
- /docs/validation/database-field-mappings.md
- All migrated components

**Instructions**

Files to Create
- /tests/integration/comprehensive-data-integrity.test.ts

Files to modify
- None

Comprehensive validation: Test all CRUD operations across all entities, verify data transformations work correctly, test edge cases and validation scenarios, confirm no database fields are orphaned.

#### Task 5.6: Schema Compliance Verification Depends on [5.5]

**READ THESE BEFORE TASK**
- /.docs/plans/architecture-simplification/data-integrity-addendum.md
- /scripts/validate-schema-mappings.js
- All new components

**Instructions**

Files to Create
- /reports/schema-compliance-report.md

Files to modify
- None

Automated verification: Run schema validation script against all new components, verify Zod schemas match database constraints, test with production-like data volumes, generate compliance report for sign-off.

## Advice

- **🚨 CRITICAL - Data Integrity First**: Before any component deletion, verify database field mappings are documented and tested. No component should be removed until its replacement is validated against the baseline
- **Validate Each Migration**: Test each feature migration thoroughly before proceeding to ensure no functionality is lost during consolidation
- **Maintain Type Safety**: The existing DataTable<T> generic pattern should be preserved throughout the consolidation to maintain TypeScript benefits
- **Expandable Content Strategy**: Each entity's expandable content should follow consistent patterns - contacts + interactions for organizations, history for contacts, timeline for opportunities
- **Performance Considerations**: The OpenStatus pattern handles large datasets well, but test with realistic CRM data volumes (1000+ organizations, 5000+ contacts)
- **Import Strategy**: Use global find/replace carefully - some imports may need manual adjustment for edge cases or custom implementations
- **Backup Critical Components**: Before deletion, ensure critical business logic isn't embedded in components marked for removal
- **Testing Coverage**: Run the full test suite after each phase - `npm run validate` and `npm run quality-gates` must pass
- **Mobile Responsiveness**: The OpenStatus pattern includes mobile-first design, but verify CRM-specific responsive behaviors are maintained
- **Accessibility Compliance**: Consolidated components must maintain WCAG compliance - particularly important for table navigation and form interactions
- **Bundle Size Monitoring**: Track bundle size reduction throughout implementation - target should be ~70% reduction as outlined in plan
- **Documentation Updates**: Update CLAUDE.md with new component patterns once consolidation is complete