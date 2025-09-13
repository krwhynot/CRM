# Zod Current Implementation Research

## Overview
This document analyzes the existing Zod implementations in the CRM project to understand current patterns, integration approaches, and the coexistence with Yup validation schemas.

---

## Package Dependencies

### Current State
```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.2.1",
    "react-hook-form": "^7.62.0",
    "yup": "^1.7.0",
    "zod": "^3.25.76"
  }
}
```

**Analysis**: Both Yup and Zod are installed, indicating a transition period or dual usage. The `@hookform/resolvers` package supports both validation libraries.

---

## Existing Zod Files

### 1. `/src/components/forms/CRMFormSchemas.tsx` (550 lines)
**Purpose**: Comprehensive Zod validation schemas for all major CRM entities

**Key Features**:
- **Entity Coverage**: Contact, Organization, Product, Opportunity, Interaction
- **Complex Validation**: Multi-step forms, conditional validation, refinements
- **Type Safety**: Full TypeScript integration with `z.infer`
- **Business Rules**: Domain-specific validations (UUID, email, phone, URL patterns)

**Schema Examples**:
```typescript
// Basic validation patterns
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/

// Address schema composition
const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100),
  addressLine2: z.string().max(100).optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(3),
  zipCode: z.string().regex(zipCodeRegex, 'Invalid ZIP code format').optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required').max(50).default('United States'),
})

// Complex entity schema with refinements
export const interactionFormSchema = interactionFormSchemaBase.refine(
  (data) => data.organizationId || data.contactId || data.opportunityId,
  {
    message: 'At least one of organization, contact, or opportunity must be specified',
    path: ['organizationId'],
  }
)
```

**Advanced Patterns**:
- **Multi-step form support** with `createFormStepSchema` utility
- **Conditional validation** using `z.refine()`
- **Cross-field validation** with custom error paths
- **Enum validation** for database-aligned values
- **Optional/nullable handling** with `.or(z.literal(''))`

### 2. `/src/lib/aiSchemas.ts` (99 lines)
**Purpose**: Zod schemas for OpenAI structured outputs in import/export features

**Key Features**:
- **AI Integration**: Field mapping for CSV import wizard
- **Validation Pipeline**: Row-level validation and duplicate detection
- **Confidence Scoring**: Numeric confidence values with min/max constraints
- **Enum Handling**: Entity type classification and severity levels

**Schema Examples**:
```typescript
export const FieldMapping = z.object({
  header: z.string(),
  suggestedField: z.enum([
    'name', 'website', 'phone', 'email', 'address_line_1',
    // ... 20+ field mappings
  ]).nullable(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.string()).nullable(),
  reason: z.string().nullable(),
})

export const BatchValidationResponse = z.object({
  validatedRows: z.array(RowValidation),
  summary: z.object({
    totalRows: z.number(),
    validRows: z.number(),
    errorRows: z.number(),
    warningRows: z.number(),
  }),
  overallQuality: z.number().min(0).max(1).nullable(),
})
```

### 3. `/src/hooks/entity/useEntityForm.ts` (365 lines)
**Purpose**: Generic entity form hook with Zod validation support

**Key Features**:
- **Generic Type Safety**: `<T extends BaseEntity, TInsert = BaseInsert<T>>`
- **Zod Integration**: Optional schema validation with error handling
- **Auto-save Support**: Debounced validation and submission
- **Multi-step Forms**: Extension for wizard-style forms
- **State Management**: Dirty tracking, touch state, submission state

**Zod Integration Pattern**:
```typescript
export interface EntityFormConfig<T extends BaseEntity, TInsert = BaseInsert<T>> {
  initialData?: Partial<T>
  validationSchema?: z.ZodSchema<TInsert>  // Optional Zod schema
  onSubmit?: (data: TInsert) => Promise<void>
  onValidation?: (data: Partial<T>) => Record<string, string>  // Custom validation
  // ... other config options
}

// Validation function with Zod support
const validateForm = useCallback((): boolean => {
  const newErrors: Record<string, string> = {}

  // Use Zod schema if provided
  if (config.validationSchema) {
    try {
      config.validationSchema.parse(data as TInsert)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
      }
    }
  }

  // Fallback to custom validation
  if (config.onValidation) {
    const customErrors = config.onValidation(data)
    Object.assign(newErrors, customErrors)
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}, [data, config.validationSchema, config.onValidation])
```

---

## Zod vs Yup Comparison

### Current Yup Implementation (Primary)

**File**: `/src/types/validation.ts` (181 lines)
**Patterns**:
```typescript
import * as yup from 'yup'

// Conditional validation with .when()
principal_id: yup
  .string()
  .uuid('Invalid principal ID')
  .when('principal_mode', {
    is: 'existing',
    then: (schema) => schema.required('Principal organization is required'),
    otherwise: (schema) => schema.nullable(),
  })

// Type inference
export type ProductFormData = yup.InferType<typeof productSchema>
```

**Usage Pattern**: Entity-specific schema files (contact.types.ts, organization.types.ts, etc.)

### Zod Implementation (Secondary/Emerging)

**Patterns**:
```typescript
import { z } from 'zod'

// Refinement-based conditional validation
.refine((data) => data.organizationId || data.contactId, {
  message: 'At least one relationship is required',
  path: ['organizationId'],
})

// Type inference
export type ContactFormData = z.infer<typeof contactFormSchema>
```

---

## Integration Approaches

### 1. React Hook Form Integration

**Current State**: No zodResolver usage found in the codebase yet.

**Yup Pattern** (Current):
```typescript
// From useCoreFormSetup.ts
const form = useForm<T>({
  resolver: yupResolver(formSchema) as never,
  defaultValues: initialData as DefaultValues<T>,
})
```

**Zod Pattern** (Expected):
```typescript
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<T>({
  resolver: zodResolver(schema),
  defaultValues: initialData,
})
```

### 2. Form Component Integration

**Current Pattern** (Yup-based):
```typescript
// From form-resolver.ts
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}
```

### 3. Custom Validation Utilities

**Shared Utilities**: `/src/lib/validation.ts`
```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

**Note**: These utilities are validation-library agnostic and can be used with both Yup and Zod.

---

## Current Schema Complexity Analysis

### Entity Schema Coverage

| Entity | Yup Schema | Zod Schema | Lines | Complexity |
|--------|------------|------------|-------|------------|
| Contact | ✅ contact.types.ts | ✅ CRMFormSchemas.tsx | 114 vs 83 | Medium |
| Organization | ✅ organization.types.ts | ✅ CRMFormSchemas.tsx | - vs 82 | Medium |
| Product | ✅ validation.ts | ✅ CRMFormSchemas.tsx | 47 vs 99 | High |
| Opportunity | ✅ opportunity.types.ts | ✅ CRMFormSchemas.tsx | - vs 96 | High |
| Interaction | ✅ interaction.types.ts | ✅ CRMFormSchemas.tsx | - vs 76 | Medium |

### Validation Features Comparison

| Feature | Yup Implementation | Zod Implementation |
|---------|-------------------|-------------------|
| **Required Fields** | `.required('message')` | `.min(1, 'message')` |
| **Optional Fields** | `.nullable()` | `.optional().or(z.literal(''))` |
| **Conditional Validation** | `.when()` syntax | `.refine()` with conditions |
| **Cross-field Validation** | `.test()` methods | `.refine()` with path targeting |
| **Type Inference** | `yup.InferType<>` | `z.infer<>` |
| **Regex Validation** | `.matches(regex)` | `.regex(regex)` |
| **Array Validation** | `.array().of()` | `.array().of()` |
| **Object Composition** | `.shape()` | `.object()` |
| **Transforms** | `.transform()` | `.transform()` |

---

## Validation Utilities and Helpers

### Current Zod Utilities

**From CRMFormSchemas.tsx**:
```typescript
// Multi-step form schema creation
export const createFormStepSchema = <T extends z.ZodObject<any, any, any, any, any>>(
  fullSchema: T,
  stepFields: Array<keyof z.infer<T>>
) => {
  const shape = fullSchema.shape as Record<string, z.ZodTypeAny>
  const stepShape: Record<string, z.ZodTypeAny> = {}

  stepFields.forEach((field) => {
    if (shape[field as string]) {
      stepShape[field as string] = shape[field as string]
    }
  })

  return z.object(stepShape)
}

// Common validation utilities
export const validateEmail = (email: string): boolean => isValidEmail(email)
export const validatePhone = (phone: string): boolean => phoneRegex.test(phone)
export const validateUrl = (url: string): boolean => urlRegex.test(url)
```

### Current Yup Utilities

**From form-resolver.ts**:
```typescript
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}
```

---

## Type Inference Patterns

### Zod Type Inference (Current)
```typescript
// Basic type inference
export type ContactFormData = z.infer<typeof contactFormSchema>
export type OrganizationFormData = z.infer<typeof organizationFormSchema>

// Complex type inference with conditional types
export type InteractionFormData = z.infer<typeof interactionFormSchemaExtended>
```

### Yup Type Inference (Primary)
```typescript
// Type inference pattern
export type ContactFormData = yup.InferType<typeof contactSchema>
export type ProductFormData = yup.InferType<typeof productSchema>
```

---

## Key Findings

### Strengths of Current Zod Implementation

1. **Type Safety**: Better TypeScript integration with `z.infer`
2. **Composability**: Clean schema composition and reuse
3. **Modern Syntax**: More intuitive API design
4. **Error Handling**: Better error message customization
5. **Runtime Safety**: Built-in parsing vs validation distinction

### Migration Challenges Identified

1. **Conditional Validation**: Yup's `.when()` vs Zod's `.refine()` patterns differ significantly
2. **Nullable Handling**: Yup's `.nullable()` vs Zod's `.optional().or(z.literal(''))`
3. **Transform Functions**: Different transform API patterns
4. **Form Integration**: Need to migrate from `yupResolver` to `zodResolver`
5. **Type Compatibility**: Need to ensure existing component interfaces remain compatible

### Current Usage Gaps

1. **No zodResolver Usage**: Forms still use `yupResolver` exclusively
2. **Parallel Schemas**: Duplicate validation logic between Yup and Zod schemas
3. **Inconsistent Patterns**: Mixed validation approaches across entities
4. **Test Coverage**: No evidence of Zod schema testing

---

## Recommendations for Migration

### Phase 1: Foundation
1. **Standardize Zod Patterns**: Establish consistent patterns for optional fields, conditional validation
2. **Create Migration Utilities**: Build helpers for common transformation patterns
3. **Update Form Integration**: Migrate core form hooks to support `zodResolver`

### Phase 2: Entity Migration
1. **Start with Simple Entities**: Begin with entities that have fewer conditional validations
2. **Maintain API Compatibility**: Ensure type exports remain consistent
3. **Add Comprehensive Tests**: Validate schema behavior matches existing Yup schemas

### Phase 3: Cleanup
1. **Remove Yup Dependencies**: Phase out Yup schemas once Zod migration is complete
2. **Consolidate Utilities**: Merge validation utility functions
3. **Update Documentation**: Reflect new validation patterns in developer guides

---

## Conclusion

The CRM project currently has a robust Zod foundation with comprehensive schemas for all major entities. The existing implementation demonstrates advanced Zod patterns including conditional validation, schema composition, and type inference. The primary task for migration will be updating the React Hook Form integration and ensuring consistent patterns across all validation use cases.

The parallel existence of Yup and Zod schemas provides an excellent opportunity for comparison testing during migration to ensure behavioral compatibility.