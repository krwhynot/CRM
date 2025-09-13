/**
 * Generic Entity Form Hook
 *
 * Provides comprehensive form state management for any entity type.
 * Handles validation, dirty state tracking, and form submission with error handling.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { FormEvent } from 'react'
import { z } from 'zod'
import type { BaseEntity, BaseInsert, FormState, FormActions, UseEntityFormReturn } from './types'

export interface EntityFormConfig<T extends BaseEntity, TInsert = BaseInsert<T>> {
  initialData?: Partial<T>
  validationSchema?: z.ZodSchema<TInsert>
  onSubmit?: (data: TInsert) => Promise<void>
  onValidation?: (data: Partial<T>) => Record<string, string>
  onFieldChange?: (field: keyof T, value: any, formData: Partial<T>) => void
  autoSave?: boolean
  autoSaveDelay?: number
  resetOnSubmit?: boolean
}

/**
 * Generic form hook for entity management with validation and state tracking
 */
export function useEntityForm<T extends BaseEntity, TInsert = BaseInsert<T>>(
  config: EntityFormConfig<T, TInsert>
): UseEntityFormReturn<T, TInsert> {
  // Form data state
  const [data, setData] = useState<Partial<T>>(config.initialData || {})
  const [originalData] = useState<Partial<T>>(config.initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save timeout
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Calculate derived state
  const formState: FormState<T> = useMemo(() => {
    const isDirty = !isEqual(data, originalData)
    const isValid = Object.keys(errors).length === 0

    return {
      data,
      originalData,
      isDirty,
      isValid,
      errors,
      touchedFields,
    }
  }, [data, originalData, errors, touchedFields])

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Use Zod schema if provided
    if (config.validationSchema) {
      try {
        config.validationSchema.parse(data as TInsert)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path.length > 0) {
              newErrors[err.path[0] as string] = err.message
            }
          })
        }
      }
    }

    // Use custom validation if provided
    if (config.onValidation) {
      const customErrors = config.onValidation(data)
      Object.assign(newErrors, customErrors)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [data, config.validationSchema, config.onValidation])

  // Update single field
  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => {
        const newData = { ...prev, [field]: value }

        // Trigger field change callback
        config.onFieldChange?.(field, value, newData)

        return newData
      })

      // Mark field as touched
      setTouchedFields((prev) => new Set(prev).add(field as string))

      // Clear field error if it exists
      if (errors[field as string]) {
        setErrors((prev) => {
          const { [field as string]: removed, ...rest } = prev
          return rest
        })
      }

      // Setup auto-save
      if (config.autoSave && config.onSubmit) {
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }

        const timeout = setTimeout(() => {
          if (validateForm()) {
            config.onSubmit?.(data as TInsert).catch(() => {
              // Handle auto-save errors silently
            })
          }
        }, config.autoSaveDelay || 2000)

        setAutoSaveTimeout(timeout)
      }
    },
    [data, errors, config, validateForm, autoSaveTimeout]
  )

  // Update multiple fields
  const updateFields = useCallback(
    (fields: Partial<T>) => {
      setData((prev) => {
        const newData = { ...prev, ...fields }

        // Trigger field change callbacks
        Object.entries(fields).forEach(([field, value]) => {
          config.onFieldChange?.(field as keyof T, value, newData)
        })

        return newData
      })

      // Mark all updated fields as touched
      setTouchedFields((prev) => {
        const newTouched = new Set(prev)
        Object.keys(fields).forEach((field) => newTouched.add(field))
        return newTouched
      })

      // Clear errors for updated fields
      const updatedFields = Object.keys(fields)
      if (updatedFields.some((field) => errors[field])) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          updatedFields.forEach((field) => delete newErrors[field])
          return newErrors
        })
      }
    },
    [errors, config]
  )

  // Reset form to original state
  const resetForm = useCallback(() => {
    setData(originalData)
    setErrors({})
    setTouchedFields(new Set())

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
      setAutoSaveTimeout(null)
    }
  }, [originalData, autoSaveTimeout])

  // Set errors manually
  const setErrorsManually = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors)
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Mark field as touched
  const markFieldTouched = useCallback((field: keyof T) => {
    setTouchedFields((prev) => new Set(prev).add(field as string))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (data: TInsert) => Promise<void>) => async (e?: FormEvent) => {
      e?.preventDefault()

      setIsSubmitting(true)

      try {
        // Validate form
        if (!validateForm()) {
          // Mark all fields as touched to show validation errors
          const allFields = Object.keys(data)
          setTouchedFields(new Set(allFields))
          return
        }

        // Submit the form
        await onSubmit(data as TInsert)

        // Reset form if configured to do so
        if (config.resetOnSubmit) {
          resetForm()
        }
      } catch (error) {
        // Handle submission error
        if (error instanceof Error) {
          setErrors({ submit: error.message })
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [data, validateForm, config.resetOnSubmit, resetForm]
  )

  // Form actions object
  const formActions: FormActions<T> = {
    updateField,
    updateFields,
    resetForm,
    setErrors: setErrorsManually,
    clearErrors,
    validateForm,
    markFieldTouched,
  }

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [autoSaveTimeout])

  return {
    formState,
    formActions,
    handleSubmit,
    reset: resetForm,
    isSubmitting,
  }
}

/**
 * Advanced form hook with step management for multi-step forms
 */
export function useMultiStepEntityForm<T extends BaseEntity, TInsert = BaseInsert<T>>(
  config: EntityFormConfig<T, TInsert> & {
    steps: Array<{
      id: string
      name: string
      fields: (keyof T)[]
      validate?: (data: Partial<T>) => Record<string, string>
    }>
  }
) {
  const baseForm = useEntityForm(config)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const step = config.steps[currentStep]
    if (!step) return true

    const stepErrors: Record<string, string> = {}

    // Use step-specific validation if available
    if (step.validate) {
      const errors = step.validate(baseForm.formState.data)
      Object.assign(stepErrors, errors)
    }

    // Use global validation for step fields
    if (config.validationSchema) {
      try {
        // Create partial schema for current step fields
        const stepData = Object.fromEntries(
          step.fields.map((field) => [field, baseForm.formState.data[field]])
        )
        config.validationSchema.partial().parse(stepData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path.length > 0 && step.fields.includes(err.path[0] as keyof T)) {
              stepErrors[err.path[0] as string] = err.message
            }
          })
        }
      }
    }

    baseForm.formActions.setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }, [currentStep, config.steps, config.validationSchema, baseForm])

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep))
      setCurrentStep((prev) => Math.min(prev + 1, config.steps.length - 1))
    }
  }, [validateCurrentStep, currentStep, config.steps.length])

  // Navigate to previous step
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  // Go to specific step
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < config.steps.length) {
        setCurrentStep(stepIndex)
      }
    },
    [config.steps.length]
  )

  // Check if we can proceed to next step
  const canProceed = useMemo(() => {
    return currentStep < config.steps.length - 1 && validateCurrentStep()
  }, [currentStep, config.steps.length, validateCurrentStep])

  // Check if form is complete
  const isComplete = useMemo(() => {
    return (
      completedSteps.size === config.steps.length - 1 && currentStep === config.steps.length - 1
    )
  }, [completedSteps.size, config.steps.length, currentStep])

  return {
    ...baseForm,
    currentStep,
    currentStepData: config.steps[currentStep],
    completedSteps,
    canProceed,
    isComplete,
    nextStep,
    previousStep,
    goToStep,
    validateCurrentStep,
  }
}

/**
 * Utility function to compare two objects for equality (shallow)
 */
function isEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  return keys1.every((key) => obj1[key] === obj2[key])
}
