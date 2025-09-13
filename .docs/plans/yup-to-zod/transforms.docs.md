# Form Transform Utilities Research Document

## Overview

This document provides a comprehensive analysis of the form transform utilities and data processing patterns in the CRM codebase, focusing on how they integrate with Yup schemas and how they can be adapted for Zod migration.

## Table of Contents

1. [Transform Function Architecture](#transform-function-architecture)
2. [Core Transform Functions](#core-transform-functions)
3. [Integration with Yup Schemas](#integration-with-yup-schemas)
4. [Data Processing Patterns](#data-processing-patterns)
5. [Type Conversion Utilities](#type-conversion-utilities)
6. [Conditional Transform Patterns](#conditional-transform-patterns)
7. [Migration Considerations for Zod](#migration-considerations-for-zod)
8. [Usage Examples](#usage-examples)

---

## Transform Function Architecture

### Location and Structure
- **Main file**: `/src/lib/form-transforms.ts`
- **Supporting files**:
  - `/src/lib/entity-transformers.ts` - Entity-specific transformations
  - `/src/lib/form-data-transformer.ts` - Data conversion between forms and database
  - `/src/lib/form-resolver.ts` - Type-safe resolver utilities

### Design Philosophy
The transform system is designed around several key principles:

1. **Type Safety**: All transforms maintain TypeScript type safety
2. **Null/Undefined Normalization**: Consistent handling of empty values
3. **Form-to-Database Mapping**: Seamless conversion between form inputs and database expectations
4. **Reusability**: Common transforms packaged in reusable functions
5. **Validation Integration**: Deep integration with Yup schema validation

---

## Core Transform Functions

### String Transforms

#### `emptyStringToNull`
```typescript
export const emptyStringToNull = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  return typeof value === 'string' ? value : null
}
```
- **Purpose**: Converts empty strings to null for nullable database fields
- **Usage**: Essential for HTML form inputs that produce empty strings but database expects null
- **Common Pattern**: Used extensively in nullable string fields

#### `trimAndNullify`
```typescript
export const trimAndNullify = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
```
- **Purpose**: Comprehensive string cleaning with whitespace trimming
- **Usage**: Enhanced version of emptyStringToNull with whitespace handling

### Number Transforms

#### `emptyStringToNullNumber`
```typescript
export const emptyStringToNullNumber = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const num = Number(value)
  return isNaN(num) ? null : num
}
```
- **Purpose**: Handles number field conversion from form strings
- **Usage**: Critical for numeric inputs that can be empty

### Specialized Field Transforms

#### Email Normalization
```typescript
export const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  return value.trim().toLowerCase()
}
```
- **Purpose**: Standardizes email format (lowercase, trimmed)
- **Business Logic**: Ensures consistent email storage

#### Phone Number Normalization
```typescript
export const normalizePhone = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')
  return digits === '' ? null : digits
}
```
- **Purpose**: Strips formatting from phone numbers
- **Business Logic**: Stores only digits for consistent querying

#### UUID Validation
```typescript
export const normalizeUuid = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const trimmed = value.trim()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(trimmed) ? trimmed : null
}
```
- **Purpose**: Validates and normalizes UUID format
- **Business Logic**: Ensures proper UUID format for foreign keys

### Array Transforms

#### `ensureArray`
```typescript
export const ensureArray = <T>(value: (T | undefined)[] | T | null | undefined): T[] => {
  if (value === null || value === undefined) {
    return []
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is T => item !== undefined)
  }
  return []
}
```
- **Purpose**: Guarantees array return type, filters undefined values
- **Usage**: Required array fields that should never be null

#### `emptyArrayToNull`
```typescript
export const emptyArrayToNull = <T>(value: T[]): T[] | null => {
  if (Array.isArray(value) && value.length === 0) {
    return null
  }
  return value
}
```
- **Purpose**: Converts empty arrays to null for optional array fields
- **Usage**: Optional array relationships in database

### Boolean Transforms

#### `stringToBoolean`
```typescript
export const stringToBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return Boolean(value)
}
```
- **Purpose**: Handles boolean conversion from form strings
- **Usage**: Form inputs that send boolean values as strings

---

## Integration with Yup Schemas

### Transform Pattern in Schemas
The transforms are integrated into Yup schemas using the `.transform()` method:

```typescript
// From contact.types.ts
email: yup
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be 255 characters or less')
  .nullable()
  .transform(FormTransforms.nullableEmail),
```

### Transform + Validation Flow
1. **Input Value**: Raw form input (string, number, etc.)
2. **Transform**: Applied first to normalize/clean data
3. **Validation**: Applied to transformed value
4. **Type Inference**: TypeScript infers final type from schema

### Common Schema Patterns

#### Nullable String Field
```typescript
field_name: yup
  .string()
  .max(255, 'Field must be 255 characters or less')
  .nullable()
  .transform(FormTransforms.nullableString),
```

#### Required String with Trimming
```typescript
field_name: yup
  .string()
  .required('Field is required')
  .max(100, 'Field must be 100 characters or less')
  .transform(FormTransforms.requiredString),
```

#### Nullable Number Field
```typescript
numeric_field: yup
  .number()
  .min(0, 'Value must be positive')
  .nullable()
  .transform(FormTransforms.nullableNumber),
```

#### UUID Field with Validation
```typescript
entity_id: yup
  .string()
  .uuid('Invalid ID format')
  .nullable()
  .transform(FormTransforms.uuidField),
```

---

## Data Processing Patterns

### Form-to-Database Conversion

#### FormDataTransformer Class
Location: `/src/lib/form-data-transformer.ts`

```typescript
export class FormDataTransformer {
  static toFormData<TFormData>(dbEntity: Record<string, unknown>): Partial<TFormData> {
    const formData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dbEntity)) {
      // Convert null to undefined for optional fields in forms
      formData[key] = value === null ? undefined : value
    }
    return formData as Partial<TFormData>
  }

  static fromFormData(formData: Record<string, unknown>): Record<string, unknown> {
    const dbData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(formData)) {
      // Convert empty strings and undefined to null for database
      if (value === '' || value === undefined) {
        dbData[key] = null
      } else {
        dbData[key] = value
      }
    }
    return dbData
  }
}
```

### Entity-Specific Transformers

#### Organization Transformer
```typescript
export const transformOrganizations = (
  organizations: Array<{
    id: string
    name: string
    type?: string
    segment?: string
  }>
): EntityOption[] => {
  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.type && org.segment ? `${org.type} - ${org.segment}` : org.type || org.segment,
    metadata: { type: org.type, segment: org.segment },
  }))
}
```

---

## Type Conversion Utilities

### Form Resolver Integration

The transform system integrates with React Hook Form through typed resolvers:

```typescript
// From form-resolver.ts
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}
```

### Type Inference Patterns

Yup schemas with transforms generate proper TypeScript types:

```typescript
// Schema definition
export const contactSchema = yup.object({
  first_name: yup.string().required(),
  email: yup.string().nullable().transform(FormTransforms.nullableEmail),
  preferred_principals: yup.array().transform(FormTransforms.optionalArray),
})

// Inferred type
export type ContactFormData = yup.InferType<typeof contactSchema>
// Results in:
// {
//   first_name: string
//   email: string | null
//   preferred_principals: string[]
// }
```

---

## Conditional Transform Patterns

### Conditional Transform Factory

```typescript
export const conditionalTransform = <T, TValues = Record<string, unknown>>(
  condition: (allValues: TValues) => boolean,
  requiredTransform: (value: unknown) => T,
  optionalTransform: (value: unknown) => T | null = (value: unknown) =>
    emptyStringToNull(value) as T | null
) => {
  return function (this: { parent: TValues }, value: unknown) {
    const isRequired = condition(this.parent)
    return isRequired ? requiredTransform(value) : optionalTransform(value)
  }
}
```

### Yup `.when()` Integration

Conditional validation with transforms:

```typescript
// From contact.types.ts
organization_name: yup
  .string()
  .max(255, 'Organization name must be 255 characters or less')
  .nullable()
  .transform(FormTransforms.nullableString)
  .when('organization_mode', {
    is: 'new',
    then: (schema) =>
      schema.required('Organization name is required when creating a new organization'),
  }),
```

### Multi-Field Conditional Logic

```typescript
// From opportunity.types.ts
custom_context: yup
  .string()
  .max(50, 'Custom context must be 50 characters or less')
  .when('opportunity_context', {
    is: 'Custom',
    then: (schema) => schema.required('Custom context is required when selecting Custom'),
    otherwise: (schema) => schema.nullable(),
  }),
```

---

## Migration Considerations for Zod

### Transform Equivalents in Zod

Zod uses a different API for transforms:

#### Yup Transform Pattern
```typescript
yup.string().nullable().transform(FormTransforms.nullableString)
```

#### Zod Equivalent
```typescript
z.string().nullable().transform((val) => FormTransforms.nullableString(val))
```

### Key Differences

1. **Transform Syntax**: Zod uses `.transform()` method with callback function
2. **Type Inference**: Zod's type inference is more sophisticated
3. **Conditional Logic**: Zod uses `.refine()` and discriminated unions instead of `.when()`
4. **Default Values**: Zod uses `.default()` method

### Migration Strategy for Common Patterns

#### 1. Nullable String Fields
```typescript
// Yup
yup.string().nullable().transform(FormTransforms.nullableString)

// Zod
z.string().nullable().transform(FormTransforms.nullableString)
```

#### 2. Conditional Required Fields
```typescript
// Yup
yup.string()
  .nullable()
  .when('mode', {
    is: 'new',
    then: (schema) => schema.required('Required when mode is new')
  })

// Zod (using discriminated union)
z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('new'), field: z.string() }),
  z.object({ mode: z.literal('existing'), field: z.string().nullable() })
])
```

#### 3. Array Transforms
```typescript
// Yup
yup.array().transform(FormTransforms.optionalArray)

// Zod
z.array(z.string()).transform(FormTransforms.optionalArray)
```

### Transform Function Compatibility

The existing transform functions are compatible with Zod and can be reused:

```typescript
// Current transform functions work with Zod
const zodSchema = z.object({
  email: z.string().transform(FormTransforms.nullableEmail),
  phone: z.string().transform(FormTransforms.normalizePhone),
  uuid_field: z.string().transform(FormTransforms.normalizeUuid),
})
```

---

## Usage Examples

### Contact Form Schema (Current Yup)
```typescript
export const contactSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),

  email: yup
    .string()
    .email('Invalid email address')
    .nullable()
    .transform(FormTransforms.nullableEmail),

  phone: yup
    .string()
    .nullable()
    .transform(FormTransforms.nullablePhone),

  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .nullable()
    .transform(FormTransforms.nullableString),

  preferred_principals: yup
    .array()
    .of(yup.string().uuid())
    .transform(FormTransforms.optionalArray),
})
```

### Opportunity Form with Conditional Logic
```typescript
export const opportunitySchema = yup.object({
  name: yup.string().required('Opportunity name is required'),

  estimated_value: yup
    .number()
    .min(0, 'Value must be positive')
    .required('Estimated value is required')
    .transform(FormTransforms.nullableNumber),

  contact_id: yup
    .string()
    .uuid('Invalid contact ID')
    .nullable()
    .transform(FormTransforms.uuidField),

  opportunity_context: yup
    .string()
    .oneOf(['Site Visit', 'Food Show', 'Custom'], 'Invalid context')
    .nullable()
    .transform(FormTransforms.nullableString),

  custom_context: yup
    .string()
    .when('opportunity_context', {
      is: 'Custom',
      then: (schema) => schema.required('Custom context required'),
      otherwise: (schema) => schema.nullable(),
    }),
})
```

### Form Data Processing Flow
```typescript
// 1. Raw form data from React Hook Form
const formData = {
  name: 'Test Opportunity',
  estimated_value: '5000', // String from input
  contact_id: '', // Empty string from unselected dropdown
  notes: '   ', // Whitespace-only string
}

// 2. Yup transforms applied during validation
const validatedData = opportunitySchema.validateSync(formData)
// Results in:
// {
//   name: 'Test Opportunity',
//   estimated_value: 5000, // Converted to number
//   contact_id: null, // Empty string converted to null
//   notes: null, // Whitespace converted to null
// }

// 3. Database insertion
await supabase.from('opportunities').insert(validatedData)
```

---

## Recommendations

### For Zod Migration

1. **Preserve Transform Functions**: The existing transform functions can be reused with Zod
2. **Update Conditional Logic**: Replace `.when()` with Zod's discriminated unions
3. **Maintain Type Safety**: Leverage Zod's superior type inference
4. **Gradual Migration**: Migrate schema by schema to avoid breaking changes
5. **Test Coverage**: Ensure all transform behaviors are covered by tests

### Best Practices

1. **Consistent Null Handling**: Always use transforms for nullable fields
2. **Business Logic in Transforms**: Keep data normalization logic in transforms
3. **Type Safety First**: Maintain strict TypeScript typing throughout
4. **Reusable Patterns**: Use the FormTransforms object for common cases
5. **Documentation**: Document complex conditional logic clearly

---

## File Dependencies

- `/src/lib/form-transforms.ts` - Core transform functions
- `/src/lib/entity-transformers.ts` - Entity-specific transformations
- `/src/lib/form-data-transformer.ts` - Form/database conversion utilities
- `/src/lib/form-resolver.ts` - Type-safe resolver helpers
- `/src/types/contact.types.ts` - Contact schema with transforms
- `/src/types/organization.types.ts` - Organization schema with transforms
- `/src/types/opportunity.types.ts` - Opportunity schema with transforms
- `/src/types/interaction.types.ts` - Interaction schema with transforms
- `/src/types/validation.ts` - Consolidated validation schemas

This comprehensive transform system provides a solid foundation for data processing and validation that can be successfully migrated to Zod while preserving all existing functionality and type safety.