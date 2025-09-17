# Shared Component Architecture Migration Plan

The CRM codebase requires strategic architectural consolidation to move bulk actions, selection hooks, and table components from feature-specific locations to proper shared locations. Currently, generic bulk components are misplaced in organizations feature creating cross-feature import violations across 6+ files, selection hooks follow inconsistent patterns with missing implementations, and all entity tables use deprecated DataTable despite enhanced alternatives being available. This migration will establish proper component boundaries while maintaining the 80% architecture health score requirement.

## Critically Relevant Files and Documentation

### Shared Components to Migrate
- `/src/features/organizations/components/BulkActionsToolbar.tsx` - Generic toolbar misplaced in organizations
- `/src/features/organizations/components/BulkDeleteDialog.tsx` - Generic dialog with DeletableEntity interface
- `/src/components/data-table/data-table.tsx` - Enhanced DataTable with TanStack integration
- `/src/components/data-table/toolbar.tsx` - DataTable toolbar with actions integration

### Selection Hook Analysis
- `/src/features/contacts/hooks/useContactsSelection.ts` - Set<string> multi-selection pattern
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts` - Set<string> multi-selection pattern
- `/src/features/*/hooks/use*PageState.ts` - Object-based single selection patterns
- `/src/hooks/useEntitySelectState.ts` - Generic dropdown selection

### Table Migration Targets
- `/src/components/ui/DataTable.tsx` - **@deprecated** legacy implementation
- `/src/features/*/components/*Table.tsx` - All entity tables use deprecated DataTable
- `/src/components/forms/*.generated.tsx` - 5 generated forms for cleanup

### Architecture Validation
- `/.eslintrc.cjs` - Import restriction rules requiring updates
- `/tests/architecture/component-placement.test.ts` - Component placement validation
- `/scripts/run-quality-gates.sh` - 80% health score requirement
- `/scripts/analyze-component-usage.js` - Component usage analytics

### Research Documentation
- `.docs/plans/shared-component-architecture/bulk-actions-patterns.docs.md`
- `.docs/plans/shared-component-architecture/selection-hooks-analysis.docs.md`
- `.docs/plans/shared-component-architecture/table-components-analysis.docs.md`
- `.docs/plans/shared-component-architecture/architecture-validation.docs.md`

## Implementation Plan

### Phase 1: Architecture Foundation

#### Task 1.1: Create Shared Bulk Actions Directory [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/features/organizations/components/BulkActionsToolbar.tsx`
- `/src/features/organizations/components/BulkDeleteDialog.tsx`
- `.docs/plans/shared-component-architecture/bulk-actions-patterns.docs.md`

**Instructions**

Files to Create:
- `/src/components/bulk-actions/index.ts`
- `/src/components/bulk-actions/BulkActionsToolbar.tsx`
- `/src/components/bulk-actions/BulkDeleteDialog.tsx`
- `/src/components/bulk-actions/useBulkOperations.ts`
- `/src/components/bulk-actions/types.ts`

Files to Modify:
- `/src/components/index.ts`

Move bulk components from organizations feature to shared location. Genericize BulkActionsToolbar by adding `entityType` and `entityTypePlural` props to remove hardcoded "organization" text. Rename BulkDeleteDialog's `organizations` prop to generic `entities`. Create shared hook `useBulkOperations<T>` to standardize bulk operation patterns. Export all components through centralized index.

#### Task 1.2: Update ESLint Rules for Shared Components [Depends on: none]

**READ THESE BEFORE TASK**
- `/.eslintrc.cjs`
- `/.eslintrc.component-organization.js`
- `.docs/plans/shared-component-architecture/architecture-validation.docs.md`

**Instructions**

Files to Modify:
- `/.eslintrc.cjs`

Files to Delete:
- `/.eslintrc.component-organization.js`

Update `no-restricted-imports` patterns in main ESLint config to allow strategic shared components. Integrate component organization rules from separate file. Add exception patterns for components moving from feature to shared directories. Update import restriction messages to guide developers toward shared components.

#### Task 1.3: Create Generic Selection Hooks [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/features/contacts/hooks/useContactsSelection.ts`
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts`
- `/src/hooks/useEntitySelectState.ts`
- `.docs/plans/shared-component-architecture/selection-hooks-analysis.docs.md`

**Instructions**

Files to Create:
- `/src/hooks/useEntitySelection.ts`
- `/src/hooks/useEntityPageState.ts`

Files to Modify:
- `/src/hooks/index.ts`

Create generic `useEntitySelection<T>` hook implementing Set<string> pattern for multi-selection with `handleSelectAll`, `handleSelectItem`, and `clearSelection` methods. Create generic `useEntityPageState<T>` hook for CRUD dialog management with consistent naming (`selectedEntity`, not `selectedContact`). Implement ID-based selection pattern following contactAdvocacyStore approach to avoid stale data.

### Phase 2: Component Migration

#### Task 2.1: **SCOPE ADJUSTED** Update Bulk Actions in ContactsTable [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/src/features/contacts/components/ContactsTable.tsx`
- `/src/components/bulk-actions/` (after Task 1.1)
- `docs/internal-docs/table-migration-complexity-analysis.docs.md`

**Instructions**

Files to Modify:
- `/src/features/contacts/components/ContactsList.tsx`

**SCOPE CHANGE**: Given table migration complexity findings, this task focuses ONLY on updating bulk actions imports and usage. Do NOT migrate to enhanced DataTable - that is deferred to Phase 4.

Update ContactsList to import bulk components from shared location (`@/components/bulk-actions/`) instead of organizations feature. Update component props to use generic entity type parameters. Test that bulk operations work correctly with new shared components.

#### Task 2.2: **SCOPE ADJUSTED** Update Bulk Actions in OrganizationsTable [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/src/features/organizations/components/OrganizationsTable.tsx`
- `/src/components/bulk-actions/` (after Task 1.1)

**Instructions**

Files to Modify:
- `/src/features/organizations/components/OrganizationsList.tsx`

**SCOPE CHANGE**: Focus ONLY on updating bulk actions imports and usage. Do NOT migrate to enhanced DataTable.

Update OrganizationsList to use shared bulk components. Since this was the original location, verify the components were moved correctly and all functionality is preserved.

#### Task 2.3: **SCOPE ADJUSTED** Update Bulk Actions in OpportunitiesTable [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/src/features/opportunities/components/OpportunitiesTable.tsx`
- `/src/components/bulk-actions/` (after Task 1.1)

**Instructions**

Files to Modify:
- `/src/features/opportunities/components/OpportunitiesList.tsx`

**SCOPE CHANGE**: Focus ONLY on updating bulk actions imports and usage. Do NOT migrate to enhanced DataTable.

Update OpportunitiesList to import from shared bulk actions location. Test that opportunities bulk operations continue working with new shared components.

#### Task 2.4: Update All Bulk Actions Import Paths [Depends on: 1.1, 2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/features/contacts/components/ContactsList.tsx`
- `/src/features/opportunities/components/OpportunitiesList.tsx`
- `/src/features/products/components/ProductsTable.tsx`
- `/src/features/interactions/components/InteractionsTable.tsx`

**Instructions**

Files to Modify:
- `/src/features/contacts/components/ContactsList.tsx`
- `/src/features/contacts/components/ContactsTable.tsx`
- `/src/features/opportunities/components/OpportunitiesList.tsx`
- `/src/features/opportunities/components/OpportunitiesTable.tsx`
- `/src/features/products/components/ProductsTable.tsx`
- `/src/features/interactions/components/InteractionsTable.tsx`

Update all cross-feature bulk component imports from `@/features/organizations/components/*` to `@/components/bulk-actions/*`. Update component usage to use new generic props (`entityType`, `entityTypePlural`, `entities` instead of `organizations`). Test that bulk operations continue working across all entity types.

### Phase 3: Hook Standardization

#### Task 3.1: Implement Missing Multi-Selection Hooks [Depends on: 1.3]

**READ THESE BEFORE TASK**
- `/src/hooks/useEntitySelection.ts`
- `/src/features/organizations/hooks/useOrganizationsPageState.ts`
- `/src/features/products/hooks/useProductsPageState.ts`
- `/src/features/interactions/hooks/useInteractionsPageState.ts`

**Instructions**

Files to Create:
- `/src/features/organizations/hooks/useOrganizationsSelection.ts`
- `/src/features/products/hooks/useProductsSelection.ts`
- `/src/features/interactions/hooks/useInteractionsSelection.ts`

Files to Modify:
- `/src/features/organizations/index.ts`
- `/src/features/products/index.ts`
- `/src/features/interactions/index.ts`

Implement missing multi-selection hooks for organizations, products, and interactions using the generic `useEntitySelection<T>` pattern. Add bulk operation capabilities to these entities. Export new hooks from feature index files.

#### Task 3.2: Migrate Existing Selection Hooks to Generic Pattern [Depends on: 1.3, 3.1]

**READ THESE BEFORE TASK**
- `/src/features/contacts/hooks/useContactsSelection.ts`
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts`
- `/src/hooks/useEntitySelection.ts`

**Instructions**

Files to Modify:
- `/src/features/contacts/hooks/useContactsSelection.ts`
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts`

Refactor existing contacts and opportunities selection hooks to use the generic `useEntitySelection<T>` pattern. Remove code duplication while maintaining exact same interface for backward compatibility. Test that existing functionality remains unchanged.

#### Task 3.3: Standardize Page State Hook Patterns [Depends on: 1.3]

**READ THESE BEFORE TASK**
- `/src/features/contacts/hooks/useContactsPageState.ts`
- `/src/features/organizations/hooks/useOrganizationsPageState.ts`
- `/src/features/products/hooks/useProductsPageState.ts`
- `/src/features/interactions/hooks/useInteractionsPageState.ts`
- `/src/hooks/useEntityPageState.ts`

**Instructions**

Files to Modify:
- `/src/features/contacts/hooks/useContactsPageState.ts`
- `/src/features/organizations/hooks/useOrganizationsPageState.ts`
- `/src/features/products/hooks/useProductsPageState.ts`
- `/src/features/interactions/hooks/useInteractionsPageState.ts`

Migrate all page state hooks to use generic `useEntityPageState<T>` pattern. Standardize naming to `selectedEntity` instead of entity-specific names. Implement ID-based selection to prevent stale data issues. Maintain dialog state management patterns.

### Phase 4: Table Migration (DEFERRED - HIGH COMPLEXITY)

#### Task 4.1: **DEFER** Complete Table Migration [Depends on: Business Priority Assessment]

**READ THESE BEFORE TASK**
- `docs/internal-docs/table-migration-complexity-analysis.docs.md`
- `/src/components/ui/DataTable.tsx` (deprecated but functional)
- `/src/components/data-table/data-table.tsx` (enhanced TanStack implementation)

**Instructions**

**CRITICAL FINDING**: Table migration from deprecated DataTable to enhanced TanStack Table is **VERY HIGH COMPLEXITY** (4-6 weeks effort) with 100% API incompatibility requiring complete rewrite of all column definitions.

**RECOMMENDATION**: DEFER this migration unless enhanced TanStack Table features become critical for immediate business requirements. The current deprecated DataTable implementation is functional and meets business needs.

**IF MIGRATION PROCEEDS**:
- Budget 4-6 weeks with dedicated testing
- Rewrite all column definitions from `DataTableColumn<T>` to `ColumnDef<TData, TValue>`
- Preserve complex features: decision authority, weekly context, interaction timelines
- Test all expandable content and mobile responsive behaviors
- Risk: HIGH chance of production issues due to API incompatibility

#### Task 4.2: **DEFER** Remove Deprecated DataTable [Depends on: 4.1 completion]

**Instructions**

This task should only be executed AFTER successful migration of all entity tables. Given the complexity findings, this is deferred indefinitely until business case justifies the significant development effort.

#### Task 4.3: Clean Up Generated Form Components [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/components/forms/ContactForm.generated.tsx`
- `/src/components/forms/OrganizationForm.generated.tsx`
- `/src/components/forms/ProductForm.generated.tsx`
- `/src/components/forms/OpportunityForm.generated.tsx`
- `/src/components/forms/InteractionForm.generated.tsx`

**Instructions**

Files to Delete:
- `/src/components/forms/ContactForm.generated.tsx`
- `/src/components/forms/OrganizationForm.generated.tsx`
- `/src/components/forms/ProductForm.generated.tsx`
- `/src/components/forms/OpportunityForm.generated.tsx`
- `/src/components/forms/InteractionForm.generated.tsx`

Files to Modify:
- `/src/components/forms/index.ts`

Remove unused generated form components that are not imported anywhere in the application. Update form component exports. These forms are superseded by SimpleForm pattern.

### Phase 5: Architecture Validation

#### Task 5.1: Update Architecture Tests [Depends on: 1.2, 4.2]

**READ THESE BEFORE TASK**
- `/tests/architecture/component-placement.test.ts`
- `/scripts/analyze-component-usage.js`
- `.docs/plans/shared-component-architecture/architecture-validation.docs.md`

**Instructions**

Files to Modify:
- `/tests/architecture/component-placement.test.ts`
- `/scripts/analyze-component-usage.js`

Update component placement validation tests to expect new shared component patterns. Add whitelist for strategically shared components in health scoring. Update forbidden component patterns to reflect new architecture. Ensure 80% health score threshold can still be met.

#### Task 5.2: Validate Quality Gates [Depends on: 5.1]

**READ THESE BEFORE TASK**
- `/scripts/run-quality-gates.sh`
- All migrated component files

**Instructions**

Run comprehensive quality gates validation to ensure:
- TypeScript compilation passes
- ESLint rules pass with new shared component imports
- Architecture health score remains above 80%
- Bundle size stays under 3MB limit
- All tests pass with new component structure

**Command to run**: `npm run quality-gates`

## Advice

### Critical Success Factors
- **Maintain Backwards Compatibility**: All existing functionality must continue working during migration
- **Preserve Complex Features**: Don't lose entity-specific features like decision authority tracking, weekly context, or interaction timelines during table migration
- **Test Cross-Feature Usage**: Bulk actions must work identically across all entity types after migration
- **Gradual Migration**: Migrate one table at a time to isolate issues and maintain stability

### Architecture Health Score Management
- **CRITICAL**: Current health score is 69%, below required 80% threshold causing quality gates to fail
- **Migration Will IMPROVE Score**: Moving multi-feature components like BulkDeleteDialog to shared will mathematically improve health
- **Pre-validate Components**: Use `node scripts/analyze-component-usage.js` to track health score impact
- **Strategic Timing**: Move components that will improve overall health score first (bulk actions are flagged for migration)
- **Monitor Quality Gates**: Run `npm run quality-gates` frequently during migration to catch score drops early

### Import Path Strategy
- **Update All at Once**: After moving components, update all import paths in a single commit to avoid broken states
- **Use Find/Replace**: Leverage IDE find/replace across entire codebase for import path updates
- **Test All Entity Features**: Verify contacts, organizations, opportunities, products, and interactions all work after bulk import updates

### TanStack Table Migration Gotchas
- **Column Definition Changes**: `DataTableColumn<T>` becomes `ColumnDef<TData, TValue>` with different structure
- **Selection State**: Enhanced DataTable manages selection internally - remove manual useState for selectedIds
- **Expansion Logic**: TanStack Table has different expansion patterns - test all expandable content
- **Badge Components**: Use enhanced DataTable's built-in badge utilities instead of custom implementations

### ESLint Rule Timing
- **CRITICAL**: Active import restriction rules in `.eslintrc.cjs` will block cross-feature imports during migration
- **Update Rules First**: Modify ESLint rules before moving components to avoid CI/CD failures
- **Integrate Separate Rules**: `.eslintrc.component-organization.js` exists but is NOT integrated into main config
- **Test Locally**: Run `npm run lint:architecture` locally after rule changes
- **Temporary Exceptions**: Add migration-specific rule exceptions during component moves to prevent CI/CD blocking