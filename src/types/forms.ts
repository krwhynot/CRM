import type { LucideIcon } from 'lucide-react'
import type { FieldValues, SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

// ===== Base Form Types =====

export interface FormData extends FieldValues {}

// ===== Form Configuration Types =====

export interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: string
}

export interface FieldConfig {
  name: string
  label: string
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'textarea'
    | 'select'
    | 'switch'
    | 'date'
    | 'phone'
    | 'url'
    | 'radio'
  placeholder?: string
  description?: string
  tooltip?: string
  required?: boolean
  disabled?: boolean
  className?: string
  options?: SelectOption[]
  rows?: number // For textarea
  switchLabel?: string // For switch fields
  min?: number // For number fields
  max?: number // For number fields
  step?: number // For number fields
}

export interface FormSection {
  id: string
  title?: string
  description?: string
  className?: string
  fields: FieldConfig[]
}

export interface ConditionalSection<T extends FieldValues = FieldValues> extends FormSection {
  condition: string | ((data: T) => boolean)
  showWhen?: 'truthy' | 'falsy'
  isCollapsible?: boolean
}

export interface OptionalSection {
  title: string
  description?: string
  fields: FieldConfig[]
}

// ===== Main Form Configuration Interface =====

export interface FormConfig<T extends FormData> {
  // Form metadata
  title: string
  icon: LucideIcon
  submitLabel?: string

  // Form schema and validation
  schema: z.ZodType<T>

  // Form structure
  sections: FormSection[]
  optionalSection?: OptionalSection
  conditionalSections?: ConditionalSection[]

  // Data handling
  defaultValues: (initialData?: Partial<T>) => T
  transformData?: (data: T) => T
}

// ===== Form Component Props =====

export interface FormLayoutProps<T extends FormData> {
  config: FormConfig<T>
  onSubmit: SubmitHandler<T>
  initialData?: Partial<T>
  loading?: boolean
}

// ===== Base Form Props for Entity Components =====

export interface BaseFormProps<T extends FormData> {
  onSubmit: SubmitHandler<T>
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string
}

export interface FormPropsWithPreselection<T extends FormData> extends BaseFormProps<T> {
  preselectedOrganization?: string
}

// ===== Validation Message Types =====
// Moved to @/lib/validation-messages.ts for better organization

// ===== Layout and Styling Types =====

export interface LayoutClasses {
  single: string
  double: string
  triple: string
  full: string
}

export interface FormTheme {
  spacing: {
    section: string
    field: string
    inner: string
  }
  sizing: {
    input: string
    button: string
    select: string
  }
}

// ===== Form State and UI Types =====

export interface FormUIState {
  showOptionalSections: boolean
  isSubmitting: boolean
  hasErrors: boolean
  isDirty: boolean
}

// ===== Common Field Configurations =====

export interface CommonFieldConfigs {
  email: FieldConfig
  phone: FieldConfig
  notes: FieldConfig
  website: FieldConfig
  address: FieldConfig
  city: FieldConfig
  state: FieldConfig
  zipCode: FieldConfig
}
