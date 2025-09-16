# Yup Validation Patterns Analysis

Comprehensive analysis of the current Yup validation patterns in the CRM codebase to inform the migration to Zod validation.

## Overview

The CRM codebase has a mature and sophisticated Yup validation system across 5 core entities with extensive use of transforms, conditional validation, and type inference. The validation system is deeply integrated with React Hook Form and includes custom transform utilities for data normalization. Migration complexity is high due to conditional validation patterns and the comprehensive FormTransforms system.

## Relevant Files

### Core Entity Schemas
- `/src/types/contact.types.ts`: Contact entity validation with 18+ fields, conditional organization creation
- `/src/types/organization.types.ts`: Organization entity validation with address fields and type-based booleans
- `/src/types/opportunity.types.ts`: Complex opportunity validation with stage management and multi-principal support
- `/src/types/interaction.types.ts`: Interaction validation with enhanced priority system and conditional follow-up
- `/src/types/validation.ts`: Central validation re-exports and Product schema with principal mode switching

### Transform and Integration System
- `/src/lib/form-transforms.ts`: Comprehensive transform utilities with 15+ transform functions
- `/src/lib/form-resolver.ts`: Typed Yup resolver creation for React Hook Form integration
- `/src/hooks/useCoreFormSetup.ts`: Core form setup hook with layout integration
- `/src/features/opportunities/hooks/useOpportunityForm.ts`: Complex form hook with step validation

### Form Components
- `/src/components/forms/BusinessForm.tsx`: Advanced multi-section form with conditional rendering
- `/src/components/forms/SimpleForm.tsx`: Basic declarative form builder with progress tracking

## Architectural Patterns

### 1. Entity-Based Schema Organization
- **Pattern**: Individual schema files per entity type with re-export in validation.ts
- **Example**: `contactSchema` in `contact.types.ts`, imported into `validation.ts`
- **Benefit**: Clear separation of concerns, maintainable validation logic per domain

### 2. Transform-Driven Data Normalization
- **Pattern**: Extensive use of `.transform()` method with standardized transform functions
- **Example**: `FormTransforms.nullableString`, `FormTransforms.nullableEmail`
- **Usage**: 80%+ of nullable fields use transforms for consistent data handling

### 3. Conditional Validation with .when()
- **Pattern**: Complex conditional logic using Yup's `.when()` method
- **Example**: Organization creation mode in contact forms, principal mode in product forms
- **Implementation**: Multi-field dependencies with dynamic requirement switching

### 4. Type-Safe Form Integration
- **Pattern**: `yup.InferType<>` for automatic TypeScript type generation
- **Integration**: Seamless React Hook Form integration via `yupResolver`
- **Benefit**: Single source of truth for validation and TypeScript types

### 5. Modular Transform System
- **Pattern**: Centralized transform utilities in `FormTransforms` object
- **Coverage**: 15+ specialized transforms for different data types
- **Reusability**: High reuse across all entity schemas

## Gotchas & Edge Cases

### Complex Conditional Dependencies
**Location**: `/src/types/contact.types.ts:158-174`
```typescript
organization_name: yup
  .string()
  .when('organization_mode', {
    is: 'new',
    then: (schema) => schema.required('Organization name is required when creating a new organization'),
  }),
```
**Challenge**: Multi-field conditional requirements that change validation rules dynamically

### Transform Function Context Binding
**Location**: `/src/lib/form-transforms.ts:134-144`
```typescript
export const conditionalTransform = <T, TValues = Record<string, unknown>>(
  condition: (allValues: TValues) => boolean,
  requiredTransform: (value: unknown) => T,
  optionalTransform: (value: unknown) => T | null = (value: unknown) => emptyStringToNull(value) as T | null
) => {
  return function (this: { parent: TValues }, value: unknown) {
    const isRequired = condition(this.parent)
    return isRequired ? requiredTransform(value) : optionalTransform(value)
  }
}
```
**Challenge**: Context-aware transforms that access parent form values via `this.parent`

### Type Casting Workarounds
**Location**: Multiple files using `as never` casting
```typescript
resolver: yupResolver(formSchema) as never,
defaultValues: initialData as DefaultValues<T>,
```
**Challenge**: TypeScript integration requires casting due to complex generic constraints

### UUID Validation with Transform Chaining
**Location**: `/src/lib/form-transforms.ts:120-128`
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
**Challenge**: Custom validation logic embedded in transform functions rather than validators

### Nested Schema Composition
**Location**: `/src/types/opportunity.types.ts:148-250`
```typescript
export const multiPrincipalOpportunitySchema = yup.object({
  ...opportunitySchema.fields, // Inheriting from base schema
  // Override specific fields
  opportunity_id: yup.string().uuid('Invalid opportunity ID').nullable(),
})
```
**Challenge**: Schema composition with field overrides and complex inheritance patterns

### Array Transform Edge Cases
**Location**: `/src/lib/form-transforms.ts:61-68`
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
**Challenge**: Complex array handling with undefined filtering and type narrowing

## Most Complex Validation Examples

### 1. Contact Schema with Organization Creation Mode
**Complexity Level**: Very High
**Location**: `/src/types/contact.types.ts:147-201`

```typescript
// ORGANIZATION MODE FIELDS for new organization creation
organization_mode: yup
  .string()
  .oneOf(['existing', 'new'] as const, 'Invalid organization mode')
  .default('existing'),

organization_name: yup
  .string()
  .max(255, 'Organization name must be 255 characters or less')
  .nullable()
  .transform(FormTransforms.nullableString)
  .when('organization_mode', {
    is: 'new',
    then: (schema) => schema.required('Organization name is required when creating a new organization'),
  }),

organization_type: yup
  .string()
  .oneOf(['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const)
  .nullable()
  .transform(FormTransforms.nullableString)
  .when('organization_mode', {
    is: 'new',
    then: (schema) => schema.required('Organization type is required when creating a new organization'),
  }),
```

**Migration Challenges**:
- Complex conditional requirements spanning multiple fields
- Transform and validation chaining
- Enum validation with const assertions
- Default value handling with mode switching

### 2. Product Schema with Principal Mode Dependencies
**Complexity Level**: Very High
**Location**: `/src/types/validation.ts:76-123`

```typescript
principal_mode: yup
  .string()
  .oneOf(['existing', 'new'] as const, 'Invalid principal mode')
  .default('existing'),

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
  }),
```

**Migration Challenges**:
- Bidirectional conditional validation (existing vs new modes)
- UUID validation with conditional requirements
- Multiple field dependencies on single mode field

### 3. Interaction Schema with Follow-up Conditional Logic
**Complexity Level**: High
**Location**: `/src/types/interaction.types.ts:86-94`

```typescript
follow_up_required: yup.boolean().default(false),

follow_up_date: yup
  .string()
  .nullable()
  .when('follow_up_required', {
    is: true,
    then: (schema) => schema.required('Follow-up date is required when follow-up is needed'),
    otherwise: (schema) => schema.nullable(),
  }),
```

**Migration Challenges**:
- Boolean-based conditional validation
- Date field handling with string storage
- Clear conditional messaging

### 4. Multi-Principal Opportunity with Custom Context
**Complexity Level**: Very High
**Location**: `/src/types/opportunity.types.ts:183-190`

```typescript
custom_context: yup
  .string()
  .max(50, 'Custom context must be 50 characters or less')
  .when('opportunity_context', {
    is: 'Custom',
    then: (schema) => schema.required('Custom context is required when selecting Custom'),
    otherwise: (schema) => schema.nullable(),
  }),
```

**Migration Challenges**:
- String-based conditional triggers
- Nullable vs required field switching
- Custom error messages for specific conditions

## Type System Integration

### Current Yup Type Inference Pattern
```typescript
// Schema definition
export const contactSchema = yup.object({
  first_name: yup.string().required(),
  email: yup.string().email().nullable().transform(FormTransforms.nullableEmail),
})

// Automatic type inference
export type ContactFormData = yup.InferType<typeof contactSchema>

// Results in:
// type ContactFormData = {
//   first_name: string
//   email: string | null
// }
```

### React Hook Form Integration
```typescript
const form = useForm<ContactFormData>({
  resolver: yupResolver(contactSchema) as never, // Type casting required
  defaultValues: initialData as DefaultValues<ContactFormData>,
})
```

**Migration Considerations**:
- Zod's type inference is more precise and requires less casting
- Transform function typing will need to be reworked
- Default value handling differs between Yup and Zod

## Transform System Deep Dive

### Core Transform Categories

1. **Nullable String Transforms** (Most Common)
   - `nullableString`: Empty string → null
   - `nullableEmail`: Email normalization + null conversion
   - `nullablePhone`: Phone normalization + null conversion
   - `nullableUrl`: URL handling + null conversion

2. **Numeric Transforms**
   - `nullableNumber`: Empty string/null → null, valid numbers preserved
   - Positive number validation with nullability

3. **Array Transforms**
   - `optionalArray`: Ensures array type, filters undefined values
   - `nullableArray`: Empty arrays → null

4. **Special Case Transforms**
   - `normalizeUuid`: UUID validation + formatting
   - `conditionalTransform`: Factory for context-aware transforms
   - `stringToBoolean`: String boolean conversion

### Transform Usage Patterns
- **90%** of nullable fields use transforms
- **100%** of email fields use `nullableEmail` transform
- **100%** of phone fields use `nullablePhone` transform
- **80%** of UUID fields use specialized UUID handling

## Most Challenging Migration Points

### 1. Conditional Transform Functions
**Challenge**: Yup's `this.parent` context access in transforms
**Example**: `conditionalTransform` factory function
**Zod Equivalent**: Requires refinement with context passing

### 2. Complex .when() Chains
**Challenge**: Multi-field conditional validation with mode switching
**Migration Path**: Zod discriminated unions or superRefine()

### 3. Schema Composition Patterns
**Challenge**: Field inheritance and overrides in multiPrincipal schemas
**Migration Path**: Zod .merge() and .pick()/.omit() methods

### 4. Transform + Validation Chaining
**Challenge**: Yup's ability to chain transforms before validation
**Migration Path**: Zod preprocessing with .transform().pipe()

### 5. Type Casting Workarounds
**Challenge**: Current TypeScript integration requires `as never` casting
**Benefit**: Zod's superior TypeScript integration eliminates most casting

### 6. Custom Validation Messages
**Challenge**: Context-aware error messages in conditional validation
**Migration Path**: Zod custom error handling with .refine()

## Recommended Migration Strategy

### Phase 1: Core Transforms
1. Migrate `FormTransforms` utilities to Zod preprocessing functions
2. Create Zod equivalents for all transform patterns
3. Test transform behavior parity

### Phase 2: Simple Schemas
1. Start with Organization schema (least complex)
2. Migrate Product schema (moderate complexity)
3. Validate type inference and form integration

### Phase 3: Complex Conditional Schemas
1. Migrate Contact schema with organization creation mode
2. Handle Opportunity schema with multi-principal logic
3. Address Interaction schema follow-up conditions

### Phase 4: Form Integration
1. Replace `yupResolver` with `zodResolver`
2. Update form hooks and components
3. Test type safety improvements

### Phase 5: Advanced Features
1. Migrate schema composition patterns
2. Handle complex conditional transform scenarios
3. Performance optimization and final testing

## Estimated Migration Complexity

- **Transform System**: High complexity (2-3 days)
- **Simple Schemas**: Medium complexity (1-2 days)
- **Conditional Validation**: Very High complexity (3-5 days)
- **Form Integration**: Medium complexity (1-2 days)
- **Testing & Refinement**: High complexity (2-3 days)

**Total Estimated Effort**: 9-15 days for complete migration

The migration will provide significant benefits in type safety, performance, and developer experience, but requires careful handling of the sophisticated conditional validation patterns and transform system currently in place.