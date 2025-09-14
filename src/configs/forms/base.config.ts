import type {
  CommonFieldConfigs,
  LayoutClasses,
  FormTheme,
  FieldConfig,
  SelectOption,
} from '@/types/forms'
import { validationMessages } from '@/lib/validation-messages'
import { placeholderUrls } from '@/config/urls'
import { semanticSpacing } from '@/styles/tokens'

// ===== Validation Messages =====
// Moved to @/lib/validation-messages.ts for better organization
export { validationMessages }

// ===== Layout Classes =====

export const sectionLayouts: LayoutClasses = {
  single: `grid grid-cols-1 ${semanticSpacing.gap.md}`,
  double: `grid grid-cols-1 md:grid-cols-2 ${semanticSpacing.gap.md}`,
  triple: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${semanticSpacing.gap.md}`,
  full: 'w-full',
}

// ===== Form Theme Configuration =====

export const formTheme: FormTheme = {
  spacing: {
    section: semanticSpacing.stack.xl,
    field: semanticSpacing.stack.lg,
    inner: semanticSpacing.gap.xs,
  },
  sizing: {
    input: 'h-12', // 48px touch target
    button: 'h-12', // 48px touch target
    select: 'min-h-[48px]', // 48px minimum touch target
  },
}

// ===== Common Field Configurations =====

export const commonFields: CommonFieldConfigs = {
  email: {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    description: 'Primary email address for communication',
  },

  phone: {
    name: 'phone',
    label: 'Phone',
    type: 'phone',
    placeholder: '(555) 123-4567',
    description: 'Primary phone number',
  },

  notes: {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any additional notes or comments...',
    rows: 3,
    className: 'md:col-span-2',
    description: 'Additional information or comments',
  },

  website: {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: placeholderUrls.website,
    description: 'Company or organization website',
  },

  address: {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: '123 Main St',
    rows: 2,
    description: 'Street address',
  },

  city: {
    name: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'City name',
  },

  state: {
    name: 'state',
    label: 'State',
    type: 'text',
    placeholder: 'State or Province',
  },

  zipCode: {
    name: 'zip_code',
    label: 'ZIP Code',
    type: 'text',
    placeholder: '12345',
  },
}

// ===== Common Select Options =====

export const commonSelectOptions = {
  // Priority levels for organizations and opportunities
  priority: [
    {
      value: 'A',
      label: 'A - High Priority',
      description: 'Strategic accounts with high revenue potential',
      icon: '🎯',
    },
    {
      value: 'B',
      label: 'B - Medium Priority',
      description: 'Important accounts with good growth potential',
      icon: '📈',
    },
    {
      value: 'C',
      label: 'C - Standard Priority',
      description: 'Regular accounts requiring standard service',
      icon: '📊',
    },
    {
      value: 'D',
      label: 'D - Low Priority',
      description: 'Cold prospects needing nurturing',
      icon: '❄️',
    },
  ] as SelectOption[],

  // Yes/No/Unknown options
  yesNoUnknown: [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'Unknown', label: 'Unknown' },
  ] as SelectOption[],

  // Common influence levels
  influenceLevels: [
    { value: 'High', label: 'High', description: 'Strong influence on decisions' },
    { value: 'Medium', label: 'Medium', description: 'Moderate influence' },
    { value: 'Low', label: 'Low', description: 'Limited influence' },
    { value: 'Unknown', label: 'Unknown', description: 'Influence level unclear' },
  ] as SelectOption[],

  // Contact decision authority levels
  decisionAuthority: [
    {
      value: 'Decision Maker',
      label: 'Decision Maker',
      description: 'Final authority on purchasing decisions',
    },
    {
      value: 'Influencer',
      label: 'Influencer',
      description: 'Influences purchasing decisions',
    },
    {
      value: 'End User',
      label: 'End User',
      description: 'Uses the product/service',
    },
    {
      value: 'Gatekeeper',
      label: 'Gatekeeper',
      description: 'Controls access to decision makers',
    },
  ] as SelectOption[],

  // Opportunity stages
  opportunityStages: [
    { value: 'Lead', label: 'Lead', description: 'Initial contact or inquiry' },
    { value: 'Qualified', label: 'Qualified', description: 'Opportunity has been qualified' },
    { value: 'Proposal', label: 'Proposal', description: 'Proposal submitted' },
    { value: 'Negotiation', label: 'Negotiation', description: 'In negotiation phase' },
    { value: 'Closed Won', label: 'Closed Won', description: 'Deal successfully closed' },
    {
      value: 'Closed Lost',
      label: 'Closed Lost',
      description: 'Deal lost to competitor or cancelled',
    },
  ] as SelectOption[],

  // Interaction types
  interactionTypes: [
    { value: 'Call', label: 'Phone Call', description: 'Telephone conversation' },
    { value: 'Email', label: 'Email', description: 'Email communication' },
    { value: 'Meeting', label: 'Meeting', description: 'In-person or virtual meeting' },
    { value: 'Demo', label: 'Demo', description: 'Product or service demonstration' },
    { value: 'Follow-up', label: 'Follow-up', description: 'Follow-up communication' },
    { value: 'Other', label: 'Other', description: 'Other type of interaction' },
  ] as SelectOption[],
}

// ===== Field Builders =====

export const fieldBuilders = {
  /**
   * Creates a select field with dynamic options
   */
  createSelectField: (
    name: string,
    label: string,
    options: SelectOption[],
    required = false,
    placeholder?: string
  ): FieldConfig => ({
    name,
    label,
    type: 'select',
    required,
    placeholder: placeholder || `Select ${label.toLowerCase()}`,
    options,
  }),

  /**
   * Creates a text field with common validation
   */
  createTextField: (
    name: string,
    label: string,
    required = false,
    placeholder?: string
  ): FieldConfig => ({
    name,
    label,
    type: 'text',
    required,
    placeholder: placeholder || `Enter ${label.toLowerCase()}`,
  }),

  /**
   * Creates a required field variant
   */
  makeRequired: (field: FieldConfig): FieldConfig => ({
    ...field,
    required: true,
  }),

  /**
   * Adds custom className to field
   */
  withClassName: (field: FieldConfig, className: string): FieldConfig => ({
    ...field,
    className,
  }),
}

// ===== Data Transformers =====

export const dataTransformers = {
  /**
   * Converts empty strings to null for database storage
   */
  cleanEmptyStrings: <T extends Record<string, string | number | boolean | null>>(data: T): T => {
    const result = { ...data }
    for (const [key, value] of Object.entries(result)) {
      if (value === '') {
        (result as T)[key as keyof T] = null as T[keyof T]
      }
    }
    return result
  },

  /**
   * Trims whitespace from all string fields
   */
  trimStrings: <T extends Record<string, string | number | boolean | null>>(data: T): T => {
    const result = { ...data }
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'string') {
        (result as T)[key as keyof T] = value.trim() as T[keyof T]
      }
    }
    return result
  },

  /**
   * Combines common data transformations
   */
  standardTransform: <T extends Record<string, string | number | boolean | null>>(data: T): T => {
    return dataTransformers.cleanEmptyStrings(dataTransformers.trimStrings(data))
  },
}
