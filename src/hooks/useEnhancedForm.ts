import React from 'react'
import { useForm, UseFormProps, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useCallback, useEffect, useRef } from 'react'
import { AnyObjectSchema } from 'yup'

interface UseEnhancedFormOptions<TFieldValues extends FieldValues> extends UseFormProps<TFieldValues> {
  schema: AnyObjectSchema
  onSubmit: (data: TFieldValues) => Promise<void>
  persistKey?: string // Key for localStorage persistence
  autoSave?: boolean // Auto-save form data to localStorage
  autoSaveDelay?: number // Delay in ms for auto-save debouncing
  onError?: (error: Error) => void
  onSuccess?: () => void
}

interface UseEnhancedFormReturn<TFieldValues extends FieldValues> extends UseFormReturn<TFieldValues> {
  // Enhanced submission handling
  isSubmitting: boolean
  submitError: string | null
  handleSubmit: (onValid: SubmitHandler<TFieldValues>) => (e?: React.BaseSyntheticEvent) => Promise<void>
  submitWithErrorHandling: () => Promise<void>
  
  // Form state management
  clearErrors: () => void
  resetForm: () => void
  isDirty: boolean
  hasUnsavedChanges: boolean
  
  // Persistence
  clearPersistedData: () => void
  hasPersisted: boolean
}

export function useEnhancedForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  onSubmit,
  persistKey,
  autoSave = false,
  autoSaveDelay = 1000,
  onError,
  onSuccess,
  ...formOptions
}: UseEnhancedFormOptions<TFieldValues>): UseEnhancedFormReturn<TFieldValues> {
  
  // Initialize form with yup resolver
  const form = useForm<TFieldValues>({
    ...formOptions,
    resolver: yupResolver(schema),
    defaultValues: formOptions.defaultValues
  })

  // Enhanced state management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasPersisted, setHasPersisted] = useState(false)
  const autoSaveTimeoutRef = useRef<number>()

  // Watch all form values for auto-save and dirty state tracking
  const watchedValues = form.watch()
  const { isDirty, dirtyFields } = form.formState
  const hasUnsavedChanges = isDirty && Object.keys(dirtyFields).length > 0

  // Persistence key for localStorage
  const storageKey = persistKey ? `form_data_${persistKey}` : null

  // Load persisted data on mount
  useEffect(() => {
    if (!storageKey) return

    try {
      const persistedData = localStorage.getItem(storageKey)
      if (persistedData) {
        const data = JSON.parse(persistedData)
        form.reset(data)
        setHasPersisted(true)
      }
    } catch (error) {
      console.warn('Failed to load persisted form data:', error)
    }
  }, [storageKey, form])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !storageKey || !isDirty) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(watchedValues))
        setHasPersisted(true)
      } catch (error) {
        console.warn('Failed to auto-save form data:', error)
      }
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [watchedValues, autoSave, storageKey, isDirty, autoSaveDelay])

  // Enhanced submission handler
  const submitWithErrorHandling = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const isValid = await form.trigger()
      if (!isValid) {
        const errors = form.formState.errors
        const firstError = Object.values(errors)[0]
        throw new Error(typeof firstError?.message === 'string' ? firstError.message : 'Please fix the form errors')
      }

      const data = form.getValues()
      await onSubmit(data)
      
      // Clear persisted data on successful submission
      if (storageKey) {
        localStorage.removeItem(storageKey)
        setHasPersisted(false)
      }
      
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setSubmitError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }, [form, onSubmit, onError, onSuccess, storageKey])

  // Enhanced form handlers
  const clearErrors = useCallback(() => {
    form.clearErrors()
    setSubmitError(null)
  }, [form])

  const resetForm = useCallback(() => {
    form.reset()
    setSubmitError(null)
    if (storageKey) {
      localStorage.removeItem(storageKey)
      setHasPersisted(false)
    }
  }, [form, storageKey])

  const clearPersistedData = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
      setHasPersisted(false)
    }
  }, [storageKey])

  // Enhanced handleSubmit that works with the existing pattern
  const enhancedHandleSubmit = useCallback(
    (onValid: SubmitHandler<TFieldValues>) => {
      return async (e?: React.BaseSyntheticEvent) => {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        
        setIsSubmitting(true)
        setSubmitError(null)

        try {
          await form.handleSubmit(onValid)(e)
          
          // Clear persisted data on successful submission
          if (storageKey) {
            localStorage.removeItem(storageKey)
            setHasPersisted(false)
          }
          
          onSuccess?.()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
          setSubmitError(errorMessage)
          onError?.(error instanceof Error ? error : new Error(errorMessage))
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [form, onError, onSuccess, storageKey]
  )

  return {
    ...form,
    isSubmitting,
    submitError,
    handleSubmit: enhancedHandleSubmit,
    submitWithErrorHandling,
    clearErrors,
    resetForm,
    isDirty,
    hasUnsavedChanges,
    clearPersistedData,
    hasPersisted
  }
}

// Hook for unsaved changes warning
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])
}