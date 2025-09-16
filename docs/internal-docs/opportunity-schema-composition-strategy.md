# Opportunity Schema Composition Strategy - Yup to Zod Migration

## Overview

The opportunity validation system represents the most complex schema composition in the CRM codebase, featuring sophisticated multi-principal support, field inheritance patterns, and complex business logic validation. This document analyzes the current Yup implementation and provides a comprehensive Zod migration strategy.

## Current Yup Schema Complexity Analysis

### Base Opportunity Schema (`opportunitySchema`)

**Location**: `/src/types/opportunity.types.ts:42-145`

**Core Characteristics**:
- **18 validation fields** with complex transform integration
- **Stage management** with dual enum support (DB display values + code values)
- **Principal relationships** via UUID validation and transforms
- **Financial validation** with positive number constraints
- **Auto-naming logic** integration with boolean controls
- **Context-aware validation** with conditional custom context fields

**Key Complexity Areas**:

1. **Transform-Heavy Fields** (15+ transform integrations):
   ```typescript
   estimated_value: yup.number()
     .min(0, 'Estimated value must be positive')
     .required('Estimated value is required')
     .transform(FormTransforms.nullableNumber),

   contact_id: yup.string()
     .uuid('Invalid contact ID')
     .nullable()
     .transform(FormTransforms.uuidField),
   ```

2. **Dual Stage Validation System**:
   - Database display values: `['New Lead', 'Initial Outreach', 'Sample/Visit Offered', ...]`
   - Application code values: `['lead', 'qualified', 'proposal', ...]`
   - Complex mapping logic in `/src/lib/opportunity-stage-mapping.ts` (158 lines)

3. **Array Validation with Transforms**:
   ```typescript
   principals: yup.array()
     .of(yup.string().uuid('Invalid principal organization ID'))
     .default([])
     .transform(FormTransforms.optionalArray),
   ```

### Multi-Principal Schema Composition (`multiPrincipalOpportunitySchema`)

**Location**: `/src/types/opportunity.types.ts:148-250`

**Composition Pattern**: **Field inheritance without direct schema composition**
```typescript
export const multiPrincipalOpportunitySchema = yup.object({
  // Direct field definitions (no ...opportunitySchema.fields spreading)
  organization_id: yup.string().uuid('Invalid organization ID').required('Organization is required'),
  contact_id: yup.string().uuid('Invalid contact ID').nullable(),

  // Multi-principal specific validation
  principals: yup.array()
    .of(yup.string().uuid('Invalid principal organization ID'))
    .min(1, 'At least one principal must be selected')
    .required('Principals are required'),
})
```

**Critical Finding**: The current implementation **does NOT use schema field spreading** (`...opportunitySchema.fields`) as mentioned in the task. Instead, it uses **complete redefinition** with specialized validation rules.

**Advanced Composition Features**:

1. **Conditional Custom Context Validation**:
   ```typescript
   custom_context: yup.string()
     .max(50, 'Custom context must be 50 characters or less')
     .when('opportunity_context', {
       is: 'Custom',
       then: (schema) => schema.required('Custom context is required when selecting Custom'),
       otherwise: (schema) => schema.nullable(),
     }),
   ```

2. **Auto-Naming Integration**:
   ```typescript
   auto_generated_name: yup.boolean().default(true),
   opportunity_context: yup.string()
     .oneOf([/* 7 context options */], 'Invalid opportunity context')
     .required('Opportunity context is required for auto-naming'),
   ```

3. **Legacy + Modern Value Support**:
   ```typescript
   stage: yup.string().oneOf([
     // New TypeScript-aligned values (preferred)
     'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost',
     // Legacy database values (backward compatibility)
     'New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Awaiting Response',
     'Feedback Logged', 'Demo Scheduled', 'Closed - Won', 'Closed - Lost',
   ], 'Invalid opportunity stage').default('lead'),
   ```

### Cross-Entity Business Logic Integration

**Auto-Naming System**: `/src/stores/opportunityAutoNamingStore.ts` (518 lines)
- **Multi-principal name generation** with template system
- **Length optimization** and truncation strategies
- **Context abbreviations** and date formatting
- **Client-side validation** with business rules enforcement

**Stage Management System**: `/src/lib/opportunity-stage-mapping.ts` (158 lines)
- **Bidirectional mapping** between DB and code values
- **Type-safe record creation** utilities
- **Stage progression helpers** and validation functions

## Zod Composition Strategy

### 1. Base Schema Migration Pattern

**Recommended Approach**: Use Zod's compositional methods with preprocessors

```typescript
// Base opportunity schema with preprocessing
const opportunityBaseSchema = z.object({
  name: z.string()
    .min(1, 'Opportunity name is required')
    .max(255, 'Name must be 255 characters or less'),

  organization_id: z.string()
    .uuid('Invalid organization ID'),

  estimated_value: z.preprocess(
    ZodTransforms.nullableNumber,
    z.number().min(0, 'Estimated value must be positive')
  ),

  stage: z.enum(DB_STAGES)
    .default(DEFAULT_OPPORTUNITY_STAGE),

  // Transform integration pattern
  contact_id: z.preprocess(
    ZodTransforms.uuidField,
    z.string().uuid().nullable()
  ),
})
```

### 2. Multi-Principal Schema Composition

**Strategy**: Use `z.object().extend()` for clean inheritance with overrides

```typescript
const multiPrincipalOpportunitySchema = z.object({
  // Core fields
  organization_id: z.string().uuid('Invalid organization ID'),
  contact_id: z.string().uuid('Invalid contact ID').nullable(),

  // Multi-principal specific validation
  principals: z.array(z.string().uuid('Invalid principal organization ID'))
    .min(1, 'At least one principal must be selected'),

  // Auto-naming configuration
  auto_generated_name: z.boolean().default(true),

  opportunity_context: z.enum([
    'Site Visit', 'Food Show', 'New Product Interest',
    'Follow-up', 'Demo Request', 'Sampling', 'Custom'
  ]),

  // Conditional custom context using refinement
  custom_context: z.string()
    .max(50, 'Custom context must be 50 characters or less')
    .nullable(),
}).refine((data) => {
  if (data.opportunity_context === 'Custom') {
    return data.custom_context !== null && data.custom_context.trim().length > 0
  }
  return true
}, {
  message: 'Custom context is required when selecting Custom',
  path: ['custom_context']
})
```

### 3. Transform System Migration

**Current Challenge**: Yup's `FormTransforms` functions access `this.parent` context
```typescript
// Yup pattern (context-aware)
export const conditionalTransform = <T, TValues = Record<string, unknown>>(
  condition: (allValues: TValues) => boolean,
  requiredTransform: (value: unknown) => T,
  optionalTransform: (value: unknown) => T | null
) => {
  return function (this: { parent: TValues }, value: unknown) {
    const isRequired = condition(this.parent)
    return isRequired ? requiredTransform(value) : optionalTransform(value)
  }
}
```

**Zod Solution**: Use refinements with context validation
```typescript
// Zod pattern (context via refinement)
const ZodTransforms = {
  nullableNumber: (val: unknown) => {
    if (val === '' || val === null || val === undefined) return null
    const parsed = parseFloat(String(val))
    return isNaN(parsed) ? null : parsed
  },

  uuidField: (val: unknown) => {
    if (typeof val !== 'string' || val.trim() === '') return null
    const trimmed = val.trim()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(trimmed) ? trimmed : null
  }
}
```

### 4. Complex Conditional Validation Migration

**Yup Pattern**:
```typescript
.when('opportunity_context', {
  is: 'Custom',
  then: (schema) => schema.required('Custom context is required when selecting Custom'),
  otherwise: (schema) => schema.nullable(),
})
```

**Zod Pattern**:
```typescript
.refine((data) => {
  if (data.opportunity_context === 'Custom') {
    return data.custom_context !== null && data.custom_context.trim().length > 0
  }
  return true
}, {
  message: 'Custom context is required when selecting Custom',
  path: ['custom_context']
})
```

### 5. Stage Management Integration

**Challenge**: Dual enum system with legacy compatibility

**Solution**: Use Zod union types with preprocessing
```typescript
const legacyStageMapping: Record<string, OpportunityStageDB> = {
  'lead': 'New Lead',
  'qualified': 'Initial Outreach',
  'proposal': 'Sample/Visit Offered',
  'negotiation': 'Demo Scheduled',
  'closed_won': 'Closed - Won',
  'closed_lost': 'Closed - Lost'
}

const stageSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val in legacyStageMapping) {
      return legacyStageMapping[val]
    }
    return val
  },
  z.enum(DB_STAGES)
).default(DEFAULT_OPPORTUNITY_STAGE)
```

## Migration Risks and Challenges

### 1. Schema Composition Complexity

**Risk Level**: HIGH
- **Issue**: Current system doesn't actually use field spreading; complete schema redefinition needed
- **Impact**: Less inheritance than anticipated, but still complex validation rules
- **Mitigation**: Use `z.object().extend()` for clear inheritance patterns

### 2. Multi-Principal Array Validation

**Risk Level**: HIGH
- **Issue**: Complex array validation with minimum length requirements and UUID validation
- **Impact**: Form validation logic heavily depends on array state
- **Mitigation**: Use `z.array().min()` with proper error messaging

### 3. Cross-Entity Relationship Validation

**Risk Level**: VERY HIGH
- **Issue**: Validation depends on external entity data (organizations, contacts, principals)
- **Impact**: Form validation requires external data fetching
- **Mitigation**: Use Zod's `superRefine` for async validation patterns

### 4. Transform Dependencies Performance

**Risk Level**: MEDIUM
- **Issue**: 15+ transform functions with potential performance impact
- **Impact**: Form validation speed may degrade with complex preprocessing
- **Mitigation**: Optimize transform functions and use lazy evaluation where possible

### 5. Auto-Naming Business Logic Integration

**Risk Level**: HIGH
- **Issue**: Complex client-side naming logic with 518-line Zustand store
- **Impact**: Form state depends heavily on naming configuration
- **Mitigation**: Maintain separation between validation and business logic

### 6. Type Inference for Composed Schemas

**Risk Level**: MEDIUM
- **Issue**: TypeScript inference may differ between composed schemas
- **Impact**: Form type definitions may require manual intervention
- **Mitigation**: Use explicit type definitions where inference fails

## Implementation Roadmap

### Phase 1: Transform System Foundation (2-3 days)

1. **Create Zod Transform Utilities**
   - Migrate all `FormTransforms` functions to Zod preprocessors
   - Handle context-aware transforms using refinements
   - Test parity with existing Yup transforms

2. **Establish Base Schema Pattern**
   - Create `opportunityBaseSchema` with preprocessing
   - Implement stage validation with legacy compatibility
   - Validate type inference preservation

### Phase 2: Core Schema Migration (2-3 days)

1. **Base Opportunity Schema**
   - Migrate all 18 fields from `opportunitySchema`
   - Implement stage and status enum validation
   - Handle array and UUID validation patterns

2. **Form Integration Updates**
   - Update `useOpportunityForm` hook with Zod resolver
   - Maintain step-based validation logic
   - Test form state management compatibility

### Phase 3: Multi-Principal Implementation (3-4 days)

1. **Multi-Principal Schema**
   - Implement `multiPrincipalOpportunitySchema` with Zod
   - Handle conditional custom context validation
   - Implement auto-naming integration points

2. **Advanced Validation Patterns**
   - Migrate complex conditional logic using refinements
   - Handle cross-field validation dependencies
   - Test with real multi-principal scenarios

### Phase 4: Business Logic Integration (2-3 days)

1. **Auto-Naming System Integration**
   - Ensure Zustand store compatibility with Zod schemas
   - Test name generation with form validation
   - Validate client-side business logic preservation

2. **Stage Management Integration**
   - Test stage mapping utilities with Zod schemas
   - Validate progression logic with new validation
   - Ensure database compatibility

### Phase 5: Testing and Optimization (2-3 days)

1. **Validation Parity Testing**
   - Compare Yup and Zod validation results across all scenarios
   - Test edge cases and error message consistency
   - Performance benchmarking

2. **Form Integration Testing**
   - Test step-based validation with Zod
   - Validate React Hook Form integration
   - Test error handling and user experience

## Performance Optimization Recommendations

### 1. Lazy Validation Pattern
```typescript
const opportunitySchema = z.lazy(() => z.object({
  // Heavy validation only when needed
  principals: z.array(z.string().uuid()).min(1).optional()
}))
```

### 2. Preprocessing Optimization
```typescript
// Cache transform results for repeated validations
const memoizedTransforms = {
  nullableNumber: memoize(ZodTransforms.nullableNumber),
  uuidField: memoize(ZodTransforms.uuidField)
}
```

### 3. Conditional Schema Loading
```typescript
// Load multi-principal schema only when needed
const getOpportunitySchema = (isMultiPrincipal: boolean) => {
  return isMultiPrincipal ? multiPrincipalOpportunitySchema : opportunitySchema
}
```

## Testing Strategy for Complex Validation Scenarios

### 1. Parity Tests
- **All base opportunity fields** with identical input data
- **Multi-principal array validation** with edge cases
- **Conditional validation** triggers (Custom context scenarios)
- **Transform function behavior** across all data types

### 2. Integration Tests
- **Step-based form validation** with Zod resolver
- **Auto-naming generation** with validation integration
- **Cross-entity validation** with external data
- **Error message consistency** between Yup and Zod

### 3. Performance Tests
- **Large form validation** (100+ opportunities)
- **Transform function performance** under load
- **Memory usage** comparison between Yup and Zod
- **React Hook Form integration** performance impact

## Conclusion

The opportunity schema represents the most sophisticated validation system in the CRM codebase, with complex multi-principal support, extensive transform integration, and advanced business logic. The migration to Zod will require careful handling of:

1. **Complex conditional validation** using refinements
2. **Transform system integration** with preprocessing
3. **Multi-principal array validation** with business rules
4. **Auto-naming business logic** preservation
5. **Stage management complexity** with dual enum support

The estimated migration effort is **11-16 days** with high complexity due to the sophisticated business logic integration and extensive test coverage requirements. The benefits include improved type safety, better performance, and enhanced developer experience with Zod's superior TypeScript integration.

**Success Metrics**:
- 100% validation parity between Yup and Zod implementations
- Maintained form performance (< 5ms validation time)
- Preserved auto-naming functionality
- Complete type inference preservation
- Zero breaking changes to form integration APIs