# Yup to Zod Migration - Validated Parallel Implementation Plan

This migration converts the CRM's validation system from Yup to Zod while maintaining all existing functionality. Critical validation research reveals that true parallelization is NOT safe due to circular dependencies and TypeScript compilation issues. The migration requires a more sequential approach with limited parallelization opportunities.

## Critically Relevant Files and Documentation

- `/src/types/validation.ts` - Central schema registry with circular import dependencies
- `/src/components/forms/CRMFormSchemas.tsx` - Incomplete Zod implementation (missing junction schemas)
- `/src/lib/form-resolver.ts` - Custom typed resolver utilities with duplicate implementations
- `/src/types/forms/form-handlers.ts` - Duplicate resolver functions requiring cleanup
- `/.docs/plans/yup-to-zod/shared.md` - Architecture overview and file references
- `CLAUDE.md` - Quality gates requirements (npm run quality-gates must pass)

## Implementation Plan

### Phase 1: Critical Infrastructure Setup (Sequential Required)

#### Task 1.1: Fix TypeScript Compilation Issues Depends on [none]

**READ THESE BEFORE TASK**
- Current TypeScript compilation is failing (timeout on type-check)
- `/src/types/validation.ts`
- All entity schema files for circular dependency analysis

**Instructions**

Files to modify:
- Any files causing TypeScript compilation failures
- Circular import patterns between schema files

Run `npm run type-check` and resolve all TypeScript errors before proceeding. The validation research indicates compilation timeouts that will block all subsequent work. Address circular dependencies between validation.ts and entity schema files.

#### Task 1.2: Cleanup Duplicate Resolver Implementations Depends on [1.1]

**READ THESE BEFORE TASK**
- `/src/lib/form-resolver.ts`
- `/src/types/forms/form-handlers.ts`

**Instructions**

Files to modify:
- `/src/types/forms/form-handlers.ts`

Remove duplicate `createTypedYupResolver` implementation from form-handlers.ts. Standardize all form hooks to use the primary implementation from form-resolver.ts. Fix type casting inconsistencies in useOpportunityForm and useCoreFormSetup.

#### Task 1.3: Create Zod Infrastructure Layer Depends on [1.2]

**READ THESE BEFORE TASK**
- `/src/lib/form-resolver.ts`
- `/src/components/forms/CRMFormSchemas.tsx`

**Instructions**

Files to modify:
- `/src/lib/form-resolver.ts`

Create `createTypedZodResolver` function using `zodResolver` from `@hookform/resolvers/zod`. Maintain parallel support for both Yup and Zod resolvers during transition. Add Zod-specific transform utilities for patterns like `.optional().or(z.literal(''))`.

### Phase 2: Missing Schema Implementation (Sequential)

#### Task 2.1: Complete Zod Schema Coverage Depends on [1.3]

**READ THESE BEFORE TASK**
- `/src/components/forms/CRMFormSchemas.tsx`
- `/src/types/validation.ts`
- Validation research identified missing schemas

**Instructions**

Files to modify:
- `/src/components/forms/CRMFormSchemas.tsx`

Add missing Zod schemas identified in validation research: Multi-Principal Opportunity Schema, Interaction with Opportunity Creation Schema, Contact Preferred Principal Schema, and Opportunity Product Schema (junction table). These are critical gaps that must be filled before schema migration.

#### Task 2.2: Create Zod Transform Utilities Depends on [2.1]

**READ THESE BEFORE TASK**
- `/src/lib/form-transforms.ts`
- Current FormTransforms integration patterns

**Instructions**

Files to Create:
- `/src/lib/zod-transforms.ts`

Create Zod-specific transform utilities that work with Zod's `.transform()` API. Map existing FormTransforms functions to Zod equivalents. Handle null/undefined normalization patterns and conditional validation helpers for discriminated unions.

### Phase 3: Schema Migration (Limited Parallelization)

#### Task 3.1: Convert Contact Schema Depends on [2.2]

**READ THESE BEFORE TASK**
- `/src/types/contact.types.ts`
- `/src/components/forms/CRMFormSchemas.tsx`
- Conditional validation complexity analysis

**Instructions**

Files to modify:
- `/src/types/contact.types.ts`

Convert contactSchema with organization_mode conditional validation. Use Zod discriminated unions to replace Yup's `.when()` patterns. Maintain all FormTransforms integration. This is a high-complexity schema requiring careful handling of cross-field validation.

#### Task 3.2: Convert Organization Schema Depends on [2.2]

**READ THESE BEFORE TASK**
- `/src/types/organization.types.ts`
- `/src/components/forms/CRMFormSchemas.tsx`

**Instructions**

Files to modify:
- `/src/types/organization.types.ts`

Convert organizationSchema maintaining address validation and relationship fields. Replace `.nullable()` patterns with Zod equivalents. Handle priority levels and enum validations. This can run in parallel with Task 3.1.

#### Task 3.3: Convert Product and Junction Schemas Depends on [2.2]

**READ THESE BEFORE TASK**
- `/src/types/validation.ts`
- Complex principal_mode conditional validation patterns

**Instructions**

Files to modify:
- `/src/types/validation.ts`

Convert productSchema, opportunityProductSchema, and contactPreferredPrincipalSchema. Handle principal_mode conditional validation using discriminated unions. This is high-risk due to complex conditional logic - handle carefully.

#### Task 3.4: Convert Opportunity Schemas Depends on [3.1]

**READ THESE BEFORE TASK**
- `/src/types/opportunity.types.ts`
- Multi-principal opportunity complexity

**Instructions**

Files to modify:
- `/src/types/opportunity.types.ts`

Convert opportunitySchema and multiPrincipalOpportunitySchema (151 lines of complexity). Handle stage/status enums and conditional requirements. Depends on Contact schema completion due to cross-references.

#### Task 3.5: Convert Interaction Schemas Depends on [3.4]

**READ THESE BEFORE TASK**
- `/src/types/interaction.types.ts`
- Opportunity creation mode dependencies

**Instructions**

Files to modify:
- `/src/types/interaction.types.ts`

Convert interactionSchema and interactionWithOpportunitySchema. Handle follow-up conditional validation and priority levels. Depends on Opportunity schemas due to creation mode cross-references.

### Phase 4: Component Integration (Parallel Possible)

#### Task 4.1: Update Form Components Depends on [3.1, 3.2, 3.3, 3.4, 3.5]

**READ THESE BEFORE TASK**
- `/src/components/forms/SimpleForm.tsx`
- `/src/components/forms/BusinessForm.tsx`
- Error handling compatibility analysis

**Instructions**

Files to modify:
- `/src/components/forms/SimpleForm.tsx`
- `/src/components/forms/BusinessForm.tsx`
- `/src/components/forms/FormField.tsx`

Update form components to use `createTypedZodResolver`. Error handling patterns remain compatible. Can run in parallel with Task 4.2.

#### Task 4.2: Update Form Hooks Depends on [3.1, 3.2, 3.3, 3.4, 3.5]

**READ THESE BEFORE TASK**
- `/src/features/contacts/hooks/useContactFormState.ts` (already uses typed resolver)
- `/src/features/opportunities/hooks/useOpportunityForm.ts`
- `/src/hooks/useCoreFormSetup.ts`

**Instructions**

Files to modify:
- `/src/features/opportunities/hooks/useOpportunityForm.ts`
- `/src/hooks/useCoreFormSetup.ts`

Update form hooks to use Zod schemas and resolvers. Replace `yupResolver(schema) as never` patterns. Note that useContactFormState.ts is already using typed resolvers. Can run in parallel with Task 4.1.

### Phase 5: Validation and Cleanup (Sequential)

#### Task 5.1: Run Quality Gates Validation Depends on [4.1, 4.2]

**READ THESE BEFORE TASK**
- `CLAUDE.md` quality gates requirements
- All migrated files

**Instructions**

Run `npm run quality-gates` to ensure no TypeScript errors, ESLint violations, or build failures. Fix any issues before proceeding to dependency cleanup. This is critical - do not remove Yup until all validation passes.

#### Task 5.2: Remove Yup Dependencies Depends on [5.1]

**READ THESE BEFORE TASK**
- `package.json`
- All files importing from 'yup' or using yupResolver

**Instructions**

Files to modify:
- `package.json`
- `package-lock.json`
- All files with yup imports

Remove `yup` dependency from package.json only after all imports are updated. Replace all yup imports with zod imports. Verify no yup references remain. Run final quality gates validation.

## Advice

- **CRITICAL**: TypeScript compilation must pass before any schema migration - the validation research revealed compilation timeouts that will block all subsequent work
- **Sequential Dependencies**: Unlike the original plan, Phase 3 tasks have dependencies due to schema cross-references - Contact must complete before Opportunity, Opportunity before Interaction
- **Missing Zod Coverage**: The existing Zod schemas are incomplete - junction table schemas and multi-principal opportunity schemas must be implemented first
- **Duplicate Code Cleanup**: Remove duplicate resolver implementations before creating Zod equivalents to avoid confusion
- **Quality Gates Enforcement**: Run `npm run quality-gates` after Phase 4 completion and before dependency cleanup - do not remove Yup until validation passes
- **Error Handling Compatibility**: Form error handling patterns are fully compatible - no changes needed to error display components
- **High-Risk Schemas**: Contact (organization creation), Product (principal mode), and Multi-Principal Opportunity schemas have the highest complexity and conditional validation requirements
- **Transform Function Migration**: Existing FormTransforms are compatible with Zod but need wrapper utilities for Zod-specific patterns