// New Shared Form Components (3-Tier System)
export { FormCard } from './FormCard'
export { FormInput, FormTextarea, FormSelect, FormSwitch, FormCheckbox } from './FormInput'
export { FormSubmitButton } from './FormSubmitButton'
export { SimpleForm } from './SimpleForm'
export { BusinessForm } from './BusinessForm'

// Legacy Core form components
export { 
  CoreFormLayout, 
  default as CoreFormLayoutDefault 
} from './CoreFormLayout'

export { 
  EntitySelect, 
  OrganizationSelect, 
  ContactSelect, 
  ProductSelect 
} from './EntitySelect'

export { 
  ProgressiveDetails,
  FormSectionDetails,
  OptionalFields,
  AdvancedOptions,
  ContactDetails,
  OrganizationDetails,
  AddressDetails
} from './ProgressiveDetails'

// Hook export
export { useProgressiveDetails } from '../../hooks/useProgressiveDetails'

// Type exports
export type {
  CoreFormLayoutProps,
  FormSection,
  FormFieldConfig,
  ConditionalSection,
  SelectOption
} from './CoreFormLayout'

export type { 
  EntityOption,
  EntitySelectProps,
  OrganizationSelectProps,
  ContactSelectProps,
  ProductSelectProps
} from './EntitySelect'

export type {
  ProgressiveDetailsProps,
  FormSectionDetailsProps,
  OptionalFieldsProps,
  AdvancedOptionsProps
} from './ProgressiveDetails'