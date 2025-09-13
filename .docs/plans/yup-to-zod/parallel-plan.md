# Yup to Zod Migration - Parallel Implementation Plan

This migration converts the CRM's validation system from Yup to Zod while maintaining all existing functionality. The project already has comprehensive Zod schemas alongside Yup schemas, indicating this migration was planned. The task involves converting 27 files with Yup usage, updating React Hook Form integration from yupResolver to zodResolver, and adapting 15+ transform functions to Zod's API while preserving complex conditional validation logic.

## Critically Relevant Files and Documentation

- `/src/types/validation.ts` - Central schema registry requiring Zod conversion
- `/src/components/forms/CRMFormSchemas.tsx` - Complete Zod schemas (ready to integrate)
- `/src/lib/form-resolver.ts` - Custom typed resolver utilities needing Zod equivalent
- `/src/lib/form-transforms.ts` - Transform functions compatible with Zod
- `/.docs/plans/yup-to-zod/shared.md` - Architecture overview and file references
- `/.docs/plans/yup-to-zod/yup-architecture.docs.md` - Current Yup implementation analysis
- `/.docs/plans/yup-to-zod/zod-current.docs.md` - Existing Zod patterns and readiness assessment

## Implementation Plan

### Phase 1: Foundation Infrastructure

#### Task 1.1: Create Zod Form Resolver Utilities Depends on [none]

**READ THESE BEFORE TASK**
- `/src/lib/form-resolver.ts`
- `/src/components/forms/CRMFormSchemas.tsx`
- `/.docs/plans/yup-to-zod/form-integration.docs.md`

**Instructions**

Files to modify:
- `/src/lib/form-resolver.ts`

Convert `createTypedYupResolver` to `createTypedZodResolver` using `zodResolver` from `@hookform/resolvers/zod`. Maintain identical type safety patterns and eliminate type casting. Update import statements and interface definitions. Keep backward compatibility by maintaining both resolvers during transition.

#### Task 1.2: Adapt Form Transforms for Zod API Depends on [none]

**READ THESE BEFORE TASK**
- `/src/lib/form-transforms.ts`
- `/.docs/plans/yup-to-zod/transforms.docs.md`

**Instructions**

Files to modify:
- `/src/lib/form-transforms.ts`

Update transform function integration to work with Zod's `.transform()` method. All existing functions (emptyStringToNull, normalizeEmail, etc.) are compatible with Zod and should be preserved. Add utility functions for Zod-specific patterns like `.optional().or(z.literal(''))` replacements for nullable fields.

### Phase 2: Core Schema Migration

#### Task 2.1: Convert Product and Junction Table Schemas Depends on [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/types/validation.ts`
- `/src/components/forms/CRMFormSchemas.tsx`
- `/.docs/plans/yup-to-zod/yup-architecture.docs.md`

**Instructions**

Files to modify:
- `/src/types/validation.ts`

Convert productSchema, opportunityProductSchema, and contactPreferredPrincipalSchema from Yup to Zod. Handle complex conditional validation for principal_mode using Zod discriminated unions or `.refine()` methods. Maintain all FormTransforms integration. Preserve type exports using `z.infer<>` instead of `yup.InferType<>`.

#### Task 2.2: Convert Contact Schema Depends on [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/types/contact.types.ts`
- `/src/components/forms/CRMFormSchemas.tsx`
- `/.docs/plans/yup-to-zod/yup-architecture.docs.md`

**Instructions**

Files to modify:
- `/src/types/contact.types.ts`

Convert contactSchema with complex conditional validation for organization_mode fields. Replace Yup's `.when()` patterns with Zod equivalents using discriminated unions. Maintain all FormTransforms integration and role-based validation. Update type inference to use `z.infer<typeof contactSchema>`.

#### Task 2.3: Convert Organization Schema Depends on [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/types/organization.types.ts`
- `/src/components/forms/CRMFormSchemas.tsx`

**Instructions**

Files to modify:
- `/src/types/organization.types.ts`

Convert organizationSchema maintaining all validation rules and transforms. Handle address validation, priority levels, and relationship fields. Replace `.nullable()` patterns with appropriate Zod equivalents. Preserve enum validations and business logic.

#### Task 2.4: Convert Opportunity Schemas Depends on [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/types/opportunity.types.ts`
- `/src/components/forms/CRMFormSchemas.tsx`
- `/.docs/plans/yup-to-zod/yup-architecture.docs.md`

**Instructions**

Files to modify:
- `/src/types/opportunity.types.ts`

Convert opportunitySchema and multiPrincipalOpportunitySchema with their complex validation logic. Handle stage progression validation and context-based conditional requirements. Convert array validation patterns and maintain cross-field validation using `.refine()` methods.

#### Task 2.5: Convert Interaction Schemas Depends on [1.1, 1.2]

**READ THESE BEFORE TASK**
- `/src/types/interaction.types.ts`
- `/src/components/forms/CRMFormSchemas.tsx`

**Instructions**

Files to modify:
- `/src/types/interaction.types.ts`

Convert interactionSchema and interactionWithOpportunitySchema. Handle follow-up conditional validation and priority level validation. Maintain opportunity creation logic and account manager validation patterns.

### Phase 3: Form Integration Updates

#### Task 3.1: Update Core Form Components Depends on [2.1, 2.2, 2.3, 2.4, 2.5]

**READ THESE BEFORE TASK**
- `/src/components/forms/SimpleForm.tsx`
- `/src/components/forms/BusinessForm.tsx`
- `/.docs/plans/yup-to-zod/form-integration.docs.md`

**Instructions**

Files to modify:
- `/src/components/forms/SimpleForm.tsx`
- `/src/components/forms/BusinessForm.tsx`
- `/src/components/forms/FormField.tsx`

Update form components to use `createTypedZodResolver` instead of `yupResolver`. Replace validation schema props with Zod schemas. Ensure error handling patterns remain consistent with existing ValidationFeedback components.

#### Task 3.2: Update Entity Form Hooks Depends on [2.1, 2.2, 2.3, 2.4, 2.5]

**READ THESE BEFORE TASK**
- `/src/features/contacts/hooks/useContactFormState.ts`
- `/src/features/opportunities/hooks/useOpportunityForm.ts`
- `/src/hooks/useCoreFormSetup.ts`
- `/.docs/plans/yup-to-zod/form-integration.docs.md`

**Instructions**

Files to modify:
- `/src/features/contacts/hooks/useContactFormState.ts`
- `/src/features/opportunities/hooks/useOpportunityForm.ts`
- `/src/hooks/useCoreFormSetup.ts`

Update all form hooks to use Zod schemas and resolvers. Replace `yupResolver(schema) as never` patterns with proper typed Zod resolvers. Maintain all existing form state management and validation logic.

### Phase 4: Cleanup and Validation

#### Task 4.1: Remove Yup Dependencies Depends on [3.1, 3.2]

**READ THESE BEFORE TASK**
- `package.json`
- `/.docs/plans/yup-to-zod/yup-architecture.docs.md`

**Instructions**

Files to modify:
- `package.json`
- `package-lock.json`

Remove `yup` dependency from package.json. Ensure `@hookform/resolvers` package includes Zod support (it does in v5.2.1). Run `npm install` to update lock file and remove Yup from node_modules.

#### Task 4.2: Final Import Cleanup and Validation Depends on [4.1]

**READ THESE BEFORE TASK**
- All schema files
- All form component files

**Instructions**

Files to modify:
- All files previously importing from 'yup'
- All files importing yupResolver

Remove all Yup imports and replace with Zod imports. Update any remaining `import * as yup from 'yup'` statements. Verify no Yup references remain in codebase. Run `npm run quality-gates` to ensure no TypeScript errors or build failures.

## Advice

- **Existing Zod Schemas**: The project already has comprehensive Zod schemas in `CRMFormSchemas.tsx` - reference these for patterns and potentially merge with converted schemas to avoid duplication
- **Transform Function Compatibility**: The existing FormTransforms utilities work directly with Zod's `.transform()` method with no modification needed
- **Conditional Validation Complexity**: Yup's `.when()` method has no direct Zod equivalent - use discriminated unions for mode-based validation or `.refine()` for complex conditions
- **Type Inference Changes**: Replace `yup.InferType<T>` with `z.infer<T>` but note that Zod's inference is stricter and may reveal type issues previously hidden
- **Dual Schema Testing**: During migration, both Yup and Zod schemas exist - use this to validate identical behavior before removing Yup
- **Quality Gates**: Run `npm run quality-gates` after each phase to catch TypeScript errors, build issues, or test failures early
- **Migration Risk Areas**: Most complex schemas are Contact (organization creation mode), Product (principal mode), and Multi-Principal Opportunity - handle these carefully
- **Form Component Impact**: Form components are resolver-agnostic and require minimal changes - focus migration effort on schema conversion and hook updates