# Form Development Guide
*React Hook Form patterns for KitchenPantry CRM*

## Overview

This guide provides comprehensive patterns for building high-performance, accessible forms in the KitchenPantry CRM using React Hook Form, TypeScript, and shadcn/ui components.

## Core Principles

### 1. Performance First
- Use uncontrolled components by default
- Minimize re-renders through proper field registration  
- Optimize validation with schema-based validation (Yup)
- Implement proper field isolation for complex forms

### 2. Type Safety
- Schema-first approach with Yup validation
- Generate TypeScript types from validation schemas
- Proper form data interfaces for all forms

### 3. Mobile-First Design
- iPad-optimized form layouts and touch targets
- Responsive form grids and field sizing
- Touch-friendly input components

### 4. Accessibility
- Proper form labeling and error messaging
- Keyboard navigation support
- Screen reader compatibility

## React Hook Form Performance Patterns

### Uncontrolled Components (Preferred)

React Hook Form's core strength is its uncontrolled component approach, minimizing re-renders:

```typescript
// ✅ GOOD: Uncontrolled - Minimal re-renders
const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input 
      {...register("firstName", { required: "First name is required" })} 
      placeholder="First Name"
    />
    <input 
      {...register("lastName", { required: "Last name is required" })} 
      placeholder="Last Name"
    />
    <input 
      {...register("email", { 
        required: "Email is required",
        pattern: {
          value: /^\S+@\S+$/i,
          message: "Invalid email format"
        }
      })} 
      placeholder="Email"
    />
    <button type="submit">Submit</button>
  </form>
)
```

### Controlled Components (When Necessary)

Use controlled components only when you need real-time field watching:

```typescript
// ✅ GOOD: Controlled only when needed
const { control, watch, setValue } = useForm<ContactFormData>()
const organizationId = watch('organizationId')

// Only re-render when organizationId changes
useEffect(() => {
  if (organizationId) {
    // Load contacts for selected organization
    loadContacts(organizationId)
  }
}, [organizationId])

return (
  <Controller
    control={control}
    name="organizationId"
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
)
```

## Schema-First Validation with Yup

### Basic Schema Pattern

```typescript
// schemas/contact.schema.ts
import * as yup from 'yup'

export const contactFormSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  organizationId: yup
    .string()
    .required('Organization is required'),
  position: yup
    .string()
    .optional(),
  email: yup
    .string()
    .email('Invalid email format')
    .optional(),
  phone: yup
    .string()
    .matches(/^[\+]?[0-9\(\)\-\s]+$/, 'Invalid phone format')
    .optional(),
  isPrimaryContact: yup
    .boolean()
    .default(false)
})

// Generate TypeScript type from schema
export type ContactFormData = yup.InferType<typeof contactFormSchema>
```

### Complex Validation Patterns

```typescript
// Advanced schema with conditional validation
export const opportunityFormSchema = yup.object({
  name: yup
    .string()
    .required('Opportunity name is required'),
  organizationId: yup
    .string()
    .required('Organization is required'),
  primaryContactId: yup
    .string()
    .required('Primary contact is required'),
  stage: yup
    .string()
    .oneOf(['New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'])
    .required('Stage is required'),
  valueEstimate: yup
    .number()
    .positive('Value must be positive')
    .when('stage', {
      is: (stage: string) => ['Proposal', 'Negotiation', 'Closed Won'].includes(stage),
      then: (schema) => schema.required('Value estimate required for this stage'),
      otherwise: (schema) => schema.optional()
    }),
  products: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one product must be selected')
    .required('Products are required')
})
```

### Form Integration with Yup Resolver

```typescript
import { yupResolver } from '@hookform/resolvers/yup'

function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactFormSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      organizationId: '',
      position: '',
      email: '',
      phone: '',
      isPrimaryContact: false
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

## shadcn/ui Form Component Integration

### Form Field Wrapper Pattern

```typescript
// components/FormFieldWrapper.tsx
interface FormFieldWrapperProps {
  control: Control<any>
  name: string
  label: string
  required?: boolean
  children: React.ReactNode
  description?: string
}

export function FormFieldWrapper({ 
  control, 
  name, 
  label, 
  required, 
  children, 
  description 
}: FormFieldWrapperProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {children}
          </FormControl>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          {fieldState.error && (
            <FormMessage>{fieldState.error.message}</FormMessage>
          )}
        </FormItem>
      )}
    />
  )
}
```

### Complete Form Implementation

```typescript
// components/ContactForm.tsx
interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<ContactFormData>
  loading?: boolean
  organizations: Organization[]
}

export function ContactForm({ onSubmit, initialData, loading, organizations }: ContactFormProps) {
  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactFormSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      organizationId: '',
      position: '',
      email: '',
      phone: '',
      isPrimaryContact: false
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Add or edit contact details
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldWrapper 
              control={form.control} 
              name="firstName" 
              label="First Name" 
              required
            >
              <Input placeholder="Enter first name" {...form.register('firstName')} />
            </FormFieldWrapper>

            <FormFieldWrapper 
              control={form.control} 
              name="lastName" 
              label="Last Name" 
              required
            >
              <Input placeholder="Enter last name" {...form.register('lastName')} />
            </FormFieldWrapper>
          </div>

          {/* Organization Selection */}
          <FormFieldWrapper 
            control={form.control} 
            name="organizationId" 
            label="Organization" 
            required
          >
            <Controller
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormFieldWrapper>

          {/* Contact Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldWrapper 
              control={form.control} 
              name="position" 
              label="Position"
            >
              <Input placeholder="Job title" {...form.register('position')} />
            </FormFieldWrapper>

            <FormFieldWrapper 
              control={form.control} 
              name="email" 
              label="Email"
            >
              <Input 
                type="email" 
                placeholder="email@company.com" 
                {...form.register('email')} 
              />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper 
            control={form.control} 
            name="phone" 
            label="Phone"
          >
            <Input 
              type="tel" 
              placeholder="(555) 123-4567" 
              {...form.register('phone')} 
            />
          </FormFieldWrapper>

          {/* Primary Contact Toggle */}
          <FormFieldWrapper 
            control={form.control} 
            name="isPrimaryContact" 
            label="Primary Contact"
            description="Set as the main contact for this organization"
          >
            <Controller
              control={form.control}
              name="isPrimaryContact"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label>Primary contact for organization</Label>
                </div>
              )}
            />
          </FormFieldWrapper>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Contact
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

## Mobile-First Form Design

### iPad-Optimized Layouts

```typescript
// Mobile-first responsive form grid
<div className="space-y-6">
  {/* Single column on mobile, two columns on tablet+ */}
  <div className="grid gap-4 md:grid-cols-2">
    <FormField name="firstName" />
    <FormField name="lastName" />
  </div>
  
  {/* Full width fields */}
  <div className="grid gap-4">
    <FormField name="organizationId" />
    <FormField name="email" />
  </div>
  
  {/* Three columns on larger screens */}
  <div className="grid gap-4 lg:grid-cols-3">
    <FormField name="phone" />
    <FormField name="position" />
    <FormField name="department" />
  </div>
</div>
```

### Touch-Friendly Input Components

```typescript
// Ensure minimum 44px touch targets
const TouchFriendlyInput = styled(Input)`
  min-height: 44px; // iOS/Android minimum touch target
  padding: 12px 16px;
  font-size: 16px; // Prevents zoom on iOS
`

// Custom Select with better mobile experience
<Select>
  <SelectTrigger className="h-12 text-base">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent className="max-h-[300px]">
    {/* Options */}
  </SelectContent>
</Select>
```

## Advanced Form Patterns

### Multi-Step Form Wizard

```typescript
// useMultiStepForm hook
export function useMultiStepForm<T>(steps: string[], schema: yup.ObjectSchema<T>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<T>>({})
  
  const form = useForm<T>({
    resolver: yupResolver(schema),
    defaultValues: formData as T
  })

  const nextStep = async () => {
    const isValid = await form.trigger() // Validate current step
    if (isValid && currentStep < steps.length - 1) {
      setFormData({ ...formData, ...form.getValues() })
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return {
    currentStep,
    totalSteps: steps.length,
    stepName: steps[currentStep],
    form,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: ((currentStep + 1) / steps.length) * 100
  }
}

// Multi-step form component
export function OpportunityWizard({ onSubmit }: OpportunityWizardProps) {
  const steps = ['Organization', 'Contact', 'Products', 'Details']
  const { currentStep, form, nextStep, prevStep, isFirstStep, isLastStep, progress } = 
    useMultiStepForm(steps, opportunityFormSchema)

  const handleNext = () => {
    if (isLastStep) {
      form.handleSubmit(onSubmit)()
    } else {
      nextStep()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Opportunity</CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent>
        {currentStep === 0 && <OrganizationStep form={form} />}
        {currentStep === 1 && <ContactStep form={form} />}
        {currentStep === 2 && <ProductsStep form={form} />}
        {currentStep === 3 && <DetailsStep form={form} />}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={prevStep}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {isLastStep ? 'Create Opportunity' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Dynamic Form Fields

```typescript
// Dynamic field array for products/contacts
export function ProductsSection({ control }: { control: Control<OpportunityFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Products</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => append({ productId: '', quantity: 1 })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-end">
          <FormField
            control={control}
            name={`products.${index}.productId`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name={`products.${index}.quantity`}
            render={({ field }) => (
              <FormItem className="w-24">
                <Input 
                  type="number" 
                  min="1"
                  placeholder="Qty"
                  {...field}
                />
              </FormItem>
            )}
          />

          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => remove(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
```

## Form Testing Patterns

### Unit Testing Forms

```typescript
// ContactForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOrganizations = [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'Beta LLC' }
  ]

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  test('renders all form fields', () => {
    render(<ContactForm onSubmit={mockOnSubmit} organizations={mockOrganizations} />)
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  test('validates required fields', async () => {
    render(<ContactForm onSubmit={mockOnSubmit} organizations={mockOrganizations} />)
    
    const submitButton = screen.getByText(/save contact/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  test('submits form with valid data', async () => {
    render(<ContactForm onSubmit={mockOnSubmit} organizations={mockOrganizations} />)
    
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' }
    })
    
    const submitButton = screen.getByText(/save contact/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        })
      )
    })
  })
})
```

## Performance Monitoring

### Form Performance Metrics

```typescript
// useFormPerformance hook
export function useFormPerformance(formName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(Date.now())
  
  useEffect(() => {
    renderCount.current += 1
    
    // Log excessive re-renders
    if (renderCount.current > 10) {
      console.warn(`${formName} has re-rendered ${renderCount.current} times`)
    }
  })
  
  const logSubmissionTime = useCallback(() => {
    const submissionTime = Date.now() - startTime.current
    console.log(`${formName} submission time: ${submissionTime}ms`)
  }, [formName])
  
  return { renderCount: renderCount.current, logSubmissionTime }
}
```

## Best Practices Summary

### Do ✅
- Use uncontrolled components by default
- Implement schema-first validation with Yup
- Generate TypeScript types from schemas
- Use FormFieldWrapper for consistent styling
- Optimize for mobile/iPad touch interfaces
- Implement proper error handling and loading states
- Test forms thoroughly with unit tests
- Monitor form performance

### Avoid ❌
- Overusing controlled components (causes re-renders)
- Manual validation logic (use schemas)
- Inline validation functions (define in schemas)
- Ignoring mobile touch targets
- Complex form state management without React Hook Form
- Missing accessibility attributes
- Skipping form validation testing

This guide provides the foundation for building high-performance, accessible forms that work excellently on both desktop and mobile devices in the KitchenPantry CRM system.