# Yup to Zod Migration - Shared Architecture Reference

This migration transforms the CRM's validation system from Yup to Zod while maintaining all existing functionality and type safety. The project currently has both validation libraries installed with comprehensive schemas in both formats, indicating this migration was anticipated. The migration requires converting 27 files with Yup usage, updating React Hook Form integration, and adapting custom transform functions.

## Relevant Files

### Core Validation Schema Files
- `/src/types/validation.ts`: Central schema registry with productSchema and junction table schemas
- `/src/types/contact.types.ts`: Contact validation with complex conditional organization creation logic
- `/src/types/organization.types.ts`: Organization validation with address and relationship handling
- `/src/types/opportunity.types.ts`: Opportunity schemas including multi-principal support
- `/src/types/interaction.types.ts`: Interaction validation with follow-up and opportunity creation modes

### Existing Zod Implementation (Ready for Migration)
- `/src/components/forms/CRMFormSchemas.tsx`: Complete Zod schemas for all entities (550 lines) with advanced patterns
- `/src/lib/aiSchemas.ts`: Zod schemas for AI-powered CSV import features
- `/src/hooks/entity/useEntityForm.ts`: Generic entity form hook with optional Zod validation support

### Form Integration Layer
- `/src/lib/form-resolver.ts`: Custom typed Yup resolver utilities that eliminate 'as any' casting
- `/src/lib/form-transforms.ts`: Reusable transform functions for data normalization (compatible with Zod)
- `/src/lib/form-data-transformer.ts`: Form-to-database conversion utilities
- `/src/components/forms/SimpleForm.tsx`: Declarative form builder using yupResolver
- `/src/components/forms/BusinessForm.tsx`: Multi-section forms with progressive disclosure

### Entity-Specific Form Hooks
- `/src/features/contacts/hooks/useContactFormState.ts`: Contact form state management
- `/src/features/opportunities/hooks/useOpportunityForm.ts`: Opportunity form with step validation
- `/src/hooks/useCoreFormSetup.ts`: Standardized form initialization pattern

### Type Definition Files
- `/src/types/forms/contact-form.types.ts`: Contact form type definitions and defaults
- `/src/types/forms/form-handlers.ts`: Generic form handler interfaces
- `/src/types/forms/organization-form.types.ts`: Organization-specific form types
- `/src/types/forms/opportunity-form.types.ts`: Opportunity form type definitions

## Relevant Tables

- **contacts**: Primary contact entity with decision authority and purchase influence fields
- **organizations**: Organization entity with type, priority, and address relationships
- **opportunities**: Sales pipeline with stages, values, and multi-principal support
- **interactions**: Communication history with follow-up tracking and opportunity creation
- **products**: Product catalog with principal relationships and seasonal attributes
- **contact_preferred_principals**: Junction table for contact-principal advocacy relationships
- **opportunity_products**: Junction table for opportunity-product quantity/pricing

## Relevant Patterns

**Yup Conditional Validation**: Extensive use of `.when()` method for mode-based validation (organization_mode, principal_mode, opportunity_context), requiring conversion to Zod discriminated unions or `.refine()` methods.

**Transform Integration**: Deep integration of FormTransforms utilities (15+ functions) with Yup schemas using `.transform()` method - fully compatible with Zod's transform API.

**Type-Safe Resolvers**: Custom `createTypedYupResolver<T>()` pattern eliminates type casting and maintains strict TypeScript safety - needs Zod equivalent.

**Dual Schema System**: Project already has complete Zod schemas in `CRMFormSchemas.tsx` alongside Yup schemas, indicating migration readiness and allowing validation parity testing.

**Entity-Specific Patterns**: Each business entity (Contact, Organization, Opportunity, Product, Interaction) follows consistent schema structure with required fields, optional transforms, and conditional validation.

**Form-Database Mapping**: Sophisticated transform system handles null/undefined normalization, type conversion (string to number), and business logic (email lowercasing, phone digit extraction, UUID validation).

**Multi-Step Form Support**: Both current Yup implementation and existing Zod schemas support wizard-style forms with step-by-step validation.

## Relevant Docs

**CLAUDE.md**: You _must_ read this when working on TypeScript patterns, form validation standards, and quality gates requirements.

**/.docs/plans/yup-to-zod/yup-architecture.docs.md**: You _must_ read this when working on schema conversion, understanding conditional validation complexity, and migration risk assessment.

**/.docs/plans/yup-to-zod/zod-current.docs.md**: You _must_ read this when working on existing Zod patterns, understanding current implementation gaps, and leveraging existing Zod infrastructure.

**/.docs/plans/yup-to-zod/form-integration.docs.md**: You _must_ read this when working on React Hook Form integration, form component updates, and resolver pattern migration.

**/.docs/plans/yup-to-zod/transforms.docs.md**: You _must_ read this when working on transform function migration, data processing patterns, and maintaining business logic in Zod schemas.

**package.json**: You _must_ read this when working on dependency management, understanding that both yup (1.7.0) and zod (3.25.76) are currently installed for transition period.