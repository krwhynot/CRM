import { useMemo } from 'react'
import { useFormState, FieldErrors, FieldValues, Control } from 'react-hook-form'

interface UseFormValidationFeedbackOptions {
  requiredFields?: string[]
  warningValidations?: Record<string, (value: unknown) => string | null>
}

export const useFormValidationFeedback = <T extends FieldValues>(
  formControl: Control<T>,
  options: UseFormValidationFeedbackOptions = {}
) => {
  const { requiredFields = [], warningValidations = {} } = options
  
  const { errors, isValid, isDirty, isSubmitting, touchedFields } = useFormState({
    control: formControl
  })

  const validationState = useMemo(() => {
    const fieldErrors: Array<{
      field: string
      message: string
      type: 'error' | 'warning' | 'info'
    }> = []

    // Process form errors
    Object.entries(errors as FieldErrors).forEach(([field, error]) => {
      if (error?.message) {
        fieldErrors.push({
          field,
          message: error.message as string,
          type: 'error'
        })
      }
    })

    // Process warning validations
    Object.entries(warningValidations).forEach(([field, validator]) => {
      const fieldValue = formControl._formValues?.[field]
      const warning = validator(fieldValue)
      if (warning && touchedFields[field]) {
        fieldErrors.push({
          field,
          message: warning,
          type: 'warning'
        })
      }
    })

    // Calculate field statistics
    const totalFields = Object.keys(formControl._formValues || {}).length
    const touchedFieldsArray = Object.keys(touchedFields)
    const errorFieldsArray = Object.keys(errors)
    const validFields = touchedFieldsArray.filter(field => 
      !errorFieldsArray.includes(field)
    ).length

    return {
      errors: fieldErrors,
      isValid,
      isDirty,
      isSubmitting,
      hasErrors: fieldErrors.filter(e => e.type === 'error').length > 0,
      hasWarnings: fieldErrors.filter(e => e.type === 'warning').length > 0,
      totalFields,
      validFields,
      requiredFields: requiredFields.length,
      touchedFields: touchedFieldsArray.length
    }
  }, [errors, isValid, isDirty, isSubmitting, touchedFields, formControl._formValues, requiredFields, warningValidations])

  return validationState
}