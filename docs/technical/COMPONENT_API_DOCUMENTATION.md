# Dynamic Form UX Components API Documentation

This document provides comprehensive API documentation for the Kitchen Pantry CRM dynamic form UX components. These components implement advanced form functionality including async entity search, quick creation workflows, collapsible sections, and mobile-responsive behavior.

## Table of Contents

1. [DynamicSelectField Component API](#dynamicselectfield-component-api)
2. [CollapsibleFormSection Component API](#collapsibleformsection-component-api)
3. [Quick Creation Components](#quick-creation-components)
4. [Custom Hooks Documentation](#custom-hooks-documentation)
5. [Integration Patterns & Examples](#integration-patterns--examples)
6. [Customization & Extension Guide](#customization--extension-guide)
7. [Testing Patterns](#testing-patterns)

---

## DynamicSelectField Component API

The `DynamicSelectField` is a highly configurable async select component that provides search functionality, quick create integration, and responsive modal behavior.

### Props Interface

```typescript
export interface DynamicSelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  // Required props
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label: string
  onSearch: (query: string) => Promise<SelectOption[]>
  
  // Display configuration
  placeholder?: string
  description?: string
  searchPlaceholder?: string
  noResultsText?: string
  loadingText?: string
  createNewText?: string
  
  // State management
  disabled?: boolean
  required?: boolean
  className?: string
  
  // Quick create functionality
  onCreateNew?: () => void | Promise<void>
  showCreateWhenEmpty?: boolean
  showCreateAlways?: boolean
  
  // Search behavior
  debounceMs?: number
  minSearchLength?: number
  preloadOptions?: SelectOption[]
  
  // Custom rendering
  renderOption?: (option: SelectOption) => React.ReactNode
  renderSelected?: (option: SelectOption) => React.ReactNode
  
  // Advanced features
  groupBy?: (option: SelectOption) => string
  clearable?: boolean
  onClear?: () => void
}
```

### SelectOption Interface

```typescript
export interface SelectOption {
  value: string
  label: string
  description?: string
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  metadata?: Record<string, any>
}
```

### Usage Examples

#### Basic Implementation

```typescript
import { DynamicSelectField } from '@/components/forms/DynamicSelectField'
import { useOrganizationSearch } from '@/hooks/useAsyncEntitySearch'

function OrganizationSelector({ control }: { control: Control<FormData> }) {
  const { search } = useOrganizationSearch()
  
  return (
    <DynamicSelectField
      name="organization_id"
      control={control}
      label="Organization"
      placeholder="Search organizations..."
      searchPlaceholder="Type to search organizations..."
      onSearch={search}
      required
    />
  )
}
```

#### Advanced Implementation with Quick Create

```typescript
function AdvancedOrganizationSelector({ control }: { control: Control<FormData> }) {
  const { search } = useOrganizationSearch()
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  
  const handleCreateNew = () => {
    setShowQuickCreate(true)
  }
  
  const handleQuickCreateSuccess = (newOrg: Organization) => {
    // Handle successful creation
    setShowQuickCreate(false)
  }
  
  return (
    <>
      <DynamicSelectField
        name="organization_id"
        control={control}
        label="Organization"
        placeholder="Search organizations..."
        searchPlaceholder="Type organization name or city..."
        createNewText="Create New Organization"
        onSearch={search}
        onCreateNew={handleCreateNew}
        showCreateWhenEmpty
        clearable
        renderOption={(option) => (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{option.label}</div>
              {option.description && (
                <div className="text-sm text-muted-foreground">
                  {option.description}
                </div>
              )}
            </div>
            {option.badge && (
              <Badge variant={option.badge.variant}>
                {option.badge.text}
              </Badge>
            )}
          </div>
        )}
        required
      />
      
      <QuickCreateOrganization
        open={showQuickCreate}
        onOpenChange={setShowQuickCreate}
        onSuccess={handleQuickCreateSuccess}
      />
    </>
  )
}
```

### Responsive Behavior

The component automatically switches between Dialog (desktop) and Sheet (mobile) based on screen size using the `useMediaQuery` hook:

```typescript
const isMobile = useMediaQuery("(max-width: 768px)")

// Mobile: Sheet from bottom with 80vh height
// Desktop: Popover with 400px width
```

### Accessibility Features

- **ARIA compliance**: Proper `role`, `aria-expanded`, `aria-haspopup` attributes
- **Keyboard navigation**: Arrow keys, Enter, Escape support
- **Screen reader support**: Live regions for announcements
- **Focus management**: Automatic focus handling on open/close
- **High contrast**: Works with system accessibility preferences

#### ARIA Implementation Example

```typescript
// Trigger button
<Button
  role="combobox"
  aria-expanded={open}
  aria-haspopup={isMobile ? "dialog" : "listbox"}
  aria-label={`${label}. ${selectedOption ? `Currently selected: ${selectedOption.label}` : 'No selection'}. Press Enter or Space to open selection.`}
>

// Search input
<input
  aria-label={`Search ${label.toLowerCase()}`}
  aria-describedby={`${name}-search-help`}
  autoComplete="off"
/>

// Live region for announcements
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
  role="status"
>
  {announcement}
</div>
```

---

## CollapsibleFormSection Component API

The `CollapsibleFormSection` provides organized, collapsible form sections with state persistence and mobile-optimized behavior.

### Props Interface

```typescript
export interface CollapsibleFormSectionProps {
  // Required props
  id: string
  title: string
  children: React.ReactNode
  
  // Display configuration
  description?: string
  icon?: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  
  // State behavior
  defaultOpen?: boolean
  forceState?: boolean // Ignores localStorage
  defaultOpenMobile?: boolean
  defaultOpenDesktop?: boolean
  
  // Persistence
  persistState?: boolean
  storageKey?: string // Custom localStorage key
  
  // Event handlers
  onOpenChange?: (open: boolean) => void
  
  // Accessibility
  level?: 2 | 3 | 4 | 5 | 6 // Heading level
}
```

### Usage Examples

#### Basic Implementation

```typescript
import { CollapsibleFormSection } from '@/components/forms/CollapsibleFormSection'
import { User } from 'lucide-react'

function ContactForm() {
  return (
    <form>
      <CollapsibleFormSection
        id="contact-basic"
        title="Contact Details"
        description="Basic contact information"
        icon={<User className="h-4 w-4" />}
        defaultOpen={true}
        level={3}
      >
        <Input name="firstName" placeholder="First Name" />
        <Input name="lastName" placeholder="Last Name" />
        <Input name="email" placeholder="Email" />
      </CollapsibleFormSection>
    </form>
  )
}
```

#### Using Preset Configurations

```typescript
import { CollapsibleFormSection, FormSectionPresets } from '@/components/forms/CollapsibleFormSection'

function OrganizationForm() {
  return (
    <form>
      <CollapsibleFormSection
        {...FormSectionPresets.organizationBasic}
        icon={<Building className="h-4 w-4" />}
      >
        {/* Basic organization fields */}
      </CollapsibleFormSection>
      
      <CollapsibleFormSection
        {...FormSectionPresets.organizationContact}
        icon={<MapPin className="h-4 w-4" />}
      >
        {/* Contact and location fields */}
      </CollapsibleFormSection>
    </form>
  )
}
```

#### Advanced Configuration with Custom Behavior

```typescript
function AdvancedFormSection() {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  
  return (
    <CollapsibleFormSection
      id="advanced-settings"
      title="Advanced Settings"
      description="Optional advanced configuration"
      defaultOpenMobile={false}
      defaultOpenDesktop={true}
      persistState={true}
      storageKey="form-advanced-settings"
      onOpenChange={setIsAdvancedOpen}
      headerClassName="border-2 border-dashed border-muted-foreground/20"
      contentClassName="bg-muted/10"
    >
      {isAdvancedOpen && (
        <div className="space-y-4">
          {/* Conditionally rendered content */}
        </div>
      )}
    </CollapsibleFormSection>
  )
}
```

### State Persistence Implementation

The component automatically handles localStorage persistence:

```typescript
// Storage key generation
const finalStorageKey = storageKey || `form-section-${id}-expanded`

// Loading persisted state
const getInitialState = useCallback(() => {
  if (forceState) return getDeviceDefault()
  
  if (persistState && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(finalStorageKey)
      if (stored !== null) return JSON.parse(stored)
    } catch (error) {
      console.warn(`Failed to parse localStorage value: ${error}`)
    }
  }
  
  return getDeviceDefault()
}, [forceState, persistState, finalStorageKey, getDeviceDefault])
```

### FormSectionPresets

Pre-configured section settings for common form types:

```typescript
export const FormSectionPresets = {
  // Contact form presets
  contactBasic: {
    id: "contact-basic",
    title: "Contact Details",
    description: "Basic contact information including name, email, and phone",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  contactAdditional: {
    id: "contact-additional", 
    title: "Additional Details",
    description: "Optional information like notes and preferences",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  
  // Organization form presets
  organizationBasic: {
    id: "organization-basic",
    title: "Organization Details", 
    description: "Company name, type, and basic information",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  organizationContact: {
    id: "organization-contact",
    title: "Contact & Location",
    description: "Address, phone, email, and website information",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  
  // Additional presets for opportunities, interactions, products...
} as const
```

---

## Quick Creation Components

### QuickCreateModal Base Component

The `QuickCreateModal` provides a reusable foundation for quick entity creation with responsive modal behavior.

#### Props Interface

```typescript
export interface QuickCreateModalProps {
  // Modal state
  open: boolean
  onOpenChange: (open: boolean) => void
  
  // Content
  title: string
  description?: string
  children: React.ReactNode | ((props: { control: any; loading: boolean }) => React.ReactNode)
  
  // Form handling
  onSubmit: (data: any) => Promise<void>
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  schema: any // Yup schema
  defaultValues: any
  
  // Customization
  submitLabel?: string
  cancelLabel?: string
  className?: string
}
```

#### Basic Usage

```typescript
import { QuickCreateModal } from '@/components/forms/QuickCreateModal'
import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email')
})

function CustomQuickCreate() {
  const [open, setOpen] = useState(false)
  
  const handleSubmit = async (data: any) => {
    // Implement creation logic
    await createEntity(data)
  }
  
  return (
    <QuickCreateModal
      open={open}
      onOpenChange={setOpen}
      title="Create Item"
      description="Add a new item with basic information"
      schema={schema}
      defaultValues={{ name: '', email: '' }}
      onSubmit={handleSubmit}
      onSuccess={(data) => toast.success(`Created ${data.name}`)}
      onError={(error) => toast.error(error.message)}
    >
      {({ control, loading }) => (
        <>
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Additional fields */}
        </>
      )}
    </QuickCreateModal>
  )
}
```

### QuickCreateOrganization Component

#### Props Interface

```typescript
export interface QuickCreateOrganizationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (organization: any) => void
  preselectedType?: string
}
```

#### Implementation Example

```typescript
import { QuickCreateOrganization } from '@/components/forms/QuickCreateOrganization'

function OrganizationSelector() {
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  
  const handleSuccess = (newOrganization: Organization) => {
    // Update form or refresh data
    setValue('organization_id', newOrganization.id)
    toast.success(`Organization "${newOrganization.name}" created`)
  }
  
  return (
    <>
      <DynamicSelectField
        name="organization_id"
        control={control}
        label="Organization"
        onSearch={searchOrganizations}
        onCreateNew={() => setShowQuickCreate(true)}
        // ... other props
      />
      
      <QuickCreateOrganization
        open={showQuickCreate}
        onOpenChange={setShowQuickCreate}
        onSuccess={handleSuccess}
        preselectedType="customer"
      />
    </>
  )
}
```

### QuickCreateContact Component

#### Props Interface

```typescript
export interface QuickCreateContactProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (contact: any) => void
  organizationId?: string
  organizationName?: string
}
```

#### Cascading Creation Example

```typescript
function ContactCreationFlow() {
  const [showOrgCreate, setShowOrgCreate] = useState(false)
  const [showContactCreate, setShowContactCreate] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  
  const handleOrgSuccess = (newOrg: Organization) => {
    setSelectedOrganization(newOrg)
    setShowOrgCreate(false)
    setShowContactCreate(true)
  }
  
  const handleContactSuccess = (newContact: Contact) => {
    setValue('contact_id', newContact.id)
    setShowContactCreate(false)
  }
  
  return (
    <>
      {/* Organization creation */}
      <QuickCreateOrganization
        open={showOrgCreate}
        onOpenChange={setShowOrgCreate}
        onSuccess={handleOrgSuccess}
      />
      
      {/* Contact creation */}
      <QuickCreateContact
        open={showContactCreate}
        onOpenChange={setShowContactCreate}
        onSuccess={handleContactSuccess}
        organizationId={selectedOrganization?.id}
        organizationName={selectedOrganization?.name}
      />
    </>
  )
}
```

---

## Custom Hooks Documentation

### useAsyncEntitySearch Hook

The `useAsyncEntitySearch` hook provides configurable async search functionality for CRM entities.

#### Interface

```typescript
export interface UseAsyncEntitySearchReturn {
  searchResults: SelectOption[]
  isLoading: boolean
  error: Error | null
  search: (query: string) => Promise<void>
  clearSearch: () => void
  clearResults: () => void
}

export function useAsyncEntitySearch(
  config: EntitySearchConfig,
  options: UseAsyncEntitySearchOptions = {}
): UseAsyncEntitySearchReturn
```

#### EntitySearchConfig

```typescript
export interface EntitySearchConfig {
  entityType: EntityType
  searchFields: string[]
  selectFields: string
  labelField: string
  valueField?: string
  descriptionField?: string
  badgeField?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  additionalFilters?: Record<string, any>
  limit?: number
  orderBy?: string
}
```

#### Predefined Configurations

```typescript
// Available configurations
entitySearchConfigs.allOrganizations
entitySearchConfigs.principalOrganizations
entitySearchConfigs.distributorOrganizations
entitySearchConfigs.allContacts
entitySearchConfigs.contactsByOrganization
entitySearchConfigs.allProducts
entitySearchConfigs.allOpportunities
```

#### Usage Examples

```typescript
// Basic organization search
const { search, searchResults, isLoading } = useOrganizationSearch()

// Filtered contact search by organization
const { search: searchContacts } = useContactSearch(organizationId)

// Custom configuration
const customConfig: EntitySearchConfig = {
  entityType: 'organizations',
  searchFields: ['name', 'email'],
  selectFields: 'id, name, email, type',
  labelField: 'name',
  descriptionField: 'email',
  badgeField: 'type',
  additionalFilters: { type: 'customer', deleted_at: null },
  limit: 25,
  orderBy: 'name'
}

const { search, searchResults } = useAsyncEntitySearch(customConfig)
```

### useEnhancedForm Hook

Enhanced form handling with persistence, auto-save, and improved error handling.

#### Interface

```typescript
interface UseEnhancedFormReturn<TFieldValues extends FieldValues> extends UseFormReturn<TFieldValues> {
  // Enhanced submission handling
  isSubmitting: boolean
  submitError: string | null
  handleSubmit: (onValid: SubmitHandler<TFieldValues>) => (e?: React.BaseSyntheticEvent) => Promise<void>
  submitWithErrorHandling: () => Promise<void>
  
  // Form state management
  clearErrors: () => void
  resetForm: () => void
  isDirty: boolean
  hasUnsavedChanges: boolean
  
  // Persistence
  clearPersistedData: () => void
  hasPersisted: boolean
}
```

#### Usage Example

```typescript
import { useEnhancedForm } from '@/hooks/useEnhancedForm'
import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email')
})

function EnhancedContactForm() {
  const form = useEnhancedForm({
    schema,
    defaultValues: { name: '', email: '' },
    persistKey: 'contact-form',
    autoSave: true,
    autoSaveDelay: 1000,
    onSubmit: async (data) => {
      await createContact(data)
    },
    onSuccess: () => {
      toast.success('Contact created successfully')
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(form.submitWithErrorHandling)}>
        {/* Form fields */}
        
        {form.submitError && (
          <Alert variant="destructive">
            <AlertDescription>{form.submitError}</AlertDescription>
          </Alert>
        )}
        
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Creating...' : 'Create Contact'}
        </Button>
        
        {form.hasUnsavedChanges && (
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
        )}
      </form>
    </Form>
  )
}
```

#### Unsaved Changes Warning

```typescript
import { useUnsavedChangesWarning } from '@/hooks/useEnhancedForm'

function FormWithWarning() {
  const form = useEnhancedForm({
    // ... configuration
  })
  
  // Automatically warns user before leaving page with unsaved changes
  useUnsavedChangesWarning(form.hasUnsavedChanges)
  
  return (
    // ... form JSX
  )
}
```

---

## Integration Patterns & Examples

### Complete Form Integration Example

```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { DynamicSelectField } from '@/components/forms/DynamicSelectField'
import { CollapsibleFormSection, FormSectionPresets } from '@/components/forms/CollapsibleFormSection'
import { QuickCreateOrganization } from '@/components/forms/QuickCreateOrganization'
import { QuickCreateContact } from '@/components/forms/QuickCreateContact'

import { useOrganizationSearch, useContactSearch } from '@/hooks/useAsyncEntitySearch'
import { Building, User, DollarSign } from 'lucide-react'

const opportunitySchema = yup.object({
  name: yup.string().required('Opportunity name is required'),
  organization_id: yup.string().required('Organization is required'),
  contact_id: yup.string().nullable(),
  value: yup.number().positive('Value must be positive').nullable(),
  stage: yup.string().required('Stage is required'),
})

type OpportunityFormData = yup.InferType<typeof opportunitySchema>

export function OpportunityForm() {
  const [showOrgCreate, setShowOrgCreate] = useState(false)
  const [showContactCreate, setShowContactCreate] = useState(false)
  
  const form = useForm<OpportunityFormData>({
    resolver: yupResolver(opportunitySchema),
    defaultValues: {
      name: '',
      organization_id: '',
      contact_id: '',
      value: null,
      stage: 'discovery',
    }
  })
  
  const selectedOrganization = form.watch('organization_id')
  
  // Search hooks
  const { search: searchOrganizations } = useOrganizationSearch()
  const { search: searchContacts } = useContactSearch(selectedOrganization)
  
  const handleSubmit = async (data: OpportunityFormData) => {
    try {
      await createOpportunity(data)
      toast.success('Opportunity created successfully')
      form.reset()
    } catch (error) {
      toast.error('Failed to create opportunity')
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <CollapsibleFormSection
          {...FormSectionPresets.opportunityBasic}
          icon={<DollarSign className="h-4 w-4" />}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter opportunity name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleFormSection>
        
        {/* Organization & Contact Section */}
        <CollapsibleFormSection
          id="opportunity-parties"
          title="Organization & Contact"
          description="Select the organization and primary contact"
          icon={<Building className="h-4 w-4" />}
          defaultOpen={true}
        >
          <DynamicSelectField
            name="organization_id"
            control={form.control}
            label="Organization"
            placeholder="Search organizations..."
            searchPlaceholder="Type organization name or city..."
            createNewText="Create New Organization"
            onSearch={searchOrganizations}
            onCreateNew={() => setShowOrgCreate(true)}
            onClear={() => {
              // Clear contact when organization changes
              form.setValue('contact_id', '')
            }}
            required
          />
          
          <DynamicSelectField
            name="contact_id"
            control={form.control}
            label="Primary Contact"
            placeholder="Search contacts..."
            searchPlaceholder="Type contact name..."
            createNewText="Create New Contact"
            disabled={!selectedOrganization}
            onSearch={searchContacts}
            onCreateNew={() => setShowContactCreate(true)}
          />
        </CollapsibleFormSection>
        
        {/* Financial Details Section */}
        <CollapsibleFormSection
          {...FormSectionPresets.opportunityDetails}
          icon={<DollarSign className="h-4 w-4" />}
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Value</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0.00"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleFormSection>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Opportunity'}
          </Button>
        </div>
      </form>
      
      {/* Quick Create Modals */}
      <QuickCreateOrganization
        open={showOrgCreate}
        onOpenChange={setShowOrgCreate}
        onSuccess={(org) => {
          form.setValue('organization_id', org.id)
          setShowOrgCreate(false)
        }}
      />
      
      <QuickCreateContact
        open={showContactCreate}
        onOpenChange={setShowContactCreate}
        organizationId={selectedOrganization}
        onSuccess={(contact) => {
          form.setValue('contact_id', contact.id)
          setShowContactCreate(false)
        }}
      />
    </Form>
  )
}
```

### Cascading Dropdown Implementation

```typescript
function CascadingDropdownExample() {
  const form = useForm()
  
  const selectedCountry = form.watch('country')
  const selectedState = form.watch('state')
  
  // Search hooks with dependencies
  const { search: searchStates } = useStateSearch(selectedCountry)
  const { search: searchCities } = useCitySearch(selectedState)
  
  return (
    <div className="space-y-4">
      <DynamicSelectField
        name="country"
        control={form.control}
        label="Country"
        onSearch={searchCountries}
        onClear={() => {
          form.setValue('state', '')
          form.setValue('city', '')
        }}
      />
      
      <DynamicSelectField
        name="state"
        control={form.control}
        label="State/Province"
        disabled={!selectedCountry}
        onSearch={searchStates}
        onClear={() => {
          form.setValue('city', '')
        }}
      />
      
      <DynamicSelectField
        name="city"
        control={form.control}
        label="City"
        disabled={!selectedState}
        onSearch={searchCities}
      />
    </div>
  )
}
```

### Error Handling and Validation Integration

```typescript
function FormWithAdvancedErrorHandling() {
  const form = useEnhancedForm({
    schema: opportunitySchema,
    defaultValues: {},
    onSubmit: async (data) => {
      // Validation is handled automatically
      await createOpportunity(data)
    },
    onError: (error) => {
      // Custom error handling
      if (error.message.includes('duplicate')) {
        toast.error('An opportunity with this name already exists')
      } else {
        toast.error(`Error: ${error.message}`)
      }
    }
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(form.submitWithErrorHandling)}>
        {/* Form fields */}
        
        {/* Display submit errors */}
        {form.submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{form.submitError}</AlertDescription>
          </Alert>
        )}
        
        {/* Field-level error display */}
        <DynamicSelectField
          name="organization_id"
          control={form.control}
          label="Organization"
          onSearch={searchOrganizations}
          // Field errors are automatically handled by FormMessage
        />
        
        <Button type="submit" disabled={form.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
```

---

## Customization & Extension Guide

### Adding New Entity Types to DynamicSelectField

1. **Create Entity Search Configuration**

```typescript
// In useAsyncEntitySearch.ts
const customEntityConfig: EntitySearchConfig = {
  entityType: 'custom_entities',
  searchFields: ['name', 'description', 'category'],
  selectFields: 'id, name, description, category, status',
  labelField: 'name',
  descriptionField: 'description',
  badgeField: 'status',
  badgeVariant: 'outline',
  additionalFilters: { deleted_at: null },
  limit: 50,
  orderBy: 'name'
}

export const useCustomEntitySearch = (options?: UseAsyncEntitySearchOptions) =>
  useAsyncEntitySearch(customEntityConfig, options)
```

2. **Implement Custom Search Hook**

```typescript
export function useAdvancedProductSearch(categoryFilter?: string) {
  const baseConfig = entitySearchConfigs.allProducts
  
  const config = useMemo(() => ({
    ...baseConfig,
    additionalFilters: {
      ...baseConfig.additionalFilters,
      ...(categoryFilter && { category: categoryFilter })
    }
  }), [categoryFilter])
  
  return useAsyncEntitySearch(config)
}
```

3. **Add Custom Rendering**

```typescript
function ProductSelector() {
  const { search } = useAdvancedProductSearch()
  
  return (
    <DynamicSelectField
      name="product_id"
      control={control}
      label="Product"
      onSearch={search}
      renderOption={(option) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground">
              SKU: {option.metadata?.sku}
            </div>
          </div>
          {option.badge && (
            <Badge variant={option.badge.variant}>
              {option.badge.text}
            </Badge>
          )}
        </div>
      )}
      renderSelected={(option) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4" />
          <span>{option.label}</span>
          {option.metadata?.sku && (
            <span className="text-sm text-muted-foreground">
              ({option.metadata.sku})
            </span>
          )}
        </div>
      )}
    />
  )
}
```

### Creating Custom CollapsibleFormSection Presets

```typescript
// Add to FormSectionPresets
export const FormSectionPresets = {
  // ... existing presets
  
  // Custom preset for invoice forms
  invoiceBasic: {
    id: "invoice-basic",
    title: "Invoice Information",
    description: "Basic invoice details and customer information",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  invoiceLineItems: {
    id: "invoice-line-items",
    title: "Line Items",
    description: "Products and services included in this invoice",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  invoicePayment: {
    id: "invoice-payment",
    title: "Payment Information",
    description: "Payment terms, methods, and billing details",
    defaultOpenMobile: false,
    defaultOpenDesktop: false,
  },
} as const
```

### Extending Quick Create Workflows

1. **Create Custom Quick Create Component**

```typescript
import * as yup from "yup"
import { QuickCreateModal } from "./QuickCreateModal"

const quickProductSchema = yup.object({
  name: yup.string().required("Product name is required"),
  category: yup.string().required("Category is required"),
  principal_organization_id: yup.string().required("Principal is required"),
  sku: yup.string().nullable(),
})

type QuickProductData = yup.InferType<typeof quickProductSchema>

export interface QuickCreateProductProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (product: any) => void
  principalId?: string
  category?: string
}

export function QuickCreateProduct({
  open,
  onOpenChange,
  onSuccess,
  principalId,
  category,
}: QuickCreateProductProps) {
  const createProduct = useCreateProduct()
  
  const defaultValues: QuickProductData = {
    name: "",
    category: category || "other",
    principal_organization_id: principalId || "",
    sku: "",
  }
  
  const handleSubmit = async (data: QuickProductData) => {
    const productData = {
      ...data,
      sku: data.sku || null,
      // Set reasonable defaults
      description: null,
      unit_price: null,
      is_active: true,
    }
    
    await createProduct.mutateAsync(productData)
  }
  
  return (
    <QuickCreateModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Product"
      description="Add a new product with basic information"
      schema={quickProductSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onSuccess={onSuccess}
      submitLabel="Create Product"
    >
      {({ control, loading }) => (
        <>
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!principalId && (
            <DynamicSelectField
              name="principal_organization_id"
              control={control}
              label="Principal Organization"
              onSearch={searchPrincipals}
              disabled={loading}
              required
            />
          )}
          
          {/* Additional fields */}
        </>
      )}
    </QuickCreateModal>
  )
}
```

2. **Integration with Multi-Step Workflows**

```typescript
function MultiStepQuickCreate() {
  const [step, setStep] = useState<'organization' | 'contact' | 'product'>('organization')
  const [createdEntities, setCreatedEntities] = useState<{
    organization?: Organization
    contact?: Contact
    product?: Product
  }>({})
  
  const handleOrganizationSuccess = (org: Organization) => {
    setCreatedEntities(prev => ({ ...prev, organization: org }))
    setStep('contact')
  }
  
  const handleContactSuccess = (contact: Contact) => {
    setCreatedEntities(prev => ({ ...prev, contact }))
    setStep('product')
  }
  
  const handleProductSuccess = (product: Product) => {
    setCreatedEntities(prev => ({ ...prev, product }))
    // Complete the workflow
    onSuccess?.(createdEntities)
  }
  
  return (
    <>
      {step === 'organization' && (
        <QuickCreateOrganization
          open={true}
          onOpenChange={() => {}}
          onSuccess={handleOrganizationSuccess}
        />
      )}
      
      {step === 'contact' && (
        <QuickCreateContact
          open={true}
          onOpenChange={() => {}}
          organizationId={createdEntities.organization?.id}
          onSuccess={handleContactSuccess}
        />
      )}
      
      {step === 'product' && (
        <QuickCreateProduct
          open={true}
          onOpenChange={() => {}}
          principalId={createdEntities.organization?.id}
          onSuccess={handleProductSuccess}
        />
      )}
    </>
  )
}
```

### Adding New Search and Filter Capabilities

1. **Advanced Search with Multiple Filters**

```typescript
interface AdvancedSearchConfig extends EntitySearchConfig {
  multiSelectFilters?: {
    field: string
    options: SelectOption[]
  }[]
  dateRangeFilters?: {
    field: string
    label: string
  }[]
}

export function useAdvancedEntitySearch(config: AdvancedSearchConfig) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  
  const search = useCallback(async (query: string) => {
    // Build complex query with filters
    let supabaseQuery = supabase
      .from(config.entityType)
      .select(config.selectFields)
    
    // Apply text search
    if (query.trim()) {
      const searchConditions = config.searchFields
        .map(field => `${field}.ilike.%${query}%`)
        .join(',')
      supabaseQuery = supabaseQuery.or(searchConditions)
    }
    
    // Apply active filters
    Object.entries(activeFilters).forEach(([field, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        supabaseQuery = supabaseQuery.in(field, value)
      } else if (value !== null && value !== undefined) {
        supabaseQuery = supabaseQuery.eq(field, value)
      }
    })
    
    // Execute query and return results
    const { data, error } = await supabaseQuery
    // ... handle results
  }, [config, activeFilters])
  
  return {
    search,
    activeFilters,
    setActiveFilters,
    // ... other return values
  }
}
```

2. **Grouped Results and Custom Sorting**

```typescript
function CustomGroupedSelect() {
  const { search } = useAsyncEntitySearch({
    ...entitySearchConfigs.allOrganizations,
    // Custom grouping function
  })
  
  return (
    <DynamicSelectField
      name="organization_id"
      control={control}
      label="Organization"
      onSearch={search}
      groupBy={(option) => {
        // Group by organization type
        return option.badge?.text || 'Other'
      }}
      renderOption={(option) => (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground">
              {option.metadata?.city}, {option.metadata?.state}
            </div>
          </div>
          <div className="text-right">
            {option.badge && (
              <Badge variant={option.badge.variant}>
                {option.badge.text}
              </Badge>
            )}
          </div>
        </div>
      )}
    />
  )
}
```

---

## Testing Patterns

### Unit Testing Components

#### Testing DynamicSelectField

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { DynamicSelectField } from '@/components/forms/DynamicSelectField'

// Mock search function
const mockSearch = jest.fn()

const TestWrapper = () => {
  const { control } = useForm({
    defaultValues: { test_field: '' }
  })
  
  return (
    <DynamicSelectField
      name="test_field"
      control={control}
      label="Test Field"
      onSearch={mockSearch}
    />
  )
}

describe('DynamicSelectField', () => {
  beforeEach(() => {
    mockSearch.mockClear()
  })
  
  it('should render with correct label', () => {
    render(<TestWrapper />)
    expect(screen.getByText('Test Field')).toBeInTheDocument()
  })
  
  it('should open popover when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })
  
  it('should call search function when typing', async () => {
    const user = userEvent.setup()
    mockSearch.mockResolvedValue([
      { value: '1', label: 'Test Option', description: 'Test Description' }
    ])
    
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('test')
    }, { timeout: 1000 }) // Account for debounce
  })
  
  it('should display search results', async () => {
    const user = userEvent.setup()
    const mockResults = [
      { value: '1', label: 'Test Option 1' },
      { value: '2', label: 'Test Option 2' }
    ]
    
    mockSearch.mockResolvedValue(mockResults)
    
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Option 1')).toBeInTheDocument()
      expect(screen.getByText('Test Option 2')).toBeInTheDocument()
    })
  })
  
  it('should handle option selection', async () => {
    const user = userEvent.setup()
    const mockResults = [
      { value: '1', label: 'Test Option 1' }
    ]
    
    mockSearch.mockResolvedValue(mockResults)
    
    const TestWrapperWithSubmit = () => {
      const { control, getValues } = useForm({
        defaultValues: { test_field: '' }
      })
      
      return (
        <div>
          <DynamicSelectField
            name="test_field"
            control={control}
            label="Test Field"
            onSearch={mockSearch}
          />
          <div data-testid="field-value">{getValues('test_field')}</div>
        </div>
      )
    }
    
    render(<TestWrapperWithSubmit />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Option 1')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Test Option 1'))
    
    expect(screen.getByTestId('field-value')).toHaveTextContent('1')
  })
})
```

#### Testing CollapsibleFormSection

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CollapsibleFormSection } from '@/components/forms/CollapsibleFormSection'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('CollapsibleFormSection', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.clearAllMocks()
  })
  
  it('should render with correct title and description', () => {
    render(
      <CollapsibleFormSection id="test" title="Test Section" description="Test Description">
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })
  
  it('should be open by default', () => {
    render(
      <CollapsibleFormSection id="test" title="Test Section" defaultOpen={true}>
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    expect(screen.getByText('Content')).toBeVisible()
  })
  
  it('should toggle when header is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <CollapsibleFormSection id="test" title="Test Section" defaultOpen={true}>
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    const button = screen.getByRole('button')
    expect(screen.getByText('Content')).toBeVisible()
    
    await user.click(button)
    expect(screen.getByText('Content')).not.toBeVisible()
    
    await user.click(button)
    expect(screen.getByText('Content')).toBeVisible()
  })
  
  it('should persist state to localStorage', async () => {
    const user = userEvent.setup()
    
    render(
      <CollapsibleFormSection 
        id="test" 
        title="Test Section" 
        defaultOpen={true}
        persistState={true}
      >
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    const button = screen.getByRole('button')
    await user.click(button) // Close section
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'form-section-test-expanded',
      'false'
    )
  })
  
  it('should load persisted state from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('false')
    
    render(
      <CollapsibleFormSection 
        id="test" 
        title="Test Section" 
        defaultOpen={true}
        persistState={true}
      >
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    expect(screen.getByText('Content')).not.toBeVisible()
  })
})
```

### Integration Testing with React Hook Form

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { Form } from '@/components/ui/form'
import { DynamicSelectField } from '@/components/forms/DynamicSelectField'
import { CollapsibleFormSection } from '@/components/forms/CollapsibleFormSection'

const formSchema = yup.object({
  organization_id: yup.string().required('Organization is required'),
  contact_id: yup.string().nullable(),
})

const mockSearchOrganizations = jest.fn()
const mockSearchContacts = jest.fn()

const TestForm = () => {
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      organization_id: '',
      contact_id: '',
    }
  })
  
  const selectedOrganization = form.watch('organization_id')
  
  const onSubmit = jest.fn()
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CollapsibleFormSection
          id="test-section"
          title="Test Section"
          defaultOpen={true}
        >
          <DynamicSelectField
            name="organization_id"
            control={form.control}
            label="Organization"
            onSearch={mockSearchOrganizations}
            required
          />
          
          <DynamicSelectField
            name="contact_id"
            control={form.control}
            label="Contact"
            onSearch={mockSearchContacts}
            disabled={!selectedOrganization}
          />
        </CollapsibleFormSection>
        
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('Form Integration', () => {
  beforeEach(() => {
    mockSearchOrganizations.mockClear()
    mockSearchContacts.mockClear()
  })
  
  it('should validate required fields on submit', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    
    const submitButton = screen.getByText('Submit')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Organization is required')).toBeInTheDocument()
    })
  })
  
  it('should enable contact field when organization is selected', async () => {
    const user = userEvent.setup()
    
    mockSearchOrganizations.mockResolvedValue([
      { value: '1', label: 'Test Org' }
    ])
    
    render(<TestForm />)
    
    // Open organization selector
    const orgTrigger = screen.getAllByRole('combobox')[0]
    await user.click(orgTrigger)
    
    // Search and select organization
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Org')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Test Org'))
    
    // Contact field should now be enabled
    const contactTrigger = screen.getAllByRole('combobox')[1]
    expect(contactTrigger).not.toBeDisabled()
  })
})
```

### Accessibility Testing

```typescript
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DynamicSelectField } from '@/components/forms/DynamicSelectField'
import { CollapsibleFormSection } from '@/components/forms/CollapsibleFormSection'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('DynamicSelectField should have no accessibility violations', async () => {
    const TestWrapper = () => {
      const { control } = useForm({ defaultValues: { test_field: '' } })
      return (
        <DynamicSelectField
          name="test_field"
          control={control}
          label="Test Field"
          onSearch={jest.fn()}
        />
      )
    }
    
    const { container } = render(<TestWrapper />)
    const results = await axe(container)
    
    expect(results).toHaveNoViolations()
  })
  
  it('CollapsibleFormSection should have no accessibility violations', async () => {
    const { container } = render(
      <CollapsibleFormSection id="test" title="Test Section">
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('should have proper heading hierarchy', () => {
    render(
      <div>
        <h1>Page Title</h1>
        <CollapsibleFormSection id="test1" title="Section 1" level={2}>
          <CollapsibleFormSection id="test2" title="Subsection" level={3}>
            <div>Content</div>
          </CollapsibleFormSection>
        </CollapsibleFormSection>
      </div>
    )
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section 1')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection')
  })
})
```

### Mobile Testing Recommendations

```typescript
// Mobile-specific test setup
const mockMobileMediaQuery = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('Mobile Responsive Tests', () => {
  it('should render Sheet on mobile devices', () => {
    mockMobileMediaQuery(true) // Simulate mobile
    
    const TestWrapper = () => {
      const { control } = useForm({ defaultValues: { test_field: '' } })
      return (
        <DynamicSelectField
          name="test_field"
          control={control}
          label="Test Field"
          onSearch={jest.fn()}
        />
      )
    }
    
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  })
  
  it('should render Popover on desktop devices', () => {
    mockMobileMediaQuery(false) // Simulate desktop
    
    const TestWrapper = () => {
      const { control } = useForm({ defaultValues: { test_field: '' } })
      return (
        <DynamicSelectField
          name="test_field"
          control={control}
          label="Test Field"
          onSearch={jest.fn()}
        />
      )
    }
    
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
  })
  
  it('should have touch-friendly minimum heights on mobile', () => {
    mockMobileMediaQuery(true)
    
    render(
      <CollapsibleFormSection id="test" title="Test Section">
        <div>Content</div>
      </CollapsibleFormSection>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('min-h-[44px]') // Touch-friendly minimum
  })
})
```

### Performance Testing

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Performance Tests', () => {
  it('should debounce search requests', async () => {
    const user = userEvent.setup()
    const mockSearch = jest.fn()
    
    const TestWrapper = () => {
      const { control } = useForm({ defaultValues: { test_field: '' } })
      return (
        <DynamicSelectField
          name="test_field"
          control={control}
          label="Test Field"
          onSearch={mockSearch}
          debounceMs={300}
        />
      )
    }
    
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    const searchInput = screen.getByPlaceholderText('Search...')
    
    // Type multiple characters quickly
    await user.type(searchInput, 'test', { delay: 50 })
    
    // Search should only be called once after debounce
    expect(mockSearch).toHaveBeenCalledTimes(0) // Not called yet
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 350))
    
    expect(mockSearch).toHaveBeenCalledTimes(1)
    expect(mockSearch).toHaveBeenCalledWith('test')
  })
  
  it('should not search for queries below minimum length', async () => {
    const user = userEvent.setup()
    const mockSearch = jest.fn()
    
    const TestWrapper = () => {
      const { control } = useForm({ defaultValues: { test_field: '' } })
      return (
        <DynamicSelectField
          name="test_field"
          control={control}
          label="Test Field"
          onSearch={mockSearch}
          minSearchLength={3}
        />
      )
    }
    
    render(<TestWrapper />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'te')
    
    await new Promise(resolve => setTimeout(resolve, 600)) // Wait for debounce
    
    expect(mockSearch).not.toHaveBeenCalled()
  })
})
```

---

## Best Practices Summary

### Component Usage Best Practices

1. **Always provide meaningful labels and descriptions**
2. **Use proper TypeScript types for form data**
3. **Implement proper error handling and user feedback**
4. **Test components with real data scenarios**
5. **Consider mobile experience in all implementations**
6. **Follow accessibility guidelines (WCAG 2.1 AA)**
7. **Use preset configurations when available**
8. **Implement proper loading and error states**
9. **Test keyboard navigation thoroughly**
10. **Consider performance implications of search operations**

### Maintenance Guidelines

- **Keep entity search configurations up to date with database schema changes**
- **Update preset configurations when form requirements change**
- **Test accessibility regularly with screen readers**
- **Monitor performance of search operations**
- **Update tests when component APIs change**
- **Document any custom extensions or modifications**

This documentation provides a comprehensive foundation for working with the Kitchen Pantry CRM dynamic form UX components. For specific implementation questions or edge cases not covered here, refer to the component source code or create additional test cases to validate behavior.