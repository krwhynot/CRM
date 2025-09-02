// Form Architecture: Modern Dialog + Form System
// Use StandardDialog -> FormCard -> FormField/SimpleForm/BusinessForm pattern

// Core Form Components
export { FormCard } from './FormCard'
export { FormFieldNew } from './FormField'
export { FormInput } from './FormInput'
export { FormSubmitButton } from './FormSubmitButton'

// Form Builders
export { SimpleForm, type SimpleFormField } from './SimpleForm'
export { BusinessForm, type FormSection, type BusinessFormField } from './BusinessForm'

// Specialized Components
export { EntitySelect } from './EntitySelect'
export {
  ProgressiveDetails,
  FormSectionDetails,
  OptionalFields,
  AdvancedOptions,
  ContactDetails,
  OrganizationDetails,
  AddressDetails,
} from './ProgressiveDetails'

// Validation & Enhancement Components
export { FormValidationFeedback } from './FormValidationFeedback'
export { EnhancedFormField } from './EnhancedFormField'

// Legacy Components (deprecated - use SimpleForm instead)
export { FormLayout } from './FormLayout'
export { CoreFormLayout } from './CoreFormLayout' // DEPRECATED: Shows migration notice

// Hooks
export { useProgressiveDetails } from '@/hooks/useProgressiveDetails'

// Type Exports
export type { EntityOption, EntitySelectProps } from './EntitySelect'
export type {
  ProgressiveDetailsProps,
  FormSectionDetailsProps,
  OptionalFieldsProps,
  AdvancedOptionsProps,
} from './ProgressiveDetails'
export type { InputConfig, SelectOption } from './FormInput'
