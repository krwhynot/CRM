# Simplified Zod-Only Architecture

The current CRM system uses a sophisticated dual validation architecture that can be dramatically simplified by completing the Zod migration and removing the complex Yup compatibility layers. This simplification will eliminate 443 lines of orchestration logic, reduce the bundle size by removing dual validation libraries, and provide a single, clear validation pattern throughout the codebase.

## Relevant Files

### Core Validation Infrastructure
- `/src/types/validation.ts`: Central validation exports with dual system orchestration (443 lines of complex logic)
- `/src/lib/form-resolver.ts`: Zod-only resolver implementations with missing dual support functions
- `/src/lib/form-transforms.ts`: Comprehensive Zod transformation utilities (220 lines, preserve and enhance)
- `/src/hooks/useCoreFormSetup.ts`: Layout-driven form setup hook (Zod-only, preserve architecture)

### Entity Schema Files (Dual Pattern)
- `/src/types/contact.zod.ts`: Complete Zod schema with discriminated unions
- `/src/types/contact.types.ts`: Legacy Yup + Zod re-exports + database types
- `/src/types/organization.zod.ts`: Advanced Zod schema with business logic validation
- `/src/types/organization.types.ts`: Legacy Yup + Zod re-exports + food service segments
- `/src/types/opportunity.zod.ts`: Complex multi-principal Zod validation
- `/src/types/opportunity.types.ts`: Legacy Yup + Zod re-exports + display constants
- `/src/types/interaction.zod.ts`: Zod schema with opportunity relationships
- `/src/types/interaction.types.ts`: Legacy Yup + Zod re-exports + database relationships
- `/src/types/product.zod.ts`: Pure Zod implementation (exception, no legacy file)

### Form Components (Mixed Complexity)
- `/src/components/forms/SimpleForm.tsx`: Declarative form builder with FieldConfig arrays
- `/src/components/forms/FormField.enhanced.tsx`: Comprehensive field component (12+ input types)
- `/src/components/forms/examples/DualValidationExample.tsx`: Complex abstraction to eliminate
- `/src/components/forms/ContactForm.generated.tsx`: Direct React Hook Form + Zod (target pattern)
- `/src/features/contacts/hooks/useContactFormState.ts`: Legacy Yup-only hook requiring migration

### Type System Organization
- `/src/types/index.ts`: Main export file with namespace management
- `/src/types/forms/form-handlers.ts`: Yup resolver types and form interfaces (210 lines)
- `/src/types/forms/index.ts`: Centralized form type exports with default value factories

## Relevant Tables
- All CRM entities (contacts, organizations, opportunities, interactions, products) use Supabase database with UUID primary keys and soft deletes

## Relevant Patterns

**Dual Validation System**: Runtime schema switching via `ValidationSchemaRegistry.getSchema()` with 7 migration flags controlling Yup vs Zod selection per entity - eliminates when simplified to Zod-only

**Schema Detection Pattern**: `isZodSchema()` and `isYupSchema()` type guards enabling automatic resolver selection - can be completely removed in simplified architecture

**Layout-Driven Forms**: Section-based form rendering using `useCoreFormSetup` with responsive layouts and conditional fields - preserve as core architecture strength

**Form Transform Utilities**: `ZodTransforms` with 15+ transform utilities for nullable fields, email normalization, and conditional validation - preserve and enhance as core Zod pattern

**Generated Form Pattern**: Direct React Hook Form + Zod implementation in generated components - target pattern for all forms after simplification

**Migration Flag Control**: `MIGRATION_FLAGS` object with per-entity granular control (all currently `true` except `useZodForContactPreferredPrincipal: false`) - remove entirely after completing final migration

**Complex Re-Export Chains**: Three different import patterns for same validation logic through `validationSchemas`, `recommendedSchemas`, and direct imports - simplify to single direct import pattern

## Relevant Docs

**`.docs/plans/zod-architecture-simplification/validation-patterns.docs.md`**: You must read this when working on validation system simplification, dual validation removal, and resolver consolidation.

**`.docs/plans/zod-architecture-simplification/schema-organization.docs.md`**: You must read this when working on schema file consolidation, type system cleanup, and migration completion.

**`.docs/plans/zod-architecture-simplification/form-components.docs.md`**: You must read this when working on form component updates, hook migration, and preserving layout-driven architecture.

**/src/lib/form-transforms.ts**: Critical reference for Zod transform patterns and utilities that should be preserved and enhanced during simplification.

**/src/components/forms/SimpleForm.tsx**: Core form builder pattern to preserve while removing dual validation support.

**CLAUDE.md**: Project overview with current layout-driven architecture emphasis and development commands for validation pipeline.