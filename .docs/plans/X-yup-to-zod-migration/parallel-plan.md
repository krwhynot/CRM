# Yup to Zod Migration - Parallel Execution Plan

The CRM system requires migrating from a sophisticated Yup validation system to Zod to leverage better TypeScript integration and performance. The migration involves 5 core entities with complex conditional validation, 15+ transform functions, and deep React Hook Form integration. This plan optimizes for parallel execution while respecting entity dependencies and minimizing risk through phased implementation.

## Critically Relevant Files and Documentation

**Core Migration Documentation:**
- `.docs/plans/yup-to-zod-migration/shared.md` - Architecture overview and entity dependencies
- `.docs/plans/yup-to-zod-migration/yup-patterns.docs.md` - Current validation complexity analysis
- `.docs/plans/yup-to-zod-migration/zod-patterns.docs.md` - Existing Zod infrastructure patterns
- `.docs/plans/yup-to-zod-migration/form-architecture.docs.md` - React Hook Form integration analysis

**Current Yup Validation System:**
- `/src/types/validation.ts` - Central validation exports and Product schema
- `/src/types/contact.types.ts` - Complex conditional validation with organization creation
- `/src/types/opportunity.types.ts` - Multi-principal support and schema composition
- `/src/types/organization.types.ts` - Foundation entity validation
- `/src/types/interaction.types.ts` - Highest complexity with cross-entity dependencies
- `/src/lib/form-transforms.ts` - 15+ transform functions for data normalization
- `/src/lib/form-resolver.ts` - Typed Yup resolver (needs Zod implementation)

**Existing Zod Infrastructure:**
- `/src/lib/layout/validation.ts` - Complete Zod patterns and error handling
- `/src/components/forms/CRMFormSchemas.tsx` - Entity validation using Zod
- `/src/components/forms/SchemaForm.tsx` - Schema-driven form component

**Form Integration Points:**
- `/src/hooks/useCoreFormSetup.ts` - Central form setup with resolver integration
- `/src/components/forms/SimpleForm.tsx` - Declarative form builder
- `/src/components/forms/BusinessForm.tsx` - Advanced multi-section forms

## Implementation Plan

### Phase 1: Foundation Infrastructure

#### Task 1.1: Implement Missing Zod Infrastructure Depends on [none]

**READ THESE BEFORE TASK:**
- `/src/lib/form-resolver.ts` - Current typed resolver implementation
- `/src/lib/layout/validation.ts:578-584` - Zod resolver export patterns
- `/src/components/forms/SchemaForm.tsx:163` - resolver integration point

**Instructions:**

Files to Modify:
- `/src/lib/form-resolver.ts`

Complete the missing `createTypedZodResolver` function to enable full Zod integration. This critical function is referenced throughout the existing Zod infrastructure but not implemented. Must follow the same pattern as `createTypedYupResolver` with proper TypeScript generics and zodResolver integration from '@hookform/resolvers/zod'.

#### Task 1.2: Extend Transform System for Zod Depends on [none]

**READ THESE BEFORE TASK:**
- `/src/lib/form-transforms.ts` - Current transform functions and patterns
- `/src/lib/layout/validation.ts:16-26` - Zod validation constants
- `/src/components/forms/CRMFormSchemas.tsx:10-16` - Existing Zod transform patterns

**Instructions:**

Files to Modify:
- `/src/lib/form-transforms.ts`

Create Zod-compatible transform utilities alongside existing FormTransforms. Add `ZodTransforms` object with Zod-specific implementations of nullableString, nullableEmail, nullableNumber, normalizeUuid, and other critical transforms. Preserve existing Yup transforms during transition period.

#### Task 1.3: Establish Migration Testing Framework Depends on [none]

**READ THESE BEFORE TASK:**
- `/src/hooks/useCoreFormSetup.ts` - Form setup patterns
- `/tests/backend/` - Existing test structure
- `/docs/DEVELOPMENT_WORKFLOW.md` - Testing strategy

**Instructions:**

Files to Create:
- `/tests/migration/yup-zod-validation-parity.test.ts`

Files to Modify:
- `/package.json` (add migration test script)

Create validation parity tests to ensure Zod schemas produce identical validation results to Yup schemas. Include test utilities for schema comparison and form integration testing.

### Phase 2: Low-Risk Entity Migration

#### Task 2.1: Migrate Organization Validation Schema Depends on [1.1, 1.2]

**READ THESE BEFORE TASK:**
- `/src/types/organization.types.ts` - Current organization validation
- `/src/lib/layout/validation.ts:269-273` - Discriminated union patterns
- `/database/supabase/schemas/public/tables/organizations.md` - Database constraints

**Instructions:**

Files to Create:
- `/src/types/organization.zod.ts`

Files to Modify:
- `/src/types/organization.types.ts` (gradual migration pattern)

Migrate organization validation from Yup to Zod using established discriminated union patterns. Organizations have self-referencing relationships and address fields but minimal conditional logic, making them ideal for initial migration.

#### Task 2.2: Migrate Product Validation Schema Depends on [1.1, 1.2]

**READ THESE BEFORE TASK:**
- `/src/types/validation.ts:36-89` - Product schema with principal mode switching
- `/src/types/organization.types.ts` - Completed organization patterns
- `/database/supabase/schemas/public/tables/products.md` - Database constraints

**Instructions:**

Files to Create:
- `/src/types/product.zod.ts`

Files to Modify:
- `/src/types/validation.ts` (update product exports)

Migrate product validation with principal mode switching using Zod discriminated unions. Products have moderate complexity with conditional fields based on principal_mode but limited cross-entity dependencies.

#### Task 2.3: Update Core Form Integration Depends on [2.1, 2.2]

**READ THESE BEFORE TASK:**
- `/src/hooks/useCoreFormSetup.ts` - Form setup hook
- `/src/components/forms/SimpleForm.tsx` - Form builder integration
- Completed organization and product schemas

**Instructions:**

Files to Modify:
- `/src/hooks/useCoreFormSetup.ts`
- `/src/components/forms/SimpleForm.tsx`

Update form setup to support dual validation system during migration. Add resolver detection logic to use appropriate resolver (Yup vs Zod) based on schema type. Ensure backward compatibility during transition.

### Phase 3: Medium-Risk Entity Migration

#### Task 3.1: Analyze Contact Validation Complexity Depends on [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK:**
- `/src/types/contact.types.ts:158-174` - Complex conditional validation
- `/src/lib/form-transforms.ts` - Transform dependencies
- `/database/supabase/schemas/public/tables/contacts.md` - Database constraints

**Instructions:**

Files to Create:
- `/docs/internal-docs/contact-validation-migration-strategy.md`

Analyze contact validation patterns including organization creation mode, preferred principal relationships, and cross-entity validation flows. Document Zod implementation strategy for complex conditional logic.

#### Task 3.2: Migrate Contact Validation Schema Depends on [3.1]

**READ THESE BEFORE TASK:**
- Analysis from Task 3.1
- `/src/lib/layout/validation.ts:269-273` - Discriminated union examples
- Completed organization and product schemas

**Instructions:**

Files to Create:
- `/src/types/contact.zod.ts`

Files to Modify:
- `/src/types/contact.types.ts`

Migrate contact validation using Zod discriminated unions for organization creation mode. Handle conditional validation chains and transform integration for nullable fields and UUID normalization.

### Phase 4: High-Risk Business Logic Migration

#### Task 4.1: Analyze Opportunity Schema Composition Depends on [3.2]

**READ THESE BEFORE TASK:**
- `/src/types/opportunity.types.ts:148-250` - Multi-principal schema composition
- `/src/features/opportunities/hooks/useOpportunityForm.ts` - Complex form integration
- `/database/supabase/schemas/public/tables/opportunities.md` - Database constraints

**Instructions:**

Files to Create:
- `/docs/internal-docs/opportunity-schema-composition-strategy.md`

Analyze opportunity schema composition patterns including multiPrincipalOpportunitySchema, field inheritance using schema.fields spreading, and complex validation chains. Document Zod composition strategy.

#### Task 4.2: Migrate Opportunity Base Schema Depends on [4.1]

**READ THESE BEFORE TASK:**
- Analysis from Task 4.1
- `/src/types/opportunity.types.ts` - Current schema composition
- Completed contact, organization, and product schemas

**Instructions:**

Files to Create:
- `/src/types/opportunity.zod.ts`

Files to Modify:
- `/src/types/opportunity.types.ts`

Migrate base opportunity validation schema with stage management and principal relationships. Implement schema composition patterns using Zod with proper type inference preservation.

#### Task 4.3: Implement Multi-Principal Support Depends on [4.2]

**READ THESE BEFORE TASK:**
- `/src/types/opportunity.types.ts:148-250` - Multi-principal patterns
- Base opportunity schema from Task 4.2
- `/database/supabase/schemas/public/tables/opportunity_participants.md`

**Instructions:**

Files to Modify:
- `/src/types/opportunity.zod.ts`
- `/src/types/opportunity.types.ts`

Implement multi-principal opportunity support using Zod schema composition. Handle array validation, participant relationships, and auto-naming logic with proper type inference.

### Phase 5: Critical Integration Layer Migration

#### Task 5.1: Analyze Interaction Cross-Entity Dependencies Depends on [4.3]

**READ THESE BEFORE TASK:**
- `/src/types/interaction.types.ts` - Complex cross-entity validation
- All completed entity schemas
- `/database/supabase/schemas/public/tables/interactions.md` - Highest dependency chain

**Instructions:**

Files to Create:
- `/docs/internal-docs/interaction-cross-entity-validation-strategy.md`

Analyze interaction validation complexity including dynamic opportunity creation, priority system integration, and conditional follow-up logic. Document migration strategy for highest-risk validation patterns.

#### Task 5.2: Migrate Interaction Validation Schema Depends on [5.1]

**READ THESE BEFORE TASK:**
- Analysis from Task 5.1
- `/src/types/interaction.types.ts` - Current validation patterns
- All completed entity schemas

**Instructions:**

Files to Create:
- `/src/types/interaction.zod.ts`

Files to Modify:
- `/src/types/interaction.types.ts`

Migrate interaction validation with cross-entity dependencies and dynamic creation logic. Implement complex conditional validation using Zod refinements and discriminated unions.

#### Task 5.3: Update Advanced Form Components Depends on [5.2]

**READ THESE BEFORE TASK:**
- `/src/components/forms/BusinessForm.tsx` - Multi-section forms
- `/src/features/opportunities/hooks/useOpportunityForm.ts` - Step validation
- All completed validation schemas

**Instructions:**

Files to Modify:
- `/src/components/forms/BusinessForm.tsx`
- `/src/components/forms/FormField.tsx`
- `/src/features/opportunities/hooks/useOpportunityForm.ts`

Update advanced form components to support new Zod schemas. Handle step-based validation, conditional field rendering, and error message formatting with Zod error structures.

### Phase 6: System Integration and Cleanup

#### Task 6.1: Update Central Validation Exports Depends on [5.3]

**READ THESE BEFORE TASK:**
- `/src/types/validation.ts` - Central exports
- All completed entity schemas
- `/src/lib/form-resolver.ts` - Updated resolver system

**Instructions:**

Files to Modify:
- `/src/types/validation.ts`

Update central validation exports to use Zod schemas. Implement gradual migration pattern with feature flags to allow entity-by-entity rollout while maintaining system stability.

#### Task 6.2: Migrate Remaining Form Integration Points Depends on [6.1]

**READ THESE BEFORE TASK:**
- `/src/components/forms/` - All form components
- Updated central validation exports
- Migration testing framework

**Instructions:**

Files to Modify:
- `/src/components/forms/SimpleForm.tsx`
- `/src/hooks/useCoreFormSetup.ts`
- Other form integration points identified during migration

Complete migration of remaining form integration points. Remove dual validation system support and cleanup temporary migration code. Ensure all form components use Zod resolver.

#### Task 6.3: Performance Testing and Optimization Depends on [6.2]

**READ THESE BEFORE TASK:**
- `/docs/DEVELOPMENT_WORKFLOW.md` - Performance testing strategy
- All migrated validation schemas
- `/src/lib/performance-optimizations.ts` - Performance patterns

**Instructions:**

Files to Create:
- `/tests/performance/validation-performance.test.ts`

Files to Modify:
- Validation schemas based on performance findings

Conduct comprehensive performance testing of Zod validation vs. original Yup performance. Optimize schemas for performance bottlenecks and validate memory usage improvements.

#### Task 6.4: Documentation and Cleanup Depends on [6.3]

**READ THESE BEFORE TASK:**
- All migration work completed
- Performance testing results
- `/docs/` - Documentation structure

**Instructions:**

Files to Create:
- `/docs/validation/VALIDATION_ARCHITECTURE.md`
- `/docs/migration/YUP_TO_ZOD_MIGRATION_SUMMARY.md`

Files to Modify:
- Remove legacy Yup code and temporary migration utilities
- Update developer documentation

Complete final cleanup of migration code, update documentation, and create validation architecture guide for future development. Remove all temporary dual validation system code.

## Advice

**Critical Implementation Considerations:**

- **Dual System Operation**: Implement feature flags and gradual rollout patterns to run Yup and Zod validation in parallel during migration phases. This allows entity-by-entity migration with immediate rollback capability if issues arise.

- **Transform Function Compatibility**: The existing FormTransforms system with 15+ functions is heavily used across all entities. Create Zod-compatible versions while preserving exact behavior. Pay special attention to context-dependent transforms that access sibling field values.

- **Type Inference Preservation**: Current code relies heavily on `yup.InferType<typeof schema>` patterns. Ensure Zod migration preserves all TypeScript inference while improving type safety. Some complex conditional types may need manual type definitions.

- **Validation Error Message Compatibility**: Zod error structures differ from Yup. Ensure error message formatting and field path resolution remains consistent to avoid breaking existing error handling UI components.

- **Schema Composition Complexity**: Opportunity schemas use complex composition patterns with field inheritance via `schema.fields` spreading. Zod composition requires different patterns - use `z.object().extend()` or intersection types carefully to preserve type relationships.

- **Testing Strategy Critical**: Each migrated entity MUST have validation parity tests comparing Yup and Zod behavior with identical input data. This is essential for complex conditional validation patterns.

- **Performance Monitoring**: While Zod typically performs better than Yup, monitor validation performance during migration. Complex conditional schemas may have different performance characteristics that require optimization.

- **Migration Rollback Plan**: Each phase should include rollback procedures. The gradual migration pattern with central exports allows immediate reversion to Yup schemas if critical issues arise during production deployment.