// Form Architecture: Modern Dialog + Form System
// Use StandardDialog -> SimpleForm pattern

// Core Form Components
export { FormFieldNew } from './FormField'
export { FormInput } from './FormInput'
export { FormSubmitButton } from './FormSubmitButton'
export { FormCard } from './FormCard'
export { FormValidationFeedback } from './FormValidationFeedback'

// Form Builders
export { SimpleForm, type SimpleFormField } from './SimpleForm'
export { useFormProgress } from './hooks/useFormProgress'

// Specialized Components
export { EntitySelect } from './EntitySelect'
export { ProgressiveDetails } from './ProgressiveDetails'

// Generated Form Components
// NOTE: Generated form components have been removed as they are superseded by SimpleForm pattern

// Form Building Utilities
export {
  createTextField,
  createEmailField,
  createSelectField,
  createTextareaField,
  createNumberField,
  createDateField,
  createSwitchField,
} from './form-field-builders'

// Entity Select Sub-components
export { EntitySelectLoadingState } from './entity-select/EntitySelectLoadingState'
export { EntitySelectSearchBox } from './entity-select/EntitySelectSearchBox'
export { EntitySelectOptionsList } from './entity-select/EntitySelectOptionsList'

// Hooks
export { useProgressiveDetails } from '@/hooks/useProgressiveDetails'

// Type Exports
export type { EntityOption, EntitySelectProps } from './EntitySelect'
export type { ProgressiveDetailsProps } from './ProgressiveDetails'
export type { InputConfig, SelectOption } from './FormInput'
