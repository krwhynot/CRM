# CoreFormLayout Component Design Specification

## Overview

The CoreFormLayout component serves as the foundational structure for all optimized CRM forms in the Principal CRM system. This design prioritizes iPad-first user experience, TypeScript safety, and shadcn-ui compliance while providing a universal template that works across all 5 entity types.

## Design Principles

### 1. iPad-First Design Philosophy
- **Primary Target**: iPad landscape (1024×768) and portrait (768×1024) modes
- **Touch Targets**: Minimum 44px height for all interactive elements
- **Spacing**: Generous spacing using Tailwind's space-y-6 for sections, gap-4 for related fields
- **Typography**: Base text size of 16px (`text-base`) to prevent zoom on iOS devices
- **Single Column**: Primary layout uses single column with responsive breakpoints for larger screens

### 2. Universal Entity Support
The layout supports all 5 core CRM entities:
- **Organizations**: Business accounts with priority/segment classification
- **Contacts**: Individual people with role/influence tracking
- **Products**: Items with pricing/availability management
- **Opportunities**: Sales deals with stage/probability tracking
- **Interactions**: Communication logs with type/outcome classification

### 3. Progressive Disclosure Pattern
- **Core Fields**: Always visible, essential for entity creation
- **Optional Details**: Expandable sections using Collapsible component
- **Contextual Information**: Show/hide based on field values (e.g., Principal advocacy summary)
- **No Deep Nesting**: Maximum 2 levels of disclosure to maintain usability

## Component Architecture

### TypeScript Interface Definition

```typescript
// Core form layout interface
interface CoreFormLayoutProps<T extends Record<string, any>> {
  // Form configuration
  title: string
  icon: React.ComponentType<{ className?: string }>
  formSchema: yup.ObjectSchema<T>
  onSubmit: (data: T) => void | Promise<void>
  
  // Data and state
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string
  
  // Layout configuration
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  showAdvancedOptions?: boolean
  
  // Sections configuration
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
}

interface FormSection<T> {
  id: string
  title?: string
  description?: string
  fields: FormFieldConfig<T>[]
  layout?: 'single' | 'double' | 'triple' | 'auto'
  className?: string
}

interface FormFieldConfig<T> {
  name: keyof T
  type: 'text' | 'select' | 'textarea' | 'switch' | 'checkbox' | 'number' | 'email' | 'tel' | 'url'
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  options?: SelectOption[]
  tooltip?: string
  validation?: yup.Schema
  conditional?: (values: T) => boolean
  className?: string
}

interface ConditionalSection<T> {
  condition: (values: T) => boolean
  section: FormSection<T>
}

interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: string
  badge?: { text: string; variant: string; className?: string }
}
```

### Layout Structure Classes

```css
/* iPad-optimized spacing and sizing */
.core-form-layout {
  @apply w-full max-w-4xl mx-auto;
}

.core-form-card {
  @apply bg-white rounded-lg border shadow-sm;
}

.core-form-header {
  @apply p-6 border-b;
}

.core-form-title {
  @apply text-xl font-semibold text-gray-900 flex items-center gap-3;
}

.core-form-content {
  @apply p-6 space-y-8;
}

/* Touch-optimized form controls */
.core-form-input {
  @apply h-12 text-base px-4 rounded-md border border-gray-300 
         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
         disabled:bg-gray-50 disabled:text-gray-500;
}

.core-form-select {
  @apply h-12 text-base;
}

.core-form-textarea {
  @apply text-base p-4 rounded-md border border-gray-300 
         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
         resize-none;
}

.core-form-button {
  @apply h-12 text-base px-6 rounded-md font-medium
         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

/* Section layouts */
.core-form-section {
  @apply space-y-6;
}

.core-form-field-group-single {
  @apply space-y-4;
}

.core-form-field-group-double {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.core-form-field-group-triple {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.core-form-field-group-auto {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

/* Progressive disclosure */
.core-form-collapsible-trigger {
  @apply flex items-center gap-2 text-sm font-medium 
         text-gray-600 hover:text-gray-900 
         transition-colors cursor-pointer
         py-2 border-t border-gray-100 mt-6;
}

.core-form-collapsible-content {
  @apply space-y-6 mt-6 pt-6 border-t border-gray-100;
}

/* Contextual sections */
.core-form-contextual-info {
  @apply p-4 rounded-lg border-l-4 bg-blue-50 border-blue-400;
}

.core-form-contextual-warning {
  @apply p-4 rounded-lg border-l-4 bg-amber-50 border-amber-400;
}

.core-form-contextual-success {
  @apply p-4 rounded-lg border-l-4 bg-green-50 border-green-400;
}
```

## Entity-Specific Configurations

### Organization Form Configuration

```typescript
const organizationFormConfig: EntityFormConfig<OrganizationFormData> = {
  entityType: 'organization',
  title: 'Organization',
  icon: Building2,
  
  coreSections: [
    {
      id: 'basic-info',
      title: 'Essential Information',
      layout: 'double',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Organization Name',
          placeholder: 'Enter organization name',
          required: true,
          className: 'md:col-span-2'
        },
        {
          name: 'priority',
          type: 'select',
          label: 'Account Priority',
          required: true,
          tooltip: 'Set the strategic importance and engagement level',
          options: priorityOptions
        },
        {
          name: 'segment',
          type: 'select',
          label: 'Food Service Segment',
          required: true,
          tooltip: 'Primary food service market segment',
          options: segmentOptions
        }
      ]
    },
    {
      id: 'organization-type',
      title: 'Organization Type',
      description: 'Define the business relationship',
      className: 'bg-amber-50 border border-amber-200 rounded-lg p-4',
      layout: 'double',
      fields: [
        {
          name: 'is_principal',
          type: 'switch',
          label: 'Principal Organization',
          description: 'Food manufacturer or supplier that we represent'
        },
        {
          name: 'is_distributor',
          type: 'switch', 
          label: 'Distributor Organization',
          description: 'Company that purchases and distributes our products'
        }
      ]
    }
  ],
  
  optionalSections: [
    {
      id: 'contact-info',
      title: 'Contact Information',
      layout: 'double',
      fields: [
        { name: 'phone', type: 'tel', label: 'Phone', placeholder: '(555) 123-4567' },
        { name: 'website', type: 'url', label: 'Website', placeholder: 'https://www.company.com' },
        { 
          name: 'account_manager', 
          type: 'text', 
          label: 'Account Manager',
          description: 'Primary person managing this account relationship',
          className: 'md:col-span-2'
        }
      ]
    },
    {
      id: 'address-info',
      title: 'Address Information',
      fields: [
        { 
          name: 'address', 
          type: 'text', 
          label: 'Street Address',
          placeholder: '123 Main Street, Suite 100'
        },
        { name: 'city', type: 'text', label: 'City', placeholder: 'City' },
        { name: 'state', type: 'text', label: 'State/Province', placeholder: 'State' },
        { name: 'zip', type: 'text', label: 'ZIP/Postal Code', placeholder: '12345' }
      ],
      layout: 'auto'
    }
  ],
  
  contextualSections: [
    {
      condition: (values) => values.is_principal && Boolean(initialData?.id),
      section: {
        id: 'advocacy-summary',
        component: 'AdvocacySummary',
        props: { organizationId: initialData?.id }
      }
    }
  ]
}
```

### Contact Form Configuration

```typescript
const contactFormConfig: EntityFormConfig<ContactFormData> = {
  entityType: 'contact',
  title: 'Contact',
  icon: Users,
  
  coreSections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      layout: 'double',
      fields: [
        { name: 'first_name', type: 'text', label: 'First Name', required: true },
        { name: 'last_name', type: 'text', label: 'Last Name', required: true },
        { name: 'title', type: 'text', label: 'Job Title', placeholder: 'e.g., Executive Chef, Food Service Director' },
        { name: 'organization_id', type: 'select', label: 'Organization', required: true, options: organizationOptions }
      ]
    },
    {
      id: 'business-context',
      title: 'Business Context',
      description: 'Define their role in purchasing decisions',
      layout: 'double',
      fields: [
        {
          name: 'purchase_influence',
          type: 'select',
          label: 'Purchase Influence',
          tooltip: 'Level of influence on purchasing decisions',
          options: purchaseInfluenceOptions
        },
        {
          name: 'decision_authority',
          type: 'select',
          label: 'Decision Authority',
          tooltip: 'Role in the decision-making process',
          options: decisionAuthorityOptions
        }
      ]
    }
  ],
  
  optionalSections: [
    {
      id: 'contact-details',
      title: 'Contact Details',
      layout: 'double',
      fields: [
        { name: 'email', type: 'email', label: 'Email Address' },
        { name: 'phone', type: 'tel', label: 'Phone Number' },
        { name: 'mobile', type: 'tel', label: 'Mobile Number' }
      ]
    }
  ]
}
```

## Implementation Examples

### Core Component Structure

```typescript
// src/components/forms/CoreFormLayout.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormFieldRenderer } from './FormFieldRenderer'
import { ConditionalSectionRenderer } from './ConditionalSectionRenderer'

export function CoreFormLayout<T extends Record<string, any>>({
  title,
  icon: Icon,
  formSchema,
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save',
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = []
}: CoreFormLayoutProps<T>) {
  const [showOptionalSections, setShowOptionalSections] = useState(showAdvancedOptions)
  
  const form = useForm<T>({
    resolver: yupResolver(formSchema),
    defaultValues: initialData as T
  })
  
  const watchedValues = form.watch()
  
  const handleSubmit = (data: T) => {
    // Clean empty strings to null for optional fields
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value
      ])
    ) as T
    
    onSubmit(cleanData)
  }
  
  return (
    <Card className="core-form-layout">
      <CardHeader className="core-form-header">
        <CardTitle className="core-form-title">
          <Icon className="h-5 w-5" />
          {initialData ? `Edit ${title}` : `New ${title}`}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="core-form-content">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            {/* Core Sections - Always Visible */}
            {coreSections.map((section) => (
              <FormSection
                key={section.id}
                section={section}
                form={form}
                loading={loading}
                entityType={entityType}
              />
            ))}
            
            {/* Contextual Sections - Conditionally Visible */}
            {contextualSections.map((conditionalSection, index) => (
              <ConditionalSectionRenderer
                key={`contextual-${index}`}
                condition={conditionalSection.condition}
                section={conditionalSection.section}
                watchedValues={watchedValues}
                form={form}
              />
            ))}
            
            {/* Optional Sections - Collapsible */}
            {optionalSections.length > 0 && (
              <Collapsible 
                open={showOptionalSections} 
                onOpenChange={setShowOptionalSections}
              >
                <CollapsibleTrigger className="core-form-collapsible-trigger">
                  {showOptionalSections ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  Additional Details (Optional)
                </CollapsibleTrigger>
                
                <CollapsibleContent className="core-form-collapsible-content">
                  {optionalSections.map((section) => (
                    <FormSection
                      key={section.id}
                      section={section}
                      form={form}
                      loading={loading}
                      entityType={entityType}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Notes Section - Universal */}
            <FormFieldRenderer
              field={{
                name: 'notes' as keyof T,
                type: 'textarea',
                label: 'Additional Notes',
                placeholder: `Any additional information about this ${entityType}...`,
                description: 'Internal notes, special requirements, relationship history, etc.'
              }}
              form={form}
              loading={loading}
              className="core-form-section"
            />
            
            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={loading} 
                className="core-form-button flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  submitLabel
                )}
              </Button>
              
              {initialData && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="core-form-button"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              )}
            </div>
            
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### Form Section Renderer

```typescript
// src/components/forms/FormSection.tsx
interface FormSectionProps<T> {
  section: FormSection<T>
  form: UseFormReturn<T>
  loading: boolean
  entityType: string
}

export function FormSection<T>({ 
  section, 
  form, 
  loading, 
  entityType 
}: FormSectionProps<T>) {
  const layoutClass = getLayoutClass(section.layout)
  
  return (
    <div className={cn("core-form-section", section.className)}>
      {section.title && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {section.title}
          </h3>
          {section.description && (
            <p className="text-sm text-gray-600">
              {section.description}
            </p>
          )}
        </div>
      )}
      
      <div className={layoutClass}>
        {section.fields.map((field) => (
          <FormFieldRenderer
            key={String(field.name)}
            field={field}
            form={form}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}

function getLayoutClass(layout: FormSection<any>['layout']): string {
  switch (layout) {
    case 'single': return 'core-form-field-group-single'
    case 'double': return 'core-form-field-group-double'
    case 'triple': return 'core-form-field-group-triple'
    case 'auto': return 'core-form-field-group-auto'
    default: return 'core-form-field-group-single'
  }
}
```

### Form Field Renderer

```typescript
// src/components/forms/FormFieldRenderer.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface FormFieldRendererProps<T> {
  field: FormFieldConfig<T>
  form: UseFormReturn<T>
  loading: boolean
  className?: string
}

export function FormFieldRenderer<T>({ 
  field, 
  form, 
  loading, 
  className 
}: FormFieldRendererProps<T>) {
  const { name, type, label, placeholder, description, required, options, tooltip } = field
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: formField }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center gap-2">
            {label}
            {required && <span className="text-red-500">*</span>}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </FormLabel>
          
          <FormControl>
            {renderFormControl(type, formField, placeholder, loading, options)}
          </FormControl>
          
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function renderFormControl(
  type: FormFieldConfig<any>['type'],
  field: any,
  placeholder?: string,
  loading?: boolean,
  options?: SelectOption[]
) {
  const baseInputClass = "core-form-input"
  
  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
      return (
        <Input
          type={type}
          placeholder={placeholder}
          disabled={loading}
          className={baseInputClass}
          {...field}
        />
      )
      
    case 'textarea':
      return (
        <Textarea
          placeholder={placeholder}
          disabled={loading}
          rows={4}
          className="core-form-textarea"
          {...field}
        />
      )
      
    case 'select':
      return (
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value}
          disabled={loading}
        >
          <SelectTrigger className="core-form-select">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      
    case 'switch':
      return (
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={loading}
        />
      )
      
    case 'checkbox':
      return (
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={loading}
        />
      )
      
    default:
      return (
        <Input
          placeholder={placeholder}
          disabled={loading}
          className={baseInputClass}
          {...field}
        />
      )
  }
}
```

## Performance Optimization Patterns

### 1. Memoization Strategy
```typescript
// Memoize expensive option calculations
const memoizedOptions = useMemo(() => 
  generateOptionsFromData(rawData), [rawData]
)

// Memoize form sections to prevent re-renders
const memoizedCoreSections = useMemo(() => 
  buildCoreSections(entityType, configuration), [entityType, configuration]
)
```

### 2. Conditional Rendering Optimization
```typescript
// Use conditional rendering instead of CSS display:none
{showAdvocacySummary && (
  <AdvocacySummary organizationId={organizationId} />
)}

// Lazy load heavy components
const LazyAdvocacySummary = lazy(() => import('./AdvocacySummary'))
```

### 3. Form State Management
```typescript
// Debounced auto-save for long forms
const debouncedSave = useCallback(
  debounce((data: T) => {
    saveDraft(data)
  }, 1000),
  []
)

// Watch only specific fields to prevent unnecessary re-renders
const isPrincipal = form.watch('is_principal')
const organizationId = form.watch('organization_id')
```

## Accessibility Compliance

### ARIA Labels and Descriptions
```typescript
// Enhanced accessibility props
interface AccessibilityProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  'aria-invalid'?: boolean
}

// Implementation in form fields
<Input
  aria-label={`${label}${required ? ' (required)' : ''}`}
  aria-describedby={description ? `${fieldId}-description` : undefined}
  aria-required={required}
  aria-invalid={!!error}
  className={baseInputClass}
  {...field}
/>
```

### Focus Management
```typescript
// Auto-focus first field on form load
useEffect(() => {
  if (!initialData) {
    const firstInput = formRef.current?.querySelector('input, select, textarea')
    firstInput?.focus()
  }
}, [initialData])

// Focus management for collapsible sections
const handleCollapsibleToggle = (isOpen: boolean) => {
  setShowOptionalSections(isOpen)
  if (isOpen) {
    // Focus first field in optional section
    setTimeout(() => {
      const firstOptionalField = document.querySelector('[data-section="optional"] input')
      firstOptionalField?.focus()
    }, 100)
  }
}
```

### Screen Reader Support
```typescript
// Live region for form status updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {loading && 'Saving form data...'}
  {error && `Error: ${error.message}`}
  {success && 'Form saved successfully'}
</div>

// Descriptive button text
<Button type="submit" disabled={loading}>
  <span className="sr-only">
    {loading ? `Saving ${entityType} data` : `Save ${entityType}`}
  </span>
  <span aria-hidden="true">
    {loading ? 'Saving...' : submitLabel}
  </span>
</Button>
```

## Error Handling Patterns

### Form-Level Error Handling
```typescript
// Comprehensive error boundary
class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Form error:', error, errorInfo)
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Form Error</h3>
            <p className="text-sm text-gray-600 mb-4">
              Something went wrong while loading the form.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </Card>
      )
    }
    
    return this.props.children
  }
}
```

### Field-Level Validation
```typescript
// Real-time validation with debouncing
const validateField = useCallback(
  debounce(async (fieldName: keyof T, value: any) => {
    try {
      await formSchema.validateAt(String(fieldName), { [fieldName]: value })
      form.clearErrors(fieldName)
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        form.setError(fieldName, { message: error.message })
      }
    }
  }, 300),
  [form, formSchema]
)
```

## Migration Strategy

### 1. Gradual Adoption
```typescript
// Wrapper for existing forms during migration
interface LegacyFormWrapperProps {
  legacyComponent: React.ComponentType
  migrationConfig?: Partial<CoreFormLayoutProps<any>>
}

export function LegacyFormWrapper({ 
  legacyComponent: LegacyComponent, 
  migrationConfig 
}: LegacyFormWrapperProps) {
  const [useCoreLayout, setUseCoreLayout] = useState(false)
  
  // Feature flag or A/B testing logic
  useEffect(() => {
    const shouldUseCoreLayout = checkFeatureFlag('core-form-layout')
    setUseCoreLayout(shouldUseCoreLayout)
  }, [])
  
  if (useCoreLayout && migrationConfig) {
    return <CoreFormLayout {...migrationConfig} />
  }
  
  return <LegacyComponent />
}
```

### 2. Configuration Migration
```typescript
// Helper to convert existing forms to new config
export function migrateFormConfig<T>(
  existingForm: React.ComponentType,
  entityType: string
): EntityFormConfig<T> {
  // Extract configuration from existing form
  // Return new configuration object
}
```

## File Structure

```
src/
├── components/
│   ├── forms/
│   │   ├── CoreFormLayout.tsx           # Main layout component
│   │   ├── FormSection.tsx              # Section renderer
│   │   ├── FormFieldRenderer.tsx        # Field renderer  
│   │   ├── ConditionalSectionRenderer.tsx # Conditional logic
│   │   ├── LegacyFormWrapper.tsx        # Migration helper
│   │   └── index.ts                     # Exports
│   └── ui/                              # shadcn-ui components
├── types/
│   ├── form-layout.types.ts             # CoreFormLayout types
│   └── entity-configs.types.ts          # Entity-specific configs
├── configs/
│   ├── forms/
│   │   ├── organization.config.ts       # Organization form config
│   │   ├── contact.config.ts            # Contact form config
│   │   ├── product.config.ts            # Product form config
│   │   ├── opportunity.config.ts        # Opportunity form config
│   │   ├── interaction.config.ts        # Interaction form config
│   │   └── index.ts                     # Config exports
└── hooks/
    ├── useFormConfig.ts                 # Form configuration hook
    ├── useFormValidation.ts             # Validation hook
    └── useFormPersistence.ts            # Auto-save/draft hook
```

## Testing Strategy

### Unit Tests
```typescript
// CoreFormLayout.test.tsx
describe('CoreFormLayout', () => {
  test('renders core sections', () => {
    render(<CoreFormLayout {...mockProps} />)
    expect(screen.getByText('Essential Information')).toBeInTheDocument()
  })
  
  test('handles form submission', async () => {
    const mockSubmit = jest.fn()
    render(<CoreFormLayout {...mockProps} onSubmit={mockSubmit} />)
    
    // Fill form and submit
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expectedData)
    })
  })
  
  test('shows optional sections when expanded', () => {
    render(<CoreFormLayout {...mockProps} />)
    
    fireEvent.click(screen.getByText(/additional details/i))
    
    expect(screen.getByText('Contact Information')).toBeInTheDocument()
  })
})
```

### Integration Tests
```typescript
// Form integration with real data
describe('Organization Form Integration', () => {
  test('saves organization with all fields', async () => {
    const { result } = renderHook(() => useOrganizations())
    
    render(<OrganizationFormWithCoreLayout />)
    
    // Fill all form fields
    // Submit form
    // Verify data persistence
  })
})
```

### Accessibility Tests
```typescript
// a11y compliance testing
test('form meets accessibility standards', async () => {
  const { container } = render(<CoreFormLayout {...mockProps} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Deployment Considerations

### 1. Feature Flags
```typescript
// Progressive rollout with feature flags
const FEATURE_FLAGS = {
  CORE_FORM_LAYOUT_ORGANIZATION: 'core-form-layout-organization',
  CORE_FORM_LAYOUT_CONTACT: 'core-form-layout-contact',
  // ... other entities
}
```

### 2. Performance Monitoring
```typescript
// Performance tracking
import { startTransition } from 'react'

const handleFormSubmit = (data: T) => {
  startTransition(() => {
    performance.mark('form-submit-start')
    onSubmit(data)
    performance.mark('form-submit-end')
    performance.measure('form-submit', 'form-submit-start', 'form-submit-end')
  })
}
```

### 3. Bundle Size Optimization
```typescript
// Lazy loading for entity-specific components
const OrganizationSpecificSection = lazy(() => 
  import('./sections/OrganizationSpecificSection')
)

// Code splitting by entity type
const entityConfigs = {
  organization: () => import('../configs/forms/organization.config'),
  contact: () => import('../configs/forms/contact.config'),
  // ... other entities
}
```

## Conclusion

The CoreFormLayout component provides a solid foundation for consistent, accessible, and performant forms across the Principal CRM system. Its iPad-first design, TypeScript safety, and progressive disclosure pattern ensure an optimal user experience while maintaining developer productivity and code maintainability.

The configuration-driven approach allows for rapid development of new forms and easy customization of existing ones, while the universal structure supports all entity types with minimal code duplication.

This design serves as the blueprint for implementing optimized forms across all CRM entities, ensuring consistency and quality in the user experience.