# Zod Implementation Patterns Research

Analysis of existing Zod infrastructure and patterns in the CRM codebase to inform Yup-to-Zod migration strategy.

## Overview

The CRM codebase has **significant Zod infrastructure already implemented**, particularly in the layout system and form validation. However, there's a **critical missing piece**: the `createTypedZodResolver` function, which creates a gap between the existing Zod schemas and React Hook Form integration. The migration foundation exists but needs completion.

## Existing Zod Infrastructure

### Core Layout Validation System
- **Location**: `/src/lib/layout/validation.ts`
- **Status**: ✅ **Fully Implemented** - Comprehensive Zod-based validation system
- **Key Features**:
  - Discriminated union schemas for different layout types
  - Responsive configuration validation with breakpoint constraints
  - Complex validation rules with custom error messages
  - Entity-specific validation patterns
  - Design token validation schemas

### Form Validation Schemas
- **Location**: `/src/components/forms/CRMFormSchemas.tsx`
- **Status**: ✅ **Fully Implemented** - Complete entity validation schemas
- **Patterns**: Address validation, nested object schemas, conditional validation, regex patterns
- **Entities**: Contact, Organization, Product, Opportunity, Interaction

### AI Integration Schemas
- **Location**: `/src/lib/aiSchemas.ts`
- **Status**: ✅ **Fully Implemented** - OpenAI structured output validation
- **Patterns**: Field mapping, batch validation, duplicate detection with confidence scoring

## Migration-Ready Infrastructure

### 1. Type Inference Patterns (`z.infer<>`)

**Established Pattern**:
```typescript
// From CRMFormSchemas.tsx - Lines 466-471
export type ContactFormData = z.infer<typeof contactFormSchema>
export type OrganizationFormData = z.infer<typeof organizationFormSchema>
export type ProductFormData = z.infer<typeof productFormSchema>
export type OpportunityFormData = z.infer<typeof opportunityFormSchema>
export type InteractionFormData = z.infer<typeof interactionFormSchemaExtended>
```

**Pattern Benefits**:
- Automatic TypeScript type generation from schemas
- Type safety guarantee between validation and data structures
- Single source of truth for form data types

### 2. Validation Class Architecture

**Established Pattern**:
```typescript
// From validation.ts - Lines 378-577
export class LayoutValidator {
  static validateLayout(data: unknown): LayoutValidationResult
  static validateUserPreferences(data: unknown): LayoutValidationResult
  static validateStorageFormat(data: unknown): LayoutValidationResult
  static validateSlot(data: unknown): LayoutValidationResult
  static validateDesignTokens(data: unknown): LayoutValidationResult
}
```

**Pattern Benefits**:
- Consistent error reporting format
- Reusable validation result structure
- Static method pattern for easy importing

### 3. Comprehensive Schema Patterns

**Complex Validation Examples**:
```typescript
// Conditional validation with custom error messages
.refine(
  (data) => data.mobile <= data.tablet && data.tablet <= data.laptop && data.laptop <= data.desktop,
  {
    message: 'Breakpoints must be in ascending order: mobile <= tablet <= laptop <= desktop',
  }
)

// Cross-field validation
.refine((data) => data.organizationId || data.contactId || data.opportunityId, {
  message: "At least one of organization, contact, or opportunity must be specified",
  path: ['organizationId']
})
```

## Critical Missing Infrastructure

### 1. `createTypedZodResolver` Function

**Current Import Issues**:
```typescript
// These imports FAIL - function doesn't exist
import { createTypedZodResolver } from '@/lib/form-resolver'  // SchemaForm.tsx:3
import { createTypedZodResolver } from '../form-resolver'     // validation.ts:2
```

**Required Implementation** (form-resolver.ts needs addition):
```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

export function createTypedZodResolver<T extends FieldValues>(
  schema: z.ZodType<T>
): Resolver<T> {
  return zodResolver(schema) as Resolver<T>
}
```

**Usage Pattern**:
```typescript
// From validation.ts - Lines 581-584
export const layoutConfigurationResolver = createTypedZodResolver(layoutConfigurationSchema)
export const userLayoutPreferencesResolver = createTypedZodResolver(userLayoutPreferencesSchema)
export const slotConfigurationResolver = createTypedZodResolver(slotConfigurationSchema)
export const designTokenConfigResolver = createTypedZodResolver(designTokenConfigSchema)
```

### 2. Form Generation Integration

**Current Implementation Gap**:
- Form generator has Zod type mappings (`form-generator.ts` lines 567-574)
- Schema-driven forms expect Zod resolvers (`SchemaForm.tsx` line 163)
- Missing bridge between Zod schemas and form components

## Established Best Practices

### 1. Schema Organization Patterns

**Entity-Specific Schemas**:
- Base schemas with shared patterns (address, validation constants)
- Entity-specific extensions with business logic
- Reusable validation utilities (`validateEmail`, `validatePhone`, `validateUrl`)

**Configuration Constants**:
```typescript
const LAYOUT_VALIDATION_CONSTANTS = {
  MAX_LAYOUT_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_SLOTS: 20,
  MAX_NESTING_DEPTH: 5,
  // ... more constants
} as const
```

### 2. Error Handling Patterns

**Validation Result Structure**:
```typescript
interface LayoutValidationResult {
  valid: boolean
  errors: LayoutValidationError[]
  warnings: LayoutValidationError[]
  data?: any
}

interface LayoutValidationError {
  path: string[]
  message: string
  code: string
  severity: 'error' | 'warning' | 'info'
}
```

### 3. Schema Composition Patterns

**Discriminated Unions**:
```typescript
export const layoutConfigurationSchema = z.discriminatedUnion('type', [
  slotBasedLayoutSchema,
  gridBasedLayoutSchema,
  flexBasedLayoutSchema,
])
```

**Nested Object Validation**:
```typescript
const responsiveConfigSchema = z.object({
  breakpoints: responsiveBreakpointsSchema,
  mobileFirst: z.boolean().default(true),
  adaptiveLayout: z.boolean().default(true),
})
```

## Integration with React Hook Form

### Current Usage Pattern

**Partial Integration** (SchemaForm.tsx - Lines 162-166):
```typescript
const form = useForm<T>({
  resolver: validationSchema ? createTypedZodResolver(validationSchema) : undefined,
  defaultValues: (defaultValues || {}) as never,
  mode: 'onBlur',
})
```

### Existing Form Types Integration

**TypeScript Integration Pattern**:
```typescript
interface SchemaFormProps<T extends FieldValues = FieldValues> {
  validationSchema?: z.ZodType<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void> | void
}
```

## Validation Tooling Infrastructure

### Schema Validation Script
- **Location**: `/scripts/validate-layout-schemas.ts`
- **Features**: Comprehensive validation pipeline, error reporting, auto-fix capabilities
- **Integration**: Component registry validation, performance analysis, entity-specific rules

### Form Generation Utilities
- **Location**: `/src/lib/layout/form-generator.ts`
- **Features**: Dynamic schema-to-form conversion, Zod schema introspection, validation mapping

## Migration Advantages

### 1. Existing Infrastructure Leverage
- **Layout validation system** provides complete Zod implementation reference
- **Form schema patterns** established for all major entities
- **Type inference patterns** already proven and in use
- **Validation tooling** ready for expanded use

### 2. Proven Patterns
- Complex validation scenarios already solved
- Error handling patterns established
- Integration with React Hook Form partially implemented
- Comprehensive testing and validation utilities

### 3. Missing Pieces (Implementation Required)
- Complete `createTypedZodResolver` implementation
- Bridge existing Yup-based forms to Zod schemas
- Migrate remaining Yup dependencies (13 files identified)
- Update form components to use Zod resolvers

## Recommended Migration Strategy

### Phase 1: Complete Foundation
1. **Implement `createTypedZodResolver`** - Critical missing piece
2. **Test with existing Zod schemas** - Validate integration works
3. **Update SchemaForm component** - Ensure full Zod integration

### Phase 2: Systematic Migration
1. **Migrate form-specific Yup schemas** to match existing Zod patterns
2. **Update form components** to use Zod resolvers
3. **Leverage existing validation infrastructure** for consistency

### Phase 3: Validation & Cleanup
1. **Use validation tooling** to ensure migration completeness
2. **Remove Yup dependencies** after successful migration
3. **Update type definitions** to use Zod inference patterns

## Key Files for Migration

### Existing Zod Infrastructure (Reference)
- `/src/lib/layout/validation.ts` - Comprehensive validation patterns
- `/src/components/forms/CRMFormSchemas.tsx` - Entity schema patterns
- `/src/lib/aiSchemas.ts` - Type inference examples
- `/scripts/validate-layout-schemas.ts` - Validation tooling

### Files Requiring Migration
- `/src/lib/form-resolver.ts` - Add `createTypedZodResolver`
- `/src/components/forms/SimpleForm.tsx` - Update to use Zod
- `/src/components/forms/BusinessForm.tsx` - Update to use Zod
- `/src/hooks/useCoreFormSetup.ts` - Update resolver usage
- `/src/features/opportunities/hooks/useOpportunityForm.ts` - Update form hook

### Type Definition Updates
- `/src/types/validation.ts` - Migrate to Zod-based types
- `/src/types/forms.ts` - Update form type definitions
- Entity type files - Update to use `z.infer<>` patterns

## Conclusion

The CRM codebase has **excellent Zod infrastructure foundations** with sophisticated validation patterns, comprehensive schema definitions, and proven integration approaches. The missing `createTypedZodResolver` function is the critical blocker preventing full Zod adoption. Once implemented, the migration can proceed systematically using established patterns and leveraging existing validation tooling.

**Migration Readiness**: 🟡 **80% Complete** - Foundation exists, missing critical resolver implementation