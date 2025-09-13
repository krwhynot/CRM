# Yup Validation Architecture - Current State Analysis

**Project**: Production CRM system for Master Food Brokers
**Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui + Tailwind CSS
**Current Yup Version**: 1.7.0
**React Hook Form Version**: 7.62.0

## Executive Summary

The CRM system currently uses Yup as its primary validation library, deeply integrated with React Hook Form via `@hookform/resolvers`. The validation architecture is feature-based and modular, with each business entity having its own validation schemas, type definitions, and form resolvers.

### Key Statistics
- **Total Files with Yup**: 27 files
- **Core Schema Files**: 5 main entity schemas
- **Schema Complexity**: High (conditional validation, transforms, cross-field validation)
- **Type Safety**: Full type inference with `yup.InferType<T>`
- **Integration Depth**: Deep integration with forms, transforms, and resolvers

## Directory Structure & File Locations

### Core Validation Schema Files

#### `/src/types/validation.ts` - Central Schema Registry
**Purpose**: Central import/export hub for all validation schemas
**Complexity**: Medium
**Key Patterns**:
```typescript
// Re-exports from individual entity files
import { contactSchema } from './contact.types'
import { organizationSchema } from './organization.types'

// Main product schema with conditional validation
export const productSchema = yup.object({
  principal_id: yup
    .string()
    .uuid('Invalid principal ID')
    .when('principal_mode', {
      is: 'existing',
      then: (schema) => schema.required('Principal organization is required'),
      otherwise: (schema) => schema.nullable(),
    })
})
```

#### `/src/types/contact.types.ts` - Contact Entity Validation
**Purpose**: Contact form validation with organization creation mode
**Complexity**: High
**Key Features**:
- Complex conditional validation for organization creation
- Role-based validation with enum constraints
- Transform integration for data normalization
- Type inference: `ContactFormData = yup.InferType<typeof contactSchema>`

#### `/src/types/organization.types.ts` - Organization Entity Validation
**Purpose**: Organization form validation
**Complexity**: Medium
**Key Features**:
- Address validation (multi-field)
- Priority and type enum validation
- Extensive transform usage for nullable fields

#### `/src/types/opportunity.types.ts` - Opportunity Entity Validation
**Purpose**: Complex opportunity validation with multi-principal support
**Complexity**: Very High
**Key Features**:
- Two separate schemas: `opportunitySchema` and `multiPrincipalOpportunitySchema`
- Stage progression validation
- Custom context conditional validation
- Array validation for multiple principals

#### `/src/types/interaction.types.ts` - Interaction Entity Validation
**Purpose**: Interaction logging with opportunity creation
**Complexity**: High
**Key Features**:
- Follow-up conditional validation
- Priority level validation (A+ through D)
- Account manager validation
- Complex nested object validation for principals

### Form Integration Files

#### `/src/lib/form-resolver.ts` - Type-Safe Resolver Factory
**Purpose**: Eliminates 'as any' casting in form resolvers
**Key Pattern**:
```typescript
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}
```

#### `/src/lib/form-transforms.ts` - Data Transform Utilities
**Purpose**: Reusable transform functions for Yup schemas
**Complexity**: Medium
**Transform Categories**:
- String normalization (`emptyStringToNull`, `trimAndNullify`)
- Type conversion (`emptyStringToNullNumber`, `stringToBoolean`)
- Specialized transforms (`normalizePhone`, `normalizeEmail`, `normalizeUuid`)
- Array handling (`ensureArray`, `emptyArrayToNull`)

### Form Component Integration

#### `/src/components/forms/FormField.tsx` - Form Field Wrapper
**Integration**: Uses Yup validation through React Hook Form control
**Pattern**: Schema validation errors displayed via `<FormMessage />`

#### `/src/lib/validation-messages.ts` - Centralized Error Messages
**Purpose**: Consistent validation error messages
**Integration**: Used within Yup schema definitions

## Schema Complexity Analysis

### Validation Patterns by Complexity

#### Basic Validation (Low Complexity)
```typescript
name: yup
  .string()
  .required('Organization name is required')
  .max(255, 'Name must be 255 characters or less')
```

#### Transform Integration (Medium Complexity)
```typescript
email: yup
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be 255 characters or less')
  .nullable()
  .transform(FormTransforms.nullableEmail)
```

#### Conditional Validation (High Complexity)
```typescript
organization_name: yup
  .string()
  .max(255, 'Organization name must be 255 characters or less')
  .nullable()
  .transform(FormTransforms.nullableString)
  .when('organization_mode', {
    is: 'new',
    then: (schema) =>
      schema.required('Organization name is required when creating a new organization'),
  })
```

#### Complex Conditional with Multiple Fields (Very High Complexity)
```typescript
custom_context: yup
  .string()
  .max(50, 'Custom context must be 50 characters or less')
  .when('opportunity_context', {
    is: 'Custom',
    then: (schema) => schema.required('Custom context is required when selecting Custom'),
    otherwise: (schema) => schema.nullable(),
  })
```

### Conditional Validation Patterns

The system heavily uses `.when()` for conditional validation:

1. **Mode-based validation** (organization_mode, principal_mode)
2. **Context-based validation** (opportunity_context)
3. **Boolean flag validation** (follow_up_required, create_opportunity)

#### Most Complex Example - Product Schema Principal Mode
```typescript
principal_id: yup
  .string()
  .uuid('Invalid principal ID')
  .when('principal_mode', {
    is: 'existing',
    then: (schema) => schema.required('Principal organization is required'),
    otherwise: (schema) => schema.nullable(),
  }),
principal_name: yup
  .string()
  .max(255, 'Principal name must be 255 characters or less')
  .when('principal_mode', {
    is: 'new',
    then: (schema) => schema.required('Principal name is required'),
    otherwise: (schema) => schema.nullable(),
  })
```

## Type Inference Patterns

### Primary Type Inference Pattern
All schemas use `yup.InferType<T>` for type generation:

```typescript
// Schema definition
export const contactSchema = yup.object({ /* ... */ })

// Type inference
export type ContactFormData = yup.InferType<typeof contactSchema>

// Re-export in validation.ts
export type { ContactFormData } from './contact.types'
```

### Complex Type Relationships
```typescript
// Supporting schemas with relationships
export const opportunityProductSchema = yup.object({
  opportunity_id: yup.string().uuid().required(),
  product_id: yup.string().uuid().required(),
  // ...
})

export type OpportunityProductFormData = yup.InferType<typeof opportunityProductSchema>
```

## React Hook Form Integration

### Standard Integration Pattern
```typescript
// In form hooks
import { createTypedYupResolver } from '@/lib/form-resolver'
import { contactSchema, type ContactFormData } from '@/types/contact.types'

const form = useForm<ContactFormData>({
  resolver: createTypedYupResolver<ContactFormData>(contactSchema),
  defaultValues: { /* ... */ }
})
```

### Alternative Integration (Legacy)
```typescript
// Direct yupResolver usage (found in useCoreFormSetup.ts)
import { yupResolver } from '@hookform/resolvers/yup'

const form = useForm<T>({
  resolver: yupResolver(formSchema) as never, // Type casting used
  defaultValues: initialData as DefaultValues<T>,
})
```

## Custom Validation Methods

### Transform Functions (FormTransforms)

The system uses extensive transform functions rather than custom Yup methods:

```typescript
export const FormTransforms = {
  nullableString: emptyStringToNull,
  requiredString: (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('Value is required')
    }
    return value.trim()
  },
  nullableNumber: emptyStringToNullNumber,
  nullableEmail: normalizeEmail,
  nullablePhone: normalizePhone,
  nullableUrl: emptyStringToNullUrl,
  optionalArray: ensureArray,
  nullableArray: emptyArrayToNull,
  booleanField: stringToBoolean,
  uuidField: normalizeUuid,
}
```

### Usage Pattern in Schemas
```typescript
email: yup
  .string()
  .email('Invalid email address')
  .nullable()
  .transform(FormTransforms.nullableEmail)
```

## Dependencies & Imports

### Core Yup Dependencies
```json
{
  "yup": "^1.7.0",
  "@hookform/resolvers": "^5.2.1",
  "react-hook-form": "^7.62.0"
}
```

### Import Patterns
```typescript
// Standard import
import * as yup from 'yup'

// Type imports
import type { Database } from '../lib/database.types'

// Transform imports
import { FormTransforms } from '../lib/form-transforms'

// Resolver imports
import { createTypedYupResolver } from '@/lib/form-resolver'
```

## Form Configuration & Default Values

### Default Values Pattern
Each entity has corresponding default value definitions:

```typescript
// /src/types/forms/contact-form.types.ts
export const defaultContactFormValues: ContactFormData = {
  // Required fields
  first_name: '',
  last_name: '',
  organization_id: '',
  purchase_influence: 'Unknown',
  decision_authority: 'Gatekeeper',

  // Optional fields - using null for nullable schema fields
  email: null,
  title: null,
  // ...
}
```

### Type Guards
```typescript
export const isContactFormData = (data: unknown): data is ContactFormData => {
  return Boolean(
    data &&
    typeof data === 'object' &&
    data !== null &&
    'first_name' in data &&
    // ... additional checks
  )
}
```

## Business Domain Validation

### Enum Validations
```typescript
// Priority validation
priority: yup
  .string()
  .oneOf(['A', 'B', 'C', 'D'] as const, 'Invalid priority level')
  .required('Priority is required')

// Organization type validation
type: yup
  .string()
  .oneOf(
    ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const,
    'Invalid organization type'
  )
```

### Business Logic Validation
```typescript
// Contact role with business context
decision_authority: yup
  .string()
  .oneOf(
    ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper'] as const,
    'Invalid decision authority role'
  )
  .required('Decision authority is required')
  .default('Gatekeeper')
```

## Schema Relationships & Dependencies

### Cross-Schema Dependencies
```typescript
// Opportunity depends on Organization and Contact
export const opportunitySchema = yup.object({
  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),
  contact_id: yup
    .string()
    .uuid('Invalid contact ID')
    .nullable(),
  // ...
})
```

### Junction Table Schemas
```typescript
// Many-to-many relationship validation
export const opportunityProductSchema = yup.object({
  opportunity_id: yup.string().uuid().required(),
  product_id: yup.string().uuid().required(),
  quantity: yup.number().positive().required(),
  // ...
})
```

## Migration Considerations

### High-Risk Areas for Zod Migration
1. **Complex conditional validation** - `.when()` patterns
2. **Transform functions** - Data normalization logic
3. **Type inference** - `yup.InferType<T>` replacement
4. **Resolver integration** - `@hookform/resolvers` patterns
5. **Default value alignment** - Schema-to-defaults consistency

### Medium-Risk Areas
1. **Enum validations** - Direct translation possible
2. **Basic string/number validation** - Straightforward conversion
3. **Required/optional patterns** - Similar concepts in Zod

### Low-Risk Areas
1. **Error messages** - Direct message replacement
2. **Basic type validation** - Similar patterns exist in Zod

## Technical Debt & Patterns to Address

### Type Casting Issues
```typescript
// Found in useCoreFormSetup.ts - should be eliminated
resolver: yupResolver(formSchema) as never,
defaultValues: initialData as DefaultValues<T>,
```

### Inconsistent Resolver Usage
- Some files use `createTypedYupResolver()` (preferred)
- Others use direct `yupResolver()` with type casting

### Transform vs Validation Mixing
Some transforms handle both data conversion and validation, which could be separated in Zod migration.

## Conclusion

The current Yup architecture is sophisticated and deeply integrated, with high usage of:
- Conditional validation patterns
- Data transform functions
- Type inference
- Cross-field validation
- Business domain validation

The migration to Zod will require careful planning to maintain the same level of functionality while improving type safety and reducing complexity where possible.

**Next Steps**:
1. Zod schema equivalency mapping
2. Transform function conversion strategy
3. Conditional validation pattern migration
4. Type inference pattern updates
5. React Hook Form resolver updates