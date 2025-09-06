// Form Architecture: Modern Dialog + Form System
// Use StandardDialog -> SimpleForm pattern

// Core Form Components  
export { FormFieldNew } from './FormField'
export { FormInput } from './FormInput'
export { FormSubmitButton } from './FormSubmitButton'

// Form Builders
export { SimpleForm, type SimpleFormField } from './SimpleForm'

// Specialized Components
export { EntitySelect } from './EntitySelect'
export { ProgressiveDetails } from './ProgressiveDetails'

// All legacy form components have been successfully migrated

// Hooks
export { useProgressiveDetails } from '@/hooks/useProgressiveDetails'

// Type Exports
export type { EntityOption, EntitySelectProps } from './EntitySelect'
export type { ProgressiveDetailsProps } from './ProgressiveDetails'
export type { InputConfig, SelectOption } from './FormInput'
