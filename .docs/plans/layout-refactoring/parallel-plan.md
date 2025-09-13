# Slot-Based Layout System Migration Plan

This plan outlines the migration from the current template-based layout system (EntityManagementTemplate) to a flexible slot-based layout architecture. The migration will create a new PageLayout component with composable slots for title, actions, filters, and content, enabling faster development and easier maintenance. The plan is designed for parallel execution with minimal dependencies between tasks, allowing multiple developers to work simultaneously.

## Critically Relevant Files and Documentation

### Core Files to Understand
- `/src/components/templates/EntityManagementTemplate.tsx` - Current template system to replace
- `/src/layout/components/LayoutWithFilters.tsx` - Existing filter layout wrapper
- `/src/components/ui/new/PageHeader.tsx` - Current header with partial slot support
- `/src/components/filters/FilterSidebar.tsx` - Reusable filter sidebar component
- `/src/styles/tokens/` - Design token system (88% coverage)

### Documentation to Read First
- `.docs/plans/layout-refactoring/shared.md` - Architecture comparison and analysis
- `.docs/plans/layout-refactoring/current-page-patterns.docs.md` - Current page patterns
- `.docs/plans/layout-refactoring/ui-components-and-tokens.docs.md` - UI component ecosystem
- `CLAUDE.md` - Project standards and guidelines

### Example Pages to Reference
- `/src/pages/Organizations.tsx` - Uses EntityManagementTemplate with filters
- `/src/pages/Contacts.tsx` - Simple EntityManagementTemplate usage
- `/src/pages/OrganizationsWithFilters.tsx` - LayoutWithFilters approach

## Implementation Plan

### Phase 1: Core Infrastructure

#### Task 1.1: Create PageLayout Component [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/components/ui/new/PageHeader.tsx` - Understand current header structure
- `/src/components/layout/PageContainer.tsx` - Container spacing patterns
- `/src/styles/tokens/spacing.ts` - Semantic spacing tokens
- `.docs/plans/layout-refactoring/shared.md` - Slot-based architecture design

**Instructions**

Files to Create:
- `/src/components/layout/PageLayout.tsx`
- `/src/components/layout/PageLayout.types.ts`

Files to Modify:
- `/src/components/layout/index.ts` - Export new PageLayout

Create the core PageLayout component with slot-based architecture:
- Define TypeScript interface for slots (title, subtitle, actions, filters, meta, children)
- Implement responsive layout with conditional filter sidebar rendering
- Use semantic design tokens for all spacing and typography
- Support both desktop (persistent sidebar) and mobile (sheet overlay) layouts
- Ensure slots accept ReactNode for maximum flexibility

#### Task 1.2: Create SlotHeader Component [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/components/ui/new/PageHeader.tsx` - Current header implementation
- `/src/styles/tokens/typography.ts` - Typography tokens
- `.docs/plans/layout-refactoring/ui-components-and-tokens.docs.md` - Design token usage

**Instructions**

Files to Create:
- `/src/components/layout/SlotHeader.tsx`
- `/src/components/layout/SlotHeader.types.ts`

Files to Modify:
- `/src/components/layout/index.ts` - Export SlotHeader

Build a new header component optimized for slot composition:
- Accept title, subtitle, meta, and actions as direct ReactNode slots
- Remove array-based action handling from PageHeader
- Implement responsive flexbox layout for mobile/desktop
- Use semantic typography tokens for consistent text styling
- Support breadcrumb slot for navigation context

#### Task 1.3: Create FilterSlot Component [Depends on: none]

**READ THESE BEFORE TASK**
- `/src/components/filters/FilterSidebar.tsx` - Existing sidebar implementation
- `/src/components/filters/FilterSidebar.types.ts` - FilterSection interface
- `/src/layout/components/LayoutWithFilters.tsx` - Current filter integration

**Instructions**

Files to Create:
- `/src/components/layout/FilterSlot.tsx`
- `/src/components/layout/FilterSlot.types.ts`

Files to Modify:
- `/src/components/layout/index.ts` - Export FilterSlot

Create a filter slot wrapper that integrates with PageLayout:
- Wrap FilterSidebar with slot-specific configuration
- Handle mobile sheet vs desktop sidebar rendering
- Support both structured sections and custom content
- Implement persistence key management for filter state
- Ensure proper z-index layering with design tokens

### Phase 2: Migration Utilities

#### Task 2.1: Create Layout Migration Hook [Depends on: 1.1]

**READ THESE BEFORE TASK**
- `/src/components/templates/EntityManagementTemplate.tsx` - Template props to migrate
- `/src/hooks/` - Existing hook patterns
- `.docs/plans/layout-refactoring/current-page-patterns.docs.md` - Page state patterns

**Instructions**

Files to Create:
- `/src/hooks/usePageLayout.ts`
- `/src/hooks/usePageLayout.types.ts`

Files to Modify:
- `/src/hooks/index.ts` - Export new hook

Build a hook to ease migration from templates to slots:
- Accept entity type and derive default title/subtitle from COPY
- Provide slot builders for common patterns (add button, entity count)
- Handle backward compatibility with template props
- Return properly typed slot props for PageLayout
- Include migration helpers for headerActions conversion

#### Task 2.2: Create Template Adapter Component [Depends on: 1.1, 1.2, 1.3]

**READ THESE BEFORE TASK**
- `/src/components/templates/EntityManagementTemplate.tsx` - Template interface
- All entity-specific template variants (lines 135-161)
- `.docs/plans/layout-refactoring/shared.md` - Migration strategy

**Instructions**

Files to Create:
- `/src/components/layout/TemplateAdapter.tsx`
- `/src/components/layout/TemplateAdapter.types.ts`

Files to Modify:
- `/src/components/layout/index.ts` - Export TemplateAdapter

Create an adapter that wraps PageLayout to support EntityManagementTemplate API:
- Accept all EntityManagementTemplate props
- Transform template props to PageLayout slots
- Maintain backward compatibility for gradual migration
- Support entity-specific variants (Organization, Contact, etc.)
- Add deprecation warnings in development mode

### Phase 3: Page Migration

#### Task 3.1: Migrate Contacts Page [Depends on: 1.1, 2.1]

**READ THESE BEFORE TASK**
- `/src/pages/Contacts.tsx` - Current implementation
- `/src/features/contacts/` - Contact feature components
- `.docs/plans/layout-refactoring/current-page-patterns.docs.md` - Page patterns

**Instructions**

Files to Modify:
- `/src/pages/Contacts.tsx` - Convert to PageLayout

Migrate Contacts page to slot-based layout:
- Replace ContactManagementTemplate with PageLayout
- Compose header slots directly with title and add button
- Use usePageLayout hook for common patterns
- Maintain all existing functionality and state management
- Add inline comments explaining slot usage for other developers

#### Task 3.2: Migrate Products Page [Depends on: 1.1, 2.1]

**READ THESE BEFORE TASK**
- `/src/pages/Products.tsx` - Current implementation
- `/src/features/products/` - Product feature components
- Task 3.1 implementation for reference

**Instructions**

Files to Modify:
- `/src/pages/Products.tsx` - Convert to PageLayout

Migrate Products page following Contacts pattern:
- Apply same slot-based transformation
- Ensure consistency with Contacts migration
- Document any product-specific slot usage
- Maintain existing CRUD operations

#### Task 3.3: Migrate Organizations Page with Filters [Depends on: 1.1, 1.3, 2.1]

**READ THESE BEFORE TASK**
- `/src/pages/Organizations.tsx` - Current complex implementation
- `/src/pages/OrganizationsWithFilters.tsx` - Alternative approach
- `/src/features/organizations/hooks/useOrganizationsFiltering.ts` - Filter logic
- `.docs/plans/layout-refactoring/ui-components-and-tokens.docs.md` - Filter patterns

**Instructions**

Files to Modify:
- `/src/pages/Organizations.tsx` - Convert to PageLayout with filters

Migrate Organizations page with full filter support:
- Replace OrganizationManagementTemplate with PageLayout
- Compose filter slot with existing FilterSection arrays
- Remove duplicate filter definitions (lines 56-120 and 184-248)
- Integrate search, type selection, and quick filters into filter slot
- Ensure mobile sheet overlay works correctly
- Consider deprecating OrganizationsWithFilters variant

#### Task 3.4: Migrate Opportunities Page [Depends on: 1.1, 2.1]

**READ THESE BEFORE TASK**
- `/src/pages/Opportunities.tsx` - Current implementation
- `/src/features/opportunities/` - Opportunity components
- Previous migration tasks for patterns

**Instructions**

Files to Modify:
- `/src/pages/Opportunities.tsx` - Convert to PageLayout

Complete opportunities migration:
- Apply slot-based pattern consistently
- Handle opportunity-specific header actions
- Maintain wizard integration if present
- Document migration for complex interactions

### Phase 4: Enhancement and Optimization

#### Task 4.1: Create Composite Slot Components [Depends on: 3.1, 3.2, 3.3]

**READ THESE BEFORE TASK**
- Migrated pages from Phase 3
- `/src/components/ui/` - shadcn/ui component patterns
- `/src/styles/tokens/` - Design token system

**Instructions**

Files to Create:
- `/src/components/layout/slots/ActionGroup.tsx`
- `/src/components/layout/slots/MetaBadge.tsx`
- `/src/components/layout/slots/FilterGroup.tsx`
- `/src/components/layout/slots/index.ts`

Build reusable slot components for common patterns:
- ActionGroup: Compose multiple action buttons with consistent spacing
- MetaBadge: Format entity counts and metadata
- FilterGroup: Group related filter controls
- Export all slot components for easy import
- Use design tokens throughout for consistency

#### Task 4.2: Add Storybook Documentation [Depends on: 1.1, 4.1]

**READ THESE BEFORE TASK**
- `/src/components/` - Existing Storybook patterns if any
- `.docs/plans/layout-refactoring/shared.md` - Architecture benefits

**Instructions**

Files to Create:
- `/src/components/layout/PageLayout.stories.tsx`
- `/src/components/layout/slots/ActionGroup.stories.tsx`
- `/src/components/layout/MIGRATION.md`

Document the new layout system:
- Create Storybook stories showing slot composition
- Demonstrate migration from EntityManagementTemplate
- Show responsive behavior and mobile adaptations
- Include code examples for common patterns
- Write migration guide with before/after examples

### Phase 5: Cleanup and Deprecation

#### Task 5.1: Deprecate EntityManagementTemplate [Depends on: 3.1, 3.2, 3.3, 3.4]

**READ THESE BEFORE TASK**
- All migrated pages
- `/src/components/templates/EntityManagementTemplate.tsx`
- Any remaining usages via global search

**Instructions**

Files to Modify:
- `/src/components/templates/EntityManagementTemplate.tsx` - Add deprecation
- All remaining pages using templates

Mark template system as deprecated:
- Add @deprecated JSDoc comments with migration instructions
- Console.warn in development when templates are used
- Update any remaining pages to use PageLayout
- Document deprecation timeline in MIGRATION.md

#### Task 5.2: Remove LayoutWithFilters Duplication [Depends on: 3.3]

**READ THESE BEFORE TASK**
- `/src/layout/components/LayoutWithFilters.tsx`
- `/src/pages/OrganizationsWithFilters.tsx`
- New Organizations.tsx implementation

**Instructions**

Files to Modify:
- `/src/pages/OrganizationsWithFilters.tsx` - Redirect or remove
- `/src/layout/components/LayoutWithFilters.tsx` - Deprecate
- Router configuration if applicable

Consolidate layout approaches:
- Remove OrganizationsWithFilters page variant
- Deprecate LayoutWithFilters in favor of PageLayout
- Update any routing to point to single Organizations page
- Ensure no functionality is lost in consolidation

## Advice

### Critical Implementation Notes

- **Design Token Usage**: The project has 88% token coverage - maintain or improve this. Always use semantic tokens from `/src/styles/tokens/` rather than hardcoded Tailwind classes.

- **Mobile-First Development**: The CRM is iPad-optimized. Test all slot compositions on tablet breakpoints (768px) and ensure filter sheets work correctly on mobile.

- **Type Safety**: Use TypeScript generics for slot props to maintain type safety. The current ReactNode props limit type checking - improve this in the new system.

- **Performance Considerations**: The DataTable auto-virtualizes at 500+ rows. Ensure PageLayout doesn't interfere with this optimization by adding unnecessary wrapper divs.

- **Backward Compatibility**: The TemplateAdapter (Task 2.2) is crucial for gradual migration. Don't skip this even if eager to migrate everything at once.

- **Filter State Management**: Filter persistence uses localStorage. Ensure PageLayout respects existing `persistFiltersKey` patterns from LayoutWithFilters.

- **Quality Gates**: Run `npm run quality-gates` after each phase. The project requires 80% component consistency and max 20 ESLint warnings.

- **shadcn/ui Integration**: The project uses shadcn/ui "new-york" style. Maintain consistency with existing components, especially the sidebar system.

- **Bundle Size**: Monitor bundle impact - the project has a 3MB limit. The new PageLayout should not significantly increase bundle size.

- **Testing Strategy**: Each migrated page should maintain 100% feature parity. Test CRUD operations, filter state, and mobile responsiveness thoroughly.

### Common Pitfalls to Avoid

- Don't remove the error boundaries when migrating pages - they're essential for production stability
- Maintain the existing hook patterns for state management - don't refactor these during layout migration
- Keep the Dialog components separate from layout concerns - they work well as-is
- Don't break the existing FilterSection interface - it's used throughout the app
- Preserve all accessibility attributes (aria-labels, roles) during migration