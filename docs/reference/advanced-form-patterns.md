# Advanced Form Patterns for React + TypeScript + shadcn/ui

## Overview
This document details advanced form patterns specifically for the Contact Form implementation, including multi-select components, progressive disclosure, modal integration, and conditional rendering patterns using React Hook Form and shadcn/ui.

## Table of Contents
1. [Multi-Select with Search Pattern](#multi-select-with-search-pattern)
2. [Progressive Disclosure Pattern](#progressive-disclosure-pattern)
3. [Modal Integration Pattern](#modal-integration-pattern)
4. [Conditional Field Rendering](#conditional-field-rendering)
5. [Real-time Validation Patterns](#real-time-validation-patterns)
6. [Performance Optimization Patterns](#performance-optimization-patterns)
7. [Accessibility Patterns](#accessibility-patterns)
8. [Testing Patterns](#testing-patterns)

## Multi-Select with Search Pattern

### Implementation with Command + Popover
The preferred principals selection uses a sophisticated multi-select pattern combining Command (for search) and Popover (for dropdown) components.

```typescript
// PreferredPrincipalsSelect.tsx - Enhanced with search and filtering
import { useState, useMemo, useCallback } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useOrganizations } from '@/hooks/useOrganizations'

interface MultiSelectOption {
  value: string
  label: string
  description?: string
  category?: string
}

interface MultiSelectWithSearchProps {
  value: string[]
  onChange: (value: string[]) => void
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  maxDisplayItems?: number
  allowClearAll?: boolean
}

export function MultiSelectWithSearch({
  value = [],
  onChange,
  options,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  maxDisplayItems = 3,
  allowClearAll = true
}: MultiSelectWithSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter options based on search query
  const filteredOptions = useMemo(() => 
    options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [options, searchQuery]
  )

  // Get selected options for display
  const selectedOptions = useMemo(() => 
    options.filter((option) => value.includes(option.value)),
    [options, value]
  )

  const handleSelect = useCallback((optionValue: string) => {
    const isSelected = value.includes(optionValue)
    if (isSelected) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }, [value, onChange])

  const handleRemove = useCallback((optionValue: string) => {
    onChange(value.filter(v => v !== optionValue))
  }, [value, onChange])

  const handleClearAll = useCallback(() => {
    onChange([])
  }, [onChange])

  // Group options by category if available
  const groupedOptions = useMemo(() => {
    const groups = new Map<string, MultiSelectOption[]>()
    
    filteredOptions.forEach(option => {
      const category = option.category || 'Options'
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category)!.push(option)
    })
    
    return Array.from(groups.entries())
  }, [filteredOptions])

  const getDisplayText = () => {
    if (value.length === 0) return placeholder
    if (value.length === 1) return selectedOptions[0]?.label || '1 selected'
    if (value.length <= maxDisplayItems) {
      return selectedOptions.map(opt => opt.label).join(', ')
    }
    return `${value.length} items selected`
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Selected Items Display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.slice(0, maxDisplayItems).map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="pr-1.5 group"
            >
              <span className="text-xs">{option.label}</span>
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                disabled={disabled}
                className="ml-1.5 rounded-full hover:bg-secondary-foreground/20 disabled:opacity-50"
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {selectedOptions.length > maxDisplayItems && (
            <Badge variant="outline" className="text-xs">
              +{selectedOptions.length - maxDisplayItems} more
            </Badge>
          )}
          
          {allowClearAll && selectedOptions.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Multi-Select Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full h-11 justify-between',
              !value.length && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                No options found.
              </CommandEmpty>
              {groupedOptions.map(([category, categoryOptions]) => (
                <CommandGroup key={category} heading={category}>
                  {categoryOptions.map((option) => {
                    const isSelected = value.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### Specialized Principal Selection
```typescript
// PreferredPrincipalsSelect.tsx - Specialized for principals
export function PreferredPrincipalsSelect(props: Omit<MultiSelectWithSearchProps, 'options'>) {
  const { data: principals = [], isLoading } = useOrganizations({
    is_principal: true
  })

  const principalOptions: MultiSelectOption[] = useMemo(() => 
    principals.map(principal => ({
      value: principal.id,
      label: principal.name,
      description: principal.city && principal.state_province 
        ? `${principal.city}, ${principal.state_province}`
        : undefined,
      category: principal.segment || 'Principals'
    })),
    [principals]
  )

  if (isLoading) {
    return (
      <div className="h-11 w-full border rounded-md flex items-center px-3 text-muted-foreground">
        Loading principals...
      </div>
    )
  }

  return (
    <MultiSelectWithSearch
      {...props}
      options={principalOptions}
      placeholder="Select preferred principals..."
      searchPlaceholder="Search principals..."
    />
  )
}
```

## Progressive Disclosure Pattern

### Enhanced ProgressiveDetails Component
```typescript
// ProgressiveDetails.tsx - Enhanced with animation and state management
import { useState, useId } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export interface ProgressiveDetailsProps {
  isOpen?: boolean
  onToggle?: (open: boolean) => void
  buttonText?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle' | 'card'
  disabled?: boolean
  showIcon?: boolean
  animationDuration?: 'fast' | 'normal' | 'slow'
}

export function ProgressiveDetails({
  isOpen: controlledIsOpen,
  onToggle,
  buttonText = "Show Details",
  children,
  className,
  variant = 'default',
  disabled = false,
  showIcon = true,
  animationDuration = 'normal'
}: ProgressiveDetailsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const contentId = useId()
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = onToggle || setInternalIsOpen

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const getButtonText = () => {
    if (typeof buttonText === 'string') {
      return isOpen ? `Hide ${buttonText.replace('Show ', '')}` : buttonText
    }
    return buttonText
  }

  const animationClasses = {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300'
  }

  const renderContent = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className="mt-4">
            <CardContent className="p-4">
              {children}
            </CardContent>
          </Card>
        )
      
      case 'subtle':
        return (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            {children}
          </div>
        )
      
      default:
        return (
          <div className="mt-4 space-y-4">
            {children}
          </div>
        )
    }
  }

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-12 w-full text-base font-medium transition-all",
            animationClasses[animationDuration],
            "hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed",
            "flex items-center justify-between"
          )}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span>{getButtonText()}</span>
          {showIcon && (
            <div className={cn(
              "transition-transform",
              animationClasses[animationDuration],
              isOpen && "rotate-180"
            )}>
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent
        id={contentId}
        className={cn(
          "transition-all overflow-hidden",
          animationClasses[animationDuration],
          "data-[state=closed]:animate-collapsible-up",
          "data-[state=open]:animate-collapsible-down"
        )}
      >
        {renderContent()}
      </CollapsibleContent>
    </Collapsible>
  )
}
```

### Form Section Variants
```typescript
// Specialized progressive disclosure components for forms
export interface FormSectionProps extends Omit<ProgressiveDetailsProps, 'buttonText'> {
  sectionTitle: string
  fieldCount?: number
  required?: boolean
}

export function OptionalFieldsSection({ 
  sectionTitle, 
  fieldCount, 
  required = false,
  ...props 
}: FormSectionProps) {
  const getButtonText = () => {
    let text = `${sectionTitle}`
    if (fieldCount) text += ` (${fieldCount} fields)`
    if (required) text += ' *'
    return text
  }

  return (
    <ProgressiveDetails
      buttonText={getButtonText()}
      variant="subtle"
      {...props}
    />
  )
}

export function ContactDetailsSection(props: Omit<FormSectionProps, 'sectionTitle'>) {
  return (
    <OptionalFieldsSection
      sectionTitle="Contact Details"
      fieldCount={6}
      {...props}
    />
  )
}

export function AdvancedOptionsSection(props: Omit<FormSectionProps, 'sectionTitle'>) {
  return (
    <OptionalFieldsSection
      sectionTitle="Advanced Options"
      variant="card"
      {...props}
    />
  )
}
```

### Hook for Managing Multiple Sections
```typescript
// useProgressiveDisclosure - Manage multiple progressive disclosure sections
export function useProgressiveDisclosure(
  sections: string[], 
  initialStates: Record<string, boolean> = {}
) {
  const [states, setStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach(section => {
      initial[section] = initialStates[section] || false
    })
    return initial
  })

  const toggle = useCallback((section: string) => {
    setStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  const set = useCallback((section: string, value: boolean) => {
    setStates(prev => ({
      ...prev,
      [section]: value
    }))
  }, [])

  const openAll = useCallback(() => {
    setStates(prev => {
      const updated: Record<string, boolean> = {}
      sections.forEach(section => {
        updated[section] = true
      })
      return { ...prev, ...updated }
    })
  }, [sections])

  const closeAll = useCallback(() => {
    setStates(prev => {
      const updated: Record<string, boolean> = {}
      sections.forEach(section => {
        updated[section] = false
      })
      return { ...prev, ...updated }
    })
  }, [sections])

  const reset = useCallback(() => {
    setStates(initialStates)
  }, [initialStates])

  const isOpen = useCallback((section: string) => states[section] || false, [states])
  
  const hasAnyOpen = useMemo(() => 
    Object.values(states).some(Boolean), [states]
  )

  return {
    states,
    toggle,
    set,
    openAll,
    closeAll,
    reset,
    isOpen,
    hasAnyOpen
  }
}

// Usage in ContactForm
function ContactFormWithProgessiveDisclosure() {
  const { toggle, isOpen, openAll, closeAll, hasAnyOpen } = useProgressiveDisclosure([
    'contactDetails',
    'preferences',
    'notes'
  ])

  return (
    <form>
      {/* Required fields */}
      
      {/* Progressive sections */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Optional Information</h3>
          {hasAnyOpen ? (
            <Button type="button" variant="ghost" size="sm" onClick={closeAll}>
              Collapse All
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={openAll}>
              Expand All
            </Button>
          )}
        </div>

        <ContactDetailsSection 
          isOpen={isOpen('contactDetails')} 
          onToggle={(open) => toggle('contactDetails')}
        >
          {/* Contact detail fields */}
        </ContactDetailsSection>

        <ProgressiveDetails
          buttonText="Preferences & Settings"
          isOpen={isOpen('preferences')}
          onToggle={(open) => toggle('preferences')}
        >
          {/* Preference fields */}
        </ProgressiveDetails>
      </div>
    </form>
  )
}
```

## Modal Integration Pattern

### Dialog-based Modal Creation
```typescript
// ModalFormPattern.tsx - Generic pattern for modal forms
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface ModalFormPatternProps<TFormData, TCreatedEntity> {
  triggerLabel: string
  modalTitle: string
  onSuccess: (entity: TCreatedEntity) => void
  FormComponent: React.ComponentType<{
    onSubmit: (data: TFormData) => Promise<TCreatedEntity>
    onCancel?: () => void
  }>
  triggerVariant?: 'default' | 'outline' | 'ghost'
  triggerSize?: 'sm' | 'default' | 'lg'
}

export function ModalFormPattern<TFormData, TCreatedEntity>({
  triggerLabel,
  modalTitle,
  onSuccess,
  FormComponent,
  triggerVariant = 'ghost',
  triggerSize = 'sm'
}: ModalFormPatternProps<TFormData, TCreatedEntity>) {
  const [open, setOpen] = useState(false)

  const handleSuccess = (entity: TCreatedEntity) => {
    onSuccess(entity)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant={triggerVariant} 
          size={triggerSize}
        >
          <Plus className="h-4 w-4 mr-1" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <FormComponent 
          onSubmit={async (data) => {
            // Form submission logic handled by component
            const entity = await submitData(data)
            return entity
          }}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}

// Usage with Organization Creation
export function OrganizationCreateButton({ onOrganizationCreated }: {
  onOrganizationCreated: (org: Organization) => void
}) {
  return (
    <ModalFormPattern
      triggerLabel="New Organization"
      modalTitle="Create New Organization"
      onSuccess={onOrganizationCreated}
      FormComponent={OrganizationQuickCreateForm}
    />
  )
}
```

### Nested Modal Management
```typescript
// NestedModalManager.tsx - Handle multiple modals in forms
export function useNestedModals() {
  const [modalStack, setModalStack] = useState<string[]>([])

  const openModal = useCallback((modalId: string) => {
    setModalStack(prev => [...prev, modalId])
  }, [])

  const closeModal = useCallback((modalId?: string) => {
    setModalStack(prev => {
      if (modalId) {
        // Close specific modal and all modals above it
        const index = prev.indexOf(modalId)
        return index >= 0 ? prev.slice(0, index) : prev
      } else {
        // Close top modal
        return prev.slice(0, -1)
      }
    })
  }, [])

  const closeAllModals = useCallback(() => {
    setModalStack([])
  }, [])

  const isModalOpen = useCallback((modalId: string) => {
    return modalStack.includes(modalId)
  }, [modalStack])

  const currentModal = modalStack[modalStack.length - 1] || null

  return {
    modalStack,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    currentModal,
    hasModalsOpen: modalStack.length > 0
  }
}
```

## Conditional Field Rendering

### Dynamic Field Visibility
```typescript
// ConditionalFields.tsx - Pattern for conditional field rendering
interface ConditionalFieldProps {
  condition: boolean
  children: React.ReactNode
  animateEntrance?: boolean
  fallback?: React.ReactNode
}

export function ConditionalField({ 
  condition, 
  children, 
  animateEntrance = true,
  fallback = null 
}: ConditionalFieldProps) {
  if (!condition) {
    return fallback ? <>{fallback}</> : null
  }

  if (!animateEntrance) {
    return <>{children}</>
  }

  return (
    <div 
      className={cn(
        "transition-all duration-200 ease-in-out",
        "animate-in slide-in-from-top-2 fade-in-0"
      )}
    >
      {children}
    </div>
  )
}

// Usage in Contact Form for Custom Position
export function PositionFieldWithCustom({ form }: { form: any }) {
  const position = form.watch('position')
  const isCustomPosition = position === 'Custom'

  return (
    <>
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CONTACT_POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
                <SelectItem value="Custom">Custom Position</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <ConditionalField condition={isCustomPosition}>
        <FormField
          control={form.control}
          name="custom_position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Position *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="h-11" 
                  placeholder="Enter custom position"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </ConditionalField>
    </>
  )
}
```

### Multi-level Conditional Logic
```typescript
// Complex conditional rendering with multiple dependencies
export function ConditionalFieldGroup({ form }: { form: any }) {
  const organizationType = form.watch('organization.type')
  const contactRole = form.watch('decision_authority')
  const hasAdvancedAccess = form.watch('has_advanced_access')

  // Complex conditional logic
  const showAdvancedFields = useMemo(() => {
    return organizationType === 'enterprise' && 
           contactRole === 'Decision Maker' && 
           hasAdvancedAccess
  }, [organizationType, contactRole, hasAdvancedAccess])

  const showSegmentFields = useMemo(() => {
    return ['restaurant', 'hotel', 'catering'].includes(organizationType)
  }, [organizationType])

  return (
    <div className="space-y-4">
      <ConditionalField condition={showSegmentFields}>
        <FormField
          control={form.control}
          name="segment_preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segment Preferences</FormLabel>
              <FormControl>
                <MultiSelectWithSearch
                  {...field}
                  options={getSegmentOptions(organizationType)}
                  placeholder="Select segment preferences..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </ConditionalField>

      <ConditionalField condition={showAdvancedFields}>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium">Advanced Configuration</h4>
          
          <FormField
            control={form.control}
            name="budget_authority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Authority</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="Enter budget limit" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="approval_workflow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requires Approval Workflow</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </ConditionalField>
    </div>
  )
}
```

## Real-time Validation Patterns

### Debounced Async Validation
```typescript
// AsyncValidation.tsx - Pattern for async field validation
import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'

interface AsyncValidationState {
  isValidating: boolean
  isValid: boolean | null
  error: string | null
}

export function useAsyncFieldValidation<T>(
  value: T,
  validationFn: (value: T) => Promise<{ isValid: boolean; error?: string }>,
  debounceMs: number = 500
) {
  const [state, setState] = useState<AsyncValidationState>({
    isValidating: false,
    isValid: null,
    error: null
  })

  const debouncedValidation = useCallback(
    debounce(async (val: T) => {
      setState(prev => ({ ...prev, isValidating: true }))
      
      try {
        const result = await validationFn(val)
        setState({
          isValidating: false,
          isValid: result.isValid,
          error: result.error || null
        })
      } catch (error) {
        setState({
          isValidating: false,
          isValid: false,
          error: 'Validation failed'
        })
      }
    }, debounceMs),
    [validationFn, debounceMs]
  )

  useEffect(() => {
    if (value) {
      debouncedValidation(value)
    } else {
      setState({ isValidating: false, isValid: null, error: null })
    }

    return () => {
      debouncedValidation.cancel()
    }
  }, [value, debouncedValidation])

  return state
}

// Usage for email uniqueness validation
export function EmailFieldWithAsyncValidation({ form }: { form: any }) {
  const email = form.watch('email')
  const { isValidating, isValid, error } = useAsyncFieldValidation(
    email,
    async (email: string) => {
      if (!email || !email.includes('@')) {
        return { isValid: true } // Let regular validation handle format
      }
      
      // Check email uniqueness
      const exists = await checkEmailExists(email)
      return {
        isValid: !exists,
        error: exists ? 'Email address is already in use' : undefined
      }
    }
  )

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email Address</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                {...field} 
                type="email" 
                className={cn(
                  "h-11 pr-10",
                  isValid === false && "border-destructive",
                  isValid === true && "border-green-500"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidating && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                )}
                {!isValidating && isValid === true && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {!isValidating && isValid === false && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </FormItem>
      )}
    />
  )
}
```

### Cross-field Validation
```typescript
// CrossFieldValidation.tsx - Validate fields that depend on each other
export function useCrossFieldValidation(form: any) {
  const position = form.watch('position')
  const customPosition = form.watch('custom_position')
  const organizationId = form.watch('organization_id')
  const isPrimary = form.watch('is_primary_contact')

  // Validate custom position requirement
  useEffect(() => {
    if (position === 'Custom' && !customPosition?.trim()) {
      form.setError('custom_position', {
        type: 'required',
        message: 'Custom position is required when "Custom" is selected'
      })
    } else {
      form.clearErrors('custom_position')
    }
  }, [position, customPosition, form])

  // Validate primary contact uniqueness (would require API call)
  useEffect(() => {
    if (isPrimary && organizationId) {
      // In real implementation, check if organization already has a primary contact
      checkPrimaryContactConflict(organizationId).then(hasConflict => {
        if (hasConflict) {
          form.setError('is_primary_contact', {
            type: 'unique',
            message: 'This organization already has a primary contact'
          })
        } else {
          form.clearErrors('is_primary_contact')
        }
      })
    }
  }, [isPrimary, organizationId, form])

  // Business rule validation for decision authority and purchase influence
  useEffect(() => {
    const purchaseInfluence = form.getValues('purchase_influence')
    const decisionAuthority = form.getValues('decision_authority')

    // Business rule: Decision Makers should typically have High or Medium influence
    if (decisionAuthority === 'Decision Maker' && purchaseInfluence === 'Low') {
      // This is a warning, not an error
      form.setError('purchase_influence', {
        type: 'warning',
        message: 'Decision Makers typically have Medium or High purchase influence'
      })
    }
  }, [form.watch('purchase_influence'), form.watch('decision_authority'), form])
}
```

## Performance Optimization Patterns

### Memoization Strategies
```typescript
// FormOptimization.tsx - Performance optimization patterns
import { memo, useMemo, useCallback } from 'react'

// Memoized form field component
const MemoizedFormField = memo(({ 
  name, 
  label, 
  type = 'text',
  ...props 
}: any) => {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}, (prevProps, nextProps) => {
  // Custom comparison for optimization
  return (
    prevProps.name === nextProps.name &&
    prevProps.label === nextProps.label &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.value === nextProps.value
  )
})

// Optimized select component
const MemoizedSelectField = memo(({ 
  options, 
  value, 
  onChange, 
  ...props 
}: any) => {
  const sortedOptions = useMemo(() => 
    [...options].sort((a, b) => a.label.localeCompare(b.label)),
    [options]
  )

  return (
    <Select value={value} onValueChange={onChange} {...props}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortedOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

// Performance monitoring hook
export function useFormPerformance(formName: string) {
  const startRender = useCallback(() => {
    performance.mark(`${formName}-render-start`)
  }, [formName])

  const endRender = useCallback(() => {
    performance.mark(`${formName}-render-end`)
    performance.measure(
      `${formName}-render`,
      `${formName}-render-start`,
      `${formName}-render-end`
    )
  }, [formName])

  const measureSubmission = useCallback(() => {
    performance.mark(`${formName}-submit-start`)
    return () => {
      performance.mark(`${formName}-submit-end`)
      performance.measure(
        `${formName}-submit`,
        `${formName}-submit-start`,
        `${formName}-submit-end`
      )
    }
  }, [formName])

  return { startRender, endRender, measureSubmission }
}
```

### Lazy Loading and Code Splitting
```typescript
// LazyFormComponents.tsx - Code splitting for large forms
import { lazy, Suspense } from 'react'

// Lazy load heavy modal components
const OrganizationCreateModal = lazy(() => 
  import('./OrganizationCreateModal').then(module => ({
    default: module.OrganizationCreateModal
  }))
)

const ContactPreferencesModal = lazy(() =>
  import('./ContactPreferencesModal')
)

// Lazy load section components
const AdvancedContactFields = lazy(() =>
  import('./AdvancedContactFields')
)

// Component with lazy loading
export function ContactFormWithLazyComponents() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCreateOrg, setShowCreateOrg] = useState(false)

  return (
    <form>
      {/* Basic fields always loaded */}
      <BasicContactFields />

      {/* Lazy load advanced fields */}
      {showAdvanced && (
        <Suspense fallback={<FormFieldsSkeleton />}>
          <AdvancedContactFields />
        </Suspense>
      )}

      {/* Lazy load modals */}
      {showCreateOrg && (
        <Suspense fallback={<ModalSkeleton />}>
          <OrganizationCreateModal 
            onClose={() => setShowCreateOrg(false)}
          />
        </Suspense>
      )}
    </form>
  )
}

// Loading skeletons
function FormFieldsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-11 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
```

This documentation provides comprehensive patterns for implementing advanced form functionality in React with TypeScript and shadcn/ui components. Each pattern includes practical examples that can be directly applied to the Contact Form implementation.