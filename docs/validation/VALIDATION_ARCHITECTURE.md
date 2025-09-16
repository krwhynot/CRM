# Validation Architecture Guide

This guide documents the simplified Zod-only validation architecture implemented in the CRM system. The architecture has been streamlined to use Zod exclusively, eliminating the complexity of dual validation systems and providing a unified, performant validation layer.

## Overview

The CRM system uses **Zod** as the exclusive validation library, providing superior TypeScript integration, excellent performance, and powerful validation patterns. The architecture has been simplified to use consolidated schemas with unified type definitions.

## Core Architecture

### Validation Schema Organization

```
src/types/
├── *.types.ts            # Consolidated entity schemas and type definitions
├── validation.ts         # Simplified central exports (Zod-only)
└── layout/               # Layout-specific type definitions
```

**Pattern**: Each entity has a consolidated `.types.ts` file containing Zod schemas, TypeScript types, and related utilities in a single location.

### Schema Hierarchy

Each entity follows a consistent schema hierarchy:

```typescript
// Base schema with core fields
export const entityBaseSchema = z.object({...})

// Variants for different use cases
export const entityCreateSchema = entityBaseSchema.extend({...})
export const entityUpdateSchema = entityBaseSchema.partial()

// Specialized schemas
export const entityWithRelationsSchema = entityBaseSchema.extend({...})

// Validation class
export class EntityZodValidation {
  static validate(data: unknown): EntityFormData
  static safeParse(data: unknown): SafeParseResult<EntityFormData>
  // ... other methods
}
```

## Validation Patterns

### 1. Discriminated Unions

**Use Case**: Conditional validation based on mode fields

```typescript
export const contactSchema = z.discriminatedUnion('organization_mode', [
  // Existing organization mode
  contactBaseSchema.extend({
    organization_mode: z.literal('existing'),
    organization_id: ZodTransforms.uuidField.refine(
      val => val !== null,
      { message: 'Organization is required' }
    )
  }),

  // New organization mode
  contactBaseSchema.extend({
    organization_mode: z.literal('new'),
    organization_name: z.string().min(1, 'Organization name required'),
    organization_type: z.enum(['customer', 'principal', 'distributor'])
  })
])
```

**Benefits**:
- Type-safe conditional validation
- Better error messages
- Improved performance over refinements
- Clear separation of validation logic

### 2. Transform Functions

**ZodTransforms** provide Zod-compatible versions of common data transformations:

```typescript
// Nullable string handling
export const ZodTransforms = {
  nullableString: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable()
  ),

  nullableEmail: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return null
      return typeof val === 'string' ? val.toLowerCase().trim() : val
    },
    z.string().email().nullable()
  ),

  uuidField: z.preprocess(
    (val) => normalizeUuid(val),
    z.string().uuid().nullable()
  )
}
```

### 3. Refinement Patterns

**Use Case**: Complex business logic validation

```typescript
export const opportunitySchema = baseSchema
  .refine(
    (data) => {
      if (data.opportunity_context === 'Custom' && !data.custom_context) {
        return false
      }
      return true
    },
    {
      message: 'Custom context is required when selecting Custom',
      path: ['custom_context']
    }
  )
```

### 4. Schema Composition

**Use Case**: Building complex schemas from simpler ones

```typescript
// Base schema
const opportunityBaseSchema = z.object({...})

// Multi-principal extension
export const multiPrincipalOpportunitySchema = opportunityBaseSchema.extend({
  principals: z.array(z.string().uuid())
    .min(1, 'At least one principal required')
    .max(10, 'Maximum 10 principals allowed')
    .transform(arr => Array.from(new Set(arr))) // Deduplicate
})
```

## Transform System

### ZodTransforms Library

The `ZodTransforms` object provides production-ready transform functions:

```typescript
export const ZodTransforms = {
  // String transformations
  nullableString: z.preprocess(emptyToNull, z.string().nullable()),
  requiredString: z.string().min(1).transform(s => s.trim()),

  // Numeric transformations
  nullableNumber: z.preprocess(emptyToNull, z.number().nullable()),
  positiveNumber: z.number().positive().nullable(),

  // Specialized fields
  nullableEmail: // Email normalization + null handling
  nullablePhone: // Phone number formatting + null handling
  uuidField: // UUID validation + normalization

  // Array transformations
  optionalArray: // Empty array preservation
  nullableArray: // Empty array → null conversion
}
```

### Transform Patterns

**Preprocessing Pattern**:
```typescript
z.preprocess(
  (val) => transformFunction(val),
  z.targetType()
)
```

**Benefits**:
- Data normalization before validation
- Consistent null handling
- Performance optimization
- Type safety preservation

## Form Integration

### Resolver System

**Zod-Only Integration**:
```typescript
import { createTypedZodResolver } from '@/lib/form-resolver'

const form = useForm({
  resolver: createTypedZodResolver(zodSchema),
  defaultValues
})
```

**Simplified Resolver Usage**:
```typescript
import { createResolver } from '@/lib/form-resolver'

const form = useForm({
  resolver: createResolver(zodSchema), // Wrapper around createTypedZodResolver
  defaultValues
})
```

### Form Components

**Schema-Driven Forms**:
```typescript
<SchemaForm
  schema={entityZodSchema}
  onSubmit={handleSubmit}
  defaultValues={data}
  mode="edit"
/>
```

**Component Integration**:
```typescript
const { formSchema } = useCoreFormSetup({
  formSchema: entityZodSchema,
  initialData,
  transforms: ZodTransforms
})
```

## Schema Import Pattern

### Direct Schema Imports

Import schemas directly from consolidated entity files:

```typescript
// Import from consolidated entity files
import { organizationZodSchema } from '@/types/organization.types'
import { contactZodSchema } from '@/types/contact.types'
import { opportunityZodSchema } from '@/types/opportunity.types'
```

### Central Validation Exports

For convenience, schemas are also available from the central validation file:

```typescript
// Import from central validation file
import {
  organizationZodSchema,
  contactZodSchema,
  opportunityZodSchema
} from '@/types/validation'
```

## Performance Optimizations

### Schema Instance Caching

```typescript
// Avoid recreating schemas in components
const schema = useMemo(() => createSchema(), [dependencies])
```

### Bulk Validation

```typescript
// Use safeParse for performance-critical operations
const results = data.map(item => schema.safeParse(item))
const valid = results.filter(r => r.success).map(r => r.data)
```

### Memory Management

- Use `.strip()` for removing unknown fields
- Prefer discriminated unions over complex refinements
- Cache compiled schemas for repeated use

## Error Handling

### Error Structure

Zod errors provide detailed validation information:

```typescript
if (!result.success) {
  result.error.errors.forEach(err => {
    console.log(`Field: ${err.path.join('.')}, Message: ${err.message}`)
  })
}
```

### Custom Error Messages

```typescript
const schema = z.string().min(1, 'This field is required')
  .email('Please enter a valid email address')
```

### Error Formatting

```typescript
export function formatZodError(error: ZodError): Record<string, string> {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join('.')
    acc[path] = err.message
    return acc
  }, {} as Record<string, string>)
}
```

## Best Practices

### 1. Schema Design

- **Start Simple**: Begin with basic validation, add complexity gradually
- **Use Discriminated Unions**: For conditional validation instead of refinements
- **Compose Schemas**: Build complex schemas from simpler building blocks
- **Validate Early**: Use `.safeParse()` for user input validation

### 2. Transform Functions

- **Consistent Null Handling**: Use `ZodTransforms` for standardized behavior
- **Data Normalization**: Transform data to expected format before validation
- **Performance**: Prefer preprocessing over post-validation transforms

### 3. Error Messages

- **User-Friendly**: Provide clear, actionable error messages
- **Contextual**: Include field context in error messages
- **Consistent**: Use standard error message patterns across entities

### 4. Testing

- **Validation Parity**: Test both valid and invalid data scenarios
- **Edge Cases**: Test boundary conditions and edge cases
- **Performance**: Monitor validation performance with large datasets

## Type Safety

### Type Inference

```typescript
// Automatic type inference
export type OrganizationFormData = z.infer<typeof organizationZodSchema>

// Manual type definitions for complex cases
export interface CustomFormData extends z.infer<typeof baseSchema> {
  customField: string
}
```

### Generic Schemas

```typescript
function createEntitySchema<T extends Record<string, unknown>>(
  fields: ZodRawShape
): ZodType<T> {
  return z.object(fields) as ZodType<T>
}
```

## Development Workflow

### New Entity Validation

1. **Create Consolidated File**: `src/types/entity.types.ts`
2. **Define Base Schema**: Core fields with transforms
3. **Add Variants**: Create, update, specialized schemas
4. **Add TypeScript Types**: Co-locate types with schemas
5. **Add to Central Exports**: Update `validation.ts`
6. **Create Tests**: Validation and edge case tests

### Modifying Existing Schemas

1. **Update Schema**: Make changes in `.types.ts` file
2. **Update Types**: Ensure TypeScript types match
3. **Test Changes**: Run validation tests
4. **Update Forms**: Modify form components if needed

### Debugging Validation

1. **Use SafeParse**: Get detailed error information
2. **Log Schema**: Debug schema structure with `.describe()`
3. **Test Data**: Validate with known good/bad data
4. **Performance**: Monitor validation timing

## Conclusion

The simplified Zod-only validation architecture provides a robust, type-safe, and performant foundation for the CRM system. The consolidated schema approach reduces complexity while enabling advanced validation patterns and improved developer experience.

For questions or assistance, refer to the validation schemas in `src/types/*.types.ts` and the form development patterns in the codebase.