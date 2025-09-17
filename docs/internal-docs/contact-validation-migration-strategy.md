# Contact Validation Migration Strategy: Yup to Zod

**Task**: Analysis of contact validation complexity for Yup to Zod migration (Task 3.1)
**Date**: 2025-01-14
**Status**: Analysis Complete - Ready for Implementation

## Executive Summary

The contact validation schema represents **moderate-to-high complexity** in the Yup to Zod migration due to sophisticated conditional validation patterns, particularly the organization creation mode logic. The contact schema contains **18+ fields** with complex interdependencies, making it the third most complex entity after interactions and opportunities.

### Key Migration Challenges
1. **Organization Creation Mode**: Discriminated union pattern with 'existing' vs 'new' modes
2. **Conditional Field Requirements**: 5 fields become required when mode = 'new'
3. **Transform Integration**: Heavy use of FormTransforms (11 transform applications)
4. **Cross-Entity Dependencies**: Preferred principal relationships and organization references
5. **Type Inference Complexity**: Mixed nullable and required field patterns

## Current Contact Validation Architecture

### Schema Structure Analysis

**File**: `/src/types/contact.types.ts:50-201`

The contact schema contains three distinct validation groups:

#### 1. Core Contact Fields (Lines 51-138)
```typescript
first_name: yup.string().required().max(100)
last_name: yup.string().required().max(100)
organization_id: yup.string().uuid().nullable().transform(FormTransforms.nullableString)
purchase_influence: yup.string().oneOf(['High', 'Medium', 'Low', 'Unknown']).required()
decision_authority: yup.string().oneOf(['Decision Maker', 'Influencer', 'End User', 'Gatekeeper']).required()
role: yup.string().oneOf([...contactRoles]).nullable().transform(FormTransforms.nullableString)
```

**Transform Usage**: 7 of 11 fields use FormTransforms:
- `nullableString` (4 fields)
- `nullableEmail` (1 field)
- `nullablePhone` (2 fields)
- `nullableUrl` (1 field)
- `optionalArray` (1 field)

#### 2. Virtual Fields (Lines 141-145)
```typescript
preferred_principals: yup.array()
  .of(yup.string().uuid())
  .default([])
  .transform(FormTransforms.optionalArray)
```

**Challenge**: Array field with UUID validation and transform integration

#### 3. Organization Mode Fields (Lines 147-200)
```typescript
organization_mode: yup.string()
  .oneOf(['existing', 'new'] as const)
  .default('existing')

organization_name: yup.string()
  .max(255)
  .nullable()
  .transform(FormTransforms.nullableString)
  .when('organization_mode', {
    is: 'new',
    then: (schema) => schema.required('Organization name is required when creating a new organization')
  })
```

**Critical Pattern**: 5 fields (name, type, phone, email, website, notes) follow identical conditional logic

### Form Integration Analysis

**File**: `/src/features/contacts/components/ContactForm.tsx:75-148`

The form implements sophisticated conditional rendering:
- **Radio Selection**: organization_mode drives field visibility
- **Conditional Fields**: 5 organization fields shown only when mode = 'new'
- **Dynamic Requirements**: Required validation applies only in 'new' mode

```typescript
// Form field pattern
{
  name: 'organization_name',
  label: 'Organization Name',
  type: 'text',
  required: true,
  condition: (values) => values.organization_mode === 'new'
}
```

## Complex Validation Patterns Deep Dive

### 1. Organization Creation Mode Logic

**Current Yup Implementation**:
```typescript
organization_mode: yup.string()
  .oneOf(['existing', 'new'] as const)
  .default('existing'),

organization_name: yup.string()
  .nullable()
  .transform(FormTransforms.nullableString)
  .when('organization_mode', {
    is: 'new',
    then: (schema) => schema.required('Organization name is required when creating a new organization')
  })
```

**Complexity Factors**:
- **5 conditional fields** depend on organization_mode
- **Transform + Validation chaining** on each conditional field
- **Custom error messages** specific to organization creation context
- **Default value handling** with mode switching

**Cross-Field Dependencies**:
- `organization_id` is relevant only when mode = 'existing'
- `organization_name`, `organization_type` are required only when mode = 'new'
- `organization_phone`, `organization_email`, `organization_website`, `organization_notes` are optional but mode-dependent

### 2. Preferred Principal Relationships

**Current Implementation**:
```typescript
preferred_principals: yup.array()
  .of(yup.string().uuid('Invalid principal organization ID'))
  .default([])
  .transform(FormTransforms.optionalArray)
```

**Complexity Factors**:
- **Virtual field** (not persisted directly to contacts table)
- **UUID array validation** with proper error messages
- **Transform integration** for array normalization
- **Cross-entity validation** (references organization IDs)

**Database Relationship**: Uses junction table `contact_preferred_principals`

### 3. Transform Dependencies and Patterns

**Heavy Transform Usage** (11 of 18 fields):

```typescript
// Nullable string pattern (most common)
organization_id: transform(FormTransforms.nullableString)
title: transform(FormTransforms.nullableString)
department: transform(FormTransforms.nullableString)
notes: transform(FormTransforms.nullableString)

// Specialized transforms
email: transform(FormTransforms.nullableEmail)
phone: transform(FormTransforms.nullablePhone)
mobile_phone: transform(FormTransforms.nullablePhone)
linkedin_url: transform(FormTransforms.nullableUrl)
preferred_principals: transform(FormTransforms.optionalArray)
```

**Transform Context Dependencies**:
- All transforms handle null/empty string conversion
- Some transforms perform normalization (email, phone, URL)
- Array transform handles undefined filtering

### 4. Cross-Entity Validation Flows

**Organization Creation Flow**:
1. User selects organization_mode = 'new'
2. Organization fields become required
3. Contact creation creates both contact and organization records
4. Cross-entity validation ensures data consistency

**Principal Relationship Flow**:
1. preferred_principals array accepts organization UUIDs
2. Validates UUIDs exist in organizations table
3. Creates junction table records in contact_preferred_principals

## Zod Implementation Strategy

### 1. Discriminated Union Approach

**Recommended Pattern** (following `/src/lib/layout/validation.ts:269-273`):

```typescript
const contactBaseSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  organization_id: z.string().uuid().nullable().default(null),
  // ... other base fields
})

const existingOrganizationContactSchema = contactBaseSchema.extend({
  organization_mode: z.literal('existing').default('existing'),
  organization_id: z.string().uuid('Invalid organization ID').nullable(),
  // Organization creation fields should be nullable
  organization_name: z.string().max(255).nullable().default(null),
  organization_type: z.enum(['customer', 'principal', 'distributor', 'prospect', 'vendor']).nullable().default(null),
})

const newOrganizationContactSchema = contactBaseSchema.extend({
  organization_mode: z.literal('new'),
  organization_id: z.string().uuid().nullable().default(null),
  // Organization creation fields are required
  organization_name: z.string().min(1, 'Organization name is required when creating a new organization').max(255),
  organization_type: z.enum(['customer', 'principal', 'distributor', 'prospect', 'vendor']),
  organization_phone: z.string().max(50).nullable().default(null),
  organization_email: z.string().email().max(255).nullable().default(null),
  organization_website: z.string().url().max(500).nullable().default(null),
  organization_notes: z.string().max(500).nullable().default(null),
})

export const contactSchema = z.discriminatedUnion('organization_mode', [
  existingOrganizationContactSchema,
  newOrganizationContactSchema,
])
```

**Benefits of Discriminated Union**:
- **Type Safety**: Mode-specific field requirements enforced at type level
- **Error Messages**: Context-aware validation messages
- **Performance**: Single validation pass, no dynamic conditional checks
- **Maintainability**: Clear separation of validation logic per mode

### 2. Transform Integration Strategy

**Zod Transform Pattern**:
```typescript
// Replace FormTransforms.nullableString
const nullableStringTransform = z.string().transform((val) => val.trim() === '' ? null : val).nullable()

// Replace FormTransforms.nullableEmail
const nullableEmailTransform = z.string()
  .transform((val) => val.trim() === '' ? null : val.toLowerCase())
  .refine((val) => val === null || z.string().email().safeParse(val).success, 'Invalid email')
  .nullable()

// Replace FormTransforms.optionalArray
const uuidArrayTransform = z.array(z.string().uuid()).default([])
  .transform((arr) => arr.filter(id => id !== undefined))
```

**Transform Migration Approach**:
1. **Create Zod-compatible transforms** in `/src/lib/form-transforms.ts`
2. **Preserve existing Yup transforms** during transition
3. **Test transform parity** with identical input/output validation
4. **Gradually migrate** schema by schema

### 3. Type Inference Preservation

**Current Yup Pattern**:
```typescript
export type ContactFormData = yup.InferType<typeof contactSchema>
```

**Zod Equivalent**:
```typescript
export type ContactFormData = z.infer<typeof contactSchema>
```

**Type Safety Improvements**:
- Zod's discriminated union provides better type narrowing
- Conditional field types become more precise
- Eliminates need for `as never` casting in form resolvers

### 4. Error Handling and Messaging Strategy

**Current Error Patterns**:
```typescript
.when('organization_mode', {
  is: 'new',
  then: (schema) => schema.required('Organization name is required when creating a new organization')
})
```

**Zod Error Handling**:
```typescript
.refine(
  (data) => data.organization_mode !== 'new' || data.organization_name?.trim(),
  {
    message: 'Organization name is required when creating a new organization',
    path: ['organization_name']
  }
)
```

**Error Message Compatibility**: Custom error map for consistent messaging

## Migration Risks and Challenges

### High-Risk Areas

#### 1. Discriminated Union Complexity
**Risk**: Complex mode switching logic may not translate directly
**Mitigation**:
- Implement comprehensive test suite comparing Yup vs Zod validation
- Create validation parity tests for all organization mode combinations
- Test form integration with mode switching

#### 2. Transform Function Compatibility
**Risk**: Zod transforms behave differently from Yup transforms
**Mitigation**:
- Create Zod-compatible versions of all FormTransforms functions
- Test transform output parity with identical inputs
- Preserve context-aware transform behavior

#### 3. Cross-Entity Validation
**Risk**: Preferred principals UUID validation may break
**Mitigation**:
- Implement Zod refinement for UUID existence checking
- Test junction table creation flow
- Validate cross-entity constraint enforcement

#### 4. Form Integration Breaking Changes
**Risk**: React Hook Form integration may require significant updates
**Mitigation**:
- Implement createTypedZodResolver before migration (Task 1.1 dependency)
- Test form field conditional rendering with new schema
- Validate error message display consistency

### Medium-Risk Areas

#### 1. Type Inference Changes
**Risk**: TypeScript types may change subtly, breaking consuming code
**Mitigation**:
- Compare generated types between Yup and Zod implementations
- Update type exports gradually
- Test all consuming components

#### 2. Default Value Handling
**Risk**: Zod default behavior differs from Yup
**Mitigation**:
- Test default value application in forms
- Validate database insert/update behavior
- Check conditional field default handling

## Implementation Roadmap

### Step 1: Foundation Setup (Prerequisites)
**Dependencies**: Requires Tasks 1.1, 1.2, 2.1, 2.2, 2.3 completion
- ✅ `createTypedZodResolver` implementation
- ✅ Zod-compatible transform system
- ✅ Organization schema migration (simpler pattern)
- ✅ Product schema migration (moderate complexity)
- ✅ Form integration updates

### Step 2: Schema Architecture (2-3 hours)
1. **Create base contact schema** with core fields
2. **Implement discriminated union** for organization modes
3. **Add transform integration** using new Zod transform system
4. **Create type exports** with z.infer<> pattern

### Step 3: Transform Migration (1-2 hours)
1. **Implement contact-specific transforms** in ZodTransforms
2. **Test transform parity** with existing FormTransforms
3. **Handle array transform** for preferred_principals
4. **Validate UUID handling** in cross-entity relationships

### Step 4: Validation Logic (2-3 hours)
1. **Implement conditional validation** using discriminated unions
2. **Add custom error messages** for organization creation context
3. **Handle cross-entity validation** for preferred principals
4. **Test validation edge cases** (empty strings, null values, array handling)

### Step 5: Integration Testing (1-2 hours)
1. **Update contact form** to use new schema
2. **Test form field conditional rendering** with mode switching
3. **Validate error message display** in UI components
4. **Test organization creation flow** end-to-end

### Step 6: Rollback Procedures (1 hour)
1. **Implement feature flag** for Yup vs Zod schema selection
2. **Create rollback script** to revert to Yup validation
3. **Test rollback functionality** with existing data

## Testing Strategy for Complex Conditional Logic

### Validation Parity Tests
```typescript
describe('Contact Validation Parity', () => {
  const testCases = [
    // Organization mode = 'existing'
    { organization_mode: 'existing', organization_id: 'valid-uuid', organization_name: null },
    { organization_mode: 'existing', organization_id: null, organization_name: null }, // should fail

    // Organization mode = 'new'
    { organization_mode: 'new', organization_name: 'Test Org', organization_type: 'customer' },
    { organization_mode: 'new', organization_name: '', organization_type: 'customer' }, // should fail
    { organization_mode: 'new', organization_name: 'Test Org', organization_type: null }, // should fail
  ]

  testCases.forEach((testCase, index) => {
    it(`should validate case ${index + 1} identically in Yup and Zod`, async () => {
      const yupResult = await yupContactSchema.validate(testCase).catch(err => err)
      const zodResult = zodContactSchema.safeParse(testCase)

      expect(yupResult.success).toBe(zodResult.success)
      if (!yupResult.success && !zodResult.success) {
        expect(normalizeErrorMessage(yupResult.message))
          .toBe(normalizeErrorMessage(zodResult.error.issues[0].message))
      }
    })
  })
})
```

### Form Integration Tests
1. **Mode switching behavior**: Test field visibility changes
2. **Conditional validation**: Test required field enforcement
3. **Error message display**: Test UI error handling
4. **Cross-entity creation**: Test organization + contact creation flow

### Transform Function Tests
1. **Nullable string handling**: Empty string → null conversion
2. **Email normalization**: Case handling and validation
3. **Phone normalization**: Format consistency
4. **Array filtering**: Undefined value removal

## Estimated Migration Effort

**Total Effort**: 7-11 hours
- **Schema Implementation**: 2-3 hours
- **Transform Migration**: 1-2 hours
- **Validation Logic**: 2-3 hours
- **Integration Testing**: 1-2 hours
- **Documentation & Rollback**: 1 hour

**Complexity Level**: **Medium-High** (3.5/5)
- More complex than Organization/Product (discriminated union pattern)
- Less complex than Opportunity/Interaction (fewer cross-entity dependencies)
- Primary complexity in conditional validation and transform integration

**Migration Readiness**: Ready for implementation after prerequisite tasks complete

## Conclusion

The contact validation migration represents a **critical milestone** in the Yup to Zod migration, as it's the first schema to implement the discriminated union pattern that will be used in opportunity and interaction schemas. Success in handling the organization creation mode logic will establish patterns for more complex conditional validation in later phases.

**Key Success Factors**:
1. **Thorough testing** of discriminated union behavior
2. **Transform parity** validation between Yup and Zod
3. **Form integration** compatibility with conditional rendering
4. **Cross-entity validation** preservation for preferred principals

**Next Steps**: Upon completion of prerequisite tasks, implement contact schema migration using the discriminated union strategy outlined above, with comprehensive validation parity testing to ensure behavioral consistency.