# Form Architecture & React Hook Form Integration Analysis

Comprehensive analysis of the CRM form system architecture and React Hook Form integration patterns, focusing on current yupResolver integration patterns and migration touchpoints for potential Zod migration.

## Relevant Files

**Core Form Components:**
- `/src/components/forms/SimpleForm.tsx`: Declarative form builder with field configuration arrays
- `/src/components/forms/BusinessForm.tsx`: Advanced multi-section forms with collapsible sections and progressive disclosure
- `/src/components/forms/FormField.tsx`: Field wrapper component with label, validation, and description handling
- `/src/components/forms/FormInput.tsx`: Input component supporting 8 field types (text, email, tel, url, number, date, textarea, select, radio, switch)
- `/src/components/forms/FormSubmitButton.tsx`: Loading-aware submit button component
- `/src/components/forms/FormProgressBar.tsx`: Form completion progress tracking

**Central Form Setup:**
- `/src/hooks/useCoreFormSetup.ts`: Central form setup hook with standardized yupResolver integration
- `/src/lib/form-resolver.ts`: Type-safe Yup resolver wrapper eliminating 'as any' casting
- `/src/lib/form-transforms.ts`: 15+ transform functions for field normalization and type conversion
- `/src/lib/utils/form-utils.ts`: Responsive layout utilities for dialog vs page contexts

**Entity-Specific Form Hooks:**
- `/src/features/opportunities/hooks/useOpportunityForm.ts`: Complex form with multi-step validation and filtered options
- `/src/features/auth/hooks/useSignUpForm.ts`: Custom form state management without React Hook Form
- `/src/features/contacts/hooks/useContactFormState.ts`: Contact-specific form state patterns
- `/src/features/organizations/hooks/useOrganizationFormData.ts`: Organization form data management

**Type Definitions & Schemas:**
- `/src/types/opportunity.types.ts`: Comprehensive Yup schema with 145 lines of validation logic
- `/src/types/contact.types.ts`: Contact validation schemas and form data types
- `/src/types/organization.types.ts`: Organization validation schemas and types
- `/src/types/forms/form-handlers.ts`: Shared form interface definitions

## Architectural Patterns

**React Hook Form Integration:**
- **Resolver Pattern**: Consistent use of `yupResolver(schema)` with type casting (`as never`) for complex generics
- **Mode Configuration**: All forms use `mode: 'onBlur'` for better UX (validation on blur, not every keystroke)
- **Type Safety**: Heavy use of TypeScript generics with `FieldValues` and `Path<T>` constraints throughout
- **Central Setup**: `useCoreFormSetup` hook provides standardized form initialization with yupResolver integration

**Form Component Hierarchy:**
- **SimpleForm**: Declarative field configuration using `SimpleFormField[]` arrays with conditional rendering via `condition` functions
- **BusinessForm**: Multi-section forms with collapsible sections, progressive disclosure, and field dependencies
- **FormField**: Atomic component handling both heading (`type: 'heading'`) and regular input fields with proper shadcn/ui integration
- **FormInput**: Comprehensive field type support with autocomplete attributes, validation states, and responsive styling

**Schema-Driven Validation:**
- **Type Inference**: All form data types derived via `yup.InferType<typeof schema>` for type safety
- **Transform Integration**: Heavy reliance on `FormTransforms` for field normalization (nullable strings, UUIDs, numbers)
- **Conditional Validation**: Complex `yup.when()` patterns for field interdependencies and contextual requirements
- **Multi-Step Validation**: Step-based validation for complex forms (opportunities) using targeted field triggers

**Dialog Context Adaptation:**
- **Responsive Layouts**: Forms automatically adapt grid classes and spacing based on `useDialogContext()`
- **Button Styling**: Form actions adapt sizing and layout for dialog vs page contexts
- **Field Layouts**: Dynamic grid classes adjust columns based on dialog size and field count

## Current yupResolver Integration Patterns

**Standard Integration Pattern:**
```typescript
const form = useForm<T>({
  resolver: yupResolver(validationSchema) as never,
  defaultValues: defaultValues as never,
  mode: 'onBlur',
})
```

**Type Safety Wrapper:**
```typescript
// From form-resolver.ts
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}
```

**Entity-Specific Hooks Pattern:**
```typescript
export const useOpportunityForm = ({ preselectedOrganization }: Props = {}) => {
  const form = useForm<OpportunityFormData>({
    resolver: yupResolver(opportunitySchema) as never,
    mode: 'onBlur',
    defaultValues: { /* ... */ },
  })

  const getStepValidation = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1: return await trigger(['name'])
      case 2: return await trigger(['organization_id'])
      // ...
    }
  }
}
```

## Form Validation Architecture

**Multi-Level Validation:**
- **Field-Level**: Real-time validation on blur using Yup schema field validation
- **Cross-Field**: Complex dependencies using `yup.when()` for conditional requirements
- **Form-Level**: Complete form validation on submit with aggregated error reporting
- **Step-Based**: Multi-step forms validate specific field groups using `trigger([fieldNames])`

**Transform Error Handling:**
- **Null Transforms**: `FormTransforms.nullableString` converts empty strings to null with proper typing
- **Type Conversion**: Automatic string-to-number and UUID validation with error fallbacks
- **Conditional Logic**: `conditionalTransform` factory for context-dependent validation requirements
- **Array Processing**: `ensureArray` and `emptyArrayToNull` for complex array field handling

**Error Surfacing Patterns:**
- **Field Errors**: `FormMessage` component displays field-level validation errors from Yup
- **Form Statistics**: Validation feedback hooks aggregate error counts and field completion
- **Database Errors**: `surfaceError` utility converts database errors to user-friendly messages
- **Warning System**: Support for non-blocking warnings alongside validation errors

## Form State Management Integration

**Server State Integration:**
- **Entity Options**: Forms integrate with TanStack Query hooks for dropdown data (organizations, contacts)
- **Filtered Options**: Dynamic filtering patterns (e.g., contacts filtered by selected organization)
- **Default Values**: Support for pre-populated forms with existing entity data
- **Watch Integration**: Real-time value watching for conditional logic and filtered options

**Form State Patterns:**
- **Progress Tracking**: Built-in completion percentage calculation using `useFormProgress`
- **Section Management**: Collapsible section state tracking with `expandedSections` state
- **Submission Handling**: Async submission with loading states and error propagation
- **Data Cleaning**: `cleanFormData` processing before submission to handle transforms

## Component Prop Patterns & Type Safety

**Field Configuration Interface:**
```typescript
export interface RegularFieldConfig extends BaseFieldConfig, InputConfig {
  name: string
  required?: boolean
  description?: string
  validation?: Record<string, unknown>
  condition?: (values: FieldValues) => boolean
}
```

**Form Component Generics:**
```typescript
interface SimpleFormProps<T extends FieldValues = FieldValues> {
  fields: SimpleFormField[]
  onSubmit: (data: T) => Promise<void> | void
  validationSchema?: AnyObjectSchema  // ← Migration touchpoint
  defaultValues?: Partial<T>
}
```

**Type Casting Patterns:**
- Heavy use of `as never` for complex generic constraints
- `TypedFormProps<T>` interface for eliminating unsafe casting
- `createTypedFormHelper` utility for improved type safety

## Migration Touchpoints & Integration Challenges

**High-Impact Integration Points:**

1. **Schema Definitions** (15+ files):
   - All `*.types.ts` files containing `yup.object()` schemas require complete rewrite
   - Complex validation logic like 145-line opportunity schema
   - `FormTransforms` integration needs Zod adaptation

2. **Resolver Integration** (8+ files):
   - `useCoreFormSetup.ts`: Change from `yupResolver` to `zodResolver`
   - All entity-specific form hooks using direct `yupResolver` calls
   - Import statements: `@hookform/resolvers/yup` → `@hookform/resolvers/zod`
   - Type casting patterns need adjustment for Zod resolver

3. **Transform Functions** (Critical):
   - `/src/lib/form-transforms.ts`: 15 transform functions need Zod adaptation
   - Yup `.transform()` syntax differs from Zod `.transform()`
   - Conditional validation (`yup.when()` → `z.discriminatedUnion()` or custom `z.refine()`)

**Medium-Impact Integration Points:**

4. **Type Inference Changes**:
   - `yup.InferType<typeof schema>` → `z.infer<typeof schema>`
   - TypeScript imports: `import * as yup from 'yup'` → `import { z } from 'zod'`
   - `AnyObjectSchema` type references need Zod equivalents

5. **Error Handling Differences**:
   - Zod error message structure may differ from Yup
   - Form validation feedback systems may need updates
   - Error aggregation patterns in validation hooks

**Form-Specific Challenges:**

6. **Complex Validation Patterns**:
   - Multi-step validation using targeted field triggers
   - Cross-field dependencies in BusinessForm sections
   - Array validation for principal selections with UUID constraints
   - Conditional field requirements based on form context

7. **Type Safety Integration**:
   - Generic type constraints with current `as never` casting patterns
   - React Hook Form resolver typing compatibility with Zod
   - Complex conditional type inference in entity schemas

## Edge Cases & Gotchas

**Complex Transform Chain Compatibility:**
- Multiple chained transforms for nullable fields need careful Zod adaptation
- UUID validation patterns integrated with form transforms
- Conditional transform factory patterns using `this.parent` context

**Multi-Step Form Validation:**
- Step-based validation using `trigger([fieldNames])` must maintain compatibility
- Progressive validation with field interdependencies
- Conditional section visibility based on validation state

**Dialog Context Integration:**
- Form layout adaptation based on dialog context must remain seamless
- Responsive grid classes and button styling integration
- Field visibility and validation in different dialog sizes

**Entity Relationship Validation:**
- Organization mode handling in contact forms
- Principal-distributor relationship validation
- Filtered dropdown options based on selected values

## Relevant Docs

**Internal References:**
- `/.docs/plans/yup-to-zod-migration/form-architecture.docs.md`: Previous migration analysis
- `/src/components/forms/README.md`: Form component usage patterns
- `/docs/STATE_MANAGEMENT_GUIDE.md`: State management architecture
- `/docs/DEVELOPMENT_WORKFLOW.md`: Development and validation processes

**External Documentation:**
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers/zod](https://github.com/react-hook-form/resolvers#zod)
- [Zod Transform Patterns](https://zod.dev/?id=transform)