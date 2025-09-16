# Yup to Zod Migration - Architecture Overview

The CRM system uses an extensive Yup-based validation system across 5 core entities with sophisticated form transforms, conditional validation, and deep React Hook Form integration. The migration to Zod requires careful handling of complex conditional patterns, custom transform utilities, and cross-entity validation logic while leveraging existing Zod infrastructure in the layout system.

## Relevant Files

### Core Entity Validation Schemas (Yup - Migration Required)
- `/src/types/validation.ts`: Central validation exports and Product schema with principal mode switching
- `/src/types/contact.types.ts`: Contact validation with 18+ fields, conditional organization creation logic
- `/src/types/organization.types.ts`: Organization validation with address fields and type-based boolean flags
- `/src/types/opportunity.types.ts`: Complex opportunity validation with stage management and multi-principal support
- `/src/types/interaction.types.ts`: Interaction validation with priority system and conditional follow-up logic

### Form System Architecture (Yup - Migration Required)
- `/src/components/forms/SimpleForm.tsx`: Declarative form builder using yupResolver
- `/src/components/forms/BusinessForm.tsx`: Advanced multi-section form with yupResolver integration
- `/src/components/forms/FormField.tsx`: Field wrapper component consuming Yup validation schemas
- `/src/hooks/useCoreFormSetup.ts`: Central form setup hook with yupResolver and FormTransforms
- `/src/features/opportunities/hooks/useOpportunityForm.ts`: Complex form hook with step validation

### Transform System (Yup - Critical Migration Point)
- `/src/lib/form-transforms.ts`: Comprehensive transform utilities with 15+ transform functions for nullable fields
- `/src/lib/form-resolver.ts`: Typed Yup resolver creation (needs createTypedZodResolver implementation)

### Existing Zod Infrastructure (Reference Patterns)
- `/src/lib/layout/validation.ts`: Complete Zod validation system with discriminated unions and error handling
- `/src/components/forms/CRMFormSchemas.tsx`: Entity validation schemas using established Zod patterns
- `/src/components/forms/SchemaForm.tsx`: Schema-driven form component with partial Zod integration
- `/src/lib/aiSchemas.ts`: AI integration schemas demonstrating Zod type inference patterns
- `/src/lib/layout/form-generator.ts`: Dynamic form generation with Zod schema introspection

## Relevant Tables

- `organizations`: Root entity with self-referencing relationships, manager assignments
- `contacts`: Links to organizations, supports preferred principal relationships
- `products`: Principal-dependent entities with seasonal and inventory attributes
- `opportunities`: Complex multi-entity relationships (organization, contact, principals, distributors)
- `interactions`: Highest dependency chain, can create opportunities dynamically
- `contact_preferred_principals`: Junction table for contact-principal advocacy relationships
- `opportunity_participants`: Multi-principal opportunity support
- `opportunity_products`: Product-opportunity relationships

## Relevant Patterns

**Entity-Based Schema Organization**: Individual schema files per entity with re-exports in validation.ts, enabling clear separation of concerns and maintainable validation logic per domain - see `/src/types/contact.types.ts`

**Transform-Driven Data Normalization**: Extensive use of `.transform()` methods with standardized FormTransforms functions for consistent nullable field handling (80%+ of nullable fields) - see `/src/lib/form-transforms.ts`

**Conditional Validation with .when()**: Complex conditional logic using Yup's `.when()` method for mode-switching behavior like organization creation in contacts and principal modes in products - see `/src/types/contact.types.ts:158-174`

**Type-Safe Form Integration**: `yup.InferType<>` for automatic TypeScript type generation with seamless React Hook Form integration via yupResolver - see all entity schema type exports

**Schema Composition Patterns**: Field inheritance and overrides in complex schemas like multiPrincipalOpportunitySchema using schema.fields spreading - see `/src/types/opportunity.types.ts:148-250`

**Validation Class Architecture**: Static method patterns for reusable validation with structured error reporting (LayoutValidator as reference) - see `/src/lib/layout/validation.ts:378-577`

**Discriminated Union Validation**: Complex schema differentiation based on type fields, proven pattern in existing Zod layout schemas - see `/src/lib/layout/validation.ts:269-273`

**Cross-Entity Validation Flow**: Forms support dynamic entity creation (contacts can create organizations, interactions can create opportunities) with conditional validation chains

## Relevant Docs

**`.docs/plans/yup-to-zod-migration/yup-patterns.docs.md`**: You _must_ read this when working on schema migration strategy, understanding current validation complexity, and identifying transform system dependencies.

**`.docs/plans/yup-to-zod-migration/zod-patterns.docs.md`**: You _must_ read this when working on leveraging existing Zod infrastructure, implementing the missing createTypedZodResolver, and following established validation patterns.

**`.docs/plans/yup-to-zod-migration/form-architecture.docs.md`**: You _must_ read this when working on form component updates, React Hook Form integration changes, and understanding validation flow touchpoints.

**`.docs/plans/yup-to-zod-migration/entity-dependencies.docs.md`**: You _must_ read this when working on migration sequencing, risk assessment, and understanding cross-entity validation dependencies.

**/src/components/forms/README.md**: You _must_ read this when working on form component integration and understanding current form patterns.

**/docs/STATE_MANAGEMENT_GUIDE.md**: You _must_ read this when working on form state management and understanding TanStack Query vs Zustand separation.

**/docs/DEVELOPMENT_WORKFLOW.md**: You _must_ read this when working on testing strategy and validation pipeline integration.