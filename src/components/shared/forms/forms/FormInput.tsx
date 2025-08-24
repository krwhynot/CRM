// Re-export all form field components for backward compatibility
export {
  FormInputField as FormInput,
  FormTextareaField as FormTextarea,
  FormSelectField as FormSelect,
  FormSwitchField as FormSwitch,
  FormCheckboxField as FormCheckbox
} from './form-fields'

// All form field implementations have been moved to separate files in ./form-fields/
// This file now serves as a re-export for backward compatibility
