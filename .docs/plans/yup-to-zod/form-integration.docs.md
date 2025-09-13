# React Hook Form Integration Patterns in CRM Project

## Executive Summary

This document provides a comprehensive analysis of React Hook Form integration patterns used in the CRM project, focusing on validation systems, form resolvers, component architecture, error handling, and type safety approaches. The project currently uses Yup for validation but has extensive infrastructure that would support migration to Zod.

## Current Architecture Overview

### Tech Stack
- **Form Library**: React Hook Form v7
- **Validation**: Yup schemas with custom transforms
- **UI Components**: shadcn/ui + custom form components
- **Type Safety**: Full TypeScript with typed resolvers
- **State Management**: TanStack Query for server state, Zustand for client state

### Key Directories
```
src/
├── components/forms/           # Reusable form components
├── lib/form-resolver.ts       # Custom typed Yup resolver
├── lib/form-transforms.ts     # Yup transform utilities
├── types/forms/               # Form type definitions
├── types/*types.ts           # Entity-specific schemas
└── features/*/hooks/          # Entity-specific form hooks
```

## Form Component Architecture

### 1. Core Form Components

#### SimpleForm (`src/components/forms/SimpleForm.tsx`)
**Purpose**: Declarative form builder for basic forms with automatic layout adaptation.

**Key Features**:
- Declarative field configuration using `SimpleFormField[]`
- Automatic grid layout based on dialog context
- Progress tracking with `useFormProgress`
- Built-in validation feedback
- Conditional field visibility

**Usage Pattern**:
```typescript
<SimpleForm<ContactFormData>
  fields={fields}
  onSubmit={onSubmit}
  validationSchema={contactSchema}
  defaultValues={initialData}
  showProgress={true}
/>
```

**Resolver Integration**:
```typescript
const form = useForm<T>({
  resolver: validationSchema ? yupResolver(validationSchema) : undefined,
  defaultValues: defaultValues as never,
  mode: 'onBlur'
})
```

#### BusinessForm (`src/components/forms/BusinessForm.tsx`)
**Purpose**: Advanced multi-section form with progressive disclosure and complex validation dependencies.

**Key Features**:
- Section-based organization with collapsible sections
- Conditional field dependencies based on form values
- Progress calculation across multiple sections
- Dynamic section visibility based on form state
- Form state-driven field rendering

**Section Configuration**:
```typescript
export interface FormSection {
  id: string
  title: string
  description?: string
  fields: BusinessFormField[]
  required?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  condition?: <T extends FieldValues>(values: T) => boolean
  className?: string
}
```

**Field Dependencies**:
```typescript
export interface BusinessFormField extends RegularFieldConfig {
  dependency?: {
    field: string
    value: string | number | boolean | null
    condition?: 'equals' | 'not_equals' | 'includes' | 'not_includes'
  }
}
```

### 2. Form Field Components

#### FormField (`src/components/forms/FormField.tsx`)
**Purpose**: Universal form field component with type safety and validation integration.

**Features**:
- Automatic field type detection
- Integrated error display
- Loading states and validation indicators
- Conditional rendering support
- Accessibility features

#### FormValidationFeedback (`src/components/forms/FormValidationFeedback.tsx`)
**Purpose**: Comprehensive validation feedback system with multiple error types.

**Error Types**:
- **Error**: Blocking validation failures
- **Warning**: Non-blocking recommendations
- **Info**: Informational messages
- **Success**: Validation success states

**Components**:
- `FormValidationFeedback`: Main feedback component
- `FieldValidationIndicator`: Individual field indicators
- `FormProgressIndicator`: Form completion tracking

### 3. Specialized Components

#### EntitySelect (`src/components/forms/EntitySelect.tsx`)
**Purpose**: Searchable entity selection with async loading and relationship management.

**Features**:
- Async data loading with debounced search
- Loading states and skeleton UI
- Multi-entity support (organizations, contacts, products)
- Preselection support for relationship forms

## Validation System Architecture

### 1. Schema Definitions

The project uses comprehensive Yup schemas for each entity:

#### Contact Schema (`src/types/contact.types.ts`)
- **Required Fields**: `first_name`, `last_name`, `purchase_influence`, `decision_authority`
- **Optional Fields**: `email`, `title`, `department`, `phone`, `mobile_phone`, etc.
- **Virtual Fields**: `organization_mode`, `organization_name` for form handling
- **Transforms**: Extensive use of `FormTransforms` for data normalization

#### Organization Schema (`src/types/organization.types.ts`)
- Complex validation with conditional requirements
- Multi-address support (billing/shipping)
- Relationship management (parent organizations, managers)

#### Zod Schema Example (`src/components/forms/CRMFormSchemas.tsx`)
**Note**: The project has a comprehensive Zod schema system alongside Yup, indicating preparation for migration:

```typescript
export const contactFormSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters'),

  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),

  organizationId: z.string().uuid('Invalid organization ID').optional(),

  status: z.enum(['active', 'inactive', 'pending'], {
    required_error: 'Status is required',
  }),

  address: addressSchema.optional(),
})
```

### 2. Transform System (`src/lib/form-transforms.ts`)

**Purpose**: Handles data transformation between form inputs and database schemas.

**Key Transforms**:
```typescript
export const FormTransforms = {
  nullableString: emptyStringToNull,
  requiredString: (value: unknown): string => { /* validation */ },
  nullableNumber: emptyStringToNullNumber,
  nullableEmail: normalizeEmail,
  nullablePhone: normalizePhone,
  nullableUrl: emptyStringToNullUrl,
  optionalArray: ensureArray,
  booleanField: stringToBoolean,
  uuidField: normalizeUuid,
}
```

**Conditional Transforms**:
```typescript
organization_name: yup.string()
  .when('organization_mode', {
    is: 'new',
    then: (schema) => schema.required('Organization name required'),
  })
```

### 3. Resolver Architecture

#### Custom Typed Resolver (`src/lib/form-resolver.ts`)
**Purpose**: Eliminates `as any` casting while maintaining type safety.

```typescript
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}

export interface TypedFormProps<T extends FieldValues> {
  form: {
    control: Record<string, unknown>
    handleSubmit: (onSubmit: (data: T) => void) => (e?: BaseSyntheticEvent) => Promise<void>
    formState: {
      errors: Record<string, unknown>
      isSubmitting: boolean
      isDirty: boolean
      isValid: boolean
    }
    // ... additional methods
  }
}
```

#### Enhanced Form Handler Types (`src/types/forms/form-handlers.ts`)
**Purpose**: Comprehensive type definitions eliminating `any` types.

```typescript
export type TypedYupResolver<T extends FieldValues> = Resolver<T>

export function createTypedYupResolver<T extends FieldValues>(
  schema: ObjectSchema<Record<string, unknown>>
): TypedYupResolver<T> {
  return yupResolver(schema) as TypedYupResolver<T>
}
```

## Form Hook Patterns

### 1. Entity-Specific Hooks

#### useOpportunityForm (`src/features/opportunities/hooks/useOpportunityForm.ts`)
**Features**:
- Full form method exposure with type safety
- Related entity data loading (organizations, contacts)
- Filtered data based on form selections
- Step-by-step validation for multi-step forms
- Validation range checking

```typescript
export interface UseOpportunityFormReturn {
  // Form methods
  register: ReturnType<typeof useForm<OpportunityFormData>>['register']
  handleSubmit: ReturnType<typeof useForm<OpportunityFormData>>['handleSubmit']
  setValue: ReturnType<typeof useForm<OpportunityFormData>>['setValue']
  watch: ReturnType<typeof useForm<OpportunityFormData>>['watch']

  // Derived data
  organizations: Organization[]
  contacts: Contact[]
  filteredContacts: Contact[]

  // Validation helpers
  getStepValidation: (step: number) => Promise<boolean>
  validateStepsRange: (fromStep: number, toStep: number) => Promise<boolean>
}
```

#### useCoreFormSetup (`src/hooks/useCoreFormSetup.ts`)
**Purpose**: Standardized form initialization with layout integration.

```typescript
export function useCoreFormSetup<T extends FieldValues>({
  formSchema,
  initialData,
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = [],
  onSubmit,
}: CoreFormSetupProps<T>) {
  const form = useForm<T>({
    resolver: yupResolver(formSchema) as never,
    defaultValues: initialData as DefaultValues<T>,
  })

  const formLayout = useFormLayout({
    entityType,
    showAdvancedOptions,
    coreSections,
    optionalSections,
    contextualSections,
    form: form as never,
  })

  return {
    form,
    formLayout,
    handleSubmit,
  }
}
```

### 2. Form State Management

#### useContactFormState (`src/features/contacts/hooks/useContactFormState.ts`)
- Organization relationship management
- Dynamic field visibility
- Form data persistence
- Validation state tracking

#### useFormProgress (`src/components/forms/hooks/useFormProgress.ts`)
- Field completion tracking
- Progress percentage calculation
- Required vs optional field distinction
- Real-time progress updates

## Error Handling Patterns

### 1. Validation Error Structure

```typescript
interface FormValidationError {
  field: string
  message: string
  type?: 'error' | 'warning'
}
```

### 2. Error Display Components

#### FormValidationFeedback Component
**Features**:
- Multiple error types (error, warning, info, success)
- Contextual feedback based on form state
- Progress indication
- Field-specific error grouping

**Error States**:
- **Submitting**: Loading indicator
- **Success**: Confirmation message
- **Errors**: Detailed error list with field names
- **Warnings**: Non-blocking recommendations
- **Valid & Dirty**: Ready to submit indication

### 3. Field-Level Validation

#### FieldValidationIndicator
- Real-time validation status
- Visual indicators (checkmarks, error icons)
- Loading states during async validation
- Accessibility support

## Type Safety Approaches

### 1. Generic Form Components

```typescript
export function SimpleForm<T extends FieldValues = FieldValues>({
  fields,
  onSubmit,
  validationSchema,
  defaultValues,
  // ...
}: SimpleFormProps<T>)
```

### 2. Typed Hook Returns

```typescript
export const useOpportunityForm = ({
  preselectedOrganization,
  preselectedContact,
}: UseOpportunityFormProps = {}): UseOpportunityFormReturn
```

### 3. Schema Type Inference

```typescript
// Yup schemas
export type ContactFormData = yup.InferType<typeof contactSchema>

// Zod schemas (prepared for migration)
export type ContactFormData = z.infer<typeof contactFormSchema>
```

### 4. Resolver Type Safety

```typescript
const form = useForm<OpportunityFormData>({
  resolver: yupResolver(opportunitySchema) as never, // Current approach
  // vs
  resolver: createTypedYupResolver(opportunitySchema), // Typed approach
})
```

## Integration with UI Components

### 1. shadcn/ui Integration

The forms integrate seamlessly with shadcn/ui components:
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- Consistent styling with design tokens
- Accessibility features built-in
- Mobile-responsive layouts

### 2. Design Token Usage

```typescript
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'

// Consistent spacing and typography
className={cn(semanticSpacing.stack.xs, semanticTypography.body)}
```

### 3. Dialog Context Integration

Forms automatically adapt to dialog contexts:
```typescript
const { isInDialog } = useDialogContext()
const gridClasses = getFormGridClasses(isInDialog, fields.length)
const spacingClasses = getFormSpacingClasses(isInDialog)
```

## Key Findings for Zod Migration

### 1. Dual Schema System Ready
The project already has comprehensive Zod schemas in `CRMFormSchemas.tsx`, indicating readiness for migration.

### 2. Transform System Compatibility
The current `FormTransforms` system can be adapted for Zod's `.transform()` methods with minimal changes.

### 3. Type Inference Patterns
Both Yup (`yup.InferType`) and Zod (`z.infer`) patterns are already in use, showing migration path clarity.

### 4. Resolver Abstraction
The typed resolver system (`createTypedYupResolver`) can be easily adapted to create `createTypedZodResolver`.

### 5. Minimal Component Changes
Form components are resolver-agnostic, requiring only resolver swapping in form hooks.

## Migration Recommendations

### 1. **Phase 1**: Infrastructure Preparation
- Create `createTypedZodResolver` utility
- Adapt transform utilities for Zod
- Set up Zod-compatible error handling

### 2. **Phase 2**: Schema Migration
- Convert existing Yup schemas to Zod equivalently
- Maintain dual validation during transition
- Update type inference patterns

### 3. **Phase 3**: Hook Updates
- Update entity-specific form hooks to use Zod resolvers
- Test validation parity between old and new schemas
- Update form component integrations

### 4. **Phase 4**: Cleanup
- Remove Yup dependencies
- Clean up legacy resolver utilities
- Update documentation

## Conclusion

The CRM project has a sophisticated form architecture with excellent type safety, comprehensive validation, and modern patterns. The existing infrastructure strongly supports Zod migration with minimal disruption to the component architecture. The dual schema system already in place indicates forward-thinking preparation for this migration.